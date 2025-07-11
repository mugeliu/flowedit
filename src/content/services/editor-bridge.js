/**
 * 编辑器桥接服务 - 处理与页面编辑器的通信
 */

import { createLogger } from './simple-logger.js';

// 创建模块日志器
const logger = createLogger('EditorBridge');

/**
 * 注入编辑器桥接脚本到页面
 */
function injectBridgeScript() {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/page-injector.js");
  script.onload = () => script.remove();
  document.documentElement.appendChild(script);
}

/**
 * 调用编辑器API（带回调处理）
 * @param {string} apiName - API名称
 * @param {object} apiParam - API参数
 * @param {function} callback - 回调函数
 */
function callEditorAPI(apiName, apiParam = {}, callback) {
  window.postMessage(
    {
      source: "editor-bridge",
      type: "invoke",
      apiName,
      apiParam,
    },
    "*"
  );

  function handler(event) {
    if (
      event.source !== window ||
      event.data?.source !== "editor-bridge" ||
      event.data?.type !== "invoke-result" ||
      event.data?.apiName !== apiName
    )
      return;

    window.removeEventListener("message", handler);
    callback(event.data.status === "success", event.data.payload);
  }

  window.addEventListener("message", handler);
}

/**
 * 注册监听编辑器事件（只注册一次即可）
 * @param {string} eventName - 事件名称
 * @param {function} callback - 回调函数
 */
function listenEditorEvent(eventName, callback) {
  window.postMessage(
    {
      source: "editor-bridge",
      type: "listen",
      eventName,
    },
    "*"
  );

  window.addEventListener("message", (event) => {
    if (
      event.source !== window ||
      event.data?.source !== "editor-bridge" ||
      event.data?.type !== "event" ||
      event.data?.eventName !== eventName
    )
      return;

    callback(event.data.payload);
  });
}

/**
 * 获取微信数据
 * @param {function} callback - 回调函数，参数为 (success, data)
 */
function getWxData(callback) {
  window.postMessage(
    {
      source: "editor-bridge",
      type: "get-wxdata",
    },
    "*"
  );

  function handler(event) {
    if (
      event.source !== window ||
      event.data?.source !== "editor-bridge" ||
      event.data?.type !== "wxdata-result"
    )
      return;

    window.removeEventListener("message", handler);
    callback(event.data.status === "success", event.data.payload);
  }

  window.addEventListener("message", handler);
}

/**
 * 初始化编辑器桥接服务
 * @param {function} callback - 脚本注入完成后的回调函数
 */
function initializeEditorBridge(callback) {
  logger.info("[EditorBridge] 初始化编辑器桥接服务");
  
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("scripts/page-injector.js");
  script.onload = () => {
    logger.info("[EditorBridge] 桥接脚本注入成功");
    script.remove();
    // 脚本注入成功后调用回调
    if (callback && typeof callback === 'function') {
      callback();
    }
  };
  script.onerror = () => {
    logger.error("[EditorBridge] 桥接脚本注入失败");
    // 即使失败也调用回调，让程序继续执行
    if (callback && typeof callback === 'function') {
      callback();
    }
  };
  document.documentElement.appendChild(script);
}

export {
  injectBridgeScript,
  callEditorAPI,
  listenEditorEvent,
  getWxData,
  initializeEditorBridge,
};
