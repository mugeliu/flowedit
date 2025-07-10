/**
 * WeUI Toast 组件工具
 * 提供统一的消息提示功能
 */

/**
 * Toast 类型枚举
 */
export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error', 
  WARNING: 'warning',
  LOADING: 'loading',
  INFO: 'info'
};

/**
 * 当前活动的Toast实例
 */
let currentToast = null;

/**
 * 显示Toast消息
 * @param {string} message - 消息内容
 * @param {string} type - Toast类型
 * @param {number} duration - 显示时长(毫秒)，loading类型默认不自动关闭
 * @param {Object} options - 额外选项
 */
export function showToast(message, type = ToastType.INFO, duration = 3000, options = {}) {
  // 如果有正在显示的Toast，先移除
  if (currentToast) {
    hideToast();
  }

  // 创建Toast容器
  const toastContainer = document.createElement('div');
  toastContainer.className = 'weui-toast';
  toastContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10001;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 8px;
    padding: 24px 20px;
    min-width: 120px;
    max-width: 280px;
    text-align: center;
    color: #ffffff;
    font-size: 14px;
    line-height: 1.4;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  // 创建图标元素
  const iconElement = document.createElement('div');
  iconElement.className = 'weui-toast__icon';
  iconElement.style.cssText = `
    margin-bottom: 8px;
    font-size: 24px;
    line-height: 1;
  `;

  // 根据类型设置图标
  switch (type) {
    case ToastType.SUCCESS:
      iconElement.innerHTML = '✓';
      iconElement.style.color = '#52c41a';
      break;
    case ToastType.ERROR:
      iconElement.innerHTML = '✗';
      iconElement.style.color = '#ff4d4f';
      break;
    case ToastType.WARNING:
      iconElement.innerHTML = '⚠';
      iconElement.style.color = '#faad14';
      break;
    case ToastType.LOADING:
      iconElement.innerHTML = '⏳';
      iconElement.style.color = '#1677ff';
      // 添加旋转动画
      iconElement.style.animation = 'spin 1s linear infinite';
      // 创建旋转动画
      if (!document.getElementById('toast-spin-animation')) {
        const style = document.createElement('style');
        style.id = 'toast-spin-animation';
        style.textContent = `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
      break;
    case ToastType.INFO:
    default:
      iconElement.innerHTML = 'ℹ';
      iconElement.style.color = '#1677ff';
      break;
  }

  // 创建文字元素
  const textElement = document.createElement('div');
  textElement.className = 'weui-toast__text';
  textElement.textContent = message;
  textElement.style.cssText = `
    word-wrap: break-word;
    word-break: break-all;
  `;

  // 组装Toast
  toastContainer.appendChild(iconElement);
  toastContainer.appendChild(textElement);

  // 创建遮罩层（可选）
  if (options.mask) {
    const maskElement = document.createElement('div');
    maskElement.className = 'weui-mask_transparent';
    maskElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10000;
    `;
    document.body.appendChild(maskElement);
    currentToast = { container: toastContainer, mask: maskElement };
  } else {
    currentToast = { container: toastContainer, mask: null };
  }

  // 添加到页面
  document.body.appendChild(toastContainer);

  // 显示动画
  setTimeout(() => {
    toastContainer.style.opacity = '1';
  }, 10);

  // 自动隐藏（loading类型除外）
  if (type !== ToastType.LOADING && duration > 0) {
    setTimeout(() => {
      hideToast();
    }, duration);
  }

  return currentToast;
}

/**
 * 隐藏当前Toast
 */
export function hideToast() {
  if (!currentToast) return;

  const { container, mask } = currentToast;

  // 隐藏动画
  container.style.opacity = '0';
  
  setTimeout(() => {
    // 移除元素
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    if (mask && mask.parentNode) {
      mask.parentNode.removeChild(mask);
    }
    currentToast = null;
  }, 300);
}

/**
 * 显示成功Toast
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 */
export function showSuccessToast(message, duration = 2000) {
  return showToast(message, ToastType.SUCCESS, duration);
}

/**
 * 显示错误Toast
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 */
export function showErrorToast(message, duration = 3000) {
  return showToast(message, ToastType.ERROR, duration);
}

/**
 * 显示警告Toast
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 */
export function showWarningToast(message, duration = 3000) {
  return showToast(message, ToastType.WARNING, duration);
}

/**
 * 显示加载Toast
 * @param {string} message - 消息内容
 * @param {Object} options - 选项
 */
export function showLoadingToast(message = '加载中...', options = {}) {
  return showToast(message, ToastType.LOADING, 0, { mask: true, ...options });
}

/**
 * 显示信息Toast
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长
 */
export function showInfoToast(message, duration = 3000) {
  return showToast(message, ToastType.INFO, duration);
}