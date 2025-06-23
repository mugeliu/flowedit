/**
 * TemplateManager 类
 * 专门负责管理HTML模板配置
 * 重构后的版本，职责更加清晰
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
    this.templates = Object.keys(customTemplates).length > 0
      ? { ...customTemplates }
      : { ...HTML_TEMPLATES };
  }

  /**
   * 获取所有模板配置
   * @returns {Object} 当前模板配置
   */
  getTemplates() {
    return { ...this.templates };
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
   * @param {string} blockType 块类型
   * @param {string} variant 变体名称
   * @param {string} defaultVariant 默认变体名称
   * @returns {string|null} 模板字符串或null
   */
  getTemplateVariant(blockType, variant, defaultVariant = "default") {
    const blockTemplates = this.templates[blockType];
    if (!blockTemplates) return null;
    
    return blockTemplates[variant] || blockTemplates[defaultVariant] || Object.values(blockTemplates)[0] || null;
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
   * 获取后备样式
   * @returns {Object} 后备样式
   */
  getFallbackStyles() {
    return this.templates.fallback || {};
  }

  /**
   * 设置完整模板配置
   * @param {Object} templates 新的模板配置
   */
  setTemplates(templates) {
    this.templates = { ...templates };
  }

  /**
   * 注册自定义模板
   * @param {string} blockType 块类型
   * @param {string|Object} template 模板字符串或模板对象
   * @param {string} variant 模板变体（可选）
   */
  registerTemplate(blockType, template, variant = "default") {
    if (!this.templates[blockType]) {
      this.templates[blockType] = {};
    }

    if (typeof template === "string") {
      this.templates[blockType][variant] = template;
    } else if (typeof template === "object") {
      this.templates[blockType] = { ...this.templates[blockType], ...template };
    }
  }

  /**
   * 动态添加或修改模板
   * @param {string} blockType 块类型
   * @param {string} variant 模板变体
   * @param {string} template 模板字符串
   */
  setTemplate(blockType, variant, template) {
    if (!this.templates[blockType]) {
      this.templates[blockType] = {};
    }
    this.templates[blockType][variant] = template;
  }

  /**
   * 获取可用的模板列表
   * @returns {Object} 模板配置
   */
  getAvailableTemplates() {
    return { ...this.templates };
  }

  /**
   * 检查模板是否存在
   * @param {string} blockType 块类型
   * @param {string} variant 变体名称（可选）
   * @returns {boolean} 模板是否存在
   */
  hasTemplate(blockType, variant = null) {
    const blockTemplates = this.templates[blockType];
    if (!blockTemplates) return false;
    
    if (variant) {
      return !!blockTemplates[variant];
    }
    
    return Object.keys(blockTemplates).length > 0;
  }
}

export { TemplateManager };
export default TemplateManager;