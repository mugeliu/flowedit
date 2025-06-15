// 侧边栏切换开关组件
import { computePosition, offset, flip, shift } from "@floating-ui/dom";
import { selectorConfig } from "../../config/index.js";
import { createElement, safeQuerySelector } from "../../utils/dom.js";

/**
 * 创建侧边栏切换开关并定位到目标元素
 * @returns {Object} 包含开关元素和清理函数
 */
export function createSidebarToggle() {
  const switchContainer = createElement("button", {
    className: "flowedit-switch flowedit-switch-fixed",
    innerHTML: `
      <div class="flowedit-switch-track"></div>
      <div class="flowedit-switch-thumb"></div>
    `,
  });

  switchContainer.addEventListener("click", handleSidebarToggle);

  // 插入到 body
  document.body.appendChild(switchContainer);

  // 查找工具栏容器和第一个子元素作为定位参考
  const toolbarContainer = safeQuerySelector(selectorConfig.toolbar);
  if (!toolbarContainer) {
    throw new Error(`工具栏容器未找到: ${selectorConfig.toolbar}`);
  }

  const referenceElement =
    toolbarContainer.firstElementChild || toolbarContainer;

  // 使用 Floating UI 定位到参考元素的视觉位置
  computePosition(referenceElement, switchContainer, {
    placement: "left-start",
    middleware: [
      offset(-referenceElement.offsetWidth), // 负偏移使其显示在参考元素的左侧
      flip(),
      shift({ padding: 8 }),
    ],
  }).then(({ x, y }) => {
    Object.assign(switchContainer.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  });

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
