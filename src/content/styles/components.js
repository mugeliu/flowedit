// 组件样式配置

/**
 * 按钮组件样式
 */
export const buttonStyles = `
  /* 扩展按钮基础样式 */
  .flowedit-btn {
    display: inline-block;
    height: 22px;
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
    display: inline-block;
    height: 22px;
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
    position: absolute;
    background: #fff;
    box-sizing: border-box;
    z-index: 100; 
  }
  
  /* 智能插入编辑器占位元素样式 */
  .flowedit-editor-holder {
    padding: 0 40px 20px;
  }
  
  /* 智能插入控制栏样式 */
  .flowedit-editor-action-bar {
    padding: 10px 15px;
    background-color: #ffffff;
    display: flex;
    justify-content: flex-end;
    gap: 15px;
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
  
  /* 智能插入保存按钮悬浮效果 */
  .flowedit-editor-save-btn:hover {
    background-color: #07c160;
    background-image: linear-gradient(to bottom, #07C160 0, #07C160 100%);
    border-color: #07C160;
    color: #FFFFFF;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  
  /* 智能插入取消按钮悬浮效果 */
  .flowedit-editor-cancel-btn:hover {
    background-color: #e7e7eb;
    background-image: linear-gradient(to bottom, #E7E7EB 0, #E7E7EB 100%);
    border-color: #DADBE0;
    box-shadow: none;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
    color: #353535;
    transform: translateY(-1px);
  }
`;
