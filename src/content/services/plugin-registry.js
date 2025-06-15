// 插件注册服务 - 管理功能模块的统一接口

/**
 * 插件注册表
 * 提供统一的插件管理接口，支持动态注册、初始化和清理功能模块
 */
class PluginRegistry {
  constructor() {
    this.plugins = new Map();
    this.initialized = new Set();
  }

  /**
   * 注册插件功能模块
   * @param {string} name - 插件名称
   * @param {Object} plugin - 插件对象
   * @param {Function} plugin.initialize - 初始化函数
   * @param {Function} plugin.cleanup - 清理函数
   * @param {Function} [plugin.isEnabled] - 是否启用检查函数
   */
  register(name, plugin) {
    if (!plugin.initialize || typeof plugin.initialize !== "function") {
      throw new Error(`插件 ${name} 必须提供 initialize 方法`);
    }

    if (!plugin.cleanup || typeof plugin.cleanup !== "function") {
      throw new Error(`插件 ${name} 必须提供 cleanup 方法`);
    }

    this.plugins.set(name, plugin);
    console.log(`插件 ${name} 已注册`);
  }

  /**
   * 初始化指定插件
   * @param {string} name - 插件名称
   * @returns {Promise<boolean>} 是否初始化成功
   */
  async initializePlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      console.warn(`插件 ${name} 未注册`);
      return false;
    }

    if (this.initialized.has(name)) {
      console.warn(`插件 ${name} 已经初始化`);
      return true;
    }

    try {
      // 检查是否启用
      if (plugin.isEnabled && !plugin.isEnabled()) {
        console.log(`插件 ${name} 已禁用，跳过初始化`);
        return false;
      }

      await plugin.initialize();
      this.initialized.add(name);
      console.log(`插件 ${name} 初始化成功`);
      return true;
    } catch (error) {
      console.error(`插件 ${name} 初始化失败:`, error);
      return false;
    }
  }

  /**
   * 初始化所有已注册的插件
   * @returns {Promise<Object>} 初始化结果统计
   */
  async initializeAll() {
    const results = {
      success: [],
      failed: [],
      skipped: [],
    };

    for (const [name] of this.plugins) {
      const success = await this.initializePlugin(name);
      if (success) {
        results.success.push(name);
      } else {
        results.failed.push(name);
      }
    }

    console.log("插件初始化完成:", results);
    return results;
  }

  /**
   * 清理指定插件
   * @param {string} name - 插件名称
   * @returns {boolean} 是否清理成功
   */
  cleanupPlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      console.warn(`插件 ${name} 未注册`);
      return false;
    }

    if (!this.initialized.has(name)) {
      console.warn(`插件 ${name} 未初始化，无需清理`);
      return true;
    }

    try {
      plugin.cleanup();
      this.initialized.delete(name);
      console.log(`插件 ${name} 清理成功`);
      return true;
    } catch (error) {
      console.error(`插件 ${name} 清理失败:`, error);
      return false;
    }
  }

  /**
   * 清理所有已初始化的插件
   * @returns {Object} 清理结果统计
   */
  cleanupAll() {
    const results = {
      success: [],
      failed: [],
    };

    for (const name of this.initialized) {
      const success = this.cleanupPlugin(name);
      if (success) {
        results.success.push(name);
      } else {
        results.failed.push(name);
      }
    }

    console.log("插件清理完成:", results);
    return results;
  }

  /**
   * 获取已注册的插件列表
   * @returns {Array<string>} 插件名称列表
   */
  getRegisteredPlugins() {
    return Array.from(this.plugins.keys());
  }

  /**
   * 获取已初始化的插件列表
   * @returns {Array<string>} 插件名称列表
   */
  getInitializedPlugins() {
    return Array.from(this.initialized);
  }

  /**
   * 检查插件是否已注册
   * @param {string} name - 插件名称
   * @returns {boolean}
   */
  isRegistered(name) {
    return this.plugins.has(name);
  }

  /**
   * 检查插件是否已初始化
   * @param {string} name - 插件名称
   * @returns {boolean}
   */
  isInitialized(name) {
    return this.initialized.has(name);
  }
}

// 导出单例实例
export const pluginRegistry = new PluginRegistry();

// 导出类供测试使用
export { PluginRegistry };
