import { showEditorModal } from "./editor.js";

// 智能插入按钮
export function createSmartButton() {
  const btn = document.createElement("button");
  btn.className = "my-ext-btn my-ext-smart-btn";
  btn.textContent = "智能插入";
  btn.addEventListener("click", async () => {
    try {
      const data = await showEditorModal();
      // 简单渲染：将所有段落和标题拼成HTML插入（后续可完善）
      const html = (data.blocks || [])
        .map((block) => {
          if (block.type === "header") {
            return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
          } else if (block.type === "paragraph") {
            return `<p>${block.data.text}</p>`;
          }
          return "";
        })
        .join("");
      const editor = document.querySelector("#ueditor_0 .ProseMirror");
      if (editor) {
        editor.innerHTML += html;
      }
    } catch (e) {
      // 用户取消或出错
    }
  });
  return btn;
}
