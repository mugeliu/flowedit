// DOM操作工具函数
// 移除对 selectorConfig 的依赖

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
      const currentDisplay =
        element.style.display || getComputedStyle(element).display;
      const isHidden = currentDisplay === "none";

      elementStates.push({
        element: element,
        selector: selector,
        previousDisplay: currentDisplay,
        newDisplay: isHidden ? "" : "none",
      });

      element.style.display = isHidden ? "" : "none";
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
