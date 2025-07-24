// 模板管理器 - 统一处理内置和远程模板
import { createLogger } from './logger.js';

const logger = createLogger('TemplateManager');

export class TemplateManager {
  constructor() {
    // 定义内置模板列表
    this.builtinTemplates = [
      'default.json',
      'business-minimal.json', 
      'warm-orange.json',
      'literary-green.json',
      'abstract-illustration.json',
      'diffused-gradient.json',
      'ultra-bold-typography.json',
      'handcraft-texture.json'
    ];
  }

  /**
   * 获取所有可用模板列表（内置 + 远程）
   */
  async getAvailableTemplates() {
    const [builtinTemplates, remoteTemplates] = await Promise.all([
      this.getBuiltinTemplates(),
      this.getRemoteTemplates()
    ]);
    
    return [...builtinTemplates, ...remoteTemplates];
  }

  /**
   * 扫描内置模板
   */
  async getBuiltinTemplates() {
    const templates = [];
    
    for (const fileName of this.builtinTemplates) {
      try {
        const templateId = fileName.replace('.json', '');
        const response = await fetch(chrome.runtime.getURL(`assets/templates/${fileName}`));
        
        if (!response.ok) {
          logger.warn(`无法加载内置模板 ${fileName}: ${response.status}`);
          continue;
        }
        
        const templateData = await response.json();
        
        templates.push({
          id: templateId,
          name: templateData.name || templateId,
          description: templateData.description || '',
          category: templateData.category || '默认',
          author: templateData.author || 'FlowEdit',
          version: templateData.version || '1.0.0',
          source: 'builtin'
        });
      } catch (error) {
        logger.warn(`无法加载内置模板 ${fileName}:`, error);
      }
    }
    
    return templates;
  }

  /**
   * 获取远程模板列表
   */
  async getRemoteTemplates() {
    try {
      // TODO: 实现远程API调用
      // const response = await fetch('https://api.flowedit.com/templates');
      // const remoteList = await response.json();
      
      // 目前返回空数组，等待远程API实现
      return [];
    } catch (error) {
      logger.warn('无法获取远程模板列表:', error);
      return [];
    }
  }

  /**
   * 根据ID加载完整模板数据
   */
  async loadTemplate(templateId) {
    logger.info(`开始加载模板: ${templateId}`);
    
    // 1. 检查缓存
    const cachedTemplate = await this.getCachedTemplate(templateId);
    if (cachedTemplate) {
      logger.info(`使用缓存模板: ${templateId}`);
      return cachedTemplate;
    }
    
    // 2. 尝试内置模板
    try {
      const response = await fetch(chrome.runtime.getURL(`assets/templates/${templateId}.json`));
      if (response.ok) {
        logger.info(`加载内置模板: ${templateId}`);
        return await response.json();
      }
    } catch (error) {
      logger.info(`内置模板加载失败: ${templateId}, 尝试远程加载`);
    }
    
    // 3. 远程模板加载
    return await this.loadRemoteTemplate(templateId);
  }

  /**
   * 从远程加载模板
   */
  async loadRemoteTemplate(templateId) {
    logger.info(`从远程加载模板: ${templateId}`);
    
    try {
      // TODO: 实现远程模板下载
      // const response = await fetch(`https://api.flowedit.com/templates/${templateId}`);
      // if (!response.ok) {
      //   throw new Error(`远程模板加载失败: ${response.status}`);
      // }
      // 
      // const templateData = await response.json();
      // 
      // // 缓存到本地
      // await this.cacheTemplate(templateId, templateData);
      // 
      // logger.info(`远程模板加载并缓存成功: ${templateId}`);
      // return templateData;
      
      throw new Error(`远程模板功能暂未实现: ${templateId}`);
    } catch (error) {
      logger.error(`远程模板加载失败: ${templateId}`, error);
      throw error;
    }
  }

  /**
   * 缓存远程模板到本地存储
   */
  async cacheTemplate(templateId, templateData) {
    try {
      const result = await chrome.storage.local.get(['cachedTemplates']);
      const cachedTemplates = result.cachedTemplates || {};
      
      cachedTemplates[templateId] = {
        data: templateData,
        cachedAt: Date.now(),
        version: templateData.version || '1.0.0'
      };
      
      await chrome.storage.local.set({ cachedTemplates });
      logger.info(`模板已缓存: ${templateId}`);
    } catch (error) {
      logger.error(`缓存模板失败: ${templateId}`, error);
    }
  }

  /**
   * 获取缓存的模板
   */
  async getCachedTemplate(templateId) {
    try {
      const result = await chrome.storage.local.get(['cachedTemplates']);
      const cachedTemplates = result.cachedTemplates || {};
      
      const cached = cachedTemplates[templateId];
      if (cached) {
        // 检查缓存是否过期（7天）
        const isExpired = Date.now() - cached.cachedAt > 7 * 24 * 60 * 60 * 1000;
        if (!isExpired) {
          return cached.data;
        } else {
          logger.info(`缓存模板已过期: ${templateId}`);
        }
      }
      
      return null;
    } catch (error) {
      logger.error(`获取缓存模板失败: ${templateId}`, error);
      return null;
    }
  }

  /**
   * 切换当前使用的模板
   */
  async switchTemplate(templateId) {
    try {
      logger.info(`切换模板: ${templateId}`);
      
      // 加载模板数据
      const templateData = await this.loadTemplate(templateId);
      
      // 更新存储
      await chrome.storage.local.set({
        currentTemplateId: templateId,
        currentTemplate: templateData
      });
      
      logger.info(`模板切换成功: ${templateData.name || templateId}`);
      return templateData;
    } catch (error) {
      logger.error(`模板切换失败: ${templateId}`, error);
      throw error;
    }
  }

  /**
   * 获取当前使用的模板信息
   */
  async getCurrentTemplate() {
    try {
      const result = await chrome.storage.local.get(['currentTemplate', 'currentTemplateId']);
      
      // 如果没有设置过模板，初始化默认模板
      if (!result.currentTemplateId) {
        logger.info('首次使用，初始化默认模板');
        await this.switchTemplate('default');
        return await this.getCurrentTemplate();
      }
      
      return {
        id: result.currentTemplateId || 'default',
        data: result.currentTemplate
      };
    } catch (error) {
      logger.error('获取当前模板失败', error);
      return { id: 'default', data: null };
    }
  }
}