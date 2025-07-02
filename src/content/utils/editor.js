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
    // 使用HTML解析器生成HTML内容
    const htmlContent = parseEditorJS(editorData, {});

    console.log("生成的HTML内容:", htmlContent);

    // 通过 background.js 调用微信公众号编辑器 JSAPI
    const result = await chrome.runtime.sendMessage({
      action: "invokeMPEditorAPI",
      apiName: "mp_editor_set_content",
      apiParam: {
        content: htmlContent,
      },
    });

    if (result.success) {
      console.log("内容设置成功:", result.data);
      return true;
    } else {
      console.error("内容设置失败:", result.error);
      return false;
    }
  } catch (error) {
    console.error("保存到原编辑器失败:", error);
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
 * 加载并初始化编辑器
 * @param {string} container 编辑器容器ID或元素
 * @param {Object} config 编辑器配置
 * @returns {Promise<Object>} EditorJS实例
 */
export async function loadAndInitializeEditor(container, config = {}) {
  const holderElement = document.getElementById(container);
  if (!holderElement) {
    throw new Error(`${holderId}元素不存在，请检查DOM结构`);
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
    data: getInitialContent(),
    tools: resolvedTools,
    onChange: (api, event) => {},
    onReady: () => {
      if (window.EditorJS.DragDrop) {
        new window.EditorJS.DragDrop(editorInstance);
      };
      // 1. 初始化时滚动到顶部
    window.scrollTo({ top: 0, behavior: 'auto' });
    
    // 2. 自动滚动逻辑
    const autoScroll = () => {
      // 获取当前活跃的编辑器区块
      const currentBlockIndex = editorInstance.blocks.getCurrentBlockIndex();
      const currentBlock = editorInstance.blocks.getBlockByIndex(currentBlockIndex);
      
      if (currentBlock) {
        // 获取区块底部位置
        const blockRect = currentBlock.holder.getBoundingClientRect();
        const blockBottom = blockRect.bottom;
        const viewportHeight = window.innerHeight;
        
        // 当区块接近视窗底部时（留50px缓冲）
        if (blockBottom > viewportHeight - 50) {
          // 计算需要滚动的距离（一行高度约为30px）
          const scrollAmount = Math.max(30, blockBottom - viewportHeight + 50);
          
          // 平滑滚动
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          });
        }
      }
    };

    // 3. 监听关键事件
    const events = ['input', 'keydown', 'blockAdded'];
    events.forEach(event => {
      editorInstance.ui.nodes.redactor.addEventListener(event, () => {
        // 仅在回车键或新增区块时触发
        if (event === 'keydown' || event === 'blockAdded') {
          setTimeout(autoScroll, 10); // 稍延迟确保DOM更新
        }
      });
    });
      
    },
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
