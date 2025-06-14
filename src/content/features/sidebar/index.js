// 侧边栏功能模块 - 标准化插件接口
import {
  initializeSidebar,
  cleanupSidebar,
  getSidebarToggle,
} from "./manager.js";

/**
 * 侧边栏插件定义
 * 遵循统一的插件接口规范
 */
export default {
  name: "sidebar",

  /**
   * 初始化侧边栏功能
   * @param {HTMLElement} referenceElement - 参考定位元素
   * @returns {Promise<void>}
   */
  initialize: async (referenceElement) => {
    initializeSidebar(referenceElement);
  },

  /**
   * 清理侧边栏功能
   * @returns {void}
   */
  cleanup: () => {
    cleanupSidebar();
  },

  /**
   * 检查侧边栏是否启用
   * @returns {boolean}
   */
  isEnabled: () => {
    // 可以在这里添加配置检查逻辑
    return true;
  },

  /**
   * 检查侧边栏是否处于活动状态
   * @returns {boolean}
   */
  isActive: () => {
    return getSidebarToggle() !== null;
  },
};
