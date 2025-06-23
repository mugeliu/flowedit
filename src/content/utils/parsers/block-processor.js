/**
 * BlockProcessor 基类和具体处理器实现
 *
 * 设计理念：
 * - 基类提供最简单的通用默认实现
 * - 鼓励子类通过重写方法来实现自定义逻辑
 * - 避免在基类中包含过多特定业务逻辑
 *
 * 重写指导：
 * - getTemplate(): 实现特定的模板选择逻辑
 * - renderContent(): 实现特定的内容渲染逻辑
 * - postprocess(): 实现复杂的模板变量处理逻辑
 */

/**
 * 块处理器基类
 * 定义了块处理的标准流程和可重写的钩子方法
 *
 * 核心设计原则：
 * 1. 基类只提供最基本的默认实现
 * 2. 复杂逻辑应在子类中通过重写方法实现
 * 3. 保持基类简洁，避免过度设计
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
    // 1. 获取模板
    const template = this.getTemplate(blockData, block);

    // 2. 渲染内容
    const content = this.renderContent(blockData, block);

    // 3. 构建最终HTML
    return typeof this.postprocess === "function"
      ? this.postprocess(template, content, blockData, block)
      : this.buildFinalHtml(template, content, blockData, block);
  }

  /**
   * 获取模板（子类应重写以实现自定义逻辑）
   * 基类提供最简单的默认实现
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string|null} 模板字符串
   */
  getTemplate(blockData, block) {
    // 基类只提供最基本的默认模板获取
    // 尝试获取第一个可用的模板变体
    const blockTemplates = this.templateManager.getBlockTemplate(block.type);
    if (!blockTemplates) return null;

    // 返回第一个可用的模板（通常是default或第一个定义的变体）
    return Object.values(blockTemplates)[0] || null;
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
   * 构建最终HTML（内部方法）
   * @param {string} template 模板字符串
   * @param {string} content 渲染后的内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 最终HTML
   */
  buildFinalHtml(template, content, blockData, block) {
    if (!template) {
      console.warn(`未找到块类型 ${block.type} 的模板`);
      return this.createFallbackHtml(block);
    }

    return template.replace(/{{content}}/g, content);
  }

  /**
   * 处理内联样式，将简单标签转换为带样式的HTML
   * @param {string} text 原始文本
   * @returns {string} 处理后的文本
   */
  processInlineStyles(text) {
    if (!text) return "";

    const htmlString = `<div>${text}</div>`;
    const doc = new DOMParser().parseFromString(htmlString, "text/html");

    // 直接获取内联样式模板
    const inlineStyles = this.templateManager.getInlineStyles();

    // 遍历所有样式模板
    Object.entries(inlineStyles).forEach(([tagName, template]) => {
      doc.querySelectorAll(tagName).forEach((element) => {
        const content = element.innerHTML;
        const styledHtml = template.replace(/{{content}}/g, content);
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = styledHtml;
        element.replaceWith(...tempDiv.childNodes);
      });
    });

    return doc.body.querySelector("div").innerHTML;
  }

  /**
   * 清理HTML，移除危险标签
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
   * 创建后备HTML，用于未知块类型
   * @param {Object} block 块对象
   * @returns {string} 后备HTML
   */
  createFallbackHtml(block) {
    // 构建显示内容：第一行显示块类型，第二行显示块数据
    const typeInfo = `块类型: ${this.escapeHtml(block.type)}`;
    const dataInfo = `块数据: ${this.escapeHtml(
      JSON.stringify(block.data || {})
    )}`;
    const displayContent = `${typeInfo}<br>${dataInfo}`;

    // 直接创建简单的段落HTML，不依赖模板
    const paragraphHtml = `<p>${displayContent}</p>`;

    // 外层添加突出显示的框
    return `<div style="margin: 1.5em 8px; padding: 0.5em; border: 1px dashed rgba(26, 104, 64, 0.3); background-color: rgba(26, 104, 64, 0.05);">${paragraphHtml}</div>`;
  }
}

/**
 * 标题块处理器
 */
class HeaderBlockProcessor extends BaseBlockProcessor {
  /**
   * 获取标题模板，根据级别选择对应的模板变体
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string|null} 模板字符串
   */
  getTemplate(blockData, block) {
    const level = Math.min(Math.max(blockData.level || 1, 1), 6);

    // 直接获取对应级别的模板
    let template = this.templateManager.getTemplateVariant(
      block.type,
      `h${level}`
    );

    // 如果不存在（如 h4-h6），使用 h3 作为回退
    if (!template && level > 3) {
      template = this.templateManager.getTemplateVariant(block.type, "h3");
    }

    return template;
  }

  /**
   * 渲染标题内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 渲染后的内容
   */
  renderContent(blockData, block) {
    return this.escapeHtml(blockData.text || "");
  }
}

/**
 * 代码块处理器
 */
class CodeBlockProcessor extends BaseBlockProcessor {
  /**
   * 渲染代码内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 渲染后的内容
   */
  renderContent(blockData, block) {
    return this.escapeHtml(blockData.code || "");
  }

  /**
   * 后处理，处理语言标识等特殊模板变量
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
  /**
   * 渲染原始HTML内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 渲染后的内容
   */
  renderContent(blockData, block) {
    // 原始HTML不进行转义，但需要清理危险标签
    return this.sanitizeHtml(blockData.html || "");
  }
}

/**
 * 引用块处理器
 */
class QuoteBlockProcessor extends BaseBlockProcessor {
  /**
   * 构造函数
   * @param {TemplateManager} templateManager 模板管理器
   * @param {Object} options 选项配置
   */
  constructor(templateManager, options = {}) {
    super(templateManager);
    this.processCaptions = options.processCaptions !== false;
  }

  /**
   * 渲染引用内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 渲染后的内容
   */
  renderContent(blockData, block) {
    return this.sanitizeHtml(
      this.processInlineStyles(blockData.text || blockData.caption || "")
    );
  }

  /**
   * 后处理，处理caption等特殊模板变量
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

// 列表处理纯函数
/**
 * 渲染列表内容
 * @param {Array} items 列表项数组
 * @param {string} style 列表样式
 * @param {Object} utils 工具函数对象
 * @param {number} level 嵌套层级
 * @param {Object} meta 元数据
 * @returns {string} 渲染后的列表HTML
 */
function renderListContent(items, style, utils, level = 1, meta = {}) {
  if (!Array.isArray(items) || items.length === 0) {
    return "";
  }

  return items
    .map((item) => renderListItem(item, style, utils, level, meta))
    .filter((html) => html)
    .join("");
}

/**
 * 渲染单个列表项
 * @param {Object} item 列表项数据
 * @param {string} style 列表样式
 * @param {Object} utils 工具函数对象
 * @param {number} level 嵌套层级
 * @param {Object} parentMeta 父级元数据
 * @returns {string} 渲染后的列表项HTML
 */
function renderListItem(item, style, utils, level, parentMeta) {
  if (!item) {
    return "";
  }

  // 处理字符串类型的简单列表项
  if (typeof item === "string") {
    const content = utils.sanitizeHtml(item);
    const isChecked = false;
    return buildListItemHtml(content, style, isChecked, utils);
  }

  // 处理对象类型的复杂列表项
  if (typeof item !== "object") {
    return "";
  }

  const content = utils.sanitizeHtml(item.content || "");
  const isChecked = style === "checklist" && item.meta?.checked === true;

  // 渲染当前项
  let html = buildListItemHtml(content, style, isChecked, utils);

  // 处理嵌套列表
  if (item.items && Array.isArray(item.items) && item.items.length > 0) {
    const nestedHtml = buildNestedList(
      item.items,
      style,
      utils,
      level + 1,
      parentMeta
    );
    if (nestedHtml) {
      html += nestedHtml;
    }
  }

  return html;
}

/**
 * 构建列表项HTML
 * @param {string} content 内容
 * @param {string} style 列表样式
 * @param {boolean} isChecked 是否选中
 * @param {Object} utils 工具函数对象
 * @returns {string} 列表项HTML
 */
function buildListItemHtml(content, style, isChecked, utils) {
  const templates = utils.templateManager.getBlockTemplate("listItem");
  if (!templates) {
    return `<li>${content}</li>`;
  }

  if (style === "checklist") {
    const checkSymbol = isChecked ? "☑" : "☐";
    return (templates.checklist || templates.default)
      .replace(/{{checkbox}}/g, checkSymbol)
      .replace(/{{content}}/g, content);
  }

  return templates.default.replace(/{{content}}/g, content);
}

/**
 * 构建嵌套列表
 * @param {Array} items 嵌套项数组
 * @param {string} style 列表样式
 * @param {Object} utils 工具函数对象
 * @param {number} level 嵌套层级
 * @param {Object} parentMeta 父级元数据
 * @returns {string} 嵌套列表HTML
 */
function buildNestedList(items, style, utils, level, parentMeta) {
  const template = getNestedTemplate(style, utils.templateManager);
  if (!template) {
    return "";
  }

  let nestedHtml = template;

  // 处理有序列表样式
  if (style === "ordered") {
    const listStyle = getListStyleType(parentMeta.counterType, level);
    nestedHtml = nestedHtml.replace(/{{listStyle}}/g, listStyle);
  } else {
    // 对于非有序列表，使用默认的 disc 样式
    nestedHtml = nestedHtml.replace(/{{listStyle}}/g, "disc");
  }

  // 设置缩进
  const paddingLeft = level * 1.5;
  nestedHtml = nestedHtml.replace(/{{paddingLeft}}/g, paddingLeft);

  // 渲染嵌套项
  const nestedItems = renderListContent(items, style, utils, level, parentMeta);
  return nestedItems ? nestedHtml.replace(/{{items}}/g, nestedItems) : "";
}

/**
 * 获取嵌套列表模板
 * @param {string} style 列表样式
 * @param {Object} templateManager 模板管理器
 * @returns {string|null} 嵌套列表模板
 */
function getNestedTemplate(style, templateManager) {
  const templates =
    templateManager.getBlockTemplate("List") ||
    templateManager.getBlockTemplate("list");
  if (!templates) {
    return null;
  }

  const templateMap = {
    ordered: templates.nestedOrdered,
    checklist: templates.nestedChecklist,
    unordered: templates.nestedUnordered,
  };

  return templateMap[style] || templates.nestedUnordered;
}

/**
 * 获取列表样式类型
 * @param {string} counterType 计数器类型
 * @param {number} level 嵌套层级
 * @returns {string} 列表样式类型
 */
function getListStyleType(counterType, level) {
  if (counterType) {
    return counterType;
  }

  const styles = ["decimal", "lower-alpha", "lower-roman"];
  return styles[(level - 1) % styles.length] || "decimal";
}

/**
 * 列表块处理器
 */
class ListBlockProcessor extends BaseBlockProcessor {
  /**
   * 获取列表模板，根据列表样式选择对应的模板变体
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string|null} 模板字符串
   */
  getTemplate(blockData, block) {
    const style = this.normalizeStyle(blockData.style);
    let template = this.templateManager.getTemplateVariant(block.type, style);

    // 如果checklist模板不存在，回退到unordered
    if (!template && style === "checklist") {
      template = this.templateManager.getTemplateVariant(
        block.type,
        "unordered"
      );
    }

    return template;
  }

  /**
   * 渲染列表内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 渲染后的内容
   */
  renderContent(blockData, block) {
    const style = this.normalizeStyle(blockData.style);
    const items = Array.isArray(blockData.items) ? blockData.items : [];
    const meta = blockData.meta || {};

    // 使用纯函数处理复杂逻辑
    return renderListContent(
      items,
      style,
      {
        templateManager: this.templateManager,
        sanitizeHtml: this.sanitizeHtml.bind(this),
      },
      1,
      meta
    );
  }

  /**
   * 后处理，处理列表样式等特殊模板变量
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

    let result = template.replace(/{{items}}/g, content);
    const style = this.normalizeStyle(blockData.style);
    const meta = blockData.meta || {};

    // 处理列表样式变量
    if (style === "ordered") {
      const listStyle = getListStyleType(meta.counterType, 1);
      result = result.replace(/{{listStyle}}/g, listStyle);
    } else {
      // 对于非有序列表，移除包含 {{listStyle}} 的样式属性
      result = result.replace(/{{listStyle}}/g, "disc");
    }

    return result;
  }

  /**
   * 标准化列表样式
   * @param {string} style 原始样式
   * @returns {string} 标准化后的样式
   */
  normalizeStyle(style) {
    return style === "ordered"
      ? "ordered"
      : style === "checklist"
      ? "checklist"
      : "unordered";
  }
}

/**
 * 分隔符块处理器
 */
class DelimiterBlockProcessor extends BaseBlockProcessor {
  /**
   * 渲染分隔符内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 渲染后的内容
   */
  renderContent(blockData, block) {
    return "";
  }
}

/**
 * 图片块处理器
 */
class ImageBlockProcessor extends BaseBlockProcessor {
  /**
   * 渲染图片内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {Object} 包含url、caption、alt的对象
   */
  renderContent(blockData, block) {
    const url = blockData.file?.url || blockData.url || "";
    const caption = blockData.caption || "";
    const alt = blockData.alt || caption || "";

    return {
      url: this.escapeHtml(url),
      caption: this.sanitizeHtml(this.processInlineStyles(caption)),
      alt: this.escapeHtml(alt),
    };
  }

  /**
   * 后处理，处理图片的url、caption、alt等模板变量
   * @param {string} template 模板字符串
   * @param {Object} content 渲染后的内容对象
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 最终HTML
   */
  postprocess(template, content, blockData, block) {
    if (!template) {
      console.warn(`未找到块类型 ${block.type} 的模板`);
      return this.createFallbackHtml(block);
    }

    let result = template;

    if (typeof content === "object") {
      result = result.replace(/{{url}}/g, content.url);
      result = result.replace(/{{caption}}/g, content.caption);
      result = result.replace(/{{alt}}/g, content.alt);
    }

    return result;
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
  ImageBlockProcessor,
};

export default BaseBlockProcessor;
