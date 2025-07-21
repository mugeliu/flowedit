// 智能编辑器功能管理器
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
  enableImageMonitor,
  disableImageMonitor,
} from "../../services/dom-monitor.js";
import { storage } from "../../../shared/services/storage/index.js";
import { showErrorToast, showSuccessToast } from "../../utils/toast.js";
import { createLogger } from "../../../shared/services/logger.js";

// 创建模块日志器
const logger = createLogger('SmartEditorManager');

let editor = null;
let uiElements = null;
let smartButton = null;
let currentEditingArticleId = null; // 当前编辑的文章ID

/**
 * 初始化智能编辑器功能（包括智能按钮）
 */
export function initializeSmartEditor() {
  if (smartButton) {
  logger.warn("智能插入按钮功能已经初始化");
    return;
  }

  try {
    smartButton = createSmartButton();
    logger.info("智能插入按钮成功");
  } catch (error) {
    logger.error("智能编辑器功能初始化失败:", error);
  }
}

/**
 * 激活智能编辑器功能
 * 这是智能插入按钮点击后的主要入口函数
 * @param {Object} initialData - 可选的初始数据
 */
export async function activateSmartEditor(initialData = null) {
  if (editor) {
    logger.debug("智能编辑器已经激活");
    return;
  }

  // 记录当前编辑的文章ID（如果是编辑历史文章）
  if (initialData && initialData.id) {
    currentEditingArticleId = initialData.id;
    logger.info("开始编辑历史文章:", currentEditingArticleId);
  } else {
    currentEditingArticleId = null;
    logger.info("创建新文章");
  }

  const ueditor = safeQuerySelector('div[contenteditable="true"].ProseMirror');
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
        onInsert: insertContent,
      },
    });

    if (!uiElements) {
      throw new Error("编辑器UI初始化失败");
    }

    // 等待DOM更新完成
    await new Promise(resolve => setTimeout(resolve, 10));

    // 加载并初始化编辑器
    if (initialData) {
      editor = await loadAndInitializeEditorWithData("flow-editorjs-container", initialData);
    } else {
      editor = await loadAndInitializeEditor("flow-editorjs-container");
    }

    // 设置编辑器激活状态
    setEditorActiveState(true);

    // 启用图片监听器
    enableImageMonitor();

    logger.info("智能编辑器激活成功");
  } catch (error) {
    logger.error('智能编辑器激活失败:', error);
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

  // 禁用图片监听器
  disableImageMonitor();

  logger.info("智能编辑器已停用");
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
    logger.info("智能编辑器功能已清理");
  }
}

/**
 * 插入编辑器内容到微信编辑器
 */
async function insertContent() {
  if (!editor) {
    showErrorToast("编辑器未初始化");
    return;
  }

  try {
    const outputData = await editor.save();
    
    // 检查是否有内容
    if (!outputData.blocks || outputData.blocks.length === 0) {
      showErrorToast("没有内容可以插入");
      return;
    }

    // 使用现有的 saveToOriginalEditor 函数，但改为插入API
    const success = await saveToOriginalEditor(outputData, {
      apiName: "mp_editor_insert_html",
      apiParam: {
        isSelect: false
      },
      contentField: "html",
    });

    if (success) {
      logger.info("内容插入成功");
      showSuccessToast("内容已插入到微信编辑器");
      
      // 插入成功后关闭编辑器，回到原始页面
      deactivateSmartEditor();
    } else {
      logger.error("内容插入失败");
      showErrorToast("插入内容失败");
    }
    
  } catch (error) {
    logger.error("插入内容时发生错误:", error);
    showErrorToast("插入内容失败");
  }
}

/**
 * 保存编辑器内容
 * @param {Object} options 保存选项
 */
async function saveContent(options = {}) {
  if (!editor) {
    logger.error("编辑器未初始化");
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
      logger.info("内容已成功保存到原编辑器");
    } else {
      logger.error("保存到原编辑器失败");
    }
  } catch (error) {
    logger.error("保存失败:", error);
  } finally {
    deactivateSmartEditor();
  }
}

/**
 * 保存编辑器内容到本地存储（使用共享的storage服务）
 * @param {Object} editorData - EditorJS数据
 */
async function saveToLocalStorage(editorData) {
  try {
    logger.info("正在保存文章到本地存储...");
    
    const result = await storage.saveOrUpdateArticle(editorData, {
      articleId: currentEditingArticleId,
      status: 'published'
    });
    
    if (result.success) {
      const action = currentEditingArticleId ? '更新' : '保存';
      const articleTitle = result.article.title;
      
      logger.info(`文章已${action}: ${articleTitle} (${result.articleId || currentEditingArticleId})`);
      showSuccessToast(`文章《${articleTitle}》已${action}`);
      
      // 更新当前编辑的文章ID，以便后续保存时更新而不是新建
      if (!currentEditingArticleId && result.articleId) {
        currentEditingArticleId = result.articleId;
      }
    } else {
      logger.error("保存文章失败:", result);
      
      // 根据错误类型显示不同的提示
      if (result.error === 'QUOTA_EXCEEDED') {
        showErrorToast(result.message || "存储空间不足，请清理部分旧文章后重试");
      } else {
        showErrorToast(result.message || "保存文章失败");
      }
    }
  } catch (error) {
    logger.error("保存到本地存储时发生错误:", error);
    showErrorToast("保存到本地存储时发生错误");
  }
}

/**
 * 获取当前编辑器实例
 * @returns {Object|null} 编辑器实例
 */
export function getCurrentEditor() {
  return editor;
}
