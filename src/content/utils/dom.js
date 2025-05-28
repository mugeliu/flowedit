// DOM操作工具函数模块
// 负责处理DOM元素查找、创建和操作

/**
 * 查找编辑器元素
 * @returns {HTMLElement|null} 找到的编辑器元素或null
 */
export function findEditor() {
  // 尝试查找ProseMirror编辑器
  const proseMirrorEditor = document.querySelector('.ProseMirror[contenteditable="true"]');
  if (proseMirrorEditor) {
    console.log('找到ProseMirror编辑器');
    return proseMirrorEditor;
  }
  
  // 检查iframe中的编辑器
  const iframes = document.querySelectorAll('iframe');
  for (const iframe of iframes) {
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
      const iframeEditor = iframeDocument.querySelector('.ProseMirror[contenteditable="true"]') || 
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
    if (candidate.closest('.edui-editor-body') || 
        candidate.closest('.rich_media_content') || 
        candidate.closest('.editor') || 
        candidate.closest('.js_editor_area') || 
        candidate.closest('.view.rich_media_content') || 
        candidate.closest('#ueditor_0')) {
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
  // 移除旧的样式表
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  if (!cssText) return;
  
  // 创建新的样式表
  const styleElement = document.createElement('style');
  styleElement.id = id;
  styleElement.textContent = cssText;
  document.head.appendChild(styleElement);
}

/**
 * 获取元素的绝对位置
 * @param {HTMLElement} element - 目标元素
 * @returns {Object} 包含top和left属性的对象
 */
export function getElementPosition(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height
  };
}
