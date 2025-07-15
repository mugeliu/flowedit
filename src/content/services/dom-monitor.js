/**
 * DOM监听服务
 * 
 * 功能1：工具栏监听
 * - 监听微信编辑器工具栏变化
 * - 自动恢复被清除的 FlowEdit 按钮
 * 
 * 功能2：图片插入监听
 * - 监听微信素材库插入的图片
 * - 自动转换为 EditorJS 的图片块
 */

import { pluginRegistry } from "./plugin-registry.js";
import { getCurrentEditor } from "../features/smart-editor/manager.js";
import { createLogger } from './simple-logger.js';

// 创建模块日志器
const logger = createLogger('DOMWatcher');

// DOM 选择器配置
const DOM_SELECTORS = {
  toolbarOuter: '#edui1_toolbarboxouter',  // 工具栏外层容器
  toolbarInner: '#js_toolbar_0',           // 工具栏内层容器
  editorContainer: '#ueditor_0',           // 编辑器内容区域
  floweditAttr: 'data-flowedit="true"'    // FlowEdit 标识属性
};

/**
 * DOM变化监听器类
 * 使用MutationObserver监听工具栏容器变化
 */
class DOMWatcher {
  constructor() {
    this.isWatching = false;
    this.mutationObserver = null;
    this.targetElement = null;

    // 图片监听器
    this.imageObserver = null;
    this.isImageObserverEnabled = false;
    
    // 防抖定时器
    this.restoreTimer = null;
    
    logger.debug('DOMWatcher 初始化完成');
  }

  // ==================== MutationObserver 逻辑部分 ====================

  /**
   * 处理DOM变化（带防抖）
   */
  handleMutations() {
    // 清除之前的定时器
    if (this.restoreTimer) {
      clearTimeout(this.restoreTimer);
    }
    
    // 设置新的定时器（100ms 防抖）
    this.restoreTimer = setTimeout(() => {
      if (this.shouldRestoreButtons()) {
        this.restoreButtons();
      }
    }, 100);
  }

  /**
   * 检测是否需要恢复按钮
   * @returns {boolean} 是否需要恢复按钮
   */
  shouldRestoreButtons() {
    const toolbarElement = document.querySelector(DOM_SELECTORS.toolbarInner);
    if (!toolbarElement) {
      return false;
    }

    // 检查是否存在 FlowEdit 按钮
    const floweditElements = toolbarElement.querySelectorAll(
      `[${DOM_SELECTORS.floweditAttr}]`
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
      logger.error("[DOMWatcher] 恢复按钮失败:", error);
    }
  }

  // ==================== 图片监听功能部分 ====================

  /**
   * 启用图片监听器
   * 监听编辑器容器中的新增图片节点
   */
  enableImageMonitor() {
    const container = document.querySelector(DOM_SELECTORS.editorContainer);
    if (!container) {
      logger.warn(`未找到编辑器容器 ${DOM_SELECTORS.editorContainer}`);
      return;
    }

    if (this.imageObserver) {
      logger.debug("图片监听器已启用");
      return;
    }

    this.imageObserver = new MutationObserver((mutationsList) => {
      this.handleImageMutations(mutationsList);
    });

    this.imageObserver.observe(container, {
      childList: true,
      subtree: true,
    });

    this.isImageObserverEnabled = true;
    logger.info("图片监听器已启动");
  }
  /**
   * 处理图片监听的DOM变化
   * @param {MutationRecord[]} mutationsList - DOM变化列表
   */
  handleImageMutations(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.checkAndInsertImage(node);
          }
        });
      }
    }
  }

  /**
   * 检查节点并插入图片
   * @param {Element} node - DOM节点
   */
  checkAndInsertImage(node) {
    const [firstChild] = node.children;
    
    if (firstChild?.tagName === "IMG") {
      const { src } = firstChild;
      
      // 只处理永久链接的图片
      if (src?.startsWith("http://") || src?.startsWith("https://")) {
        logger.info("检测到图片插入", { src });
        this.insertImageBlock(src);
      } else {
        logger.debug("忽略非永久链接图片", { src });
      }
    }
  }

  /**
   * 插入图片块到编辑器
   * @param {string} src - 图片URL
   */
   insertImageBlock(src) {
    const editor = getCurrentEditor();
    if (!editor) {
      logger.warn("编辑器未激活，无法插入图片块");
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
      logger.info("成功插入图片块", { src });
    } catch (error) {
      logger.error('插入图片失败:', error);
    }
  }

  /**
   * 禁用图片监听器
   */
  disableImageMonitor() {
    if (this.imageObserver) {
      this.imageObserver.disconnect();
      this.imageObserver = null;
      this.isImageObserverEnabled = false;
      logger.info("图片监听器已停止");
    }
  }

  /**
   * 获取图片监听器状态
   * @returns {boolean} 是否启用
   */
  isImageMonitorActive() {
    return this.isImageObserverEnabled;
  }

  // ==================== DOM监听启动停止部分 ====================

  /**
   * 开始监听DOM变化
   */
  startWatching() {
    if (this.isWatching) {
      logger.debug('DOM监听器已在运行，跳过启动');
      return;
    }

    // 获取目标容器
    this.targetElement = document.querySelector(DOM_SELECTORS.toolbarOuter);
    if (!this.targetElement) {
      logger.warn(`未找到目标容器 ${DOM_SELECTORS.toolbarOuter}`);
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
    logger.info('DOM监听器启动成功');
  }

  /**
   * 停止监听DOM变化
   */
  stopWatching() {
    // 清除防抖定时器
    if (this.restoreTimer) {
      clearTimeout(this.restoreTimer);
      this.restoreTimer = null;
    }
    
    // 断开观察器
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    this.targetElement = null;
    this.isWatching = false;
    logger.info('DOM监听器已停止');
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
 * 启用图片监听器
 */
export function enableImageMonitor() {
  domWatcher.enableImageMonitor();
}

/**
 * 禁用图片监听器
 */
export function disableImageMonitor() {
  domWatcher.disableImageMonitor();
}

/**
 * 获取图片监听器状态
 * @returns {boolean} 是否启用
 */
export function isImageMonitorActive() {
  return domWatcher.isImageMonitorActive();
}