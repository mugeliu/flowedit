/**
 * EditorJS HTML Parser
 * 完全参考 editorjs-html 的 main.ts 设计，增加样式支持功能
 */

// 导入解析器
import defaultParsers from './blocks/index.js';
// 导入样式配置
import { defaultStyleConfig, createStyleProvider } from './style-config.js';

/**
 * 解析器函数类型定义
 * @typedef {Function} ParserFunction
 * @param {Object} block - EditorJS 块数据
 * @returns {string} HTML 字符串
 */

/**
 * 解析选项类型定义
 * @typedef {Object} Options
 * @property {boolean} strict - 严格模式，遇到未知块类型时抛出错误
 * @property {Function} styleProvider - 样式提供函数，接收 (blockType, blockData) 参数，返回样式对象
 */

/**
 * 解析整个 EditorJS 数据
 * @param {Object} editorData - EditorJS 输出数据，包含 blocks 数组
 * @param {Object} parsers - 解析器映射对象
 * @param {Options} options - 解析选项
 * @returns {string} HTML 字符串
 */
const parse = (
  { blocks },
  parsers,
  options
) => {
  return blocks.reduce((accumulator, block) => {
    if (block.type in parsers) {
      // 传递styleProvider给解析器
      const parserOptions = { styleProvider: options.styleProvider };
      
      accumulator += parsers[block.type](block, parserOptions);
      return accumulator;
    }

    const error = `[editorjs-html]: Parser function for ${block.type} does not exist`;
    if (options.strict) {
      throw new Error(error);
    } else {
      console.error(error);
    }

    return accumulator;
  }, "");
};

/**
 * 解析单个块
 * @param {Object} block - EditorJS 块数据
 * @param {Object} parsers - 解析器映射对象
 * @param {Options} options - 解析选项
 * @returns {string} HTML 字符串
 */
const parseBlock = (
  block,
  parsers,
  options
) => {
  if (block.type in parsers) {
    // 传递styleProvider给解析器
    const parserOptions = { styleProvider: options.styleProvider };
    
    return parsers[block.type](block, parserOptions);
  }

  const error = `[editorjs-html]: Parser function for ${block.type} does not exist`;
  if (options.strict) {
    throw new Error(error);
  } else {
    console.error(error);
  }
};

/**
 * 创建解析器实例
 * @param {Object} plugins - 自定义解析器映射，默认为空对象
 * @param {Options} options - 解析选项，默认为 { strict: false }
 * @returns {Object} 解析器实例，包含 parse 和 parseBlock 方法
 */
const parser = (
  plugins = {},
  options = { strict: false, styleProvider: null }
) => {
  const combinedParsers = { ...defaultParsers, ...plugins };

  return {
    parse: (blocks) => parse(blocks, combinedParsers, options),
    parseBlock: (block) =>
      parseBlock(block, combinedParsers, options),
  };
};

/**
 * 创建带有默认样式的解析器实例
 * @param {Object} styleConfig - 样式配置对象，默认使用 defaultStyleConfig
 * @param {Object} plugins - 自定义解析器映射，默认为空对象
 * @param {Object} options - 其他解析选项，默认为 { strict: false }
 * @returns {Object} 解析器实例
 */
export const createStyledParser = (
  styleConfig = defaultStyleConfig,
  plugins = {},
  options = { strict: false }
) => {
  const styleProvider = createStyleProvider(styleConfig);
  return parser(plugins, { ...options, styleProvider });
};

/**
 * 创建使用默认样式配置的解析器实例
 * @param {Object} plugins - 自定义解析器映射，默认为空对象
 * @param {Object} options - 其他解析选项，默认为 { strict: false }
 * @returns {Object} 解析器实例
 */
export const createDefaultStyledParser = (
  plugins = {},
  options = { strict: false }
) => {
  return createStyledParser(defaultStyleConfig, plugins, options);
};

// 导出样式配置相关
export { defaultStyleConfig, createStyleProvider } from './style-config.js';

export default parser;