/**
 * 块渲染器基类
 * 为所有块渲染器提供通用接口和辅助方法
 * 优化版本：支持占位符条件渲染，使用简化错误处理
 */

import { createLogger } from "../../../../shared/services/logger.js";
import { ParserError, processTemplate, replaceVariables, escapeHtml } from '../utils.js';

// 创建模块日志器
const logger = createLogger('BaseBlockRenderer');

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
   * @returns {Promise<string>} HTML字符串
   */
  async render(data, renderer) {
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
   * @returns {Promise<string>} 处理后的HTML文本
   */
  async processInlineStyles(text, renderer) {
    if (!text || typeof text !== 'string') {
      return text || '';
    }

    if (!renderer) {
      logger.warn('renderer 参数是必需的');
      return text;
    }

    try {
      // 使用 renderer 的统一接口
      return await renderer.processInlineStyles(text);
    } catch (error) {
      logger.error('处理内联样式失败:', error);
      return text; // 发生错误时返回原文本
    }
  }

  /**
   * 渲染模板（使用共享工具函数）
   * @param {Object|string} config - 模板配置
   * @param {Object} data - 数据对象
   * @returns {string} 渲染后的HTML
   */
  renderTemplate(config, data) {
    try {
      if (typeof config === 'string') {
        // 简单字符串模板
        return processTemplate(config, data);
      }

      if (typeof config === 'object' && config.template) {
        // 对象配置模板
        const template = config.template;
        const processedTemplate = this.processOptionalFields(template, data, config.optional || {});
        return replaceVariables(processedTemplate, data);
      }

      // 直接作为模板处理
      return processTemplate(config, data);
    } catch (error) {
      throw new ParserError(`Render failed for ${this.getType()}: ${error.message}`);
    }
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
        return replaceVariables(optionalConfigs[fieldName], {
          value: data[fieldName]
        });
      }
      return ''; // 字段不存在或为空时，移除占位符
    });
  }

  /**
   * 通用模板渲染方法（使用共享工具函数）
   * @param {string} blockType - 块类型
   * @param {Object} variables - 变量对象
   * @param {string} subType - 子类型（可选）
   * @returns {Promise<string>} 渲染后的HTML字符串
   */
  async renderWithTemplate(blockType, variables, subType = null) {
    try {
      const template = await this.templateLoader.getBlockTemplate(blockType, subType) ||
        (subType ? await this.templateLoader.getBlockTemplate(blockType) : null);

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
   * 替换变量（兼容性方法）
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {string} 替换后的字符串
   */
  replaceVariables(template, variables) {
    return replaceVariables(template, variables);
  }

  /**
   * HTML转义（兼容性方法）
   * @param {string} text - 需要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    return escapeHtml(text);
  }
}

export default BaseBlockRenderer;