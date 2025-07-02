// 内容脚本入口文件 - 专注于插件UI初始化
// 样式已迁移到 /assets/css/flowedit.css，通过 manifest.json 自动加载
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
 * 初始化插件功能模块
 */
async function initializePluginFeatures() {
  // 检查微信编辑器是否就绪
  chrome.runtime.sendMessage(
    {
      action: "invokeMPEditorAPI",
      apiName: "mp_editor_get_isready",
    },
    async (response) => {
      if (response.success && response.data && response.data.isReady === true) {
        console.log("编辑器已就绪，开始初始化插件:", response.data);

        // 初始化所有功能模块
        const initResults = await pluginRegistry.initializeAll();

        if (initResults.failed.length > 0) {
          console.warn(
            `初始化失败的功能模块: ${initResults.failed.join(", ")}`
          );
        }

        // 启动DOM监听服务（监听插件组件是否被页面更新移除）
        initializeDOMWatcher();
      } else {
        console.log("编辑器未就绪，跳过插件初始化:", response);
      }
    }
  );
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
