// DOM变化监听服务
// 使用MutationObserver监听工具栏元素变化

import { pluginRegistry } from './plugin-registry.js';

/**
 * DOM变化监听器类
 * 使用MutationObserver监听工具栏容器变化
 */
class DOMWatcher {
  constructor() {
    this.isWatching = false;
    this.mutationObserver = null;
    this.targetElement = null;
  }

  // ==================== MutationObserver 逻辑部分 ====================

  /**
   * 处理DOM变化
   */
  handleMutations() {
    if (this.shouldRestoreButtons()) {
      this.restoreButtons();
    }
  }

  /**
   * 检测是否需要重置按钮
   * 检查 id="js_toolbar_0" 的 div 中是否存在包含 data-flowedit="true" 的元素
   * @returns {boolean} 是否需要重置按钮
   */
  shouldRestoreButtons() {
    const toolbarElement = document.getElementById("js_toolbar_0");
    if (!toolbarElement) {
      return false;
    }

    // 检查是否存在包含 data-flowedit="true" 的元素
    const floweditElements = toolbarElement.querySelectorAll('[data-flowedit="true"]');
    return floweditElements.length === 0;
  }



  // ==================== 插件自定义元素恢复部分 ====================

  /**
   * 恢复按钮的统一逻辑
   */
  async restoreButtons() {
    try {
      // 先清理现有的插件实例
      pluginRegistry.cleanupPlugin('smart-editor');
      pluginRegistry.cleanupPlugin('sidebar');
      
      // 重新初始化 smart-editor 插件
      await pluginRegistry.initializePlugin('smart-editor');
      
      // 重新初始化 sidebar 插件
      await pluginRegistry.initializePlugin('sidebar');
    } catch (error) {
      console.error('[DOMWatcher] 恢复按钮失败:', error);
    }
  }

  // ==================== DOM监听启动停止部分 ====================

  /**
   * 开始监听DOM变化
   */
  startWatching() {
    if (this.isWatching) {
      return;
    }

    // 获取目标容器
    this.targetElement = document.getElementById("edui1_toolbarboxouter");
    if (!this.targetElement) {
      return;
    }

    // 创建MutationObserver
    this.mutationObserver = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    // 启动监听
    this.mutationObserver.observe(this.targetElement, {
      childList: true,
      subtree: true,
    });

    this.isWatching = true;
  }

  /**
   * 停止监听DOM变化
   */
  stopWatching() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    this.targetElement = null;
    this.isWatching = false;
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
