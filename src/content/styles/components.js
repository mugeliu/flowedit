// 组件样式配置

/**
 * 自定义图片工具样式
 */
export const customImageToolStyles = `
  /* 图片工具容器 */
  .image-tool {
    margin: 10px 0;
    border-radius: 8px;
    overflow: hidden;
  }
  
  /* 上传按钮样式 */
  .image-tool__upload-button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    padding: 40px 20px;
    border: 3px dashed #007cff;
    border-radius: 12px;
    background-color: #f0f8ff;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #007cff;
    font-size: 16px;
    font-weight: 600;
    min-height: 150px;
  }
  
  .image-tool__upload-button:hover {
    border-color: #0056cc;
    background-color: #e6f3ff;
    color: #0056cc;
    transform: scale(1.02);
  }
  
  .image-tool__upload-button svg {
    fill: currentColor;
    opacity: 0.8;
    width: 32px;
    height: 32px;
  }
  
  /* 加载状态样式 */
  .image-tool__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    padding: 40px 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
  }
  
  .image-tool__loader-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e0e0e0;
    border-top: 2px solid #007cff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .image-tool__loader-text {
    color: #666;
    font-size: 14px;
  }
  
  /* 错误状态样式 */
  .image-tool__error {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 12px;
    padding: 40px 20px;
    background-color: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 8px;
  }
  
  .image-tool__error-text {
    color: #e53e3e;
    font-size: 14px;
    text-align: center;
  }
  
  .image-tool__retry-button {
    padding: 8px 16px;
    background-color: #007cff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.3s ease;
  }
  
  .image-tool__retry-button:hover {
    background-color: #0056cc;
  }
  
  /* 图片容器样式 */
  .image-tool__image-container {
    position: relative;
    max-width: 100%;
    margin: 0 auto;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .image-tool__image {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 8px;
    opacity: 0;
    animation: fadeIn 0.3s ease forwards;
  }
  
  @keyframes fadeIn {
    to {
      opacity: 1;
    }
  }
  
  /* 图片样式变体 */
  .image-tool__image-container--stretched {
    width: 100%;
  }
  
  .image-tool__image-container--with-border {
    border: 1px solid #e0e0e0;
    padding: 8px;
    background-color: white;
  }
  
  .image-tool__image-container--with-background {
    background-color: #f5f5f5;
    padding: 20px;
  }
  
  /* 图片标题样式 */
  .image-tool__caption {
    margin-top: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: #666;
    text-align: center;
    background-color: #f8f9fa;
    border-radius: 4px;
    font-style: italic;
  }
  
  /* 设置按钮样式 */
  .cdx-settings-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-right: 4px;
  }
  
  .cdx-settings-button:hover {
    background-color: #f0f0f0;
  }
  
  .cdx-settings-button--active {
    background-color: #007cff;
    color: white;
  }
  
  .cdx-settings-button--active:hover {
    background-color: #0056cc;
  }
  
  .cdx-settings-button svg {
    fill: currentColor;
    width: 16px;
    height: 16px;
  }
`;

/**
 * 按钮组件样式
 */
export const buttonStyles = `
  /* 扩展按钮基础样式 */
  .flowedit-smart-btn {
    /* 基础布局样式 */
    position: relative;
    display: inline-block;
    height: 22px;
    margin: 8px 12px;
    cursor: pointer;
    border: none;
    outline: none;
    box-sizing: border-box;
    vertical-align: middle;
    flex-shrink: 0;
    
    /* 特定样式 */
    background-color: #07c160;
    color: white;
    border-radius: 4px;
    padding: 0 12px;
    font-size: 12px;
    line-height: 22px;
    transition: all 0.3s ease;
  }
  
  /* 智能插入按钮悬浮效果 */
  .flowedit-smart-btn:hover {
    background-color: #07c160;
    background-image: linear-gradient(to bottom, #07C160 0, #07C160 100%);
    border-color: #07C160;
    color: #FFFFFF;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

/**
 * 开关组件样式
 */
export const switchStyles = `
  /* Switch开关样式 */
  .flowedit-switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    margin: 8px 12px;
    cursor: pointer;
    border: none;
    outline: none;
    box-sizing: border-box;
    vertical-align: middle;
    flex-shrink: 0;
  }
  
  .flowedit-switch-track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    border-radius: 11px;
    transition: all 0.3s ease;
  }
  
  .flowedit-switch-thumb {
    position: absolute;
    width: 18px;
    height: 18px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
  }
  
  .flowedit-switch.on .flowedit-switch-track {
    background-color: #07c160;
  }
  
  .flowedit-switch.on .flowedit-switch-thumb {
    transform: translateX(18px);
  }
`;

/**
 * 编辑器组件样式
 */
export const editorStyles = `
  /* 智能插入编辑器容器样式 */
  .flowedit-editor-container {
    position: relative; /* 改为相对定位，适合直接插入 */
    top: 0;
    left: 0;
    z-index: 1;
    width: calc(100% + 8px);
    box-sizing: content-box;More actions
    background: #fff;
  }
  
  /* 智能插入编辑器占位元素样式 */
  .flowedit-editor-holder {
    margin-left: -95px;
    padding: 0;
    padding-left: 91px;
  }
  
  /* 智能插入控制栏样式 */
  .flowedit-editor-action-bar {
    position: relative; /* 改为相对定位，适配直接插入DOM */
    background-color: #ffffff;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 15px;
    padding: 20px 20px 15px 20px; /* 添加上下内边距 */
    box-sizing: border-box;
    width: 768px;
  }
  
  /* 智能插入保存按钮样式 */
  .flowedit-editor-save-btn {
    padding: 4px 12px;
    height: 34px;
    min-width: 96px;
    display: inline-block;
    background: #07c160;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  

  
  /* 智能插入取消按钮样式 */
  .flowedit-editor-cancel-btn {
    padding: 4px 12px;
    height: 34px;
    min-width: 96px;
    display: inline-block;
    background: #999999;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }
`;
