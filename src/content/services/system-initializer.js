// 系统初始化器 - 负责应用服务的初始化
import { initializeStorage } from "../../shared/services/storage/index.js";
import { createLogger } from "../../shared/services/logger.js";

// 创建模块日志器
const logger = createLogger('SystemInitializer');

/**
 * 初始化应用服务（存储系统等）
 * @returns {Promise<boolean>} 初始化是否成功
 */
export async function initializeAppServices() {
  try {
    // 初始化文章存储服务
    await initializeStorage();
    
    logger.info('应用服务初始化完成');
    return true;
  } catch (error) {
    logger.error('FlowEdit应用服务初始化失败:', error);
    return false;
  }
}