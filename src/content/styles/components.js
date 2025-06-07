// 组件样式配置

/**
 * 按钮组件样式
 */
export const buttonStyles = `
  /* 扩展按钮基础样式 */
  .flowedit-btn {
    display: inline-block;
    height: 22px;
    margin: 1px 4px;
    vertical-align: middle;
    cursor: pointer;
    border: none;
    outline: none;
    box-sizing: border-box;
  }
  
  /* 智能插入按钮样式 */
  .flowedit-smart-btn {
    background-color: #07c160;
    color: white;
    border-radius: 4px;
    padding: 0 12px;
    font-size: 12px;
    line-height: 22px;
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
    margin: 1px 4px;
    vertical-align: middle;
    cursor: pointer;
    position: relative;
    width: 40px;
    border: none;
    outline: none;
    box-sizing: border-box;
  }
  
  .flowedit-switch-track {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    border-radius: 11px;
    transition: background-color 0.3s ease;
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
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    width: calc(100% + 8px);
    box-sizing: content-box;
    margin-left: -95px;
    padding: 0 91px;
    background: #fff;
  }
  
  /* 智能插入编辑器占位元素样式 */
  .flowedit-editor-holder {
    margin-left: -95px;
    padding: 0 91px;
  }
  
  /* 智能插入控制栏样式 */
  .flowedit-editor-action-bar {
    padding: 20px 20px 15px 20px;
    margin: 0;
    background-color: #ffffff;
    color: rgb(53, 53, 53);
    font-family: mp-quote, 'PingFang SC', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', Arial, sans-serif;
    font-size: 14px;
    line-height: 22.4px;
    word-break: break-all;
    box-sizing: content-box;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    z-index: 1000;
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
  }
`;