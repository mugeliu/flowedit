// 通知组件
// 用于显示临时的消息通知

import { generateUniqueId } from '../../utils/helpers.js';
import { createIcon } from './Icon.js';

/**
 * 通知类型
 * @enum {string}
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

/**
 * 通知位置
 * @enum {string}
 */
export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  TOP_CENTER: 'top-center',
  BOTTOM_CENTER: 'bottom-center'
};

// 存储所有通知的容器
const containers = {};

/**
 * 获取或创建通知容器
 * @param {string} position - 通知位置
 * @returns {HTMLElement} 通知容器
 */
function getContainer(position) {
  if (containers[position]) {
    return containers[position];
  }
  
  const container = document.createElement('div');
  container.className = `wx-notification-container wx-notification-container-${position}`;
  document.body.appendChild(container);
  
  containers[position] = container;
  return container;
}

/**
 * 通知类
 * 用于创建和管理通知
 */
export class Notification {
  /**
   * 创建通知
   * @param {Object} options - 通知选项
   * @param {string} options.title - 标题
   * @param {string} options.message - 消息内容
   * @param {string} options.type - 类型（info, success, warning, error）
   * @param {string} options.position - 位置
   * @param {number} options.duration - 持续时间（毫秒），0 表示不自动关闭
   * @param {boolean} options.closable - 是否可关闭
   * @param {Function} options.onClose - 关闭回调
   */
  constructor(options = {}) {
    this.id = generateUniqueId('notification');
    this.title = options.title || '';
    this.message = options.message || '';
    this.type = options.type || NOTIFICATION_TYPES.INFO;
    this.position = options.position || NOTIFICATION_POSITIONS.TOP_RIGHT;
    this.duration = options.duration !== undefined ? options.duration : 3000;
    this.closable = options.closable !== false;
    this.onClose = options.onClose || (() => {});
    
    this.element = null;
    this.closeTimeout = null;
    this.isVisible = false;
    
    // 绑定方法
    this.show = this.show.bind(this);
    this.close = this.close.bind(this);
    this.create = this.create.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }
  
  /**
   * 创建通知元素
   * @returns {HTMLElement} 通知元素
   */
  create() {
    // 如果通知已存在，则返回
    if (this.element) {
      return this.element;
    }
    
    // 创建通知元素
    this.element = document.createElement('div');
    this.element.id = this.id;
    this.element.className = `wx-notification wx-notification-${this.type}`;
    
    // 创建图标
    const iconContainer = document.createElement('div');
    iconContainer.className = 'wx-notification-icon';
    
    let iconName;
    switch (this.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        iconName = 'check-circle';
        break;
      case NOTIFICATION_TYPES.WARNING:
        iconName = 'warning';
        break;
      case NOTIFICATION_TYPES.ERROR:
        iconName = 'error';
        break;
      default:
        iconName = 'info';
    }
    
    iconContainer.innerHTML = createIcon(iconName);
    
    // 创建内容
    const content = document.createElement('div');
    content.className = 'wx-notification-content';
    
    if (this.title) {
      const title = document.createElement('div');
      title.className = 'wx-notification-title';
      title.textContent = this.title;
      content.appendChild(title);
    }
    
    if (this.message) {
      const message = document.createElement('div');
      message.className = 'wx-notification-message';
      
      if (typeof this.message === 'string') {
        message.innerHTML = this.message;
      } else if (this.message instanceof HTMLElement) {
        message.appendChild(this.message);
      }
      
      content.appendChild(message);
    }
    
    // 创建关闭按钮
    let closeButton;
    if (this.closable) {
      closeButton = document.createElement('button');
      closeButton.className = 'wx-notification-close';
      closeButton.innerHTML = createIcon('close');
      closeButton.setAttribute('aria-label', '关闭');
      closeButton.addEventListener('click', this.handleClose);
    }
    
    // 组装通知
    this.element.appendChild(iconContainer);
    this.element.appendChild(content);
    if (closeButton) {
      this.element.appendChild(closeButton);
    }
    
    return this.element;
  }
  
  /**
   * 显示通知
   */
  show() {
    if (!this.element) {
      this.create();
    }
    
    // 获取容器
    const container = getContainer(this.position);
    
    // 添加到容器
    container.appendChild(this.element);
    
    // 触发重绘以启动动画
    void this.element.offsetWidth;
    
    // 添加显示类
    this.element.classList.add('wx-notification-show');
    this.isVisible = true;
    
    // 设置自动关闭
    if (this.duration > 0) {
      this.closeTimeout = setTimeout(() => {
        this.close();
      }, this.duration);
    }
    
    return this;
  }
  
  /**
   * 关闭通知
   */
  close() {
    if (!this.element || !this.isVisible) {
      return;
    }
    
    // 清除自动关闭定时器
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
    
    // 添加关闭类
    this.element.classList.add('wx-notification-close');
    
    // 动画结束后移除元素
    const handleAnimationEnd = () => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      
      this.element.removeEventListener('animationend', handleAnimationEnd);
      this.isVisible = false;
      
      // 调用关闭回调
      if (typeof this.onClose === 'function') {
        this.onClose();
      }
    };
    
    this.element.addEventListener('animationend', handleAnimationEnd);
    
    return this;
  }
  
  /**
   * 处理关闭按钮点击
   */
  handleClose() {
    this.close();
  }
  
  /**
   * 更新通知内容
   * @param {Object} options - 更新选项
   */
  update(options = {}) {
    // 更新属性
    if (options.title !== undefined) {
      this.title = options.title;
      if (this.element) {
        const titleElement = this.element.querySelector('.wx-notification-title');
        if (titleElement) {
          titleElement.textContent = this.title;
        } else if (this.title) {
          const content = this.element.querySelector('.wx-notification-content');
          const title = document.createElement('div');
          title.className = 'wx-notification-title';
          title.textContent = this.title;
          content.insertBefore(title, content.firstChild);
        }
      }
    }
    
    if (options.message !== undefined) {
      this.message = options.message;
      if (this.element) {
        const messageElement = this.element.querySelector('.wx-notification-message');
        if (messageElement) {
          messageElement.innerHTML = '';
          
          if (typeof this.message === 'string') {
            messageElement.innerHTML = this.message;
          } else if (this.message instanceof HTMLElement) {
            messageElement.appendChild(this.message);
          }
        }
      }
    }
    
    if (options.duration !== undefined) {
      this.duration = options.duration;
      
      // 重置自动关闭定时器
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = null;
      }
      
      if (this.duration > 0 && this.isVisible) {
        this.closeTimeout = setTimeout(() => {
          this.close();
        }, this.duration);
      }
    }
    
    return this;
  }
}

/**
 * 创建并显示一个信息通知
 * @param {string} message - 消息内容
 * @param {string} title - 标题
 * @param {Object} options - 其他选项
 * @returns {Notification} 通知实例
 */
export function showInfo(message, title = '', options = {}) {
  const notification = new Notification({
    title,
    message,
    type: NOTIFICATION_TYPES.INFO,
    ...options
  });
  
  return notification.show();
}

/**
 * 创建并显示一个成功通知
 * @param {string} message - 消息内容
 * @param {string} title - 标题
 * @param {Object} options - 其他选项
 * @returns {Notification} 通知实例
 */
export function showSuccess(message, title = '', options = {}) {
  const notification = new Notification({
    title,
    message,
    type: NOTIFICATION_TYPES.SUCCESS,
    ...options
  });
  
  return notification.show();
}

/**
 * 创建并显示一个警告通知
 * @param {string} message - 消息内容
 * @param {string} title - 标题
 * @param {Object} options - 其他选项
 * @returns {Notification} 通知实例
 */
export function showWarning(message, title = '', options = {}) {
  const notification = new Notification({
    title,
    message,
    type: NOTIFICATION_TYPES.WARNING,
    ...options
  });
  
  return notification.show();
}

/**
 * 创建并显示一个错误通知
 * @param {string} message - 消息内容
 * @param {string} title - 标题
 * @param {Object} options - 其他选项
 * @returns {Notification} 通知实例
 */
export function showError(message, title = '', options = {}) {
  const notification = new Notification({
    title,
    message,
    type: NOTIFICATION_TYPES.ERROR,
    ...options
  });
  
  return notification.show();
}

/**
 * 关闭所有通知
 */
export function closeAllNotifications() {
  Object.values(containers).forEach(container => {
    const notifications = container.querySelectorAll('.wx-notification');
    notifications.forEach(notification => {
      const closeButton = notification.querySelector('.wx-notification-close');
      if (closeButton) {
        closeButton.click();
      }
    });
  });
}
