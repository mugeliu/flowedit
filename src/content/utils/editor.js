// 编辑器相关工具函数
import { selectorConfig, editorConfig } from "../config/index.js";
import { parseEditorJS } from "./parsers/index.js";
import { safeQuerySelector, createElement } from "./dom.js";

/**
 * 将EditorJS数据保存到原编辑器
 * @param {Array} blocks - EditorJS块数据
 * @param {Object} options - 保存选项
 * @param {string} options.targetSelector - 目标编辑器选择器
 * @param {boolean} options.append - 是否追加内容
 * @param {string} options.insertPosition - 插入位置 ('start', 'end', 'cursor')
 * @param {Object} options.styleOptions - 样式选项
 * @param {boolean} options.usePreloadedStyles - 是否使用预加载的样式
 * @returns {Promise<boolean>} 保存是否成功
 */
export async function saveToOriginalEditor(editorData, options = {}) {
  try {
    const {
      targetSelector = selectorConfig.editorContent,
      append = true, // 默认追加而不是替换
      insertPosition = "cursor",
      styleOptions = {},
    } = options;

    // 使用HTML解析器生成HTML内容
    const htmlContent = parseEditorJS(editorData, {});

    console.log("生成的HTML内容:", htmlContent);
    插入到目标编辑器;
    const success = await insertToEditor(htmlContent, {
      targetSelector,
      append,
      insertPosition,
    });
    //const success = await setContentByWechatAPI(htmlContent);

    return success;
  } catch (error) {
    console.error("保存到原编辑器失败:", error);
    return false;
  }
}

/**
 * 插入内容到目标编辑器
 * @param {string} htmlContent HTML内容
 * @param {Object} options 插入选项
 * @param {string} options.targetSelector 目标编辑器选择器
 * @param {boolean} options.append 是否追加内容
 * @param {string} options.insertPosition 插入位置
 * @returns {Promise<boolean>} 插入是否成功
 */
export async function insertToEditor(htmlContent, options = {}) {
  const {
    targetSelector = selectorConfig.editorContent,
    append = true, // 默认追加而不是替换
    insertPosition = "cursor",
  } = options;

  try {
    // 使用dom工具安全地查找目标编辑器
    const target = safeQuerySelector(targetSelector);
    if (!target) {
      console.error("找不到目标编辑器:", targetSelector);
      return false;
    }

    // 创建临时容器来解析HTML内容
    const tempContainer = createElement("div", { innerHTML: htmlContent });

    // 将htmlContent作为子元素插入到target中
    if (append) {
      // 将临时容器中的所有子节点追加到target的末尾
      while (tempContainer.firstChild) {
        target.appendChild(tempContainer.firstChild);
      }
    } else {
      switch (insertPosition) {
        case "start":
          // 插入到开头
          while (tempContainer.lastChild) {
            target.insertBefore(tempContainer.lastChild, target.firstChild);
          }
          break;
        case "end":
          // 插入到末尾
          while (tempContainer.firstChild) {
            target.appendChild(tempContainer.firstChild);
          }
          break;
        case "cursor":
        default:
          target.innerHTML = htmlContent;
          break;
      }
    }

    console.log("内容插入成功");
    return true;
  } catch (error) {
    console.error("插入内容失败:", error);
    return false;
  }
}

/**
 * 获取初始内容
 * @returns {Object} EditorJS初始数据
 */
function getInitialContent() {
  return {
    blocks: [],
  };
}

/**
 * 检查EditorJS是否已加载
 * @returns {boolean}
 */
export function isEditorJSLoaded() {
  console.log("[FlowEdit] 检查EditorJS是否已加载:", !!window.EditorJS);

  // 详细调试信息
  if (window.EditorJS) {
    console.log("[FlowEdit] EditorJS核心已加载:", typeof window.EditorJS);
    console.log("[FlowEdit] 可用插件:");
    console.log("- Header:", typeof window.Header);
    console.log("- Paragraph:", typeof window.Paragraph);
    console.log("- Quote:", typeof window.Quote);
    console.log("- ImageTool:", typeof window.ImageTool);
    console.log("- RawTool:", typeof window.RawTool);
    console.log("- Delimiter:", typeof window.Delimiter);
    console.log("- Marker:", typeof window.Marker);
    console.log("- InlineCode:", typeof window.InlineCode);
    console.log("- Underline:", typeof window.Underline);
    console.log("- EditorjsList:", typeof window.EditorjsList);
    console.log("- Code:", typeof window.Code);
    console.log("- DragDrop:", typeof window.DragDrop);
  } else {
    console.log("[FlowEdit] EditorJS未定义，检查脚本是否正确加载");
  }

  return !!window.EditorJS;
}

/**
 * 解析工具配置，将字符串类名转换为实际类引用
 * 直接从window对象中获取EditorJS工具类（由独立脚本注入）
 * @param {Object} toolsConfig 工具配置对象
 * @returns {Object} 解析后的工具配置
 */
function parseToolsConfig(toolsConfig) {
  const parsedTools = {};

  for (const [toolName, toolConfig] of Object.entries(toolsConfig)) {
    const { class: className, ...restConfig } = toolConfig;

    // 直接从window获取工具类
    if (!window[className]) {
      console.warn(`工具类 ${className} 未找到或未加载，跳过工具 ${toolName}`);
      continue;
    }

    const ToolClass = window[className];
    if (!ToolClass) {
      console.warn(`工具类 ${className} 未加载，跳过工具 ${toolName}`);
      continue;
    }

    parsedTools[toolName] = {
      class: ToolClass,
      ...restConfig,
    };
  }

  return parsedTools;
}

/**
 * 创建EditorJS实例
 * @param {string} holderId 编辑器容器ID
 * @returns {Object} EditorJS实例
 */
export function createEditorInstance(holderId) {
  // 检查holder元素是否存在
  const holderElement = document.getElementById(holderId);
  if (!holderElement) {
    throw new Error(`${holderId}元素不存在，请检查DOM结构`);
  }

  try {
    // 解析工具配置
    const tools = parseToolsConfig(editorConfig.tools);

    // 构建完整的Editor.js配置
    const config = {
      holder: holderId,
      tools,
      data: getInitialContent(),
      placeholder: editorConfig.placeholder,
      autofocus: editorConfig.autofocus,
      hideToolbar: editorConfig.hideToolbar,
      minHeight: editorConfig.minHeight,
      logLevel: editorConfig.logLevel,

      onReady: () => {
        if (window.DragDrop) {
          new window.DragDrop(editor);
        }
      },

      // 移除onChange回调，让EditorJS使用原生自动高度
    };

    const editor = new window.EditorJS(config);

    return editor;
  } catch (error) {
    console.error("编辑器初始化失败:", error);
    throw error;
  }
}

/**
 * 加载并初始化编辑器
 * @param {string} container 编辑器容器ID或元素
 * @param {Object} config 编辑器配置
 * @returns {Promise<Object>} EditorJS实例
 */
export async function loadAndInitializeEditor(container, config = {}) {
  try {
    // 发送消息给background script注入EditorJS Bundle
    const response = await chrome.runtime.sendMessage("inject_editorjs_bundle");
    console.log("[FlowEdit] EditorJS Bundle注入响应:", response);

    if (!response.success) {
      throw new Error(`EditorJS Bundle加载失败: ${response.error}`);
    }

    // 简单等待EditorJS加载
    let attempts = 0;
    const maxAttempts = 30; // 30次 * 100ms = 3秒

    while (!window.EditorJS && attempts < maxAttempts) {
      console.log(
        `[FlowEdit] 等待EditorJS加载... (${attempts + 1}/${maxAttempts})`
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.EditorJS) {
      throw new Error("EditorJS Bundle加载超时");
    }

    console.log("[FlowEdit] EditorJS Bundle加载成功，开始初始化编辑器");

    console.log("[FlowEdit] 检查EditorJS是否已加载:", isEditorJSLoaded());
    // 解析工具配置
    const tools = parseToolsConfig(config.tools || {});

    // 创建编辑器配置
    const editorConfig = {
      holder: container,
      tools: tools,
      data: config.data || { blocks: [] },
      placeholder: config.placeholder || "开始编写...",
      ...config,
    };

    // 初始化编辑器
    const editor = await initializeEditor(editorConfig);

    return editor;
  } catch (error) {
    console.error("[FlowEdit] 编辑器初始化失败:", error);
    throw error;
  }
}

/**
 * 使用微信官方API设置全文内容
 * @param {string} content - 需要设置的富文本内容
 * @returns {Promise<boolean>} 设置是否成功
 */
export async function setContentByWechatAPI(content) {
  console.log("[FlowEdit] 开始调用微信官方API设置全文内容");
  console.log("[FlowEdit] 设置的内容:", content);

  try {
    // 检查微信编辑器API是否可用
    if (!window.__MP_Editor_JSAPI__) {
      console.error(
        "[FlowEdit] 微信编辑器API不可用: window.__MP_Editor_JSAPI__ 未定义"
      );
      return false;
    }

    if (typeof window.__MP_Editor_JSAPI__.invoke !== "function") {
      console.error("[FlowEdit] 微信编辑器API不可用: invoke方法不存在");
      return false;
    }

    // 首先检查编辑器是否准备就绪
    console.log("[FlowEdit] 检查编辑器状态...");
    const readyResult = window.__MP_Editor_JSAPI__.invoke(
      "mp_editor_get_isready"
    );
    console.log("[FlowEdit] 编辑器状态检查结果:", readyResult);

    // 根据官方文档，只有当isNew=true时才可调用mp_editor_set_content
    if (!readyResult || !readyResult.isNew) {
      console.error("[FlowEdit] 编辑器未准备就绪或不支持设置内容操作", {
        isReady: readyResult?.isReady,
        isNew: readyResult?.isNew,
      });
      return false;
    }

    // 调用官方API设置全文内容
    console.log("[FlowEdit] 调用mp_editor_set_content接口...");
    const setResult = window.__MP_Editor_JSAPI__.invoke(
      "mp_editor_set_content",
      {
        content: content,
      }
    );

    console.log("[FlowEdit] mp_editor_set_content调用结果:", setResult);

    // 检查设置结果
    if (setResult && setResult.errCode === 0) {
      console.log("[FlowEdit] 全文内容设置成功");
      return true;
    } else {
      console.error("[FlowEdit] 全文内容设置失败:", setResult);
      return false;
    }
  } catch (error) {
    console.error("[FlowEdit] 调用微信官方API设置全文内容时发生错误:", error);
    return false;
  }
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
      console.warn("编辑器销毁错误:", error);
    }
  }
}
