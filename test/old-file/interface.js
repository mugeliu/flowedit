// 智能编辑器界面管理
import { createElement, hideElement, showElement } from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";

/**
 * 创建编辑器界面
 * @param {Element} ueditor 原编辑器元素
 */
export function createEditorInterface() {
  // 隐藏原编辑器iframe容器
  const editorWrapper = document.getElementById(selectorConfig.editorWrapper);
  if (!hideElement(editorWrapper)) {
    console.warn("[SmartEditor] 未找到原编辑器iframe容器");
  }

  // 创建编辑器容器
  const editorContainer = createElement("div", {
    id: "smart-editor-container",
    className: "flowedit-editor-container",
  });

  // 添加数据属性用于DOM监听器识别
  editorContainer.setAttribute("data-flowedit-plugin", "smart-editor");
  editorContainer.setAttribute("data-flowedit", "true");

  // 查找作者区域作为参考元素
  const authorArea = document.getElementById(selectorConfig.authorArea);

  if (!authorArea) {
    const error = `作者区域未找到: ${selectorConfig.authorArea}`;
    console.error("[SmartEditor]", error);
    throw new Error(error);
  }

  // 获取作者区域的父元素（#edui1_toolbarbox）
  const parentContainer = authorArea.parentElement;
  if (!parentContainer) {
    const error = "作者区域的父元素未找到";
    console.error("[SmartEditor]", error);
    throw new Error(error);
  }

  // 将编辑器容器插入为作者区域的兄弟元素（插入到作者区域之后）
  parentContainer.insertBefore(editorContainer, authorArea.nextSibling);

  // 创建编辑器占位元素
  const editorHolder = createElement("div", {
    id: "editor-holder",
    className: "flowedit-editor-holder",
  });
  editorContainer.appendChild(editorHolder);

  console.log("[SmartEditor] 界面创建完成");
}

/**
 * 移除编辑器界面
 */
export function removeEditorInterface() {
  const editorContainer = document.getElementById("smart-editor-container");
  if (editorContainer) {
    editorContainer.remove();
  }

  // 恢复显示原编辑器iframe容器
  const editorWrapper = document.getElementById(selectorConfig.editorWrapper);
  showElement(editorWrapper);

  console.log("[SmartEditor] 界面已移除");
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
