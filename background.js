/**
 * 注入EditorJS Bundle脚本到页面
 * @param {number} tabId - 标签页ID
 * @param {string} variableName - 全局变量名，默认为'EditorJS'
 */
function injectEditorJSBundle(tabId, variableName = 'EditorJS') {
  return new Promise((resolve) => {
    chrome.scripting.executeScript({
      target: { tabId },
      world: "ISOLATED",
      func: (bundleUrl, varName) => {
        // 检查是否已经加载
        if (window[varName]) {
          console.log(`[FlowEdit] ${varName} 已存在，跳过加载`);
          return { success: true, status: 'already_loaded' };
        }

        // 加载打包后的EditorJS Bundle
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = bundleUrl;
          script.onload = () => {
            script.remove();
            
            // 验证是否成功加载
            if (window[varName]) {
              console.log(`[FlowEdit] EditorJS已加载并赋值给 window.${varName}`);
              resolve({ success: true, status: 'loaded', variableName: varName });
            } else {
              console.error('[FlowEdit] EditorJS Bundle加载失败');
              resolve({ success: false, error: 'EditorJS Bundle未能正确加载' });
            }
          };
          
          script.onerror = () => {
            script.remove();
            console.error('[FlowEdit] EditorJS Bundle脚本加载失败');
            resolve({ success: false, error: 'EditorJS Bundle脚本加载失败' });
          };
          
          document.documentElement.appendChild(script);
        });
      },
      args: [chrome.runtime.getURL('assets/editorjs-bundle.js'), variableName]
    }, (results) => {
      if (results && results[0] && results[0].result) {
        resolve(results[0].result);
      } else {
        console.error('[FlowEdit] 执行脚本失败');
        resolve({ success: false, error: '执行脚本失败' });
      }
    });
  });
}

/**
 * 处理消息
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "inject_editorjs_bundle" || (msg.action && msg.action === "inject_editorjs_bundle")) {
    if (sender.tab && sender.tab.id) {
      injectEditorJSBundle(sender.tab.id)
        .then(result => {
          sendResponse(result);
        })
        .catch(error => {
          sendResponse({ success: false, error: error.message });
        });
      return true; // 保持消息通道开放以支持异步响应
    } else {
      sendResponse({ success: false, error: "无效的标签页" });
    }
  }
});

/**
 * 处理获取微信数据的消息监听器
 */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // 处理获取微信数据的请求
  if (msg.type === "get_wechat_data" || (msg.action && msg.action === "get_wechat_data")) {
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
