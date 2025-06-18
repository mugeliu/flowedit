// DOM事件监听服务
// 用于监听提交按钮点击事件并重新初始化插件组件

import { pluginRegistry } from "./plugin-registry.js";

/**
 * DOM事件监听器类
 * 监听提交按钮的点击事件，当检测到点击时重新初始化插件按钮
 */
class DOMWatcher {
  constructor() {
    this.isWatching = false;
    this.reinitTimeout = null;
    this.clickHandler = null;
  }

  /**
   * 开始监听点击事件
   */
  startWatching() {
    if (this.isWatching) {
      return;
    }

    // 创建点击事件处理器
    this.clickHandler = (event) => {
      this.handleSubmitClick(event);
    };

    // 使用事件委托监听整个文档的点击事件
    document.addEventListener('click', this.clickHandler, true);
    
    this.isWatching = true;
  }

  /**
   * 停止监听点击事件
   */
  stopWatching() {
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler, true);
      this.clickHandler = null;
    }
    
    if (this.reinitTimeout) {
      clearTimeout(this.reinitTimeout);
      this.reinitTimeout = null;
    }
    
    this.isWatching = false;
  }

  /**
   * 处理提交按钮点击事件
   * @param {Event} event - 点击事件
   */
  handleSubmitClick(event) {
    const target = event.target;
    
    // 检查点击的元素是否是提交按钮
    if (this.isSubmitButton(target)) {
      
      // 使用防抖，避免频繁重新初始化
      if (this.reinitTimeout) {
        clearTimeout(this.reinitTimeout);
      }
      
      this.reinitTimeout = setTimeout(() => {
        this.reinitializePlugins();
      }, 800); // 800ms延迟，给页面更新足够时间
    }
  }

  /**
   * 判断元素是否为提交按钮
   * @param {Element} element - 要检查的元素
   * @returns {boolean} 是否为提交按钮
   */
  isSubmitButton(element) {
    if (!element) return false;
    
    // 检查元素本身
    if (this.checkElementIsSubmit(element)) {
      return true;
    }
    
    // 检查父级元素（最多向上查找3层）
    let parent = element.parentElement;
    let level = 0;
    while (parent && level < 3) {
      if (this.checkElementIsSubmit(parent)) {
        return true;
      }
      parent = parent.parentElement;
      level++;
    }
    
    return false;
  }

  /**
   * 检查单个元素是否为提交按钮
   * @param {Element} element - 要检查的元素
   * @returns {boolean} 是否为提交按钮
   */
  checkElementIsSubmit(element) {
    // 只检查特定的提交按钮class
    return element.classList?.contains('send_wording');
  }



  /**
   * 重新初始化插件
   */
  async reinitializePlugins() {
    try {
      // 清理现有插件
      await pluginRegistry.cleanupAll();
      
      // 等待页面DOM更新
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 重新初始化所有插件
      const results = await pluginRegistry.initializeAll();
      
      if (results.failed.length > 0) {
        console.warn(`[DOMWatcher] 重新初始化失败: ${results.failed.join(", ")}`);
      }
    } catch (error) {
      console.error("[DOMWatcher] 重新初始化插件失败:", error);
    }
  }
}

// 创建全局实例
export const domWatcher = new DOMWatcher();

/**
 * 初始化DOM监听服务
 */
export function initializeDOMWatcher() {
  domWatcher.startWatching();
}

/**
 * 清理DOM监听服务
 */
export function cleanupDOMWatcher() {
  domWatcher.stopWatching();
}