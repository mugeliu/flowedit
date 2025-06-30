// page-script.js - 运行在页面环境中，可以访问页面的window对象

(function() {
  try {
    // 获取页面的window对象数据
    const pageData = {
      title: document.title,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      domain: window.location.hostname,
      protocol: window.location.protocol,
      wxdata: window.wx.data,
      
      // 如果页面有特定的全局对象，可以这样获取：
      // jquery: typeof $ !== 'undefined' ? true : false,
      // react: typeof React !== 'undefined' ? true : false,
      // vue: typeof Vue !== 'undefined' ? true : false,
      
      // 示例：获取页面中的一些常见对象
      hasJQuery: typeof window.$ !== 'undefined',
      hasReact: typeof window.React !== 'undefined',
      hasVue: typeof window.Vue !== 'undefined',
      
      // 获取页面中的一些元数据
      metaDescription: document.querySelector('meta[name="description"]')?.content || '',
      metaKeywords: document.querySelector('meta[name="keywords"]')?.content || '',
      
      // 页面加载信息
      readyState: document.readyState,
      referrer: document.referrer,
      
      // 如果需要获取特定的window对象，在这里添加：
      // customObject: window.yourCustomObject,
    };
    
    // 通过自定义事件将数据传递给Content Script
    window.dispatchEvent(new CustomEvent('pageDataReady', {
      detail: pageData
    }));
    
  } catch (error) {
    console.error('页面脚本执行错误:', error);
    // 即使出错也要发送事件，避免Content Script无限等待
    window.dispatchEvent(new CustomEvent('pageDataReady', {
      detail: {
        error: error.message,
        title: document.title,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    }));
  }
})();