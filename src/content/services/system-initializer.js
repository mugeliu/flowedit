// 系统初始化器 - 负责用户相关服务的初始化
import { initializeStorage } from "../utils/storage/index.js";
import { configManager } from "./config-manager.js";
import { styleSyncService } from "./style-sync.js";

/**
 * 初始化应用服务（用户配置、远程样式系统等）
 * 注意：这里的远程样式是为了editor编辑器block转化为html使用的样式，不是插件UI样式
 * @param {Object} config 可选的配置覆盖
 * @returns {Promise<boolean>} 初始化是否成功
 */
export async function initializeAppServices(config = {}) {
  try {
    // 1. 初始化用户配置管理器
    await configManager.initialize();
    
    // 2. 初始化文章存储服务
    await initializeStorage();
    
    // 3. 初始化远程样式同步服务
    await initializeRemoteStyleSystem(config);
    
    return true;
  } catch (error) {
    console.error('FlowEdit应用服务初始化失败:', error);
    return false;
  }
}

/**
 * 初始化远程样式系统（用于editor编辑器block转html的样式）
 * @param {Object} config 配置参数
 * @returns {Promise<void>}
 */
async function initializeRemoteStyleSystem(config = {}) {
  try {
    // 初始化远程样式同步服务
    await styleSyncService.initialize();
    
    // 根据配置决定是否启用自动同步
    if (config.enableAutoSync !== false) {
      const syncInterval = config.syncInterval || 30000; // 默认30秒
      styleSyncService.startAutoSync(syncInterval);
    }
    
    // 执行首次手动同步
    if (config.initialSync !== false) {
      await styleSyncService.manualSync();
    }
  } catch (error) {
    console.error('远程样式系统初始化失败:', error);
    // 不抛出错误，使用默认样式
  }
}

/**
 * 获取用户配置
 * @param {string} key 配置键名
 * @returns {any} 配置值
 */
export function getUserConfig(key) {
  return configManager.getUserConfig(key);
}

/**
 * 设置用户配置
 * @param {string|Object} key 配置键名或配置对象
 * @param {any} value 配置值
 * @returns {Promise<boolean>} 设置是否成功
 */
export async function setUserConfig(key, value) {
  return await configManager.setUserConfig(key, value);
}

/**
 * 手动同步远程样式
 * @returns {Promise<boolean>} 同步是否成功
 */
export async function syncRemoteStyles() {
  return await styleSyncService.manualSync();
}

/**
 * 启动远程样式自动同步
 * @param {number} interval 同步间隔（毫秒）
 */
export function startStyleAutoSync(interval) {
  styleSyncService.startAutoSync(interval);
}

/**
 * 停止远程样式自动同步
 */
export function stopStyleAutoSync() {
  styleSyncService.stopAutoSync();
}

// 导出服务实例（供其他模块使用）
export { configManager, styleSyncService };