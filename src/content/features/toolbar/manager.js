// 工具栏管理器
import { createSmartButton } from '../../components/buttons/smart-insert.js';
import { createSidebarToggle } from '../../components/switches/sidebar-toggle.js';
import { selectorConfig } from '../../config/index.js';
import { safeQuerySelector } from '../../utils/dom.js';

/**
 * 初始化工具栏
 */
export function initializeToolbar() {
  const toolbar = safeQuerySelector(selectorConfig.toolbar);
  if (!toolbar) {
    console.warn('找不到工具栏区域');
    return;
  }

  // 添加侧边栏切换开关到第一个子元素位置
  const sidebarToggle = createSidebarToggle();
  const sidebar = safeQuerySelector(selectorConfig.sidebar);
  if (sidebarToggle && sidebar) {
    if (toolbar.firstElementChild) {
      toolbar.insertBefore(sidebarToggle, toolbar.firstElementChild);
    } else {
      toolbar.appendChild(sidebarToggle);
    }
  } else {
    console.warn('侧边栏切换按钮初始化失败：缺少必要的DOM元素');
  }

  // 添加智能插入按钮到最后一个子元素位置
  const smartButton = createSmartButton();
  const editor = safeQuerySelector(selectorConfig.editor);
  if (smartButton && editor) {
    toolbar.appendChild(smartButton);
  } else {
    console.warn('智能插入按钮初始化失败：缺少必要的DOM元素');
  }
}