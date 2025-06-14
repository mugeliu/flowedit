// 侧边栏切换开关组件
import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import { selectorConfig } from "../../config/index.js";
import { createElement } from "../../utils/dom.js";

/**
 * 创建侧边栏切换开关并定位到目标元素
 * @param {HTMLElement} referenceElement - 参考定位元素
 * @returns {Object} 包含开关元素和清理函数
 */
export function createSidebarToggle(referenceElement) {
  const switchContainer = createElement("button", {
    className: "flowedit-switch",
    innerHTML: `
      <div class="flowedit-switch-track"></div>
      <div class="flowedit-switch-thumb"></div>
    `,
  });

  // 设置基础样式
  Object.assign(switchContainer.style, {
    position: "fixed",
    zIndex: "100",
  });

  switchContainer.addEventListener("click", handleSidebarToggle);

  // 插入到 body
  document.body.appendChild(switchContainer);

  // 找到 #js_toolbar_0 的第一个子元素作为定位参考
  const toolbarContainer = document.querySelector("#js_toolbar_0");
  const firstChild = toolbarContainer
    ? toolbarContainer.firstElementChild
    : referenceElement;

  // 使用 Floating UI 定位到第一个子元素的视觉位置
  if (firstChild) {
    computePosition(firstChild, switchContainer, {
      placement: "left-start",
      middleware: [
        offset(-firstChild.offsetWidth), // 负偏移使其显示在第一个子元素的左侧
        flip(),
        shift({ padding: 8 }),
      ],
    }).then(({ x, y }) => {
      Object.assign(switchContainer.style, {
        left: `${x}px`,
        top: `${y}px`,
      });
    });
  }

  // 返回简单的清理函数
  const cleanup = () => {
    if (switchContainer.parentNode) {
      switchContainer.parentNode.removeChild(switchContainer);
    }
  };

  return {
    element: switchContainer,
    cleanup,
  };
}

/**
 * 处理侧边栏切换事件
 * @param {Event} event 点击事件
 */
export function handleSidebarToggle(event) {
  const sidebar = document.querySelector(selectorConfig.sidebar);
  if (sidebar) {
    const isHidden = sidebar.style.display === "none";
    sidebar.style.display = isHidden ? "" : "none";

    // 更新Switch状态
    if (event && event.currentTarget) {
      const switchBtn = event.currentTarget;
      if (isHidden) {
        switchBtn.classList.add("on");
      } else {
        switchBtn.classList.remove("on");
      }
    }
  }
}
