// 模板初始化服务
import { createLogger } from "../../shared/services/logger.js";

const logger = createLogger('TemplateInitializer');

/**
 * 初始化默认模板到 chrome.storage.local
 */
export async function initializeDefaultTemplate() {
  try {
    const result = await chrome.storage.local.get(['currentTemplate', 'currentTemplateId']);
    
    // 如果用户没有设置过模板，加载默认模板
    if (!result.currentTemplate) {
      logger.info('首次启动，初始化默认模板');
      
      // 从 assets 加载默认模板
      const response = await fetch(chrome.runtime.getURL("assets/templates/default.json"));
      if (!response.ok) {
        throw new Error(`加载默认模板失败: ${response.status}`);
      }
      
      const defaultTemplate = await response.json();
      
      // 存储到 chrome.storage.local
      await chrome.storage.local.set({
        currentTemplateId: 'default',
        currentTemplate: defaultTemplate
      });
      
      logger.info('默认模板初始化完成', { 
        templateId: 'default',
        templateName: defaultTemplate.name 
      });
    } else {
      logger.info('模板已存在，跳过初始化', { 
        currentTemplateId: result.currentTemplateId 
      });
    }
  } catch (error) {
    logger.error('默认模板初始化失败', error);
    // 不抛出错误，避免影响插件其他功能
  }
}