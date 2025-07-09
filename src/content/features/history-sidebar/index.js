// 历史文章侧边栏功能模块 - 标准化插件接口
import {
  initializeHistorySidebar,
  cleanupHistorySidebar,
  getHistorySidebarToggle,
} from "./manager.js";

/**
 * 历史文章侧边栏插件定义
 * 遵循统一的插件接口规范
 */
export default {
  name: "history-sidebar",

  /**
   * 初始化历史文章侧边栏功能
   * @returns {Promise<void>}
   */
  initialize: async () => {
    initializeHistorySidebar();
  },

  /**
   * 清理历史文章侧边栏功能
   * @returns {void}
   */
  cleanup: () => {
    cleanupHistorySidebar();
  },

  /**
   * 检查历史文章侧边栏是否启用
   * @returns {boolean}
   */
  isEnabled: () => {
    // 可以在这里添加配置检查逻辑
    return true;
  },

  /**
   * 检查历史文章侧边栏是否处于活动状态
   * @returns {boolean}
   */
  isActive: () => {
    return getHistorySidebarToggle() !== null;
  },
};