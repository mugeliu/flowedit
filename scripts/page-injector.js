(function () {
  "use strict";

  const SOURCE = "flowedit-wechat-bridge";

  function respond(requestId, ok, payload, error) {
    window.postMessage(
      {
        source: SOURCE,
        direction: "response",
        requestId,
        ok,
        payload,
        error,
      },
      window.location.origin,
    );
  }

  function errorMessage(error) {
    if (error && typeof error === "object" && "err_msg" in error) {
      return String(error.err_msg);
    }
    return error instanceof Error ? error.message : String(error);
  }

  window.addEventListener("message", function (event) {
    if (
      event.source !== window ||
      event.origin !== window.location.origin ||
      !event.data ||
      event.data.source !== SOURCE ||
      event.data.direction !== "request"
    ) {
      return;
    }

    const requestId = event.data.requestId;
    const action = event.data.action;
    const payload = event.data.payload || {};

    if (!window.wx || !window.wx.uin || window.wx.uin === "0") {
      respond(requestId, false, undefined, "微信公众号登录状态无效。");
      return;
    }

    if (action !== "invoke") {
      respond(requestId, false, undefined, "不支持的微信桥接操作。");
      return;
    }
    if (
      !window.__MP_Editor_JSAPI__ ||
      typeof window.__MP_Editor_JSAPI__.invoke !== "function"
    ) {
      respond(requestId, false, undefined, "微信编辑器 JSAPI 不可用。");
      return;
    }
    if (!payload.apiName || typeof payload.apiName !== "string") {
      respond(requestId, false, undefined, "微信编辑器 API 名称无效。");
      return;
    }

    try {
      window.__MP_Editor_JSAPI__.invoke({
        apiName: payload.apiName,
        apiParam: payload.apiParam || {},
        sucCb: function (result) {
          respond(requestId, true, result);
        },
        errCb: function (error) {
          respond(requestId, false, undefined, errorMessage(error));
        },
      });
    } catch (error) {
      respond(requestId, false, undefined, errorMessage(error));
    }
  });
})();
