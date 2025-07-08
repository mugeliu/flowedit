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
    this.pendingNodes = new WeakMap();
    this.processedNodes = new WeakSet();
    this.debounceDelay = 1000;
  }

  // ==================== MutationObserver 逻辑部分 ====================

  handleMutations() {
    if (this.shouldRestoreButtons()) {
      this.restoreButtons();
    }
  }

  shouldRestoreButtons() {
    const toolbarElement = document.getElementById("js_toolbar_0");
    if (!toolbarElement) return false;
    const floweditElements = toolbarElement.querySelectorAll(
      '[data-flowedit="true"]'
    );
    return floweditElements.length === 0;
  }

  async restoreButtons() {
    try {
      pluginRegistry.cleanupPlugin("smart-editor");
      pluginRegistry.cleanupPlugin("sidebar");
      await pluginRegistry.initializePlugin("smart-editor");
      await pluginRegistry.initializePlugin("sidebar");
    } catch (error) {
      console.error("[DOMWatcher] 恢复按钮失败:", error);
    }
  }

  // ==================== Section 监听器 ====================

  enableAdditionObserver() {
    const container = document.querySelector(
      'div[contenteditable="true"].ProseMirror'
    );
    if (!container) {
      console.warn("[DOMWatcher] 未找到 ProseMirror 容器");
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
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.tagName === "SECTION"
            ) {
              this.scheduleNodeProcessing(node);
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

  scheduleNodeProcessing(node) {
    if (this.pendingNodes.has(node)) {
      clearTimeout(this.pendingNodes.get(node));
    }

    const timeoutId = setTimeout(() => {
      this.processStableSectionNode(node);
      this.pendingNodes.delete(node);
    }, this.debounceDelay);

    this.pendingNodes.set(node, timeoutId);
  }

  processStableSectionNode(node) {
    if (!node.isConnected) {
      console.log("[DOMWatcher] 节点已被移除，跳过处理");
      return;
    }

    if (this.processedNodes.has(node)) {
      console.log("[DOMWatcher] 节点已处理过，跳过重复处理");
      return;
    }

    const firstChild = node.firstElementChild;
    if (!firstChild) {
      console.log("[DOMWatcher] section为空，跳过");
      return;
    }

    const tag = firstChild.tagName.toLowerCase();

    if (tag === "img") {
      const { src } = firstChild;
      if (!src) return;

      if (src.startsWith("blob:")) {
        console.log("[DOMWatcher] img 是 blob 链接，等待转换");
        this.scheduleNodeProcessing(node); // 继续等
        return;
      }

      this.processedNodes.add(node);
      console.log("[DOMWatcher] 处理最终图片节点:", src);
      node.remove();
      this.insertImageBlock(src);
      return;
    }

    if (tag.startsWith("mp-")) {
      const html = node.innerHTML.trim();
      this.processedNodes.add(node);
      console.log("[DOMWatcher] 处理 mp-* 节点:", tag);
      node.remove();
      this.insertRawBlock(`<section>${html}</section>`);
      return;
    }

    // 其他类型全部跳过
    console.log(`[DOMWatcher] 第一个子节点不是 img 或 mp-*（是 ${tag}），跳过`);
  }

  insertImageBlock(src) {
    const editor = getCurrentEditor();
    if (!editor) {
      console.warn("[DOMWatcher] 编辑器未激活，无法插入图片块");
      return false;
    }

    try {
      editor.blocks.insert("image", {
        file: { url: src },
        caption: "",
        withBorder: false,
        withBackground: false,
        stretched: false,
      });
      console.log("[DOMWatcher] 成功插入图片块:", src);
      return true;
    } catch (error) {
      console.error("[DOMWatcher] 插入图片块失败:", error);
      return false;
    }
  }

  insertRawBlock(htmlContent) {
    const editor = getCurrentEditor();
    if (!editor) {
      console.warn("[DOMWatcher] 编辑器未激活，无法插入raw块");
      return false;
    }

    try {
      editor.blocks.insert("raw", { html: htmlContent });
      console.log(
        "[DOMWatcher] 成功插入raw块:",
        htmlContent.substring(0, 100) + "..."
      );
      return true;
    } catch (error) {
      console.error("[DOMWatcher] 插入raw块失败:", error);
      return false;
    }
  }

  disableAdditionObserver() {
    if (this.additionObserver) {
      this.additionObserver.disconnect();
      this.additionObserver = null;
    }
    this.isAdditionObserverEnabled = false;
    console.log("[DOMWatcher] 已关闭独立监听器");
  }

  isAdditionObserverActive() {
    return this.isAdditionObserverEnabled;
  }

  clearPendingNodes() {
    console.log("[DOMWatcher] 清理待处理的节点定时器");
  }

  // ==================== 全局监听器启动停止 ====================

  startWatching() {
    if (this.isWatching) return;

    this.targetElement = document.getElementById("edui1_toolbarboxouter");
    if (!this.targetElement) return;

    this.mutationObserver = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    this.mutationObserver.observe(this.targetElement, {
      childList: true,
      subtree: true,
    });

    this.isWatching = true;
  }

  stopWatching() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    this.targetElement = null;
    this.isWatching = false;

    if (this.additionObserver) {
      this.additionObserver.disconnect();
      this.additionObserver = null;
    }
    this.isAdditionObserverEnabled = false;

    this.clearPendingNodes();
  }
}

// 导出全局实例及接口方法
export const domWatcher = new DOMWatcher();

export function initializeDOMWatcher() {
  domWatcher.startWatching();
}

export function cleanupDOMWatcher() {
  domWatcher.stopWatching();
}

export function enableAdditionObserver() {
  domWatcher.enableAdditionObserver();
}

export function disableAdditionObserver() {
  domWatcher.disableAdditionObserver();
}

export function isAdditionObserverActive() {
  return domWatcher.isAdditionObserverActive();
}
