/**
 * TemplateManager 类
 * 专门负责管理HTML模板配置
 * 简化版本，避免过度设计
 */

// 导入默认HTML模板配置
import { HTML_TEMPLATES } from "../../config/style-template.js";

class TemplateManager {
  /**
   * 创建模板管理器实例
   * @param {Object} customTemplates 自定义模板配置（可选）
   */
  constructor(customTemplates = {}) {
    // 如果传入自定义模板则使用自定义模板，否则使用默认模板
    this.templates =
      Object.keys(customTemplates).length > 0
        ? customTemplates
        : HTML_TEMPLATES;
  }

  /**
   * 获取特定块类型的模板
   * @param {string} blockType 块类型
   * @returns {Object|null} 模板对象或null
   */
  getBlockTemplate(blockType) {
    return this.templates[blockType] || null;
  }

  /**
   * 获取特定块类型的特定变体模板
   * 简化版本：只获取指定变体，不进行复杂的回退逻辑
   * @param {string} blockType 块类型
   * @param {string} variant 变体名称
   * @returns {string|null} 模板字符串或null
   */
  getTemplateVariant(blockType, variant) {
    const blockTemplates = this.templates[blockType];
    if (!blockTemplates) return null;

    return blockTemplates[variant] || null;
  }

  /**
   * 获取内联样式模板
   * @returns {Object} 内联样式模板
   */
  getInlineStyles() {
    return this.templates.inlineStyles || {};
  }

  /**
   * 获取头部模板
   * @returns {string} 头部模板
   */
  getHeadTemplate() {
    return this.templates.head || "";
  }

  /**
   * 获取尾部模板
   * @returns {string} 尾部模板
   */
  getEndingTemplate() {
    return this.templates.ending || "";
  }

  /**
   * 获取所有模板配置
   * @returns {Object} 当前模板配置
   */
  getTemplates() {
    return this.templates;
  }
}

export { TemplateManager };
export default TemplateManager;
