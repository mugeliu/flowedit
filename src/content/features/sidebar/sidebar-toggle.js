// 侧边栏切换开关组件
import { selectorConfig } from "../../config/index.js";
import {
  createElement,
  safeQuerySelector,
  hideElement,
  showElement,
} from "../../utils/dom.js";

/**
 * 创建侧边栏切换开关并定位到目标元素
 * @returns {Object} 包含开关元素和清理函数
 */
export function createSidebarToggle() {
  // 创建WeUI风格的switch容器（参考content.js成功实现）
  const switchContainer = createElement("div", {
    className: "weui-cell weui-cell_switch",
  });

  // 添加内联样式确保正确显示（参考content.js）
  switchContainer.style.cssText = `
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 4px;
  `;

  // 创建标题区域
  const cellHd = createElement("div", {
    className: "weui-cell__hd",
  });

  const label = createElement("label", {
    className: "weui-label",
    textContent: "侧边栏",
  });
  label.setAttribute("for", "flowedit-sidebar-toggle");
  cellHd.appendChild(label);

  // 创建checkbox input元素（直接添加到容器，不使用cellFt）
  const switchInput = createElement("input", {
    className: "weui-switch",
    type: "checkbox",
    id: "flowedit-sidebar-toggle",
  });

  // 添加无障碍属性
  switchInput.setAttribute("aria-label", "侧边栏开关控制");

  // 组装DOM结构（参考content.js的成功结构）
  switchContainer.appendChild(cellHd);
  switchContainer.appendChild(switchInput);

  // 添加数据属性用于DOM监听器识别
  switchContainer.setAttribute("data-flowedit-plugin", "sidebar-toggle");
  switchContainer.setAttribute("data-flowedit", "true");

  switchInput.addEventListener("change", handleSidebarToggle);

  // 查找工具栏容器作为插入目标
  const toolbarContainer = document.getElementById(selectorConfig.toolbar);

  if (!toolbarContainer) {
    const error = `工具栏容器未找到: ${selectorConfig.toolbar}`;
    console.error("[SidebarToggle]", error);
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
    input: switchInput,
    cleanup,
  };
}

/**
 * 处理侧边栏切换事件
 * @param {Event} event change事件
 */
export function handleSidebarToggle(event) {
  // 获取侧边栏元素
  const sidebar = document.getElementById(selectorConfig.sidebar);

  if (sidebar && event && event.currentTarget) {
    const switchInput = event.currentTarget;
    const isChecked = switchInput.checked;

    // 根据checkbox状态切换元素显示
    if (isChecked) {
      // checkbox选中状态，隐藏侧边栏
      hideElement(sidebar);
    } else {
      // checkbox未选中状态，显示侧边栏
      showElement(sidebar);
    }
  }
}
