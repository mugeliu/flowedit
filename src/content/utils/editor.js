// 编辑器相关工具函数
import { convertToHtml } from "../../shared/services/parsers/index.js";
import { renderPreviewContent } from "../features/sidebar/preview.js";
import { callEditorAPI } from "../services/editor-bridge.js";
import { createLogger } from "../../shared/services/logger.js";
import { createWeChatImageUploader } from "./custom-wechat-image-tool.js";

// 创建模块日志器
const logger = createLogger('EditorUtils');

// ===========================================
// 内联的EditorJS配置
// ===========================================

/**
 * 标题工具图标资源
 */
const EDITOR_ICONS = {
  h1: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19 17V10.2135C19 10.1287 18.9011 10.0824 18.836 10.1367L16 12.5"/>
  </svg>`,
  h2: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10 19 9.5 19 12C19 13.9771 16.0684 13.9997 16.0012 16.8981C15.9999 16.9533 16.0448 17 16.1 17L19.3 17"/>
  </svg>`,
  h3: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
    <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10.5 16.8323 10 17.6 10C18.3677 10 19.5 10.311 19.5 11.5C19.5 12.5315 18.7474 12.9022 18.548 12.9823C18.5378 12.9864 18.5395 13.0047 18.5503 13.0063C18.8115 13.0456 20 13.3065 20 14.8C20 16 19.5 17 17.8 17C17.8 17 16 17 16 16.3"/>
  </svg>`
};

/**
 * EditorJS配置（优化版本 - 直接引用工具类）
 */
const createEditorConfiguration = () => ({
  // 基础设置
  placeholder: "开始编写内容...",
  autofocus: true,
  minHeight: 500,
  logLevel: "WARN",

  // 工具配置 - 直接引用工具类
  tools: {
    paragraph: {
      class: window.EditorJS.Paragraph,
      inlineToolbar: true,
    },
    header: {
      class: window.EditorJS.Header,
      config: {
        levels: [1, 2, 3],
        defaultLevel: 1,
        placeholder: "请输入标题",
      },
      toolbox: [
        { title: "标题 1", icon: EDITOR_ICONS.h1, data: { level: 1 } },
        { title: "标题 2", icon: EDITOR_ICONS.h2, data: { level: 2 } },
        { title: "标题 3", icon: EDITOR_ICONS.h3, data: { level: 3 } },
      ],
    },
    quote: {
      class: window.EditorJS.Quote,
      inlineToolbar: true,
      config: {
        quotePlaceholder: "输入引用内容",
        captionPlaceholder: "引用来源",
      },
    },
    image: {
      class: window.EditorJS.ImageTool,
      config: {
        types: "image/gif,image/jpeg,image/jpg,image/png,image/svg,image/webp",
        captionPlaceholder: "图片描述",
        buttonContent: "选择图片或素材库插入",
        features: {
          caption: true,
          withBorder: true,
          withBackground: true,
          stretched: true,
        },
        uploader: createWeChatImageUploader(),
      },
    },
    list: {
      class: window.EditorJS.List,
      inlineToolbar: true,
      config: {
        defaultStyle: "unordered",
        maxLevel: 5,
      },
    },
    delimiter: { class: window.EditorJS.Delimiter },
    raw: { class: window.EditorJS.Raw },
    code: { class: window.EditorJS.Code },
    marker: { class: window.EditorJS.Marker },
    inlineCode: { class: window.EditorJS.InlineCode },
    underline: { class: window.EditorJS.Underline },
  },
});

/**
 * 创建通用的onChange处理器
 * @returns {Function} onChange处理器函数
 */
function createEditorOnChangeHandler() {
  return async (editorAPI, changeEvent) => {
    try {
      const savedEditorData = await editorAPI.saver.save();
      const htmlContentForPreview = await convertToHtml(savedEditorData);
      await renderPreviewContent(htmlContentForPreview);
    } catch (error) {
      logger.error("预览内容生成失败", error);
      await renderPreviewContent("");
    }
  };
}


/**
 * 标准化初始数据格式
 * @param {Object|null} rawInitialData - 原始初始数据
 * @returns {Object|null} 标准化的EditorJS数据格式
 */
function normalizeInitialEditorData(rawInitialData) {
  if (!rawInitialData) return null;
  
  // 检查各种可能的数据结构并返回标准格式
  if (rawInitialData.content?.blocks) {
    // 文章存储格式：{ content: { blocks: [...] } }
    return rawInitialData.content;
  }
  
  if (rawInitialData.editorData?.blocks) {
    // 直接传入的EditorJS格式：{ editorData: { blocks: [...] } }
    return rawInitialData.editorData;
  }
  
  if (rawInitialData.blocks) {
    // 直接EditorJS格式：{ blocks: [...] }
    return rawInitialData;
  }
  
  return null;
}

// 全局编辑器状态管理
let isEditorActive = false;

/**
 * 创建通用的编辑器 onReady 处理器
 * @param {HTMLElement} holderElement - 编辑器容器元素
 * @returns {Function} onReady 处理器函数
 */
function createOnReadyHandler(holderElement) {
  return function() {
    // 这里的 this 指向 EditorJS 实例
    const editorInstance = this;
    
    // 1. 初始化时滚动到顶部
    window.scrollTo({ top: 0, behavior: "auto" });

    // 2. 自动滚动逻辑 - 确保当前输入位置始终可见
    const autoScrollToCaret = () => {
      const selection = window.getSelection();
    
      if (!selection || selection.rangeCount === 0) return;
    
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
    
      if (rect && rect.top !== 0) {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
        // 将光标位置滚动到视窗中央
        const targetScroll = scrollTop + rect.top - viewportHeight / 2;
    
        window.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
      }
    };

    // 3. 为 loadAndInitializeEditor 添加输入监听
    if (editorInstance.ui.nodes.redactor) {
      editorInstance.ui.nodes.redactor.addEventListener("input", () => {
        setTimeout(autoScrollToCaret, 50); // 延迟确保DOM更新完成
      });

      editorInstance.ui.nodes.redactor.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          setTimeout(autoScrollToCaret, 100); // 回车后稍长延迟确保新区块创建
        }
      });
    }

    // 4. 为 loadAndInitializeEditorWithData 添加事件监听
    if (holderElement) {
      holderElement.addEventListener("keyup", autoScrollToCaret);
      holderElement.addEventListener("click", autoScrollToCaret);
    }
  };
}

/**
 * 加载样式模板
 * @returns {Promise<Object>} 样式模板对象
 */
export async function loadStyleTemplate() {
  try {
    logger.info('获取当前模板用于内容渲染');
    
    // 直接从存储读取当前模板
    const result = await chrome.storage.local.get(['currentTemplate', 'currentTemplateId']);
    
    if (result.currentTemplate) {
      logger.info(`使用模板: ${result.currentTemplateId}`);
      return result.currentTemplate;
    }
    
    // 降级处理：如果存储中没有模板，加载默认模板
    logger.warn('存储中没有模板，加载默认模板');
    const response = await fetch(chrome.runtime.getURL("assets/templates/default.json"));
    
    if (!response.ok) {
      throw new Error(`加载默认模板失败: ${response.status}`);
    }
    
    const defaultTemplate = await response.json();
    
    // 存储默认模板到storage，避免下次再次加载
    await chrome.storage.local.set({
      currentTemplateId: 'default',
      currentTemplate: defaultTemplate
    });
    
    return defaultTemplate;
  } catch (error) {
    logger.error("加载样式模板失败", error);
    throw error;
  }
}

/**
 * 将EditorJS数据保存到微信编辑器
 * @param {Object} editorDataToSave - EditorJS数据对象
 * @param {Object} saveOptions - 保存选项
 * @param {string} saveOptions.apiName - API名称
 * @param {Object} saveOptions.apiParam - API参数对象
 * @param {string} saveOptions.contentField - HTML内容字段名，默认为'content'
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveToOriginalEditor(editorDataToSave, saveOptions = {}) {
  try {
    // 生成HTML内容（parsers内部处理模板加载）
    const generatedHTMLContent = await convertToHtml(editorDataToSave);

    // 提取API配置
    const weChatAPIName = saveOptions.apiName || "mp_editor_set_content";
    const htmlContentFieldName = saveOptions.contentField || "content";

    // 构建API调用参数
    const apiCallParameters = {
      ...saveOptions.apiParam,
      [htmlContentFieldName]: generatedHTMLContent,
    };

    // 调用微信编辑器API
    return new Promise((resolve) => {
      callEditorAPI(weChatAPIName, apiCallParameters, (isSuccessful, apiResponse) => {
        if (isSuccessful) {
          logger.debug(`API ${weChatAPIName} 调用成功`, apiResponse);
          resolve(true);
        } else {
          logger.error(`API ${weChatAPIName} 调用失败`, apiResponse);
          resolve(false);
        }
      });
    });
  } catch (error) {
    logger.error("保存到微信编辑器失败", error);
    return false;
  }
}

/**
 * 统一的编辑器初始化函数（合并了两个原有函数）
 * @param {string} containerElementId - 编辑器容器ID
 * @param {Object|null} initialDataForEditor - 初始数据（可选）
 * @returns {Promise<Object>} EditorJS实例
 */
export async function initializeEditor(containerElementId, initialDataForEditor = null) {
  const containerElement = document.getElementById(containerElementId);
  if (!containerElement) {
    throw new Error(`容器元素 '${containerElementId}' 不存在，请检查DOM结构`);
  }

  // 获取基础配置
  const baseEditorConfig = createEditorConfiguration();
  
  // 构建最终配置
  const finalEditorConfiguration = {
    holder: containerElement,
    ...baseEditorConfig,
    onChange: createEditorOnChangeHandler(),
    // onReady 将在创建实例后设置
  };

  // 如果提供了初始数据，则添加到配置中
  const normalizedInitialData = normalizeInitialEditorData(initialDataForEditor);
  if (normalizedInitialData?.blocks) {
    finalEditorConfiguration.data = normalizedInitialData;
    logger.debug("加载初始数据到编辑器", normalizedInitialData);
  }

  // 创建编辑器实例
  const editorInstance = new EditorJS(finalEditorConfiguration);

  // 按照官方文档的方法，在创建实例后设置 onReady
  editorInstance.isReady.then(() => {
    // 按照官方文档的标准用法初始化DragDrop
    if (window.EditorJS?.DragDrop) {
      try {
        new window.EditorJS.DragDrop(editorInstance);
        logger.debug("DragDrop插件初始化成功");
      } catch (error) {
        logger.debug("DragDrop插件初始化失败:", error?.message || error);
      }
    }
    
    // 执行其他onReady逻辑（滚动处理等）
    createOnReadyHandler(containerElement).call(editorInstance);
  }).catch((error) => {
    logger.error("编辑器初始化失败:", error);
  });

  return editorInstance;
}

// 为了保持向后兼容，提供别名函数
export const loadAndInitializeEditor = initializeEditor;
export const loadAndInitializeEditorWithData = initializeEditor;

/**
 * 销毁编辑器实例并清理资源
 * @param {Object} editorInstanceToDestroy - EditorJS实例
 */
export function destroyEditor(editorInstanceToDestroy) {
  if (editorInstanceToDestroy) {
    try {
      editorInstanceToDestroy.destroy();
    } catch (error) {
      logger.warn("编辑器销毁时发生错误", error);
    }
  }
}

/**
 * 设置智能编辑器的激活状态
 * @param {boolean} isActive - 是否激活
 */
export function setEditorActiveState(isActive) {
  isEditorActive = isActive;
}

/**
 * 检查智能编辑器是否处于激活状态
 * @returns {boolean} 是否激活
 */
export function isSmartEditorActive() {
  return isEditorActive;
}
