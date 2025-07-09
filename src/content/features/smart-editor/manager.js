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
import {
  enableAdditionObserver,
  disableAdditionObserver,
} from "../../services/dom-watcher.js";
import { storage } from "../../utils/storage/index.js";

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

    // 启用独立监听器
    enableAdditionObserver();

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

  // 禁用独立监听器
  disableAdditionObserver();

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
    
    // 先保存到本地存储
    await saveToLocalStorage(outputData);

    // 使用mp_editor_set_content API保存内容
    const success = await saveToOriginalEditor(outputData, {
      ...options,
      apiName: "mp_editor_set_content",
      apiParam: {},
      contentField: "content",
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
 * 保存到本地存储
 * @param {Object} editorData - EditorJS数据
 */
async function saveToLocalStorage(editorData) {
  try {
    console.log("正在保存文章到本地存储...");
    
    // 生成文章标题（从内容中提取或使用默认标题）
    const title = extractTitleFromContent(editorData) || `文章_${new Date().toLocaleDateString()}`;
    
    // 保存文章
    const result = await storage.saveArticle(editorData, {
      title: title,
      status: 'published' // 标记为已发布
    });
    
    if (result.success) {
      console.log(`文章已保存到本地存储: ${result.article.title} (${result.articleId})`);
      
      // 显示保存成功提示（可选）
      showSaveNotification(`文章《${result.article.title}》已保存`, 'success');
    } else {
      console.error("保存到本地存储失败:", result.error);
      showSaveNotification("保存到本地存储失败", 'error');
    }
  } catch (error) {
    console.error("保存到本地存储时发生错误:", error);
    showSaveNotification("保存到本地存储时发生错误", 'error');
  }
}

/**
 * 从EditorJS内容中提取标题
 * @param {Object} editorData - EditorJS数据
 * @returns {string|null} 提取的标题
 */
function extractTitleFromContent(editorData) {
  if (!editorData.blocks || editorData.blocks.length === 0) {
    return null;
  }
  
  // 查找第一个header或paragraph块作为标题
  const titleBlock = editorData.blocks.find(block => 
    ['header', 'paragraph'].includes(block.type) && 
    block.data?.text?.trim()
  );
  
  if (titleBlock) {
    // 移除HTML标签并截断
    const title = titleBlock.data.text.replace(/<[^>]*>/g, '').trim();
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  }
  
  return null;
}

/**
 * 显示保存通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 ('success', 'error', 'info')
 */
function showSaveNotification(message, type = 'info') {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
  `;
  
  // 根据类型设置样式
  switch (type) {
    case 'success':
      notification.style.backgroundColor = '#f0f9ff';
      notification.style.color = '#1e40af';
      notification.style.border = '1px solid #93c5fd';
      break;
    case 'error':
      notification.style.backgroundColor = '#fef2f2';
      notification.style.color = '#dc2626';
      notification.style.border = '1px solid #fca5a5';
      break;
    default:
      notification.style.backgroundColor = '#f8fafc';
      notification.style.color = '#475569';
      notification.style.border = '1px solid #e2e8f0';
  }
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // 3秒后自动消失
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 3000);
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
        isSelect: options.isSelect || false,
      },
      contentField: "html",
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
