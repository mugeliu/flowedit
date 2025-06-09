// 侧边栏切换开关组件
import { selectorConfig } from '../../config/index.js';
import { createElement } from '../../utils/dom.js';

//todo  实现不完整。

/**
 * 创建侧边栏切换开关
 * @returns {HTMLButtonElement}
 */
export function createSidebarToggle() {
  const switchContainer = createElement('button', {
    className: 'flowedit-switch',
    innerHTML: `
      <div class="flowedit-switch-track"></div>
      <div class="flowedit-switch-thumb"></div>
    `
  });
  
  switchContainer.addEventListener('click', handleSidebarToggle);
  return switchContainer;
}

/**
 * 处理侧边栏切换事件
 * @param {Event} event 点击事件
 */
function handleSidebarToggle(event) {
  const sidebar = document.querySelector(selectorConfig.sidebar);
  if (sidebar) {
    const isHidden = sidebar.style.display === 'none';
    sidebar.style.display = isHidden ? '' : 'none';
    
    // 更新Switch状态
    const switchBtn = event.currentTarget;
    if (isHidden) {
      switchBtn.classList.add('on');
    } else {
      switchBtn.classList.remove('on');
    }
  }
}