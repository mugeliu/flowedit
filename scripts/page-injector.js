(function () {
  // 检查登录状态
  const uin = window.wx?.uin;
  if (!uin || uin === "0") {
    console.warn("[editor-bridge] 用户未登录，无法使用编辑器 API");
    return;
  }
  
  // 检查 API 是否存在
  if (!window.__MP_Editor_JSAPI__) {
    if (uin && uin !== "0") {
      console.error("[editor-bridge] 用户已登录但 __MP_Editor_JSAPI__ 不存在，可能存在错误");
    } else {
      console.warn("[editor-bridge] __MP_Editor_JSAPI__ 不存在");
    }
    return;
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const { source, type, apiName, apiParam, eventName } = event.data || {};
    if (source !== "editor-bridge") return;

    // === 获取微信数据 ===
    if (type === "get-wxdata") {
      try {
        const wxData = window.wx?.data || null;
        window.postMessage(
          {
            source: "editor-bridge",
            type: "wxdata-result",
            status: "success",
            payload: {
              success: true,
              data: wxData,
              timestamp: new Date().toISOString()
            }
          },
          "*"
        );
      } catch (error) {
        window.postMessage(
          {
            source: "editor-bridge",
            type: "wxdata-result",
            status: "error",
            payload: {
              success: false,
              error: error.message,
              data: null,
              timestamp: new Date().toISOString()
            }
          },
          "*"
        );
      }
      return;
    }

    // === 调用 API ===
    if (type === "invoke" && apiName) {
      window.__MP_Editor_JSAPI__.invoke({
        apiName,
        apiParam,
        sucCb: (res) => {
          window.postMessage(
            {
              source: "editor-bridge",
              type: "invoke-result",
              apiName,
              status: "success",
              payload: res,
            },
            "*"
          );
        },
        errCb: (err) => {
          window.postMessage(
            {
              source: "editor-bridge",
              type: "invoke-result",
              apiName,
              status: "error",
              payload: err,
            },
            "*"
          );
        },
      });
    }

    // === 注册事件监听 ===
    if (type === "listen" && eventName) {
      window.__MP_Editor_JSAPI__.on({
        eventName,
        callBack: (param) => {
          window.postMessage(
            {
              source: "editor-bridge",
              type: "event",
              eventName,
              payload: param,
            },
            "*"
          );
        },
      });
    }
  });
})();
