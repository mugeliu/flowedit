// 侧边栏切换开关组件
import { selectorConfig } from "../../config/index.js";
import { createElement, safeQuerySelector, hideElement, showElement } from "../../utils/dom.js";

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
  
  // 添加数据属性用于DOM监听器识别
  switchContainer.setAttribute('data-flowedit-plugin', 'sidebar-toggle');
  switchContainer.setAttribute('data-flowedit', 'true');

  switchContainer.addEventListener("click", handleSidebarToggle);

  // 查找工具栏容器作为插入目标
  const toolbarContainer = document.getElementById(selectorConfig.toolbar);
  
  if (!toolbarContainer) {
    const error = `工具栏容器未找到: ${selectorConfig.toolbar}`;
    console.error('[SidebarToggle]', error);
    throw new Error(error);
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
  // 获取侧边栏元素
  const sidebar = document.getElementById(selectorConfig.sidebar);
  
  if (sidebar && event && event.currentTarget) {
    const switchBtn = event.currentTarget;
    const isSwitchOn = switchBtn.classList.contains("on");
    
    // 根据开关状态切换元素显示
    if (isSwitchOn) {
      // 开关当前是开启状态，点击后关闭开关，显示元素
      switchBtn.classList.remove("on");
      showElement(sidebar);
    } else {
      // 开关当前是关闭状态，点击后开启开关，隐藏元素
      switchBtn.classList.add("on");
      hideElement(sidebar);
    }
  }
}
