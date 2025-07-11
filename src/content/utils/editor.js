// 编辑器相关工具函数
import { editorConfig } from "../config/index.js";
import { convertToHtml } from "./parsers/index.js";
import { renderPreviewContent } from "../features/sidebar/preview.js";
import { callEditorAPI } from "../services/editor-bridge.js";
import { createLogger } from '../services/simple-logger.js';

// 创建模块日志器
const logger = createLogger('EditorUtils');

// 全局编辑器状态管理
let isEditorActive = false;

/**
 * 初始化 DragDrop 插件
 * @param {Object} editorInstance - EditorJS 实例
 */
function initializeDragDrop(editorInstance) {
  // 检查 DragDrop 插件是否可用
  const DragDrop = window.EditorJS?.DragDrop;
  
  if (DragDrop) {
    try {
      new DragDrop(editorInstance);
      logger.debug("DragDrop插件初始化成功");
    } catch (error) {
      logger.warn("DragDrop插件初始化失败:", error);
    }
  } else {
    logger.debug("DragDrop插件不可用");
  }
}

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
    const templateResponse = await fetch(
      chrome.runtime.getURL("assets/style-template.json")
    );
    const styleTemplate = await templateResponse.json();
    return styleTemplate;
  } catch (error) {
    logger.error("加载样式模板失败", error);
    throw error;
  }
}

/**
 * 将EditorJS数据保存到原编辑器
 * @param {Array} blocks - EditorJS块数据
 * @param {Object} options - 保存选项
 * @param {string} options.targetSelector - 目标编辑器选择器
 * @param {boolean} options.append - 是否追加内容
 * @param {string} options.insertPosition - 插入位置 ('start', 'end', 'cursor')
 * @param {Object} options.styleOptions - 样式选项
 * @param {boolean} options.usePreloadedStyles - 是否使用预加载的样式
 * @param {string} options.apiName - API名称
 * @param {Object} options.apiParam - API参数对象，会将htmlContent注入到指定字段
 * @param {string} options.contentField - HTML内容在apiParam中的字段名，默认为 'content'
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveToOriginalEditor(editorData, options = {}) {
  try {
    // 加载样式模板
    const styleTemplate = await loadStyleTemplate();

    // 使用HTML解析器生成HTML内容
    const htmlContent = convertToHtml(editorData, styleTemplate);

    // 从options中获取API配置
    const apiName = options.apiName || "mp_editor_set_content";
    const contentField = options.contentField || "content";

    // 构建API参数，将HTML内容注入到指定字段
    const apiParam = {
      ...options.apiParam,
      [contentField]: htmlContent,
    };

    // 使用编辑器桥接服务调用API
    return new Promise((resolve) => {
      callEditorAPI(apiName, apiParam, (success, res) => {
        if (success) {
          logger.debug(`API ${apiName} 调用成功`, res);
          resolve(true);
        } else {
          logger.error(`API ${apiName} 调用失败`, res);
          resolve(false);
        }
      });
    });
  } catch (error) {
    logger.error("保存到原编辑器失败", error);
    return false;
  }
}

/**
 * 加载并初始化编辑器
 * @param {string} container 编辑器容器ID或元素
 * @returns {Promise<Object>} EditorJS实例
 */
export async function loadAndInitializeEditor(container) {
  const holderElement = document.getElementById(container);
  if (!holderElement) {
    throw new Error(`${container}元素不存在，请检查DOM结构`);
  }

  // 解析配置中的工具类引用
  const resolvedTools = {};
  for (const [toolName, toolConfig] of Object.entries(editorConfig.tools)) {
    if (typeof toolConfig.class === "string") {
      // 将字符串类名解析为实际的类引用
      resolvedTools[toolName] = {
        ...toolConfig,
        class: EditorJS[toolConfig.class],
      };
    } else {
      resolvedTools[toolName] = toolConfig;
    }
  }

  const editorInstance = new EditorJS({
    holder: holderElement,
    placeholder: editorConfig.placeholder,
    autofocus: editorConfig.autofocus,
    minHeight: editorConfig.minHeight,
    logLevel: editorConfig.logLevel,
    tools: resolvedTools,
    onChange: async (api, event) => {
      try {
        const output = await api.saver.save();
        // 加载样式模板并生成HTML预览
        const styleTemplate = await loadStyleTemplate();
        const htmlContent = convertToHtml(output, styleTemplate);
        await renderPreviewContent(htmlContent);
      } catch (error) {
        logger.error("预览内容生成失败", error);
        await renderPreviewContent("");
      }
    },
    onReady: () => {
      // 在 onReady 中初始化 DragDrop，类似仓库示例
      initializeDragDrop(editorInstance);
      // 执行其他 onReady 逻辑
      createOnReadyHandler(holderElement).call(editorInstance);
    },
  });

  return editorInstance;
}

/**
 * 加载并初始化编辑器（支持初始数据）
 * @param {string} container 编辑器容器ID或元素
 * @param {Object} initialData 初始EditorJS数据
 * @returns {Promise<Object>} EditorJS实例
 */
export async function loadAndInitializeEditorWithData(container, initialData = null) {
  const holderElement = document.getElementById(container);
  if (!holderElement) {
    throw new Error(`${container}元素不存在，请检查DOM结构`);
  }

  // 解析配置中的工具类引用
  const resolvedTools = {};
  for (const [toolName, toolConfig] of Object.entries(editorConfig.tools)) {
    if (typeof toolConfig.class === "string") {
      // 将字符串类名解析为实际的类引用
      resolvedTools[toolName] = {
        ...toolConfig,
        class: EditorJS[toolConfig.class],
      };
    } else {
      resolvedTools[toolName] = toolConfig;
    }
  }

  const editorOptions = {
    holder: holderElement,
    placeholder: editorConfig.placeholder,
    autofocus: editorConfig.autofocus,
    minHeight: editorConfig.minHeight,
    logLevel: editorConfig.logLevel,
    tools: resolvedTools,
    onChange: async (api, event) => {
      try {
        const output = await api.saver.save();
        // 加载样式模板并生成HTML预览
        const styleTemplate = await loadStyleTemplate();
        const htmlContent = convertToHtml(output, styleTemplate);
        await renderPreviewContent(htmlContent);
      } catch (error) {
        logger.error("预览内容生成失败", error);
        await renderPreviewContent("");
      }
    },
    onReady: () => {
      // 在 onReady 中初始化 DragDrop，类似仓库示例
      initializeDragDrop(editorInstance);
      // 执行其他 onReady 逻辑
      createOnReadyHandler(holderElement).call(editorInstance);
    },
  };

  // 如果有初始数据，添加到配置中
  if (initialData) {
    // 检查不同的数据结构
    let editorData = null;
    
    if (initialData.content && initialData.content.blocks) {
      // 文章存储格式：{ content: { blocks: [...] } }
      editorData = initialData.content;
    } else if (initialData.editorData && initialData.editorData.blocks) {
      // 直接传入的EditorJS格式：{ editorData: { blocks: [...] } }
      editorData = initialData.editorData;
    } else if (initialData.blocks) {
      // 直接EditorJS格式：{ blocks: [...] }
      editorData = initialData;
    }
    
    if (editorData && editorData.blocks) {
      editorOptions.data = editorData;
      logger.debug("加载初始数据到编辑器", editorData);
    }
  }

  const editorInstance = new EditorJS(editorOptions);

  return editorInstance;
}

/**
 * 销毁编辑器实例
 * @param {Object} editor EditorJS实例
 */
export function destroyEditor(editor) {
  if (editor) {
    try {
      editor.destroy();
    } catch (error) {
      logger.warn("编辑器销毁错误", error);
    }
  }
}

/**
 * 设置编辑器激活状态
 * @param {boolean} active 是否激活
 */
export function setEditorActiveState(active) {
  isEditorActive = active;
}

/**
 * 检查智能编辑器是否处于激活状态
 * @returns {boolean} 是否激活
 */
export function isSmartEditorActive() {
  return isEditorActive;
}
