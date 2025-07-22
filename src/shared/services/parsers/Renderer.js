/**
 * 渲染引擎
 * 负责遍历EditorJS blocks，协调各种块渲染器进行渲染
 * 优化版本：使用回调机制处理内联样式，与InlineStyleProcessor解耦
 */

import { createLogger } from "../logger.js";
import { ParserError, replaceVariables, escapeHtml, isValidUrl } from './utils.js';
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
   * 处理内联样式的统一入口（优化版）
   * @param {string} text - 要处理的文本
   * @returns {Promise<string>} 处理后的文本
   */
  async processInlineStyles(text) {
    if (!text || typeof text !== 'string') {
      return text || '';
    }

    try {
      // 使用简化的 InlineStyleProcessor
      const result = await this.inlineStyleProcessor.processStyles(text, {
        extractLinks: true // 启用链接提取
      });

      // 合并提取的链接到全局列表
      if (result.links && result.links.length > 0) {
        result.links.forEach(link => {
          const globalIndex = this.globalLinkCounter++;
          this.extractedLinks.push(`[${globalIndex}]: ${link.href}`);
        });
        
        // 更新HTML中的脚注索引
        let html = result.html;
        result.links.forEach((link, index) => {
          const globalIndex = this.globalLinkCounter - result.links.length + index;
          html = html.replace(`[${link.index}]`, `[${globalIndex}]`);
        });
        
        return html;
      }

      return result.html;
    } catch (error) {
      logger.error('处理内联样式失败:', error);
      return text;
    }
  }

  /**
   * 检查是否为有效的URL格式 - 使用共享工具函数
   * @param {string} url - 要检查的URL字符串
   * @returns {boolean} - 是否为有效URL
   */
  isValidUrl(url) {
    return isValidUrl(url);
  }

  /**
   * 注册内置渲染器 - 使用工厂模式优化
   */
  registerBuiltinRenderers() {
    const rendererFactories = [
      { type: 'paragraph', factory: () => new ParagraphRenderer(this.templateLoader, this.inlineStyleProcessor) },
      { type: 'header', factory: () => new HeaderRenderer(this.templateLoader, this.inlineStyleProcessor) },
      { type: 'list', factory: () => new ListRenderer(this.templateLoader, this.inlineStyleProcessor) },
      { type: 'quote', factory: () => new QuoteRenderer(this.templateLoader, this.inlineStyleProcessor) },
      { type: 'code', factory: () => new CodeRenderer(this.templateLoader, this.inlineStyleProcessor) },
      { type: 'image', factory: () => new ImageRenderer(this.templateLoader, this.inlineStyleProcessor) },
      { type: 'delimiter', factory: () => new DelimiterRenderer(this.templateLoader, this.inlineStyleProcessor) },
      { type: 'raw', factory: () => new RawRenderer(this.templateLoader, this.inlineStyleProcessor) }
    ];
    
    // 创建懒加载渲染器并注册
    const renderers = rendererFactories.map(({ type, factory }) => 
      this.createLazyRenderer(type, factory)
    );
    
    this.registry.registerAll(renderers);
    logger.debug(`已注册 ${renderers.length} 个内置渲染器`);
  }

  /**
   * 创建懒加载渲染器代理 - 延迟实例化优化
   * @param {string} type - 渲染器类型
   * @param {Function} factory - 渲染器工厂函数
   * @returns {Object} 懒加载渲染器代理
   */
  createLazyRenderer(type, factory) {
    let instance = null;
    
    return {
      getType: () => type,
      render: (...args) => {
        if (!instance) {
          instance = factory();
        }
        return instance.render(...args);
      }
    };
  }

  /**
   * 渲染EditorJS数据为HTML
   * @param {Object} editorData - EditorJS数据对象
   * @returns {Promise<string>} 渲染后的HTML字符串
   */
  async render(editorData) {
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

      const htmlBlocks = await Promise.all(editorData.blocks.map((block) =>
        this.renderBlock(block)
      ));
      const mainContent = htmlBlocks.filter((html) => html).join("\n");

      // 渲染所有全局样式内容
      const globalContent = await this.renderGlobalStyles();
      
      // 组合主内容和全局样式内容
      return await this.combineContent(mainContent, globalContent);
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
   * @returns {Promise<string>} 渲染后的HTML字符串
   */
  async renderBlock(block) {
    if (!block || !block.type) {
      throw new ParserError('Block missing required fields');
    }

    const { type, data } = block;

    try {
      // 首先尝试使用注册表中的渲染器
      const renderer = this.registry.getRenderer(type);
      if (renderer) {
        return await renderer.render(data || {}, this);
      }

      // 如果没有找到对应的渲染器，使用通用渲染器
      logger.warn(`未支持的块类型: ${type}，使用通用渲染器`);
      return await this.genericRenderer.render(data || {}, this, type);
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
   * 替换模板中的变量 - 使用共享工具函数
   * @param {string} template - 模板字符串
   * @param {Object} variables - 变量对象
   * @returns {string} 替换后的字符串
   */
  replaceVariables(template, variables) {
    return replaceVariables(template, variables);
  }

  /**
   * 转义HTML特殊字符 - 使用共享工具函数
   * @param {string} text - 需要转义的文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    return escapeHtml(text);
  }

  /**
   * 渲染所有全局样式内容
   * @returns {Promise<Object>} 包含各种全局样式内容的对象
   */
  async renderGlobalStyles() {
    const globalContent = {};
    
    // 渲染引用链接
    globalContent.references = await this.renderReferences();
    
    // 可以在这里添加其他全局样式的渲染逻辑
    // 例如：globalContent.footer = await this.renderFooter();
    // 例如：globalContent.header = await this.renderHeader();
    
    return globalContent;
  }

  /**
   * 组合主内容和全局样式内容
   * @param {string} mainContent - 主要内容HTML
   * @param {Object} globalContent - 全局样式内容对象
   * @returns {Promise<string>} 最终组合的HTML字符串
   */
  async combineContent(mainContent, globalContent) {
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
    return await this.applyContainerStyle(combinedContent);
  }

  /**
   * 应用容器全局样式
   * @param {string} content - 内容HTML
   * @returns {Promise<string>} 应用容器样式后的HTML
   */
  async applyContainerStyle(content) {
    const containerTemplate = await this.templateLoader.getGlobalStyle("container");
    
    if (containerTemplate && content) {
      return this.replaceVariables(containerTemplate, { content });
    }
    
    return content;
  }

  /**
   * 渲染链接引用部分
   * @returns {Promise<string>} 引用部分的HTML字符串
   */
  async renderReferences() {
    if (!this.extractedLinks || this.extractedLinks.length === 0) {
      return "";
    }

    // 获取全局样式模板
    const template = await this.templateLoader.getGlobalStyle("references");
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