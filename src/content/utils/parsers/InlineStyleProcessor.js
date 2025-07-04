/**
 * 内联样式处理器
 * 负责处理EditorJS中的内联标记，转换为带style的HTML标签
 */
class InlineStyleProcessor {
  constructor(templateLoader) {
    this.templateLoader = templateLoader;
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

    // 处理除a标签外的其他标签
    return text.replace(
      /<(code|u|mark|i|em|strong|b|sup)(?:\s[^>]*)?>/g,
      (match, tag) => {
        const style = this.templateLoader.getInlineStyle(tag);
        return style ? `<${tag} style="${style}">` : match;
      }
    );
  }

  /**
   * 特殊处理a标签，提取href链接，转换为span标签并添加sup上标
   * @param {string} text - 包含HTML标签的文本
   * @param {Object} renderer - 渲染器实例（必需，用于全局计数）
   * @returns {string} 处理后的HTML文本
   */
  processAnchorTags(text, renderer) {
    if (!renderer) {
      console.warn("processAnchorTags: renderer 参数是必需的");
      return text;
    }

    let linkCounter = renderer.globalLinkCounter;

    // 处理完整的a标签（包括开始和结束标签）
    const processedText = text.replace(
      /<a([^>]*)>([^<]*)<\/a>/g,
      (match, attributes, content) => {
        // 提取href属性
        const hrefMatch = attributes.match(/href=["']([^"']*)["']/);
        const href = hrefMatch?.[1] || "";

        // 检查是否为微信公众号链接，如果是则跳过处理
        if (href.startsWith("https://mp.weixin.qq.com/s/")) {
          return match; // 保持原样，不处理
        }

        if (href) {
          // 检查是否为非标准链接（脚注文字）
          // 如果href以http://开头但不是标准URL格式，则移除http://前缀
          let linkText = href;
          if (href.startsWith("http://") && !this.isValidUrl(href)) {
            linkText = href.replace(/^http:\/\//, "");
          }
          
          renderer.extractedLinks.push(`[${linkCounter}]: ${linkText}`);
        }

        // 获取样式并构建标签
        const aStyle = this.templateLoader.getInlineStyle("a");
        const supStyle = this.templateLoader.getInlineStyle("sup");

        const spanTag = aStyle ? `<span style="${aStyle}">` : "<span>";
        const supTag = supStyle
          ? `<sup style="${supStyle}">[${linkCounter}]</sup>`
          : `<sup>[${linkCounter}]</sup>`;

        linkCounter++;

        return `${spanTag}${content}${supTag}</span>`;
      }
    );

    // 更新全局计数器
    renderer.globalLinkCounter = linkCounter;
    return processedText;
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
}

// ES6 模块导出
export default InlineStyleProcessor;
