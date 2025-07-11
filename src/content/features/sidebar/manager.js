// 侧边栏功能管理器
import { createSidebarToggle } from "./sidebar-toggle.js";
import { createLogger } from "../../services/simple-logger.js";

// 创建模块日志器
const logger = createLogger('SidebarManager');

let sidebarToggle = null;

/**
 * 初始化侧边栏功能
 */
export function initializeSidebar() {
  if (sidebarToggle) {
    logger.warn("侧边栏功能已经初始化");
    return;
  }

  try {
    sidebarToggle = createSidebarToggle();
    logger.info("侧边栏功能初始化成功");
  } catch (error) {
    logger.error("侧边栏功能初始化失败:", error);
  }
}

/**
 * 清理侧边栏功能
 */
export function cleanupSidebar() {
  if (sidebarToggle && sidebarToggle.cleanup) {
    sidebarToggle.cleanup();
    sidebarToggle = null;
    logger.info("侧边栏功能已清理");
  }
}

/**
 * 获取侧边栏切换开关实例
 * @returns {Object|null} 侧边栏切换开关实例
 */
export function getSidebarToggle() {
  return sidebarToggle;
}
