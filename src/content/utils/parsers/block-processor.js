/**
 * BlockProcessor 基类和具体处理器实现
 * 重构后的版本，依赖TemplateManager，职责更加清晰
 */

/**
 * 块处理器基类
 * 定义了块处理的标准流程和可重写的钩子方法
 */
class BaseBlockProcessor {
  constructor(templateManager) {
    this.templateManager = templateManager;
  }

  /**
   * 模板方法，定义处理流程
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 处理后的HTML
   */
  process(blockData, block) {
    // 1. 预处理数据
    const processedData = this.preprocessData(blockData, block);

    // 2. 获取模板
    const template = this.getTemplate(processedData, block);

    // 3. 渲染内容
    const content = this.renderContent(processedData, block);

    // 4. 后处理
    return this.postprocess(template, content, processedData, block);
  }

  /**
   * 预处理数据（子类可重写）
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {Object} 处理后的数据
   */
  preprocessData(blockData, block) {
    return blockData;
  }

  /**
   * 获取模板（子类可重写）
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string|null} 模板字符串
   */
  getTemplate(blockData, block) {
    const blockType = block.type;
    const blockTemplates = this.templateManager.getBlockTemplate(blockType);
    if (!blockTemplates) {
      return null;
    }

    // 根据块类型和数据选择合适的模板变体
    switch (blockType) {
      case "header":
        const level = Math.min(Math.max(blockData.level || 1, 1), 6);
        return this.templateManager.getTemplateVariant(blockType, `h${level}`, "default");

      case "list":
      case "List":
        const style = blockData.style === "ordered" ? "ordered" : (blockData.style === "checklist" ? "checklist" : "unordered");
        return this.templateManager.getTemplateVariant(blockType, style, "default");

      default:
        return this.templateManager.getTemplateVariant(blockType, "default");
    }
  }

  /**
   * 渲染内容（子类可重写）
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 渲染后的内容
   */
  renderContent(blockData, block) {
    // 默认处理：处理内联样式
    return this.sanitizeHtml(
      this.processInlineStyles(blockData.text || blockData.content || "")
    );
  }

  /**
   * 后处理（子类可重写）
   * @param {string} template 模板字符串
   * @param {string} content 渲染后的内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 最终HTML
   */
  postprocess(template, content, blockData, block) {
    if (!template) {
      console.warn(`未找到块类型 ${block.type} 的模板`);
      return this.createFallbackHtml(block);
    }

    return template.replace(/{{content}}/g, content);
  }

  /**
   * 处理EditorJS的内联样式
   * @param {string} text 包含HTML标签的文本
   * @returns {string} 处理后的HTML文本
   */
  processInlineStyles(text) {
    if (!text) return "";

    const htmlString = `<div>${text}</div>`;
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    const styles = this.templateManager.getInlineStyles();

    // 处理各种内联样式
    const styleMap = {
      'a': styles.a,
      'b, strong': styles.b,
      'i, em': styles.i,
      'u': styles.u,
      'mark': styles.mark,
      'code': styles.code,
      'sup': styles.sup
    };

    Object.entries(styleMap).forEach(([selector, template]) => {
      if (template) {
        doc.querySelectorAll(selector).forEach((element) => {
          const content = element.innerHTML;
          const placeholder = selector === 'sup' ? '{{sup}}' : '{{content}}';
          const styledHtml = template.replace(new RegExp(placeholder, 'g'), content);
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = styledHtml;
          element.replaceWith(...tempDiv.childNodes);
        });
      }
    });

    return doc.body.querySelector("div").innerHTML;
  }

  /**
   * 清理和验证HTML内容
   * @param {string} html HTML内容
   * @returns {string} 清理后的HTML
   */
  sanitizeHtml(html) {
    const dangerousTags = ["script", "iframe", "object", "embed", "form"];
    let cleanHtml = html;

    dangerousTags.forEach((tag) => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, "gi");
      cleanHtml = cleanHtml.replace(regex, "");
    });

    return cleanHtml;
  }

  /**
   * HTML转义
   * @param {string} text 需要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    if (!text) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * 创建后备HTML
   * @param {Object} block 块对象
   * @returns {string} 后备HTML
   */
  createFallbackHtml(block) {
    const fallbackStyles = this.templateManager.getFallbackStyles();
    const content = this.escapeHtml(JSON.stringify(block.data || {}));
    
    return fallbackStyles.template
      ? fallbackStyles.template
          .replace(/{{type}}/g, this.escapeHtml(block.type))
          .replace(/{{content}}/g, content)
      : `<div style="margin: 1.5em 8px; padding: 0.5em; border: 1px dashed rgba(26, 104, 64, 0.3); background-color: rgba(26, 104, 64, 0.05);"><small style="color: rgba(26, 104, 64, 0.7); font-size: 0.8em;">未知块类型: ${this.escapeHtml(block.type)}</small><div style="margin-top: 0.5em;">${content}</div></div>`;
  }
}

/**
 * 标题块处理器
 */
class HeaderBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    return this.escapeHtml(blockData.text || "");
  }
}

/**
 * 代码块处理器
 */
class CodeBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    return this.escapeHtml(blockData.code || "");
  }

  postprocess(template, content, blockData, block) {
    if (!template) {
      console.warn(`未找到块类型 ${block.type} 的模板`);
      return this.createFallbackHtml(block);
    }

    let rendered = template.replace(/{{content}}/g, content);
    
    // 处理语言标识
    if (template.includes("{{language}}")) {
      const language = blockData.language || "";
      rendered = rendered.replace(/{{language}}/g, this.escapeHtml(language));
    }

    return rendered;
  }
}

/**
 * 原始HTML块处理器
 */
class RawBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    // 原始HTML不进行转义，但需要清理危险标签
    return this.sanitizeHtml(blockData.html || "");
  }
}

/**
 * 引用块处理器
 */
class QuoteBlockProcessor extends BaseBlockProcessor {
  constructor(templateManager, options = {}) {
    super(templateManager);
    this.processCaptions = options.processCaptions !== false;
  }

  renderContent(blockData, block) {
    return this.sanitizeHtml(
      this.processInlineStyles(blockData.text || blockData.content || "")
    );
  }

  postprocess(template, content, blockData, block) {
    if (!template) {
      console.warn(`未找到块类型 ${block.type} 的模板`);
      return this.createFallbackHtml(block);
    }

    let rendered = template.replace(/{{content}}/g, content);

    // 处理 caption
    if (template.includes("{{caption}}")) {
      if (this.processCaptions && blockData.caption) {
        const caption = this.sanitizeHtml(
          this.processInlineStyles(blockData.caption)
        );
        rendered = rendered.replace(/{{caption}}/g, caption);
      } else {
        rendered = rendered.replace(/{{caption}}/g, "");
      }
    }

    return rendered;
  }
}

/**
 * 列表块处理器
 */
class ListBlockProcessor extends BaseBlockProcessor {
  preprocessData(blockData, block) {
    return {
      style: blockData.style || 'unordered',
      items: Array.isArray(blockData.items) ? blockData.items : [],
      meta: blockData.meta || {}
    };
  }

  getTemplate(blockData, block) {
    const blockTemplates = this.templateManager.getBlockTemplate('List') || this.templateManager.getBlockTemplate(block.type);
    if (!blockTemplates) {
      return null;
    }

    switch (blockData.style) {
      case 'ordered':
        return blockTemplates.ordered;
      case 'unordered':
        return blockTemplates.unordered;
      case 'checklist':
        return blockTemplates.checklist || blockTemplates.unordered;
      default:
        return blockTemplates.unordered;
    }
  }

  renderContent(blockData, block) {
    return '';
  }

  postprocess(template, content, blockData, block) {
    if (!template) {
      console.warn(`未找到块类型 ${block.type} 的模板`);
      return this.createFallbackHtml(block);
    }

    const renderedItems = this.renderListItems(blockData.items, blockData.style, 1, blockData.meta);
    let result = template.replace(/{{items}}/g, renderedItems);

    if (blockData.style === 'ordered') {
      const listStyle = this.getListStyleType(blockData.meta.counterType, 1);
      result = result.replace(/{{listStyle}}/g, listStyle);
    } else {
      result = result.replace(/{{listStyle}}/g, '');
    }

    return result;
  }

  renderListItems(items, listStyle, level = 1, parentMeta = {}) {
    if (!Array.isArray(items) || items.length === 0) {
      return '';
    }

    return items.map((item) => {
      if (!item || typeof item !== 'object') {
        return '';
      }

      const content = item.content || '';
      const processedContent = this.sanitizeHtml(content);
      const itemMeta = item.meta || {};
      
      let isChecked = false;
      if (listStyle === 'checklist' && typeof itemMeta.checked === 'boolean') {
        isChecked = itemMeta.checked;
      }

      let html = this.renderSingleListItem(processedContent, listStyle, isChecked);

      if (item.items && Array.isArray(item.items) && item.items.length > 0) {
        const nestedStyle = listStyle;
        const nestedLevel = level + 1;
        const nestedTemplate = this.getNestedTemplate(nestedStyle);
        
        if (nestedTemplate) {
          let nestedHtml = nestedTemplate;
          
          if (nestedStyle === 'ordered') {
            const nestedListStyle = this.getListStyleType(parentMeta.counterType || null, nestedLevel);
            nestedHtml = nestedHtml.replace(/{{listStyle}}/g, nestedListStyle);
          } else {
            nestedHtml = nestedHtml.replace(/{{listStyle}}/g, '');
          }
          
          const paddingLeft = nestedLevel * 1.5;
          nestedHtml = nestedHtml.replace(/{{paddingLeft}}/g, paddingLeft);
          
          const nestedItems = this.renderListItems(item.items, nestedStyle, nestedLevel, parentMeta || {});
          if (nestedItems) {
            html += nestedHtml.replace(/{{items}}/g, nestedItems);
          }
        }
      }

      return html;
    }).filter(item => item).join('');
  }

  renderSingleListItem(content, listStyle, isChecked = false) {
    const templates = this.templateManager.getBlockTemplate('listItem');
    if (!templates) {
      return `<li>${content || ''}</li>`;
    }
    
    if (listStyle === 'checklist') {
      const checkSymbol = isChecked ? '☑' : '☐';
      return (templates.checklist || templates.default)
        .replace(/{{checkbox}}/g, checkSymbol)
        .replace(/{{content}}/g, content || '');
    } else {
      return templates.default.replace(/{{content}}/g, content || '');
    }
  }

  getNestedTemplate(style) {
    const templates = this.templateManager.getBlockTemplate('List') || this.templateManager.getBlockTemplate('list');
    if (!templates) {
      return null;
    }
    
    switch (style) {
      case 'ordered':
        return templates.nestedOrdered;
      case 'unordered':
        return templates.nestedUnordered;
      case 'checklist':
        return templates.nestedChecklist;
      default:
        return templates.nestedUnordered;
    }
  }

  getListStyleType(counterType, level) {
    if (counterType) {
      return counterType;
    }
    
    const styles = ['decimal', 'lower-alpha', 'lower-roman'];
    return styles[(level - 1) % styles.length] || 'decimal';
  }
}

/**
 * 分隔符块处理器
 */
class DelimiterBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    return '';
  }
}

/**
 * 图片块处理器
 */
class ImageBlockProcessor extends BaseBlockProcessor {
  preprocessData(blockData, block) {
    const processedData = { ...blockData };

    if (!processedData.file) {
      processedData.file = {};
    }

    return processedData;
  }

  renderContent(blockData, block) {
    const imageUrl = blockData.file?.url || "";

    if (!imageUrl) {
      console.warn("Image block missing URL:", blockData);
      return '<section style="color: #999; font-style: italic;">图片加载失败</section>';
    }

    let imageHtml = `<img src="${this.escapeHtml(imageUrl)}"`;

    const altText = blockData.file?.filename || "";
    if (altText) {
      imageHtml += ` alt="${this.escapeHtml(altText)}"`;
    }

    const styles = [];

    if (blockData.stretched) {
      styles.push("width: 100%");
    }

    if (blockData.withBorder) {
      styles.push("border: 1px solid #e1e8ed");
    }

    if (blockData.withBackground) {
      styles.push("background: #f8f9fa", "padding: 15px");
    }

    styles.push("max-width: 100%", "height: auto", "display: block");

    if (styles.length > 0) {
      imageHtml += ` style="${styles.join("; ")}"`;
    }

    imageHtml += " />";

    return imageHtml;
  }

  postprocess(template, content, blockData, block) {
    if (!template) {
      let html = `<section><figure style="margin: 16px 0; text-align: center;">${content}`;

      if (blockData.caption) {
        const caption = this.sanitizeHtml(blockData.caption);
        html += `<figcaption style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">${caption}</figcaption>`;
      }

      html += "</figure></section>";
      return html;
    }

    let rendered = template.replace(/{{content}}/g, content);

    if (template.includes("{{caption}}")) {
      if (blockData.caption) {
        const caption = this.sanitizeHtml(blockData.caption);
        rendered = rendered.replace(/{{caption}}/g, caption);
      } else {
        rendered = rendered.replace(/{{caption}}/g, "");
      }
    }

    if (template.includes("{{url}}")) {
      const imageUrl = blockData.file?.url || "";
      rendered = rendered.replace(/{{url}}/g, this.escapeHtml(imageUrl));
    }

    return rendered;
  }
}

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