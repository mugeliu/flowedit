// CSS-in-JS 工具

/**
 * 生成随机类名
 * @param {string} [prefix]
 * @returns {string}
 */
export function randomClassName(prefix = "my-ext") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * 动态注入作用域样式
 * @param {string} cssText
 * @param {string} [id] 可选style标签id，防止重复
 * @returns {HTMLStyleElement}
 */
export function injectScopedStyle(cssText, id) {
  if (id && document.getElementById(id)) {
    return document.getElementById(id);
  }
  const style = document.createElement("style");
  if (id) style.id = id;
  style.textContent = cssText;
  document.head.appendChild(style);
  return style;
}
