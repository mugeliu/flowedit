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
      console.warn("[DOMWatcher] 已在监听中");
      return;
    }

    // 创建点击事件处理器
    this.clickHandler = (event) => {
      this.handleSubmitClick(event);
    };

    // 使用事件委托监听整个文档的点击事件
    document.addEventListener('click', this.clickHandler, true);
    this.isWatching = true;
    console.log("[DOMWatcher] 开始监听提交按钮点击事件");
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
    console.log("[DOMWatcher] 停止监听点击事件");
  }

  /**
   * 处理提交按钮点击事件
   * @param {Event} event - 点击事件
   */
  handleSubmitClick(event) {
    // 检查点击的元素是否是提交按钮
    const target = event.target;
    if (target && target.id === 'js_submit') {
      console.log("[DOMWatcher] 检测到提交按钮点击");
      
      // 使用防抖，避免频繁重新初始化
      if (this.reinitTimeout) {
        clearTimeout(this.reinitTimeout);
      }
      
      this.reinitTimeout = setTimeout(() => {
        this.reinitializePlugins();
      }, 500); // 500ms延迟
    }
  }

  /**
   * 重新初始化插件
   */
  async reinitializePlugins() {
    console.log("[DOMWatcher] 检测到提交按钮点击，开始重新初始化插件按钮");
    
    try {
      // 先清理现有插件
      await pluginRegistry.cleanupAll();
      
      // 重新初始化所有插件
      const initResults = await pluginRegistry.initializeAll();
      
      if (initResults.success.length > 0) {
        console.log(`[DOMWatcher] 重新初始化成功: ${initResults.success.join(", ")}`);
      }
      
      if (initResults.failed.length > 0) {
        console.warn(`[DOMWatcher] 重新初始化失败: ${initResults.failed.join(", ")}`);
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