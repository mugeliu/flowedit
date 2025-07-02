// 智能编辑器功能模块 - 标准化插件接口
import { initializeSmartEditor, cleanupSmartEditor } from "./manager.js";
import { isSmartEditorActive } from "../../utils/editor.js";

/**
 * 智能编辑器插件定义
 * 遵循统一的插件接口规范
 */
export default {
  name: "smart-editor",

  /**
   * 初始化智能编辑器功能
   * @returns {Promise<void>}
   */
  initialize: async () => {
    initializeSmartEditor();
  },

  /**
   * 清理智能编辑器功能
   * @returns {void}
   */
  cleanup: () => {
    cleanupSmartEditor();
  },

  /**
   * 检查智能编辑器是否启用
   * @returns {boolean}
   */
  isEnabled: () => {
    // 可以在这里添加配置检查逻辑
    return true;
  },

  /**
   * 检查智能编辑器是否处于活动状态
   * @returns {boolean}
   */
  isActive: () => {
    return isSmartEditorActive();
  },
};
