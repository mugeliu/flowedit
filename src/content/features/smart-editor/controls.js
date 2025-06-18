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
  const { onSave, onCancel } = callbacks;

  const controlBar = createElement("div", {
    className: "flowedit-editor-action-bar",
  });

  // 创建保存按钮
  const saveBtn = createElement("button", {
    textContent: "💾 保存",
    className: "flowedit-editor-save-btn",
  });

  // 创建取消按钮
  const cancelBtn = createElement("button", {
    textContent: "↩️ 取消",
    className: "flowedit-editor-cancel-btn",
  });

  controlBar.appendChild(saveBtn);
  controlBar.appendChild(cancelBtn);

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

  // 绑定事件
  if (onSave && typeof onSave === "function") {
    saveBtn.addEventListener("click", onSave);
  }

  if (onCancel && typeof onCancel === "function") {
    cancelBtn.addEventListener("click", onCancel);
  }

  console.log("智能编辑器控制栏创建完成，已插入到DOM中");

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
