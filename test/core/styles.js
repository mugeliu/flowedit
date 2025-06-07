// 全局样式注入
import { buttonStyles, switchStyles, editorStyles } from '../styles/components.js';

/**
 * 注入全局样式
 */
export function injectGlobalStyles() {
  const styleId = "my-extension-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      ${buttonStyles}
      ${switchStyles}
      ${editorStyles}
    `;
    document.head.appendChild(style);
  }
}
