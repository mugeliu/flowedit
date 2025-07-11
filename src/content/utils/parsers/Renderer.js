/**
 * 渲染引擎
 * 负责遍历EditorJS blocks，根据block类型获取对应模板，处理变量替换和特殊类型的循环渲染
 */

import { createLogger } from '../../services/simple-logger.js';

// 创建模块日志器
const logger = createLogger('Renderer');

class Renderer {
  constructor(templateLoader, inlineStyleProcessor) {
    this.templateLoader = templateLoader;
    this.inlineStyleProcessor = inlineStyleProcessor;
    this.globalLinkCounter = 1; // 全局链接计数器
    this.extractedLinks = []; // 全局提取的链接列表
  }

  /**
   * 渲染EditorJS数据为HTML
   * @param {Object} editorData - EditorJS数据对象
   * @returns {string} 渲染后的HTML字符串
   */
  render(editorData) {
    // 重置全局计数器和链接列表
    this.globalLinkCounter = 1;
    this.extractedLinks = [];

    const htmlBlocks = editorData.blocks.map((block) =>
      this.renderBlock(block)
    );
    const mainContent = htmlBlocks.filter((html) => html).join("\n");

    // 渲染所有全局样式内容
    const globalContent = this.renderGlobalStyles();
    
    // 组合主内容和全局样式内容
    return this.combineContent(mainContent, globalContent);
  }

  /**
   * 渲染单个块
   * @param {Object} block - EditorJS块对象
   * @returns {string} 渲染后的HTML字符串
   */
  renderBlock(block) {
    if (!block || !block.type) {
      logger.warn("无效的块数据:", block);
      return "";
    }

    const { type, data } = block;

    try {
      switch (type) {
        case "paragraph":
          return this.renderParagraph(data);
        case "header":
          return this.renderHeader(data);
        case "list":
          return this.renderList(data);
        case "quote":
          return this.renderQuote(data);
        case "code":
          return this.renderCode(data);
        case "delimiter":
          return this.renderDelimiter(data);
        case "image":
          return this.renderImage(data);
        case "raw":
          return this.renderRaw(data);
        default:
          logger.warn(`未支持的块类型: ${type}`);
          return this.renderGeneric(type, data);
      }
    } catch (error) {
      logger.error(`渲染块失败 (${type}):`, error);
      return "";
    }
  }

  /**
   * 渲染段落块
   * @param {Object} data - 段落数据
   * @returns {string} HTML字符串
   */
  renderParagraph(data) {
    return this.renderWithTemplate("paragraph", {
      text: this.processInlineStyles(data.text || ""),
    });
  }

  /**
   * 渲染标题块
   * @param {Object} data - 标题数据
   * @returns {string} HTML字符串
   */
  renderHeader(data) {
    const level = data.level || 1;
    const subType = `h${Math.min(Math.max(level, 1), 6)}`;
    return this.renderWithTemplate(
      "header",
      {
        text: this.processInlineStyles(data.text || ""),
        level,
      },
      subType
    );
  }

  /**
   * 渲染列表块
   * @param {Object} data - 列表数据
   * @returns {string} HTML字符串
   */
  renderList(data) {
    const style = data.style || "unordered";
    const items = data.items || [];
    const template = this.templateLoader.getBlockTemplate("List");
    const listTemplate = template?.[style] || {};

    const renderedItems = items
      .map((item) => this.renderListItem(item, style, listTemplate))
      .join("");

    return this._wrapListItems(renderedItems, style, listTemplate);
  }

  /**
   * 包装列表项
   * @param {string} renderedItems - 渲染后的列表项
   * @param {string} style - 列表样式
   * @param {Object} listTemplate - 列表模板
   * @returns {string} 包装后的HTML
   */
  _wrapListItems(renderedItems, style, listTemplate) {
    if (listTemplate.wrapper) {
      return this.replaceVariables(listTemplate.wrapper, {
        items: renderedItems,
      });
    }

    // 使用默认HTML标签包装
    const tagName = style === "ordered" ? "ol" : "ul";
    return `<${tagName}>${renderedItems}</${tagName}>`;
  }

  /**
   * 渲染单个列表项（支持嵌套）
   * @param {string|Object} item - 列表项数据
   * @param {string} style - 列表样式
   * @param {Object} listTemplate - 列表模板
   * @returns {string} HTML字符串
   */
  renderListItem(item, style, listTemplate) {
    const itemData = typeof item === "string" ? { content: item } : item;
    const content = this.processInlineStyles(
      itemData.content || itemData.text || ""
    );

    let itemHtml = content;

    // 处理嵌套列表 - 使用专门的嵌套模板
    if (
      itemData.items &&
      Array.isArray(itemData.items) &&
      itemData.items.length > 0
    ) {
      const nestedItems = itemData.items
        .map((nestedItem) => {
          return this.renderListItem(nestedItem, style, listTemplate);
        })
        .join("");

      // 使用嵌套模板，如果没有则回退到简单HTML
      let nestedList;
      if (listTemplate && listTemplate.nested) {
        nestedList = this.replaceVariables(listTemplate.nested, {
          items: nestedItems,
        });
      } else {
        const tagName = style === "ordered" ? "ol" : "ul";
        nestedList = `<${tagName}>${nestedItems}</${tagName}>`;
      }
      itemHtml = content + nestedList;
    }

    // 应用列表项模板
    if (listTemplate && listTemplate.item) {
      const templateVars = { content: itemHtml };

      // 特殊处理checklist类型
      if (style === "checklist") {
        const isChecked = itemData.meta && itemData.meta.checked;
        const checkedIcon = listTemplate.checked_icon || "✅";
        const uncheckedIcon = listTemplate.unchecked_icon || "☐";
        templateVars.checkbox = isChecked ? checkedIcon : uncheckedIcon;
      }

      return this.replaceVariables(listTemplate.item, templateVars);
    }
    return `<li>${itemHtml}</li>`;
  }

  /**
   * 渲染引用块
   * @param {Object} data - 引用数据
   * @returns {string} HTML字符串
   */
  renderQuote(data) {
    const text = this.processInlineStyles(data.text || "");
    const caption = data.caption ? this.processInlineStyles(data.caption) : "";

    return this.renderWithConditionalTemplate(
      "quote",
      { text, caption },
      "caption"
    );
  }

  /**
   * 渲染代码块
   * @param {Object} data - 代码数据
   * @returns {string} HTML字符串
   */
  renderCode(data) {
    // 将代码中的换行符转换为 <br> 标签
    const processedCode = this.escapeHtml(data.code || "").replace(/\n/g, "<br>");
    
    return this.renderWithTemplate("code", {
      code: processedCode,
      language: data.language || "",
    });
  }

  /**
   * 渲染分隔符块
   * @param {Object} data - 分隔符数据
   * @returns {string} HTML字符串
   */
  renderDelimiter(data) {
    return this.renderWithTemplate("delimiter", {}) || "<hr>";
  }

  /**
   * 渲染图片块
   * @param {Object} data - 图片数据
   * @returns {string} HTML字符串
   */
  renderImage(data) {
    const url = data.file?.url || data.url || "";
    const caption = data.caption || "";
    const alt = data.alt || caption || "";

    return this.renderWithConditionalTemplate(
      "image",
      { url, caption, alt },
      "caption"
    );
  }

  /**
   * 渲染原始HTML块
   * @param {Object} data - 原始HTML数据
   * @returns {string} HTML字符串
   */
  renderRaw(data) {
    return (
      this.renderWithTemplate("raw", { html: data.html || "" }) ||
      data.html ||
      ""
    );
  }

  /**
   * 渲染通用块（用于未知类型）
   * @param {string} type - 块类型
   * @param {Object} data - 块数据
   * @returns {string} HTML字符串
   */
  renderGeneric(type, data) {
    // 处理文本字段
    const processedData = { ...data };
    if (data.text) {
      processedData.text = this.processInlineStyles(data.text);
    }

    return this.renderWithTemplate(type, processedData);
  }

  /**
   * 通用模板渲染方法
   * @param {string} blockType - 块类型
   * @param {Object} variables - 变量对象
   * @param {string} subType - 子类型（可选）
   * @returns {string} 渲染后的HTML字符串
   */
  renderWithTemplate(blockType, variables, subType = null) {
    const template =
      this.templateLoader.getBlockTemplate(blockType, subType) ||
      (subType ? this.templateLoader.getBlockTemplate(blockType) : null);

    return template ? this.replaceVariables(template, variables) : "";
  }

  /**
   * 带条件性内容的模板渲染方法
   * @param {string} blockType - 块类型
   * @param {Object} variables - 变量对象
   * @param {string} conditionalKey - 条件性内容的键名
   * @returns {string} 渲染后的HTML字符串
   */
  renderWithConditionalTemplate(blockType, variables, conditionalKey) {
    const template = this.templateLoader.getBlockTemplate(blockType);
    if (!template) {
      return "";
    }

    // 处理条件性内容显示
    const hasConditionalContent = variables[conditionalKey];
    const conditionalRegex = new RegExp(
      `\\{\\{#${conditionalKey}\\}\\}([\\s\\S]*?)\\{\\{\\/${conditionalKey}\\}\\}`,
      "g"
    );

    const processedTemplate = hasConditionalContent
      ? template.replace(conditionalRegex, "$1")
      : template.replace(conditionalRegex, "");

    return this.replaceVariables(processedTemplate, variables);
  }

  /**
   * 替换模板中的变量
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {string} 替换后的字符串
   */
  replaceVariables(template, variables) {
    if (!template || typeof template !== "string") {
      return "";
    }

    let result = template;

    // 替换所有变量
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue =
        value !== null && value !== undefined ? String(value) : "";
      result = result.replace(
        new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
        stringValue
      );
    });

    // 清理未替换的变量
    result = result.replace(/{{[^}]+}}/g, "");

    return result;
  }

  /**
   * 处理内联样式
   * @param {string} text - 原始文本
   * @returns {string} 处理后的HTML文本
   */
  processInlineStyles(text) {
    if (!text || typeof text !== "string") {
      return text || "";
    }

    // 一次性处理所有内联样式和链接
    return this.inlineStyleProcessor.processAnchorTags(
      this.inlineStyleProcessor.processNonLinkStyles(text),
      this
    );
  }

  /**
   * 获取全局提取的链接列表
   * @returns {Array} 提取的链接数组
   */
  getExtractedLinks() {
    return this.extractedLinks || [];
  }

  /**
   * 渲染所有全局样式内容
   * @returns {Object} 包含各种全局样式内容的对象
   */
  renderGlobalStyles() {
    const globalContent = {};
    
    // 渲染引用链接
    globalContent.references = this.renderReferences();
    
    // 可以在这里添加其他全局样式的渲染逻辑
    // 例如：globalContent.footer = this.renderFooter();
    // 例如：globalContent.header = this.renderHeader();
    
    return globalContent;
  }

  /**
   * 组合主内容和全局样式内容
   * @param {string} mainContent - 主要内容HTML
   * @param {Object} globalContent - 全局样式内容对象
   * @returns {string} 最终组合的HTML字符串
   */
  combineContent(mainContent, globalContent) {
    let result = mainContent;
    
    // 按优先级添加全局内容
    const contentParts = [];
    
    if (result) {
      contentParts.push(result);
    }
    
    // 添加引用链接（如果存在）
    if (globalContent.references) {
      contentParts.push(globalContent.references);
    }
    
    // 在这里可以添加其他全局内容的组合逻辑
    // 例如：if (globalContent.footer) contentParts.push(globalContent.footer);
    
    const combinedContent = contentParts.join("\n");
    
    // 应用容器样式（如果存在）
    return this.applyContainerStyle(combinedContent);
  }

  /**
   * 应用容器全局样式
   * @param {string} content - 内容HTML
   * @returns {string} 应用容器样式后的HTML
   */
  applyContainerStyle(content) {
    const containerTemplate = this.templateLoader.getGlobalStyle("container");
    
    if (containerTemplate && content) {
      return this.replaceVariables(containerTemplate, { content });
    }
    
    return content;
  }

  /**
   * 渲染链接引用部分
   * @returns {string} 引用部分的HTML字符串
   */
  renderReferences() {
    if (!this.extractedLinks || this.extractedLinks.length === 0) {
      return "";
    }

    // 获取全局样式模板
    const template = this.templateLoader.getGlobalStyle("references");
    if (!template) {
      // 如果没有模板，使用默认样式
      const linksList = this.extractedLinks
        .map((link) => `<section>${link}</section>`)
        .join("");
      return `<section class="references"><h4>参考链接</h4>${linksList}</section>`;
    }

    // 格式化链接列表
    const linksList = this.extractedLinks
      .map(
        (link) =>
          `<section style="margin-bottom: 0.5em;">${this.escapeHtml(
            link
          )}</section>`
      )
      .join("");

    return this.replaceVariables(template, { links: linksList });
  }

  /**
   * 转义HTML特殊字符
   * @param {string} text - 需要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    if (!text || typeof text !== "string") {
      return "";
    }

    const htmlEscapes = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
  }
}

// ES6 模块导出
export default Renderer;
