/**
 * Parsers 模块共享工具函数
 * 整合所有重复的工具函数，提供统一的实现
 */

import { createLogger } from "../logger.js";

const logger = createLogger('ParsersUtils');

/**
 * 转义 HTML 特殊字符
 * @param {string} text 需要转义的文本
 * @returns {string} 转义后的文本
 */
export function escapeHtml(text) {
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

/**
 * 替换模板中的变量
 * @param {string} template 模板字符串
 * @param {Object} variables 变量对象
 * @returns {string} 替换后的字符串
 */
export function replaceVariables(template, variables) {
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
    logger.error('变量替换失败:', error);
    return template;
  }
}

/**
 * 检查是否为有效的URL格式
 * @param {string} url 要检查的URL字符串
 * @returns {boolean} 是否为有效URL
 */
export function isValidUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('.');
  } catch {
    return false;
  }
}

/**
 * 验证 EditorJS 数据格式
 * @param {Object} data EditorJS 数据对象
 * @returns {boolean} 是否有效
 */
export function validateEditorData(data) {
  return data && 
         data.blocks && 
         Array.isArray(data.blocks) &&
         data.blocks.every(block => block && block.type);
}

/**
 * 处理条件渲染占位符 {{?field}}
 * @param {string} template 模板字符串
 * @param {Object} data 数据对象
 * @returns {string} 处理后的模板
 */
export function processOptionalPlaceholders(template, data) {
  if (!template || typeof template !== 'string') {
    return '';
  }
  
  // 匹配 {{?fieldName}} 格式
  return template.replace(/\{\{\?(\w+)\}\}/g, (match, fieldName) => {
    return data[fieldName] ? String(data[fieldName]) : '';
  });
}

/**
 * 处理旧式条件渲染 {{#field}}...{{/field}}
 * @param {string} template 模板字符串
 * @param {Object} data 数据对象
 * @returns {string} 处理后的模板
 */
export function processLegacyConditionals(template, data) {
  if (!template || typeof template !== 'string') {
    return '';
  }
  
  // 处理 {{#field}}...{{/field}} 格式
  return template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, fieldName, content) => {
    return data[fieldName] ? content : '';
  });
}

/**
 * 完整的模板处理函数
 * @param {string} template 模板字符串
 * @param {Object} data 数据对象
 * @returns {string} 处理后的HTML
 */
export function processTemplate(template, data) {
  if (!template || typeof template !== 'string') {
    return '';
  }

  try {
    // 1. 处理占位符条件渲染 {{?field}}
    let processedTemplate = processOptionalPlaceholders(template, data);
    
    // 2. 处理旧式条件渲染
    processedTemplate = processLegacyConditionals(processedTemplate, data);
    
    // 3. 处理普通变量替换
    return replaceVariables(processedTemplate, data);
  } catch (error) {
    logger.error('模板处理失败:', error);
    return template;
  }
}

/**
 * 自定义错误类
 */
export class ParserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParserError';
  }
}