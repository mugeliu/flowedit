chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "inject_editorjs_bundle") {
    if (sender.tab && sender.tab.id) {
      chrome.scripting.executeScript(
        {
          target: { tabId: sender.tab.id },
          files: ["assets/editorjs/editorjs-bundle.js"],
        },
        () => {
          sendResponse({ status: "injected" });
        }
      );
      // 必须返回 true 以支持异步 sendResponse
      return true;
    }
  }

  // 处理获取微信数据的请求
  if (msg.type === "get_wechat_data") {
    if (sender.tab && sender.tab.id) {
      chrome.scripting.executeScript(
        {
          target: { tabId: sender.tab.id },
          world: "MAIN",
          func: () => {
            if (window.wx && window.wx.data) {
              return {
                token: window.wx.data.t || "",
                ticket: window.wx.data.ticket || "",
                userName: window.wx.data.user_name || "",
                time: window.wx.data.time || "",
              };
            } else {
              return null;
            }
          },
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            sendResponse({ success: true, data: results[0].result });
          } else {
            console.log("Background: 无法获取微信数据");
            sendResponse({
              success: false,
              error: "无法获取微信数据或window.wx未初始化",
            });
          }
        }
      );
      return true;
    } else {
      sendResponse({ success: false, error: "没有有效的标签页" });
    }
  }
});
