/**
 * 块渲染器基类
 * 为所有块渲染器提供通用接口和辅助方法
 * 优化版本：支持占位符条件渲染，使用简化错误处理
 */

import { ParserError } from '../TemplateLoader.js';

// 使用console.log替代日志系统，便于测试
const logger = {
  error: (...args) => console.error('[BaseBlockRenderer]', ...args),
  warn: (...args) => console.warn('[BaseBlockRenderer]', ...args),
  info: (...args) => console.info('[BaseBlockRenderer]', ...args),
  debug: (...args) => console.debug('[BaseBlockRenderer]', ...args)
};

class BaseBlockRenderer {
  constructor(templateLoader, inlineStyleProcessor) {
    if (!templateLoader) {
      throw new ParserError('TemplateLoader is required');
    }
    
    this.templateLoader = templateLoader;
    this.inlineStyleProcessor = inlineStyleProcessor;
  }

  /**
   * 渲染块数据
   * @param {Object} data - 块数据
   * @param {Renderer} renderer - 主渲染器实例
   * @returns {string} HTML字符串
   */
  render(data, renderer) {
    throw new Error('render method must be implemented');
  }

  /**
   * 获取支持的块类型
   * @returns {string} 块类型标识
   */
  getType() {
    throw new Error('getType method must be implemented');
  }

  /**
   * 处理内联样式（更新为使用新的解耦接口）
   * @param {string} text - 原始文本
   * @param {Renderer} renderer - 主渲染器实例
   * @returns {string} 处理后的HTML文本
   */
  processInlineStyles(text, renderer) {
    if (!text || typeof text !== 'string') {
      return text || '';
    }

    if (!renderer) {
      logger.warn('renderer 参数是必需的');
      return text;
    }

    try {
      // 使用 renderer 的统一接口
      return renderer.processInlineStyles(text);
    } catch (error) {
      logger.error('处理内联样式失败:', error);
      return text; // 发生错误时返回原文本
    }
  }

  /**
   * 渲染模板（支持占位符条件渲染）
   * @param {Object|string} config - 模板配置
   * @param {Object} data - 数据对象
   * @returns {string} 渲染后的HTML
   */
  renderTemplate(config, data) {
    try {
      if (typeof config === 'string') {
        // 简单字符串模板
        return this.processTemplate(config, data);
      }

      if (typeof config === 'object' && config.template) {
        // 对象配置模板
        const template = config.template;
        const processedTemplate = this.processOptionalFields(template, data, config.optional || {});
        return this.replaceVariables(processedTemplate, data);
      }

      // 直接作为模板处理
      return this.processTemplate(config, data);
    } catch (error) {
      throw new ParserError(`Render failed for ${this.getType()}: ${error.message}`);
    }
  }

  /**
   * 处理模板字符串（支持占位符条件渲染）
   * @param {string} template - 模板字符串
   * @param {Object} data - 数据对象
   * @returns {string} 处理后的模板
   */
  processTemplate(template, data) {
    if (!template || typeof template !== 'string') {
      return '';
    }

    // 1. 处理占位符条件渲染 {{?field}}
    let processedTemplate = this.processOptionalPlaceholders(template, data);
    
    // 2. 处理旧式条件渲染（向后兼容）
    processedTemplate = this.processLegacyConditionals(processedTemplate, data);
    
    // 3. 处理普通变量替换
    return this.replaceVariables(processedTemplate, data);
  }

  /**
   * 处理占位符条件渲染 {{?field}}
   * @param {string} template - 模板字符串
   * @param {Object} data - 数据对象
   * @returns {string} 处理后的模板
   */
  processOptionalPlaceholders(template, data) {
    // 匹配 {{?fieldName}} 格式
    return template.replace(/\{\{\?(\w+)\}\}/g, (match, fieldName) => {
      return data[fieldName] ? String(data[fieldName]) : '';
    });
  }

  /**
   * 处理可选字段（与配置结合使用）
   * @param {string} template - 模板字符串
   * @param {Object} data - 数据对象
   * @param {Object} optionalConfigs - 可选字段配置
   * @returns {string} 处理后的模板
   */
  processOptionalFields(template, data, optionalConfigs) {
    return template.replace(/\{\{\?(\w+)\}\}/g, (match, fieldName) => {
      if (data[fieldName] && optionalConfigs[fieldName]) {
        // 渲染可选内容
        return this.replaceVariables(optionalConfigs[fieldName], {
          value: data[fieldName]
        });
      }
      return ''; // 字段不存在或为空时，移除占位符
    });
  }

  /**
   * 处理旧式条件渲染（向后兼容）
   * @param {string} template - 模板字符串
   * @param {Object} data - 数据对象
   * @returns {string} 处理后的模板
   */
  processLegacyConditionals(template, data) {
    // 处理 {{#field}}...{{/field}} 格式
    return template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, fieldName, content) => {
      return data[fieldName] ? content : '';
    });
  }

  /**
   * 替换模板中的变量
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {string} 替换后的字符串
   */
  replaceVariables(template, variables) {
    if (!template || typeof template !== 'string') {
      return '';
    }

    let result = template;

    try {
      // 替换所有变量
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        const stringValue = value !== null && value !== undefined ? String(value) : '';
        result = result.replace(
          new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'),
          stringValue
        );
      });

      // 清理未替换的变量
      result = result.replace(/{{[^}]+}}/g, '');

      return result;
    } catch (error) {
      throw new ParserError(`Variable replacement failed for ${this.getType()}: ${error.message}`);
    }
  }

  /**
   * 通用模板渲染方法
   * @param {string} blockType - 块类型
   * @param {Object} variables - 变量对象
   * @param {string} subType - 子类型（可选）
   * @returns {string} 渲染后的HTML字符串
   */
  renderWithTemplate(blockType, variables, subType = null) {
    try {
      const template = this.templateLoader.getBlockTemplate(blockType, subType) ||
        (subType ? this.templateLoader.getBlockTemplate(blockType) : null);

      if (!template) {
        throw new ParserError(`Template not found: ${blockType}${subType ? '.' + subType : ''}`);
      }

      return this.renderTemplate(template, variables);
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Render failed for ${blockType}: ${error.message}`);
    }
  }

  /**
   * 带条件性内容的模板渲染方法（向后兼容）
   * @param {string} blockType - 块类型
   * @param {Object} variables - 变量对象
   * @param {string} conditionalKey - 条件性内容的键名
   * @returns {string} 渲染后的HTML字符串
   * @deprecated 使用 renderTemplate 和占位符语法替代
   */
  renderWithConditionalTemplate(blockType, variables, conditionalKey) {
    logger.warn('renderWithConditionalTemplate 已弃用，建议使用 renderTemplate 和占位符语法');
    
    try {
      const template = this.templateLoader.getBlockTemplate(blockType);
      if (!template) {
        throw new ParserError(`Template not found: ${blockType}`);
      }

      // 处理条件性内容显示
      const hasConditionalContent = variables[conditionalKey];
      const conditionalRegex = new RegExp(
        `\\{\\{#${conditionalKey}\\}\\}([\\s\\S]*?)\\{\\{\\/${conditionalKey}\\}\\}`,
        'g'
      );

      const processedTemplate = hasConditionalContent
        ? template.replace(conditionalRegex, '$1')
        : template.replace(conditionalRegex, '');

      return this.replaceVariables(processedTemplate, variables);
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Conditional render failed for ${blockType}: ${error.message}`);
    }
  }

  /**
   * 转义HTML特殊字符
   * @param {string} text - 需要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
  }
}

export default BaseBlockRenderer;