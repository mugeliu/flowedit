// DOM变化监听与动态元素等待

/**
 * 监听目标元素的DOM变化
 * @param {Element|Document} target 监听目标
 * @param {Function} callback 回调函数
 * @param {Object} [options] MutationObserver配置
 * @returns {MutationObserver}
 */
export function observeDOM(
  target,
  callback,
  options = { childList: true, subtree: true }
) {
  const observer = new MutationObserver(callback);
  observer.observe(target, options);
  return observer;
}

/**
 * 等待某个元素出现
 * @param {string} selector
 * @param {number} [timeout=10000] 超时时间ms
 * @returns {Promise<Element>}
 */
export function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    if (timeout) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error("Timeout waiting for element: " + selector));
      }, timeout);
    }
  });
}
