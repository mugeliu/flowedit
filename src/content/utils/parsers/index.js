/**
 * HTML解析器模块主入口
 * 提供统一的导出接口和工厂方法
 * 重构后的版本，职责清晰，依赖关系简单
 * 
 * 优化特性：
 * - 实例缓存机制：避免重复创建解析器实例
 * - 参数传递优化：减少重复的参数传递
 * - 精简API：移除低频使用的便捷方法
 */

import { TemplateManager } from "./template-manager.js";
import { ProcessorRegistry } from "./processor-registry.js";
import { HtmlParser } from "./html-parser.js";
// config-manager.js 已移除 - 功能未被实际使用
import {
  BaseBlockProcessor,
  HeaderBlockProcessor,
  CodeBlockProcessor,
  RawBlockProcessor,
  QuoteBlockProcessor,
  ListBlockProcessor,
  DelimiterBlockProcessor,
  ImageBlockProcessor,
} from "./block-processor.js";

// 缓存解析器实例以避免重复创建
let defaultParserInstance = null;
const parserCache = new Map();

/**
 * 获取或创建解析器实例（带缓存机制）
 * @param {Object} options 解析选项
 * @returns {HtmlParser} HTML解析器实例
 */
function getParserInstance(options = {}) {
  // 如果没有选项，使用默认实例
  if (Object.keys(options).length === 0) {
    if (!defaultParserInstance) {
      defaultParserInstance = new HtmlParser();
    }
    return defaultParserInstance;
  }
  
  // 为有选项的情况创建缓存键
  const cacheKey = JSON.stringify(options);
  if (!parserCache.has(cacheKey)) {
    parserCache.set(cacheKey, new HtmlParser(options));
  }
  return parserCache.get(cacheKey);
}

/**
 * 清理解析器缓存（用于内存管理）
 * @param {boolean} clearDefault 是否清理默认实例
 */
export function clearParserCache(clearDefault = false) {
  parserCache.clear();
  if (clearDefault) {
    defaultParserInstance = null;
  }
}

/**
 * 获取当前缓存状态信息
 * @returns {Object} 缓存状态
 */
export function getCacheInfo() {
  return {
    cacheSize: parserCache.size,
    hasDefaultInstance: defaultParserInstance !== null
  };
}

/**
 * 创建HTML解析器实例的工厂方法
 * @param {Object} options 解析选项
 * @returns {HtmlParser} HTML解析器实例
 */
export function createHtmlParser(options = {}) {
  return new HtmlParser(options);
}

/**
 * 解析EditorJS数据为HTML
 * @param {Object} editorData - EditorJS数据对象
 * @param {Object} options - 解析选项
 * @returns {string} 生成的HTML字符串
 */
export function parseToHtml(editorData, options = {}) {
  console.log('[parseToHtml] 开始解析 - 数据:', editorData, '选项:', options);
  try {
    const parser = new HtmlParser();
    const result = parser.parseDocument(editorData, options);
    console.log('[parseToHtml] 解析完成 - 结果:', result);
    return result;
  } catch (error) {
    console.error('解析HTML时发生错误:', error);
    return '';
  }
}

/**
 * 安全解析EditorJS数据的便捷方法
 * @param {Object} editorData EditorJS数据
 * @param {Object} options 解析选项
 * @returns {Object} 解析结果（包含错误处理）
 */
export function safeParse(editorData, options = {}) {
  const parser = getParserInstance(options);
  return parser.safeParse(editorData, options);
}

/**
 * 获取支持的块类型列表
 * @returns {Array<string>} 支持的块类型
 */
export function getSupportedBlockTypes() {
  const parser = getParserInstance();
  return parser.getSupportedBlockTypes();
}

// 导出所有类和函数
export {
  TemplateManager,
  ProcessorRegistry,
  HtmlParser,
  // createConfig 和 mergeConfig 函数已移除
  BaseBlockProcessor,
  HeaderBlockProcessor,
  CodeBlockProcessor,
  RawBlockProcessor,
  QuoteBlockProcessor,
  ListBlockProcessor,
  DelimiterBlockProcessor,
  ImageBlockProcessor,
};

// 默认导出主解析器类
export default HtmlParser;
