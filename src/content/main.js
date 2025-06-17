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

// 注册功能模块插件
pluginRegistry.register("smart-editor", smartEditorPlugin);
pluginRegistry.register("sidebar", sidebarPlugin);

/**
 * 注入插件UI样式（仅限插件界面相关样式，不包含内容样式）
 * 插件UI样式包括：按钮、开关、工具栏等插件界面元素
 */
function injectPluginUIStyles() {
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
    console.log("FlowEdit 插件UI样式已注入");
  }
}

/**
 * 初始化插件功能模块
 */
async function initializePluginFeatures() {
  // 1. 检查工具栏是否存在（用于判断页面是否已登录）
  if (!document.querySelector("#js_toolbar_0")) {
    console.log("[FlowEdit] 未找到js_toolbar_0工具栏页面可能未登录");
    return;
  }

  await new Promise(resolve => {
    requestAnimationFrame(() => {          // 第一帧
      requestAnimationFrame(() => {        // 第二帧
        console.log('[FlowEdit] 工具栏已渲染稳定');
        resolve();                        // 完成等待
      });
    });
  });

  // 2. 注入插件UI样式（与内容样式完全分离）
  injectPluginUIStyles();

  // 3. 初始化所有功能模块
  const initResults = await pluginRegistry.initializeAll();

  if (initResults.success.length > 0) {
    console.log(`成功初始化功能模块: ${initResults.success.join(", ")}`);
  }

  if (initResults.failed.length > 0) {
    console.warn(`初始化失败的功能模块: ${initResults.failed.join(", ")}`);
  }

  console.log("FlowEdit 插件功能模块初始化完成");
}

/**
 * 主入口函数 - 专注于插件启动和初始化
 */
async function main() {
  // 等待DOM加载完成
  if (document.readyState === "loading") {
    await new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", resolve);
    });
  }

  // 初始化应用服务（用户配置、远程样式系统等 - 预留后期实现）
  try {
    await initializeAppServices();
    console.log("[FlowEdit]  initializeAppServices初始化成功");
  } catch (error) {
    console.error("[FlowEdit] initializeAppServices初始化失败:", error);
    // 继续执行，使用默认配置
  }

  // 初始化插件功能模块
  await initializePluginFeatures();
}

// 启动应用
main().catch((error) => {
  console.error("FlowEdit 启动失败:", error);
});
