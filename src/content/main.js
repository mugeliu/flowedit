import { injectGlobalStyles } from "./core/styles.js";
import { createSwitch } from "./features/switch/index.js";
import { createSmartButton } from "./features/smart-insert/index.js";

// 初始化全局样式
injectGlobalStyles();

// 工具栏挂载
const toolbar = document.getElementById("js_toolbar_0");
if (toolbar) {
  toolbar.insertBefore(createSwitch(), toolbar.firstChild);
  toolbar.appendChild(createSmartButton());
}
