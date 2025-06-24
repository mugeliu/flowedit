/**
 * TemplateManager 类
 * 专门负责管理HTML模板配置
 * 简化版本，避免过度设计
 */

import { flexibleTemplatesWithInlineStyles, theme, blockInlineStyles } from '../../config/style-template.js';

/**
 * 模板管理器类
 * 负责管理和处理各种模板、样式和主题配置
 */
export class TemplateManager {
  constructor() {
    this.templates = flexibleTemplatesWithInlineStyles;
    this.theme = theme;
    this.blockInlineStyles = blockInlineStyles;
  }

  /**
   * 获取模板
   * @param {string} type - 模板类型 (如 'header', 'paragraph')
   * @param {string} variant - 变体 (如 'h1', 'h2', 'default')
   * @returns {string|null} 模板字符串
   */
  getTemplate(type, variant = 'default') {
    return this.templates[type]?.[variant] || null;
  }

  /**
   * 渲染模板
   * @param {string} template - 模板字符串
   * @param {string} content - 内容
   * @param {Object} styles - 样式对象
   * @returns {string} 渲染后的HTML
   */
  renderTemplate(template, content, styles = {}) {
    if (!template) return content;
    
    // 处理主题变量
    let processedTemplate = this.processThemeVariables(template);
    
    // 替换内容占位符
    processedTemplate = processedTemplate.replace(/\{\{content\}\}/g, content);
    
    // 处理样式变量
    Object.entries(styles).forEach(([key, value]) => {
      const regex = new RegExp(`\{\{${key}\}\}`, 'g');
      processedTemplate = processedTemplate.replace(regex, value);
    });
    
    return processedTemplate;
  }

  /**
   * 处理样式字符串中的主题变量
   * @param {string} styleString - 样式字符串
   * @returns {string} 处理后的样式字符串
   */
  processThemeVariables(styleString) {
    if (!styleString) return '';
    
    return styleString.replace(/\{\{theme\.([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(this.theme, path);
      return value !== undefined ? value : match;
    });
  }

  /**
   * 获取嵌套对象的值
   * @param {Object} obj - 对象
   * @param {string} path - 路径（用点分隔）
   * @returns {*} 值
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 获取主题配置
   * @returns {Object} 主题对象
   */
  getTheme() {
    return this.theme;
  }

}
