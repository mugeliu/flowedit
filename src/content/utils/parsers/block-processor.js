/**
 * BlockProcessor 基类和具体处理器实现
 *
 * 职责：处理具体的块类型，将EditorJS数据转换为HTML
 * 依赖：TemplateManager（获取模板和构建HTML）
 *
 * 设计原则：
 * - 每个处理器只负责自己块类型的特定逻辑
 * - 基类提供通用的处理流程和工具方法
 * - 子类通过重写方法实现特定的处理逻辑
 */

/**
 * 块处理器基类
 * 定义标准的处理流程：获取模板 → 渲染内容 → 构建HTML
 */
class BaseBlockProcessor {
  constructor(templateManager) {
    this.templateManager = templateManager;
  }

  /**
   * 处理块数据，生成HTML
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 处理后的HTML
   */
  process(blockData, block) {
    console.log(`[BaseBlockProcessor.process] 处理块:`, block);
    try {
      const template = this.getTemplate(blockData, block);
      console.log(`[BaseBlockProcessor.process] 获取模板:`, template);
      const content = this.renderContent(blockData, block);
      console.log(`[BaseBlockProcessor.process] 渲染内容:`, content);
      const extraData = this.getExtraData(blockData, block);
      const result = this.buildHTML(template, content, extraData);
      console.log(`[BaseBlockProcessor.process] 构建HTML结果:`, result);
      return result;
    } catch (error) {
      console.error(`处理块时发生错误 (${block.type}):`, error);
      return '';
    }
  }

  /**
   * 获取模板（子类可重写）
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {Object|null} 模板对象
   */
  getTemplate(blockData, block) {
    console.log(`[BaseBlockProcessor.getTemplate] 获取模板 - 类型: ${block.type}`);
    const template = this.templateManager.getFlexibleTemplate(block.type, 'default');
    console.log(`[BaseBlockProcessor.getTemplate] 返回模板:`, template);
    return template;
  }

  /**
   * 渲染内容（子类必须重写）
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 渲染后的内容
   */
  renderContent(blockData, block) {
    console.log(`[BaseBlockProcessor.renderContent] 渲染内容 - 块数据:`, blockData);
    const content = this.escapeHtml(blockData.text || '');
    console.log(`[BaseBlockProcessor.renderContent] 提取的内容:`, content);
    return content;
  }

  /**
   * 获取额外数据（子类可重写）
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {Object} 额外数据
   */
  getExtraData(blockData, block) {
    return {};
  }

  /**
   * 构建最终HTML
   * 如果模板有layers，使用嵌套构建；否则直接返回内容
   */
  buildHTML(template, content, extraData) {
    console.log(`[BaseBlockProcessor.buildHTML] 构建HTML - 模板:`, template, '内容:', content, '额外数据:', extraData);
    if (!template || !template.layers) {
      console.warn(`[BaseBlockProcessor.buildHTML] 模板为空或无layers，返回原始内容`);
      return content;
    }
    
    const result = this.templateManager.buildNestedHTML(
      template.layers,
      content,
      extraData,
      this.blockInlineStyles
    );
    console.log(`[BaseBlockProcessor.buildHTML] 构建结果:`, result);
    return result;
  }

  /**
   * HTML转义工具方法
   * @param {string} text 文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 处理内联样式
   * @param {string} text 文本内容
   * @param {Object} blockData 块数据
   * @returns {string} 处理后的文本
   */
  processInlineStyles(text, blockData) {
    return this.templateManager.processInlineStyles(text, blockData);
  }


}

/**
 * 标题块处理器
 * 处理h1-h6标题块，根据级别选择对应模板
 */
class HeaderBlockProcessor extends BaseBlockProcessor {
  /**
   * 根据标题级别获取模板
   */
  getTemplate(blockData, block) {
    console.log(`[HeaderBlockProcessor.getTemplate] 获取标题模板 - 块数据:`, blockData);
    const level = blockData.level || 1;
    const templateKey = `h${level}`;
    console.log(`[HeaderBlockProcessor.getTemplate] 模板键:`, templateKey);
    
    // 正确传递category和variant参数
    const template = this.templateManager.getFlexibleTemplate('header', templateKey) ||
                    this.templateManager.getFlexibleTemplate('header', 'h1');
    console.log(`[HeaderBlockProcessor.getTemplate] 返回模板:`, template);
    return template;
  }

  /**
   * 渲染标题内容，处理内联样式
   */
  renderContent(blockData, block) {
    console.log(`[HeaderBlockProcessor.renderContent] 渲染标题内容 - 块数据:`, blockData);
    const content = this.processInlineStyles(blockData.text || '', blockData);
    console.log(`[HeaderBlockProcessor.renderContent] 提取的标题内容:`, content);
    return content;
  }
}

/**
 * 代码块处理器
 * 处理代码块，保留原始代码格式
 */
class CodeBlockProcessor extends BaseBlockProcessor {
  /**
   * 渲染代码内容，转义HTML字符
   */
  renderContent(blockData, block) {
    return this.escapeHtml(blockData.code || '');
  }

  /**
   * 提供语言信息给模板
   */
  getExtraData(blockData, block) {
    return {
      language: blockData.language || 'text'
    };
  }
}

/**
 * 原始HTML块处理器
 * 直接输出HTML内容，不进行模板处理
 */
class RawBlockProcessor extends BaseBlockProcessor {
  /**
   * 直接返回HTML内容
   */
  renderContent(blockData, block) {
    return blockData.html || '';
  }

  /**
   * 原始HTML不使用模板，直接返回内容
   */
  buildHTML(template, content, extraData) {
    return content;
  }
}

/**
 * 引用块处理器
 * 处理引用块内容和标题
 */
class QuoteBlockProcessor extends BaseBlockProcessor {
  /**
   * 渲染引用内容，处理内联样式
   */
  renderContent(blockData, block) {
    return this.processInlineStyles(blockData.text || '', blockData);
  }

  /**
   * 提供引用标题信息
   */
  getExtraData(blockData, block) {
    return {
      caption: blockData.caption || ''
    };
  }
}



/**
 * 列表块处理器
 * 处理有序列表、无序列表和检查列表
 */
class ListBlockProcessor extends BaseBlockProcessor {
  /**
   * 根据列表样式获取模板
   */
  getTemplate(blockData, block) {
    const style = this.normalizeStyle(blockData.style);
    
    // 尝试获取指定样式的List模板，checklist回退到unordered
    return this.templateManager.getFlexibleTemplate('List', style) ||
           this.templateManager.getFlexibleTemplate('List', 'unordered');
  }

  /**
   * 渲染列表项内容
   */
  renderContent(blockData, block) {
    const items = blockData.items || [];
    
    return items.map(item => 
      this.processInlineStyles(item.content || '', blockData)
    ).join('');
  }

  /**
   * 提供列表样式信息
   */
  getExtraData(blockData, block) {
    const style = this.normalizeStyle(blockData.style);
    return {
      listStyle: style,
      listType: style === 'ordered' ? 'ol' : 'ul'
    };
  }

  /**
   * 标准化列表样式名称
   */
  normalizeStyle(style) {
    switch (style) {
      case 'ordered': return 'ordered';
      case 'checklist': return 'checklist';
      default: return 'unordered';
    }
  }
}

/**
 * 分隔符块处理器
 * 处理分隔符（水平线），无需内容
 */
class DelimiterBlockProcessor extends BaseBlockProcessor {
  /**
   * 分隔符无需内容
   */
  renderContent(blockData, block) {
    return '';
  }
}

/**
 * 图片块处理器
 * 处理图片块的标题和元数据
 */
class ImageBlockProcessor extends BaseBlockProcessor {
  /**
   * 渲染图片标题
   */
  renderContent(blockData, block) {
    return blockData.caption || '';
  }

  /**
   * 提供图片相关信息
   */
  getExtraData(blockData, block) {
    const file = blockData.file || {};
    return {
      url: file.url || '',
      caption: blockData.caption || '',
      alt: blockData.caption || file.alt || ''
    };
  }
}

// 导出所有块处理器
export {
  BaseBlockProcessor,
  HeaderBlockProcessor,
  CodeBlockProcessor,
  RawBlockProcessor,
  QuoteBlockProcessor,
  ListBlockProcessor,
  DelimiterBlockProcessor,
  ImageBlockProcessor
};

export default BaseBlockProcessor;
