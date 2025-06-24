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
   * 获取模板
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {Object|null} 层级模板对象或null
   */
  getTemplate(blockData, block) {
    return this.getFlexibleTemplate(blockData, block);
  }

  /**
   * 获取层级模板（子类可重写）
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {Object|null} 层级模板对象或null
   */
  getFlexibleTemplate(blockData, block) {
    // 基类默认实现：根据块类型获取默认变体
    const categoryMap = {
      'header': 'header',
      'paragraph': 'paragraph', 
      'quote': 'quote',
      'delimiter': 'delimiter',
      'raw': 'raw',
      'image': 'image',
      'code': 'code',
      'list': 'List'
    };
    
    const category = categoryMap[block.type];
    if (!category) return null;
    
    return this.templateManager.getFlexibleTemplate(category, 'default');
  }

  /**
   * 获取层级模板配置
   * @param {string} category 模板类别
   * @param {string} variant 模板变体
   * @returns {Object|null} 层级模板配置或null
   */
  getFlexibleTemplateByCategory(category, variant) {
    return this.templateManager.getFlexibleTemplate(category, variant);
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
   * @param {Object} template 层级模板对象
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

    // 使用层级模板渲染逻辑
    if (template.layers) {
      return this.renderFlexibleTemplate(template, content, blockData);
    }

    console.warn(`无效的模板类型: ${typeof template}`);
    return this.createFallbackHtml(block);
  }

  /**
   * 渲染层级模板
   * @param {Object} template 层级模板对象
   * @param {string} content 内容
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} 渲染后的HTML
   */
  renderFlexibleTemplate(template, content, blockData, block) {
    const layers = template.layers;
    if (!layers || !Array.isArray(layers)) {
      return content;
    }

    const blockInlineStyles = this.templateManager.getBlockInlineStyles();
    return this.templateManager.buildNestedHTML(layers, content, blockInlineStyles);
  }

  /**
   * 处理内联样式，将简单标签转换为带样式的HTML
   * @param {string} text 原始文本
   * @returns {string} 处理后的文本
   */
  processInlineStyles(text) {
    if (!text) return "";

    // 使用 templateManager 的处理方法
    const blockInlineStyles = this.templateManager.getBlockInlineStyles();
    return this.templateManager.processInlineStyles(text, blockInlineStyles);
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
   * @returns {Object|null} 层级模板对象或null
   */
  getTemplate(blockData, block) {
    const level = Math.min(Math.max(blockData.level || 1, 1), 6);

    // 获取对应级别的层级模板
    let template = this.templateManager.getFlexibleTemplate(
      "header",
      `h${level}`
    );

    // 如果不存在（如 h4-h6），使用 h3 作为回退
    if (!template && level > 3) {
      template = this.templateManager.getFlexibleTemplate("header", "h3");
    }

    // 如果还是没有，使用h1作为最终回退
    if (!template) {
      template = this.templateManager.getFlexibleTemplate("header", "h1");
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
   * @param {Object} template 层级模板对象
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

    // 对于代码块，需要特殊处理语言标识
    // 这里可以通过扩展内容或在渲染时传递额外参数来处理
    // 暂时使用基类的 buildFinalHtml 方法
    return this.buildFinalHtml(template, content, blockData, block);
  }

  /**
   * 渲染代码内容，包含语言信息
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {Object} 包含代码和语言信息的对象
   */
  renderContent(blockData, block) {
    const code = this.escapeHtml(blockData.code || "");
    const language = blockData.language || "";
    
    // 返回对象以便在模板中使用
    return {
      code,
      language: this.escapeHtml(language)
    };
  }

  /**
   * 重写 buildFinalHtml 以处理代码块的特殊需求
   */
  buildFinalHtml(template, content, blockData, block) {
    if (!template) {
      console.warn(`未找到块类型 ${block.type} 的模板`);
      return this.createFallbackHtml(block);
    }

    // 使用层级模板渲染逻辑
    if (template.layers) {
      // 如果 content 是对象，需要特殊处理
      let finalContent = content;
      if (typeof content === 'object' && content.code !== undefined) {
        finalContent = content.code;
      }
      return this.renderFlexibleTemplate(template, finalContent, blockData, block);
    }

    console.warn(`无效的模板类型: ${typeof template}`);
    return this.createFallbackHtml(block);
  }

  // 保留原有的 postprocess 方法作为备用
  _legacyPostprocess(template, content, blockData, block) {
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
   * @param {Object} template 层级模板对象
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

    // 使用基类的 buildFinalHtml 方法处理层级模板
    return this.buildFinalHtml(template, content, blockData, block);
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
   * @returns {Object|null} 层级模板对象或null
   */
  getTemplate(blockData, block) {
    const style = this.normalizeStyle(blockData.style);
    let template = this.templateManager.getFlexibleTemplate("List", style);

    // 如果checklist模板不存在，回退到unordered
    if (!template && style === "checklist") {
      template = this.templateManager.getFlexibleTemplate("List", "unordered");
    }

    // 如果还是没有，使用unordered作为最终回退
    if (!template) {
      template = this.templateManager.getFlexibleTemplate("List", "unordered");
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
   * @param {Object} template 层级模板对象
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

    // 使用基类的 buildFinalHtml 方法处理层级模板
    return this.buildFinalHtml(template, content, blockData, block);
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
   * @param {Object} template 层级模板对象
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

    // 对于图片块，content 是对象，需要特殊处理
    // 暂时使用 alt 作为主要内容传递给模板
    let finalContent = "";
    if (typeof content === "object") {
      finalContent = content.alt || content.caption || "";
    }

    return this.buildFinalHtml(template, finalContent, blockData, block);
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
