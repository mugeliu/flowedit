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
import { initializeDOMWatcher, cleanupDOMWatcher } from "./services/dom-watcher.js";

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
  // 等待DOM加载完成
  if (document.readyState === "loading") {
    await new Promise((resolve) => {
      document.addEventListener("DOMContentLoaded", resolve);
    });
  }

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

// 消息监听器 - 处理来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到popup消息:', request);
  
  switch (request.action) {
    case 'openEditor':
      handleOpenEditor(sendResponse);
      break;
      
    case 'syncContent':
      handleSyncContent(sendResponse);
      break;
      
    case 'getStats':
      handleGetStats(sendResponse);
      break;
      
    case 'updateSettings':
      handleUpdateSettings(request.data, sendResponse);
      break;
      
    default:
      sendResponse({ success: false, error: '未知的操作类型' });
  }
  
  // 返回true表示异步响应
  return true;
});

// 处理打开编辑器请求
async function handleOpenEditor(sendResponse) {
  try {
    // 检查智能编辑器是否已激活
    const smartEditorPlugin = pluginRegistry.getPlugin('smart-editor');
    if (smartEditorPlugin && typeof smartEditorPlugin.isActive === 'function') {
      const isActive = smartEditorPlugin.isActive();
      if (!isActive) {
        // 激活智能编辑器
        await smartEditorPlugin.initialize();
      }
    }
    
    sendResponse({ success: true, message: '编辑器已打开' });
  } catch (error) {
    console.error('打开编辑器失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理同步内容请求
async function handleSyncContent(sendResponse) {
  try {
    // 这里可以添加具体的同步逻辑
    // 例如：从EditorJS获取内容并同步到MP编辑器
    
    sendResponse({ 
      success: true, 
      message: '内容同步完成',
      data: {
        syncTime: new Date().toISOString(),
        blockCount: 0 // 实际的块数量
      }
    });
  } catch (error) {
    console.error('同步内容失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理获取统计信息请求
async function handleGetStats(sendResponse) {
  try {
    const stats = {
      totalBlocks: 0, // 实际的块数量
      lastSync: localStorage.getItem('flowedit_last_sync') || null,
      isEditorActive: false
    };
    
    // 检查编辑器状态
    const smartEditorPlugin = pluginRegistry.getPlugin('smart-editor');
    if (smartEditorPlugin && typeof smartEditorPlugin.isActive === 'function') {
      stats.isEditorActive = smartEditorPlugin.isActive();
    }
    
    sendResponse({ success: true, data: stats });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 处理设置更新请求
async function handleUpdateSettings(settings, sendResponse) {
  try {
    // 保存设置到本地存储
    if (settings.autoSync !== undefined) {
      localStorage.setItem('flowedit_auto_sync', settings.autoSync.toString());
    }
    
    sendResponse({ success: true, message: '设置已更新' });
  } catch (error) {
    console.error('更新设置失败:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
  cleanupDOMWatcher();
});

// 启动应用
main().catch((error) => {
  console.error("FlowEdit 启动失败:", error);
});
