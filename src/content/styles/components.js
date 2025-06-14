// 组件样式配置

/**
 * 按钮组件样式
 */
export const buttonStyles = `
  /* 扩展按钮基础样式 */
    .flowedit-smart-btn {
    /* 基础样式 */
    display: inline-block;
    height: 22px;
    cursor: pointer;
    border: none;
    outline: none;
    box-sizing: border-box;
    
    /* 特定样式 */
    background-color: #07c160;
    color: white;
    border-radius: 4px;
    padding: 0 12px;
    font-size: 12px;
    line-height: 22px;
    transition: all 0.3s ease;
  }

    /* 固定定位按钮样式 */
  .flowedit-btn-fixed {
    position: fixed;
    z-index: 100;
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
    display: inline-block;
    height: 22px;
    cursor: pointer;
    position: relative;
    width: 40px;
    border: none;
    outline: none;
    box-sizing: border-box;
  }

    /* 固定定位的开关样式 */
  .flowedit-switch-fixed {
    position: fixed;
    z-index: 100;
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
    position: fixed; /* 统一使用 fixed */
    background: #fff;
    border-radius: 4px;
    box-sizing: border-box;
    overflow: hidden;
    padding: 0 30px 0 55px;
    z-index: 10;
  }
  
  /* 智能插入编辑器占位元素样式 */
  .flowedit-editor-holder {
    padding: 0;
  }
  
  /* 智能插入控制栏样式 */
  .flowedit-editor-action-bar {
    position: fixed; /* 统一使用 fixed */
    background-color: #ffffff;
    display: flex;
    justify-content: flex-end;
    align-items: center; /* 上下居中对齐 */
    gap: 15px;
    z-index: 120; /* 统一层级值 */
    bottom: 0; /* 固定在底部 */
  }

  /* 透明占位元素样式 */
  .spacer {
    width: 20px; /* 控制右边距 */
    height: 1px; /* 无实际高度，仅占位 */
  }
  
  /* 智能插入保存按钮样式 */
  .flowedit-editor-save-btn {
    padding: 4px 12px;
    height: 34px;
    width: 98px;
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
    width: 98px;
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
