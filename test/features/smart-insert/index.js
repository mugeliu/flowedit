let editor = null;
let originalDisplayStates = {};
let controlBar = null;

// 智能插入按钮
export function createSmartButton() {
  const btn = document.createElement("button");
  btn.className = "my-ext-btn my-ext-smart-btn";
  btn.textContent = "智能插入";
  btn.addEventListener("click", async () => {
    if (editor) return;

    const ueditor = document.getElementById("ueditor_0");
    if (!ueditor) return alert("找不到编辑器容器");

    // 隐藏原有区域（移除js_button_area）
    const elementsToHide = ["ueditor_0", "article_setting_area"];
    originalDisplayStates = {};
    elementsToHide.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        originalDisplayStates[id] = el.style.display;
        el.style.display = "none";
      }
    });

    // 处理js_button_area的子元素
    const buttonArea = document.getElementById("js_button_area");
    if (buttonArea) {
      const originalChildren = Array.from(buttonArea.children);
      originalDisplayStates["js_button_area_children"] = originalChildren.map(
        (child) => ({
          element: child,
          display: child.style.display,
        })
      );
      originalChildren.forEach((child) => {
        child.style.display = "none";
      });
    }

    // 创建编辑器容器
    const editorContainer = document.createElement("div");
    editorContainer.id = "smart-editor-container";
    editorContainer.style.cssText = `
      margin-top: 10px;
      border: 2px solidrgb(168, 248, 206);
      border-radius: 4px;
      background: white;
      z-index: 9998;
      padding: 10px;
    `;
    ueditor.parentNode.insertBefore(editorContainer, ueditor.nextSibling);

    const editorHolder = document.createElement("div");
    editorHolder.id = "editor-holder";
    editorHolder.style.minHeight = "400px";
    editorContainer.appendChild(editorHolder);

    // 操作栏
    controlBar = document.createElement("div");
    controlBar.className = "editor_action_bar";
    controlBar.style.cssText = `
      padding: 20px 20px 15px 20px;
      margin: 0;
      background-color: #ffffff;
      color: rgb(53, 53, 53);
      font-family: mp-quote, 'PingFang SC', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif;
      font-size: 14px;
      line-height: 22.4px;
      word-break: break-all;
      box-sizing: content-box;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      z-index: 1000;
    `;

    // 创建保存和取消按钮
    const saveBtn = document.createElement("button");
    saveBtn.textContent = "💾 保存";
    saveBtn.style.cssText = `
      padding: 4px 12px;
      height: 34px;
      width: 98px;
      display: inline-block;
      background: #07c160;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "↩️ 取消";
    cancelBtn.style.cssText = `
      padding: 4px 12px;
      height: 34px;
      width: 98px;
      display: inline-block;
      background: #999999;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;

    // 直接将按钮添加到controlBar
    controlBar.appendChild(saveBtn);
    controlBar.appendChild(cancelBtn);

    // 将controlBar插入到js_button_area中
    if (buttonArea) {
      buttonArea.appendChild(controlBar);
    } else {
      console.warn("找不到js_button_area，将controlBar添加到body");
      document.body.appendChild(controlBar);
    }

    saveBtn.addEventListener("click", saveContent);
    cancelBtn.addEventListener("click", restoreOriginal);

    // 加载 EditorJS 依赖
    if (!window.EditorJS) {
      try {
        // 通过 background.js 注入 EditorJS
        chrome.runtime.sendMessage("inject_editorjs_bundle", (response) => {
          if (response && response.status === "injected") {
            // 等待一小段时间确保脚本加载完成
            setTimeout(() => {
              if (window.EditorJS && window.Paragraph) {
                initializeEditor();
              } else {
                alert("编辑器加载失败");
                restoreOriginal();
              }
            }, 100);
          } else {
            alert("编辑器加载失败");
            restoreOriginal();
          }
        });
      } catch (e) {
        console.error("编辑器加载失败:", e);
        alert("编辑器加载失败");
        restoreOriginal();
        return;
      }
    } else {
      initializeEditor();
    }
  });
  return btn;
}

function initializeEditor() {
  try {
    editor = new EditorJS({
      holder: "editor-holder",
      tools: {
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "请输入标题",
            levels: [2, 3, 4],
            defaultLevel: 2,
          },
        },
      },
      data: getInitialContent(),
      placeholder: "在此输入内容...",
    });
    // 修正块插入器按钮位置为左侧
    const style = document.createElement("style");
    style.innerHTML = `
      .ce-toolbar__plus {
        left: 0 !important;
        right: auto !important;
      }
    `;
    document.head.appendChild(style);
  } catch (e) {
    console.error("编辑器初始化失败:", e);
    restoreOriginal();
  }
}

async function saveContent() {
  if (!editor) return;

  try {
    const { blocks } = await editor.save();
    const target = document.querySelector("#ueditor_0 .ProseMirror");

    if (target) {
      target.innerHTML = blocks
        .map((block) => `<p>${block.data.text.replace(/\n/g, "<br>")}</p>`)
        .join("");
      alert("内容已保存！");
    } else {
      alert("警告：找不到目标编辑器，已恢复原状");
    }
  } catch (error) {
    console.error("保存失败:", error);
    alert("保存失败，请查看控制台");
  } finally {
    restoreOriginal();
  }
}

function restoreOriginal() {
  // 恢复js_button_area的子元素显示状态
  if (originalDisplayStates["js_button_area_children"]) {
    originalDisplayStates["js_button_area_children"].forEach(
      ({ element, display }) => {
        element.style.display = display;
      }
    );
  }

  // 恢复其他元素的显示状态
  ["ueditor_0", "article_setting_area"].forEach((id) => {
    const el = document.getElementById(id);
    if (el && originalDisplayStates[id] !== undefined) {
      el.style.display = originalDisplayStates[id];
    }
  });

  const editorContainer = document.getElementById("smart-editor-container");
  if (editorContainer) editorContainer.remove();

  if (controlBar) {
    controlBar.remove();
    controlBar = null;
  }

  if (editor) {
    try {
      editor.destroy();
    } catch (e) {
      console.warn("编辑器销毁错误:", e);
    }
    editor = null;
  }
}

function getInitialContent() {
  const target = document.querySelector("#ueditor_0 .ProseMirror");
  if (!target) return { blocks: [] };
  const text = target.textContent.trim();
  return text
    ? { blocks: [{ type: "paragraph", data: { text } }] }
    : { blocks: [] };
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
