/**
 * 模板加载器
 * 负责加载JSON配置文件、验证模板格式、提供模板获取接口
 */
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
      // 如果是字符串，解析为对象
      if (typeof templateSource === 'string') {
        this.template = JSON.parse(templateSource);
      } else {
        this.template = templateSource;
      }

      // 验证模板格式
      if (!this.validateTemplate(this.template)) {
        console.error('模板格式验证失败');
        return false;
      }

      this.isLoaded = true;
      return true;
    } catch (error) {
      console.error('模板加载失败:', error);
      this.isLoaded = false;
      return false;
    }
  }



  /**
   * 验证模板格式
   * @param {Object} template - 模板对象
   * @returns {boolean} 是否有效
   */
  validateTemplate(template) {
    return template?.blocks && template?.inlineStyles;
  }

  /**
   * 获取块模板
   * @param {string} blockType - 块类型
   * @param {string} subType - 子类型（如header的h1、h2等，List的ordered、unordered、checklist等）
   * @returns {string|Object|null} 模板字符串或模板对象
   */
  getBlockTemplate(blockType, subType = null) {
    if (!this.isLoaded || !this.template?.blocks) {
      console.error('模板未加载');
      return null;
    }

    const template = this.template.blocks[blockType];
    
    if (!template) {
      console.warn(`未找到块类型 ${blockType} 的模板`);
      return null;
    }

    // 字符串模板直接返回
    if (typeof template === 'string') {
      return template;
    }
    
    // 对象模板处理
    if (subType && template[subType]) {
      return template[subType];
    }
    
    if (subType) {
      console.warn(`未找到块类型 ${blockType} 的子类型 ${subType} 模板`);
      return null;
    }
    
    // 无子类型时：List返回整个对象，其他返回默认值或首个值
    return blockType === 'List' ? template : (template.default || Object.values(template)[0] || null);
  }

  /**
   * 获取内联样式
   * @param {string} tagName - 标签名
   * @returns {string|null} 样式字符串
   */
  getInlineStyle(tagName) {
    if (!this.isLoaded || !this.template) {
      console.error('模板未加载');
      return null;
    }

    return this.template.inlineStyles[tagName] || null;
  }

  /**
   * 检查模板是否已加载
   * @returns {boolean} 是否已加载
   */
  isTemplateLoaded() {
    return this.template !== null;
  }
}

// ES6 模块导出
export default TemplateLoader;