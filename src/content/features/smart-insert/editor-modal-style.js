// 动态注入编辑器弹窗样式
export function injectEditorModalStyle() {
  const styleId = "editorjs-modal-style";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    .editorjs-modal-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.5); z-index: 9999;
      display: flex; justify-content: center; align-items: center;
    }
    .editorjs-modal-content {
      width: 80vw; height: 80vh; background: #fff; border-radius: 8px;
      padding: 20px; position: relative; display: flex; flex-direction: column;
    }
    .editorjs-modal-btnbar {
      text-align: right; margin-top: 16px; position: absolute;
      right: 40px; bottom: 40px; z-index: 10000;
    }
    .editorjs-modal-btnbar button {
      margin-left: 12px; padding: 6px 18px; border-radius: 4px; border: none;
      background: #07c160; color: #fff; font-size: 14px; cursor: pointer;
    }
    .editorjs-modal-btnbar button:last-child {
      background: #ccc; color: #333;
    }
  `;
  document.head.appendChild(style);
}
