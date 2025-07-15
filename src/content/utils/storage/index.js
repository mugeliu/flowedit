/**
 * 存储工具入口文件
 * 导出所有存储相关的工具和服务
 */

import { createLogger } from '../../services/simple-logger.js';

// 创建模块日志器
const logger = createLogger('StorageIndex');

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
import { 
  ArticleStorageService, 
  articleStorageService, 
  ArticleStatus, 
  SortOrder 
} from './article-storage.js';

// 重新导出
export { 
  ArticleStorageService, 
  articleStorageService, 
  articleStorageService as storage,  // 直接导出为storage别名
  ArticleStatus, 
  SortOrder 
};

/**
 * 初始化存储系统
 * @returns {Promise<boolean>} 是否初始化成功
 */
export async function initializeStorage() {
  try {
    // 直接使用已经导入的 articleStorageService
    const success = await articleStorageService.initialize();
    if (success) {
      logger.info('存储系统初始化成功');
    } else {
      logger.error('存储系统初始化失败');
    }
    return success;
  } catch (error) {
    logger.error('存储系统初始化异常:', error);
    return false;
  }
}