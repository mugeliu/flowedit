// DOM操作工具函数
// 移除对 selectorConfig 的依赖



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
 * 设置元素的显示状态
 * @param {string|Element} elementOrId 元素ID（字符串）或元素对象
 * @param {string} display 显示状态值（'none'表示隐藏，''或其他值表示显示）
 * @returns {boolean} 操作是否成功
 */
export function setElementDisplay(elementOrId, display) {
  let element;
  
  if (typeof elementOrId === 'string') {
    // 如果是字符串，尝试通过ID获取元素
    element = document.getElementById(elementOrId);
  } else if (elementOrId && elementOrId.nodeType === Node.ELEMENT_NODE) {
    // 如果是元素对象
    element = elementOrId;
  }
  
  if (element) {
    element.style.display = display;
    return true;
  }
  
  return false;
}

/**
 * 隐藏元素
 * @param {string|Element} elementOrId 元素ID（字符串）或元素对象
 * @returns {boolean} 操作是否成功
 */
export function hideElement(elementOrId) {
  return setElementDisplay(elementOrId, 'none');
}

/**
 * 显示元素
 * @param {string|Element} elementOrId 元素ID（字符串）或元素对象
 * @returns {boolean} 操作是否成功
 */
export function showElement(elementOrId) {
  return setElementDisplay(elementOrId, '');
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
