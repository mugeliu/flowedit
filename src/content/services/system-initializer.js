// 系统初始化器 - 负责用户相关服务的初始化
import { initializeStorage } from "../utils/storage/index.js";

/**
 * 用户配置管理器
 * 负责管理用户的个人配置信息
 */
class UserConfigManager {
  constructor() {
    this.config = {};
    this.initialized = false;
  }

  /**
   * 初始化用户配置管理器
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // TODO: 后续实现从本地存储或远程加载用户配置
      this.initialized = true;
    } catch (error) {
      console.error('用户配置管理器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户配置
   * @param {string} key 配置键名
   * @returns {any} 配置值
   */
  getUserConfig(key) {
    if (!this.initialized) {
      console.warn('用户配置管理器未初始化');
      return null;
    }
    return key ? this.config[key] : this.config;
  }

  /**
   * 设置用户配置
   * @param {string|Object} key 配置键名或配置对象
   * @param {any} value 配置值
   * @returns {Promise<boolean>} 设置是否成功
   */
  async setUserConfig(key, value) {
    try {
      if (!this.initialized) {
        console.warn('用户配置管理器未初始化');
        return false;
      }

      if (typeof key === 'object') {
        this.config = { ...this.config, ...key };
      } else {
        this.config[key] = value;
      }

      // TODO: 后续实现配置持久化
      return true;
    } catch (error) {
      console.error('设置用户配置失败:', error);
      return false;
    }
  }
}

/**
 * 远程样式同步服务
 * 负责从远程服务器同步样式配置
 */
class RemoteStyleSyncService {
  constructor() {
    this.initialized = false;
    this.styleCache = {};
    this.syncInterval = null;
  }

  /**
   * 初始化远程样式同步服务
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      // TODO: 后续实现远程样式服务连接
      this.initialized = true;
    } catch (error) {
      console.error('远程样式同步服务初始化失败:', error);
      throw error;
    }
  }

  /**
   * 手动同步样式
   * @returns {Promise<boolean>} 同步是否成功
   */
  async manualSync() {
    try {
      if (!this.initialized) {
        console.warn('远程样式同步服务未初始化');
        return false;
      }

      // TODO: 后续实现具体的样式同步逻辑
      return true;
    } catch (error) {
      console.error('远程样式同步失败:', error);
      return false;
    }
  }

  /**
   * 启动自动同步
   * @param {number} interval 同步间隔（毫秒）
   */
  startAutoSync(interval = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      await this.manualSync();
    }, interval);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// 创建全局实例
const userConfigManager = new UserConfigManager();
const remoteStyleSyncService = new RemoteStyleSyncService();

/**
 * 初始化应用服务（用户配置、远程样式系统等）
 * 注意：这里的远程样式是为了editor编辑器block转化为html使用的样式，不是插件UI样式
 * @param {Object} config 可选的配置覆盖
 * @returns {Promise<boolean>} 初始化是否成功
 */
export async function initializeAppServices(config = {}) {
  try {
    // 1. 初始化用户配置管理器
    await userConfigManager.initialize();
    
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
    await remoteStyleSyncService.initialize();
    
    // 根据配置决定是否启用自动同步
    if (config.enableAutoSync !== false) {
      const syncInterval = config.syncInterval || 30000; // 默认30秒
      remoteStyleSyncService.startAutoSync(syncInterval);
    }
    
    // 执行首次手动同步
    if (config.initialSync !== false) {
      await remoteStyleSyncService.manualSync();
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
  return userConfigManager.getUserConfig(key);
}

/**
 * 设置用户配置
 * @param {string|Object} key 配置键名或配置对象
 * @param {any} value 配置值
 * @returns {Promise<boolean>} 设置是否成功
 */
export async function setUserConfig(key, value) {
  return await userConfigManager.setUserConfig(key, value);
}

/**
 * 手动同步远程样式
 * @returns {Promise<boolean>} 同步是否成功
 */
export async function syncRemoteStyles() {
  return await remoteStyleSyncService.manualSync();
}

/**
 * 启动远程样式自动同步
 * @param {number} interval 同步间隔（毫秒）
 */
export function startStyleAutoSync(interval) {
  remoteStyleSyncService.startAutoSync(interval);
}

/**
 * 停止远程样式自动同步
 */
export function stopStyleAutoSync() {
  remoteStyleSyncService.stopAutoSync();
}

// 导出服务实例（供其他模块使用）
export { userConfigManager, remoteStyleSyncService };