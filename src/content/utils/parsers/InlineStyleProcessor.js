/**
 * 内联样式处理器
 * 负责处理EditorJS中的内联标记，转换为带style的HTML标签
 * 优化版本：解耦与Renderer的直接依赖，使用回调机制
 */

import { createLogger } from '../../services/simple-logger.js';
import { ParserError } from './TemplateLoader.js';

// 创建模块日志器
const logger = createLogger('InlineStyleProcessor');

/**
 * 正则表达式缓存类
 */
class RegexCache {
  constructor() {
    this.cache = new Map();
  }
  
  get(pattern, flags = '') {
    const key = `${pattern}::${flags}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new RegExp(pattern, flags));
    }
    return this.cache.get(key);
  }
}

class InlineStyleProcessor {
  constructor(templateLoader) {
    if (!templateLoader) {
      throw new ParserError('TemplateLoader is required for InlineStyleProcessor');
    }
    
    this.templateLoader = templateLoader;
    this.regexCache = new RegexCache();
    
    // 预编译常用正则表达式
    this.tagRegex = this.regexCache.get('<(code|u|mark|i|em|strong|b|sup)(?:\\s[^>]*)?>', 'g');
    this.anchorRegex = this.regexCache.get('<a([^>]*)>([^<]*)<\\/a>', 'g');
    this.hrefRegex = this.regexCache.get('href=["\\\'"]([^"\\\'"]*)["\\\'"]');
  }

  /**
   * 处理内联样式（主入口方法）
   * @param {string} text - 要处理的文本
   * @param {Object} callbacks - 回调函数集合
   * @param {Function} callbacks.onLink - 链接处理回调
   * @returns {string} 处理后的文本
   */
  processStyles(text, callbacks = {}) {
    if (!text || typeof text !== "string") {
      return text || "";
    }

    try {
      // 1. 处理非链接样式
      text = this.processNonLinkStyles(text);
      
      // 2. 处理链接（如果提供了回调）
      if (callbacks.onLink) {
        text = this.processLinks(text, callbacks.onLink);
      }
      
      return text;
    } catch (error) {
      logger.error('处理内联样式时发生错误:', error);
      throw new ParserError(`Inline style processing failed: ${error.message}`);
    }
  }

  /**
   * 处理非链接标签的内联样式
   * @param {string} text - 包含HTML标签的文本
   * @returns {string} 处理后的HTML文本
   */
  processNonLinkStyles(text) {
    if (!text || typeof text !== "string") {
      return text || "";
    }

    try {
      // 使用预编译的正则表达式，重置lastIndex以确保正确匹配
      this.tagRegex.lastIndex = 0;
      
      return text.replace(this.tagRegex, (match, tag) => {
        const style = this.templateLoader.getInlineStyle(tag);
        return style ? `<${tag} style="${style}">` : match;
      });
    } catch (error) {
      logger.error('处理非链接样式时发生错误:', error);
      throw new ParserError(`Tag style processing failed: ${error.message}`);
    }
  }

  /**
   * 处理链接标签，使用回调机制与外部解耦
   * @param {string} text - 包含HTML标签的文本
   * @param {Function} onLinkCallback - 链接处理回调函数
   * @returns {string} 处理后的HTML文本
   */
  processLinks(text, onLinkCallback) {
    if (!text || typeof text !== "string") {
      return text || "";
    }

    if (typeof onLinkCallback !== 'function') {
      logger.warn('onLinkCallback 必须是一个函数');
      return text;
    }

    try {
      // 重置正则表达式的lastIndex
      this.anchorRegex.lastIndex = 0;

      return text.replace(this.anchorRegex, (match, attributes, content) => {
        // 使用预编译的正则表达式提取href属性
        const hrefMatch = attributes.match(this.hrefRegex);
        const href = hrefMatch?.[1] || "";

        // 微信公众号文章链接保持原样
        if (href.startsWith("https://mp.weixin.qq.com/s/")) {
          const aStyle = this.templateLoader.getInlineStyle("a") || "";
          return `<a href="${href}" style="${aStyle}">${content}</a>`;
        }

        // 其他链接通过回调处理
        const linkData = onLinkCallback(href, content);

        if (linkData && linkData.asFootnote) {
          const aStyle = this.templateLoader.getInlineStyle("a") || "";
          const supStyle = this.templateLoader.getInlineStyle("sup") || "";
          return `<span style="${aStyle}">${content}</span><sup style="${supStyle}">[${linkData.index}]</sup>`;
        }

        // 如果回调返回 null 或 undefined，保持原样
        return match;
      });
    } catch (error) {
      logger.error('处理链接时发生错误:', error);
      throw new ParserError(`Link processing failed: ${error.message}`);
    }
  }

  /**
   * 检查是否为有效的URL格式
   * @param {string} url - 要检查的URL字符串
   * @returns {boolean} - 是否为有效URL
   */
  isValidUrl(url) {
    try {
      // 检查是否包含域名格式（至少包含一个点）
      const urlObj = new URL(url);
      return urlObj.hostname.includes('.');
    } catch {
      return false;
    }
  }

  // 保持向后兼容的旧方法
  /**
   * @deprecated 使用 processStyles 替代
   * 为保持向后兼容性保留此方法
   */
  processAnchorTags(text, renderer) {
    logger.warn('processAnchorTags 方法已弃用，请使用 processStyles 方法');
    
    if (!renderer) {
      return text;
    }

    return this.processStyles(text, {
      onLink: (href, content) => {
        // 检查是否为非标准链接（脚注文字）
        let linkText = href;
        if (href && href.startsWith("http://") && !this.isValidUrl(href)) {
          linkText = href.replace(/^http:\/\//, "");
        }
        
        if (href) {
          renderer.extractedLinks.push(`[${renderer.globalLinkCounter}]: ${linkText}`);
        }

        return {
          asFootnote: true,
          index: renderer.globalLinkCounter++
        };
      }
    });
  }
}

// ES6 模块导出
export default InlineStyleProcessor;