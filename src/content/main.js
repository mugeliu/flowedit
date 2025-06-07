// 内容脚本入口文件
import { buttonStyles, switchStyles, editorStyles } from './styles/components.js';
import { initializeToolbar } from './features/toolbar/manager.js';

/**
 * 注入全局样式
 */
function injectGlobalStyles() {
  const styleId = "flowedit-styles";
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

// 初始化全局样式
injectGlobalStyles();

// 初始化工具栏
initializeToolbar();
