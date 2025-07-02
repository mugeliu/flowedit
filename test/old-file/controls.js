// 智能编辑器控制栏管理
import {
  createElement,
  safeQuerySelector,
  hideElement,
  showElement,
} from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";

/**
 * 创建编辑器控制栏
 * @param {Object} callbacks 回调函数对象
 * @param {Function} callbacks.onSave 保存回调函数
 * @param {Function} callbacks.onCancel 取消回调函数
 * @returns {Element} 控制栏元素
 */
export function createEditorControls(callbacks = {}) {
  const { onSave, onCancel, onPreview } = callbacks;

  const controlBar = createElement("div", {
    id: "control-panel",
    className: "tool_area weui-flex",
  });

  const toolbarContainer = createElement("div", {
    id: "control-panel-toolbar",
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
  saveButton.addEventListener("click", onSave);

  // 创建取消按钮，使用WeUI默认按钮样式
  const cancelButton = createElement("button", {
    role: "button",
    className: "weui-btn weui-btn_default weui-btn_medium",
    textContent: "取消",
  });
  cancelButton.addEventListener("click", onCancel);

  // 创建预览按钮，使用WeUI默认按钮样式
  const previewButton = createElement("button", {
    role: "button",
    className: "weui-btn weui-btn_default weui-btn_medium",
    textContent: "预览",
  });
  previewButton.addEventListener("click", onPreview);

  // 将按钮添加到面板
  controlBar.appendChild(placeholderDiv);
  controlBar.appendChild(toolbarContainer);
  toolbarContainer.appendChild(saveButton);
  toolbarContainer.appendChild(previewButton);
  toolbarContainer.appendChild(cancelButton);

  // 查找底部工具栏元素
  const footerToolbar = document.getElementById(selectorConfig.footerToolbar);

  if (!footerToolbar) {
    console.warn("找不到底部工具栏元素，将控制栏添加到body");
    document.body.appendChild(controlBar);
  } else {
    // 隐藏原始的底部工具栏
    hideElement(footerToolbar);

    // 将自定义控制栏插入到底部工具栏的兄弟节点位置
    footerToolbar.parentNode.insertBefore(
      controlBar,
      footerToolbar.nextSibling
    );
  }

  return controlBar;
}

/**
 * 移除控制栏
 * @param {HTMLElement} controlBar 控制栏元素
 */
export function removeEditorControls(controlBar) {
  if (controlBar) {
    controlBar.remove();
    console.log("智能编辑器控制栏已移除");
  }

  // 恢复显示原始的底部工具栏
  const footerToolbar = document.getElementById(selectorConfig.footerToolbar);
  if (footerToolbar) {
    showElement(footerToolbar);
  }
}
