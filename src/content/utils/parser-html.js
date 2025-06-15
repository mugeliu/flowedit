/**
 * 基于模板的HTML解析器模块
 * 使用预定义的HTML模板将EditorJS块转换为HTML
 * 支持EditorJS内联样式处理和富文本渲染
 */

// 导入HTML模板配置
import { HTML_TEMPLATES } from "../config/style-template.js";

/**
 * HTML解析器类
 */
class HtmlParser {
  constructor(customTemplates = {}) {
    // 如果传入自定义模板则使用自定义模板，否则使用默认模板
    this.templates = Object.keys(customTemplates).length > 0 ? customTemplates : HTML_TEMPLATES;
  }

  /**
   * 设置模板配置
   * @param {Object} templates 模板配置
   */
  setTemplates(templates) {
    this.templates = templates;
  }

  /**
   * 获取当前模板配置
   * @returns {Object} 当前模板配置
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * 块处理器映射
   * 每个块类型可以有自己的处理函数
   */
  blockProcessors = {
    raw: this.processRawBlock.bind(this),
    header: this.processHeaderBlock.bind(this),
    paragraph: this.processParagraphBlock.bind(this),
    quote: this.processQuoteBlock.bind(this),
    list: this.processListBlock.bind(this),
    code: this.processCodeBlock.bind(this),
    delimiter: this.processDelimiterBlock.bind(this)
  };

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

    const blockType = block.type;
    const blockData = block.data || {};

    // 检查是否有专门的处理器
    const processor = this.blockProcessors[blockType];
    if (processor) {
      return processor(blockData, block);
    }

    // 使用默认处理逻辑
    return this.processDefaultBlock(blockType, blockData, block);
  }

  /**
   * 默认块处理逻辑
   * @param {string} blockType 块类型
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} HTML字符串
   */
  processDefaultBlock(blockType, blockData, block) {
    // 获取对应的模板
    const template = this.getTemplate(blockType, blockData);
    if (!template) {
      console.warn(`未找到块类型 ${blockType} 的模板`);
      return this.createFallbackHtml(block);
    }

    // 渲染模板
    return this.renderTemplate(template, blockData, blockType);
  }

  /**
   * 处理 raw 块
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} HTML字符串
   */
  processRawBlock(blockData, block) {
    // raw 类型直接返回 HTML 内容，不需要模板处理
    return blockData.html || '';
  }

  /**
   * 处理 header 块
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} HTML字符串
   */
  processHeaderBlock(blockData, block) {
    // 使用默认处理逻辑
    return this.processDefaultBlock('header', blockData, block);
  }

  /**
   * 处理 paragraph 块
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} HTML字符串
   */
  processParagraphBlock(blockData, block) {
    // 使用默认处理逻辑
    return this.processDefaultBlock('paragraph', blockData, block);
  }

  /**
   * 处理 quote 块
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} HTML字符串
   */
  processQuoteBlock(blockData, block) {
    // 使用默认处理逻辑
    return this.processDefaultBlock('quote', blockData, block);
  }

  /**
   * 处理 list 块
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} HTML字符串
   */
  processListBlock(blockData, block) {
    // 使用默认处理逻辑
    return this.processDefaultBlock('list', blockData, block);
  }

  /**
   * 处理 code 块
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} HTML字符串
   */
  processCodeBlock(blockData, block) {
    // 使用默认处理逻辑
    return this.processDefaultBlock('code', blockData, block);
  }

  /**
   * 处理 delimiter 块
   * @param {Object} blockData 块数据
   * @param {Object} block 完整块对象
   * @returns {string} HTML字符串
   */
  processDelimiterBlock(blockData, block) {
    // 使用默认处理逻辑
    return this.processDefaultBlock('delimiter', blockData, block);
  }

  /**
   * 注册自定义块处理器
   * @param {string} blockType 块类型
   * @param {Function} processor 处理函数
   */
  registerBlockProcessor(blockType, processor) {
    this.blockProcessors[blockType] = processor.bind(this);
  }

  /**
   * 移除块处理器
   * @param {string} blockType 块类型
   */
  removeBlockProcessor(blockType) {
    delete this.blockProcessors[blockType];
  }

  /**
   * 获取指定块类型的模板
   * @param {string} blockType 块类型
   * @param {Object} blockData 块数据
   * @returns {string|null} 模板字符串
   */
  getTemplate(blockType, blockData) {
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
   * 渲染模板
   * @param {string} template 模板字符串
   * @param {Object} data 数据对象
   * @param {string} blockType 块类型
   * @returns {string} 渲染后的HTML
   */
  renderTemplate(template, data, blockType) {
    let rendered = template;

    // 处理不同类型的内容替换
    switch (blockType) {
      case "header":
      case "paragraph":
        // 对于标题和段落，处理内联样式而不是转义
        const processedContent = this.sanitizeHtml(
          this.processInlineStyles(data.text || "")
        );
        rendered = rendered.replace(/{{content}}/g, processedContent);
        break;

      case "quote":
        // 引用块也需要处理内联样式
        const processedQuoteContent = this.sanitizeHtml(
          this.processInlineStyles(data.text || "")
        );
        rendered = rendered.replace(/{{content}}/g, processedQuoteContent);
        const caption = data.caption
          ? `<cite style="${
              this.templates.inlineStyles.cite
            }">${this.sanitizeHtml(
              this.processInlineStyles(data.caption)
            )}</cite>`
          : "";
        rendered = rendered.replace(/{{caption}}/g, caption);
        break;

      case "list":
        // 列表项也需要处理内联样式
        const items = (data.items || [])
          .map((item) => {
            const processedItem = this.sanitizeHtml(
              this.processInlineStyles(item)
            );
            return this.renderListItem(processedItem);
          })
          .join("");
        rendered = rendered.replace(/{{items}}/g, items);
        break;

      case "code":
        // 代码块不处理内联样式，但需要HTML转义
        rendered = rendered.replace(
          /{{content}}/g,
          this.escapeHtml(data.code || "")
        );
        break;

      case "delimiter":
        // 分隔符不需要内容替换
        break;

      case "raw":
        // 原始HTML，不处理内容
        break;

      default:
        // 通用内容替换，处理内联样式
        const defaultContent = this.sanitizeHtml(
          this.processInlineStyles(data.text || data.content || "")
        );
        rendered = rendered.replace(/{{content}}/g, defaultContent);
        break;
    }

    return rendered;
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

  /**
   * 创建后备HTML（当找不到模板时）
   * @param {Object} block 块数据
   * @returns {string} 后备HTML
   */
  createFallbackHtml(block) {
    // 对于未知块类型，也尝试处理内联样式
    const rawContent =
      block.data?.text || block.data?.content || block.data?.code || "";
    const content =
      block.type === "code"
        ? this.escapeHtml(rawContent)
        : this.sanitizeHtml(this.processInlineStyles(rawContent));

    // 从TEMPLATES中获取后备样式
    const fallbackStyles = this.templates.fallback;

    return `<section data-block="${block.type}" style="text-indent: 0px; margin-bottom: 8px;">
      <div style="${fallbackStyles.container}">
        <small style="${fallbackStyles.warning}">未知块类型: ${block.type}</small>
        <div style="${fallbackStyles.content}">${content}</div>
      </div>
    </section>`;
  }

  /**
   * 处理EditorJS的内联样式
   * EditorJS的内联样式是以HTML标签形式存储的，需要进行样式增强
   * @param {string} text 包含HTML标签的文本
   * @returns {string} 处理后的HTML文本
   */
  processInlineStyles(text) {
    if (!text) return "";

    // EditorJS的text直接包含HTML标签，如: "这是<b>粗体</b>和<i>斜体</i>文字"
    let processedText = String(text);

    // 从TEMPLATES中获取内联样式配置
    const styles = this.templates.inlineStyles;

    // 增强现有的HTML标签，添加内联样式
    const styleEnhancements = {
      // 粗体标签
      "<b>": `<strong style="${styles.bold}">`,
      "</b>": "</strong>",
      "<strong>": `<strong style="${styles.bold}">`,

      // 斜体标签
      "<i>": `<em style="${styles.italic}">`,
      "</i>": "</em>",
      "<em>": `<em style="${styles.italic}">`,

      // 下划线
      "<u>": `<u style="${styles.underline}">`,

      // 删除线
      "<s>": `<s style="${styles.strikethrough}">`,
      "<del>": `<del style="${styles.strikethrough}">`,

      // 行内代码
      "<code>": `<code style="${styles.code}">`,

      // 标记/高亮
      "<mark>": `<mark style="${styles.mark}">`,

      // 小字体
      "<small>": `<small style="${styles.small}">`,

      // 上标
      "<sup>": `<sup style="${styles.sup}">`,

      // 下标
      "<sub>": `<sub style="${styles.sub}">`,
    };

    // 处理链接标签，保留href属性并添加样式
    processedText = this.processLinkTags(processedText);

    // 应用样式增强
    Object.entries(styleEnhancements).forEach(([tag, replacement]) => {
      // 使用全局替换，但要小心不要替换已经处理过的标签
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
    // 从TEMPLATES中获取链接样式
    const linkStyle = this.templates.inlineStyles.link;

    // 匹配 <a href="..."> 标签并添加样式
    return text.replace(
      /<a\s+href=["']([^"']+)["']([^>]*)>/g,
      (match, href, otherAttrs) => {
        // 检查是否已经有style属性
        if (otherAttrs.includes("style=")) {
          return match; // 已经有样式，不重复添加
        }

        // 检查链接域名是否为微信公众号
        try {
          const url = new URL(href);
          const hostname = url.hostname;

          // 如果是微信公众号链接，保留原样并添加样式
          if (hostname === "mp.weixin.qq.com") {
            return `<a href="${href}" style="${linkStyle}"${otherAttrs}>`;
          } else {
            // 非微信公众号链接的特殊处理（预留）
            // TODO: 在这里添加对其他域名链接的特殊处理逻辑
            return this.handleNonWeixinLink(href, otherAttrs, linkStyle);
          }
        } catch (error) {
          // URL解析失败，按普通链接处理
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
    // 预留：非微信公众号链接的特殊处理逻辑
    // 目前暂时按普通链接处理，后续可以在这里添加具体的处理逻辑
    // 例如：添加特殊标记、修改样式、添加警告等

    return `<a href="${href}" style="${linkStyle}"${otherAttrs}>`;
  }

  /**
   * 清理和验证HTML内容
   * @param {string} html HTML内容
   * @returns {string} 清理后的HTML
   */
  sanitizeHtml(html) {
    // 简单的HTML清理，移除危险标签
    const dangerousTags = ["script", "iframe", "object", "embed", "form"];
    let cleanHtml = html;

    dangerousTags.forEach((tag) => {
      const regex = new RegExp(`<${tag}[^>]*>.*?</${tag}>`, "gi");
      cleanHtml = cleanHtml.replace(regex, "");
    });

    return cleanHtml;
  }

  /**
   * HTML转义（用于代码块等需要转义的内容）
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
