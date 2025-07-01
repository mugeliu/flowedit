// content.js - 简化版功能实现

/**
 * 创建控制面板
 * @returns {HTMLElement} 返回创建的面板元素
 */
function createControlPanel() {
  // 创建面板容器，使用WeUI按钮区域样式
  const panel = document.createElement('div');
  panel.id = 'control-panel';
  panel.className = 'tool_area';

  const toolbarContainer = document.createElement('div');
  toolbarContainer.id = 'control-panel-toolbar';
  toolbarContainer.className = 'weui-bottom-fixed-opr weui-btn-area_inline tool_bar';

  // 创建空div占位元素
  const placeholderDiv = document.createElement('div');
  placeholderDiv.id = 'placeholder-div';
  placeholderDiv.style.cssText = 'width: 30%; margin: 0 auto; height: auto;';
  toolbarContainer.appendChild(placeholderDiv);

  // 创建保存按钮，使用WeUI主要按钮样式
  const saveButton = document.createElement('button');
  saveButton.role = 'button'
  saveButton.className = 'weui-btn weui-btn_primary weui-btn_medium';
  saveButton.textContent = '保存';
  saveButton.addEventListener('click', handleSave);

  // 创建取消按钮，使用WeUI默认按钮样式
  const cancelButton = document.createElement('button');
  cancelButton.role = 'button'
  cancelButton.className = 'weui-btn weui-btn_default weui-btn_medium';
  cancelButton.textContent = '取消';
  cancelButton.addEventListener('click', handleCancel);

  // 创建预览按钮，使用WeUI默认按钮样式
  const previewButton = document.createElement('button');
  previewButton.role = 'button'
  previewButton.className = 'weui-btn weui-btn_default weui-btn_medium';
  previewButton.textContent = '预览';
  previewButton.addEventListener('click', handleCancel);

  // 将按钮添加到面板
  panel.appendChild(toolbarContainer);
  toolbarContainer.appendChild(previewButton);
  toolbarContainer.appendChild(saveButton);
  toolbarContainer.appendChild(cancelButton);

  return panel;
}

/**
 * 保存按钮点击处理
 */
function handleSave() {
  console.log('保存按钮被点击');
  alert('保存操作已执行');
}

/**
 * 取消按钮点击处理
 */
function handleCancel() {
  console.log('取消按钮被点击');
  alert('取消操作已执行');
}

/**
 * 隐藏指定元素并插入面板
 */
function setupPanel() {
  // 查找目标元素
  const buttonArea = document.getElementById('js_button_area');
  
  if (!buttonArea) {
    console.error('未找到 id="js_button_area" 的元素');
    return;
  }

  // 隐藏目标元素
  buttonArea.style.display = 'none';
  console.log('已隐藏 js_button_area 元素');

  // 创建控制面板
  const panel = createControlPanel();

  // 将面板插入到目标元素的兄弟节点位置
  if (buttonArea.parentNode) {
    buttonArea.parentNode.insertBefore(panel, buttonArea.nextSibling);
    console.log('控制面板已插入到 js_button_area 的兄弟节点位置');
  } else {
    console.error('js_button_area 元素没有父节点');
  }
}

/**
 * 初始化函数
 */
function init() {
  console.log('开始初始化控制面板...');
  
  // 等待DOM加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupPanel);
  } else {
    setupPanel();
  }
}

// 启动初始化
init();
