// 侧边栏切换开关组件
import { selectorConfig } from "../../config/index.js";
import { createElement, hideElement, showElement } from "../../utils/dom.js";
import {
  showPreviewContainer,
  hidePreviewContainer,
  cleanupPreviewContainer,
} from "./preview.js";
import { createLogger } from "../../services/simple-logger.js";

// 创建模块日志器
const logger = createLogger('SidebarToggle');

/**
 * 创建侧边栏切换开关并定位到目标元素
 * @returns {Object} 包含开关元素和清理函数
 */
export function createSidebarToggle() {
  // 创建最外层包裹div
  const switchContainer = createElement("div", {
    id: "flow-editor-sidebar-toggle-container",
    className: "edui-box edui-button edui-default",
    dataset: {
      floweditPlugin: "sidebar-toggle",
      flowedit: "true",
    },
  });

  // 创建label容器（作为开关的主体）
  const switchLabel = createElement("label", {
    className: "weui-cell weui-cell_switch",
    cssText:
      "padding: 0; transform: scale(0.7); transform-origin: left center;",
    role: "switch",
  });

  // 创建开关区域
  const cellFt = createElement("div", {
    className: "weui-cell__ft",
  });

  // 创建checkbox input元素
  const switchInput = createElement("input", {
    className: "weui-switch",
    type: "checkbox",
    id: "switch-1",
    role: "switch",
    "aria-checked": "false",
  });

  // 组装DOM结构
  cellFt.appendChild(switchInput);
  switchLabel.appendChild(cellFt);
  switchContainer.appendChild(switchLabel);

  switchInput.addEventListener("change", handleSidebarToggle);

  // 查找工具栏容器作为插入目标
  const toolbarContainer = document.getElementById(selectorConfig.toolbar);

  if (!toolbarContainer) {
    const error = `工具栏容器未找到: ${selectorConfig.toolbar}`;
    logger.error("[SidebarToggle]", error);
    throw new Error(error);
  }

  // 直接插入到工具栏容器的开头
  toolbarContainer.insertBefore(switchContainer, toolbarContainer.firstChild);

  // 返回清理函数
  const cleanup = () => {
    if (switchContainer.parentNode) {
      switchContainer.parentNode.removeChild(switchContainer);
    }
    // 清理预览容器
    cleanupPreviewContainer();
    // 恢复侧边栏显示状态，确保重新初始化时处于默认状态
    const sidebarElement = document.getElementById(selectorConfig.sidebar);
    if (sidebarElement) {
      showElement(sidebarElement);
    }
  };

  return {
    element: switchContainer,
    cleanup,
  };
}

/**
 * 处理侧边栏切换事件
 * @param {Event} event change事件
 */
export async function handleSidebarToggle(event) {
  // 获取侧边栏元素
  const sidebar = document.getElementById(selectorConfig.sidebar);

  if (sidebar && event && event.currentTarget) {
    const switchInput = event.currentTarget;
    const isChecked = switchInput.checked;

    // 根据checkbox状态切换元素显示
    if (isChecked) {
      // checkbox选中状态，隐藏侧边栏，显示预览容器
      hideElement(sidebar);
      await showPreviewContainer();
    } else {
      // checkbox未选中状态，显示侧边栏，隐藏预览容器
      showElement(sidebar);
      hidePreviewContainer();
    }
  }
}
