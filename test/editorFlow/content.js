// content.js - Chrome插件主要功能

let editorInstance = null;

// 加载WeUI样式表
function loadWeUIStyles() {
  // 检查是否已经加载过WeUI样式
  if (document.getElementById("weui-styles")) {
    console.log("WeUI样式已存在");
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement("link");
    link.id = "weui-styles";
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href =
      "https://res.wx.qq.com/t/wx_fed/weui-source/res/2.6.22/weui.css";

    link.onload = () => {
      console.log("✅ WeUI样式加载成功");
      resolve();
    };

    link.onerror = () => {
      console.error("❌ WeUI样式加载失败");
      reject(new Error("WeUI样式加载失败"));
    };

    document.head.appendChild(link);
  });
}

// 1. 插入测试按钮和开关（使用WeUI样式）
function insertTestButton() {
  // 避免重复插入
  if (document.getElementById("test-controls-container")) return;

  // 创建控制容器
  const container = document.createElement("div");
  container.id = "test-controls-container";
  container.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: flex-end;
  `;

  // 创建按钮
  const button = document.createElement("button");
  button.id = "test-editor-btn";
  button.className = "weui-btn weui-btn_primary";
  button.textContent = "打开EditorJS测试";
  button.style.cssText = `min-width: 120px;`;
  button.onclick = handleButtonClick;

  // 创建开关容器
  const switchContainer = document.createElement("div");
  switchContainer.className = "weui-cell weui-cell_switch";
  switchContainer.style.cssText = `
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    padding: 8px 12px;
    min-width: 120px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;

  // 创建开关标签
  const switchLabel = document.createElement("div");
  switchLabel.className = "weui-cell__hd";
  switchLabel.innerHTML = '<label class="weui-label">调试模式</label>';

  // 创建开关输入
  const switchInput = document.createElement("input");
  switchInput.id = "debug-switch";
  switchInput.className = "weui-switch";
  switchInput.type = "checkbox";
  switchInput.onchange = handleSwitchChange;

  // 组装开关容器
  switchContainer.appendChild(switchLabel);
  switchContainer.appendChild(switchInput);

  // 组装主容器
  container.appendChild(button);
  container.appendChild(switchContainer);

  document.body.appendChild(container);
  console.log("测试按钮和开关已插入（WeUI样式）");
}

// 处理开关状态变化
function handleSwitchChange(event) {
  const isEnabled = event.target.checked;
  console.log(`调试模式已${isEnabled ? "开启" : "关闭"}`);

  // 这里可以添加调试模式的具体逻辑
  if (isEnabled) {
    // 开启调试模式的逻辑
    document.body.style.border = "3px solid #07c160";
    console.log("✅ 调试模式已开启 - 页面边框已显示");
  } else {
    // 关闭调试模式的逻辑
    document.body.style.border = "none";
    console.log("❌ 调试模式已关闭 - 页面边框已隐藏");
  }
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
      protocol: window.location.protocol,
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
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("page-script.js");

    const listener = (event) => {
      if (event.type === "pageDataReady") {
        window.removeEventListener("pageDataReady", listener);
        document.head.removeChild(script);
        resolve(event.detail);
      }
    };

    window.addEventListener("pageDataReady", listener);
    document.head.appendChild(script);
  });
}

// 3. 检查EditorJS是否已加载
function checkEditorJS() {
  return typeof EditorJS !== "undefined";
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
      throw new "EditorJS未正确加载，请检查libs/editor.min.js文件"();
    }

    // 加载额外工具（如果需要）
    await loadAdditionalTools();

    editorInstance = new EditorJS({
      holder: container.id,
      placeholder: "开始编写内容...",
      data: {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: `🎉 EditorJS 测试成功！`,
            },
          },
          {
            type: "paragraph",
            data: {
              text: `📄 页面标题: ${pageData.title}`,
            },
          },
          {
            type: "paragraph",
            data: {
              text: `🌐 页面URL: ${pageData.url}`,
            },
          },
          {
            type: "paragraph",
            data: {
              text: `🕒 获取时间: ${pageData.timestamp}`,
            },
          },
          {
            type: "paragraph",
            data: {
              text: `💻 用户代理: ${pageData.userAgent.substring(0, 50)}...`,
            },
          },
        ],
      },
      tools: {
        // 这里可以添加EditorJS工具
        // 例如：header: Header, list: List 等
        // 目前使用基础功能，只支持段落编辑
      },
      onChange: (api, event) => {
        console.log("编辑器内容已更改", event);
      },
    });

    console.log("EditorJS初始化成功");

    // 添加保存按钮
    addSaveButton(container.parentElement);
  } catch (error) {
    console.error("EditorJS初始化失败:", error);
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
  const existing = document.getElementById("editor-popup");
  if (existing) {
    existing.remove();
  }

  const popup = document.createElement("div");
  popup.id = "editor-popup";
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

  const header = document.createElement("div");
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

  const title = document.createElement("h3");
  title.textContent = "📝 EditorJS 测试编辑器";
  title.style.cssText = "margin: 0; font-size: 18px; font-weight: 600;";

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
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
  closeBtn.onmouseover = () =>
    (closeBtn.style.background = "rgba(255,255,255,0.3)");
  closeBtn.onmouseout = () =>
    (closeBtn.style.background = "rgba(255,255,255,0.2)");
  closeBtn.onclick = () => popup.remove();

  const editorContainer = document.createElement("div");
  editorContainer.id = "editor-container";
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
  const saveBtn = document.createElement("button");
  saveBtn.textContent = "💾 保存内容";
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

  saveBtn.onmouseover = () => (saveBtn.style.background = "#45a049");
  saveBtn.onmouseout = () => (saveBtn.style.background = "#4CAF50");

  saveBtn.onclick = async () => {
    if (editorInstance) {
      try {
        const outputData = await editorInstance.save();
        console.log("编辑器内容:", outputData);
        alert("内容已保存到控制台，请按F12查看Console");
      } catch (error) {
        console.error("保存失败:", error);
        alert("保存失败: " + error.message);
      }
    }
  };

  popup.appendChild(saveBtn);
}

// 8. 按钮点击处理
async function handleButtonClick() {
  try {
    console.log("🚀 开始获取页面数据...");

    // 现在有两种方式获取数据：
    // 方式1: 获取基本数据（不需要页面window对象）
    // const pageData = await getPageWindowData();
    // console.log('📊 基本页面数据:', pageData);

    // 方式2: 如果需要获取页面特定的window对象，使用这个
    const pageData = await getPageSpecificData();
    console.log("📊 详细页面数据:", pageData);

    console.log("⚙️ 初始化编辑器...");
    await initEditor(pageData);
  } catch (error) {
    console.error("❌ 操作失败:", error);
    alert("操作失败: " + error.message);
  }
}

// 创建WeUI按钮
function createWeUIButton(text, onClick) {
  const button = document.createElement("button");
  button.className = "weui-btn weui-btn_primary";
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
  const container = document.createElement("div");
  container.className = "weui-dialog weui-dialog_inline"; // 添加 inline 类使其不浮动
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
async function init() {
  console.log("🔧 Chrome插件初始化开始...");

  try {
    // 首先加载WeUI样式
    await loadWeUIStyles();

    // 检查EditorJS是否已加载
    if (checkEditorJS()) {
      console.log("✅ EditorJS已成功加载");
    } else {
      console.warn("⚠️ EditorJS未检测到，请确保libs/editor.min.js文件存在");
    }

    // 等待页面完全加载
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        insertTestButton();
        showWeUIContent("js_appmsg_editor", "标题", "这里是内容");
      });
    } else {
      insertTestButton();
      showWeUIContent("js_appmsg_editor", "标题", "这里是内容");
    }

    console.log("✅ Chrome插件初始化完成");
  } catch (error) {
    console.error("❌ 插件初始化失败:", error);
    // 即使WeUI加载失败，也要插入按钮（使用默认样式）
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", insertTestButton);
    } else {
      insertTestButton();
    }
  }
}

// 启动插件
init();
