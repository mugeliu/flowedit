// 存储工具函数模块
// 负责处理本地存储相关的操作

import { CONFIG } from '../core/config.js';

/**
 * 保存数据到本地存储
 * @param {string} key - 存储键名
 * @param {any} data - 要存储的数据
 * @returns {boolean} - 是否保存成功
 */
export function saveToStorage(key, data) {
  try {
    // 使用 Chrome 扩展的存储 API
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [key]: data }, () => {
        if (chrome.runtime.lastError) {
          console.error(`保存数据到 Chrome 存储失败: ${key}`, chrome.runtime.lastError);
          return false;
        }
        console.log(`数据已保存到 Chrome 存储: ${key}`);
      });
      return true;
    }
    
    // 回退到 localStorage
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`数据已保存到本地存储: ${key}`);
    return true;
  } catch (error) {
    console.error(`保存数据到本地存储失败: ${key}`, error);
    return false;
  }
}

/**
 * 从本地存储加载数据
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 如果数据不存在时的默认值
 * @returns {any} - 加载的数据或默认值
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    // 使用 Chrome 扩展的存储 API
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
          if (chrome.runtime.lastError) {
            console.error(`从 Chrome 存储加载数据失败: ${key}`, chrome.runtime.lastError);
            resolve(defaultValue);
            return;
          }
          
          if (result[key] !== undefined) {
            resolve(result[key]);
          } else {
            resolve(defaultValue);
          }
        });
      });
    }
    
    // 回退到 localStorage
    const savedData = localStorage.getItem(key);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return defaultValue;
  } catch (error) {
    console.error(`从本地存储加载数据失败: ${key}`, error);
    return defaultValue;
  }
}

/**
 * 从本地存储同步加载数据（不使用 Promise）
 * @param {string} key - 存储键名
 * @param {any} defaultValue - 如果数据不存在时的默认值
 * @returns {any} - 加载的数据或默认值
 */
export function loadFromStorageSync(key, defaultValue = null) {
  try {
    // 只使用 localStorage
    const savedData = localStorage.getItem(key);
    if (savedData) {
      return JSON.parse(savedData);
    }
    return defaultValue;
  } catch (error) {
    console.error(`从本地存储同步加载数据失败: ${key}`, error);
    return defaultValue;
  }
}

/**
 * 从本地存储删除数据
 * @param {string} key - 存储键名
 * @returns {boolean} - 是否删除成功
 */
export function removeFromStorage(key) {
  try {
    // 使用 Chrome 扩展的存储 API
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime.lastError) {
          console.error(`从 Chrome 存储删除数据失败: ${key}`, chrome.runtime.lastError);
          return false;
        }
        console.log(`数据已从 Chrome 存储删除: ${key}`);
      });
      return true;
    }
    
    // 回退到 localStorage
    localStorage.removeItem(key);
    console.log(`数据已从本地存储删除: ${key}`);
    return true;
  } catch (error) {
    console.error(`从本地存储删除数据失败: ${key}`, error);
    return false;
  }
}

// 导出存储键常量，从配置文件中获取
export const STORAGE_KEYS = CONFIG.STORAGE_KEYS;

/**
 * 同步存储数据到本地和 Chrome 存储
 * @param {string} key - 存储键名
 * @param {any} data - 要存储的数据
 * @returns {Promise<boolean>} - 是否保存成功的 Promise
 */
export async function syncStorage() {
  try {
    // 如果 Chrome 存储可用，则从 localStorage 同步到 Chrome 存储
    if (typeof chrome !== 'undefined' && chrome.storage) {
      // 获取所有 localStorage 数据
      const localData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          localData[key] = JSON.parse(localStorage.getItem(key));
        } catch (e) {
          localData[key] = localStorage.getItem(key);
        }
      }
      
      // 保存到 Chrome 存储
      return new Promise((resolve) => {
        chrome.storage.local.set(localData, () => {
          if (chrome.runtime.lastError) {
            console.error('同步到 Chrome 存储失败:', chrome.runtime.lastError);
            resolve(false);
            return;
          }
          console.log('数据已同步到 Chrome 存储');
          resolve(true);
        });
      });
    }
    
    return true;
  } catch (error) {
    console.error('同步存储失败:', error);
    return false;
  }
}
