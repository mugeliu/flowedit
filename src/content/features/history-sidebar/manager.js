// 历史文章侧边栏功能管理器
import { createHistorySidebarToggle } from "./history-sidebar-toggle.js";
import { createLogger } from "../../services/simple-logger.js";

// 创建模块日志器
const logger = createLogger('HistorySidebarManager');

let historySidebarToggle = null;

/**
 * 初始化历史文章侧边栏功能
 */
export function initializeHistorySidebar() {
  if (historySidebarToggle) {
    logger.warn("历史文章侧边栏功能已经初始化");
    return;
  }

  try {
    historySidebarToggle = createHistorySidebarToggle();
    logger.info("历史文章侧边栏功能初始化成功");
  } catch (error) {
    logger.error("历史文章侧边栏功能初始化失败", error);
  }
}

/**
 * 清理历史文章侧边栏功能
 */
export function cleanupHistorySidebar() {
  if (historySidebarToggle && historySidebarToggle.cleanup) {
    historySidebarToggle.cleanup();
    historySidebarToggle = null;
    logger.info("历史文章侧边栏功能已清理");
  }
}

/**
 * 获取历史文章侧边栏切换开关实例
 * @returns {Object|null} 历史文章侧边栏切换开关实例
 */
export function getHistorySidebarToggle() {
  return historySidebarToggle;
}