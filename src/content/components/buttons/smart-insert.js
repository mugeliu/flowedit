// 智能插入按钮组件
import { featureConfig, selectorConfig } from '../../config/index.js';
import { getInitialContent, saveToOriginalEditor, isEditorJSLoaded } from '../../utils/editor.js';
import { hideElements, restoreElements, hideButtonAreaChildren, restoreButtonAreaChildren, createElement, safeQuerySelector } from '../../utils/dom.js';

let editor = null;
let originalDisplayStates = {};
let originalChildrenStates = [];
let controlBar = null;

/**
 * 创建智能插入按钮
 * @returns {HTMLButtonElement}
 */
export function createSmartButton() {
  const btn = createElement('button', {
    className: 'flowedit-btn flowedit-smart-btn',
    textContent: '智能插入'
  });
  
  btn.addEventListener('click', handleSmartButtonClick);
  return btn;
}

/**
 * 处理智能插入按钮点击事件
 */
async function handleSmartButtonClick() {
  if (editor) return;

  const ueditor = document.querySelector(selectorConfig.editor);
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
    
    // 等待DOM元素渲染完成
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 加载并初始化编辑器
    await loadAndInitializeEditor();
    
  } catch (error) {
    console.error('智能插入功能启动失败:', error);
    alert('智能插入功能启动失败');
    restoreOriginal();
  }
}

/**
 * 创建编辑器界面
 * @param {Element} ueditor 原编辑器元素
 */
function createEditorInterface(ueditor) {
  // 创建编辑器容器
  const editorContainer = createElement('div', {
    id: 'smart-editor-container',
    className: 'flowedit-editor-container'
  });
  
  // 查找目标容器 edui1_iframeholder
  const target = safeQuerySelector('#edui1_iframeholder');
  if (target) {
    target.appendChild(editorContainer);
  } else {
    // 如果找不到目标容器，使用原来的插入方式
    ueditor.parentNode.insertBefore(editorContainer, ueditor.nextSibling);
  }

  // 创建编辑器占位元素
  const editorHolder = createElement('div', {
    id: 'editor-holder',
    className: 'flowedit-editor-holder'
  });
  editorContainer.appendChild(editorHolder);

  // 创建控制栏
  createControlBar();
}

/**
 * 创建控制栏
 */
function createControlBar() {
  controlBar = createElement('div', {
    className: 'flowedit-editor-action-bar'
  });

  // 创建保存按钮
  const saveBtn = createElement('button', {
    textContent: '💾 保存',
    className: 'flowedit-editor-save-btn'
  });

  // 创建取消按钮
  const cancelBtn = createElement('button', {
    textContent: '↩️ 取消',
    className: 'flowedit-editor-cancel-btn'
  });

  controlBar.appendChild(saveBtn);
  controlBar.appendChild(cancelBtn);

  // 添加到按钮区域
  const buttonArea = safeQuerySelector(selectorConfig.buttonArea);
  if (buttonArea) {
    buttonArea.appendChild(controlBar);
  } else {
    console.warn('找不到按钮区域，将控制栏添加到body');
    document.body.appendChild(controlBar);
  }

  // 绑定事件
  saveBtn.addEventListener('click', saveContent);
  cancelBtn.addEventListener('click', restoreOriginal);
}

/**
 * 加载并初始化编辑器
 */
async function loadAndInitializeEditor() {
  if (!isEditorJSLoaded()) {
    try {
      await loadEditorJSBundle();
    } catch (error) {
      throw new Error('编辑器加载失败: ' + error.message);
    }
  }
  
  initializeEditor();
}

/**
 * 加载EditorJS Bundle
 */
function loadEditorJSBundle() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage('inject_editorjs_bundle', (response) => {
      if (response && response.status === 'injected') {
        setTimeout(() => {
          if (isEditorJSLoaded()) {
            resolve();
          } else {
            reject(new Error('编辑器脚本加载失败'));
          }
        }, 100);
      } else {
        reject(new Error('编辑器注入失败'));
      }
    });
  });
}

/**
 * 初始化编辑器
 */
function initializeEditor() {
  const config = featureConfig.smartInsert.editor;
  
  // 检查editor-holder元素是否存在
  const holderElement = document.getElementById('editor-holder');
  if (!holderElement) {
    throw new Error('editor-holder元素不存在，请检查DOM结构');
  }
  
  try {
    editor = new EditorJS({
      holder: 'editor-holder',
      tools: {
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: config.tools.header.placeholder,
            levels: config.tools.header.levels,
            defaultLevel: config.tools.header.defaultLevel,
          },
        },
      },
      data: getInitialContent(),
      placeholder: config.placeholder,
    });
    
    // 编辑器样式已在全局样式中定义
    
  } catch (error) {
    console.error('编辑器初始化失败:', error);
    throw error;
  }
}



/**
 * 保存内容
 */
async function saveContent() {
  if (!editor) return;

  try {
    const { blocks } = await editor.save();
    const success = saveToOriginalEditor(blocks);
    
    if (success) {
      alert('内容已保存！');
    } else {
      alert('警告：保存失败，已恢复原状');
    }
  } catch (error) {
    console.error('保存失败:', error);
    alert('保存失败，请查看控制台');
  } finally {
    restoreOriginal();
  }
}

/**
 * 恢复原始状态
 */
function restoreOriginal() {
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

  // 移除编辑器容器
  const editorContainer = document.getElementById('smart-editor-container');
  if (editorContainer) {
    editorContainer.remove();
  }

  // 移除控制栏
  if (controlBar) {
    controlBar.remove();
    controlBar = null;
  }

  // 销毁编辑器
  if (editor) {
    try {
      editor.destroy();
    } catch (error) {
      console.warn('编辑器销毁错误:', error);
    }
    editor = null;
  }
}