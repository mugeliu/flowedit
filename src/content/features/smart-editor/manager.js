// 智能编辑器功能管理器
import { selectorConfig } from "../../config/index.js";
import {
  saveToOriginalEditor,
  loadAndInitializeEditor,
  loadAndInitializeEditorWithData,
  destroyEditor,
  setEditorActiveState,
} from "../../utils/editor.js";
import { safeQuerySelector } from "../../utils/dom.js";
import { initializeEditorUI, cleanupEditorUI } from "./editor-ui.js";
import { createSmartButton } from "./smart-button.js";
import {
  enableAdditionObserver,
  disableAdditionObserver,
} from "../../services/dom-monitor.js";
import { storage } from "../../utils/storage/index.js";
import { showErrorToast, showSuccessToast } from "../../utils/toast.js";

let editor = null;
let uiElements = null;
let smartButton = null;
let currentEditingArticleId = null; // 当前编辑的文章ID

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
 * @param {Object} initialData - 可选的初始数据
 */
export async function activateSmartEditor(initialData = null) {
  if (editor) {
    console.debug("智能编辑器已经激活");
    return;
  }

  // 记录当前编辑的文章ID（如果是编辑历史文章）
  if (initialData && initialData.id) {
    currentEditingArticleId = initialData.id;
    console.log("开始编辑历史文章:", currentEditingArticleId);
  } else {
    currentEditingArticleId = null;
    console.log("创建新文章");
  }

  const ueditor = safeQuerySelector(selectorConfig.editorContent);
  if (!ueditor) {
    showErrorToast("找不到编辑器容器");
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
    if (initialData) {
      editor = await loadAndInitializeEditorWithData("flow-editorjs-container", initialData);
    } else {
      editor = await loadAndInitializeEditor("flow-editorjs-container");
    }

    // 设置编辑器激活状态
    setEditorActiveState(true);

    // 启用独立监听器
    enableAdditionObserver();

    console.log("智能编辑器激活成功");
  } catch (error) {
    console.error("智能插入功能启动失败:", error);
    showErrorToast("智能插入功能启动失败");
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

  // 清理当前编辑的文章ID
  currentEditingArticleId = null;

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
    
    if (currentEditingArticleId) {
      // 更新现有文章
      console.log("更新现有文章:", currentEditingArticleId);
      
      const result = await storage.updateArticle(currentEditingArticleId, editorData, {
        status: 'published' // 标记为已发布
      });
      
      if (result.success) {
        console.log(`文章已更新: ${result.article.title} (${currentEditingArticleId})`);
        showSuccessToast(`文章《${result.article.title}》已更新`);
      } else {
        console.error("更新文章失败:", result.error);
        showErrorToast("更新文章失败");
      }
    } else {
      // 创建新文章
      console.log("创建新文章");
      
      // 生成文章标题（从内容中提取或使用默认标题）
      const title = extractTitleFromContent(editorData) || `文章_${new Date().toLocaleDateString()}`;
      
      const result = await storage.saveArticle(editorData, {
        title: title,
        status: 'published' // 标记为已发布
      });
      
      if (result.success) {
        console.log(`新文章已保存: ${result.article.title} (${result.articleId})`);
        showSuccessToast(`文章《${result.article.title}》已保存`);
        
        // 更新当前编辑的文章ID，以便后续保存时更新而不是新建
        currentEditingArticleId = result.articleId;
      } else {
        console.error("保存新文章失败:", result.error);
        showErrorToast("保存文章失败");
      }
    }
  } catch (error) {
    console.error("保存到本地存储时发生错误:", error);
    showErrorToast("保存到本地存储时发生错误");
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
 * 获取当前编辑器实例
 * @returns {Object|null} 编辑器实例
 */
export function getCurrentEditor() {
  return editor;
}
