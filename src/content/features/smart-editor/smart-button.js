import { createElement, safeQuerySelector } from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";
import { activateSmartEditor } from "./manager.js";

/**
 * 创建智能插入按钮并定位到目标元素
 * @returns {Object} 包含按钮元素和清理函数
 */
export function createSmartButton() {
  const btn = createElement("button", {
    className: "flowedit-smart-btn",
    textContent: "智能插入",
  });

  // 添加数据属性用于DOM监听器识别
  btn.setAttribute('data-flowedit-plugin', 'smart-button');
  btn.setAttribute('data-flowedit', 'true');

  btn.addEventListener("click", handleSmartButtonClick);

  // 查找工具栏容器作为插入目标
  const toolbarContainer = document.getElementById(selectorConfig.toolbar);
  
  if (!toolbarContainer) {
    const error = `工具栏容器未找到: ${selectorConfig.toolbar}`;
    console.error('[SmartButton]', error);
    throw new Error(error);
  }

  // 直接插入到工具栏容器的末尾
  toolbarContainer.appendChild(btn);

  // 返回清理函数
  const cleanup = () => {
    if (btn.parentNode) {
      btn.parentNode.removeChild(btn);
    }
  };

  return {
    element: btn,
    cleanup,
  };
}

/**
 * 处理智能插入按钮点击事件
 */
async function handleSmartButtonClick() {
  try {
    await activateSmartEditor();
  } catch (error) {
    console.error("智能插入按钮点击处理失败:", error);
  }
}
