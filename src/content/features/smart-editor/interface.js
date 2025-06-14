// 智能编辑器界面管理
import { createElement, safeQuerySelector } from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";
import {
  computePosition,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/dom";

// 存储清理函数
let cleanupAutoUpdate = null;

/**
 * 创建编辑器界面
 * @param {Element} ueditor 原编辑器元素
 */
export function createEditorInterface() {
  // 创建编辑器容器
  const editorContainer = createElement("div", {
    id: "smart-editor-container",
    className: "flowedit-editor-container",
  });

  // 查找参考元素 - 优先使用作者区域
  const referenceElement =
    safeQuerySelector(selectorConfig.authorArea) ||
    safeQuerySelector(selectorConfig.editorWrapper) ||
    safeQuerySelector(selectorConfig.ueditor);

  if (!referenceElement) {
    console.error("无法找到合适的参考元素来定位智能编辑器，请检查页面结构");
    throw new Error("无法找到合适的参考元素来定位智能编辑器");
  }

  // 将容器添加到 body
  document.body.appendChild(editorContainer);

  // 使用 Floating UI 定位
  const updatePosition = () => {
    computePosition(referenceElement, editorContainer, {
      placement: "bottom-start",
      middleware: [offset(10), flip(), shift({ padding: 10 })],
    }).then(({ x, y }) => {
      // 获取参考元素的宽度
      const referenceWidth = referenceElement.offsetWidth;

      Object.assign(editorContainer.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${referenceWidth}px`,
        maxWidth: `${referenceWidth}px`,
      });
    });
  };

  // 初始定位
  updatePosition();

  // 自动更新位置
  cleanupAutoUpdate = autoUpdate(
    referenceElement,
    editorContainer,
    updatePosition
  );

  // 创建编辑器占位元素
  const editorHolder = createElement("div", {
    id: "editor-holder",
    className: "flowedit-editor-holder",
  });
  editorContainer.appendChild(editorHolder);

  console.log("智能编辑器界面创建完成，使用 Floating UI 定位");
}

/**
 * 移除编辑器界面
 */
export function removeEditorInterface() {
  // 清理自动更新
  if (cleanupAutoUpdate) {
    cleanupAutoUpdate();
    cleanupAutoUpdate = null;
  }

  const editorContainer = document.getElementById("smart-editor-container");
  if (editorContainer) {
    editorContainer.remove();
    console.log("智能编辑器界面已移除");
  }
}

/**
 * 获取编辑器容器元素
 * @returns {Element|null} 编辑器容器元素
 */
export function getEditorContainer() {
  return document.getElementById("smart-editor-container");
}

/**
 * 获取编辑器占位元素
 * @returns {Element|null} 编辑器占位元素
 */
export function getEditorHolder() {
  return document.getElementById("editor-holder");
}
