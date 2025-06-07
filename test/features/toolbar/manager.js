// 工具栏管理器
import { createSmartButton } from '../../components/buttons/smart-insert.js';
import { createSidebarToggle } from '../../components/switches/sidebar-toggle.js';
import { selectorConfig } from '../../config/index.js';

/**
 * 初始化工具栏
 */
export function initializeToolbar() {
  const buttonArea = document.querySelector(selectorConfig.buttonArea);
  if (!buttonArea) {
    console.warn('找不到按钮区域');
    return;
  }

  // 添加智能插入按钮
  const smartButton = createSmartButton();
  buttonArea.appendChild(smartButton);

  // 添加侧边栏切换开关
  const sidebarToggle = createSidebarToggle();
  buttonArea.appendChild(sidebarToggle);
}