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

// 延迟导入存储服务，避免循环引用
import { 
  ArticleStorageService, 
  articleStorageService, 
  ArticleStatus, 
  SortOrder 
} from '../../services/article-storage.js';

// 重新导出
export { ArticleStorageService, articleStorageService, ArticleStatus, SortOrder };

/**
 * 快速访问常用功能
 */
export const storage = {
  // 文章操作
  saveArticle: (...args) => articleStorageService.saveArticle(...args),
  getArticle: (...args) => articleStorageService.getArticle(...args),
  getAllArticles: (...args) => articleStorageService.getAllArticles(...args),
  deleteArticle: (...args) => articleStorageService.deleteArticle(...args),
  updateArticle: (...args) => articleStorageService.updateArticle(...args),
  
  // 草稿操作
  saveDraft: (...args) => articleStorageService.saveDraft(...args),
  getDrafts: (...args) => articleStorageService.getDrafts(...args),
  deleteDraft: (...args) => articleStorageService.deleteDraft(...args),
  
  // 工具方法
  getStats: (...args) => articleStorageService.getStorageStats(...args),
  cleanup: (...args) => articleStorageService.cleanup(...args),
  initialize: (...args) => articleStorageService.initialize(...args),
  
  // 序列化工具
  serialize: (...args) => articleSerializer.serialize(...args),
  deserialize: (...args) => articleSerializer.deserialize(...args),
  createEmpty: (...args) => articleSerializer.createEmptyArticle(...args),
  clone: (...args) => articleSerializer.cloneArticle(...args)
};

/**
 * 初始化存储系统
 * @returns {Promise<boolean>} 是否初始化成功
 */
export async function initializeStorage() {
  try {
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