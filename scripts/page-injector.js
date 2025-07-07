(function () {
  if (!window.__MP_Editor_JSAPI__) {
    console.warn("[editor-bridge] __MP_Editor_JSAPI__ 不存在");
    return;
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const { source, type, apiName, apiParam, eventName } = event.data || {};
    if (source !== "editor-bridge") return;

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
