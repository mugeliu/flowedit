// 智能编辑器控制栏管理
import { createElement, safeQuerySelector } from '../../utils/dom.js';
import { selectorConfig } from '../../config/index.js';

/**
 * 创建编辑器控制栏
 * @param {Object} callbacks 回调函数对象
 * @param {Function} callbacks.onSave 保存回调函数
 * @param {Function} callbacks.onCancel 取消回调函数
 * @returns {Element} 控制栏元素
 */
export function createEditorControls(callbacks = {}) {
  const { onSave, onCancel } = callbacks;
  
  const controlBar = createElement('div', {
    className: 'flowedit-editor-action-bar'
  });

  // 创建保存按钮
  const saveBtn = createElement('button', {
    textContent: '💾 保存',
    className: 'flowedit-editor-save-btn'
  });

  // 创建取消按钮
  const cancelBtn = createElement('button', {
    textContent: '↩️ 取消',
    className: 'flowedit-editor-cancel-btn'
  });

  controlBar.appendChild(saveBtn);
  controlBar.appendChild(cancelBtn);

  // 添加到按钮区域
  const buttonArea = safeQuerySelector(selectorConfig.buttonArea);
  if (buttonArea) {
    buttonArea.appendChild(controlBar);
  } else {
    console.warn('找不到按钮区域，将控制栏添加到body');
    document.body.appendChild(controlBar);
  }

  // 绑定事件
  if (onSave && typeof onSave === 'function') {
    saveBtn.addEventListener('click', onSave);
  }
  
  if (onCancel && typeof onCancel === 'function') {
    cancelBtn.addEventListener('click', onCancel);
  }
  
  console.log('智能编辑器控制栏创建完成');
  
  return controlBar;
}

/**
 * 移除控制栏
 * @param {HTMLElement} controlBar 控制栏元素
 */
export function removeEditorControls(controlBar) {
  if (controlBar) {
    controlBar.remove();
    console.log('智能编辑器控制栏已移除');
  }
}

/**
 * 更新控制栏按钮状态
 * @param {Element} controlBar 控制栏元素
 * @param {Object} states 按钮状态对象
 * @param {boolean} states.saveDisabled 保存按钮是否禁用
 * @param {boolean} states.cancelDisabled 取消按钮是否禁用
 */
export function updateControlsState(controlBar, states = {}) {
  if (!controlBar) return;
  
  const saveBtn = controlBar.querySelector('.flowedit-editor-save-btn');
  const cancelBtn = controlBar.querySelector('.flowedit-editor-cancel-btn');
  
  if (saveBtn && typeof states.saveDisabled === 'boolean') {
    saveBtn.disabled = states.saveDisabled;
  }
  
  if (cancelBtn && typeof states.cancelDisabled === 'boolean') {
    cancelBtn.disabled = states.cancelDisabled;
  }
}

/**
 * 创建自定义控制按钮
 * @param {Object} config 按钮配置
 * @param {string} config.text 按钮文本
 * @param {string} config.className 按钮样式类
 * @param {Function} config.onClick 点击回调函数
 * @returns {Element} 按钮元素
 */
export function createCustomControlButton(config = {}) {
  const { text = '按钮', className = 'flowedit-editor-custom-btn', onClick } = config;
  
  const button = createElement('button', {
    textContent: text,
    className: className
  });
  
  if (onClick && typeof onClick === 'function') {
    button.addEventListener('click', onClick);
  }
  
  return button;
}