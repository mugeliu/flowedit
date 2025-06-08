/**
 * 用户配置管理器
 * 负责管理用户的个性化设置、权限和配置同步
 */

/**
 * 用户配置管理器类
 */
class UserConfigManager {
  constructor() {
    this.isLoggedIn = false;
    this.userInfo = null;
    this.userConfig = null;
    this.defaultConfig = {
      theme: 'default',
      autoSave: true,
      autoInjectStyles: true,
      wrapperClassName: 'flow-editor-content',
      skipEmptyBlocks: true,
      enableRemoteStyles: false
    };
  }

  /**
   * 初始化用户配置管理器
   * @returns {Promise<boolean>} 初始化是否成功
   */
  async initialize() {
    try {
      // 检查用户登录状态（预留）
      await this.checkAuthStatus();
      
      // 加载用户配置
      await this.loadUserConfig();
      
      console.log('用户配置管理器初始化完成');
      return true;
    } catch (error) {
      console.error('用户配置管理器初始化失败:', error);
      // 使用默认配置
      this.userConfig = { ...this.defaultConfig };
      return false;
    }
  }

  /**
   * 检查用户认证状态（预留接口）
   * @returns {Promise<boolean>} 是否已登录
   */
  async checkAuthStatus() {
    try {
      // TODO: 实现真实的用户认证检查
      // const response = await fetch('/api/user/auth/status');
      // const data = await response.json();
      // this.isLoggedIn = data.isLoggedIn;
      // this.userInfo = data.userInfo;
      
      // 目前模拟未登录状态
      this.isLoggedIn = false;
      this.userInfo = null;
      
      return this.isLoggedIn;
    } catch (error) {
      console.error('检查用户认证状态失败:', error);
      this.isLoggedIn = false;
      this.userInfo = null;
      return false;
    }
  }

  /**
   * 用户登录（预留接口）
   * @param {Object} credentials 登录凭据
   * @returns {Promise<boolean>} 登录是否成功
   */
  async login(credentials) {
    try {
      // TODO: 实现真实的用户登录
      // const response = await fetch('/api/user/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(credentials)
      // });
      // const data = await response.json();
      // 
      // if (data.success) {
      //   this.isLoggedIn = true;
      //   this.userInfo = data.userInfo;
      //   await this.loadUserConfig();
      //   return true;
      // }
      
      console.log('用户登录功能暂未实现');
      return false;
    } catch (error) {
      console.error('用户登录失败:', error);
      return false;
    }
  }

  /**
   * 用户登出（预留接口）
   * @returns {Promise<boolean>} 登出是否成功
   */
  async logout() {
    try {
      // TODO: 实现真实的用户登出
      // await fetch('/api/user/auth/logout', { method: 'POST' });
      
      this.isLoggedIn = false;
      this.userInfo = null;
      this.userConfig = { ...this.defaultConfig };
      
      // 清除本地存储的用户数据
      await this.clearLocalUserData();
      
      console.log('用户已登出');
      return true;
    } catch (error) {
      console.error('用户登出失败:', error);
      return false;
    }
  }

  /**
   * 加载用户配置
   * @returns {Promise<Object>} 用户配置
   */
  async loadUserConfig() {
    try {
      if (this.isLoggedIn) {
        // TODO: 从远程加载用户配置
        // const response = await fetch('/api/user/config');
        // const remoteConfig = await response.json();
        // this.userConfig = { ...this.defaultConfig, ...remoteConfig };
        
        console.log('远程配置加载功能暂未实现，使用默认配置');
      }
      
      // 从本地存储加载配置
      const localConfig = await this.getLocalConfig();
      this.userConfig = { ...this.defaultConfig, ...localConfig };
      
      return this.userConfig;
    } catch (error) {
      console.error('加载用户配置失败:', error);
      this.userConfig = { ...this.defaultConfig };
      return this.userConfig;
    }
  }

  /**
   * 保存用户配置
   * @param {Object} config 配置对象
   * @returns {Promise<boolean>} 保存是否成功
   */
  async saveUserConfig(config) {
    try {
      // 合并配置
      this.userConfig = { ...this.userConfig, ...config };
      
      // 保存到本地存储
      await this.setLocalConfig(this.userConfig);
      
      // 如果用户已登录，同步到远程（预留）
      if (this.isLoggedIn) {
        // TODO: 同步到远程服务器
        // await fetch('/api/user/config', {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(this.userConfig)
        // });
        
        console.log('远程配置同步功能暂未实现');
      }
      
      console.log('用户配置已保存');
      return true;
    } catch (error) {
      console.error('保存用户配置失败:', error);
      return false;
    }
  }

  /**
   * 获取用户配置
   * @param {string} key 配置键名，不传则返回所有配置
   * @returns {any} 配置值
   */
  getUserConfig(key = null) {
    if (!this.userConfig) {
      return key ? this.defaultConfig[key] : { ...this.defaultConfig };
    }
    
    return key ? this.userConfig[key] : { ...this.userConfig };
  }

  /**
   * 设置用户配置
   * @param {string|Object} key 配置键名或配置对象
   * @param {any} value 配置值（当key为字符串时使用）
   * @returns {Promise<boolean>} 设置是否成功
   */
  async setUserConfig(key, value = undefined) {
    try {
      let configToSave = {};
      
      if (typeof key === 'object') {
        configToSave = key;
      } else {
        configToSave[key] = value;
      }
      
      return await this.saveUserConfig(configToSave);
    } catch (error) {
      console.error('设置用户配置失败:', error);
      return false;
    }
  }

  /**
   * 重置用户配置为默认值
   * @returns {Promise<boolean>} 重置是否成功
   */
  async resetUserConfig() {
    try {
      this.userConfig = { ...this.defaultConfig };
      await this.setLocalConfig(this.userConfig);
      console.log('用户配置已重置为默认值');
      return true;
    } catch (error) {
      console.error('重置用户配置失败:', error);
      return false;
    }
  }

  /**
   * 获取本地配置
   * @returns {Promise<Object>} 本地配置
   */
  async getLocalConfig() {
    try {
      const result = await chrome.storage.local.get(['userConfig']);
      return result.userConfig || {};
    } catch (error) {
      console.error('获取本地配置失败:', error);
      return {};
    }
  }

  /**
   * 设置本地配置
   * @param {Object} config 配置对象
   * @returns {Promise<boolean>} 设置是否成功
   */
  async setLocalConfig(config) {
    try {
      await chrome.storage.local.set({ userConfig: config });
      return true;
    } catch (error) {
      console.error('设置本地配置失败:', error);
      return false;
    }
  }

  /**
   * 清除本地用户数据
   * @returns {Promise<boolean>} 清除是否成功
   */
  async clearLocalUserData() {
    try {
      await chrome.storage.local.remove(['userConfig', 'userInfo']);
      return true;
    } catch (error) {
      console.error('清除本地用户数据失败:', error);
      return false;
    }
  }

  /**
   * 检查用户权限（预留接口）
   * @param {string} permission 权限名称
   * @returns {boolean} 是否有权限
   */
  hasPermission(permission) {
    // TODO: 实现真实的权限检查
    // if (!this.isLoggedIn || !this.userInfo) {
    //   return false;
    // }
    // return this.userInfo.permissions?.includes(permission) || false;
    
    // 目前返回 true，允许所有操作
    return true;
  }

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息
   */
  getUserInfo() {
    return this.userInfo;
  }

  /**
   * 获取登录状态
   * @returns {boolean} 是否已登录
   */
  isUserLoggedIn() {
    return this.isLoggedIn;
  }

  /**
   * 获取管理器状态
   * @returns {Object} 状态信息
   */
  getStatus() {
    return {
      isLoggedIn: this.isLoggedIn,
      userInfo: this.userInfo,
      hasConfig: !!this.userConfig,
      configKeys: this.userConfig ? Object.keys(this.userConfig) : []
    };
  }
}

// 创建单例实例
const userConfigManager = new UserConfigManager();

export default userConfigManager;
export { UserConfigManager };