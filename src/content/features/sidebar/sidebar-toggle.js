// 侧边栏切换开关组件
import { selectorConfig } from "../../config/index.js";
import { createElement, safeQuerySelector } from "../../utils/dom.js";

/**
 * 创建侧边栏切换开关并定位到目标元素
 * @returns {Object} 包含开关元素和清理函数
 */
export function createSidebarToggle() {
  const switchContainer = createElement("div", {
    className: "flowedit-switch",
    innerHTML: `
      <div class="flowedit-switch-track"></div>
      <div class="flowedit-switch-thumb"></div>
    `,
  });

  switchContainer.addEventListener("click", handleSidebarToggle);

  // 查找工具栏容器作为插入目标
  const toolbarContainer = safeQuerySelector(selectorConfig.toolbar);
  if (!toolbarContainer) {
    throw new Error(`工具栏容器未找到: ${selectorConfig.toolbar}`);
  }

  // 直接插入到工具栏容器的开头
  toolbarContainer.insertBefore(switchContainer, toolbarContainer.firstChild);

  // 返回清理函数
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
