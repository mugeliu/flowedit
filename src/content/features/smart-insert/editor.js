// Editor 弹窗与编辑器初始化

import { injectEditorModalStyle } from "./editor-modal-style.js";

/**
 * 动态加载外部JS
 * @param {string} path
 * @returns {Promise<void>}
 */
export function loadScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL(path);
    script.onload = () => {
      console.log("[flowedit] Loaded:", script.src);
      resolve();
    };
    script.onerror = () => {
      console.error("[flowedit] Failed to load:", script.src);
      reject(new Error("Failed to load script: " + script.src));
    };
    document.head.appendChild(script);
  });
}

/**
 * 请求 background 注入 editorjs-bundle.js
 * @returns {Promise<void>}
 */
function injectEditorJSBundle() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage("inject_editorjs_bundle", (response) => {
      if (response && response.status === "injected") {
        // 等待下一个事件循环，确保 window.EditorJS 已挂载
        setTimeout(resolve, 0);
      } else {
        reject(new Error("EditorJS bundle 注入失败"));
      }
    });
  });
}

/**
 * 显示全屏编辑器弹窗，返回Promise，resolve时传回用户输入内容
 * @returns {Promise<string>} 用户输入的内容（HTML字符串或Editor.js数据）
 */
export async function showEditorModal() {
  injectEditorModalStyle();

  // 1. 创建全屏弹窗结构
  const overlay = document.createElement("div");
  overlay.className = "editorjs-modal-overlay";

  const content = document.createElement("div");
  content.className = "editorjs-modal-content";

  const editorDiv = document.createElement("div");
  editorDiv.id = "editorjs-container";
  editorDiv.style.flex = "1 1 auto";
  content.appendChild(editorDiv);

  // 按钮栏
  const btnBar = document.createElement("div");
  btnBar.className = "editorjs-modal-btnbar";
  const okBtn = document.createElement("button");
  okBtn.textContent = "插入";
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "取消";
  btnBar.appendChild(okBtn);
  btnBar.appendChild(cancelBtn);
  content.appendChild(btnBar);

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // 支持ESC关闭
  const escListener = (e) => {
    if (e.key === "Escape") {
      overlay.remove();
      window.removeEventListener("keydown", escListener);
    }
  };
  window.addEventListener("keydown", escListener);

  // 点击遮罩关闭
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
      window.removeEventListener("keydown", escListener);
    }
  });

  // 2. 加载本地Editor.js及插件
  try {
    await injectEditorJSBundle();
  } catch (e) {
    alert("有依赖脚本加载失败，请检查控制台日志");
    overlay.remove();
    return;
  }
  // 3. 检查依赖是否挂载到window
  console.log(
    "[flowedit] window.EditorJS:",
    window.EditorJS,
    typeof window.EditorJS
  );
  console.log("[flowedit] window.Header:", window.Header, typeof window.Header);
  console.log(
    "[flowedit] window.Paragraph:",
    window.Paragraph,
    typeof window.Paragraph
  );
  if (!window.EditorJS || !window.Header || !window.Paragraph) {
    alert("编辑器依赖加载失败，请检查本地js文件！");
    overlay.remove();
    return;
  }

  // 4. 初始化编辑器
  editorDiv.style.border = "2px solid red";
  const editor = new window.EditorJS({
    holder: "editorjs-container",
    tools: {
      header: window.Header,
      paragraph: {
        class: window.Paragraph,
        inlineToolbar: true,
      },
    },
    data: {
      blocks: [
        { type: "header", data: { text: "测试标题", level: 2 } },
        { type: "paragraph", data: { text: "输入你的内容..." } },
      ],
    },
  });
  editor.isReady.then(() => {
    console.log("[flowedit] EditorJS is ready");
    const container = document.getElementById("editorjs-container");
    console.log(
      "[flowedit] #editorjs-container children:",
      container ? container.children : null
    );
  });

  // 4. 返回Promise，用户点击插入时resolve内容
  return new Promise((resolve, reject) => {
    okBtn.onclick = async () => {
      try {
        const output = await editor.save();
        overlay.remove();
        window.removeEventListener("keydown", escListener);
        resolve(output);
      } catch (e) {
        alert("获取内容失败");
      }
    };
    cancelBtn.onclick = () => {
      overlay.remove();
      window.removeEventListener("keydown", escListener);
      reject("用户取消");
    };
  });
}
