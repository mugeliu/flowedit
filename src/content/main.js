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
import { DEBUG_MODE } from './config/debug-config.js';

// 创建模块日志器
const logger = createLogger('Main');

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
          logger.error('插件初始化失败:', error);
        }
      });
    });
  } catch (error) {
    logger.error('初始化插件功能模块失败:', error);
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
    logger.error('初始化插件功能模块失败:', error);
    logger.warn("应用服务初始化失败，使用默认配置继续执行");
    // 继续执行，使用默认配置
  }

  // 初始化插件功能模块
  try {
    await initializePluginFeatures();
  } catch (error) {
    logger.error('初始化插件功能模块失败:', error);
  }
}

// 页面卸载时清理资源
window.addEventListener("beforeunload", () => {
  cleanupDOMWatcher();
});

// 设置全局错误监听（仅在开发/调试模式下启用）
// 检查两种调试模式：配置文件设置 或 运行时localStorage设置
const isDebugMode = DEBUG_MODE || localStorage.getItem('flowedit_debug') === 'true';

if (isDebugMode) {
  logger.info('调试模式：已启用全局错误监听');
  
  window.addEventListener('unhandledrejection', (event) => {
    // Promise错误通常没有filename，但我们可以检查错误堆栈
    const errorStack = event.reason?.stack || '';
    if (errorStack.includes('chrome-extension://') || errorStack.includes('flowedit')) {
      logger.error('未处理的Promise错误:', event.reason);
    }
    // 阻止默认行为（防止控制台重复显示）
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    // 只处理来自扩展的错误
    if (event.filename && event.filename.includes('chrome-extension://')) {
      logger.error('JavaScript运行时错误:', event.message, {
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
      });
    }
    // 不阻止事件传播，让页面自己处理自己的错误
  });
}

// 启动应用
main().catch((error) => {
  logger.error('应用启动失败:', error);
});
