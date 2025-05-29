// DOM操作工具函数模块
// 负责处理DOM元素查找、创建和操作

import { CONFIG } from '../core/config.js';

/**
 * 查找编辑器元素
 * @returns {HTMLElement|null} 找到的编辑器元素或null
 */
export function findEditor() {
  // 尝试查找ProseMirror编辑器
  const proseMirrorEditor = document.querySelector(CONFIG.SELECTORS.EDITOR);
  if (proseMirrorEditor) {
    console.log('找到ProseMirror编辑器');
    return proseMirrorEditor;
  }
  
  // 检查iframe中的编辑器
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      const iframeEditor = iframeDocument.querySelector(CONFIG.SELECTORS.EDITOR) || 
                          iframeDocument.querySelector('[contenteditable="true"]');
      if (iframeEditor) {
        console.log('在iframe中找到编辑器');
        return iframeEditor;
      }
    } catch (e) {
      console.log('访问iframe内容时出错:', e);
    }
  }
  
  // 查找其他可能的编辑器元素
  const editorCandidates = document.querySelectorAll('[contenteditable="true"]');
  
  for (const candidate of editorCandidates) {
    // 使用配置中的选择器列表
    if (CONFIG.SELECTORS.EDITOR_CANDIDATES.some(selector => candidate.closest(selector))) {
      console.log('找到微信编辑器元素');
      return candidate;
    }
  }
  
  // 如果上述方法都失败，则返回第一个可编辑元素
  if (editorCandidates.length > 0) {
    console.log('未找到特定编辑器，使用第一个可编辑元素');
    return editorCandidates[0];
  }
  
  console.log('未找到任何可编辑元素');
  return null;
}

/**
 * 创建SVG图标元素
 * @param {string} pathData - SVG路径数据
 * @param {string} fill - 填充颜色
 * @param {number} width - 宽度
 * @param {number} height - 高度
 * @returns {SVGElement} 创建的SVG元素
 * @deprecated 使用 ui/components/Icon.js 中的 createIcon 函数替代
 */
export function createSvgIcon(pathData, fill = '#4C4D4E', width = 24, height = 24) {
  const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgIcon.setAttribute('width', width.toString());
  svgIcon.setAttribute('height', height.toString());
  svgIcon.setAttribute('viewBox', '0 0 24 24');
  
  const iconPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  iconPath.setAttribute('fill', fill);
  iconPath.setAttribute('fill-rule', 'evenodd');
  iconPath.setAttribute('d', pathData);
  svgIcon.appendChild(iconPath);
  
  return svgIcon;
}

/**
 * 替换选中内容
 * @param {Node} newNode - 用于替换的新节点
 * @param {Selection} selection - 当前选择对象
 */
export function replaceSelection(newNode, selection) {
  if (!selection) return;
  
  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(newNode);
  
  // 清除选择
  selection.removeAllRanges();
}

/**
 * 应用自定义CSS样式到页面
 * @param {string} cssText - CSS文本
 * @param {string} id - 样式表ID
 */
export function applyCustomCss(cssText, id = 'wx-custom-css') {
  // 先移除已存在的样式表
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // 如果没有CSS文本，则直接返回
  if (!cssText) return;
  
  // 创建新的样式表
  const style = document.createElement('style');
  style.id = id;
  style.textContent = cssText;
  document.head.appendChild(style);
}

/**
 * 获取元素的绝对位置
 * @param {HTMLElement} element - 目标元素
 * @returns {Object} 包含top, left, right, bottom, width, height属性的对象
 */
export function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    right: rect.right + window.scrollX,
    bottom: rect.bottom + window.scrollY,
    width: rect.width,
    height: rect.height
  };
}

/**
 * 查找指定选择器的元素，如果不存在则等待创建
 * @param {string} selector - CSS选择器
 * @param {number} timeout - 超时时间（毫秒）
 * @param {number} interval - 检查间隔（毫秒）
 * @returns {Promise<HTMLElement>} 找到的元素
 */
export function waitForElement(selector, timeout = 5000, interval = 100) {
  return new Promise((resolve, reject) => {
    // 先尝试直接查找
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }
    
    // 设置超时
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error(`等待元素 ${selector} 超时`));
    }, timeout);
    
    // 定期检查
    const intervalId = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        resolve(element);
      }
    }, interval);
  });
}

/**
 * 创建并添加元素
 * @param {string} tag - 标签名
 * @param {Object} attributes - 属性对象
 * @param {string} innerHTML - 内部HTML
 * @param {HTMLElement} parent - 父元素
 * @returns {HTMLElement} 创建的元素
 */
export function createElement(tag, attributes = {}, innerHTML = '', parent = null) {
  const element = document.createElement(tag);
  
  // 设置属性
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      // 处理样式对象
      Object.entries(value).forEach(([prop, val]) => {
        element.style[prop] = val;
      });
    } else if (key === 'classList' && Array.isArray(value)) {
      // 处理类名数组
      value.forEach(cls => element.classList.add(cls));
    } else {
      // 处理普通属性
      element.setAttribute(key, value);
    }
  });
  
  // 设置内部HTML
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }
  
  // 添加到父元素
  if (parent) {
    parent.appendChild(element);
  }
  
  return element;
}
