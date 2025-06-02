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
});
