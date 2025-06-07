// DOM操作工具函数
import { selectorConfig } from '../config/index.js';

/**
 * 隐藏指定元素并保存原始状态
 * @param {Array<string>} elementIds 要隐藏的元素ID列表
 * @returns {Object} 原始显示状态
 */
export function hideElements(elementIds) {
  const originalStates = {};
  
  elementIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      originalStates[id] = el.style.display;
      el.style.display = "none";
    }
  });
  
  return originalStates;
}

/**
 * 恢复元素的显示状态
 * @param {Object} originalStates 原始显示状态
 */
export function restoreElements(originalStates) {
  Object.entries(originalStates).forEach(([id, display]) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = display;
    }
  });
}

/**
 * 隐藏按钮区域的子元素
 * @returns {Array} 原始子元素状态
 */
export function hideButtonAreaChildren() {
  const buttonArea = document.getElementById(selectorConfig.buttonArea.replace('#', ''));
  if (!buttonArea) return [];
  
  const originalChildren = Array.from(buttonArea.children);
  const childrenStates = originalChildren.map((child) => ({
    element: child,
    display: child.style.display,
  }));
  
  originalChildren.forEach((child) => {
    child.style.display = "none";
  });
  
  return childrenStates;
}

/**
 * 恢复按钮区域子元素的显示状态
 * @param {Array} childrenStates 子元素状态
 */
export function restoreButtonAreaChildren(childrenStates) {
  childrenStates.forEach(({ element, display }) => {
    element.style.display = display;
  });
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