// 智能编辑器界面管理
import { createElement, safeQuerySelector } from '../../utils/dom.js';
import { selectorConfig } from '../../config/index.js';

/**
 * 创建编辑器界面
 * @param {Element} ueditor 原编辑器元素
 */
export function createEditorInterface(ueditor) {
  // 创建编辑器容器
  const editorContainer = createElement('div', {
    id: 'smart-editor-container',
    className: 'flowedit-editor-container'
  });
  
  // 查找目标容器 edui1_iframeholder
  const target = safeQuerySelector(selectorConfig.editorWrapper);
  if (target) {
    target.appendChild(editorContainer);
  } else {
    // 如果找不到目标容器，将editorContainer元素插入到id="ueditor_0"的子元素上
    const ueditorElement = safeQuerySelector(selectorConfig.ueditor);
    if (ueditorElement) {
      ueditorElement.appendChild(editorContainer);
      console.log('找不到目标容器，将editorContainer插入到#ueditor_0的子元素上');
    } else {
      console.error('无法找到合适的容器来插入智能编辑器，请检查页面结构');
      throw new Error('无法找到合适的容器来插入智能编辑器');
    }
  }

  // 创建编辑器占位元素
  const editorHolder = createElement('div', {
    id: 'editor-holder',
    className: 'flowedit-editor-holder'
  });
  editorContainer.appendChild(editorHolder);
  
  console.log('智能编辑器界面创建完成');
}

/**
 * 移除编辑器界面
 */
export function removeEditorInterface() {
  const editorContainer = document.getElementById('smart-editor-container');
  if (editorContainer) {
    editorContainer.remove();
    console.log('智能编辑器界面已移除');
  }
}

/**
 * 获取编辑器容器元素
 * @returns {Element|null} 编辑器容器元素
 */
export function getEditorContainer() {
  return document.getElementById('smart-editor-container');
}

/**
 * 获取编辑器占位元素
 * @returns {Element|null} 编辑器占位元素
 */
export function getEditorHolder() {
  return document.getElementById('editor-holder');
}