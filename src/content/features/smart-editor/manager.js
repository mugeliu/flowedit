// 智能编辑器功能管理器
import { featureConfig, selectorConfig } from '../../config/index.js';
import { saveToOriginalEditor, loadAndInitializeEditor, destroyEditor } from '../../utils/editor.js';
import { hideElements, restoreElements, hideButtonAreaChildren, restoreButtonAreaChildren, createElement, safeQuerySelector } from '../../utils/dom.js';
import { createEditorInterface, removeEditorInterface } from './interface.js';
import { createEditorControls, removeEditorControls } from './controls.js';

let editor = null;
let originalDisplayStates = {};
let originalChildrenStates = [];
let controlBar = null;

/**
 * 激活智能编辑器功能
 * 这是智能插入按钮点击后的主要入口函数
 */
export async function activateSmartEditor() {
  if (editor) {
    console.warn('智能编辑器已经激活');
    return;
  }

  const ueditor = safeQuerySelector(selectorConfig.editor);
  if (!ueditor) {
    alert('找不到编辑器容器');
    return;
  }

  try {
    // 隐藏原有区域
    const elementsToHide = ['ueditor_0', 'article_setting_area'];
    originalDisplayStates = hideElements(elementsToHide);
    
    // 隐藏按钮区域的子元素
    originalChildrenStates = hideButtonAreaChildren();

    // 创建编辑器界面
    createEditorInterface(ueditor);
    
    // 创建控制栏
    controlBar = createEditorControls({
      onSave: saveContent,
      onCancel: deactivateSmartEditor
    });
    
    // 等待DOM元素渲染完成
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 加载并初始化编辑器
    editor = await loadAndInitializeEditor('editor-holder');
    
    console.log('智能编辑器激活成功');
    
  } catch (error) {
    console.error('智能插入功能启动失败:', error);
    alert('智能插入功能启动失败');
    deactivateSmartEditor();
  }
}

/**
 * 停用智能编辑器功能
 * 恢复到原始状态
 */
export function deactivateSmartEditor() {
  // 恢复按钮区域子元素
  if (originalChildrenStates.length > 0) {
    restoreButtonAreaChildren(originalChildrenStates);
    originalChildrenStates = [];
  }

  // 恢复隐藏的元素
  if (Object.keys(originalDisplayStates).length > 0) {
    restoreElements(originalDisplayStates);
    originalDisplayStates = {};
  }

  // 移除编辑器界面
  removeEditorInterface();

  // 移除控制栏
  if (controlBar) {
    removeEditorControls(controlBar);
    controlBar = null;
  }

  // 销毁编辑器
  if (editor) {
    destroyEditor(editor);
    editor = null;
  }
  
  console.log('智能编辑器已停用');
}

/**
 * 保存编辑器内容
 * @param {Object} options 保存选项
 */
async function saveContent(options = {}) {
  if (!editor) {
    console.error('编辑器未初始化');
    return;
  }

  try {
    const outputData = await editor.save();
    console.log('保存的数据:', outputData);
    
    // 直接保存内容，样式已在系统初始化时加载
    const success = await saveToOriginalEditor(outputData.blocks, {
      usePreloadedStyles: true, // 使用预加载的样式
      ...options
    });
    
    if (success) {
      console.log('内容已成功保存到原编辑器');
    } else {
      console.error('保存到原编辑器失败');
    }
  } catch (error) {
    console.error('保存失败:', error);
  } finally {
    deactivateSmartEditor();
  }
}

/**
 * 获取当前编辑器实例
 * @returns {Object|null} 编辑器实例
 */
export function getCurrentEditor() {
  return editor;
}

/**
 * 检查智能编辑器是否处于激活状态
 * @returns {boolean} 是否激活
 */
export function isSmartEditorActive() {
  return editor !== null;
}