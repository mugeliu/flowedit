// 内容脚本入口文件 - 专注于插件UI初始化
import { buttonStyles, switchStyles, editorStyles } from './styles/components.js';
import { initializeToolbar } from './features/toolbar/manager.js';
import { initializeAppServices } from './services/system-initializer.js';


/**
 * 注入插件UI样式（仅限插件界面相关样式，不包含内容样式）
 * 插件UI样式包括：按钮、开关、工具栏等插件界面元素
 */
function injectPluginUIStyles() {
  const styleId = 'flow-editor-plugin-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.setAttribute('data-flowedit-plugin-ui', 'true');
    style.textContent = `
      /* FlowEdit 插件UI样式 */
      ${buttonStyles}
      ${switchStyles}
      ${editorStyles}
    `;
    document.head.appendChild(style);
    console.log('FlowEdit 插件UI样式已注入');
  }
}

/**
 * 初始化插件功能模块
 */
async function initializePluginFeatures() {
  // 1. 初始化工具栏
  const toolbarInitialized = initializeToolbar();
  
  if (!toolbarInitialized) {
    console.log('FlowEdit 插件功能模块初始化失败：页面可能未登录');
    return;
  }
  
  // 2. 注入插件UI样式（与内容样式完全分离）
  injectPluginUIStyles();
  
  console.log('FlowEdit 插件功能模块初始化完成');
}

/**
 * 主入口函数 - 专注于插件启动和初始化
 */
async function main() {
  console.log('FlowEdit 内容脚本启动');
  
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }
  
  // 初始化应用服务（用户配置、远程样式系统等 - 预留后期实现）
  try {
    await initializeAppServices();
    console.log('FlowEdit 应用服务初始化成功');
  } catch (error) {
    console.error('FlowEdit 应用服务初始化失败:', error);
    // 继续执行，使用默认配置
  }
  
  // 初始化插件功能模块
  await initializePluginFeatures();
}

// 启动应用
main().catch(error => {
  console.error('FlowEdit 启动失败:', error);
});
