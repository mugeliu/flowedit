/**
 * EditorJS HTML Parser
 * 简化设计，提供核心解析功能和样式支持
 */

// 导入解析器
import defaultParsers from './blocks/index.js';
// 导入样式配置
import { defaultStyleConfig } from '../../config/style-config.js';

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
 * @property {Function} styleProvider - 样式提供函数
 */

/**
 * 处理单个块的解析
 * @param {Object} block - EditorJS 块数据
 * @param {Object} parsers - 解析器映射对象
 * @param {Options} options - 解析选项
 * @returns {string} HTML 字符串
 */
function parseBlock(block, parsers, options) {
  if (block.type in parsers) {
    const parserOptions = { styleProvider: options.styleProvider };
    return parsers[block.type](block, parserOptions);
  }

  const error = `[editorjs-html]: Parser function for ${block.type} does not exist`;
  if (options.strict) {
    throw new Error(error);
  } else {
    console.error(error);
    return '';
  }
}

/**
 * 解析整个 EditorJS 数据
 * @param {Object} editorData - EditorJS 输出数据，包含 blocks 数组
 * @param {Object} parsers - 解析器映射对象
 * @param {Options} options - 解析选项
 * @returns {string} HTML 字符串
 */
function parse({ blocks }, parsers, options) {
  return blocks.reduce((accumulator, block) => {
    return accumulator + parseBlock(block, parsers, options);
  }, '');
}

/**
 * 创建解析器实例
 * @param {Object} config - 配置对象
 * @param {Object} config.styleConfig - 样式配置对象，null表示无样式
 * @param {Object} config.plugins - 自定义解析器映射
 * @param {Object} config.options - 解析选项
 * @returns {Object} 解析器实例，包含 parse 和 parseBlock 方法
 */
export function createParser({
  styleConfig = null,
  plugins = {},
  options = { strict: false }
} = {}) {
  const combinedParsers = { ...defaultParsers, ...plugins };
  const styleProvider = styleConfig ? createStyleProvider(styleConfig) : null;
  const parserOptions = { ...options, styleProvider };

  return {
    parse: (blocks) => parse(blocks, combinedParsers, parserOptions),
    parseBlock: (block) => parseBlock(block, combinedParsers, parserOptions),
  };
}

/**
 * 创建带默认样式的解析器实例（便捷函数）
 * @param {Object} plugins - 自定义解析器映射
 * @param {Object} options - 解析选项
 * @returns {Object} 解析器实例
 */
export function createStyledParser(plugins = {}, options = { strict: false }) {
  return createParser({
    styleConfig: defaultStyleConfig,
    plugins,
    options
  });
}

/**
 * 创建样式提供函数
 * @param {Object} styleConfig - 样式配置对象
 * @returns {Function} 样式提供函数
 */
export function createStyleProvider(styleConfig = defaultStyleConfig) {
  /**
   * 获取指定元素类型和变体的样式
   * @param {string} elementType - 元素类型 (header, paragraph, emphasis等)
   * @param {string} variant - 样式变体 (h1, h2, strong等)
   * @returns {Object} 合并后的样式对象
   */
  return function(elementType, variant = 'default') {
    const baseStyles = styleConfig.base || {};
    const elementStyles = styleConfig[elementType] || {};
    
    // 对于内联样式元素（emphasis），智能继承基础样式
    if (elementType === 'emphasis') {
      // 从基础样式中提取可继承的属性（颜色、字体等）
      const inheritableBaseStyles = {
        color: baseStyles.color,
        fontFamily: baseStyles.fontFamily,
        fontSize: baseStyles.fontSize
      };
      
      // 过滤掉undefined的属性
      const filteredBaseStyles = Object.fromEntries(
        Object.entries(inheritableBaseStyles).filter(([_, value]) => value !== undefined)
      );
      
      if (typeof elementStyles === 'object' && elementStyles[variant]) {
        return { ...filteredBaseStyles, ...elementStyles[variant] };
      }
      return { ...filteredBaseStyles, ...elementStyles };
    }
    
    // 对于块级元素，合并基础样式
    if (typeof elementStyles === 'object' && elementStyles[variant]) {
      return { ...baseStyles, ...elementStyles[variant] };
    }
    
    // 否则使用元素类型的默认样式
    return { ...baseStyles, ...elementStyles };
  };
}

// 导出样式配置相关
export { defaultStyleConfig } from '../../config/style-config.js';

// 默认导出主要的解析器创建函数
export default createParser;