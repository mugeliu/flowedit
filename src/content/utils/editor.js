// 编辑器相关工具函数
import { editorConfig } from "../config/index.js";
import { convertToHtml } from "./parsers/index.js";
import { renderPreviewContent } from "../features/sidebar/preview.js"; 

// 全局编辑器状态管理
let isEditorActive = false;

/**
 * 加载样式模板
 * @returns {Promise<Object>} 样式模板对象
 */
export async function loadStyleTemplate() {
  try {
    const templateResponse = await fetch(chrome.runtime.getURL('assets/style-template.json'));
    const styleTemplate = await templateResponse.json();
    return styleTemplate;
  } catch (error) {
    console.error('加载样式模板失败:', error);
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
      [contentField]: htmlContent
    };

    // 通过 background.js 调用微信公众号编辑器 JSAPI
    const result = await chrome.runtime.sendMessage({
      action: "invokeMPEditorAPI",
      apiName: apiName,
      apiParam: apiParam,
    });

    if (result.success) {
      console.log(`API ${apiName} 调用成功:`, result.data);
      return true;
    } else {
      console.error(`API ${apiName} 调用失败:`, result.error);
      return false;
    }
  } catch (error) {
    console.error("保存到原编辑器失败:", error);
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
    tools: resolvedTools,
    onChange: async (api, event) => {
      try {
        const output = await api.saver.save();
        // 加载样式模板并生成HTML预览
        const styleTemplate = await loadStyleTemplate();
        const htmlContent = convertToHtml(output, styleTemplate);
        await renderPreviewContent(htmlContent);
      } catch (error) {
        console.error('预览内容生成失败:', error);
        await renderPreviewContent('');
      }
    },
    onReady: () => {
      if (window.EditorJS.DragDrop) {
        new window.EditorJS.DragDrop(editorInstance);
      }
      // 1. 初始化时滚动到顶部
      window.scrollTo({ top: 0, behavior: "auto" });

      // 2. 自动滚动逻辑
      const autoScroll = () => {
        // 获取当前活跃的编辑器区块
        const currentBlockIndex = editorInstance.blocks.getCurrentBlockIndex();
        const currentBlock =
          editorInstance.blocks.getBlockByIndex(currentBlockIndex);

        if (currentBlock) {
          // 获取区块底部位置
          const blockRect = currentBlock.holder.getBoundingClientRect();
          const blockBottom = blockRect.bottom;
          const viewportHeight = window.innerHeight;

          // 当区块接近视窗底部时（留50px缓冲）
          if (blockBottom > viewportHeight - 50) {
            // 计算需要滚动的距离（一行高度约为30px）
            const scrollAmount = Math.max(
              30,
              blockBottom - viewportHeight + 50
            );

            // 平滑滚动
            window.scrollBy({
              top: scrollAmount,
              behavior: "smooth",
            });
          }
        }
      };

      // 3. 监听关键事件
      const events = ["input", "keydown", "blockAdded"];
      events.forEach((event) => {
        editorInstance.ui.nodes.redactor.addEventListener(event, () => {
          // 仅在回车键或新增区块时触发
          if (event === "keydown" || event === "blockAdded") {
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
