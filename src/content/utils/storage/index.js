/**
 * 存储工具入口文件
 * 导出所有存储相关的工具和服务
 */

// 基础存储
export { 
  BrowserStorage, 
  StorageType, 
  createStorage, 
  defaultStorage 
} from './browser-storage.js';

// 文章序列化
export { 
  ArticleSerializer, 
  articleSerializer, 
  ArticleMetadata 
} from './article-serializer.js';

// 文章存储服务
export { 
  ArticleStorageService, 
  articleStorageService, 
  ArticleStatus, 
  SortOrder 
} from '../../services/article-storage-service.js';

/**
 * 快速访问常用功能
 * 使用懒加载模式避免循环引用问题
 */
export const storage = {
  // 文章操作
  saveArticle: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.saveArticle(...args);
  },
  getArticle: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.getArticle(...args);
  },
  getAllArticles: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.getAllArticles(...args);
  },
  deleteArticle: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.deleteArticle(...args);
  },
  updateArticle: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.updateArticle(...args);
  },
  
  // 草稿操作
  saveDraft: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.saveDraft(...args);
  },
  getDrafts: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.getDrafts(...args);
  },
  deleteDraft: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.deleteDraft(...args);
  },
  
  // 工具方法
  getStats: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.getStorageStats(...args);
  },
  cleanup: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.cleanup(...args);
  },
  initialize: async (...args) => {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    return articleStorageService.initialize(...args);
  },
  
  // 序列化工具
  serialize: (...args) => {
    return articleSerializer.serialize(...args);
  },
  deserialize: (...args) => {
    return articleSerializer.deserialize(...args);
  },
  createEmpty: (...args) => {
    return articleSerializer.createEmptyArticle(...args);
  },
  clone: (...args) => {
    return articleSerializer.cloneArticle(...args);
  }
};

/**
 * 初始化存储系统
 * @returns {Promise<boolean>} 是否初始化成功
 */
export async function initializeStorage() {
  try {
    const { articleStorageService } = await import('../../services/article-storage-service.js');
    const success = await articleStorageService.initialize();
    if (success) {
      console.log('存储系统初始化成功');
    } else {
      console.error('存储系统初始化失败');
    }
    return success;
  } catch (error) {
    console.error('存储系统初始化异常:', error);
    return false;
  }
}