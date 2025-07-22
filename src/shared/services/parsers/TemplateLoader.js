/**
 * 模板加载器（优化版）
 * 添加缓存机制，减少重复加载和处理
 * 简化验证逻辑，提升性能
 */

import { createLogger } from "../logger.js";
import { ParserError } from './utils.js';

// 创建模块日志器
const logger = createLogger('TemplateLoader');

class TemplateLoader {
  constructor() {
    this.template = null;
    this.isLoaded = false;
  }

  /**
   * 从 localStorage 加载当前模板
   * @returns {Promise<boolean>} 加载是否成功
   */
  async loadFromStorage() {
    try {
      // 直接从 Chrome storage 获取当前模板（移除缓存）
      const result = await chrome.storage.local.get(['currentTemplate', 'currentTemplateId']);
      
      if (result.currentTemplate) {
        logger.info(`从存储加载模板: ${result.currentTemplateId}`);
        this.loadTemplate(result.currentTemplate);
        return true;
      }
      
      // 降级处理：加载默认模板
      return await this.loadDefaultTemplate();
    } catch (error) {
      logger.error('从存储加载模板失败:', error);
      throw new ParserError(`从存储加载模板失败: ${error.message}`);
    }
  }

  /**
   * 加载默认模板
   * @returns {Promise<boolean>}
   */
  async loadDefaultTemplate() {
    logger.warn('存储中没有模板，加载默认模板');
    const response = await fetch(chrome.runtime.getURL("assets/templates/default.json"));
    
    if (!response.ok) {
      throw new Error(`加载默认模板失败: ${response.status}`);
    }
    
    const defaultTemplate = await response.json();
    
    // 存储默认模板到storage
    await chrome.storage.local.set({
      currentTemplateId: 'default',
      currentTemplate: defaultTemplate
    });
    
    this.loadTemplate(defaultTemplate);
    return true;
  }

  /**
   * 加载模板配置（简化验证）
   * @param {Object|string} templateSource 模板对象或JSON字符串
   * @returns {boolean} 加载是否成功
   */
  loadTemplate(templateSource) {
    try {
      const template = typeof templateSource === "string" 
        ? JSON.parse(templateSource) 
        : templateSource;

      // 简化验证 - 只检查基本结构
      if (!template || typeof template !== 'object' || !template.blocks) {
        throw new ParserError('模板格式无效：缺少必要字段');
      }

      this.template = template;
      this.isLoaded = true;
      logger.debug(`模板加载成功: ${template.id || template.name || 'unknown'}`);
      return true;
    } catch (error) {
      this.template = null;
      this.isLoaded = false;
      
      const templateError = new ParserError(`模板加载失败: ${error.message}`);
      logger.error('模板加载失败:', templateError.message);
      throw templateError;
    }
  }

  /**
   * 确保模板已加载，否则从存储自动加载
   */
  async _ensureLoaded() {
    // 每次都重新从存储加载，确保获取最新模板
    logger.debug('重新从存储加载模板以确保最新');
    await this.loadFromStorage();
  }

  /**
   * 获取块模板
   * @param {string} blockType 块类型
   * @param {string} subType 子类型
   * @returns {Promise<string|Object|null>} 模板字符串或模板对象
   */
  async getBlockTemplate(blockType, subType = null) {
    try {
      await this._ensureLoaded();
      
      const template = this.template.blocks[blockType];
      if (!template) {
        logger.warn(`未找到块类型 ${blockType} 的模板`);
        return null;
      }

      let result;

      // 字符串模板直接返回
      if (typeof template === "string") {
        result = template;
      }
      // 有子类型且存在对应模板
      else if (subType && template[subType]) {
        result = template[subType];
      }
      // 有子类型但不存在对应模板
      else if (subType) {
        logger.warn(`未找到块类型 ${blockType} 的子类型 ${subType} 模板`);
        result = null;
      }
      // 无子类型：List和有optional配置的块返回整个对象，其他返回首个值
      else if (blockType === "List" || template.optional) {
        result = template;
      } else {
        result = Object.values(template)[0] || null;
      }

      return result;
    } catch (error) {
      logger.error('获取块模板失败:', error);
      return null;
    }
  }

  /**
   * 获取内联样式
   * @param {string} tagName 标签名
   * @returns {Promise<string|null>} 样式字符串
   */
  async getInlineStyle(tagName) {
    try {
      await this._ensureLoaded();
      return this.template.inlineStyles?.[tagName] || null;
    } catch (error) {
      logger.error('获取内联样式失败:', error);
      return null;
    }
  }

  /**
   * 获取全局样式模板
   * @param {string} styleName 样式名称
   * @returns {Promise<string|null>} 模板字符串
   */
  async getGlobalStyle(styleName) {
    try {
      await this._ensureLoaded();
      return this.template.globalStyles?.[styleName] || null;
    } catch (error) {
      logger.error('获取全局样式失败:', error);
      return null;
    }
  }

  /**
   * 检查模板是否已加载
   * @returns {boolean} 是否已加载
   */
  isTemplateLoaded() {
    return this.isLoaded && this.template !== null;
  }
}

// ES6 模块导出
export default TemplateLoader;