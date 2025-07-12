/**
 * 块渲染器注册表
 * 管理所有块渲染器的注册、查找和调用
 */
import { createLogger } from '../../services/simple-logger.js';

const logger = createLogger('BlockRendererRegistry');

class BlockRendererRegistry {
  constructor() {
    this.renderers = new Map();
  }

  /**
   * 注册块渲染器
   * @param {BaseBlockRenderer} renderer - 渲染器实例
   * @returns {boolean} 注册是否成功
   */
  register(renderer) {
    if (!renderer || typeof renderer.getType !== 'function' || typeof renderer.render !== 'function') {
      logger.error('无效的渲染器实例，必须实现getType和render方法');
      return false;
    }

    const type = renderer.getType();
    if (!type || typeof type !== 'string') {
      logger.error('渲染器必须返回有效的类型字符串');
      return false;
    }

    if (this.renderers.has(type)) {
      logger.warn(`渲染器类型 ${type} 已存在，将被覆盖`);
    }

    this.renderers.set(type, renderer);
    logger.debug(`已注册渲染器: ${type}`);
    return true;
  }

  /**
   * 获取指定类型的渲染器
   * @param {string} type - 块类型
   * @returns {BaseBlockRenderer|null}
   */
  getRenderer(type) {
    return this.renderers.get(type) || null;
  }

  /**
   * 检查是否存在指定类型的渲染器
   * @param {string} type - 块类型
   * @returns {boolean}
   */
  hasRenderer(type) {
    return this.renderers.has(type);
  }

  /**
   * 获取所有已注册的渲染器类型
   * @returns {Array<string>} 类型列表
   */
  getRegisteredTypes() {
    return Array.from(this.renderers.keys());
  }

  /**
   * 批量注册渲染器
   * @param {Array<BaseBlockRenderer>} renderers - 渲染器数组
   * @returns {number} 成功注册的数量
   */
  registerAll(renderers) {
    if (!Array.isArray(renderers)) {
      logger.error('renderers必须是数组');
      return 0;
    }

    let successCount = 0;
    renderers.forEach(renderer => {
      if (this.register(renderer)) {
        successCount++;
      }
    });

    logger.info(`批量注册完成: ${successCount}/${renderers.length} 个渲染器注册成功`);
    return successCount;
  }

  /**
   * 注销指定类型的渲染器
   * @param {string} type - 块类型
   * @returns {boolean} 是否成功注销
   */
  unregister(type) {
    if (this.renderers.has(type)) {
      this.renderers.delete(type);
      logger.debug(`已注销渲染器: ${type}`);
      return true;
    }
    return false;
  }

  /**
   * 清空所有注册的渲染器
   */
  clear() {
    const count = this.renderers.size;
    this.renderers.clear();
    logger.info(`已清空所有渲染器 (${count} 个)`);
  }

  /**
   * 渲染指定块
   * @param {Object} block - 块对象
   * @param {Renderer} renderer - 主渲染器实例
   * @returns {string} 渲染结果HTML字符串
   */
  renderBlock(block, renderer) {
    if (!block || !block.type) {
      logger.warn('无效的块数据:', block);
      return '';
    }

    const blockRenderer = this.getRenderer(block.type);
    if (!blockRenderer) {
      logger.warn(`未找到渲染器: ${block.type}`);
      return '';
    }

    try {
      return blockRenderer.render(block.data || {}, renderer);
    } catch (error) {
      logger.error(`渲染块失败 (${block.type}):`, error);
      return '';
    }
  }
}

export default BlockRendererRegistry;