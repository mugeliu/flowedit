// 内容脚本入口文件 - 专注于插件UI初始化
import {
  buttonStyles,
  switchStyles,
  editorStyles,
} from "./styles/components.js";
import { pluginRegistry } from "./services/plugin-registry.js";
import smartEditorPlugin from "./features/smart-editor/index.js";
import sidebarPlugin from "./features/sidebar/index.js";
import { initializeAppServices } from "./services/system-initializer.js";
import {
  initializeDOMWatcher,
  cleanupDOMWatcher,
} from "./services/dom-watcher.js";

// 注册功能模块插件
pluginRegistry.register("smart-editor", smartEditorPlugin);
pluginRegistry.register("sidebar", sidebarPlugin);


/**
 * 注入插件UI样式（仅限插件界面相关样式，不包含内容样式）
 * 插件UI样式包括：按钮、开关、工具栏等插件界面元素
 */
function injectPluginUIStyles() {
  const linkId = "weui-styles";
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = "https://res.wx.qq.com/t/wx_fed/weui-source/res/2.6.22/weui.css";
    link.setAttribute("data-flowedit-external", "true");
    document.head.appendChild(link);
  }

  const styleId = "flow-editor-plugin-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.setAttribute("data-flowedit-plugin-ui", "true");
    style.textContent = `
      /* FlowEdit 插件UI样式 */
      ${buttonStyles}
      ${switchStyles}
      ${editorStyles}
    `;
    document.head.appendChild(style);
  }
}

/**
 * 初始化插件功能模块
 */
async function initializePluginFeatures() {
  // 1. 检查工具栏是否存在（用于判断页面是否已登录）
  if (!document.querySelector("#js_toolbar_0")) {
    return;
  }

  // 2. 注入插件UI样式（与内容样式完全分离）
  injectPluginUIStyles();


  // 3. 初始化所有功能模块
  const initResults = await pluginRegistry.initializeAll();

  if (initResults.failed.length > 0) {
    console.warn(`初始化失败的功能模块: ${initResults.failed.join(", ")}`);
  }

  // 4. 启动DOM监听服务（监听插件组件是否被页面更新移除）
  initializeDOMWatcher();
}

/**
 * 主入口函数 - 专注于插件启动和初始化
 */
async function main() {
  // 初始化应用服务（用户配置、远程样式系统等 - 预留后期实现）
  try {
    await initializeAppServices();
  } catch (error) {
    console.error("[FlowEdit] initializeAppServices初始化失败:", error);
    // 继续执行，使用默认配置
  }

  // 初始化插件功能模块
  await initializePluginFeatures();
}

// 页面卸载时清理资源
window.addEventListener("beforeunload", () => {
  cleanupDOMWatcher();
});

// 启动应用
main().catch((error) => {
  console.error("FlowEdit 启动失败:", error);
});
