/**
 * 导出入口
 * 统一导出converter模块的所有功能
 */

// 导出主要类
export { EditorJSParser } from './parser.js';
export { TemplateEngine } from './template-engine.js';
export { StyleCompiler } from './style-compiler.js';

// 导入工具函数
import {
  camelToKebab,
  escapeHTML,
  deepMerge,
  validateBlock,
  stylesToCSS,
  generateId,
  isEmpty,
  safeGet,
  stripHTML,
  formatFileSize
} from './utils.js';

// 导出工具函数
export {
  camelToKebab,
  escapeHTML,
  deepMerge,
  validateBlock,
  stylesToCSS,
  generateId,
  isEmpty,
  safeGet,
  stripHTML,
  formatFileSize
};

// 导出配置
export { blockTemplates, inlineStyles } from './config.js';

// 默认导出解析器
export { EditorJSParser as default } from './parser.js';

/**
 * 便捷函数：快速解析EditorJS数据
 * @param {object} editorData - EditorJS数据
 * @param {object} options - 解析选项
 * @returns {string} HTML字符串
 */
export function parseEditorJS(editorData, options = {}) {
  const parser = new EditorJSParser(options);
  return parser.parse(editorData, options);
}

/**
 * 便捷函数：创建解析器实例
 * @param {object} options - 配置选项
 * @returns {EditorJSParser} 解析器实例
 */
export function createParser(options = {}) {
  return new EditorJSParser(options);
}

/**
 * 便捷函数：解析单个block
 * @param {object} block - block数据
 * @param {object} options - 解析选项
 * @returns {string} HTML字符串
 */
export function parseBlock(block, options = {}) {
  const parser = new EditorJSParser(options);
  return parser.parseBlock(block, options);
}

/**
 * 便捷函数：预览block渲染结果
 * @param {object} block - block数据
 * @param {object} options - 选项
 * @returns {string} HTML字符串
 */
export function previewBlock(block, options = {}) {
  const parser = new EditorJSParser(options);
  return parser.previewBlock(block, options);
}

/**
 * 便捷函数：验证EditorJS数据格式
 * @param {object} data - 数据
 * @returns {boolean} 是否有效
 */
export function validateEditorData(data) {
  if (!data || typeof data !== 'object') return false;
  if (!Array.isArray(data.blocks)) return false;
  
  return data.blocks.every(block => validateBlock(block));
}

/**
 * 便捷函数：获取支持的block类型
 * @param {object} options - 配置选项
 * @returns {array} 支持的block类型数组
 */
export function getSupportedBlockTypes(options = {}) {
  const parser = new EditorJSParser(options);
  return parser.getSupportedBlockTypes();
}

/**
 * 便捷函数：检查是否支持指定block类型
 * @param {string} type - block类型
 * @param {object} options - 配置选项
 * @returns {boolean} 是否支持
 */
export function supportsBlockType(type, options = {}) {
  const parser = new EditorJSParser(options);
  return parser.supportsBlockType(type);
}

/**
 * 版本信息
 */
export const VERSION = '1.0.0';

/**
 * 模块信息
 */
export const MODULE_INFO = {
  name: 'EditorJS to HTML Converter',
  version: VERSION,
  description: 'Convert EditorJS data to HTML with customizable templates and styles',
  author: 'FlowEdit Team',
  features: [
    'Template-based rendering',
    'Customizable styles',
    'Caching support',
    'Error handling',
    'Extensible architecture',
    'Performance monitoring'
  ]
};
