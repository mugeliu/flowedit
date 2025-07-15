/**
 * 渲染引擎
 * 负责遍历EditorJS blocks，协调各种块渲染器进行渲染
 * 优化版本：使用回调机制处理内联样式，与InlineStyleProcessor解耦
 */

import { createLogger } from '../../services/simple-logger.js';
import { ParserError } from './TemplateLoader.js';
import BlockRendererRegistry from './BlockRendererRegistry.js';

// 导入所有块渲染器
import ParagraphRenderer from './renderers/ParagraphRenderer.js';
import HeaderRenderer from './renderers/HeaderRenderer.js';
import ListRenderer from './renderers/ListRenderer.js';
import QuoteRenderer from './renderers/QuoteRenderer.js';
import CodeRenderer from './renderers/CodeRenderer.js';
import ImageRenderer from './renderers/ImageRenderer.js';
import DelimiterRenderer from './renderers/DelimiterRenderer.js';
import RawRenderer from './renderers/RawRenderer.js';
import GenericRenderer from './renderers/GenericRenderer.js';

// 创建模块日志器
const logger = createLogger('Renderer');

class Renderer {
  constructor(templateLoader, inlineStyleProcessor) {
    if (!templateLoader) {
      throw new ParserError('TemplateLoader is required for Renderer');
    }
    if (!inlineStyleProcessor) {
      throw new ParserError('InlineStyleProcessor is required for Renderer');
    }

    this.templateLoader = templateLoader;
    this.inlineStyleProcessor = inlineStyleProcessor;
    this.globalLinkCounter = 1; // 全局链接计数器
    this.extractedLinks = []; // 全局提取的链接列表
    this.registry = new BlockRendererRegistry();
    this.genericRenderer = new GenericRenderer(templateLoader, inlineStyleProcessor);
    
    // 自动注册所有内置渲染器
    this.registerBuiltinRenderers();
  }

  /**
   * 处理内联样式的统一入口（解耦版本）
   * @param {string} text - 要处理的文本
   * @returns {string} 处理后的文本
   */
  processInlineStyles(text) {
    return this.inlineStyleProcessor.processStyles(text, {
      onLink: (href, content) => {
        // 在 Renderer 中管理链接状态
        const index = this.globalLinkCounter++;
        
        // 检查是否为非标准链接（脚注文字）
        let linkText = href;
        if (href && href.startsWith("http://") && !this.isValidUrl(href)) {
          linkText = href.replace(/^http:\/\//, "");
        }
        
        this.extractedLinks.push(`[${index}]: ${linkText || href}`);
        
        return {
          asFootnote: true,
          index: index
        };
      }
    });
  }

  /**
   * 检查是否为有效的URL格式
   * @param {string} url - 要检查的URL字符串
   * @returns {boolean} - 是否为有效URL
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('.');
    } catch {
      return false;
    }
  }

  /**
   * 注册内置渲染器
   */
  registerBuiltinRenderers() {
    const renderers = [
      new ParagraphRenderer(this.templateLoader, this.inlineStyleProcessor),
      new HeaderRenderer(this.templateLoader, this.inlineStyleProcessor),
      new ListRenderer(this.templateLoader, this.inlineStyleProcessor),
      new QuoteRenderer(this.templateLoader, this.inlineStyleProcessor),
      new CodeRenderer(this.templateLoader, this.inlineStyleProcessor),
      new ImageRenderer(this.templateLoader, this.inlineStyleProcessor),
      new DelimiterRenderer(this.templateLoader, this.inlineStyleProcessor),
      new RawRenderer(this.templateLoader, this.inlineStyleProcessor)
    ];
    
    this.registry.registerAll(renderers);
    logger.debug(`已注册 ${renderers.length} 个内置渲染器`);
  }

  /**
   * 渲染EditorJS数据为HTML
   * @param {Object} editorData - EditorJS数据对象
   * @returns {string} 渲染后的HTML字符串
   */
  render(editorData) {
    try {
      // 验证输入数据
      if (!editorData) {
        throw new ParserError('EditorJS data cannot be empty');
      }

      if (!editorData.blocks || !Array.isArray(editorData.blocks)) {
        throw new ParserError('Invalid EditorJS data format: missing blocks array');
      }

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
    } catch (error) {
      if (error instanceof ParserError) {
        logger.error('渲染失败:', error.message);
        throw error;
      }
      throw new ParserError(`Render failed: ${error.message}`);
    }
  }

  /**
   * 渲染单个块
   * @param {Object} block - EditorJS块对象
   * @returns {string} 渲染后的HTML字符串
   */
  renderBlock(block) {
    if (!block || !block.type) {
      throw new ParserError('Block missing required fields');
    }

    const { type, data } = block;

    try {
      // 首先尝试使用注册表中的渲染器
      const renderer = this.registry.getRenderer(type);
      if (renderer) {
        return renderer.render(data || {}, this);
      }

      // 如果没有找到对应的渲染器，使用通用渲染器
      logger.warn(`未支持的块类型: ${type}，使用通用渲染器`);
      return this.genericRenderer.render(data || {}, this, type);
    } catch (error) {
      if (error instanceof ParserError) {
        throw error;
      }
      throw new ParserError(`Block render failed for ${type}: ${error.message}`);
    }
  }

  /**
   * 获取全局提取的链接列表
   * @returns {Array} 提取的链接数组
   */
  getExtractedLinks() {
    return this.extractedLinks || [];
  }

  /**
   * 替换模板中的变量 - 提供给独立渲染器使用
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
   * 转义HTML特殊字符 - 提供给独立渲染器使用
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
}

// ES6 模块导出
export default Renderer;