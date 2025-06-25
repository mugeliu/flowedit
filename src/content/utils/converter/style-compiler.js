/**
 * 样式编译器
 * 负责处理CSS样式的编译和优化
 */

import { stylesToCSS, camelToKebab, deepMerge } from './utils.js';

/**
 * 样式编译器类
 * 处理内联样式和CSS类的编译
 */
export class StyleCompiler {
  constructor(options = {}) {
    this.inlineStyles = options.inlineStyles || {};
    this.cache = new Map();
    this.options = {
      enableCache: true,
      minifyCSS: false,
      ...options
    };
  }

  /**
   * 编译样式对象为CSS字符串
   * @param {object} styles - 样式对象
   * @param {object} options - 编译选项
   * @returns {string} CSS字符串
   */
  compileStyles(styles, options = {}) {
    if (!styles || typeof styles !== 'object') return '';

    const cacheKey = this.options.enableCache ? JSON.stringify(styles) : null;
    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let cssString = stylesToCSS(styles);

    if (this.options.minifyCSS) {
      cssString = this.minifyCSS(cssString);
    }

    if (cacheKey) {
      this.cache.set(cacheKey, cssString);
    }

    return cssString;
  }

  /**
   * 编译内联样式标记
   * @param {string} text - 包含内联标记的文本
   * @param {object} customStyles - 自定义样式
   * @returns {string} 编译后的HTML
   */
  compileInlineStyles(text, customStyles = {}) {
    if (typeof text !== 'string') return text;

    const allStyles = deepMerge(this.inlineStyles, customStyles);
    let result = text;

    // 处理各种内联标记
    const inlinePatterns = {
      strong: /<strong[^>]*>(.*?)<\/strong>/gi,
      b: /<b[^>]*>(.*?)<\/b>/gi,
      em: /<em[^>]*>(.*?)<\/em>/gi,
      i: /<i[^>]*>(.*?)<\/i>/gi,
      u: /<u[^>]*>(.*?)<\/u>/gi,
      code: /<code[^>]*>(.*?)<\/code>/gi,
      mark: /<mark[^>]*>(.*?)<\/mark>/gi,
      a: /<a([^>]*)>(.*?)<\/a>/gi,
      sup: /<sup[^>]*>(.*?)<\/sup>/gi
    };

    for (const [tag, pattern] of Object.entries(inlinePatterns)) {
      if (allStyles[tag]) {
        const styleString = this.compileStyles(allStyles[tag]);
        
        if (tag === 'a') {
          // 特殊处理链接标签，保留原有属性
          result = result.replace(pattern, (match, attrs, content) => {
            const existingStyle = this.extractStyleFromAttrs(attrs);
            const mergedStyle = deepMerge(allStyles[tag], existingStyle);
            const finalStyle = this.compileStyles(mergedStyle);
            const cleanAttrs = this.removeStyleFromAttrs(attrs);
            return `<a${cleanAttrs} style="${finalStyle}">${content}</a>`;
          });
        } else {
          result = result.replace(pattern, `<${tag} style="${styleString}">$1</${tag}>`);
        }
      }
    }

    return result;
  }

  /**
   * 从属性字符串中提取样式
   * @param {string} attrs - 属性字符串
   * @returns {object} 样式对象
   */
  extractStyleFromAttrs(attrs) {
    const styleMatch = attrs.match(/style=["']([^"']*)["']/i);
    if (!styleMatch) return {};

    const styleString = styleMatch[1];
    const styles = {};

    styleString.split(';').forEach(rule => {
      const [property, value] = rule.split(':').map(s => s.trim());
      if (property && value) {
        // 转换为驼峰命名
        const camelProperty = property.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
        styles[camelProperty] = value;
      }
    });

    return styles;
  }

  /**
   * 从属性字符串中移除样式属性
   * @param {string} attrs - 属性字符串
   * @returns {string} 清理后的属性字符串
   */
  removeStyleFromAttrs(attrs) {
    return attrs.replace(/\s*style=["'][^"']*["']/gi, '');
  }

  /**
   * 压缩CSS字符串
   * @param {string} css - CSS字符串
   * @returns {string} 压缩后的CSS
   */
  minifyCSS(css) {
    return css
      .replace(/\s+/g, ' ')  // 合并空白字符
      .replace(/;\s*}/g, '}')  // 移除最后一个分号
      .replace(/\s*{\s*/g, '{')  // 清理大括号周围空格
      .replace(/}\s*/g, '}')  // 清理右大括号后空格
      .replace(/;\s*/g, ';')  // 清理分号后空格
      .replace(/:\s*/g, ':')  // 清理冒号后空格
      .trim();
  }

  /**
   * 合并多个样式对象
   * @param {...object} styleObjects - 样式对象
   * @returns {object} 合并后的样式对象
   */
  mergeStyles(...styleObjects) {
    return styleObjects.reduce((merged, styles) => {
      return deepMerge(merged, styles);
    }, {});
  }

  /**
   * 添加内联样式定义
   * @param {string} tag - 标签名
   * @param {object} styles - 样式对象
   */
  addInlineStyle(tag, styles) {
    this.inlineStyles[tag] = deepMerge(this.inlineStyles[tag] || {}, styles);
    this.clearCache();
  }

  /**
   * 获取内联样式定义
   * @param {string} tag - 标签名
   * @returns {object} 样式对象
   */
  getInlineStyle(tag) {
    return this.inlineStyles[tag] || {};
  }

  /**
   * 检查是否有指定标签的样式
   * @param {string} tag - 标签名
   * @returns {boolean} 是否存在样式
   */
  hasInlineStyle(tag) {
    return tag in this.inlineStyles;
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   * @returns {object} 缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      enabled: this.options.enableCache
    };
  }

  /**
   * 更新配置
   * @param {object} newOptions - 新配置
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    if (!this.options.enableCache) {
      this.clearCache();
    }
  }
}

export default StyleCompiler;
