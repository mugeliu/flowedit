// 智能编辑器功能管理器
import { selectorConfig } from "../../config/index.js";
import {
  saveToOriginalEditor,
  loadAndInitializeEditor,
  destroyEditor,
} from "../../utils/editor.js";
import { safeQuerySelector } from "../../utils/dom.js";
import { createEditorInterface, removeEditorInterface } from "./interface.js";
import { createEditorControls, removeEditorControls } from "./controls.js";
import { createSmartButton } from "./smart-button.js";

let editor = null;
let controlBar = null;
let smartButton = null;

/**
 * 初始化智能编辑器功能（包括智能按钮）
 */
export function initializeSmartEditor() {
  if (smartButton) {
    console.warn("智能插入按钮功能已经初始化");
    return;
  }

  try {
    smartButton = createSmartButton();
    console.log("智能插入按钮成功");
  } catch (error) {
    console.error("智能编辑器功能初始化失败:", error);
  }
}

/**
 * 激活智能编辑器功能
 * 这是智能插入按钮点击后的主要入口函数
 */
export async function activateSmartEditor() {
  if (editor) {
    console.debug("智能编辑器已经激活");
    return;
  }

  const ueditor = safeQuerySelector(selectorConfig.editorContent);
  if (!ueditor) {
    alert("找不到编辑器容器");
    return;
  }

  try {
    createEditorInterface();

    // 创建控制栏
    controlBar = createEditorControls({
      onSave: saveContent,
      onCancel: deactivateSmartEditor,
    });

    // 等待DOM元素渲染完成
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 加载并初始化编辑器
    editor = await loadAndInitializeEditor("editor-holder");

    // 滚动到编辑器容器位置
    const editorContainer = safeQuerySelector("#header");
    if (editorContainer) {
      // 等待编辑器完全渲染
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      editorContainer.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      console.log('已滚动到智能编辑器位置');
    }

    console.log("智能编辑器激活成功");
  } catch (error) {
    console.error("智能插入功能启动失败:", error);
    alert("智能插入功能启动失败");
    deactivateSmartEditor();
  }
}

/**
 * 停用智能编辑器功能
 * 恢复到原始状态
 */
export function deactivateSmartEditor() {
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

  console.log("智能编辑器已停用");
}

/**
 * 清理智能编辑器功能（包括智能按钮）
 */
export function cleanupSmartEditor() {
  // 先停用编辑器
  deactivateSmartEditor();

  // 清理智能按钮
  if (smartButton && smartButton.cleanup) {
    smartButton.cleanup();
    smartButton = null;
    console.log("智能编辑器功能已清理");
  }
}

/**
 * 保存编辑器内容
 * @param {Object} options 保存选项
 */
async function saveContent(options = {}) {
  if (!editor) {
    console.error("编辑器未初始化");
    return;
  }

  try {
    const outputData = await editor.save();
    console.log("保存的数据:", outputData);

    // 直接保存内容，使用解析器生成HTML
    const success = await saveToOriginalEditor(outputData.blocks, {
      ...options,
    });

    if (success) {
      console.log("内容已成功保存到原编辑器");
    } else {
      console.error("保存到原编辑器失败");
    }
  } catch (error) {
    console.error("保存失败:", error);
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

/**
 * 获取智能按钮实例
 * @returns {Object|null} 智能按钮实例
 */
export function getSmartButton() {
  return smartButton;
}
