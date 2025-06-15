// 智能编辑器界面管理
import { createElement, safeQuerySelector } from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";
import { computePosition, autoUpdate } from "@floating-ui/dom";

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
  const referenceElement = safeQuerySelector(selectorConfig.editorContent);
  if (!referenceElement) {
    console.error("无法找到合适的参考元素来定位智能编辑器，请检查页面结构");
    throw new Error("无法找到合适的参考元素来定位智能编辑器");
  }

  // 将容器添加到 id="edui1_iframeholder" 的 div 元素中
  const targetElement = safeQuerySelector(selectorConfig.editorWrapper);
  if (targetElement) {
    targetElement.appendChild(editorContainer);
  } else {
    // 如果找不到目标元素，回退到 body
    document.body.appendChild(editorContainer);
  }

  /**
   * 使用 Floating UI 实现完全覆盖目标元素的定位
   */
  const updatePosition = async () => {
    // 计算位置完全覆盖目标元素
    const { x, y } = await computePosition(referenceElement, editorContainer, {
      strategy: "fixed",
      middleware: [
        {
          name: "cover",
          fn: ({ rects }) => ({
            x: rects.reference.x,
            y: rects.reference.y,
          }),
        },
        {
          name: "size",
          fn: ({ rects }) => ({
            data: {
              width: rects.reference.width,
              height: rects.reference.height,
            },
          }),
        },
      ],
    });

    Object.assign(editorContainer.style, {
      position: "fixed",
      left: `${x - 50}px`,
      top: `${y}px`,
      width: `${referenceElement.offsetWidth + 140}px`,
      height: `${referenceElement.offsetHeight}px`,
    });

    console.log("智能编辑器定位模式: 完全覆盖 (Floating UI)");
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
