// 内容脚本入口文件 - 专注于插件UI初始化
// 样式已迁移到 /assets/css/flowedit.css，通过 manifest.json 自动加载
import { pluginRegistry } from "./services/plugin-registry.js";
import smartEditorPlugin from "./features/smart-editor/index.js";
import sidebarPlugin from "./features/sidebar/index.js";
import historySidebarPlugin from "./features/history-sidebar/index.js";
import { initializeAppServices } from "./services/system-initializer.js";
import {
  initializeDOMWatcher,
  cleanupDOMWatcher,
} from "./services/dom-monitor.js";
import {
  initializeEditorBridge,
  callEditorAPI,
} from "./services/editor-bridge.js";
import { createLogger } from './services/simple-logger.js';
import { createErrorHandler } from './services/simple-error-handler.js';

// 创建模块日志器和错误处理器
const logger = createLogger('Main');
const errorHandler = createErrorHandler('Main');

// 注册功能模块插件
pluginRegistry.register("smart-editor", smartEditorPlugin);
pluginRegistry.register("sidebar", sidebarPlugin);
pluginRegistry.register("history-sidebar", historySidebarPlugin);

/**
 * 初始化插件功能模块
 */

async function initializePluginFeatures() {
  try {
    // 初始化编辑器桥接服务，使用回调确保脚本注入完成
    initializeEditorBridge(() => {
      logger.info("桥接脚本注入完成，开始检查编辑器就绪状态");
      // 检查微信编辑器是否就绪
      callEditorAPI("mp_editor_get_isready", {}, async (success, res) => {
        try {
          // 检查API调用是否成功且编辑器确实就绪
          if (success && res && res.isReady === true) {
            logger.info("编辑器已就绪，开始初始化插件", res);
            // 初始化所有功能模块
            const initResults = await pluginRegistry.initializeAll();
            if (initResults.failed.length > 0) {
              logger.warn(`初始化失败的功能模块: ${initResults.failed.join(", ")}`);
            }
            // 启动DOM监听服务（监听插件组件是否被页面更新移除）
            initializeDOMWatcher();
          } else {
            logger.error("编辑器未就绪，跳过插件初始化", { success, res });
          }
        } catch (error) {
          await errorHandler.handle(error);
        }
      });
    });
  } catch (error) {
    await errorHandler.handle(error);
  }
}

/**
 * 主入口函数 - 专注于插件启动和初始化
 */
async function main() {
  // 初始化应用服务（用户配置、远程样式系统等 - 预留后期实现）
  try {
    await initializeAppServices();
  } catch (error) {
    await errorHandler.handle(error);
    logger.warn("应用服务初始化失败，使用默认配置继续执行");
    // 继续执行，使用默认配置
  }

  // 初始化插件功能模块
  try {
    await initializePluginFeatures();
  } catch (error) {
    await errorHandler.handle(error);
  }
}

// 页面卸载时清理资源
window.addEventListener("beforeunload", () => {
  cleanupDOMWatcher();
});

// 启动应用
main().catch(async (error) => {
  await errorHandler.handle(error);
});
