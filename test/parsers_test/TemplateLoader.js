/**
 * 模板加载器
 * 负责加载JSON配置文件、验证模板格式、提供模板获取接口
 * 集成简化的错误处理和模板验证
 */

// 简化的错误处理
class ParserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParserError';
  }
}

// 简化的模板验证器
class TemplateValidator {
  static validate(template) {
    if (!template || typeof template !== 'object') {
      throw new ParserError('模板必须是对象');
    }
    
    if (!template.blocks || !template.inlineStyles) {
      throw new ParserError('模板缺少必要字段: blocks 或 inlineStyles');
    }
    
    // 检查关键块类型是否存在
    if (!template.blocks.paragraph) {
      throw new ParserError('模板缺少 paragraph 块定义');
    }
    
    return true;
  }
}

// 使用console.log替代日志系统，便于测试
const logger = {
  error: (...args) => console.error('[TemplateLoader]', ...args),
  warn: (...args) => console.warn('[TemplateLoader]', ...args),
  info: (...args) => console.info('[TemplateLoader]', ...args),
  debug: (...args) => console.debug('[TemplateLoader]', ...args)
};

class TemplateLoader {
  constructor() {
    this.template = null;
    this.isLoaded = false;
  }

  /**
   * 加载模板配置
   * @param {Object|string} templateSource - 模板对象或JSON字符串
   * @returns {boolean} 加载是否成功
   * @throws {ParserError} 加载失败时抛出错误
   */
  loadTemplate(templateSource) {
    try {
      const template = typeof templateSource === "string" 
        ? JSON.parse(templateSource) 
        : templateSource;

      // 基础验证
      if (!template || typeof template !== 'object') {
        throw new ParserError('模板格式无效');
      }

      // 使用验证器进行验证
      TemplateValidator.validate(template);

      this.template = template;
      this.isLoaded = true;
      logger.info(`模板加载成功: ${template.theme || 'unknown'}`);
      return true;
    } catch (error) {
      this.template = null;
      this.isLoaded = false;
      
      if (error instanceof ParserError) {
        logger.error('模板验证失败:', error.message);
        throw error;
      }
      
      const templateError = new ParserError(`模板加载失败: ${error.message}`);
      logger.error('模板加载失败:', templateError.message);
      throw templateError;
    }
  }

  /**
   * 确保模板已加载，否则抛出错误
   * @throws {ParserError} 模板未加载时抛出错误
   */
  _ensureLoaded() {
    if (!this.isLoaded || !this.template) {
      throw new ParserError("模板未加载");
    }
  }

  /**
   * 获取块模板
   * @param {string} blockType - 块类型
   * @param {string} subType - 子类型（如header的h1、h2等，List的ordered、unordered等）
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

    // 无子类型：List和有optional配置的块返回整个对象，其他返回首个值
    if (blockType === "List" || template.optional) {
      return template;
    }
    return Object.values(template)[0] || null;
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
export { ParserError };