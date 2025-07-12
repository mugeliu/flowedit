/**
 * 块渲染器基类
 * 为所有块渲染器提供通用接口和辅助方法
 */
import { createLogger } from '../../../services/simple-logger.js';

const logger = createLogger('BaseBlockRenderer');

class BaseBlockRenderer {
  constructor(templateLoader, inlineStyleProcessor) {
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
   * 处理内联样式
   * @param {string} text - 原始文本
   * @param {Renderer} renderer - 主渲染器实例
   * @returns {string} 处理后的HTML文本
   */
  processInlineStyles(text, renderer) {
    if (!text || typeof text !== 'string') {
      return text || '';
    }

    return this.inlineStyleProcessor.processAnchorTags(
      this.inlineStyleProcessor.processNonLinkStyles(text),
      renderer
    );
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
  }

  /**
   * 通用模板渲染方法
   * @param {string} blockType - 块类型
   * @param {Object} variables - 变量对象
   * @param {string} subType - 子类型（可选）
   * @returns {string} 渲染后的HTML字符串
   */
  renderWithTemplate(blockType, variables, subType = null) {
    const template = this.templateLoader.getBlockTemplate(blockType, subType) ||
      (subType ? this.templateLoader.getBlockTemplate(blockType) : null);

    return template ? this.replaceVariables(template, variables) : '';
  }

  /**
   * 带条件性内容的模板渲染方法
   * @param {string} blockType - 块类型
   * @param {Object} variables - 变量对象
   * @param {string} conditionalKey - 条件性内容的键名
   * @returns {string} 渲染后的HTML字符串
   */
  renderWithConditionalTemplate(blockType, variables, conditionalKey) {
    const template = this.templateLoader.getBlockTemplate(blockType);
    if (!template) {
      return '';
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