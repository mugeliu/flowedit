/**
 * 浏览器存储封装
 * 支持 localStorage、sessionStorage、chrome.storage
 */

import { createLogger } from '../../services/simple-logger.js';

// 创建模块日志器
const logger = createLogger('BrowserStorage');

/**
 * 存储类型枚举
 */
export const StorageType = {
  LOCAL: 'local',
  SESSION: 'session',
  CHROME: 'chrome'
};

/**
 * 浏览器存储封装类
 */
export class BrowserStorage {
  /**
   * 构造函数
   * @param {string} storageType - 存储类型
   * @param {string} namespace - 命名空间前缀
   */
  constructor(storageType = StorageType.LOCAL, namespace = 'flowedit') {
    this.storageType = storageType;
    this.namespace = namespace;
    this.separator = '_';
  }

  /**
   * 生成带命名空间的键名
   * @param {string} key - 原始键名
   * @returns {string} 带命名空间的键名
   */
  _getNamespacedKey(key) {
    return `${this.namespace}${this.separator}${key}`;
  }

  /**
   * 获取存储实例
   * @returns {Storage|Object} 存储实例
   */
  _getStorage() {
    switch (this.storageType) {
      case StorageType.LOCAL:
        return window.localStorage;
      case StorageType.SESSION:
        return window.sessionStorage;
      case StorageType.CHROME:
        return chrome.storage.local;
      default:
        return window.localStorage;
    }
  }

  /**
   * 检查Chrome扩展上下文是否有效
   * @returns {boolean}
   */
  _isExtensionContextValid() {
    try {
      return !!(chrome && chrome.storage && chrome.storage.local);
    } catch (error) {
      return false;
    }
  }

  /**
   * 处理扩展上下文失效的情况
   * @param {string} operation - 操作名称
   */
  _handleContextInvalidated(operation) {
    logger.warn(`扩展上下文失效，${operation}操作失败。请刷新页面或重新加载扩展。`);
  }

  /**
   * 获取数据
   * @param {string} key - 键名
   * @returns {Promise<any>} 数据值
   */
  async get(key) {
    const namespacedKey = this._getNamespacedKey(key);
    
    try {
      if (this.storageType === StorageType.CHROME) {
        // 检查扩展上下文是否有效
        if (!this._isExtensionContextValid()) {
          this._handleContextInvalidated('获取数据');
          return null;
        }
        
        const result = await chrome.storage.local.get([namespacedKey]);
        return result[namespacedKey] || null;
      } else {
        const storage = this._getStorage();
        const value = storage.getItem(namespacedKey);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      // 检查是否是扩展上下文失效错误
      if (error.message && error.message.includes('Extension context invalidated')) {
        this._handleContextInvalidated('获取数据');
        return null;
      }
      logger.error(`获取存储数据失败 (${key}):`, error);
      return null;
    }
  }

  /**
   * 存储数据
   * @param {string} key - 键名
   * @param {any} value - 数据值
   * @returns {Promise<boolean>} 是否成功
   */
  async set(key, value) {
    const namespacedKey = this._getNamespacedKey(key);
    
    try {
      if (this.storageType === StorageType.CHROME) {
        // 检查扩展上下文是否有效
        if (!this._isExtensionContextValid()) {
          this._handleContextInvalidated('存储数据');
          return false;
        }
        
        await chrome.storage.local.set({ [namespacedKey]: value });
      } else {
        const storage = this._getStorage();
        storage.setItem(namespacedKey, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      // 检查是否是扩展上下文失效错误
      if (error.message && error.message.includes('Extension context invalidated')) {
        this._handleContextInvalidated('存储数据');
        return false;
      }
      logger.error(`存储数据失败 (${key}):`, error);
      return false;
    }
  }

  /**
   * 删除数据
   * @param {string} key - 键名
   * @returns {Promise<boolean>} 是否成功
   */
  async remove(key) {
    const namespacedKey = this._getNamespacedKey(key);
    
    try {
      if (this.storageType === StorageType.CHROME) {
        await chrome.storage.local.remove([namespacedKey]);
      } else {
        const storage = this._getStorage();
        storage.removeItem(namespacedKey);
      }
      return true;
    } catch (error) {
      logger.error(`删除存储数据失败 (${key}):`, error);
      return false;
    }
  }

  /**
   * 清除所有数据（仅清除当前命名空间下的数据）
   * @returns {Promise<boolean>} 是否成功
   */
  async clear() {
    try {
      if (this.storageType === StorageType.CHROME) {
        const result = await chrome.storage.local.get(null);
        const keysToRemove = Object.keys(result).filter(key => 
          key.startsWith(`${this.namespace}${this.separator}`)
        );
        if (keysToRemove.length > 0) {
          await chrome.storage.local.remove(keysToRemove);
        }
      } else {
        const storage = this._getStorage();
        const keysToRemove = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(`${this.namespace}${this.separator}`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => storage.removeItem(key));
      }
      return true;
    } catch (error) {
      logger.error('清除存储数据失败:', error);
      return false;
    }
  }

  /**
   * 获取所有键名（当前命名空间下）
   * @returns {Promise<string[]>} 键名数组
   */
  async getAllKeys() {
    try {
      const keys = [];
      const prefix = `${this.namespace}${this.separator}`;
      
      if (this.storageType === StorageType.CHROME) {
        const result = await chrome.storage.local.get(null);
        Object.keys(result).forEach(key => {
          if (key.startsWith(prefix)) {
            keys.push(key.substring(prefix.length));
          }
        });
      } else {
        const storage = this._getStorage();
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(prefix)) {
            keys.push(key.substring(prefix.length));
          }
        }
      }
      
      return keys;
    } catch (error) {
      logger.error('获取所有键名失败:', error);
      return [];
    }
  }

  /**
   * 检查键是否存在
   * @param {string} key - 键名
   * @returns {Promise<boolean>} 是否存在
   */
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * 获取存储使用情况（仅Chrome存储支持）
   * @returns {Promise<Object>} 使用情况信息
   */
  async getUsage() {
    try {
      if (this.storageType === StorageType.CHROME) {
        const bytesInUse = await chrome.storage.local.getBytesInUse();
        const quota = chrome.storage.local.QUOTA_BYTES;
        return {
          bytesInUse,
          quota,
          usage: bytesInUse / quota,
          available: quota - bytesInUse
        };
      } else {
        // localStorage 大小估算
        const storage = this._getStorage();
        let totalSize = 0;
        for (let key in storage) {
          if (storage.hasOwnProperty(key)) {
            totalSize += storage[key].length;
          }
        }
        return {
          bytesInUse: totalSize,
          quota: 5 * 1024 * 1024, // 估算5MB
          usage: totalSize / (5 * 1024 * 1024),
          available: (5 * 1024 * 1024) - totalSize
        };
      }
    } catch (error) {
      logger.error('获取存储使用情况失败:', error);
      return {
        bytesInUse: 0,
        quota: 0,
        usage: 0,
        available: 0
      };
    }
  }
}

/**
 * 创建默认的存储实例
 */
export const createStorage = (storageType = StorageType.CHROME, namespace = 'flowedit') => {
  return new BrowserStorage(storageType, namespace);
};

/**
 * 默认存储实例
 */
export const defaultStorage = createStorage();