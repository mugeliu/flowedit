/**
 * EditorJS 数据序列化和反序列化工具
 * 负责处理 EditorJS 数据的存储格式转换
 */

import { createLogger } from '../../services/simple-logger.js';

// 创建模块日志器
const logger = createLogger('ArticleSerializer');

/**
 * 文章元数据接口
 */
export const ArticleMetadata = {
  id: '',
  title: '',
  summary: '',
  createdAt: '',
  updatedAt: '',
  tags: [],
  status: 'draft', // draft, published, archived
  wordCount: 0,
  version: '1.0.0'
};

/**
 * EditorJS 数据序列化器
 */
export class ArticleSerializer {
  /**
   * 构造函数
   */
  constructor() {
    this.version = '1.0.0';
    this.maxTitleLength = 100;
    this.maxSummaryLength = 200;
  }

  /**
   * 序列化 EditorJS 数据为存储格式
   * @param {Object} editorData - EditorJS 数据
   * @param {Object} metadata - 文章元数据
   * @returns {Object} 序列化后的数据
   */
  serialize(editorData, metadata = {}) {
    try {
      // 生成文章ID（如果没有提供）
      const articleId = metadata.id || this._generateId();
      
      // 提取文章标题（从第一个段落或标题块）
      const title = metadata.title || this._extractTitle(editorData);
      
      // 提取文章摘要
      const summary = metadata.summary || this._extractSummary(editorData);
      
      // 计算字数
      const wordCount = this._calculateWordCount(editorData);
      
      // 提取标签
      const tags = metadata.tags || this._extractTags(editorData);
      
      // 创建时间戳
      const now = new Date().toISOString();
      
      // 构建完整的文章数据
      const articleData = {
        id: articleId,
        title: title,
        summary: summary,
        content: editorData,
        metadata: {
          createdAt: metadata.createdAt || now,
          updatedAt: now,
          status: metadata.status || 'draft',
          tags: tags,
          wordCount: wordCount,
          version: this.version,
          editorVersion: editorData.version || '2.0.0'
        },
        // 存储原始数据用于调试
        raw: {
          blocks: editorData.blocks || [],
          time: editorData.time || Date.now()
        }
      };
      
      return articleData;
    } catch (error) {
      logger.error('序列化EditorJS数据失败:', error);
      throw new Error('文章数据序列化失败');
    }
  }

  /**
   * 反序列化存储数据为 EditorJS 格式
   * @param {Object} articleData - 存储的文章数据
   * @returns {Object} EditorJS 格式的数据
   */
  deserialize(articleData) {
    try {
      if (!articleData || !articleData.content) {
        throw new Error('无效的文章数据');
      }
      
      // 验证数据格式
      if (!this._validateArticleData(articleData)) {
        throw new Error('文章数据格式不正确');
      }
      
      // 返回EditorJS格式的数据
      return {
        blocks: articleData.content.blocks || articleData.raw?.blocks || [],
        time: articleData.content.time || articleData.raw?.time || Date.now(),
        version: articleData.metadata?.editorVersion || '2.0.0'
      };
    } catch (error) {
      logger.error('反序列化文章数据失败:', error);
      throw new Error('文章数据反序列化失败');
    }
  }

  /**
   * 生成唯一ID
   * @returns {string} 唯一ID
   */
  _generateId() {
    return `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 从 EditorJS 数据中提取标题
   * @param {Object} editorData - EditorJS 数据
   * @returns {string} 标题
   */
  _extractTitle(editorData) {
    if (!editorData.blocks || editorData.blocks.length === 0) {
      return '未命名文章';
    }
    
    // 查找第一个 header 或 paragraph 块
    const titleBlock = editorData.blocks.find(block => 
      ['header', 'paragraph'].includes(block.type) && 
      block.data?.text?.trim()
    );
    
    if (titleBlock) {
      // 移除HTML标签并截断
      const title = this._stripHtmlTags(titleBlock.data.text);
      return title.length > this.maxTitleLength 
        ? title.substring(0, this.maxTitleLength) + '...'
        : title;
    }
    
    return '未命名文章';
  }

  /**
   * 从 EditorJS 数据中提取摘要
   * @param {Object} editorData - EditorJS 数据
   * @returns {string} 摘要
   */
  _extractSummary(editorData) {
    if (!editorData.blocks || editorData.blocks.length === 0) {
      return '';
    }
    
    // 收集所有文本块的内容
    const textBlocks = editorData.blocks.filter(block => 
      ['paragraph', 'header', 'quote'].includes(block.type) && 
      block.data?.text?.trim()
    );
    
    if (textBlocks.length === 0) {
      return '';
    }
    
    // 合并文本内容
    const allText = textBlocks
      .map(block => this._stripHtmlTags(block.data.text))
      .join(' ')
      .trim();
    
    // 截断摘要
    return allText.length > this.maxSummaryLength 
      ? allText.substring(0, this.maxSummaryLength) + '...'
      : allText;
  }

  /**
   * 计算字数
   * @param {Object} editorData - EditorJS 数据
   * @returns {number} 字数
   */
  _calculateWordCount(editorData) {
    if (!editorData.blocks || editorData.blocks.length === 0) {
      return 0;
    }
    
    const textBlocks = editorData.blocks.filter(block => 
      ['paragraph', 'header', 'quote', 'list'].includes(block.type)
    );
    
    let totalWords = 0;
    
    textBlocks.forEach(block => {
      if (block.data?.text) {
        const text = this._stripHtmlTags(block.data.text);
        // 中文字符按字符数计算，英文按单词数计算
        totalWords += this._countWords(text);
      } else if (block.data?.items) {
        // 处理列表项
        block.data.items.forEach(item => {
          // 支持字符串和对象格式的列表项
          let text = '';
          if (typeof item === 'string') {
            text = item;
          } else if (item && typeof item === 'object') {
            // 对象格式的列表项，获取content或text字段
            text = item.content || item.text || '';
          }
          
          if (text) {
            const cleanText = this._stripHtmlTags(text);
            totalWords += this._countWords(cleanText);
          }
        });
      }
    });
    
    return totalWords;
  }

  /**
   * 提取标签
   * @param {Object} editorData - EditorJS 数据
   * @returns {string[]} 标签数组
   */
  _extractTags(editorData) {
    // 这里可以实现标签提取逻辑
    // 例如从特定的标签块或者通过关键词分析
    return [];
  }

  /**
   * 移除HTML标签
   * @param {string} html - HTML字符串
   * @returns {string} 纯文本
   */
  _stripHtmlTags(html) {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * 计算文本字数
   * @param {string} text - 文本
   * @returns {number} 字数
   */
  _countWords(text) {
    if (!text) return 0;
    
    // 移除多余空格
    text = text.trim().replace(/\s+/g, ' ');
    
    // 中文字符数
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    
    // 英文单词数
    const englishWords = text.replace(/[\u4e00-\u9fff]/g, '').trim();
    const englishWordCount = englishWords ? englishWords.split(/\s+/).length : 0;
    
    return chineseChars + englishWordCount;
  }

  /**
   * 验证文章数据
   * @param {Object} articleData - 文章数据
   * @returns {boolean} 是否有效
   */
  _validateArticleData(articleData) {
    if (!articleData || typeof articleData !== 'object') {
      return false;
    }
    
    // 检查必需字段
    const requiredFields = ['id', 'title', 'content'];
    for (const field of requiredFields) {
      if (!articleData[field]) {
        return false;
      }
    }
    
    // 检查content格式
    if (!articleData.content.blocks || !Array.isArray(articleData.content.blocks)) {
      return false;
    }
    
    return true;
  }

  /**
   * 创建空的文章数据
   * @returns {Object} 空文章数据
   */
  createEmptyArticle() {
    return this.serialize({
      blocks: [],
      time: Date.now(),
      version: '2.0.0'
    }, {
      title: '新建文章',
      status: 'draft'
    });
  }

  /**
   * 克隆文章数据
   * @param {Object} articleData - 源文章数据
   * @param {Object} overrides - 覆盖的字段
   * @returns {Object} 克隆的文章数据
   */
  cloneArticle(articleData, overrides = {}) {
    try {
      const cloned = JSON.parse(JSON.stringify(articleData));
      
      // 生成新ID
      cloned.id = this._generateId();
      
      // 更新时间
      cloned.metadata.createdAt = new Date().toISOString();
      cloned.metadata.updatedAt = new Date().toISOString();
      
      // 应用覆盖字段
      Object.assign(cloned, overrides);
      
      return cloned;
    } catch (error) {
      logger.error('克隆文章数据失败:', error);
      throw new Error('文章数据克隆失败');
    }
  }
}

/**
 * 默认序列化器实例
 */
export const articleSerializer = new ArticleSerializer();