// 智能编辑器功能管理器
import { selectorConfig } from "../../config/index.js";
import {
  saveToOriginalEditor,
  loadAndInitializeEditor,
  destroyEditor,
  setEditorActiveState,
} from "../../utils/editor.js";
import { safeQuerySelector } from "../../utils/dom.js";
import { initializeEditorUI, cleanupEditorUI } from "./editor-ui.js";
import { createSmartButton } from "./smart-button.js";

let editor = null;
let uiElements = null;
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
    // 初始化编辑器UI（包括页面和工具栏）
    uiElements = initializeEditorUI({
      callbacks: {
        onSave: saveContent,
        onCancel: deactivateSmartEditor,
      },
    });

    if (!uiElements) {
      throw new Error("编辑器UI初始化失败");
    }

    // 加载并初始化编辑器
    editor = await loadAndInitializeEditor("flow-editorjs-container");

    // 设置编辑器激活状态
    setEditorActiveState(true);

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
  // 清理编辑器UI
  if (uiElements) {
    cleanupEditorUI(uiElements);
    uiElements = null;
  }

  // 销毁编辑器
  if (editor) {
    destroyEditor(editor);
    editor = null;
  }

  // 重置编辑器激活状态
  setEditorActiveState(false);

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
  
    // 使用mp_editor_set_content API保存内容
    const success = await saveToOriginalEditor(outputData, {
      ...options,
      apiName: "mp_editor_set_content",
      apiParam: {},
      contentField: "content"
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


//  todo 插入功能不完善先注释
/**
 * 插入内容到编辑器
 * @param {Object} options 插入选项
 */
async function insertContent(options = {}) {
  if (!editor) {
    console.error("编辑器未初始化");
    return;
  }

  try {
    const outputData = await editor.save();
    console.log("插入的数据:", outputData);

    // 使用mp_editor_insert_html API插入内容
    const success = await saveToOriginalEditor(outputData, {
      ...options,
      apiName: "mp_editor_insert_html",
      apiParam: {
        isSelect: options.isSelect || false
      },
      contentField: "html"
    });

    if (success) {
      console.log("内容已成功插入到原编辑器");
    } else {
      console.error("插入到原编辑器失败");
    }
  } catch (error) {
    console.error("插入失败:", error);
  } finally {
    deactivateSmartEditor();
  }
}

/**
 * 获取当前编辑器实例
 * 获取当前编辑器实例
 * @returns {Object|null} 编辑器实例
 */
export function getCurrentEditor() {
  return editor;
}
