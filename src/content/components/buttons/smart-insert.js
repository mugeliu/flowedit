// 智能插入按钮组件
import { createElement } from '../../utils/dom.js';
import { activateSmartEditor } from '../../features/smart-editor/manager.js';

/**
 * 创建智能插入按钮
 * @returns {HTMLButtonElement}
 */
export function createSmartButton() {
  const btn = createElement('button', {
    className: 'flowedit-btn flowedit-smart-btn',
    textContent: '智能插入'
  });
  
  btn.addEventListener('click', handleSmartButtonClick);
  return btn;
}

/**
 * 处理智能插入按钮点击事件
 */
async function handleSmartButtonClick() {
  try {
    await activateSmartEditor();
  } catch (error) {
    console.error('智能插入按钮点击处理失败:', error);
  }
}