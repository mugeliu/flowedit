/**
 * HTML解析器模块主入口
 * 提供统一的导出接口和工厂方法
 * 重构后的版本，职责清晰，依赖关系简单
 */

import TemplateManager from './template-manager.js';
import ProcessorRegistry from './processor-registry.js';
import HtmlParser from './html-parser.js';
import ConfigManager from './config-manager.js';
import {
  BaseBlockProcessor,
  HeaderBlockProcessor,
  CodeBlockProcessor,
  RawBlockProcessor,
  QuoteBlockProcessor,
  ListBlockProcessor,
  DelimiterBlockProcessor,
  ImageBlockProcessor
} from './block-processor.js';

/**
 * 创建HTML解析器实例的工厂方法
 * @param {Object} config 配置对象
 * @returns {HtmlParser} HTML解析器实例
 */
export function createHtmlParser(config = {}) {
  return new HtmlParser(config);
}

/**
 * 创建配置管理器实例的工厂方法
 * @param {Object} initialConfig 初始配置
 * @returns {ConfigManager} 配置管理器实例
 */
export function createConfigManager(initialConfig = {}) {
  return new ConfigManager(initialConfig);
}

/**
 * 创建模板管理器实例的工厂方法
 * @param {Object} customTemplates 自定义模板
 * @returns {TemplateManager} 模板管理器实例
 */
export function createTemplateManager(customTemplates = {}) {
  return new TemplateManager(customTemplates);
}

/**
 * 创建处理器注册表实例的工厂方法
 * @param {TemplateManager} templateManager 模板管理器实例
 * @returns {ProcessorRegistry} 处理器注册表实例
 */
export function createProcessorRegistry(templateManager) {
  return new ProcessorRegistry(templateManager);
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

/**
 * 获取默认配置的便捷方法
 * @returns {Object} 默认配置
 */
export function getDefaultConfig() {
  const configManager = createConfigManager();
  return configManager.getDefaultConfig();
}

/**
 * 获取支持的块类型列表
 * @param {Object} config 配置选项
 * @returns {Array<string>} 支持的块类型
 */
export function getSupportedBlockTypes(config = {}) {
  const parser = createHtmlParser(config);
  return parser.getSupportedBlockTypes();
}

/**
 * 预设配置
 */
export const presets = {
  /**
   * 基础配置 - 最小功能集
   */
  basic: {
    templates: {},
    processors: {
      header: { enabled: true, options: {} },
      paragraph: { enabled: true, options: {} },
      raw: { enabled: true, options: {} }
    },
    options: {
      skipEmpty: true,
      wrapInContainer: false,
      includeMetadata: false,
      strictMode: false
    }
  },

  /**
   * 标准配置 - 常用功能
   */
  standard: {
    templates: {},
    processors: {
      header: { enabled: true, options: {} },
      paragraph: { enabled: true, options: {} },
      list: { enabled: true, options: {} },
      quote: { enabled: true, options: {} },
      code: { enabled: true, options: {} },
      raw: { enabled: true, options: {} }
    },
    options: {
      skipEmpty: true,
      wrapInContainer: false,
      includeMetadata: false,
      strictMode: false
    }
  },

  /**
   * 完整配置 - 所有功能
   */
  full: {
    templates: {},
    processors: {
      header: { enabled: true, options: {} },
      paragraph: { enabled: true, options: {} },
      list: { enabled: true, options: {} },
      quote: { enabled: true, options: {} },
      code: { enabled: true, options: {} },
      raw: { enabled: true, options: {} },
      delimiter: { enabled: true, options: {} },
      image: { enabled: true, options: {} }
    },
    options: {
      skipEmpty: true,
      wrapInContainer: true,
      includeMetadata: true,
      strictMode: false,
      enableLogging: true
    }
  },

  /**
   * 严格模式配置 - 启用所有验证
   */
  strict: {
    templates: {},
    processors: {
      header: { enabled: true, options: {} },
      paragraph: { enabled: true, options: {} },
      list: { enabled: true, options: {} },
      quote: { enabled: true, options: {} },
      code: { enabled: true, options: {} },
      raw: { enabled: true, options: {} },
      delimiter: { enabled: true, options: {} },
      image: { enabled: true, options: {} }
    },
    options: {
      skipEmpty: true,
      wrapInContainer: true,
      includeMetadata: true,
      strictMode: true,
      enableLogging: true,
      maxBlockSize: 500000, // 500KB
      timeout: 3000 // 3秒
    }
  }
};

/**
 * 使用预设配置创建解析器
 * @param {string} presetName 预设名称
 * @param {Object} overrides 覆盖配置
 * @returns {HtmlParser} HTML解析器实例
 */
export function createParserWithPreset(presetName, overrides = {}) {
  if (!presets[presetName]) {
    throw new Error(`未知的预设配置: ${presetName}`);
  }
  
  const configManager = createConfigManager(presets[presetName]);
  if (Object.keys(overrides).length > 0) {
    configManager.updateConfig(overrides);
  }
  
  return createHtmlParser(configManager.getConfig());
}

/**
 * 版本信息
 */
export const version = '2.0.0';

/**
 * 模块信息
 */
export const moduleInfo = {
  name: 'HTML Parser',
  version,
  description: '重构后的EditorJS HTML解析器，职责清晰，依赖简单',
  author: 'FlowEdit Team',
  dependencies: {
    'TemplateManager': '管理HTML模板',
    'ProcessorRegistry': '管理块处理器',
    'HtmlParser': '主解析逻辑',
    'ConfigManager': '配置管理',
    'BlockProcessor': '块处理器基类和实现'
  },
  architecture: {
    dependencyFlow: 'HtmlParser → ProcessorRegistry → BlockProcessor → TemplateManager',
    principles: ['单一职责', '依赖注入', '配置驱动', '可扩展性']
  }
};

// 导出所有类
export {
  TemplateManager,
  ProcessorRegistry,
  HtmlParser,
  ConfigManager,
  BaseBlockProcessor,
  HeaderBlockProcessor,
  CodeBlockProcessor,
  RawBlockProcessor,
  QuoteBlockProcessor,
  ListBlockProcessor,
  DelimiterBlockProcessor,
  ImageBlockProcessor
};

// 默认导出主解析器类
export default HtmlParser;