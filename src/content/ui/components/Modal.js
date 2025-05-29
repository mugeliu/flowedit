// 通用弹出框组件
// 用于显示消息、确认和自定义内容

import { generateUniqueId } from '../../utils/helpers.js';
import { createIcon } from './Icon.js';

/**
 * 弹出框类型
 * @enum {string}
 */
export const MODAL_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  CONFIRM: 'confirm',
  CUSTOM: 'custom'
};

/**
 * 通用弹出框类
 * 用于创建和管理弹出框
 */
export class Modal {
  /**
   * 创建弹出框
   * @param {Object} options - 弹出框选项
   * @param {string} options.title - 标题
   * @param {string} options.content - 内容
   * @param {string} options.type - 类型（info, success, warning, error, confirm, custom）
   * @param {boolean} options.closable - 是否可关闭
   * @param {boolean} options.backdrop - 是否显示背景遮罩
   * @param {boolean} options.closeOnBackdrop - 点击背景遮罩是否关闭
   * @param {Function} options.onConfirm - 确认回调
   * @param {Function} options.onCancel - 取消回调
   * @param {Function} options.onClose - 关闭回调
   * @param {Object} options.buttons - 自定义按钮配置
   */
  constructor(options = {}) {
    this.id = generateUniqueId('modal');
    this.title = options.title || '';
    this.content = options.content || '';
    this.type = options.type || MODAL_TYPES.INFO;
    this.closable = options.closable !== false;
    this.backdrop = options.backdrop !== false;
    this.closeOnBackdrop = options.closeOnBackdrop !== false;
    this.onConfirm = options.onConfirm || (() => {});
    this.onCancel = options.onCancel || (() => {});
    this.onClose = options.onClose || (() => {});
    this.buttons = options.buttons || [];
    
    this.modal = null;
    this.backdropElement = null;
    this.isVisible = false;
    
    // 绑定方法
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.toggle = this.toggle.bind(this);
    this.create = this.create.bind(this);
    this.handleConfirm = this.handleConfirm.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleBackdropClick = this.handleBackdropClick.bind(this);
  }
  
  /**
   * 创建弹出框
   * @returns {HTMLElement} 弹出框元素
   */
  create() {
    // 如果弹出框已存在，则返回
    if (this.modal) {
      return this.modal;
    }
    
    // 创建背景遮罩
    if (this.backdrop) {
      this.backdropElement = document.createElement('div');
      this.backdropElement.className = 'wx-modal-backdrop wx-hidden';
      if (this.closeOnBackdrop) {
        this.backdropElement.addEventListener('click', this.handleBackdropClick);
      }
    }
    
    // 创建弹出框容器
    this.modal = document.createElement('div');
    this.modal.id = this.id;
    this.modal.className = `wx-modal wx-modal-${this.type} wx-hidden`;
    
    // 创建弹出框头部
    const header = document.createElement('div');
    header.className = 'wx-modal-header';
    
    const title = document.createElement('h2');
    title.className = 'wx-modal-title';
    title.textContent = this.title;
    
    header.appendChild(title);
    
    // 添加关闭按钮
    if (this.closable) {
      const closeButton = document.createElement('button');
      closeButton.className = 'wx-modal-close';
      closeButton.innerHTML = createIcon('close');
      closeButton.setAttribute('aria-label', '关闭');
      closeButton.addEventListener('click', this.handleClose);
      
      header.appendChild(closeButton);
    }
    
    // 创建弹出框内容
    const contentElement = document.createElement('div');
    contentElement.className = 'wx-modal-content';
    
    // 根据类型添加图标
    if (this.type !== MODAL_TYPES.CUSTOM) {
      const iconContainer = document.createElement('div');
      iconContainer.className = 'wx-modal-icon';
      
      let iconName;
      switch (this.type) {
        case MODAL_TYPES.SUCCESS:
          iconName = 'check-circle';
          break;
        case MODAL_TYPES.WARNING:
          iconName = 'warning';
          break;
        case MODAL_TYPES.ERROR:
          iconName = 'error';
          break;
        case MODAL_TYPES.CONFIRM:
          iconName = 'question';
          break;
        default:
          iconName = 'info';
      }
      
      iconContainer.innerHTML = createIcon(iconName);
      contentElement.appendChild(iconContainer);
    }
    
    // 添加内容
    const messageElement = document.createElement('div');
    messageElement.className = 'wx-modal-message';
    
    if (typeof this.content === 'string') {
      messageElement.innerHTML = this.content;
    } else if (this.content instanceof HTMLElement) {
      messageElement.appendChild(this.content);
    }
    
    contentElement.appendChild(messageElement);
    
    // 创建弹出框底部
    const footer = document.createElement('div');
    footer.className = 'wx-modal-footer';
    
    // 添加按钮
    if (this.buttons.length > 0) {
      // 使用自定义按钮
      this.buttons.forEach(button => {
        const buttonElement = document.createElement('button');
        buttonElement.className = `wx-modal-button wx-modal-button-${button.type || 'default'}`;
        buttonElement.textContent = button.text;
        buttonElement.type = 'button';
        
        if (button.onClick) {
          buttonElement.addEventListener('click', (e) => {
            button.onClick(e);
            if (button.closeModal !== false) {
              this.hide();
            }
          });
        }
        
        footer.appendChild(buttonElement);
      });
    } else {
      // 使用默认按钮
      switch (this.type) {
        case MODAL_TYPES.CONFIRM:
          // 添加取消按钮
          const cancelButton = document.createElement('button');
          cancelButton.className = 'wx-modal-button wx-modal-button-secondary';
          cancelButton.textContent = '取消';
          cancelButton.type = 'button';
          cancelButton.addEventListener('click', this.handleCancel);
          
          // 添加确认按钮
          const confirmButton = document.createElement('button');
          confirmButton.className = 'wx-modal-button wx-modal-button-primary';
          confirmButton.textContent = '确认';
          confirmButton.type = 'button';
          confirmButton.addEventListener('click', this.handleConfirm);
          
          footer.appendChild(cancelButton);
          footer.appendChild(confirmButton);
          break;
          
        default:
          // 添加确定按钮
          const okButton = document.createElement('button');
          okButton.className = 'wx-modal-button wx-modal-button-primary';
          okButton.textContent = '确定';
          okButton.type = 'button';
          okButton.addEventListener('click', this.handleClose);
          
          footer.appendChild(okButton);
      }
    }
    
    // 组装弹出框
    this.modal.appendChild(header);
    this.modal.appendChild(contentElement);
    this.modal.appendChild(footer);
    
    // 添加到文档
    if (this.backdropElement) {
      document.body.appendChild(this.backdropElement);
    }
    document.body.appendChild(this.modal);
    
    // 添加键盘事件监听
    document.addEventListener('keydown', this.handleKeyDown);
    
    return this.modal;
  }
  
  /**
   * 显示弹出框
   */
  show() {
    if (!this.modal) {
      this.create();
    }
    
    if (this.backdropElement) {
      this.backdropElement.classList.remove('wx-hidden');
    }
    this.modal.classList.remove('wx-hidden');
    this.isVisible = true;
    
    // 聚焦第一个按钮
    setTimeout(() => {
      const firstButton = this.modal.querySelector('.wx-modal-button');
      if (firstButton) {
        firstButton.focus();
      }
    }, 100);
  }
  
  /**
   * 隐藏弹出框
   */
  hide() {
    if (this.modal) {
      if (this.backdropElement) {
        this.backdropElement.classList.add('wx-hidden');
      }
      this.modal.classList.add('wx-hidden');
      this.isVisible = false;
    }
  }
  
  /**
   * 切换弹出框显示状态
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  /**
   * 处理确认按钮点击
   */
  handleConfirm() {
    this.hide();
    
    // 调用确认回调
    if (typeof this.onConfirm === 'function') {
      this.onConfirm();
    }
  }
  
  /**
   * 处理取消按钮点击
   */
  handleCancel() {
    this.hide();
    
    // 调用取消回调
    if (typeof this.onCancel === 'function') {
      this.onCancel();
    }
  }
  
  /**
   * 处理关闭按钮点击
   */
  handleClose() {
    this.hide();
    
    // 调用关闭回调
    if (typeof this.onClose === 'function') {
      this.onClose();
    }
  }
  
  /**
   * 处理背景遮罩点击
   */
  handleBackdropClick() {
    if (this.closeOnBackdrop) {
      this.handleClose();
    }
  }
  
  /**
   * 处理键盘事件
   * @param {KeyboardEvent} event - 键盘事件
   */
  handleKeyDown(event) {
    if (!this.isVisible) {
      return;
    }
    
    // ESC 键关闭弹出框
    if (event.key === 'Escape' && this.closable) {
      this.handleClose();
    }
    
    // Enter 键确认（当焦点不在表单元素上时）
    if (event.key === 'Enter' && 
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      if (this.type === MODAL_TYPES.CONFIRM) {
        this.handleConfirm();
      } else {
        this.handleClose();
      }
    }
  }
  
  /**
   * 销毁弹出框
   */
  destroy() {
    // 移除事件监听
    document.removeEventListener('keydown', this.handleKeyDown);
    
    // 移除元素
    if (this.backdropElement && this.backdropElement.parentNode) {
      this.backdropElement.parentNode.removeChild(this.backdropElement);
    }
    
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    
    this.modal = null;
    this.backdropElement = null;
    this.isVisible = false;
  }
  
  /**
   * 更新弹出框内容
   * @param {Object} options - 更新选项
   */
  update(options = {}) {
    // 更新属性
    if (options.title !== undefined) {
      this.title = options.title;
      if (this.modal) {
        const titleElement = this.modal.querySelector('.wx-modal-title');
        if (titleElement) {
          titleElement.textContent = this.title;
        }
      }
    }
    
    if (options.content !== undefined) {
      this.content = options.content;
      if (this.modal) {
        const messageElement = this.modal.querySelector('.wx-modal-message');
        if (messageElement) {
          messageElement.innerHTML = '';
          
          if (typeof this.content === 'string') {
            messageElement.innerHTML = this.content;
          } else if (this.content instanceof HTMLElement) {
            messageElement.appendChild(this.content);
          }
        }
      }
    }
    
    // 更新回调
    if (options.onConfirm !== undefined) {
      this.onConfirm = options.onConfirm;
    }
    
    if (options.onCancel !== undefined) {
      this.onCancel = options.onCancel;
    }
    
    if (options.onClose !== undefined) {
      this.onClose = options.onClose;
    }
  }
}

/**
 * 创建并显示一个消息弹出框
 * @param {string} content - 消息内容
 * @param {string} title - 标题
 * @param {Function} onClose - 关闭回调
 * @returns {Modal} 弹出框实例
 */
export function showMessage(content, title = '提示', onClose = null) {
  const modal = new Modal({
    title,
    content,
    type: MODAL_TYPES.INFO,
    onClose
  });
  
  modal.show();
  return modal;
}

/**
 * 创建并显示一个成功弹出框
 * @param {string} content - 消息内容
 * @param {string} title - 标题
 * @param {Function} onClose - 关闭回调
 * @returns {Modal} 弹出框实例
 */
export function showSuccess(content, title = '成功', onClose = null) {
  const modal = new Modal({
    title,
    content,
    type: MODAL_TYPES.SUCCESS,
    onClose
  });
  
  modal.show();
  return modal;
}

/**
 * 创建并显示一个警告弹出框
 * @param {string} content - 消息内容
 * @param {string} title - 标题
 * @param {Function} onClose - 关闭回调
 * @returns {Modal} 弹出框实例
 */
export function showWarning(content, title = '警告', onClose = null) {
  const modal = new Modal({
    title,
    content,
    type: MODAL_TYPES.WARNING,
    onClose
  });
  
  modal.show();
  return modal;
}

/**
 * 创建并显示一个错误弹出框
 * @param {string} content - 消息内容
 * @param {string} title - 标题
 * @param {Function} onClose - 关闭回调
 * @returns {Modal} 弹出框实例
 */
export function showError(content, title = '错误', onClose = null) {
  const modal = new Modal({
    title,
    content,
    type: MODAL_TYPES.ERROR,
    onClose
  });
  
  modal.show();
  return modal;
}

/**
 * 创建并显示一个确认弹出框
 * @param {string} content - 消息内容
 * @param {string} title - 标题
 * @param {Function} onConfirm - 确认回调
 * @param {Function} onCancel - 取消回调
 * @returns {Modal} 弹出框实例
 */
export function showConfirm(content, title = '确认', onConfirm = null, onCancel = null) {
  const modal = new Modal({
    title,
    content,
    type: MODAL_TYPES.CONFIRM,
    onConfirm,
    onCancel
  });
  
  modal.show();
  return modal;
}
