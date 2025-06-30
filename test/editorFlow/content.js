// 启动插件
init();// content.js - Chrome插件主要功能

let editorInstance = null;

// 1. 插入测试按钮
function insertTestButton() {
  // 避免重复插入
  if (document.getElementById('test-editor-btn')) return;
  
  const button = document.createElement('button');
  button.id = 'test-editor-btn';
  button.textContent = '打开EditorJS测试';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    padding: 10px 15px;
    background: #007cba;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  button.onclick = handleButtonClick;
  document.body.appendChild(button);
  console.log('测试按钮已插入');
}

// 2. 获取页面window对象数据 (修复CSP问题)
function getPageWindowData() {
  return new Promise((resolve) => {
    // 方法1: 直接从Content Script环境获取基本数据
    const basicData = {
      title: document.title,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      domain: window.location.hostname,
      protocol: window.location.protocol
    };
    
    // 方法2: 如果需要页面特定的window对象，使用外部脚本文件
    // 这里先返回基本数据作为演示
    resolve(basicData);
  });
}

// 如果需要获取页面特定的window对象，使用这个函数
function getPageSpecificData() {
  return new Promise((resolve) => {
    // 创建外部脚本文件来避免CSP限制
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('page-script.js');
    
    const listener = (event) => {
      if (event.type === 'pageDataReady') {
        window.removeEventListener('pageDataReady', listener);
        document.head.removeChild(script);
        resolve(event.detail);
      }
    };
    
    window.addEventListener('pageDataReady', listener);
    document.head.appendChild(script);
  });
}

// 3. 检查EditorJS是否已加载
function checkEditorJS() {
  return typeof EditorJS !== 'undefined';
}

// 4. 如果需要额外的EditorJS工具，可以动态加载
function loadAdditionalTools() {
  return new Promise((resolve) => {
    // 如果有其他EditorJS工具需要加载，在这里添加
    // 例如：Header, List, Code 等工具
    // 现在先直接resolve，使用基本功能
    resolve();
  });
}



// 5. 初始化编辑器
async function initEditor(pageData) {
  const container = createEditorContainer();
  
  try {
    // 检查EditorJS是否已加载
    if (!checkEditorJS()) {
      throw new  ('EditorJS未正确加载，请检查libs/editor.min.js文件');
    }
    
    // 加载额外工具（如果需要）
    await loadAdditionalTools();
    
    editorInstance = new EditorJS({
      holder: container.id,
      placeholder: '开始编写内容...',
      data: {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: `🎉 EditorJS 测试成功！`
            }
          },
          {
            type: 'paragraph',
            data: {
              text: `📄 页面标题: ${pageData.title}`
            }
          },
          {
            type: 'paragraph', 
            data: {
              text: `🌐 页面URL: ${pageData.url}`
            }
          },
          {
            type: 'paragraph',
            data: {
              text: `🕒 获取时间: ${pageData.timestamp}`
            }
          },
          {
            type: 'paragraph',
            data: {
              text: `💻 用户代理: ${pageData.userAgent.substring(0, 50)}...`
            }
          }
        ]
      },
      tools: {
        // 这里可以添加EditorJS工具
        // 例如：header: Header, list: List 等
        // 目前使用基础功能，只支持段落编辑
      },
      onChange: (api, event) => {
        console.log('编辑器内容已更改', event);
      }
    });
    
    console.log('EditorJS初始化成功');
    
    // 添加保存按钮
    addSaveButton(container.parentElement);
    
  } catch (error) {
    console.error('EditorJS初始化失败:', error);
    container.innerHTML = `
      <div style="padding: 20px; color: red; background: #ffeaea; border: 1px solid #ffcccc; border-radius: 4px;">
        <h3>编辑器加载失败</h3>
        <p><strong>错误信息:</strong> ${error.message}</p>
        <p><strong>解决方案:</strong></p>
        <ul>
          <li>确保 <code>libs/editor.min.js</code> 文件存在</li>
          <li>检查文件路径是否正确</li>
          <li>查看浏览器控制台的详细错误信息</li>
        </ul>
      </div>
    `;
  }
}

// 6. 创建编辑器容器
function createEditorContainer() {
  // 移除已存在的编辑器
  const existing = document.getElementById('editor-popup');
  if (existing) {
    existing.remove();
  }
  
  const popup = document.createElement('div');
  popup.id = 'editor-popup';
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 900px;
    height: 700px;
    background: white;
    border: 2px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10001;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 6px 6px 0 0;
  `;
  
  const title = document.createElement('h3');
  title.textContent = '📝 EditorJS 测试编辑器';
  title.style.cssText = 'margin: 0; font-size: 18px; font-weight: 600;';
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    background: rgba(255,255,255,0.2);
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  `;
  closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,255,255,0.3)';
  closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
  closeBtn.onclick = () => popup.remove();
  
  const editorContainer = document.createElement('div');
  editorContainer.id = 'editor-container';
  editorContainer.style.cssText = `
    flex: 1;
    padding: 20px;
    overflow: auto;
    background: #fafafa;
  `;
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  popup.appendChild(header);
  popup.appendChild(editorContainer);
  document.body.appendChild(popup);
  
  return editorContainer;
}

// 7. 添加保存按钮
function addSaveButton(popup) {
  const saveBtn = document.createElement('button');
  saveBtn.textContent = '💾 保存内容';
  saveBtn.style.cssText = `
    position: absolute;
    bottom: 20px;
    right: 20px;
    padding: 10px 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: background 0.2s;
  `;
  
  saveBtn.onmouseover = () => saveBtn.style.background = '#45a049';
  saveBtn.onmouseout = () => saveBtn.style.background = '#4CAF50';
  
  saveBtn.onclick = async () => {
    if (editorInstance) {
      try {
        const outputData = await editorInstance.save();
        console.log('编辑器内容:', outputData);
        alert('内容已保存到控制台，请按F12查看Console');
      } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败: ' + error.message);
      }
    }
  };
  
  popup.appendChild(saveBtn);
}

// 8. 按钮点击处理
async function handleButtonClick() {
  try {
    console.log('🚀 开始获取页面数据...');
    
    // 现在有两种方式获取数据：
    // 方式1: 获取基本数据（不需要页面window对象）
    // const pageData = await getPageWindowData();
    // console.log('📊 基本页面数据:', pageData);
    
    // 方式2: 如果需要获取页面特定的window对象，使用这个
    const pageData = await getPageSpecificData();
    console.log('📊 详细页面数据:', pageData);
    
    console.log('⚙️ 初始化编辑器...');
    await initEditor(pageData);
  } catch (error) {
    console.error('❌ 操作失败:', error);
    alert('操作失败: ' + error.message);
  }
}


// 创建WeUI按钮
function createWeUIButton(text, onClick) {
  const button = document.createElement('button');
  button.className = 'weui-btn weui-btn_primary';
  button.textContent = text;
  button.onclick = onClick;
  return button;
}

function showWeUIContent(targetId, title, content) {
  // 获取目标元素
  const targetElement = document.getElementById(targetId);
  
  if (!targetElement) {
    console.error(`Element with ID "${targetId}" not found`);
    return;
  }

  // 创建内容容器
  const container = document.createElement('div');
  container.className = 'weui-dialog weui-dialog_inline'; // 添加 inline 类使其不浮动
  container.innerHTML = `
    <div class="weui-dialog__hd">
      <strong class="weui-dialog__title">${title}</strong>
    </div>
    <div class="weui-dialog__bd">${content}</div>
    <div class="weui-dialog__ft">
      <a href="#" class="weui-btn weui-btn_primary">确定</a>
    </div>
  `;

  // 添加到目标元素中
  targetElement.appendChild(container);
}



// 9. 初始化插件
function init() {
  console.log('🔧 Chrome插件初始化开始...');
  
  // 检查EditorJS是否已加载
  if (checkEditorJS()) {
    console.log('✅ EditorJS已成功加载');
  } else {
    console.warn('⚠️ EditorJS未检测到，请确保libs/editor.min.js文件存在');
  }
  
  // 等待页面完全加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertTestButton);
  } else {
    showWeUIContent('js_appmsg_editor', '标题', '这里是内容');
    insertTestButton();
  }
  
  console.log('✅ Chrome插件初始化完成');
}