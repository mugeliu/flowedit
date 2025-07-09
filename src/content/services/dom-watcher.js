// DOM变化监听服务
// 使用MutationObserver监听工具栏元素变化

import { pluginRegistry } from "./plugin-registry.js";
import { getCurrentEditor } from "../features/smart-editor/manager.js";

/**
 * DOM变化监听器类
 * 使用MutationObserver监听工具栏容器变化
 */
class DOMWatcher {
  constructor() {
    this.isWatching = false;
    this.mutationObserver = null;
    this.targetElement = null;

    // 新增的独立监听器
    this.additionObserver = null;
    this.isAdditionObserverEnabled = false;
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
    const floweditElements = toolbarElement.querySelectorAll(
      '[data-flowedit="true"]'
    );
    return floweditElements.length === 0;
  }

  // ==================== 插件自定义元素恢复部分 ====================

  /**
   * 恢复按钮的统一逻辑
   */
  async restoreButtons() {
    try {
      // 先清理现有的插件实例
      pluginRegistry.cleanupPlugin("smart-editor");
      pluginRegistry.cleanupPlugin("sidebar");

      // 重新初始化 smart-editor 插件
      await pluginRegistry.initializePlugin("smart-editor");

      // 重新初始化 sidebar 插件
      await pluginRegistry.initializePlugin("sidebar");
    } catch (error) {
      console.error("[DOMWatcher] 恢复按钮失败:", error);
    }
  }

  // ==================== 独立监听器功能部分 ====================

  /**
   * 启用独立的DOM变化监听器
   * 监听#ueditor_0容器中的新增节点
   */
  enableAdditionObserver() {
    const container = document.getElementById("ueditor_0");
    if (!container) {
      console.warn("[DOMWatcher] 未找到 #ueditor_0 容器");
      return;
    }

    if (this.additionObserver) {
      console.log("[DOMWatcher] 独立监听器已启用");
      return;
    }

    this.additionObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              console.log("[DOMWatcher] 检测到新增节点:", node);
              const [firstChild] = node.children;

              if (firstChild?.tagName === "IMG") {
                const { src } = firstChild;
                if (src?.startsWith("http://") || src?.startsWith("https://")) {
                  console.log("图片src:", src);
                  this.insertImageBlock(src);
                } else {
                  console.log("忽略非永久链接图片:", src);
                }
              }
              
            }
          });
        }
      }
    });

    this.additionObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    this.isAdditionObserverEnabled = true;
    console.log("[DOMWatcher] 启用独立监听器");
  }


   /**
   * 插入图片块到编辑器
   * @param {string} src - 图片URL
   */
   insertImageBlock(src) {
    const editor = getCurrentEditor();
    if (!editor) {
      console.warn("[DOMWatcher] 编辑器未激活，无法插入图片块");
      return;
    }

    try {
      editor.blocks.insert('image', {
        file: {
          url: src
        },
        caption: '',
        withBorder: false,
        withBackground: false,
        stretched: false
      });
      console.log("[DOMWatcher] 成功插入图片块:", src);
    } catch (error) {
      console.error("[DOMWatcher] 插入图片块失败:", error);
    }
  }

  /**
   * 禁用独立的DOM变化监听器
   */
  disableAdditionObserver() {
    if (this.additionObserver) {
      this.additionObserver.disconnect();
      this.additionObserver = null;
      this.isAdditionObserverEnabled = false;
      console.log("[DOMWatcher] 已关闭独立监听器");
    }
  }

  /**
   * 获取独立监听器状态
   * @returns {boolean} 是否启用
   */
  isAdditionObserverActive() {
    return this.isAdditionObserverEnabled;
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

/**
 * 启用独立监听器
 */
export function enableAdditionObserver() {
  domWatcher.enableAdditionObserver();
}

/**
 * 禁用独立监听器
 */
export function disableAdditionObserver() {
  domWatcher.disableAdditionObserver();
}

/**
 * 获取独立监听器状态
 * @returns {boolean} 是否启用
 */
export function isAdditionObserverActive() {
  return domWatcher.isAdditionObserverActive();
}