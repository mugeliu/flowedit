/**
 * HTML解析器模块
 * 基于新的parsers模块重构，提供简洁的API
 */

import { createParser } from './parsers/index.js';

/**
 * HTML解析器类
 * 提供与原有HtmlGenerator兼容的接口
 */
class HtmlParser {
  constructor(customParsers = {}, options = {}) {
    // 默认选项
    this.defaultOptions = {
      strict: false,
      wrapWithSection: true,
      skipEmpty: true,
      ...options
    };
    
    // 创建解析器实例
    this.parser = createParser(customParsers, this.defaultOptions);
  }

  /**
   * 生成HTML（兼容原有接口）
   * @param {Array} blocks EditorJS块数组
   * @param {Object} options 生成选项
   * @returns {Promise<string>} 完整的HTML字符串
   */
  async generateHTML(blocks, options = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // 构造EditorJS数据格式
      const editorData = { blocks };
      
      // 使用新的解析器
      const html = this.parser.parse(editorData);
      
      // 如果需要跳过空内容
      if (mergedOptions.skipEmpty) {
        return html.split('\n')
          .filter(line => line.trim())
          .join('\n');
      }
      
      return html;
    } catch (error) {
      console.error('HTML生成失败:', error);
      throw error;
    }
  }

  /**
   * 生成单个块的HTML（兼容原有接口）
   * @param {Object} processedBlock 处理后的块数据
   * @returns {string} HTML字符串
   */
  generateBlockHtml(processedBlock) {
    if (!processedBlock || processedBlock.isEmpty) {
      return '';
    }

    try {
      // 转换为EditorJS块格式
      const block = {
        type: processedBlock.type,
        data: processedBlock.data
      };
      
      return this.parser.parseBlock(block);
    } catch (error) {
      console.error(`生成HTML失败 (${processedBlock.type}):`, error);
      return '';
    }
  }

  /**
   * 注册自定义解析器
   * @param {string} blockType 块类型
   * @param {Function} parser 解析函数
   */
  registerParser(blockType, parser) {
    this.parser.registerParser(blockType, parser);
  }

  /**
   * 获取可用的解析器列表
   * @returns {Object} 解析器映射
   */
  getAvailableParsers() {
    return this.parser.getAvailableParsers();
  }

  /**
   * 直接解析EditorJS数据
   * @param {Object} editorData EditorJS输出数据
   * @param {Object} options 解析选项
   * @returns {string} HTML字符串
   */
  parseEditorData(editorData, options = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return this.parser.parse(editorData);
  }

  /**
   * 直接解析单个块
   * @param {Object} block EditorJS块数据
   * @param {Object} options 解析选项
   * @returns {string} HTML字符串
   */
  parseBlock(block, options = {}) {
    const mergedOptions = { ...this.defaultOptions, ...options };
    return this.parser.parseBlock(block);
  }

  /**
   * 设置解析选项
   * @param {Object} options 新的选项
   */
  setOptions(options) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
    // 重新创建解析器实例
    const currentParsers = this.parser.getAvailableParsers();
    this.parser = createParser(currentParsers, this.defaultOptions);
  }

  /**
   * 获取当前选项
   * @returns {Object} 当前选项
   */
  getOptions() {
    return { ...this.defaultOptions };
  }
}

// 创建全局HTML解析器实例（兼容原有代码）
const htmlParser = new HtmlParser();

// 兼容原有的htmlGenerator导出
export { htmlParser as htmlGenerator, HtmlParser };
export default htmlParser;