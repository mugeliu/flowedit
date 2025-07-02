// content.js - 重新创建的功能

/**
 * 创建多级节点结构的容器
 */
function createAppMsgContainer() {
  // 创建主容器
  const mainContainer = document.createElement("div");
  mainContainer.className =
    "weui-desktop-layout__main__hd main_hd appmsg_edit_mod default appmsg_preview_area scrollbar-macosx";

  // 创建内容区域
  const contentSection = document.createElement("div");
  contentSection.className = "appmsg_preview_container appmsg-side__wrapper";
  mainContainer.appendChild(contentSection);

  // 创建WeUI面板容器
  const weuiPanel = document.createElement("div");
  weuiPanel.className = "weui-panel weui-panel_access";
  contentSection.appendChild(weuiPanel);

  // 创建面板头部
  const panelHeader = document.createElement("div");
  panelHeader.className = "weui-panel__hd";
  panelHeader.textContent = "文章预览";
  weuiPanel.appendChild(panelHeader);

  // 创建面板主体内容
  const panelBody = document.createElement("div");
  panelBody.className = "weui-panel__bd";
  panelBody.style.cssText = "padding: 15px;"; // 移除max-height限制，让内容完整显示
  weuiPanel.appendChild(panelBody);

  // 生成测试HTML内容
  const testHtmlContent = `
    <article style="line-height: 1.6; color: #333;">
      <h1 style="color: #2c3e50; margin-bottom: 20px; font-size: 24px;">测试文章标题</h1>
      <p style="margin-bottom: 15px; text-indent: 2em;">这是一段测试文章内容。在现代Web开发中，内容管理和编辑器功能变得越来越重要。我们需要提供一个直观、易用的界面来帮助用户创建和编辑内容。</p>
      
      <h2 style="color: #34495e; margin: 20px 0 15px 0; font-size: 20px;">功能特性</h2>
      <ul style="margin-bottom: 15px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">支持富文本编辑</li>
        <li style="margin-bottom: 8px;">实时预览功能</li>
        <li style="margin-bottom: 8px;">响应式设计</li>
        <li style="margin-bottom: 8px;">WeUI样式集成</li>
      </ul>
      
      <h2 style="color: #34495e; margin: 20px 0 15px 0; font-size: 20px;">技术实现</h2>
      <p style="margin-bottom: 15px; text-indent: 2em;">本项目采用了现代化的前端技术栈，包括原生JavaScript、WeUI组件库以及模块化的代码结构。通过精心设计的架构，我们实现了高性能和良好的用户体验。</p>
      
      <blockquote style="border-left: 4px solid #3498db; padding-left: 15px; margin: 20px 0; font-style: italic; color: #7f8c8d;">
        "好的设计不仅仅是外观和感觉，更重要的是它如何工作。" - Steve Jobs
      </blockquote>
      
      <h2 style="color: #34495e; margin: 20px 0 15px 0; font-size: 20px;">代码示例</h2>
      <pre style="background: #f8f9fa; padding: 15px; border-radius: 5px; overflow-x: auto; margin-bottom: 15px;"><code>function createAppMsgContainer() {
  const container = document.createElement('div');
  container.className = 'appmsg_container_bd';
  return container;
}</code></pre>
      
      <p style="margin-bottom: 15px; text-indent: 2em;">以上代码展示了如何创建一个基本的容器元素。在实际开发中，我们会根据具体需求添加更多的功能和样式。</p>
      
      <h2 style="color: #34495e; margin: 20px 0 15px 0; font-size: 20px;">总结</h2>
      <p style="margin-bottom: 15px; text-indent: 2em;">通过本次开发，我们成功实现了一个功能完整的内容编辑和预览系统。该系统不仅具备良好的用户体验，还具有很强的扩展性和维护性。</p>
      
      <div style="margin-top: 30px; padding: 15px; background: #ecf0f1; border-radius: 5px; text-align: center;">
        <p style="margin: 0; color: #7f8c8d; font-size: 14px;">— 文章结束 —</p>
      </div>
    </article>
  `;

  // 将HTML内容渲染到面板主体
  panelBody.innerHTML = testHtmlContent;

  // 组装多级结构
  mainContainer.appendChild(contentSection);

  return mainContainer;
}

/**
 * 创建切换按钮
 */
function createToggleButton() {
  const toggleButton = document.createElement("button");
  toggleButton.id = "toggle-view-button";
  toggleButton.textContent = "切换到编辑器视图";
  toggleButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    padding: 10px 20px;
    background-color: #007cba;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    transition: background-color 0.3s;
  `;

  // 添加悬停效果
  toggleButton.addEventListener("mouseenter", () => {
    toggleButton.style.backgroundColor = "#005a87";
  });

  toggleButton.addEventListener("mouseleave", () => {
    toggleButton.style.backgroundColor = "#007cba";
  });

  return toggleButton;
}

/**
 * 切换视图显示状态
 */
function toggleView() {
  const sideMenuElement = document.getElementById("js_mp_sidemenu");
  const customContainer = document.getElementById("custom-appmsg-container");
  const toggleButton = document.getElementById("toggle-view-button");

  if (!sideMenuElement || !customContainer || !toggleButton) {
    console.error("切换所需的元素未找到");
    return;
  }

  const isCustomVisible = customContainer.style.display !== "none";

  if (isCustomVisible) {
    // 当前显示自定义容器，切换到原始侧边菜单
    customContainer.style.display = "none";
    sideMenuElement.style.display = "";
    toggleButton.textContent = "切换到编辑器视图";
    console.log("已切换到原始侧边菜单视图");
  } else {
    // 当前显示原始侧边菜单，切换到自定义容器
    sideMenuElement.style.display = "none";
    customContainer.style.display = "";
    toggleButton.textContent = "切换到原始视图";
    console.log("已切换到编辑器视图");
  }
}

/**
 * 设置页面元素和插入容器
 */
function setupPageElements() {
  // 查找目标元素
  const sideMenuElement = document.getElementById("js_mp_sidemenu");

  if (!sideMenuElement) {
    console.error('未找到 id="js_mp_sidemenu" 的元素');
    return;
  }

  // 创建新容器
  const container = createAppMsgContainer();
  container.id = "custom-appmsg-container";

  // 初始状态：隐藏原有元素，显示新容器
  sideMenuElement.style.display = "none";
  console.log("已隐藏 #js_mp_sidemenu 元素");

  // 将容器插入为兄弟节点
  if (sideMenuElement.parentNode) {
    sideMenuElement.parentNode.insertBefore(
      container,
      sideMenuElement.nextSibling
    );
    console.log("appmsg_container_bd 容器已插入为 #js_mp_sidemenu 的兄弟节点");
  } else {
    console.error("#js_mp_sidemenu 元素没有父节点");
    return;
  }

  // 创建并添加切换按钮
  const toggleButton = createToggleButton();
  toggleButton.addEventListener("click", toggleView);
  document.body.appendChild(toggleButton);
  console.log("切换按钮已添加到页面");
}

/**
 * 初始化函数
 */
function init() {
  console.log("开始初始化新功能...");

  // 等待DOM加载完成
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupPageElements);
  } else {
    setupPageElements();
  }
}

// 启动初始化
init();
