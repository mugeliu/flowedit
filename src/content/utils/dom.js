// DOM操作工具函数
// 移除对 selectorConfig 的依赖

/**
 * 通用的元素隐藏/显示工具函数
 * 支持ID选择器、class选择器、属性选择器等所有CSS选择器
 * @param {string|Array<string>} selectors 选择器或选择器数组
 * @returns {Array} 元素状态数组，包含元素引用和原始display值
 */
export function hideElements(selectors) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  const elementStates = [];
  
  selectorArray.forEach((selector) => {
    // 支持所有CSS选择器：#id, .class, [attribute], tag等
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      elementStates.push({
        element: element,
        selector: selector,
        originalDisplay: element.style.display || getComputedStyle(element).display
      });
      element.style.display = 'none';
    });
  });
  
  return elementStates;
}

/**
 * 恢复元素的显示状态
 * @param {Array} elementStates 由hideElements返回的元素状态数组
 */
export function restoreElements(elementStates) {
  elementStates.forEach(({ element, originalDisplay }) => {
    if (element && element.parentNode) {
      // 如果原始display是'none'，则恢复为默认值
      element.style.display = originalDisplay === 'none' ? '' : originalDisplay;
    }
  });
}

/**
 * 隐藏指定容器的子元素
 * @param {string} containerSelector 容器选择器
 * @param {string} [childSelector] 可选的子元素选择器，如果不提供则隐藏所有直接子元素
 * @returns {Array} 子元素状态数组
 */
export function hideContainerChildren(containerSelector, childSelector = null) {
  const container = document.querySelector(containerSelector);
  if (!container) return [];
  
  let children;
  if (childSelector) {
    // 如果提供了子元素选择器，则查找匹配的子元素
    children = container.querySelectorAll(childSelector);
  } else {
    // 否则获取所有直接子元素
    children = container.children;
  }
  
  const childrenStates = Array.from(children).map((child) => ({
    element: child,
    originalDisplay: child.style.display || getComputedStyle(child).display
  }));
  
  childrenStates.forEach(({ element }) => {
    element.style.display = 'none';
  });
  
  return childrenStates;
}

/**
 * 恢复容器子元素的显示状态
 * @param {Array} childrenStates 子元素状态数组
 */
export function restoreContainerChildren(childrenStates) {
  childrenStates.forEach(({ element, originalDisplay }) => {
    if (element && element.parentNode) {
      element.style.display = originalDisplay === 'none' ? '' : originalDisplay;
    }
  });
}

/**
 * 切换元素的显示/隐藏状态
 * @param {string|Array<string>} selectors 选择器或选择器数组
 * @returns {Array} 元素状态数组
 */
export function toggleElements(selectors) {
  const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
  const elementStates = [];
  
  selectorArray.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      const currentDisplay = element.style.display || getComputedStyle(element).display;
      const isHidden = currentDisplay === 'none';
      
      elementStates.push({
        element: element,
        selector: selector,
        previousDisplay: currentDisplay,
        newDisplay: isHidden ? '' : 'none'
      });
      
      element.style.display = isHidden ? '' : 'none';
    });
  });
  
  return elementStates;
}


/**
 * 创建带样式的DOM元素
 * @param {string} tag 标签名
 * @param {Object} options 选项
 * @param {string} options.className CSS类名
 * @param {string} options.id 元素ID
 * @param {string} options.innerHTML 内部HTML
 * @param {string} options.textContent 文本内容
 * @param {string} options.cssText CSS样式文本
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  
  if (options.className) element.className = options.className;
  if (options.id) element.id = options.id;
  if (options.innerHTML) element.innerHTML = options.innerHTML;
  if (options.textContent) element.textContent = options.textContent;
  if (options.cssText) element.style.cssText = options.cssText;
  
  return element;
}

/**
 * 安全地获取元素
 * @param {string} selector 选择器
 * @param {Element} parent 父元素
 * @returns {Element|null}
 */
export function safeQuerySelector(selector, parent = document) {
  try {
    return parent.querySelector(selector);
  } catch (error) {
    console.error(`查询选择器失败: ${selector}`, error);
    return null;
  }
}