// DOM元素创建与查询工具

/**
 * 创建带属性的DOM元素
 * @param {string} tag 标签名
 * @param {Object} attrs 属性对象
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") {
      el.className = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else {
      el.setAttribute(key, value);
    }
  }
  return el;
}

/**
 * 查询单个元素
 * @param {string} selector
 * @param {ParentNode} [root=document]
 * @returns {Element|null}
 */
export function $(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * 查询所有元素
 * @param {string} selector
 * @param {ParentNode} [root=document]
 * @returns {NodeListOf<Element>}
 */
export function $all(selector, root = document) {
  return root.querySelectorAll(selector);
}
