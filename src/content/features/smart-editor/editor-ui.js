// 智能编辑器UI管理 - 整合controls和interface逻辑
// 此文件用于统一管理编辑器界面和控制栏的创建、移除等操作

import { createElement, hideElement, showElement } from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";
import { createLogger } from "../../services/simple-logger.js";

// 创建模块日志器
const logger = createLogger('EditorUI');

/**
 * 编辑器UI管理模块
 * 整合了界面创建和控制栏管理的功能
 */

/**
 * 创建编辑器页面
 * 负责创建编辑器容器和相关的DOM结构
 * @returns {HTMLElement} 返回创建的编辑器容器元素
 */
export function createEditorPage() {
  // 创建主面板容器
  const panel = createElement("div", {
    id: "flow-editor-panel",
    cssText: `
      position: relative;
      z-index: 1;
      width: calc(100% + 8px);
      box-sizing: content-box;
      margin-left: -95px;
      padding: 0 91px;
    `,
  });

  // 创建面板内容区域
  const panelBody = createElement("div", {
    id: "flow-editorjs-container",
    cssText: `
      width: calc(100% + 65px); /* 超出父容器 */
    `,
  });

  // 组装面板
  panel.appendChild(panelBody);

  return panel;
}

/**
 * 创建编辑器工具栏
 * 负责创建编辑器的控制按钮和工具栏
 * @param {Object} callbacks 回调函数对象
 * @param {Function} callbacks.onSave 保存回调函数
 * @param {Function} callbacks.onCancel 取消回调函数
 * @param {Function} callbacks.onPreview 预览回调函数
 * @returns {HTMLElement} 返回创建的工具栏元素
 */

export function createEditorToolbar(callbacks = {}) {
  const { onSave, onCancel } = callbacks;

  const controlBar = createElement("div", {
    id: "flow-editor-control-panel",
    className: "tool_area weui-flex",
  });

  const toolbarContainer = createElement("div", {
    id: "flow-editor-control-panel-toolbar",
    className: "weui-bottom-fixed-opr weui-btn-area_inline tool_bar",
  });

  // 创建空div占位元素
  const placeholderDiv = createElement("div", {
    id: "placeholder-div",
    className: "weui-flex__item",
  });

  // 创建保存按钮，使用WeUI主要按钮样式
  const saveButton = createElement("button", {
    role: "button",
    className: "weui-btn weui-btn_primary weui-btn_medium",
    textContent: "保存",
  });
  if (onSave) {
    saveButton.addEventListener("click", onSave);
  }

  // 创建取消按钮，使用WeUI默认按钮样式
  const cancelButton = createElement("button", {
    role: "button",
    className: "weui-btn weui-btn_default weui-btn_medium",
    textContent: "取消",
  });
  if (onCancel) {
    cancelButton.addEventListener("click", onCancel);
  }


  // 将按钮添加到面板
  controlBar.appendChild(placeholderDiv);
  controlBar.appendChild(toolbarContainer);
  toolbarContainer.appendChild(saveButton);
  toolbarContainer.appendChild(cancelButton);

  return controlBar;
}

/**
 * 移除编辑器页面
 * 清理编辑器容器和相关DOM元素
 */
export function removeEditorPage() {
  const editorPanel = document.getElementById("flow-editor-panel");
  if (editorPanel) {
    editorPanel.remove();
    logger.info("编辑器页面已移除");
  } else {
    logger.warn("未找到编辑器页面元素");
  }
}

/**
 * 移除编辑器工具栏
 * 清理工具栏和恢复原始状态
 * @param {HTMLElement} toolbar 工具栏元素（可选，如果不提供则通过ID查找）
 */
export function removeEditorToolbar(toolbar) {
  // 如果传入了工具栏元素，直接移除
  if (toolbar && toolbar.remove) {
    toolbar.remove();
    logger.info("编辑器工具栏已移除");
    return;
  }

  // 否则通过ID查找并移除
  const controlPanel = document.getElementById("flow-editor-control-panel");
  if (controlPanel) {
    controlPanel.remove();
    logger.info("编辑器工具栏已移除");
  } else {
    logger.warn("未找到编辑器工具栏元素");
  }
}

/**
 * 初始化编辑器UI
 * 统一创建编辑器页面和工具栏的入口函数
 * @param {Object} options 配置选项
 * @param {Object} options.callbacks 回调函数对象
 * @returns {Object} 返回包含页面和工具栏元素的对象
 */
export function initializeEditorUI(options = {}) {
  try {

    const { callbacks = {} } = options;
    // 1. 创建编辑器页面和工具栏
    const editorPage = createEditorPage();
    const editorToolbar = createEditorToolbar(callbacks);

    // 2. 将编辑器页面插入到 js_author_area 的兄弟节点
    const authorArea = document.getElementById(selectorConfig.authorArea);
    if (authorArea && authorArea.parentNode) {
      // 插入到 authorArea 的下一个兄弟节点位置
      authorArea.parentNode.insertBefore(editorPage, authorArea.nextSibling);
      logger.info("编辑器页面已插入到作者区域后");
    } else {
      logger.warn("未找到作者区域元素，无法插入编辑器页面");
    }

    // 隐藏原编辑器容器
    const success = hideElement(selectorConfig.editorWrapper);
    if (success) {
      logger.info("原编辑器容器已隐藏");
    } else {
      logger.warn("隐藏原编辑器容器失败");
    }

    // 3. 将工具栏插入到 js_button_area 的兄弟节点
    const buttonArea = document.getElementById(selectorConfig.footerToolbar);
    if (buttonArea && buttonArea.parentNode) {
      // 插入到 buttonArea 的下一个兄弟节点位置
      buttonArea.parentNode.insertBefore(editorToolbar, buttonArea.nextSibling);
      logger.info("编辑器工具栏已插入到按钮区域后");
    } else {
      logger.warn("未找到按钮区域元素，无法插入编辑器工具栏");
    }

    // 隐藏原按钮区域
    const hideButtonSuccess = hideElement(selectorConfig.footerToolbar);
    if (hideButtonSuccess) {
      logger.info("原按钮区域已隐藏");
    } else {
      logger.warn("隐藏原按钮区域失败");
    }

    logger.info("编辑器UI初始化完成");

    // 返回创建的UI元素
    return {
      editorPage,
      editorToolbar,
    };
  } catch (error) {
    logger.error("初始化编辑器UI时发生错误:", error);
    return null;
  }
}

/**
 * 清理编辑器UI
 * 统一清理编辑器页面和工具栏的入口函数
 */
export function cleanupEditorUI() {
  try {
    // 移除编辑器页面
    removeEditorPage();

    // 移除编辑器工具栏
    removeEditorToolbar();

    // 恢复被隐藏的原始元素
    const showEditorSuccess = showElement(selectorConfig.editorWrapper);
    if (showEditorSuccess) {
      logger.info("原编辑器容器已恢复显示");
    } else {
      logger.warn("恢复原编辑器容器显示失败");
    }

    const showButtonSuccess = showElement(selectorConfig.footerToolbar);
    if (showButtonSuccess) {
      logger.info("原按钮区域已恢复显示");
    } else {
      logger.warn("恢复原按钮区域显示失败");
    }

    logger.info("编辑器UI清理完成");
  } catch (error) {
    logger.error("清理编辑器UI时发生错误:", error);
  }
}
