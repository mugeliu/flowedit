/**
 * Toast 消息提示工具 - 简化版本
 */

export const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error', 
  WARNING: 'warning',
  LOADING: 'loading',
  INFO: 'info'
};

// 图标配置
const TOAST_CONFIG = {
  [ToastType.SUCCESS]: { icon: '✓', color: '#52c41a' },
  [ToastType.ERROR]: { icon: '✗', color: '#ff4d4f' },
  [ToastType.WARNING]: { icon: '⚠', color: '#faad14' },
  [ToastType.LOADING]: { icon: '⏳', color: '#1677ff', spin: true },
  [ToastType.INFO]: { icon: 'ℹ', color: '#1677ff' }
};

// 样式常量
const STYLES = {
  container: `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10001; 
             background: rgba(0, 0, 0, 0.8); border-radius: 8px; padding: 24px 20px; min-width: 120px; 
             max-width: 280px; text-align: center; color: #ffffff; font-size: 14px; line-height: 1.4; 
             box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); opacity: 0; transition: opacity 0.3s ease;`,
  icon: `margin-bottom: 8px; font-size: 24px; line-height: 1;`,
  text: `word-wrap: break-word; word-break: break-all;`,
  mask: `position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 10000;`
};

let currentToast = null;

// 确保旋转动画
function ensureSpinAnimation() {
  if (!document.getElementById('toast-spin-animation')) {
    const style = document.createElement('style');
    style.id = 'toast-spin-animation';
    style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
  }
}

// 创建Toast元素
function createToast(message, type) {
  const config = TOAST_CONFIG[type] || TOAST_CONFIG[ToastType.INFO];
  
  // 容器
  const container = document.createElement('div');
  container.className = 'weui-toast';
  container.style.cssText = STYLES.container;

  // 图标
  const icon = document.createElement('div');
  icon.className = 'weui-toast__icon';
  icon.style.cssText = STYLES.icon + `color: ${config.color};`;
  icon.innerHTML = config.icon;
  
  if (config.spin) {
    ensureSpinAnimation();
    icon.style.animation = 'spin 1s linear infinite';
  }

  // 文本
  const text = document.createElement('div');
  text.className = 'weui-toast__text';
  text.textContent = message;
  text.style.cssText = STYLES.text;

  container.appendChild(icon);
  container.appendChild(text);
  return container;
}

/**
 * 显示Toast
 */
export function showToast(message, type = ToastType.INFO, duration = 3000, options = {}) {
  if (currentToast) hideToast();

  const container = createToast(message, type);
  let mask = null;

  // 遮罩
  if (options.mask) {
    mask = document.createElement('div');
    mask.style.cssText = STYLES.mask;
    document.body.appendChild(mask);
  }

  currentToast = { container, mask };
  document.body.appendChild(container);

  // 显示
  setTimeout(() => container.style.opacity = '1', 10);

  // 自动隐藏
  if (type !== ToastType.LOADING && duration > 0) {
    setTimeout(hideToast, duration);
  }

  return currentToast;
}

/**
 * 隐藏Toast
 */
export function hideToast() {
  if (!currentToast) return;

  const { container, mask } = currentToast;
  container.style.opacity = '0';
  
  setTimeout(() => {
    container.remove();
    mask?.remove();
    currentToast = null;
  }, 300);
}

// 便捷方法
export const showSuccessToast = (message, duration = 2000) => showToast(message, ToastType.SUCCESS, duration);
export const showErrorToast = (message, duration = 3000) => showToast(message, ToastType.ERROR, duration);
export const showWarningToast = (message, duration = 3000) => showToast(message, ToastType.WARNING, duration);
export const showInfoToast = (message, duration = 3000) => showToast(message, ToastType.INFO, duration);
export const showLoadingToast = (message = '加载中...', options = {}) => showToast(message, ToastType.LOADING, 0, { mask: true, ...options });