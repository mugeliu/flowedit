import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import { createElement, safeQuerySelector } from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";
import { activateSmartEditor } from "./manager.js";

/**
 * 创建智能插入按钮并定位到目标元素
 * @returns {Object} 包含按钮元素和清理函数
 */
export function createSmartButton() {
  const btn = createElement("button", {
    className: "flowedit-smart-btn flowedit-btn-fixed",
    textContent: "智能插入",
  });

  btn.addEventListener("click", handleSmartButtonClick);

  // 插入到 body
  document.body.appendChild(btn);

  // 查找工具栏容器和最后一个子元素作为定位参考
  const toolbarContainer = safeQuerySelector(selectorConfig.toolbar);
  if (!toolbarContainer) {
    throw new Error(`工具栏容器未找到: ${selectorConfig.toolbar}`);
  }

  const referenceElement =
    toolbarContainer.lastElementChild || toolbarContainer;

  // 使用 Floating UI 定位到参考元素的视觉位置
  computePosition(referenceElement, btn, {
    placement: "right-start",
    middleware: [
      offset(referenceElement.offsetWidth), // 正偏移使其显示在参考元素的右侧
      flip(),
      shift({ padding: 8 }),
    ],
  }).then(({ x, y }) => {
    Object.assign(btn.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  });

  // 返回包含清理函数的对象
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
