/**
 * TemplateManager 类
 * 负责管理和处理层级模板、样式和主题配置
 * 重构版本，适配新的层级模板系统
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
   * 获取灵活模板
   * @param {string} category 模板类别
   * @param {string} variant 模板变体，默认为'default'
   * @returns {Object|null} 模板对象或null
   */
  getFlexibleTemplate(category, variant = 'default') {
    console.log(`[TemplateManager.getFlexibleTemplate] 获取模板 - 类别:${category}, 变体:${variant}`);
    const categoryTemplates = this.templates[category];
    console.log(`[TemplateManager.getFlexibleTemplate] 类别模板:`, categoryTemplates);
    if (!categoryTemplates) {
      console.warn(`[TemplateManager.getFlexibleTemplate] 未找到类别模板:${category}`);
      return null;
    }
    
    const result = categoryTemplates[variant] || null;
    console.log(`[TemplateManager.getFlexibleTemplate] 获取结果:`, result);
    return result;
  }

  /**
   * 构建嵌套HTML
   * @param {Array} layers - 层级配置数组
   * @param {string} content - 内容
   * @param {Object} blockInlineStyles - 内联样式配置
   * @param {Object} extraData - 额外数据（如图片的url、caption等）
   * @returns {string} 渲染后的HTML
   */
  buildNestedHTML(layers, content, blockInlineStyles = {}, extraData = {}) {
    console.log(`[TemplateManager.buildNestedHTML] 构建嵌套HTML - 层级:`, layers, '内容:', content, '额外数据:', extraData, '块样式:', blockInlineStyles);
    if (!Array.isArray(layers) || layers.length === 0) {
      console.log(`[TemplateManager.buildNestedHTML] 无层级配置，返回原始内容`);
      return content;
    }

    // 从最内层开始构建
    let result = content;
    console.log(`[TemplateManager.buildNestedHTML] 初始HTML:`, result);
    
    // 反向遍历层级，从内到外构建
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      console.log(`[TemplateManager.buildNestedHTML] 处理第${i}层:`, layer);
      result = this.buildSingleLayer(layer, result, blockInlineStyles, extraData);
      console.log(`[TemplateManager.buildNestedHTML] 第${i}层构建后:`, result);
    }

    console.log(`[TemplateManager.buildNestedHTML] 最终嵌套HTML:`, result);
    return result;
  }

  /**
   * 构建单个层级
   * @param {Object} layer - 层级配置
   * @param {string} content - 内容
   * @param {Object} blockInlineStyles - 内联样式配置
   * @param {Object} extraData - 额外数据
   * @returns {string} 渲染后的HTML
   */
  buildSingleLayer(layer, content, blockInlineStyles = {}, extraData = {}) {
    const { tag, style = '', content: isContentLayer = false, inlineStyleHandling } = layer;
    
    // 处理样式中的主题变量
    const processedStyle = this.processThemeVariables(style);
    
    // 处理额外数据变量（如图片的url、caption等）
    const finalStyle = this.processExtraDataVariables(processedStyle, extraData);
    
    // 如果是内容层级
    if (isContentLayer) {
      // 处理内联样式
      const processedContent = this.handleInlineStyles(content, inlineStyleHandling, blockInlineStyles);
      
      // 构建HTML标签
      return this.buildHtmlTag(tag, finalStyle, processedContent);
    }
    
    // 非内容层级，直接包装
    return this.buildHtmlTag(tag, finalStyle, content);
  }

  /**
   * 处理内联样式
   * @param {string} content - 内容
   * @param {Object} inlineStyleHandling - 内联样式处理配置
   * @param {Object} blockInlineStyles - 内联样式配置
   * @returns {string} 处理后的内容
   */
  handleInlineStyles(content, inlineStyleHandling, blockInlineStyles) {
    if (!inlineStyleHandling || !content) {
      return content;
    }

    const { strategy = 'merge', needWrapper = false, priority = 'template' } = inlineStyleHandling;
    
    if (strategy === 'merge') {
      return this.processInlineStyles(content, blockInlineStyles);
    }
    
    return content;
  }

  /**
   * 处理内联样式，将简单标签转换为带样式的HTML
   * @param {string} text - 原始文本
   * @param {Object} inlineStyles - 内联样式配置
   * @returns {string} 处理后的文本
   */
  processInlineStyles(text, inlineStyles = {}) {
    if (!text) return '';
    
    let processedText = text;
    
    // 处理各种内联标签
    Object.entries(inlineStyles).forEach(([tag, style]) => {
      const processedStyle = this.processThemeVariables(style);
      const regex = new RegExp(`<${tag}([^>]*)>([^<]*)</${tag}>`, 'gi');
      
      processedText = processedText.replace(regex, (match, attrs, content) => {
        // 合并现有属性和新样式
        const existingStyle = this.extractStyleFromAttrs(attrs);
        const mergedStyle = this.mergeStyles(existingStyle, processedStyle);
        
        return `<${tag} style="${mergedStyle}">${content}</${tag}>`;
      });
    });
    
    return processedText;
  }

  /**
   * 从属性字符串中提取样式
   * @param {string} attrs - 属性字符串
   * @returns {string} 样式字符串
   */
  extractStyleFromAttrs(attrs) {
    if (!attrs) return '';
    
    const styleMatch = attrs.match(/style=["']([^"']*)["']/);
    return styleMatch ? styleMatch[1] : '';
  }

  /**
   * 合并样式
   * @param {string} style1 - 样式1
   * @param {string} style2 - 样式2
   * @returns {string} 合并后的样式
   */
  mergeStyles(style1, style2) {
    if (!style1) return style2;
    if (!style2) return style1;
    
    // 简单合并，style2优先级更高
    return `${style1}; ${style2}`;
  }

  /**
   * 构建HTML标签
   * @param {string} tag - 标签名
   * @param {string} style - 样式
   * @param {string} content - 内容
   * @returns {string} HTML标签
   */
  buildHtmlTag(tag, style, content) {
    console.log(`[TemplateManager.buildHtmlTag] 构建标签 - 标签:${tag}, 样式:`, style, '内容:', content);
    if (!tag) return content;
    
    // 特殊处理自闭合标签
    const selfClosingTags = ['img', 'hr', 'br', 'input'];
    
    if (selfClosingTags.includes(tag.toLowerCase())) {
      const styleAttr = style ? ` style="${style}"` : '';
      const result = `<${tag}${styleAttr} />`;
      console.log(`[TemplateManager.buildHtmlTag] 自闭合标签构建结果:`, result);
      return result;
    }
    
    const styleAttr = style ? ` style="${style}"` : '';
    const result = `<${tag}${styleAttr}>${content}</${tag}>`;
    console.log(`[TemplateManager.buildHtmlTag] 构建结果:`, result);
    return result;
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
   * 处理额外数据变量（如图片的url、caption等）
   * @param {string} styleString - 样式字符串
   * @param {Object} extraData - 额外数据
   * @returns {string} 处理后的样式字符串
   */
  processExtraDataVariables(styleString, extraData) {
    if (!styleString || !extraData) return styleString;
    
    let processedString = styleString;
    
    Object.entries(extraData).forEach(([key, value]) => {
      const regex = new RegExp(`\{\{${key}\}\}`, 'g');
      processedString = processedString.replace(regex, value || '');
    });
    
    return processedString;
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
   * 获取内联样式配置
   * @returns {Object} 内联样式配置
   */
  getBlockInlineStyles() {
    return this.blockInlineStyles;
  }

  /**
   * 获取主题配置
   * @returns {Object} 主题对象
   */
  getTheme() {
    return this.theme;
  }

  /**
   * 获取所有模板配置
   * @returns {Object} 模板配置
   */
  getTemplates() {
    return this.templates;
  }
}
