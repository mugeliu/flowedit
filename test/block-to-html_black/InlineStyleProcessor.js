/**
 * 内联样式处理器
 * 负责处理EditorJS中的内联标记，转换为带style的HTML标签
 */
class InlineStyleProcessor {
  constructor(templateLoader) {
    this.templateLoader = templateLoader;
  }

  /**
   * 处理文本中的内联样式
   * @param {string} text - 包含HTML标签的文本
   * @param {Array} globalLinksArray - 全局链接数组引用（可选）
   * @returns {string} 处理后的HTML文本
   */
  processInlineStyles(text, globalLinksArray = null) {
    if (!text || typeof text !== 'string') {
      return text || '';
    }

    // 处理a标签的特殊逻辑，传递全局链接数组
    text = this.processAnchorTags(text, globalLinksArray);
    
    // 处理其他标签
    return text.replace(/<(code|u|mark|i|em|strong|b|sup)(?:\s[^>]*)?>/g, (match, tag) => {
      const style = this.templateLoader.getInlineStyle(tag);
      return style ? `<${tag} style="${style}">` : match;
    });
  }

  /**
   * 特殊处理a标签，提取href链接，转换为span标签并添加sup上标
   * @param {string} text - 包含HTML标签的文本
   * @param {Array} globalLinksArray - 全局链接数组引用（可选）
   * @returns {string} 处理后的HTML文本
   */
  processAnchorTags(text, globalLinksArray = null) {
    if (!text || typeof text !== 'string') {
      return text;
    }

    let linkCounter = globalLinksArray ? globalLinksArray.length + 1 : 1;
    const extractedLinks = [];
    
    // 处理完整的a标签（包括开始和结束标签）
    const processedText = text.replace(/<a([^>]*)>([^<]*)<\/a>/g, (match, attributes, content) => {
      // 提取href属性
      const hrefMatch = attributes.match(/href=["']([^"']*)["']/);
      const href = hrefMatch ? hrefMatch[1] : '';
      
      if (href) {
        const linkEntry = `[${linkCounter}]: ${href}`;
        extractedLinks.push(linkEntry);
        
        // 如果提供了全局链接数组，直接添加到其中
        if (globalLinksArray) {
          globalLinksArray.push(linkEntry);
        }
      }
      
      // 获取a标签和sup标签的样式
      const aStyle = this.templateLoader.getInlineStyle('a');
      const supStyle = this.templateLoader.getInlineStyle('sup');
      
      // 构建span标签和sup上标
      const spanTag = aStyle ? `<span style="${aStyle}">` : '<span>';
      const supTag = supStyle ? `<sup style="${supStyle}">[${linkCounter}]</sup>` : `<sup>[${linkCounter}]</sup>`;
      
      linkCounter++;
      
      return `${spanTag}${content}${supTag}</span>`;
    });
    
    // 将提取的链接信息存储到实例中，供后续使用
    this.extractedLinks = extractedLinks;
    
    return processedText;
  }
  
  /**
   * 获取提取的链接列表
   * @returns {Array} 提取的链接数组
   */
  getExtractedLinks() {
    return this.extractedLinks || [];
  }

}

// ES6 模块导出
export default InlineStyleProcessor;