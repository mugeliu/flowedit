import { createElement } from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";
import { activateSmartEditor } from "./manager.js";
import { createLogger } from "../../services/simple-logger.js";

// 创建模块日志器
const logger = createLogger('SmartButton');

/**
 * 创建智能插入按钮并定位到目标元素
 * @returns {Object} 包含按钮元素和清理函数
 */
export function createSmartButton() {
  // 创建最外层包裹div
  const buttonContainer = createElement("div", {
    id: "flow-editor-smart-button-container",
    className: "edui-box edui-button edui-default",
    cssText:
      "display: inline-block; transform: scale(0.8); transform-origin: left center;",
    dataset: {
      floweditPlugin: "smart-button",
      flowedit: "true",
    },
  });

  // 创建WeUI按钮
  const btn = createElement("button", {
    role: "button",
    className: "weui-btn weui-btn_mini weui-btn_primary weui-wa-hotarea",
    textContent: "编辑Plus+",
  });

  // 组装DOM结构
  buttonContainer.appendChild(btn);

  btn.addEventListener("click", handleSmartButtonClick);

  // 查找工具栏容器作为插入目标
  const toolbarContainer = document.getElementById(selectorConfig.toolbar);

  if (!toolbarContainer) {
    const error = `工具栏容器未找到: ${selectorConfig.toolbar}`;
    logger.error("[SmartButton]", error);
    throw new Error(error);
  }

  // 直接插入到工具栏容器的末尾
  toolbarContainer.appendChild(buttonContainer);

  // 返回清理函数
  const cleanup = () => {
    if (buttonContainer.parentNode) {
      buttonContainer.parentNode.removeChild(buttonContainer);
    }
  };

  return {
    element: buttonContainer,
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
    logger.error("智能插入按钮点击处理失败:", error);
  }
}
