/**
 * 模板引擎
 * 负责处理HTML模板的渲染和变量替换
 */

import { escapeHTML, validateBlock } from "./utils.js";
import { StyleCompiler } from "./style-compiler.js";

/**
 * 模板引擎类
 * 根据配置生成HTML结构
 */
export class TemplateEngine {
  constructor(options = {}) {
    this.blockTemplates = options.blockTemplates || {};
    this.styleCompiler = new StyleCompiler(options);
    this.cache = new Map();
    this.options = {
      enableCache: true,
      escapeContent: true,
      ...options,
    };
  }

  /**
   * 获取指定类型和变体的模板
   * @param {string} type - block类型
   * @param {string} variant - 变体名称
   * @returns {object|null} 模板配置
   */
  getTemplate(type, variant = "default") {
    const typeTemplates = this.blockTemplates[type];
    if (!typeTemplates) return null;

    return typeTemplates[variant] || typeTemplates.default || null;
  }

  /**
   * 构建HTML结构
   * @param {object} block - EditorJS block数据
   * @param {object} options - 渲染选项
   * @returns {string} 生成的HTML
   */
  buildHTML(block, options = {}) {
    if (!validateBlock(block)) {
      return this.handleError("Invalid block data", block);
    }

    const cacheKey = this.options.enableCache
      ? `${block.type}-${JSON.stringify(block.data)}-${JSON.stringify(options)}`
      : null;

    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const html = this.renderBlock(block, options);

      if (cacheKey) {
        this.cache.set(cacheKey, html);
      }

      return html;
    } catch (error) {
      return this.handleError("Template rendering failed", block, error);
    }
  }

  /**
   * 渲染单个block
   * @param {object} block - block数据
   * @param {object} options - 渲染选项
   * @returns {string} HTML字符串
   */
  renderBlock(block, options = {}) {
    const { type, data } = block;

    // 特殊处理不同类型的block
    switch (type) {
      case "header":
        return this.renderHeader(data, options);
      case "paragraph":
        return this.renderParagraph(data, options);
      case "quote":
        return this.renderQuote(data, options);
      case "delimiter":
        return this.renderDelimiter(data, options);
      case "raw":
        return this.renderRaw(data, options);
      case "image":
        return this.renderImage(data, options);
      case "code":
        return this.renderCode(data, options);
      case "List":
      case "list":
        return this.renderList(data, options);
      default:
        return this.renderGeneric(type, data, options);
    }
  }

  /**
   * 渲染标题
   * @param {object} data - 标题数据
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderHeader(data, options = {}) {
    const level = data.level || 1;
    const variant = `h${level}`;
    const template = this.getTemplate("header", variant);

    if (!template) {
      return `<h${level}>${this.processContent(
        data.text || "",
        options
      )}</h${level}>`;
    }

    // 使用新的children结构
    return this.renderChildren(template, data.text || "", options);
  }

  /**
   * 渲染段落
   * @param {object} data - 段落数据
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderParagraph(data, options = {}) {
    const template = this.getTemplate("paragraph");

    if (!template) {
      return `<p>${this.processContent(data.text || "", options)}</p>`;
    }

    // 使用新的children结构
    return this.renderChildren(template, data.text || "", options);
  }

  /**
   * 渲染引用
   * @param {object} data - 引用数据
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderQuote(data, options = {}) {
    const template = this.getTemplate("quote");

    if (!template) {
      const text = this.processContent(data.text || "", options);
      const caption = data.caption
        ? `<cite>${this.processContent(data.caption, options)}</cite>`
        : "";
      return `<blockquote>${text}${caption}</blockquote>`;
    }

    let content = data.text || "";
    if (data.caption) {
      content += `<cite style="display:block;text-align:right;color:#768995;font-size:14px;font-style:normal;">${data.caption}</cite>`;
    }

    return this.renderChildren(template, content, options);
  }

  /**
   * 渲染分隔符
   * @param {object} data - 分隔符数据
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderDelimiter(data, options = {}) {
    const template = this.getTemplate("delimiter");

    if (!template) {
      return "<hr>";
    }

    return this.renderChildren(template, "", options);
  }

  /**
   * 渲染原始HTML
   * @param {object} data - 原始数据
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderRaw(data, options = {}) {
    const template = this.getTemplate("raw");

    if (!template) {
      return data.html || "";
    }

    return this.renderChildren(template, data.html || "", options);
  }

  /**
   * 渲染图片
   * @param {object} data - 图片数据
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderImage(data, options = {}) {
    const template = this.getTemplate("image");

    if (!template) {
      const alt = data.caption || "";
      return `<img src="${data.file?.url || ""}" alt="${escapeHTML(alt)}">`;
    }

    // 构建包含img和figcaption的完整HTML内容
    const src = data.file?.url || "";
    const alt = escapeHTML(data.caption || "");
    const title = data.caption ? ` title="${alt}"` : "";

    // 为img标签添加样式
    const imgStyle =
      "width:100%;max-width:600px;height:auto;border-radius:12px;border:2px solid #f0f0f0;box-shadow:0 4px 12px rgba(0, 0, 0, 0.08);display:block;margin:0 auto;";

    let content = `<img src="${src}" alt="${alt}"${title} style="${imgStyle}">`;
    if (data.caption) {
      content += `<figcaption style="margin-top:0.8em;color:#768995;font-size:14px;text-align:center;font-style:italic;">${escapeHTML(
        data.caption
      )}</figcaption>`;
    }

    return this.renderChildren(template, content, options);
  }

  /**
   * 构建图片内容
   * @param {object} data - 图片数据
   * @returns {string} 图片HTML
   */
  buildImageContent(data) {
    const src = data.file?.url || "";
    const alt = escapeHTML(data.caption || "");
    const title = data.caption ? ` title="${alt}"` : "";

    return `<img src="${src}" alt="${alt}"${title}>`;
  }

  /**
   * 渲染代码块
   * @param {object} data - 代码数据
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderCode(data, options = {}) {
    const template = this.getTemplate("code");

    if (!template) {
      return `<pre><code>${escapeHTML(data.code || "")}</code></pre>`;
    }

    // 处理代码，将换行转换为br标签
    const processedCode = (data.code || "")
      .split('\n')
      .join('<br>');

    return this.renderChildren(template, processedCode, options);
  }

  /**
   * 渲染列表
   * @param {object} data - 列表数据
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderList(data, options = {}) {
    const style = data.style || "unordered";
    const template = this.getTemplate("List", style);

    if (!template) {
      // 对于checklist，必须使用renderListItems来处理复选框
      if (style === "checklist") {
        const items = this.renderListItems(data.items || [], style, options);
        return `<ul style="list-style: none; padding-left: 1em;">${items}</ul>`;
      }
      
      // 对于有序和无序列表的默认处理
      const tag = style === "ordered" ? "ol" : "ul";
      const items = (data.items || [])
        .map((item) => `<li>${this.processContent(item, options)}</li>`)
        .join("");
      return `<${tag}>${items}</${tag}>`;
    }

    const items = this.renderListItems(data.items || [], style, options);
    return this.renderChildren(template, items, options);
  }

  /**
   * 修改checklist模板，将复选框和文本内容填充到对应位置
   * @param {object} template - 模板对象
   * @param {string} checked - 复选框符号
   * @param {string} textContent - 文本内容
   * @param {string} nestedList - 嵌套列表HTML
   * @returns {string} 修改后的HTML
   */
  modifyChecklistTemplate(template, checked, textContent, nestedList) {
    // 克隆模板以避免修改原始模板
    const clonedTemplate = JSON.parse(JSON.stringify(template));
    
    // 现在span在section的children中
    if (clonedTemplate.children && clonedTemplate.children[0] && 
        clonedTemplate.children[0].children && clonedTemplate.children[0].children.length >= 2) {
      const sectionChildren = clonedTemplate.children[0].children;
      // 第一个span放复选框
      sectionChildren[0].content = true;
      sectionChildren[0].textContent = checked;
      // 第二个span放文本内容
      sectionChildren[1].content = true;
      sectionChildren[1].textContent = textContent;
    }
    
    // 渲染模板并添加嵌套列表
    const renderedTemplate = this.renderTemplate(clonedTemplate);
    return renderedTemplate + (nestedList || "");
   }

   /**
    * 渲染单个模板对象
    * @param {object} template - 模板对象
    * @returns {string} HTML
    */
   renderTemplate(template) {
     if (!template) return "";
     
     const { tag, style = {}, children, content, textContent } = template;
     
     // 构建样式字符串
     const styleStr = Object.entries(style)
       .map(([key, value]) => {
         const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
         return `${cssKey}: ${value}`;
       })
       .join('; ');
     
     const styleAttr = styleStr ? ` style="${styleStr}"` : "";
     
     if (children && Array.isArray(children)) {
       const childrenHTML = children.map(child => this.renderTemplate(child)).join("");
       return `<${tag}${styleAttr}>${childrenHTML}</${tag}>`;
     } else if (textContent !== undefined) {
       return `<${tag}${styleAttr}>${textContent}</${tag}>`;
     } else if (content) {
       return `<${tag}${styleAttr}>${content}</${tag}>`;
     } else {
       return `<${tag}${styleAttr}></${tag}>`;
     }
   }
 
   /**
   * 渲染列表项
   * @param {array} items - 列表项数组
   * @param {string} style - 列表样式
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderListItems(items, style, options = {}) {
    const itemTemplate = this.getTemplate(
      "listItem",
      style === "checklist" ? "checklist" : "default"
    );

    return items
      .map((item) => {
        let content = "";
        let nestedList = "";
        
        // 处理嵌套列表
        if (item.items && Array.isArray(item.items) && item.items.length > 0) {
          const nestedStyle = item.style || style; // 使用子列表的样式或继承父级样式
          const nestedTag = nestedStyle === "ordered" ? "ol" : "ul";
          const nestedItems = this.renderListItems(item.items, nestedStyle, options);
          // 为checklist的ul添加样式
          const listStyle = nestedStyle === "checklist" ? ' style="list-style: none; padding-left: 1em;"' : '';
          nestedList = `<${nestedTag}${listStyle}>${nestedItems}</${nestedTag}>`;
        }
        
        if (style === "checklist") {
          // 确保item是对象格式，如果是字符串则转换
          const checklistItem = typeof item === "string" ? { text: item, checked: false } : item;
          const checked = checklistItem.checked ? "☑" : "☐";
          const textContent = this.processContent(
            checklistItem.text || checklistItem.content || "",
            options
          );

          if (itemTemplate) {
            // 对于checklist模板，需要特殊处理：第一个span放复选框，第二个span放文本内容
            const modifiedTemplate = this.modifyChecklistTemplate(itemTemplate, checked, textContent, nestedList);
            return modifiedTemplate;
          }
          
          content = `${checked} ${textContent}`;
          return `<li>${content}${nestedList}</li>`;
        } else {
          // 对于普通列表项，如果item是字符串，直接处理；如果是对象，处理其text属性
          const itemText = typeof item === "string" ? item : (item.text || item.content || "");
          content = `${this.processContent(itemText, options)}${nestedList}`;

          if (itemTemplate) {
            return this.renderChildren(itemTemplate, content, options);
          }
          return `<li>${content}</li>`;
        }
      })
      .join("");
  }

  /**
   * 渲染通用block类型
   * @param {string} type - block类型
   * @param {object} data - 数据
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderGeneric(type, data, options = {}) {
    const template = this.getTemplate(type);

    if (!template) {
      // 回退到简单的div包装
      const content = this.extractContent(data);
      return `<div class="${type}">${this.processContent(
        content,
        options
      )}</div>`;
    }

    const content = this.extractContent(data);
    // 使用新的children结构
    return this.renderChildren(template, content, options);
  }

  /**
   * 渲染新的children嵌套结构
   * @param {object} node - 节点对象
   * @param {string} content - 内容
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderChildren(node, content, options = {}) {
    const { tag, style = {}, attrs = {}, content: isContentLayer, children } = node;

    if (!tag) {
      return this.processContent(content, options);
    }

    // 编译样式
    const styleString = this.styleCompiler.compileStyles(style);
    const styleAttr = styleString ? ` style="${styleString}"` : "";
    
    // 编译其他属性
    const attrsString = Object.entries(attrs)
      .map(([key, value]) => ` ${key}="${value}"`)
      .join("");

    // 自闭合标签
    if (["hr", "br", "input"].includes(tag)) {
      return `<${tag}${styleAttr}${attrsString}>`;
    }

    let innerContent = "";

    // 如果是内容层，使用传入的内容
    if (isContentLayer) {
      innerContent = this.processContent(content, options);
    }

    // 如果有children，递归渲染子节点（无论是否为内容层）
    if (children && Array.isArray(children)) {
      const childrenContent = children
        .map((child) => {
          // 只有当子节点或其子树中包含content: true时才传递内容
          const shouldPassContent =
            child.content || this.hasContentInChildren(child.children);
          return this.renderChildren(
            child,
            shouldPassContent ? content : null,
            options
          );
        })
        .join("");
      
      // 如果是内容层，将children内容追加到现有内容后
      if (isContentLayer) {
        innerContent += childrenContent;
      } else {
        innerContent = childrenContent;
      }
    }
    // 如果既不是内容层也没有children，但有内容传入，使用传入的内容
    else if (content) {
      innerContent = this.processContent(content, options);
    }

    return `<${tag}${styleAttr}${attrsString}>${innerContent}</${tag}>`;
  }

  /**
   * 检查children树中是否包含内容层
   * @param {array} children - 子节点数组
   * @returns {boolean} 是否包含内容层
   */
  hasContentInChildren(children) {
    if (!Array.isArray(children)) return false;

    return children.some((child) => {
      if (child.content) return true;
      if (child.children) return this.hasContentInChildren(child.children);
      return false;
    });
  }

  /**
   * 渲染单个层级
   * @param {object} layer - 层级配置
   * @param {string} content - 内容
   * @param {object} options - 选项
   * @returns {string} HTML
   */
  renderLayer(layer, content, options = {}) {
    const { tag, style = {}, content: isContentLayer } = layer;

    if (!tag) return content;

    // 编译样式
    const styleString = this.styleCompiler.compileStyles(style);
    const styleAttr = styleString ? ` style="${styleString}"` : "";

    // 自闭合标签
    if (["img", "hr", "br", "input"].includes(tag)) {
      return `<${tag}${styleAttr}>`;
    }

    // 对于内容层，直接使用传入的内容；对于包装层，将内容作为子元素
    return `<${tag}${styleAttr}>${content}</${tag}>`;
  }

  /**
   * 处理内容（内联样式等）
   * @param {string} content - 原始内容
   * @param {object} options - 选项
   * @returns {string} 处理后的内容
   */
  processContent(content, options = {}) {
    if (typeof content !== "string") return "";

    let processed = content;

    // 应用内联样式处理（无论是否包含HTML）
    processed = this.styleCompiler.compileInlineStyles(
      processed,
      options.customInlineStyles
    );

    // 转义HTML（如果需要）
    if (this.options.escapeContent && !this.containsHTML(processed)) {
      processed = escapeHTML(processed);
    }

    return processed;
  }

  /**
   * 检查内容是否包含HTML标签
   * @param {string} content - 内容
   * @returns {boolean} 是否包含HTML
   */
  containsHTML(content) {
    return /<[^>]+>/.test(content);
  }

  /**
   * 从数据中提取内容
   * @param {object} data - 数据对象
   * @returns {string} 提取的内容
   */
  extractContent(data) {
    if (typeof data === "string") return data;
    if (!data || typeof data !== "object") return "";

    // 常见的内容字段
    const contentFields = ["text", "content", "html", "code", "caption"];

    for (const field of contentFields) {
      if (data[field] && typeof data[field] === "string") {
        return data[field];
      }
    }

    return "";
  }

  /**
   * 处理错误
   * @param {string} message - 错误消息
   * @param {object} block - block数据
   * @param {Error} error - 错误对象
   * @returns {string} 错误HTML
   */
  handleError(message, block, error = null) {
    console.warn(`TemplateEngine Error: ${message}`, { block, error });

    const errorContent = `<!-- ${message} -->`;
    return errorContent;
  }

  /**
   * 添加block模板
   * @param {string} type - block类型
   * @param {string} variant - 变体名称
   * @param {object} template - 模板配置
   */
  addBlockTemplate(type, variant, template) {
    if (!this.blockTemplates[type]) {
      this.blockTemplates[type] = {};
    }
    this.blockTemplates[type][variant] = template;
    this.clearCache();
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.cache.clear();
    this.styleCompiler.clearCache();
  }

  /**
   * 获取缓存统计
   * @returns {object} 统计信息
   */
  getCacheStats() {
    return {
      templateCache: {
        size: this.cache.size,
        enabled: this.options.enableCache,
      },
      styleCache: this.styleCompiler.getCacheStats(),
    };
  }
}

export default TemplateEngine;
