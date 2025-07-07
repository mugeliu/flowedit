// content.js - WeUI侧边栏按钮实现

/**
 * 创建侧边栏按钮
 * @returns {HTMLElement} 按钮元素
 */
function createSidebarButton() {
  const feedbackBtn = document.createElement("div");
  feedbackBtn.className = "weui-desktop-online-faq__wrp";
  feedbackBtn.style.bottom = "600px";
  feedbackBtn.innerHTML = `
        <div class="weui-desktop-online-faq__switch" style="border-radius: 4px;">
            <div class="weui-desktop-online-faq__switch_content" style="cursor: pointer; border-radius: 4px;">
                <div class="text" style="font-size: 14px; color: rgb(76, 77, 78); line-height: 19.6px;">历史文章</div>
            </div>
        </div>
    `;

  // 添加点击事件到按钮内容区域
  const switchContent = feedbackBtn.querySelector(
    ".weui-desktop-online-faq__switch_content"
  );
  if (switchContent) {
    switchContent.addEventListener("click", toggleSidebar);
  }

  return feedbackBtn;
}

/**
 * 创建侧边栏
 * @returns {HTMLElement} 侧边栏元素
 */
function createSidebar() {
  // 直接创建WeUI panel作为侧边栏
  const panel = document.createElement("div");
  panel.id = "history-sidebar";
  panel.className = "weui-panel weui-panel_access";
  panel.style.cssText = `
        position: fixed;
        right: -390px;
        top: 0;
        width: 350px;
        height: 100vh;
        background: white;
        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        transition: right 0.3s ease;
        z-index: 5001;
        overflow-y: auto;
        padding: 20px;
    `;

  panel.innerHTML = `
        <button class="weui-btn weui-btn_mini weui-btn_default" id="close-sidebar-btn" style="
            position: absolute;
            top: 15px;
            right: 15px;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            line-height: 1;
            padding: 0;
            border: 1px solid #ddd;
            background: white;
            z-index: 5002;
        ">×</button>
        <div class="weui-panel__hd">历史文章</div>
        <div class="weui-panel__bd">
            <div role="option" class="weui-media-box weui-media-box_text" id="article-item">
                <strong class="weui-media-box__title">如何使用WeUI组件</strong>
                <p class="weui-media-box__desc">这是一篇关于WeUI组件使用方法的详细教程，包含了常用组件的使用示例和最佳实践。</p>
                <p class="weui-media-box__desc" style="color: #999; font-size: 12px; margin-top: 5px;">发布时间：2024-01-15</p>
            </div>
        </div>
        <div class="weui-panel__ft">
            <a href="javascript:" class="weui-cell weui-cell_active weui-cell_access weui-cell_link">
                <span class="weui-cell__bd">查看更多</span>
                <span class="weui-cell__ft"></span>
            </a>
        </div>
    `;

  // 添加关闭按钮事件
  const closeBtn = panel.querySelector("#close-sidebar-btn");
  closeBtn.addEventListener("click", toggleSidebar);

  // 添加文章点击事件，显示dialog
  const articleItem = panel.querySelector("#article-item");
  articleItem.addEventListener("click", () => {
    showArticleDialog();
  });

  // 添加查看更多点击事件
  const viewMoreBtn = panel.querySelector(".weui-cell_link");
  viewMoreBtn.addEventListener("click", () => {
    console.log("查看更多文章");
  });

  return panel;
}

/**
 * 切换侧边栏显示状态
 */
function toggleSidebar() {
  const sidebar = document.getElementById("history-sidebar");
  if (!sidebar) return;

  const isVisible = sidebar.style.right === "0px";

  if (isVisible) {
    // 隐藏侧边栏
    sidebar.style.right = "-390px";
  } else {
    // 显示侧边栏
    sidebar.style.right = "0px";
  }
}

/**
 * 显示文章操作对话框
 */
function showArticleDialog() {
  // 创建dialog遮罩层
  const dialogMask = document.createElement("div");
  dialogMask.className = "weui-mask";
  dialogMask.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 5002;
        display: flex;
        align-items: center;
        justify-content: center;
    `;

  // 创建dialog主体
  const dialog = document.createElement("div");
  dialog.className = "weui-dialog";
  dialog.style.cssText = `
        background: white;
        border-radius: 8px;
        width: 280px;
        max-width: 90%;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

  dialog.innerHTML = `
        <div class="weui-dialog__hd">
            <strong class="weui-dialog__title">文章操作</strong>
        </div>
        <div class="weui-dialog__bd" style="padding: 20px; text-align: center; color: #999;">
            确定要插入这篇文章吗？
        </div>
        <div class="weui-dialog__ft">
            <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default" id="cancel-btn">取消</a>
            <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" id="insert-dialog-btn">插入</a>
        </div>
    `;

  dialogMask.appendChild(dialog);
  document.body.appendChild(dialogMask);

  // 添加按钮事件
  const cancelBtn = dialog.querySelector("#cancel-btn");
  const insertBtn = dialog.querySelector("#insert-dialog-btn");

  // 取消按钮 - 关闭弹框
  cancelBtn.addEventListener("click", () => {
    document.body.removeChild(dialogMask);
  });

  // 插入按钮 - 执行插入逻辑
  insertBtn.addEventListener("click", () => {
    console.log("插入文章");
    // 这里可以添加插入文章的逻辑
    document.body.removeChild(dialogMask);
  });

  // 点击遮罩层关闭弹框
  dialogMask.addEventListener("click", (e) => {
    if (e.target === dialogMask) {
      document.body.removeChild(dialogMask);
    }
  });
}

/**
 * 初始化函数
 */
function init() {
  // 等待DOM加载完成
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupElements);
  } else {
    setupElements();
  }
}

/**
 * 设置页面元素
 */
function setupElements() {
  // 创建并插入按钮
  const button = createSidebarButton();
  document.body.appendChild(button);

  // 创建并插入侧边栏
  const sidebar = createSidebar();
  document.body.appendChild(sidebar);

  console.log("侧边栏按钮和侧边栏已成功创建");
}

// 启动初始化
init();
