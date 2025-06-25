/**
 * 主解析器
 * 负责将EditorJS数据转换为HTML
 */

import { TemplateEngine } from './template-engine.js';
import { StyleCompiler } from './style-compiler.js';
import { validateBlock, deepMerge, isEmpty } from './utils.js';
import { blockTemplates, inlineStyles } from './config.js';

/**
 * EditorJS解析器类
 * 将EditorJS数据转换为HTML
 */
export class EditorJSParser {
  constructor(options = {}) {
    // 合并默认配置
    this.config = deepMerge({
      blockTemplates,
      inlineStyles,
      enableCache: true,
      escapeContent: true,
      errorHandling: 'warn', // 'warn', 'throw', 'ignore'
      customBlocks: {},
      customInlineStyles: {}
    }, options);

    // 初始化子组件
    this.templateEngine = new TemplateEngine({
      blockTemplates: this.config.blockTemplates,
      inlineStyles: this.config.inlineStyles,
      enableCache: this.config.enableCache,
      escapeContent: this.config.escapeContent
    });

    this.styleCompiler = new StyleCompiler({
      inlineStyles: this.config.inlineStyles,
      enableCache: this.config.enableCache
    });

    // 解析统计
    this.stats = {
      totalBlocks: 0,
      successfulBlocks: 0,
      failedBlocks: 0,
      parseTime: 0
    };
  }

  /**
   * 静态工厂方法
   * @param {object} options - 配置选项
   * @returns {EditorJSParser} 解析器实例
   */
  static create(options = {}) {
    return new EditorJSParser(options);
  }

  /**
   * 解析EditorJS数据为HTML
   * @param {object} editorData - EditorJS数据
   * @param {object} options - 解析选项
   * @returns {string} HTML字符串
   */
  parse(editorData, options = {}) {
    const startTime = Date.now();
    
    try {
      // 验证输入数据
      if (!this.validateInput(editorData)) {
        return this.handleError('Invalid EditorJS data format', editorData);
      }

      // 重置统计
      this.resetStats();

      // 解析blocks
      const html = this.parseBlocks(editorData.blocks || [], options);
      
      // 更新统计
      this.stats.parseTime = Date.now() - startTime;
      
      return html;
    } catch (error) {
      this.stats.parseTime = Date.now() - startTime;
      return this.handleError('Parse failed', editorData, error);
    }
  }

  /**
   * 解析blocks数组
   * @param {array} blocks - blocks数组
   * @param {object} options - 解析选项
   * @returns {string} HTML字符串
   */
  parseBlocks(blocks, options = {}) {
    if (!Array.isArray(blocks)) {
      return this.handleError('Blocks must be an array', blocks);
    }

    this.stats.totalBlocks = blocks.length;
    
    const htmlBlocks = blocks.map((block, index) => {
      try {
        const html = this.parseBlock(block, { ...options, blockIndex: index });
        this.stats.successfulBlocks++;
        return html;
      } catch (error) {
        this.stats.failedBlocks++;
        return this.handleError(`Block ${index} parse failed`, block, error);
      }
    });

    return htmlBlocks.filter(html => html && html.trim()).join('\n');
  }

  /**
   * 解析单个block
   * @param {object} block - block数据
   * @param {object} options - 解析选项
   * @returns {string} HTML字符串
   */
  parseBlock(block, options = {}) {
    // 验证block
    if (!validateBlock(block)) {
      return this.handleError('Invalid block structure', block);
    }

    const { type, data, id } = block;
    
    // 检查是否有自定义block处理器
    if (this.config.customBlocks[type]) {
      return this.parseCustomBlock(block, options);
    }

    // 使用模板引擎渲染
    const html = this.templateEngine.buildHTML(block, {
      ...options,
      customInlineStyles: this.config.customInlineStyles
    });

    // 添加block ID（如果存在）
    if (id && html && !html.startsWith('<!--')) {
      return this.addBlockId(html, id);
    }

    return html;
  }

  /**
   * 解析自定义block
   * @param {object} block - block数据
   * @param {object} options - 选项
   * @returns {string} HTML字符串
   */
  parseCustomBlock(block, options = {}) {
    const { type } = block;
    const customHandler = this.config.customBlocks[type];
    
    if (typeof customHandler === 'function') {
      return customHandler(block, options, this);
    }
    
    if (typeof customHandler === 'object' && customHandler.render) {
      return customHandler.render(block, options, this);
    }
    
    return this.handleError(`Invalid custom block handler for type: ${type}`, block);
  }

  /**
   * 为HTML添加block ID
   * @param {string} html - HTML字符串
   * @param {string} id - block ID
   * @returns {string} 带ID的HTML
   */
  addBlockId(html, id) {
    // 查找第一个HTML标签并添加ID
    const tagMatch = html.match(/^(<[^>\s]+)([^>]*>)/);
    if (tagMatch) {
      const [, openTag, rest] = tagMatch;
      return html.replace(tagMatch[0], `${openTag} data-block-id="${id}"${rest}`);
    }
    
    // 如果没有找到标签，包装在div中
    return `<div data-block-id="${id}">${html}</div>`;
  }

  /**
   * 验证输入数据
   * @param {object} data - 输入数据
   * @returns {boolean} 是否有效
   */
  validateInput(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // EditorJS数据必须有blocks数组
    if (!Array.isArray(data.blocks)) {
      return false;
    }
    
    return true;
  }

  /**
   * 处理错误
   * @param {string} message - 错误消息
   * @param {any} data - 相关数据
   * @param {Error} error - 错误对象
   * @returns {string} 错误处理结果
   */
  handleError(message, data = null, error = null) {
    const errorInfo = {
      message,
      data,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    };

    switch (this.config.errorHandling) {
      case 'throw':
        throw new Error(`EditorJSParser: ${message}`);
      
      case 'warn':
        console.warn('EditorJSParser Error:', errorInfo);
        return `<!-- Error: ${message} -->`;
      
      case 'ignore':
        return '';
      
      default:
        console.warn('EditorJSParser Error:', errorInfo);
        return `<!-- Error: ${message} -->`;
    }
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      totalBlocks: 0,
      successfulBlocks: 0,
      failedBlocks: 0,
      parseTime: 0
    };
  }

  /**
   * 获取解析统计信息
   * @returns {object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalBlocks > 0 ? 
        (this.stats.successfulBlocks / this.stats.totalBlocks * 100).toFixed(2) + '%' : '0%',
      cacheStats: this.templateEngine.getCacheStats()
    };
  }

  /**
   * 更新配置
   * @param {object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = deepMerge(this.config, newConfig);
    
    // 更新子组件配置
    this.templateEngine = new TemplateEngine({
      blockTemplates: this.config.blockTemplates,
      inlineStyles: this.config.inlineStyles,
      enableCache: this.config.enableCache,
      escapeContent: this.config.escapeContent
    });

    this.styleCompiler = new StyleCompiler({
      inlineStyles: this.config.inlineStyles,
      enableCache: this.config.enableCache
    });
  }

  /**
   * 添加block模板
   * @param {string} type - block类型
   * @param {string} variant - 变体名称
   * @param {object} template - 模板配置
   */
  addBlockTemplate(type, variant, template) {
    if (!this.config.blockTemplates[type]) {
      this.config.blockTemplates[type] = {};
    }
    this.config.blockTemplates[type][variant] = template;
    this.templateEngine.addBlockTemplate(type, variant, template);
  }

  /**
   * 添加内联样式
   * @param {string} tag - 标签名
   * @param {object} styles - 样式对象
   */
  addInlineStyle(tag, styles) {
    this.config.inlineStyles[tag] = deepMerge(
      this.config.inlineStyles[tag] || {}, 
      styles
    );
    this.styleCompiler.addInlineStyle(tag, styles);
  }

  /**
   * 添加自定义block处理器
   * @param {string} type - block类型
   * @param {function|object} handler - 处理器函数或对象
   */
  addCustomBlock(type, handler) {
    this.config.customBlocks[type] = handler;
  }

  /**
   * 移除自定义block处理器
   * @param {string} type - block类型
   */
  removeCustomBlock(type) {
    delete this.config.customBlocks[type];
  }

  /**
   * 获取支持的block类型列表
   * @returns {array} block类型数组
   */
  getSupportedBlockTypes() {
    const templateTypes = Object.keys(this.config.blockTemplates);
    const customTypes = Object.keys(this.config.customBlocks);
    return [...new Set([...templateTypes, ...customTypes])];
  }

  /**
   * 检查是否支持指定的block类型
   * @param {string} type - block类型
   * @returns {boolean} 是否支持
   */
  supportsBlockType(type) {
    return type in this.config.blockTemplates || type in this.config.customBlocks;
  }

  /**
   * 清除所有缓存
   */
  clearCache() {
    this.templateEngine.clearCache();
    this.styleCompiler.clearCache();
  }

  /**
   * 获取当前配置
   * @returns {object} 当前配置
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * 预览block渲染结果（不缓存）
   * @param {object} block - block数据
   * @param {object} options - 选项
   * @returns {string} HTML字符串
   */
  previewBlock(block, options = {}) {
    const originalCacheConfig = this.config.enableCache;
    
    // 临时禁用缓存
    this.config.enableCache = false;
    this.templateEngine.options.enableCache = false;
    this.styleCompiler.options.enableCache = false;
    
    try {
      const html = this.parseBlock(block, options);
      return html;
    } finally {
      // 恢复缓存配置
      this.config.enableCache = originalCacheConfig;
      this.templateEngine.options.enableCache = originalCacheConfig;
      this.styleCompiler.options.enableCache = originalCacheConfig;
    }
  }
}

export default EditorJSParser;
