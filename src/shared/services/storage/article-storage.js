/**
 * 文章存储服务
 * 负责EditorJS数据的存储、读取和管理
 */

import { createStorage, StorageType } from "./browser-storage.js";
import { articleSerializer } from "./article-serializer.js";
import { createLogger } from "../../../shared/services/logger.js";

// 创建模块日志器
const logger = createLogger('ArticleStorageService');

/**
 * 文章状态枚举
 */
export const ArticleStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

/**
 * 排序方式枚举
 */
export const SortOrder = {
  CREATED_ASC: 'createdAt_asc',
  CREATED_DESC: 'createdAt_desc',
  UPDATED_ASC: 'updatedAt_asc',
  UPDATED_DESC: 'updatedAt_desc',
  TITLE_ASC: 'title_asc',
  TITLE_DESC: 'title_desc'
};

/**
 * 文章存储服务类
 */
export class ArticleStorageService {
  /**
   * 构造函数
   */
  constructor() {
    this.storage = createStorage(StorageType.CHROME, 'flowedit');
    this.articlesKey = 'articles';
    this.draftsKey = 'drafts';
    this.indexKey = 'articles_index';
    this.configKey = 'storage_config';
    this.maxArticles = 100; // 最大文章数量
    this.maxDrafts = 20; // 最大草稿数量
    this.isInitialized = false;
  }

  /**
   * 初始化存储服务
   * @returns {Promise<boolean>} 是否初始化成功
   */
  async initialize() {
    try {
      // 检查存储可用性
      const isAvailable = await this._checkStorageAvailability();
      if (!isAvailable) {
        throw new Error('存储服务不可用');
      }

      // 初始化配置
      await this._initializeConfig();

      // 初始化索引
      await this._initializeIndex();

      this.isInitialized = true;
      logger.info('文章存储服务初始化成功');
      return true;
    } catch (error) {
      logger.error('文章存储服务初始化失败:', error);
      return false;
    }
  }

  /**
   * 保存文章
   * @param {Object} editorData - EditorJS 数据
   * @param {Object} metadata - 文章元数据
   * @returns {Promise<Object>} 保存结果
   */
  async saveArticle(editorData, metadata = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // 序列化数据
      const articleData = articleSerializer.serialize(editorData, metadata);
      
      // 检查存储限制
      await this._checkStorageLimit();

      // 保存文章
      const success = await this.storage.set(`${this.articlesKey}_${articleData.id}`, articleData);
      
      if (success) {
        // 更新索引
        await this._updateIndex(articleData.id, {
          id: articleData.id,
          title: articleData.title,
          summary: articleData.summary,
          status: articleData.metadata.status,
          createdAt: articleData.metadata.createdAt,
          updatedAt: articleData.metadata.updatedAt,
          wordCount: articleData.metadata.wordCount,
          tags: articleData.metadata.tags
        });

        logger.info(`文章已保存: ${articleData.title} (${articleData.id})`);
        return {
          success: true,
          articleId: articleData.id,
          article: articleData
        };
      } else {
        throw new Error('存储文章失败');
      }
    } catch (error) {
      logger.error('保存文章失败:', error);
      
      // 检查是否是存储空间不足
      if (error.name === 'QuotaExceededError' || error.message?.includes('QUOTA')) {
        return {
          success: false,
          error: 'QUOTA_EXCEEDED',
          message: '存储空间不足，请清理部分旧文章后重试'
        };
      }
      
      return {
        success: false,
        error: 'SAVE_FAILED',
        message: error.message || '保存文章失败'
      };
    }
  }

  /**
   * 获取文章
   * @param {string} articleId - 文章ID
   * @returns {Promise<Object|null>} 文章数据
   */
  async getArticle(articleId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const articleData = await this.storage.get(`${this.articlesKey}_${articleId}`);
      
      if (articleData) {
        return articleData;
      } else {
        logger.warn(`文章不存在: ${articleId}`);
        return null;
      }
    } catch (error) {
      logger.error('获取文章失败:', error);
      return null;
    }
  }

  /**
   * 获取文章的EditorJS数据
   * @param {string} articleId - 文章ID
   * @returns {Promise<Object|null>} EditorJS数据
   */
  async getArticleEditorData(articleId) {
    try {
      const articleData = await this.getArticle(articleId);
      if (articleData) {
        return articleSerializer.deserialize(articleData);
      }
      return null;
    } catch (error) {
      logger.error('获取文章EditorJS数据失败:', error);
      return null;
    }
  }

  /**
   * 获取所有文章列表
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 文章列表
   */
  async getAllArticles(options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const {
        status = null,
        sortOrder = SortOrder.UPDATED_DESC,
        limit = null,
        offset = 0,
        tags = null,
        keyword = null
      } = options;

      // 获取索引
      const index = await this._getIndex();
      let articles = Object.values(index);

      // 过滤状态
      if (status) {
        articles = articles.filter(article => article.status === status);
      }

      // 过滤标签
      if (tags && tags.length > 0) {
        articles = articles.filter(article => 
          article.tags && article.tags.some(tag => tags.includes(tag))
        );
      }

      // 关键词搜索
      if (keyword) {
        const searchTerm = keyword.toLowerCase();
        articles = articles.filter(article => 
          article.title.toLowerCase().includes(searchTerm) ||
          article.summary.toLowerCase().includes(searchTerm)
        );
      }

      // 排序
      articles = this._sortArticles(articles, sortOrder);

      // 分页
      if (limit) {
        articles = articles.slice(offset, offset + limit);
      }

      return articles;
    } catch (error) {
      logger.error('获取文章列表失败:', error);
      return [];
    }
  }

  /**
   * 删除文章
   * @param {string} articleId - 文章ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteArticle(articleId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // 删除文章数据
      const success = await this.storage.remove(`${this.articlesKey}_${articleId}`);
      
      if (success) {
        // 从索引中移除
        await this._removeFromIndex(articleId);
        logger.info(`文章已删除: ${articleId}`);
        return true;
      } else {
        throw new Error('删除文章失败');
      }
    } catch (error) {
      logger.error('删除文章失败:', error);
      return false;
    }
  }

  /**
   * 更新文章
   * @param {string} articleId - 文章ID
   * @param {Object} editorData - EditorJS数据
   * @param {Object} metadata - 元数据更新
   * @returns {Promise<Object>} 更新结果
   */
  async updateArticle(articleId, editorData, metadata = {}) {
    try {
      // 获取现有文章
      const existingArticle = await this.getArticle(articleId);
      if (!existingArticle) {
        throw new Error('文章不存在');
      }

      // 合并元数据
      const updatedMetadata = {
        ...existingArticle.metadata,
        ...metadata,
        id: articleId,
        createdAt: existingArticle.metadata.createdAt // 保持原创建时间
      };

      // 保存更新后的文章
      return await this.saveArticle(editorData, updatedMetadata);
    } catch (error) {
      logger.error('更新文章失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 保存草稿
   * @param {Object} editorData - EditorJS数据
   * @param {Object} metadata - 元数据
   * @returns {Promise<Object>} 保存结果
   */
  async saveDraft(editorData, metadata = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // 设置为草稿状态
      metadata.status = ArticleStatus.DRAFT;
      
      // 序列化数据
      const draftData = articleSerializer.serialize(editorData, metadata);
      
      // 获取现有草稿
      const existingDrafts = await this.getDrafts();
      
      // 检查草稿数量限制
      if (existingDrafts.length >= this.maxDrafts) {
        // 删除最旧的草稿
        const oldestDraft = existingDrafts[existingDrafts.length - 1];
        await this.storage.remove(`${this.draftsKey}_${oldestDraft.id}`);
      }

      // 保存草稿
      const success = await this.storage.set(`${this.draftsKey}_${draftData.id}`, draftData);
      
      if (success) {
        logger.info(`草稿已保存: ${draftData.title} (${draftData.id})`);
        return {
          success: true,
          draftId: draftData.id,
          draft: draftData
        };
      } else {
        throw new Error('存储草稿失败');
      }
    } catch (error) {
      logger.error('保存草稿失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取所有草稿
   * @returns {Promise<Array>} 草稿列表
   */
  async getDrafts() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const keys = await this.storage.getAllKeys();
      const draftKeys = keys.filter(key => key.startsWith(this.draftsKey));
      
      const drafts = [];
      for (const key of draftKeys) {
        const draft = await this.storage.get(key);
        if (draft) {
          drafts.push(draft);
        }
      }

      // 按更新时间排序
      return drafts.sort((a, b) => 
        new Date(b.metadata.updatedAt) - new Date(a.metadata.updatedAt)
      );
    } catch (error) {
      logger.error('获取草稿列表失败:', error);
      return [];
    }
  }

  /**
   * 删除草稿
   * @param {string} draftId - 草稿ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteDraft(draftId) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const success = await this.storage.remove(`${this.draftsKey}_${draftId}`);
      
      if (success) {
        logger.info(`草稿已删除: ${draftId}`);
        return true;
      } else {
        throw new Error('删除草稿失败');
      }
    } catch (error) {
      logger.error('删除草稿失败:', error);
      return false;
    }
  }

  /**
   * 获取存储统计信息
   * @returns {Promise<Object>} 统计信息
   */
  async getStorageStats() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const articles = await this.getAllArticles();
      const drafts = await this.getDrafts();
      const usage = await this.storage.getUsage();

      return {
        articlesCount: articles.length,
        draftsCount: drafts.length,
        totalWordCount: articles.reduce((sum, article) => sum + (article.wordCount || 0), 0),
        storageUsage: usage,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('获取存储统计信息失败:', error);
      return {
        articlesCount: 0,
        draftsCount: 0,
        totalWordCount: 0,
        storageUsage: { bytesInUse: 0, quota: 0, usage: 0, available: 0 },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * 清理过期数据
   * @returns {Promise<boolean>} 是否清理成功
   */
  async cleanup() {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      let cleanupCount = 0;

      // 清理草稿（保留最近的N个）
      const drafts = await this.getDrafts();
      if (drafts.length > this.maxDrafts) {
        const toDelete = drafts.slice(this.maxDrafts);
        for (const draft of toDelete) {
          await this.deleteDraft(draft.id);
          cleanupCount++;
        }
      }

      // 清理文章（如果超过限制）
      const articles = await this.getAllArticles();
      if (articles.length > this.maxArticles) {
        const toDelete = articles.slice(this.maxArticles);
        for (const article of toDelete) {
          await this.deleteArticle(article.id);
          cleanupCount++;
        }
      }

      logger.info(`数据清理完成，清理了 ${cleanupCount} 个项目`);
      return true;
    } catch (error) {
      logger.error('数据清理失败:', error);
      return false;
    }
  }

  // 私有方法

  /**
   * 检查存储可用性
   */
  async _checkStorageAvailability() {
    try {
      await this.storage.set('_test', 'test');
      await this.storage.remove('_test');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 初始化配置
   */
  async _initializeConfig() {
    const config = await this.storage.get(this.configKey);
    if (!config) {
      await this.storage.set(this.configKey, {
        version: '1.0.0',
        maxArticles: this.maxArticles,
        maxDrafts: this.maxDrafts,
        createdAt: new Date().toISOString()
      });
    }
  }

  /**
   * 初始化索引
   */
  async _initializeIndex() {
    const index = await this.storage.get(this.indexKey);
    if (!index) {
      await this.storage.set(this.indexKey, {});
    }
  }

  /**
   * 获取索引
   */
  async _getIndex() {
    return await this.storage.get(this.indexKey) || {};
  }

  /**
   * 更新索引
   */
  async _updateIndex(articleId, indexData) {
    const index = await this._getIndex();
    index[articleId] = indexData;
    await this.storage.set(this.indexKey, index);
  }

  /**
   * 从索引中移除
   */
  async _removeFromIndex(articleId) {
    const index = await this._getIndex();
    delete index[articleId];
    await this.storage.set(this.indexKey, index);
  }

  /**
   * 检查存储限制
   */
  async _checkStorageLimit() {
    const usage = await this.storage.getUsage();
    if (usage.usage > 0.9) { // 使用量超过90%
      logger.warn('存储使用量过高，建议清理数据');
      await this.cleanup();
    }
  }

  /**
   * 排序文章
   */
  _sortArticles(articles, sortOrder) {
    return articles.sort((a, b) => {
      switch (sortOrder) {
        case SortOrder.CREATED_ASC:
          return new Date(a.createdAt) - new Date(b.createdAt);
        case SortOrder.CREATED_DESC:
          return new Date(b.createdAt) - new Date(a.createdAt);
        case SortOrder.UPDATED_ASC:
          return new Date(a.updatedAt) - new Date(b.updatedAt);
        case SortOrder.UPDATED_DESC:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case SortOrder.TITLE_ASC:
          return a.title.localeCompare(b.title);
        case SortOrder.TITLE_DESC:
          return b.title.localeCompare(a.title);
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });
  }
}

/**
 * 默认文章存储服务实例
 */
export const articleStorageService = new ArticleStorageService();