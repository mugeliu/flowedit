/**
 * 样式同步服务
 * 负责管理用户样式的同步、缓存和更新
 */

import { styleConfig } from '../config/style-config.js';

/**
 * 样式同步服务类
 */
class StyleSyncService {
  constructor() {
    this.isInitialized = false;
    this.syncTimer = null;
    this.lastSyncTime = null;
    this.currentVersion = null;
    this.syncInterval = 60 * 60 * 1000; // 1小时同步一次
  }

  /**
   * 初始化样式同步服务
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize() {
    if (this.isInitialized) {
      return true;
    }

    try {
      // 检查用户登录状态（预留）
      const isLoggedIn = await this.checkUserAuth();
      if (!isLoggedIn) {
        console.log('用户未登录，使用默认样式');
        this.isInitialized = true;
        return true;
      }

      // 获取本地缓存的样式版本
      const cachedVersion = await this.getCachedStyleVersion();
      
      // 检查远程样式版本
      const remoteVersion = await this.getRemoteStyleVersion();
      
      // 如果需要更新样式
      if (!cachedVersion || cachedVersion !== remoteVersion) {
        console.log('检测到样式更新，开始同步...');
        const syncSuccess = await this.syncStyles();
        if (syncSuccess) {
          await this.setCachedStyleVersion(remoteVersion);
        }
      } else {
        console.log('样式已是最新版本');
      }

      // 启动定时同步
      this.startPeriodicSync();
      
      this.isInitialized = true;
      this.lastSyncTime = Date.now();
      
      return true;
    } catch (error) {
      console.error('样式同步服务初始化失败:', error);
      // 初始化失败时使用默认样式
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * 检查用户认证状态（预留接口）
   * @returns {Promise<boolean>} 是否已登录
   */
  async checkUserAuth() {
    // TODO: 实现用户认证检查
    // 目前返回 false，表示未登录，使用默认样式
    return false;
  }

  /**
   * 获取远程样式版本号
   * @returns {Promise<string|null>} 样式版本号
   */
  async getRemoteStyleVersion() {
    try {
      // TODO: 实现真实的API调用
      // const response = await fetch('/api/user/styles/version');
      // const data = await response.json();
      // return data.version;
      
      // 模拟返回版本号
      return 'v1.0.0';
    } catch (error) {
      console.error('获取远程样式版本失败:', error);
      return null;
    }
  }

  /**
   * 同步样式数据
   * @returns {Promise<boolean>} 同步是否成功
   */
  async syncStyles() {
    try {
      // TODO: 实现真实的样式同步
      // const response = await fetch('/api/user/styles');
      // const stylesData = await response.json();
      // await this.cacheStyles(stylesData);
      
      console.log('样式同步完成（模拟）');
      return true;
    } catch (error) {
      console.error('样式同步失败:', error);
      return false;
    }
  }

  /**
   * 手动触发样式同步
   * @returns {Promise<boolean>} 同步是否成功
   */
  async manualSync() {
    console.log('开始手动同步样式...');
    
    try {
      const remoteVersion = await this.getRemoteStyleVersion();
      const cachedVersion = await this.getCachedStyleVersion();
      
      if (remoteVersion && remoteVersion !== cachedVersion) {
        const syncSuccess = await this.syncStyles();
        if (syncSuccess) {
          await this.setCachedStyleVersion(remoteVersion);
          this.lastSyncTime = Date.now();
          console.log('手动同步完成');
          return true;
        }
      } else {
        console.log('样式已是最新版本，无需同步');
        return true;
      }
    } catch (error) {
      console.error('手动同步失败:', error);
    }
    
    return false;
  }

  /**
   * 启动定时同步
   */
  startPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }
    
    this.syncTimer = setInterval(async () => {
      console.log('执行定时样式同步...');
      await this.manualSync();
    }, this.syncInterval);
    
    console.log(`定时同步已启动，间隔: ${this.syncInterval / 1000 / 60} 分钟`);
  }

  /**
   * 停止定时同步
   */
  stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('定时同步已停止');
    }
  }

  /**
   * 获取缓存的样式版本
   * @returns {Promise<string|null>} 缓存的版本号
   */
  async getCachedStyleVersion() {
    try {
      const result = await chrome.storage.local.get(['styleVersion']);
      return result.styleVersion || null;
    } catch (error) {
      console.error('获取缓存样式版本失败:', error);
      return null;
    }
  }

  /**
   * 设置缓存的样式版本
   * @param {string} version 版本号
   * @returns {Promise<boolean>} 是否设置成功
   */
  async setCachedStyleVersion(version) {
    try {
      await chrome.storage.local.set({ styleVersion: version });
      this.currentVersion = version;
      return true;
    } catch (error) {
      console.error('设置缓存样式版本失败:', error);
      return false;
    }
  }

  /**
   * 缓存样式数据
   * @param {Object} stylesData 样式数据
   * @returns {Promise<boolean>} 是否缓存成功
   */
  async cacheStyles(stylesData) {
    try {
      await chrome.storage.local.set({ 
        userStyles: stylesData,
        stylesCacheTime: Date.now()
      });
      return true;
    } catch (error) {
      console.error('缓存样式数据失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存的样式数据
   * @returns {Promise<Object|null>} 缓存的样式数据
   */
  async getCachedStyles() {
    try {
      const result = await chrome.storage.local.get(['userStyles', 'stylesCacheTime']);
      
      // 检查缓存是否过期（24小时）
      const cacheExpiry = 24 * 60 * 60 * 1000;
      if (result.stylesCacheTime && (Date.now() - result.stylesCacheTime) > cacheExpiry) {
        console.log('样式缓存已过期');
        return null;
      }
      
      return result.userStyles || null;
    } catch (error) {
      console.error('获取缓存样式数据失败:', error);
      return null;
    }
  }

  /**
   * 清除所有缓存
   * @returns {Promise<boolean>} 是否清除成功
   */
  async clearCache() {
    try {
      await chrome.storage.local.remove(['styleVersion', 'userStyles', 'stylesCacheTime']);
      this.currentVersion = null;
      this.lastSyncTime = null;
      console.log('样式缓存已清除');
      return true;
    } catch (error) {
      console.error('清除样式缓存失败:', error);
      return false;
    }
  }

  /**
   * 获取同步状态信息
   * @returns {Object} 同步状态
   */
  getSyncStatus() {
    return {
      isInitialized: this.isInitialized,
      currentVersion: this.currentVersion,
      lastSyncTime: this.lastSyncTime,
      isPeriodicSyncActive: !!this.syncTimer
    };
  }

  /**
   * 销毁服务
   */
  destroy() {
    this.stopPeriodicSync();
    this.isInitialized = false;
    this.currentVersion = null;
    this.lastSyncTime = null;
  }
}

// 创建单例实例
const styleSyncService = new StyleSyncService();

export default styleSyncService;
export { StyleSyncService };