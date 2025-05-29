// 通用辅助函数模块
// 负责提供各种通用的辅助函数

/**
 * 生成唯一ID
 * @param {string} prefix - ID前缀
 * @returns {string} 唯一ID
 */
export function generateUniqueId(prefix = 'wx') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 深度合并对象
 * @param {Object} target - 目标对象
 * @param {Object} source - 源对象
 * @returns {Object} 合并后的对象
 */
export function deepMerge(target, source) {
  // 如果源对象不是对象或为null，则直接返回源对象
  if (typeof source !== 'object' || source === null) {
    return source;
  }
  
  // 如果目标对象不是对象或为null，则创建一个新对象
  if (typeof target !== 'object' || target === null) {
    target = Array.isArray(source) ? [] : {};
  }
  
  // 遍历源对象的属性
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      // 如果属性是对象，则递归合并
      if (typeof source[key] === 'object' && source[key] !== null) {
        target[key] = deepMerge(target[key], source[key]);
      } else {
        // 否则直接赋值
        target[key] = source[key];
      }
    }
  }
  
  return target;
}

/**
 * 格式化日期
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) {
    date = new Date();
  } else if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  // 填充函数，确保数字为两位
  const pad = (num) => String(num).padStart(2, '0');
  
  // 替换格式字符串中的占位符
  return format
    .replace('YYYY', year)
    .replace('MM', pad(month))
    .replace('DD', pad(day))
    .replace('HH', pad(hours))
    .replace('mm', pad(minutes))
    .replace('ss', pad(seconds));
}

/**
 * 将对象转换为查询字符串
 * @param {Object} params - 参数对象
 * @returns {string} 查询字符串
 */
export function objectToQueryString(params) {
  return Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

/**
 * 将查询字符串转换为对象
 * @param {string} queryString - 查询字符串
 * @returns {Object} 参数对象
 */
export function queryStringToObject(queryString) {
  if (!queryString || queryString === '') {
    return {};
  }
  
  // 移除开头的问号（如果有）
  const qs = queryString.startsWith('?') ? queryString.substring(1) : queryString;
  
  // 分割查询字符串并转换为对象
  return qs.split('&').reduce((result, param) => {
    const [key, value] = param.split('=');
    if (key) {
      result[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
    return result;
  }, {});
}

/**
 * 检查浏览器类型
 * @returns {Object} 浏览器信息
 */
export function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';
  
  // 检测Chrome
  if (ua.indexOf('Chrome') !== -1) {
    browser = 'Chrome';
    version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }
  // 检测Firefox
  else if (ua.indexOf('Firefox') !== -1) {
    browser = 'Firefox';
    version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }
  // 检测Safari
  else if (ua.indexOf('Safari') !== -1) {
    browser = 'Safari';
    version = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }
  // 检测Edge
  else if (ua.indexOf('Edg') !== -1) {
    browser = 'Edge';
    version = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }
  
  return {
    browser,
    version,
    userAgent: ua,
    isMobile: /Mobile|Android|iPhone|iPad|iPod/i.test(ua)
  };
}

/**
 * 安全地解析JSON
 * @param {string} jsonString - JSON字符串
 * @param {any} defaultValue - 解析失败时的默认值
 * @returns {any} 解析结果
 */
export function safeParseJSON(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON解析失败:', error);
    return defaultValue;
  }
}

/**
 * 安全地获取嵌套对象属性
 * @param {Object} obj - 对象
 * @param {string} path - 属性路径，如 'a.b.c'
 * @param {any} defaultValue - 获取失败时的默认值
 * @returns {any} 属性值
 */
export function getNestedProperty(obj, path, defaultValue = undefined) {
  if (!obj || !path) {
    return defaultValue;
  }
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
}

/**
 * 安全地设置嵌套对象属性
 * @param {Object} obj - 对象
 * @param {string} path - 属性路径，如 'a.b.c'
 * @param {any} value - 要设置的值
 * @returns {Object} 修改后的对象
 */
export function setNestedProperty(obj, path, value) {
  if (!obj || !path) {
    return obj;
  }
  
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    if (current[key] === undefined || current[key] === null || typeof current[key] !== 'object') {
      current[key] = {};
    }
    
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
  
  return obj;
}
