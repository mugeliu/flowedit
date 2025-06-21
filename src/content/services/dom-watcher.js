// DOM变化监听服务
// 使用MutationObserver监听工具栏元素的子元素变化，当插件元素被移除时重新初始化

import { pluginRegistry } from "./plugin-registry.js";

/**
 * DOM变化监听器类
 * 使用MutationObserver监听工具栏容器的子元素变化
 */
class DOMWatcher {
  constructor() {
    this.isWatching = false;
    this.reinitTimeout = null;
    this.mutationObserver = null;
    this.targetElement = null;
    this.pendingRemoval = false; // 标记是否有节点被移除
  }

  /**
   * 开始监听DOM变化
   */
  startWatching() {
    if (this.isWatching) {
      return;
    }

    // 获取目标容器
    this.targetElement = document.getElementById('edui1_toolbarboxouter');
    if (!this.targetElement) {
      console.error('[DOMWatcher] ❌ 容器未找到');
      return;
    }

    // 创建MutationObserver
    this.mutationObserver = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    // 启动监听
    this.mutationObserver.observe(this.targetElement, {
      childList: true,
      subtree: true
    });
    
    this.isWatching = true;
    console.log('[DOMWatcher] 🔍 开始监听渲染变化');
  }

  /**
   * 停止监听DOM变化
   */
  stopWatching() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    
    if (this.reinitTimeout) {
      clearTimeout(this.reinitTimeout);
      this.reinitTimeout = null;
    }
    
    this.targetElement = null;
    this.pendingRemoval = false;
    this.isWatching = false;
    console.log('[DOMWatcher] 停止监听工具栏元素变化');
  }

  /**
   * 处理DOM变化 - 监听逻辑
   * @param {MutationRecord[]} mutations - 变化记录数组
   */
  handleMutations(mutations) {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        // 阶段1：检测到移除
        if (mutation.removedNodes.length > 0) {
          this.pendingRemoval = true;
        }

        // 阶段2：移除后检测新增（渲染完成）
        if (this.pendingRemoval && mutation.addedNodes.length > 0) {
          this.pendingRemoval = false;
          this.checkFeatureNode(); // 关键点：在此处检查
        }
      }
    });
  }

  /**
   * 检查特征节点
   * @returns {boolean} 是否存在特征节点
   */
  checkFeatureNode() {
    if (!this.targetElement) return false;
    
    // 目标特征
    const TARGET_FEATURES = {
      classStartsWith: "flowedit",
      hasAttribute: "data-flowedit-plugin"
    };
    
    const nodes = this.targetElement.querySelectorAll(`[${TARGET_FEATURES.hasAttribute}]`);
    let found = false;

    nodes.forEach(node => {
      if (Array.from(node.classList).some(c => c.startsWith(TARGET_FEATURES.classStartsWith))) {
        console.log('[DOMWatcher] ✅ 特征节点存在:', node);
        found = true;
      }
    });

    if (!found) {
      console.log('[DOMWatcher] ⚠️ 未找到特征节点');
      // 如果节点不存在则初始化插件重新添加
      this.scheduleReinit();
    }
    
    return found;
  }

  /**
   * 判断元素是否为插件元素
   * @param {Element} element - 要检查的元素
   * @returns {boolean} 是否为插件元素
   */
  isPluginElement(element) {
    // 检查元素是否有插件相关的标识
    const hasFloweditClass = Array.from(element.classList || []).some(className => 
      className.startsWith('flowedit')
    );
    const hasFloweditDataAttr = element.hasAttribute('data-flowedit-plugin');
    
    return hasFloweditClass || hasFloweditDataAttr;
  }

  /**
   * 安排重新初始化
   */
  scheduleReinit() {
    // 使用防抖，避免频繁重新初始化
    if (this.reinitTimeout) {
      clearTimeout(this.reinitTimeout);
    }
    
    this.reinitTimeout = setTimeout(() => {
      this.reinitializePlugins();
    }, 100); // 500ms延迟，给页面更新足够时间
  }



  /**
   * 重新初始化插件
   */
  async reinitializePlugins() {
    try {
      // 清理现有插件
      await pluginRegistry.cleanupAll();
      
      // 等待页面DOM更新
      await new Promise(resolve => setTimeout(resolve, 300));
      
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