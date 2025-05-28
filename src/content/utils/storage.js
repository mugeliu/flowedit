// 存储工具函数模块
// 负责处理本地存储相关的操作

/**
 * 保存数据到本地存储
 * @param {string} key - 存储键名
 * @param {any} data - 要存储的数据
 * @returns {boolean} - 是否保存成功
 */
export function saveToStorage(key, data) {
  try {
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
 * 从本地存储删除数据
 * @param {string} key - 存储键名
 * @returns {boolean} - 是否删除成功
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    console.log(`数据已从本地存储删除: ${key}`);
    return true;
  } catch (error) {
    console.error(`从本地存储删除数据失败: ${key}`, error);
    return false;
  }
}

// 存储键常量
export const STORAGE_KEYS = {
  STYLE_SETTINGS: 'wx-floating-toolbar-settings'
};
