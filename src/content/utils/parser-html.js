/**
 * 基于模板的HTML解析器模块
 * 使用预定义的HTML模板将EditorJS块转换为HTML
 * 支持EditorJS内联样式处理和富文本渲染
 */

// 导入HTML模板配置
import { HTML_TEMPLATES } from "../config/style-template.js";

/**
 * 块处理器基类
 * 定义了块处理的标准流程和可重写的钩子方法
 */
class BaseBlockProcessor {
  constructor(templates) {
    this.templates = templates;
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
    const blockTemplates = this.templates[blockType];
    if (!blockTemplates) {
      return null;
    }

    // 根据块类型和数据选择合适的模板变体
    switch (blockType) {
      case "header":
        const level = Math.min(Math.max(blockData.level || 1, 1), 6);
        return blockTemplates[`h${level}`] || blockTemplates.default;

      case "list":
        const style = blockData.style === "ordered" ? "ordered" : "unordered";
        return blockTemplates[style] || blockTemplates.default;

      default:
        return blockTemplates.default || Object.values(blockTemplates)[0];
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
    return this.sanitizeHtml(this.processInlineStyles(blockData.text || blockData.content || ""));
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

    let processedText = String(text);
    const styles = this.templates.inlineStyles;

    // 增强现有的HTML标签，添加内联样式
    const styleEnhancements = {
      "<b>": `<strong style="${styles.bold}">`,
      "</b>": "</strong>",
      "<strong>": `<strong style="${styles.bold}">`,
      "<i>": `<em style="${styles.italic}">`,
      "</i>": "</em>",
      "<em>": `<em style="${styles.italic}">`,
      "<u>": `<u style="${styles.underline}">`,
      "<s>": `<s style="${styles.strikethrough}">`,
      "<del>": `<del style="${styles.strikethrough}">`,
      "<code>": `<code style="${styles.code}">`,
      "<mark>": `<mark style="${styles.mark}">`,
      "<small>": `<small style="${styles.small}">`,
      "<sup>": `<sup style="${styles.sup}">`,
      "<sub>": `<sub style="${styles.sub}">`
    };

    // 处理链接标签
    processedText = this.processLinkTags(processedText);

    // 应用样式增强
    Object.entries(styleEnhancements).forEach(([tag, replacement]) => {
      if (!replacement.includes("style=") || !processedText.includes(tag)) {
        processedText = processedText.replace(
          new RegExp(tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          replacement
        );
      }
    });

    return processedText;
  }

  /**
   * 处理链接标签
   * @param {string} text 包含链接的文本
   * @returns {string} 处理后的文本
   */
  processLinkTags(text) {
    const linkStyle = this.templates.inlineStyles.link;

    return text.replace(
      /<a\s+href=["']([^"']+)["']([^>]*)>/g,
      (match, href, otherAttrs) => {
        if (otherAttrs.includes("style=")) {
          return match;
        }

        try {
          const url = new URL(href);
          const hostname = url.hostname;

          if (hostname === "mp.weixin.qq.com") {
            return `<a href="${href}" style="${linkStyle}"${otherAttrs}>`;
          } else {
            return this.handleNonWeixinLink(href, otherAttrs, linkStyle);
          }
        } catch (error) {
          return `<a href="${href}" style="${linkStyle}"${otherAttrs}>`;
        }
      }
    );
  }

  /**
   * 处理非微信公众号链接
   * @param {string} href 链接地址
   * @param {string} otherAttrs 其他属性
   * @param {string} linkStyle 链接样式
   * @returns {string} 处理后的链接HTML
   */
  handleNonWeixinLink(href, otherAttrs, linkStyle) {
    return `<a href="${href}" style="${linkStyle}"${otherAttrs}>`;
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
   * @param {Object} block 块数据
   * @returns {string} 后备HTML
   */
  createFallbackHtml(block) {
    const rawContent = block.data?.text || block.data?.content || block.data?.code || "";
    const content = block.type === "code" 
      ? this.escapeHtml(rawContent)
      : this.sanitizeHtml(this.processInlineStyles(rawContent));

    const fallbackStyles = this.templates.fallback;

    return `<section data-block="${block.type}" style="text-indent: 0px; margin-bottom: 8px;">
      <div style="${fallbackStyles.container}">
        <small style="${fallbackStyles.warning}">未知块类型: ${block.type}</small>
        <div style="${fallbackStyles.content}">${content}</div>
      </div>
    </section>`;
  }
}

/**
 * Header 块处理器 - 不处理内联样式
 */
class HeaderBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    // Header 不需要处理内联样式，直接返回转义后的文本
    return this.escapeHtml(blockData.text || '');
  }
}

/**
 * Code 块处理器 - 代码高亮和验证
 */
class CodeBlockProcessor extends BaseBlockProcessor {
  renderContent(blockData, block) {
    const code = blockData.code || '';
    
    // 代码块不处理内联样式，但需要HTML转义
    return this.escapeHtml(code);
  }

  /**
   * 验证代码语法（预留扩展点）
   * @param {string} code 代码内容
   * @param {string} language 编程语言
   */
  validateCodeSyntax(code, language) {
    // 预留：实现代码语法验证逻辑
    // 例如：检查括号匹配、基本语法错误等
  }
}

/**
 * Raw 块处理器 - HTML 验证
 */
class RawBlockProcessor extends BaseBlockProcessor {
  process(blockData, block) {
    // raw 类型直接返回 HTML 内容，不需要模板处理
    const html = blockData.html || '';
    
    // 验证 HTML 是否合理
    if (!this.isValidHtml(html)) {
      console.warn('Invalid HTML detected in raw block');
    }
    
    return this.sanitizeHtml(html);
  }

  /**
   * 验证HTML是否合理
   * @param {string} html HTML内容
   * @returns {boolean} 是否有效
   */
  isValidHtml(html) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      return !doc.querySelector('parsererror');
    } catch (e) {
      return false;
    }
  }
}

/**
 * Quote 块处理器 - 可选的 caption 处理
 */
class QuoteBlockProcessor extends BaseBlockProcessor {
  constructor(templates, options = {}) {
    super(templates);
    this.processCaptions = options.processCaptions !== false; // 默认处理
  }

  postprocess(template, content, blockData, block) {
    if (!template) {
      console.warn(`未找到块类型 ${block.type} 的模板`);
      return this.createFallbackHtml(block);
    }

    let rendered = template.replace(/{{content}}/g, content);
    
    // 处理 caption
    if (this.processCaptions && blockData.caption) {
      const caption = `<cite style="${this.templates.inlineStyles.cite}">${this.sanitizeHtml(this.processInlineStyles(blockData.caption))}</cite>`;
      rendered = rendered.replace(/{{caption}}/g, caption);
    } else {
      rendered = rendered.replace(/{{caption}}/g, "");
    }
    
    return rendered;
  }
}

/**
 * List 块处理器 - 列表项处理
 */
class ListBlockProcessor extends BaseBlockProcessor {
  postprocess(template, content, blockData, block) {
    if (!template) {
      console.warn(`未找到块类型 ${block.type} 的模板`);
      return this.createFallbackHtml(block);
    }

    // 处理列表项
    const items = (blockData.items || [])
      .map((item) => {
        const processedItem = this.sanitizeHtml(this.processInlineStyles(item));
        return this.renderListItem(processedItem);
      })
      .join("");
    
    return template.replace(/{{items}}/g, items);
  }

  /**
   * 渲染列表项
   * @param {string} content 列表项内容
   * @returns {string} 渲染后的列表项HTML
   */
  renderListItem(content) {
    const listItemTemplate = this.templates.listItem;
    return listItemTemplate.replace(/{{content}}/g, content);
  }
}

/**
 * Delimiter 块处理器 - 不处理 block.data
 */
class DelimiterBlockProcessor extends BaseBlockProcessor {
  preprocessData(blockData, block) {
    // Delimiter 不需要处理 block.data
    return {};
  }

  renderContent(blockData, block) {
    // 直接返回空内容，模板本身就是分隔符
    return '';
  }
}

/**
 * 块处理器工厂类
 */
class BlockProcessorFactory {
  constructor(templates) {
    this.templates = templates;
    this.processors = new Map();
    this.initializeDefaultProcessors();
  }

  /**
   * 初始化默认处理器
   */
  initializeDefaultProcessors() {
    this.registerProcessor('header', new HeaderBlockProcessor(this.templates));
    this.registerProcessor('code', new CodeBlockProcessor(this.templates));
    this.registerProcessor('raw', new RawBlockProcessor(this.templates));
    this.registerProcessor('quote', new QuoteBlockProcessor(this.templates));
    this.registerProcessor('list', new ListBlockProcessor(this.templates));
    this.registerProcessor('delimiter', new DelimiterBlockProcessor(this.templates));
    this.registerProcessor('paragraph', new BaseBlockProcessor(this.templates));
  }

  /**
   * 注册处理器
   * @param {string} type 块类型
   * @param {BaseBlockProcessor} processor 处理器实例
   */
  registerProcessor(type, processor) {
    this.processors.set(type, processor);
  }

  /**
   * 获取处理器
   * @param {string} type 块类型
   * @returns {BaseBlockProcessor} 处理器实例
   */
  getProcessor(type) {
    return this.processors.get(type) || this.getDefaultProcessor();
  }

  /**
   * 获取默认处理器
   * @returns {BaseBlockProcessor} 默认处理器
   */
  getDefaultProcessor() {
    return new BaseBlockProcessor(this.templates);
  }
}

/**
 * HTML解析器类
 */
class HtmlParser {
  constructor(customTemplates = {}) {
    // 如果传入自定义模板则使用自定义模板，否则使用默认模板
    this.templates = Object.keys(customTemplates).length > 0 ? customTemplates : HTML_TEMPLATES;
    this.processorFactory = new BlockProcessorFactory(this.templates);
  }

  /**
   * 设置模板配置
   * @param {Object} templates 模板配置
   */
  setTemplates(templates) {
    this.templates = templates;
    this.processorFactory = new BlockProcessorFactory(this.templates);
  }

  /**
   * 获取当前模板配置
   * @returns {Object} 当前模板配置
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * 注册自定义处理器
   * @param {string} type 块类型
   * @param {BaseBlockProcessor} processor 处理器实例
   */
  registerCustomProcessor(type, processor) {
    this.processorFactory.registerProcessor(type, processor);
  }

  /**
   * 解析单个块
   * @param {Object} block EditorJS块数据
   * @returns {string} HTML字符串
   */
  parseBlock(block) {
    if (!block || !block.type) {
      console.warn("无效的块数据:", block);
      return "";
    }

    const processor = this.processorFactory.getProcessor(block.type);
    return processor.process(block.data || {}, block);
  }



  /**
   * 解析EditorJS数据
   * @param {Object} editorData EditorJS输出数据
   * @param {Object} options 解析选项
   * @returns {string} HTML字符串
   */
  parse(editorData, options = {}) {
    const { skipEmpty = true } = options;

    if (!editorData || !Array.isArray(editorData.blocks)) {
      console.warn("无效的EditorJS数据");
      return "";
    }

    const htmlBlocks = editorData.blocks
      .map((block) => this.parseBlock(block))
      .filter((html) => (skipEmpty ? html.trim() : true));

    const content = htmlBlocks.join("\n");

    // 添加头部和尾部模板
    const head = this.templates.head || "";
    const ending = this.templates.ending || "";
    const endinsert = `<section><span leaf=""><br class="ProseMirror-trailingBreak"></span></section>`;

    return [head, content, ending, endinsert]
      .filter((part) => part.trim())
      .join("\n");
  }

  /**
   * 注册自定义模板
   * @param {string} blockType 块类型
   * @param {string|Object} template 模板字符串或模板对象
   * @param {string} variant 模板变体（可选）
   */
  registerTemplate(blockType, template, variant = "default") {
    if (!this.templates[blockType]) {
      this.templates[blockType] = {};
    }

    if (typeof template === "string") {
      this.templates[blockType][variant] = template;
    } else if (typeof template === "object") {
      this.templates[blockType] = { ...this.templates[blockType], ...template };
    }
  }

  /**
   * 动态添加或修改模板
   * @param {string} blockType 块类型
   * @param {string} variant 模板变体
   * @param {string} template 模板字符串
   */
  setTemplate(blockType, variant, template) {
    if (!this.templates[blockType]) {
      this.templates[blockType] = {};
    }
    this.templates[blockType][variant] = template;
  }

  /**
   * 渲染完整文档
   * @param {Object} editorJSData EditorJS数据
   * @param {Object} options 渲染选项
   * @returns {string} 完整的HTML文档
   */
  renderDocument(editorJSData, options = {}) {
    const { skipEmpty = true, wrapInContainer = false } = options;

    if (!editorJSData || !Array.isArray(editorJSData.blocks)) {
      console.warn("无效的EditorJS数据");
      return "";
    }

    const htmlBlocks = editorJSData.blocks
      .map((block) => this.parseBlock(block))
      .filter((html) => (skipEmpty ? html.trim() : true));

    const content = htmlBlocks.join("\n");

    if (wrapInContainer) {
      return `<div class="editorjs-content" style="max-width: 800px; margin: 0 auto; padding: 20px;">
${content}
</div>`;
    }

    return content;
  }

  /**
   * 获取可用的模板列表
   * @returns {Object} 模板配置
   */
  getAvailableTemplates() {
    return { ...this.templates };
  }

  /**
   * 设置模板配置
   * @param {Object} templates 新的模板配置
   */
  setTemplates(templates) {
    this.templates = { ...templates };
  }
}

// 创建默认实例
const htmlParser = new HtmlParser();

// 导出
export { HtmlParser, HTML_TEMPLATES };
export default htmlParser;
