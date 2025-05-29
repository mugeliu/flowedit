// 事件处理工具函数模块
// 负责处理事件监听、委托和自定义事件

/**
 * 事件委托函数
 * @param {HTMLElement} element - 要监听的元素
 * @param {string} eventType - 事件类型
 * @param {string} selector - CSS选择器
 * @param {Function} handler - 事件处理函数
 * @returns {Function} 移除事件监听的函数
 */
export function delegateEvent(element, eventType, selector, handler) {
  const eventListener = (event) => {
    // 查找匹配选择器的元素
    let targetElement = event.target;
    
    while (targetElement && targetElement !== element) {
      if (targetElement.matches(selector)) {
        // 调用处理函数，并传入事件和目标元素
        handler(event, targetElement);
        return;
      }
      targetElement = targetElement.parentElement;
    }
  };
  
  // 添加事件监听
  element.addEventListener(eventType, eventListener);
  
  // 返回移除事件监听的函数
  return () => {
    element.removeEventListener(eventType, eventListener);
  };
}

/**
 * 创建并分发自定义事件
 * @param {HTMLElement} element - 分发事件的元素
 * @param {string} eventName - 事件名称
 * @param {Object} detail - 事件详情
 * @param {boolean} bubbles - 是否冒泡
 * @param {boolean} cancelable - 是否可取消
 * @returns {boolean} 事件是否未被取消
 */
export function dispatchCustomEvent(element, eventName, detail = {}, bubbles = true, cancelable = true) {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles,
    cancelable
  });
  
  return element.dispatchEvent(event);
}

/**
 * 添加一次性事件监听
 * @param {HTMLElement} element - 要监听的元素
 * @param {string} eventType - 事件类型
 * @param {Function} handler - 事件处理函数
 * @param {Object} options - 事件选项
 */
export function addOneTimeEventListener(element, eventType, handler, options = {}) {
  const oneTimeHandler = (event) => {
    // 移除事件监听
    element.removeEventListener(eventType, oneTimeHandler, options);
    
    // 调用原始处理函数
    handler(event);
  };
  
  // 添加事件监听
  element.addEventListener(eventType, oneTimeHandler, options);
}

/**
 * 等待事件触发
 * @param {HTMLElement} element - 要监听的元素
 * @param {string} eventType - 事件类型
 * @param {Function} filter - 过滤函数，返回true表示接受事件
 * @param {Object} options - 事件选项
 * @returns {Promise<Event>} 事件对象
 */
export function waitForEvent(element, eventType, filter = null, options = {}) {
  return new Promise((resolve) => {
    const eventHandler = (event) => {
      // 如果没有过滤函数或者过滤函数返回true
      if (!filter || filter(event)) {
        // 移除事件监听
        element.removeEventListener(eventType, eventHandler, options);
        
        // 解析Promise
        resolve(event);
      }
    };
    
    // 添加事件监听
    element.addEventListener(eventType, eventHandler, options);
  });
}

/**
 * 创建事件防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout;
  
  return function executedFunction(...args) {
    const context = this;
    
    // 清除之前的定时器
    clearTimeout(timeout);
    
    // 如果是立即执行
    if (immediate && !timeout) {
      func.apply(context, args);
    }
    
    // 设置新的定时器
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);
  };
}

/**
 * 创建事件节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  let lastFunc;
  let lastRan;
  
  return function executedFunction(...args) {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}
