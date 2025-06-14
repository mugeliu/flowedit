import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import { createElement } from "../../utils/dom.js";
import { activateSmartEditor } from "./manager.js";

/**
 * 创建智能插入按钮并定位到目标元素
 * @param {HTMLElement} referenceElement - 参考定位元素
 * @returns {Object} 包含按钮元素和清理函数
 */
export function createSmartButton(referenceElement) {
  const btn = createElement("button", {
    className: "flowedit-btn flowedit-smart-btn",
    textContent: "智能插入",
  });

  // 设置基础样式
  Object.assign(btn.style, {
    position: "fixed",
    zIndex: "100",
  });

  btn.addEventListener("click", handleSmartButtonClick);

  // 插入到 body
  document.body.appendChild(btn);

  // 找到 #js_toolbar_0 的最后一个子元素作为定位参考
  const toolbarContainer = document.querySelector("#js_toolbar_0");
  const lastChild = toolbarContainer
    ? toolbarContainer.lastElementChild
    : referenceElement;

  // 使用 Floating UI 定位到最后一个子元素的视觉位置
  if (lastChild) {
    computePosition(lastChild, btn, {
      placement: "right-start",
      middleware: [
        offset(lastChild.offsetWidth), // 正偏移使其显示在最后一个子元素的右侧
        flip(),
        shift({ padding: 8 }),
      ],
    }).then(({ x, y }) => {
      Object.assign(btn.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

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
