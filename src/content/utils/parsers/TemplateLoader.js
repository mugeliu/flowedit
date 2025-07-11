/**
 * 模板加载器
 * 负责加载JSON配置文件、验证模板格式、提供模板获取接口
 */

import { createLogger } from '../../services/simple-logger.js';

// 创建模块日志器
const logger = createLogger('TemplateLoader');

class TemplateLoader {
  constructor() {
    this.template = null;
    this.isLoaded = false;
  }

  /**
   * 加载模板配置
   * @param {Object|string} templateSource - 模板对象或JSON字符串
   * @returns {boolean} 加载是否成功
   */
  loadTemplate(templateSource) {
    try {
      const template =
        typeof templateSource === "string"
          ? JSON.parse(templateSource)
          : templateSource;

      if (this.validateTemplate(template)) {
        this.template = template;
        this.isLoaded = true;
        return true;
      }
    } catch (error) {
      logger.error("模板加载失败:", error);
    }

    this.template = null;
    this.isLoaded = false;
    return false;
  }

  /**
   * 验证模板格式
   * @param {Object} template - 模板对象
   * @returns {boolean} 是否有效
   */
  validateTemplate(template) {
    // 基本必需字段检查
    if (!template?.blocks || !template?.inlineStyles) {
      return false;
    }

    // globalStyles 是可选的，不影响验证结果
    return true;
  }

  /**
   * 确保模板已加载，否则抛出错误
   * @throws {Error} 模板未加载时抛出错误
   */
  _ensureLoaded() {
    if (!this.isLoaded || !this.template) {
      throw new Error("模板未加载");
    }
  }

  /**
   * 获取块模板
   * @param {string} blockType - 块类型
   * @param {string} subType - 子类型（如header的h1、h2等，List的ordered、unordered、checklist等）
   * @returns {string|Object|null} 模板字符串或模板对象
   */
  getBlockTemplate(blockType, subType = null) {
    try {
      this._ensureLoaded();
    } catch (error) {
      logger.error(error.message);
      return null;
    }

    const template = this.template.blocks[blockType];
    if (!template) {
      logger.warn(`未找到块类型 ${blockType} 的模板`);
      return null;
    }

    // 字符串模板直接返回
    if (typeof template === "string") return template;

    // 有子类型且存在对应模板
    if (subType && template[subType]) return template[subType];

    // 有子类型但不存在对应模板
    if (subType) {
      logger.warn(`未找到块类型 ${blockType} 的子类型 ${subType} 模板`);
      return null;
    }

    // 无子类型：List返回整个对象，其他返回首个值
    return blockType === "List" ? template : Object.values(template)[0] || null;
  }

  /**
   * 获取内联样式
   * @param {string} tagName - 标签名
   * @returns {string|null} 样式字符串
   */
  getInlineStyle(tagName) {
    try {
      this._ensureLoaded();
    } catch (error) {
      logger.error(error.message);
      return null;
    }

    return this.template.inlineStyles[tagName] || null;
  }

  /**
   * 获取全局样式模板
   * @param {string} styleName - 样式名称
   * @returns {string|null} 模板字符串
   */
  getGlobalStyle(styleName) {
    try {
      this._ensureLoaded();
    } catch (error) {
      logger.error(error.message);
      return null;
    }

    return this.template.globalStyles?.[styleName] || null;
  }

  /**
   * 检查模板是否已加载
   * @returns {boolean} 是否已加载
   */
  isTemplateLoaded() {
    return this.isLoaded && this.template !== null;
  }
}

// ES6 模块导出
export default TemplateLoader;
