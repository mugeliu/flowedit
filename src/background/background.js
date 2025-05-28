// 微信公众号浮动工具栏插件 - 背景脚本

// 监听插件安装事件
chrome.runtime.onInstalled.addListener(function() {
  console.log('微信公众号浮动工具栏插件已安装');
});

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'log') {
    console.log('内容脚本日志:', message.data);
  }
  
  // 保持消息通道开放，等待异步响应
  return true;
});
