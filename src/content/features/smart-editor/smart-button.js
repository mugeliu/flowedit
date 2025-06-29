import { createElement, safeQuerySelector } from "../../utils/dom.js";
import { selectorConfig } from "../../config/index.js";
// import { activateSmartEditor } from "./manager.js"; // 注释掉原函数

/**
 * 创建智能插入按钮并定位到目标元素
 * @returns {Object} 包含按钮元素和清理函数
 */
export function createSmartButton() {
  const btn = createElement("button", {
    className: "flowedit-smart-btn",
    textContent: "智能插入",
  });

  // 添加数据属性用于DOM监听器识别
  btn.setAttribute('data-flowedit-plugin', 'smart-button');
  btn.setAttribute('data-flowedit', 'true');

  btn.addEventListener("click", handleSmartButtonClick);

  // 查找工具栏容器作为插入目标
  const toolbarContainer = document.getElementById(selectorConfig.toolbar);
  
  if (!toolbarContainer) {
    const error = `工具栏容器未找到: ${selectorConfig.toolbar}`;
    console.error('[SmartButton]', error);
    throw new Error(error);
  }

  // 直接插入到工具栏容器的末尾
  toolbarContainer.appendChild(btn);

  // 返回清理函数
  const cleanup = () => {
    if (btn.parentNode) {
      btn.parentNode.removeChild(btn);
    }
  };

  return {
    element: btn,
    cleanup,
  };
}

/**
 * 测试函数：检查EditorJS模块和微信数据是否加载
 */
async function testEditorJSAndWxData() {
  console.log('[FlowEdit Test] 开始测试EditorJS和微信数据加载状态...');
  
  try {
    // 1. 发送消息给background脚本加载EditorJS Bundle
    console.log('[FlowEdit Test] 正在加载EditorJS Bundle...');
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'inject_editorjs_bundle' }, resolve);
    });
    console.log('[FlowEdit Test] EditorJS Bundle加载响应:', response);
    
    // 2. 检查background响应是否成功
    if (!response || !response.success) {
      throw new Error(`EditorJS Bundle加载失败: ${response?.error || '未知错误'}`);
    }
    
    // 3. 等待EditorJS加载到window对象
    console.log('[FlowEdit Test] 等待EditorJS变量加载...');
    await waitForVariable('EditorJS', 10000); // 增加超时时间到10秒
    
    // 4. 检查window.EditorJS是否存在
    if (window.EditorJS) {
      console.log('[FlowEdit Test] ✅ window.EditorJS 已成功加载');
      console.log('[FlowEdit Test] EditorJS版本:', window.EditorJS.version || '未知');
      
      // 检查可用的插件
      const availableTools = [];
      if (window.EditorJS.Header) availableTools.push('Header');
      if (window.EditorJS.Paragraph) availableTools.push('Paragraph');
      if (window.EditorJS.List) availableTools.push('List');
      if (window.EditorJS.Code) availableTools.push('Code');
      if (window.EditorJS.Image) availableTools.push('Image');
      
      console.log('[FlowEdit Test] 可用插件:', availableTools.join(', '));
    } else {
      console.log('[FlowEdit Test] ❌ window.EditorJS 未加载');
    }
    
    // 5. 检查window.wx.data是否存在
    if (window.wx && window.wx.data) {
      console.log('[FlowEdit Test] ✅ window.wx.data 已存在');
      console.log('[FlowEdit Test] 微信数据类型:', typeof window.wx.data);
      console.log('[FlowEdit Test] 微信数据内容预览:', JSON.stringify(window.wx.data).substring(0, 200) + '...');
    } else {
      console.log('[FlowEdit Test] ❌ window.wx.data 不存在');
      
      // 尝试获取微信数据
      console.log('[FlowEdit Test] 尝试获取微信数据...');
      chrome.runtime.sendMessage({ action: 'get_wechat_data' }, (response) => {
        if (response && response.success) {
          console.log('[FlowEdit Test] ✅ 微信数据获取成功');
          console.log('[FlowEdit Test] 微信数据:', response.data);
        } else {
          console.log('[FlowEdit Test] ❌ 微信数据获取失败:', response?.error || '未知错误');
        }
      });
    }
    
    // 6. 输出测试总结
    console.log('[FlowEdit Test] 测试完成！');
    console.log('[FlowEdit Test] EditorJS状态:', window.EditorJS ? '✅ 已加载' : '❌ 未加载');
    console.log('[FlowEdit Test] 微信数据状态:', (window.wx && window.wx.data) ? '✅ 已存在' : '❌ 不存在');
    
  } catch (error) {
    console.error('[FlowEdit Test] 测试过程中发生错误:', error);
  }
}

/**
 * 等待指定变量在window对象上可用
 * @param {string} variableName - 变量名
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise} 
 */
function waitForVariable(variableName, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    let checkCount = 0;
    
    const checkVariable = () => {
      checkCount++;
      const elapsed = Date.now() - startTime;
      
      console.log(`[FlowEdit Test] 检查 ${variableName} (第${checkCount}次, 已等待${elapsed}ms)`);
      
      if (window[variableName]) {
        console.log(`[FlowEdit Test] ✅ ${variableName} 已加载，耗时: ${elapsed}ms`);
        resolve(window[variableName]);
        return;
      }
      
      // 输出当前window对象上的相关属性用于调试
      if (checkCount % 10 === 0) { // 每10次检查输出一次调试信息
        const windowKeys = Object.keys(window).filter(key => key.toLowerCase().includes('editor'));
        console.log(`[FlowEdit Test] 当前window上包含'editor'的属性:`, windowKeys);
      }
      
      if (elapsed > timeout) {
        console.error(`[FlowEdit Test] ❌ 等待 ${variableName} 超时 (${timeout}ms)，共检查${checkCount}次`);
        reject(new Error(`等待 ${variableName} 超时 (${timeout}ms)`));
        return;
      }
      
      setTimeout(checkVariable, 100);
    };
    
    checkVariable();
  });
}

/**
 * 处理智能插入按钮点击事件
 */
async function handleSmartButtonClick() {
  try {
    // await activateSmartEditor(); // 注释掉原函数调用
    await testEditorJSAndWxData(); // 使用新的测试函数
  } catch (error) {
    console.error("智能插入按钮点击处理失败:", error);
  }
}
