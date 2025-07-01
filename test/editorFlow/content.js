// content.js - EditorJS集成实现

/**
 * 动态加载EditorJS CDN
 * @returns {Promise} 返回加载完成的Promise
 */
function loadEditorJS() {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载
    if (window.EditorJS) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest";
    script.onload = () => {
      console.log("EditorJS CDN 加载成功");
      resolve();
    };
    script.onerror = () => {
      console.error("EditorJS CDN 加载失败");
      reject(new Error("EditorJS CDN 加载失败"));
    };
    document.head.appendChild(script);
  });
}

/**
 * 创建WeUI样式的编辑器面板
 * @returns {HTMLElement} 返回创建的面板元素
 */
function createEditorPanel() {
  // 创建主面板容器
  const panel = document.createElement("div");
  panel.id = "editor-panel";
  panel.className = "weui-panel weui-panel_access";
  panel.style.cssText = `
    position: relative;
    z-index: 1;
    width: calc(100% + 8px);
    box-sizing: content-box;
    margin-left: -95px;
    padding: 0 91px;
  `;

  // 创建面板内容区域
  const panelBody = document.createElement("div");
  panelBody.className = "weui-panel__bd";
  panelBody.id = "editorjs-container";
  panelBody.style.cssText = `
      width: calc(100% + 65px); /* 超出父容器 */
  `;

  // 组装面板
  panel.appendChild(panelBody);

  return panel;
}

/**
 * 初始化EditorJS编辑器
 * @param {string} containerId 编辑器容器ID
 */
function initializeEditor(containerId) {
  try {
    const editor = new EditorJS({
      holder: containerId,
      placeholder: "开始编写内容...",
      data: {
        blocks: [
          {
            type: "paragraph",
            data: {
              text: "欢迎使用 EditorJS！这是一个基础的编辑器实例。",
            },
          },
        ],
      },
      onChange: (api, event) => {
        console.log("编辑器内容已更改", event);
      },
    });

    console.log("EditorJS 编辑器初始化成功");
    return editor;
  } catch (error) {
    console.error("EditorJS 编辑器初始化失败:", error);
    throw error;
  }
}

/**
 * 隐藏目标元素并插入编辑器面板
 */
function setupEditorPanel() {
  // 查找插入位置的目标元素
  const insertTargetElement = document.getElementById("js_author_area");

  if (!insertTargetElement) {
    console.error('未找到 id="js_author_area" 的元素');
    return;
  }

  // 查找需要隐藏的元素
  const hideTargetElement = document.getElementById("edui1_iframeholder");
  
  if (hideTargetElement) {
    hideTargetElement.style.display = "none";
    console.log("已隐藏 #edui1_iframeholder 元素");
  } else {
    console.warn('未找到 id="edui1_iframeholder" 的元素，跳过隐藏操作');
  }

  // 创建编辑器面板
  const panel = createEditorPanel();

  // 将面板插入到目标元素的兄弟节点位置
  if (insertTargetElement.parentNode) {
    insertTargetElement.parentNode.insertBefore(panel, insertTargetElement.nextSibling);
    console.log("编辑器面板已插入到 #js_author_area 的兄弟节点位置");
  } else {
    console.error("#js_author_area 元素没有父节点");
    return;
  }

  // 异步加载并初始化EditorJS
  loadEditorJS()
    .then(() => {
      return initializeEditor("editorjs-container");
    })
    .catch((error) => {
      console.error("编辑器设置失败:", error);
      const container = document.getElementById("editorjs-container");
      if (container) {
        container.innerHTML = `
          <div style="color: red; text-align: center; padding: 40px;">
            <h3>编辑器加载失败</h3>
            <p>错误信息: ${error.message}</p>
            <p>请检查网络连接或刷新页面重试</p>
          </div>
        `;
      }
    });
}

/**
 * 初始化函数
 */
function init() {
  console.log("开始初始化 EditorJS 编辑器面板...");

  // 等待DOM加载完成
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupEditorPanel);
  } else {
    setupEditorPanel();
  }
}

// 启动初始化
init();
