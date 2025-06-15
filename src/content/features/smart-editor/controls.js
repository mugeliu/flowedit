// 智能编辑器控制栏管理
import { createElement, safeQuerySelector } from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";
import { computePosition, autoUpdate } from "@floating-ui/dom";

// 存储控制栏的清理函数
let controlBarCleanupAutoUpdate = null;

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

  // 创建透明占位元素用于布局
  const spacerEl = createElement("div", {
    className: "spacer",
  });

  controlBar.appendChild(saveBtn);
  controlBar.appendChild(cancelBtn);
  controlBar.appendChild(spacerEl);

  // 查找参考元素（只使用底部工具栏）
  const referenceElement = safeQuerySelector(selectorConfig.botBar);

  if (!referenceElement) {
    console.warn("找不到botBar元素，将控制栏添加到body并使用默认定位");
    document.body.appendChild(controlBar);
  } else {
    // 将控制栏添加到 body
    document.body.appendChild(controlBar);

    // 使用 Floating UI 定位实现完全覆盖效果
    const updatePosition = () => {
      computePosition(referenceElement, controlBar, {
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
      }).then(({ x, y }) => {
        // 获取参考元素的尺寸
        const referenceRect = referenceElement.getBoundingClientRect();

        Object.assign(controlBar.style, {
          left: `${x}px`,
          top: `${y}px`,
          width: `${referenceRect.width}px`,
          height: `${referenceRect.height}px`,
        });
      });
    };

    // 初始定位
    updatePosition();

    // 自动更新位置
    controlBarCleanupAutoUpdate = autoUpdate(
      referenceElement,
      controlBar,
      updatePosition
    );
  }

  // 绑定事件
  if (onSave && typeof onSave === "function") {
    saveBtn.addEventListener("click", onSave);
  }

  if (onCancel && typeof onCancel === "function") {
    cancelBtn.addEventListener("click", onCancel);
  }

  console.log("智能编辑器控制栏创建完成，使用 Floating UI 定位");

  return controlBar;
}

/**
 * 移除控制栏
 * @param {HTMLElement} controlBar 控制栏元素
 */
export function removeEditorControls(controlBar) {
  // 清理自动更新
  if (controlBarCleanupAutoUpdate) {
    controlBarCleanupAutoUpdate();
    controlBarCleanupAutoUpdate = null;
  }

  if (controlBar) {
    controlBar.remove();
    console.log("智能编辑器控制栏已移除");
  }
}
