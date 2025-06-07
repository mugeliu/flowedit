// 编辑器相关工具函数
import { selectorConfig } from '../config/index.js';

/**
 * 获取编辑器初始内容
 * @returns {Object} EditorJS格式的数据
 */
export function getInitialContent() {
  const target = document.querySelector(selectorConfig.proseMirror);
  if (!target) return { blocks: [] };
  const text = target.textContent.trim();
  return text
    ? { blocks: [{ type: "paragraph", data: { text } }] }
    : { blocks: [] };
}

/**
 * 保存内容到原编辑器
 * @param {Array} blocks EditorJS块数据
 * @returns {boolean} 是否保存成功
 */
export function saveToOriginalEditor(blocks) {
  const target = document.querySelector(selectorConfig.proseMirror);
  if (!target) {
    console.error('找不到目标编辑器');
    return false;
  }

  try {
    target.innerHTML = blocks
      .map((block) => `<p>${block.data.text.replace(/\n/g, "<br>")}</p>`)
      .join("");
    return true;
  } catch (error) {
    console.error('保存内容失败:', error);
    return false;
  }
}

/**
 * 动态加载脚本
 * @param {string} url 脚本URL
 * @returns {Promise}
 */
export function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * 检查EditorJS是否已加载
 * @returns {boolean}
 */
export function isEditorJSLoaded() {
  return !!(window.EditorJS && window.Paragraph && window.Header);
}