// 导入样式文件
import './popup.css';

// Popup页面主要逻辑
class PopupManager {
  constructor() {
    this.isInitialized = false;
    this.currentTab = null;
    this.settings = {
      autoSync: false,
      enableNotifications: true
    };
    
    this.init();
  }

  async init() {
    try {
      // 加载设置
      await this.loadSettings();
      
      // 绑定事件
      this.bindEvents();
      
      // 检查当前标签页状态
      await this.checkCurrentTab();
      
      // 更新UI
      this.updateUI();
      
      this.isInitialized = true;
      console.log('Popup初始化完成');
    } catch (error) {
      console.error('Popup初始化失败:', error);
      this.showError('初始化失败，请刷新重试');
    }
  }

  // 绑定事件监听器
  bindEvents() {
    // 快速操作按钮
    document.getElementById('openEditor')?.addEventListener('click', () => {
      this.handleOpenEditor();
    });
    
    document.getElementById('syncContent')?.addEventListener('click', () => {
      this.handleSyncContent();
    });
    
    // 设置选项
    document.getElementById('autoSync')?.addEventListener('change', (e) => {
      this.handleSettingChange('autoSync', e.target.checked);
    });
    
    document.getElementById('enableNotifications')?.addEventListener('change', (e) => {
      this.handleSettingChange('enableNotifications', e.target.checked);
    });
    
    // 底部链接
    document.getElementById('helpLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelpPage();
    });
    
    document.getElementById('feedbackLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openFeedbackPage();
    });
  }

  // 检查当前标签页状态
  async checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      // 检查是否在微信公众号编辑页面
      const isWeChatEditor = tab.url && tab.url.includes('mp.weixin.qq.com/cgi-bin/appmsg');
      
      if (isWeChatEditor) {
        this.updateStatus('connected', '已连接到编辑器');
        await this.getEditorStats();
      } else {
        this.updateStatus('disconnected', '请在微信公众号编辑页面使用');
        this.disableEditorFeatures();
      }
    } catch (error) {
      console.error('检查标签页状态失败:', error);
      this.updateStatus('disconnected', '状态检查失败');
    }
  }

  // 更新状态指示器
  updateStatus(status, text) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('statusText');
    
    if (statusDot) {
      statusDot.className = `status-dot ${status}`;
    }
    
    if (statusText) {
      statusText.textContent = text;
    }
  }

  // 禁用编辑器相关功能
  disableEditorFeatures() {
    const editorButtons = document.querySelectorAll('.action-btn');
    editorButtons.forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    });
  }

  // 启用编辑器相关功能
  enableEditorFeatures() {
    const editorButtons = document.querySelectorAll('.action-btn');
    editorButtons.forEach(btn => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    });
  }

  // 处理打开编辑器
  async handleOpenEditor() {
    try {
      if (!this.currentTab) {
        this.showError('无法获取当前标签页信息');
        return;
      }

      // 向content script发送消息
      await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'openEditor',
        data: {}
      });
      
      // 关闭popup
      window.close();
    } catch (error) {
      console.error('打开编辑器失败:', error);
      this.showError('打开编辑器失败，请确保页面已加载完成');
    }
  }

  // 处理同步内容
  async handleSyncContent() {
    try {
      if (!this.currentTab) {
        this.showError('无法获取当前标签页信息');
        return;
      }

      // 显示同步状态
      this.updateStatus('connecting', '正在同步...');
      
      // 向content script发送同步消息
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'syncContent',
        data: {}
      });
      
      if (response && response.success) {
        this.updateStatus('connected', '同步完成');
        await this.getEditorStats();
        
        if (this.settings.enableNotifications) {
          this.showNotification('内容同步成功');
        }
      } else {
        throw new Error(response?.error || '同步失败');
      }
    } catch (error) {
      console.error('同步内容失败:', error);
      this.updateStatus('disconnected', '同步失败');
      this.showError('同步失败: ' + error.message);
    }
  }

  // 处理设置变更
  async handleSettingChange(key, value) {
    try {
      this.settings[key] = value;
      await this.saveSettings();
      
      console.log(`设置已更新: ${key} = ${value}`);
      
      // 如果是自动同步设置，通知content script
      if (key === 'autoSync' && this.currentTab) {
        chrome.tabs.sendMessage(this.currentTab.id, {
          action: 'updateSettings',
          data: { autoSync: value }
        }).catch(err => {
          console.warn('更新content script设置失败:', err);
        });
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      this.showError('设置保存失败');
    }
  }

  // 获取编辑器统计信息
  async getEditorStats() {
    try {
      if (!this.currentTab) return;
      
      const response = await chrome.tabs.sendMessage(this.currentTab.id, {
        action: 'getStats',
        data: {}
      });
      
      if (response && response.success) {
        this.updateStats(response.data);
      }
    } catch (error) {
      console.warn('获取统计信息失败:', error);
    }
  }

  // 更新统计信息显示
  updateStats(stats) {
    const totalBlocksEl = document.getElementById('totalBlocks');
    const lastSyncEl = document.getElementById('lastSync');
    
    if (totalBlocksEl && stats.totalBlocks !== undefined) {
      totalBlocksEl.textContent = stats.totalBlocks;
    }
    
    if (lastSyncEl && stats.lastSync) {
      const syncTime = new Date(stats.lastSync);
      lastSyncEl.textContent = this.formatTime(syncTime);
    }
  }

  // 格式化时间显示
  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // 1分钟内
      return '刚刚';
    } else if (diff < 3600000) { // 1小时内
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 24小时内
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // 加载设置
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['flowEditSettings']);
      if (result.flowEditSettings) {
        this.settings = { ...this.settings, ...result.flowEditSettings };
      }
    } catch (error) {
      console.warn('加载设置失败:', error);
    }
  }

  // 保存设置
  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        flowEditSettings: this.settings
      });
    } catch (error) {
      console.error('保存设置失败:', error);
      throw error;
    }
  }

  // 更新UI状态
  updateUI() {
    // 更新设置选项状态
    const autoSyncCheckbox = document.getElementById('autoSync');
    const notificationsCheckbox = document.getElementById('enableNotifications');
    
    if (autoSyncCheckbox) {
      autoSyncCheckbox.checked = this.settings.autoSync;
    }
    
    if (notificationsCheckbox) {
      notificationsCheckbox.checked = this.settings.enableNotifications;
    }
  }

  // 显示错误消息
  showError(message) {
    // 简单的错误提示，可以后续改进为更好的UI
    console.error('Popup错误:', message);
    
    // 临时使用alert，后续可以改为更好的提示方式
    if (this.settings.enableNotifications) {
      setTimeout(() => {
        alert('FlowEdit: ' + message);
      }, 100);
    }
  }

  // 显示通知
  showNotification(message) {
    console.log('Popup通知:', message);
    
    // 可以后续实现更好的通知UI
    if (this.settings.enableNotifications) {
      // 这里可以添加浏览器通知或自定义通知UI
      console.log('通知:', message);
    }
  }

  // 打开帮助页面
  openHelpPage() {
    chrome.tabs.create({
      url: 'https://github.com/your-repo/flowedit#readme'
    });
  }

  // 打开反馈页面
  openFeedbackPage() {
    chrome.tabs.create({
      url: 'https://github.com/your-repo/flowedit/issues'
    });
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// 处理页面可见性变化
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // 页面重新可见时，刷新状态
    setTimeout(() => {
      if (window.popupManager) {
        window.popupManager.checkCurrentTab();
      }
    }, 100);
  }
});

// 导出到全局作用域以便调试
window.PopupManager = PopupManager;