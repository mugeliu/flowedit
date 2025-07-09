// content.js - WeUI侧边栏按钮实现

/**
 * 创建侧边栏按钮
 * @returns {HTMLElement} 按钮元素
 */
function createSidebarButton() {
  const feedbackBtn = document.createElement("div");
  feedbackBtn.className = "weui-desktop-online-faq__wrp";
  feedbackBtn.style.bottom = "400px";
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
        right: -400px;
        top: 100px;
        width: 350px;
        height: calc(100vh - 120px);
        background: white;
        border-radius: 16px 0 0 16px;
        box-shadow: -4px 0 20px rgba(0,0,0,0.15);
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 5001;
        overflow-y: auto;
        padding: 24px;
        border: 1px solid #e5e7eb;
        border-right: none;
    `;

  panel.innerHTML = `
        <button class="weui-btn weui-btn_mini weui-btn_default" id="close-sidebar-btn" style="
            position: absolute;
            top: 20px;
            right: 20px;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            line-height: 1;
            padding: 0;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
            color: #6b7280;
            z-index: 5002;
            transition: all 0.2s ease;
            cursor: pointer;
        " onmouseover="this.style.background='#f3f4f6'; this.style.borderColor='#d1d5db';" 
           onmouseout="this.style.background='#f9fafb'; this.style.borderColor='#e5e7eb';">×</button>
        
        <div class="weui-panel__hd" style="
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid #f3f4f6;
        ">历史文章</div>
        
        <div class="weui-panel__bd">
            <div role="option" class="weui-media-box weui-media-box_text" id="article-item" style="
                padding: 16px;
                border-radius: 12px;
                border: 1px solid #f3f4f6;
                background: #fafafa;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-bottom: 12px;
            " onmouseover="this.style.background='#f3f4f6'; this.style.borderColor='#e5e7eb';" 
               onmouseout="this.style.background='#fafafa'; this.style.borderColor='#f3f4f6';">
                <strong class="weui-media-box__title" style="
                    color: #111827;
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 8px;
                    display: block;
                ">如何使用WeUI组件</strong>
                <p class="weui-media-box__desc" style="
                    color: #6b7280;
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 8px;
                ">这是一篇关于WeUI组件使用方法的详细教程，包含了常用组件的使用示例和最佳实践。</p>
                <p class="weui-media-box__desc" style="
                    color: #9ca3af;
                    font-size: 12px;
                    margin: 0;
                ">发布时间：2024-01-15</p>
            </div>
        </div>
        
        <div class="weui-panel__ft" style="margin-top: 16px;">
            <a href="javascript:" class="weui-cell weui-cell_active weui-cell_access weui-cell_link" style="
                border-radius: 8px;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='#f1f5f9';" 
               onmouseout="this.style.background='#f8fafc';">
                <span class="weui-cell__bd" style="color: #475569; font-weight: 500;">查看更多</span>
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
    sidebar.style.right = "-400px";
    // 移除外部点击监听器
    document.removeEventListener("click", handleOutsideClick);
  } else {
    // 显示侧边栏
    sidebar.style.right = "0px";
    // 添加外部点击监听器
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 100); // 延迟添加，避免立即触发
  }
}

/**
 * 处理侧边栏外部点击事件
 */
function handleOutsideClick(event) {
  const sidebar = document.getElementById("history-sidebar");
  const button = document.querySelector(".weui-desktop-online-faq__wrp");
  
  // 如果点击的不是侧边栏内部和触发按钮
  if (sidebar && 
      !sidebar.contains(event.target) && 
      !button.contains(event.target) &&
      sidebar.style.right === "0px") {
    toggleSidebar();
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
        border-radius: 16px;
        width: 320px;
        max-width: 90%;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

  dialog.innerHTML = `
        <div class="weui-dialog__hd" style="
            padding: 24px 24px 8px 24px;
            text-align: center;
        ">
            <strong class="weui-dialog__title" style="
                font-size: 18px;
                font-weight: 600;
                color: #111827;
            ">文章操作</strong>
        </div>
        <div class="weui-dialog__bd" style="
            padding: 8px 24px 24px 24px;
            text-align: center;
            color: #6b7280;
            font-size: 15px;
            line-height: 1.5;
        ">
            确定要插入这篇文章吗？
        </div>
        <div class="weui-dialog__ft" style="
            display: flex;
            border-top: 1px solid #f3f4f6;
        ">
            <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_default" id="cancel-btn" style="
                flex: 1;
                padding: 16px;
                text-align: center;
                color: #6b7280;
                font-weight: 500;
                border-right: 1px solid #f3f4f6;
                transition: background-color 0.2s ease;
                text-decoration: none;
            " onmouseover="this.style.backgroundColor='#f9fafb';" 
               onmouseout="this.style.backgroundColor='transparent';">取消</a>
            <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" id="insert-dialog-btn" style="
                flex: 1;
                padding: 16px;
                text-align: center;
                color: #2563eb;
                font-weight: 600;
                transition: background-color 0.2s ease;
                text-decoration: none;
            " onmouseover="this.style.backgroundColor='#f0f9ff';" 
               onmouseout="this.style.backgroundColor='transparent';">插入</a>
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
    // 关闭侧边栏
    toggleSidebar();
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
