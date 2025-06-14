// 侧边栏功能管理器
import { createSidebarToggle } from "./sidebar-toggle.js";

let sidebarToggle = null;

/**
 * 初始化侧边栏功能
 * @param {HTMLElement} referenceElement - 参考定位元素
 */
export function initializeSidebar(referenceElement) {
  if (sidebarToggle) {
    console.warn("侧边栏功能已经初始化");
    return;
  }

  try {
    sidebarToggle = createSidebarToggle(referenceElement);
    console.log("侧边栏功能初始化成功");
  } catch (error) {
    console.error("侧边栏功能初始化失败:", error);
  }
}

/**
 * 清理侧边栏功能
 */
export function cleanupSidebar() {
  if (sidebarToggle && sidebarToggle.cleanup) {
    sidebarToggle.cleanup();
    sidebarToggle = null;
    console.log("侧边栏功能已清理");
  }
}

/**
 * 获取侧边栏切换开关实例
 * @returns {Object|null} 侧边栏切换开关实例
 */
export function getSidebarToggle() {
  return sidebarToggle;
}
