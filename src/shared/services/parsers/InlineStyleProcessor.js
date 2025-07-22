/**
 * 内联样式处理器（优化版）
 * 简化回调机制，返回结构化数据
 * 移除过度复杂的抽象层
 */

import { createLogger } from "../logger.js";
import { isValidUrl } from './utils.js';

// 创建模块日志器
const logger = createLogger('InlineStyleProcessor');

/**
 * 简化的内联样式处理器
 */
class InlineStyleProcessor {
  constructor(templateLoader) {
    this.templateLoader = templateLoader;
    
    // 预编译正则表达式
    this.patterns = {
      strong: /<strong[^>]*>(.*?)<\/strong>/gi,
      b: /<b[^>]*>(.*?)<\/b>/gi,
      em: /<em[^>]*>(.*?)<\/em>/gi,
      i: /<i[^>]*>(.*?)<\/i>/gi,
      u: /<u[^>]*>(.*?)<\/u>/gi,
      code: /<code[^>]*>(.*?)<\/code>/gi,
      mark: /<mark[^>]*>(.*?)<\/mark>/gi,
      a: /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi
    };
    
    // 预编译样式处理条目（性能优化）
    this.styleEntries = Object.entries(this.patterns).filter(([tag]) => tag !== 'a');
  }

  /**
   * 处理内联样式（简化版）
   * @param {string} text 原始文本
   * @param {Object} options 选项
   * @returns {Promise<{html: string, links: Array}>} 处理结果
   */
  async processStyles(text, options = {}) {
    if (!text || typeof text !== 'string') {
      return { html: text || '', links: [] };
    }

    try {
      const links = [];
      let result = text;

      // 获取内联样式配置
      const inlineStyles = await this.getInlineStyles();

      // 处理链接并提取
      result = result.replace(this.patterns.a, (match, href, content) => {
        const linkData = {
          href,
          content,
          index: links.length + 1
        };

        // 检查是否为非标准链接（脚注文字）
        let linkText = href;
        if (href && href.startsWith("http://") && !isValidUrl(href)) {
          linkText = href.replace(/^http:\/\//, "");
        }

        links.push({
          index: linkData.index,
          href: linkText || href,
          content
        });

        // 根据选项决定如何处理链接
        if (options.extractLinks) {
          // 转换为脚注格式
          return `${content}<sup style="color: rgba(16, 185, 129, 0.8); font-size: 0.7em; margin-left: 0.2em;">[${linkData.index}]</sup>`;
        } else if (inlineStyles.a) {
          // 应用内联样式
          return `<span style="${inlineStyles.a}">${content}</span>`;
        }

        return match; // 保持原样
      });

      // 处理其他内联样式（使用预编译条目）
      this.styleEntries.forEach(([tag, pattern]) => {
        const style = inlineStyles[tag];
        if (style) {
          result = result.replace(pattern, `<span style="${style}">$1</span>`);
        }
      });

      return {
        html: result,
        links
      };

    } catch (error) {
      logger.error('处理内联样式失败:', error);
      return { html: text, links: [] };
    }
  }

  /**
   * 获取所有内联样式（带缓存）
   * @returns {Promise<Object>} 内联样式对象
   */
  async getInlineStyles() {
    try {
      const styleKeys = ['strong', 'b', 'em', 'i', 'u', 'code', 'mark', 'a', 'sup'];
      const styles = {};

      // 并发获取所有样式
      const stylePromises = styleKeys.map(async (key) => {
        const style = await this.templateLoader.getInlineStyle(key);
        if (style) {
          styles[key] = style;
        }
      });

      await Promise.all(stylePromises);
      return styles;
    } catch (error) {
      logger.error('获取内联样式失败:', error);
      return {};
    }
  }
}

export default InlineStyleProcessor;