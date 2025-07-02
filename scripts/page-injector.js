// page-injector.js - 注入到页面环境中的脚本，用于获取window.wx.data

(function () {
  "use strict";

  // 标识符，防止重复注入
  if (window.flowEditPageInjector) {
    return;
  }
  window.flowEditPageInjector = true;

  try {
    // 获取微信数据
    const wxData = window.wx?.data || null;

    // 发送微信数据
    window.dispatchEvent(
      new CustomEvent("pageDataReady", {
        detail: {
          wxData: wxData,
          timestamp: new Date().toISOString(),
        },
      })
    );

    console.log("FlowEdit: 页面注入器已加载，微信数据已发送", wxData);
  } catch (error) {
    console.error("FlowEdit: 页面脚本执行错误:", error);
    // 即使出错也要发送事件，避免Content Script无限等待
    window.dispatchEvent(
      new CustomEvent("pageDataReady", {
        detail: {
          error: error.message,
          wxData: null,
          timestamp: new Date().toISOString(),
        },
      })
    );
  }
})();
