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

  const holderElement = document.getElementById(holderId);
  if (!holderElement) {
    throw new Error(`${holderId}元素不存在，请检查DOM结构`);
  }

  const editorInstance = new EditorJS({
    holder: holderElement,
    placeholder: '开始编写内容...',
    tools: {
      // 这里可以添加EditorJS工具
      // 例如：header: Header, list: List 等
      // 目前使用基础功能，只支持段落编辑
      header: EditorJS.Header,
      list: EditorJS.List,
      code: EditorJS.Code,
    },
    onChange: (api, event) => {
      console.log('编辑器内容已更改', event);
    }
  });

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
      console.warn("编辑器销毁错误:", error);
    }
  }
}
