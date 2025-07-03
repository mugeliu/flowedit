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
   * @returns {string} 处理后的HTML文本
   */
  processInlineStyles(text) {
    if (!text || typeof text !== 'string') {
      return text || '';
    }

    // 直接处理所有标签，减少映射层
    return text.replace(/<(\w+)>/g, (match, tag) => {
      const style = this.templateLoader.getInlineStyle(tag);
      return style ? `<${tag} style="${style}">` : match;
    });
  }

}

// ES6 模块导出
export default InlineStyleProcessor;