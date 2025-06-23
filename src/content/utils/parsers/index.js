/**
 * HTML解析器模块主入口
 * 提供统一的导出接口和工厂方法
 * 重构后的版本，职责清晰，依赖关系简单
 */

import TemplateManager from "./template-manager.js";
import ProcessorRegistry from "./processor-registry.js";
import HtmlParser from "./html-parser.js";
import createConfig, {
  getDefaultConfig,
  mergeConfig,
} from "./config-manager.js";
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

/**
 * 创建HTML解析器实例的工厂方法
 * @param {Object} config 配置对象
 * @returns {HtmlParser} HTML解析器实例
 */
export function createHtmlParser(config = {}) {
  return new HtmlParser(config);
}

/**
 * 快速解析EditorJS数据为HTML的便捷方法
 * @param {Object} editorData EditorJS数据
 * @param {Object} config 配置选项
 * @returns {string} HTML字符串
 */
export function parseToHtml(editorData, config = {}) {
  const parser = createHtmlParser(config);
  return parser.parseDocument(editorData, config.options);
}

/**
 * 快速解析EditorJS数据并返回元数据的便捷方法
 * @param {Object} editorData EditorJS数据
 * @param {Object} config 配置选项
 * @returns {Object} 包含HTML和元数据的对象
 */
export function parseWithMetadata(editorData, config = {}) {
  const parser = createHtmlParser(config);
  return parser.parseWithMeta(editorData, config.options);
}

/**
 * 安全解析EditorJS数据的便捷方法
 * @param {Object} editorData EditorJS数据
 * @param {Object} config 配置选项
 * @returns {Object} 解析结果（包含错误处理）
 */
export function safeParse(editorData, config = {}) {
  const parser = createHtmlParser(config);
  return parser.safeParse(editorData, config.options);
}

/**
 * 验证EditorJS数据格式的便捷方法
 * @param {Object} editorData EditorJS数据
 * @param {Object} config 配置选项
 * @returns {Object} 验证结果
 */
export function validateEditorData(editorData, config = {}) {
  const parser = createHtmlParser(config);
  return parser.validateEditorData(editorData);
}

// 直接导出获取默认配置的函数
export { getDefaultConfig };

/**
 * 获取支持的块类型列表
 * @param {Object} config 配置选项
 * @returns {Array<string>} 支持的块类型
 */
export function getSupportedBlockTypes(config = {}) {
  const parser = createHtmlParser(config);
  return parser.getSupportedBlockTypes();
}

// 导出所有类和函数
export {
  TemplateManager,
  ProcessorRegistry,
  HtmlParser,
  createConfig,
  mergeConfig,
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
