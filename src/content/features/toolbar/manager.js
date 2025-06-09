// 工具栏管理器
import { createSmartButton } from '../../components/buttons/smart-insert.js';
import { createSidebarToggle } from '../../components/switches/sidebar-toggle.js';
import { featureConfig, selectorConfig } from '../../config/index.js';
import { safeQuerySelector } from '../../utils/dom.js';

/**
 * 根据配置添加组件到工具栏
 * @param {HTMLElement} toolbar 工具栏元素
 * @param {HTMLElement} component 要添加的组件
 * @param {Object} config 组件配置
 */
function addComponentToToolbar(toolbar, component, config) {
  const { insertMethod, targetElement } = config;
  
  if (insertMethod === 'insertBefore' && targetElement) {
    const target = toolbar[targetElement];
    if (target) {
      toolbar.insertBefore(component, target);
    } else {
      toolbar.appendChild(component);
    }
  } else {
    toolbar.appendChild(component);
  }
}

/**
 * 初始化工具栏
 * @returns {boolean} 是否成功初始化工具栏
 */
export function initializeToolbar() {
  const toolbar = safeQuerySelector(selectorConfig.toolbar);
  if (!toolbar) {
    console.debug('找不到工具栏区域，可能页面未登录');
    return false;
  }

  // 初始化侧边栏切换功能
  if (featureConfig.sidebarToggle.enabled) {
    const sidebarToggle = createSidebarToggle();
    if (sidebarToggle) {
      addComponentToToolbar(toolbar, sidebarToggle, featureConfig.sidebarToggle);
      console.log('侧边栏切换按钮初始化成功');
    } else {
      console.warn('侧边栏切换按钮创建失败');
    }
  }

  // 初始化智能插入功能
  if (featureConfig.smartInsert.enabled) {
    const smartButton = createSmartButton();
    if (smartButton) {
      addComponentToToolbar(toolbar, smartButton, featureConfig.smartInsert);
      console.log('智能插入按钮初始化成功');
    } else {
      console.warn('智能插入按钮创建失败');
    }
  }
  
  return true;
}