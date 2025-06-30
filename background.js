/**
 * MP Editor JSAPI 封装 - Background Script
 * 提供对微信公众号编辑器 JSAPI 的调用封装
 */

/**
 * 调用 MP Editor JSAPI 的 invoke 方法
 * @param {number} tabId - 标签页ID
 * @param {string} apiName - 接口名称
 * @param {Object} apiParam - 接口参数
 * @returns {Promise} 返回调用结果
 */
function invokeMPEditorAPI(tabId, apiName, apiParam = {}) {
  return new Promise((resolve) => {
    chrome.scripting.executeScript(
      {
        target: { tabId },
        world: "MAIN",
        func: (apiName, apiParam) => {
          return new Promise((resolve) => {
            // 检查 MP Editor JSAPI 是否存在
            if (
              !window.__MP_Editor_JSAPI__ ||
              typeof window.__MP_Editor_JSAPI__.invoke !== "function"
            ) {
              resolve({
                success: false,
                error: "MP Editor JSAPI 不存在或 invoke 方法不可用",
              });
              return;
            }

            try {
              // 调用 MP Editor JSAPI 的 invoke 方法
              window.__MP_Editor_JSAPI__.invoke({
                apiName: apiName,
                apiParam: apiParam,
                sucCb: (res) => {
                  resolve({
                    success: true,
                    data: res,
                  });
                },
                errCb: (err) => {
                  resolve({
                    success: false,
                    error: err,
                  });
                },
              });
            } catch (error) {
              resolve({
                success: false,
                error: error.message || "调用 invoke 方法时发生错误",
              });
            }
          });
        },
        args: [apiName, apiParam],
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          resolve(results[0].result);
        } else {
          resolve({
            success: false,
            error: "执行脚本失败",
          });
        }
      }
    );
  });
}

// 监听来自Content Script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "invokeMPEditorAPI") {
    invokeMPEditorAPI(sender.tab.id, request.apiName, request.apiParam || {})
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // 保持消息通道开放
  }
});
