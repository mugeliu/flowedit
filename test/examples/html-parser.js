/**
 * EditorJS HTML 解析器模块
 * 负责将 EditorJS 数据转换为 HTML 格式
 */

class HTMLParser {
    constructor() {
        this.parser = null;
        this.isInitialized = false;
    }

    /**
     * 初始化 HTML 解析器
     * @returns {boolean} 初始化是否成功
     */
    init() {
        if (window.edjsHTML) {
            this.parser = window.edjsHTML();
            this.isInitialized = true;
            console.log('EditorJS HTML 解析器初始化成功');
            return true;
        } else {
            console.warn('EditorJS HTML 解析器未加载');
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * 检查解析器是否已初始化
     * @returns {boolean}
     */
    isReady() {
        return this.isInitialized && this.parser !== null;
    }

    /**
     * 将 EditorJS 数据解析为 HTML
     * @param {Object} editorData - EditorJS 保存的数据
     * @returns {string} 解析后的 HTML 字符串
     * @throws {Error} 当解析器未初始化或解析失败时抛出错误
     */
    parse(editorData) {
        if (!this.isReady()) {
            throw new Error('HTML 解析器未初始化');
        }

        try {
            return this.parser.parse(editorData);
        } catch (error) {
            console.error('HTML 解析失败:', error);
            throw new Error('HTML 解析失败: ' + error.message);
        }
    }

    /**
     * 安全解析 EditorJS 数据为 HTML
     * @param {Object} editorData - EditorJS 保存的数据
     * @returns {Object} 包含成功状态和结果的对象
     */
    safeParse(editorData) {
        try {
            const html = this.parse(editorData);
            console.log('HTML 解析成功',html);
            return {
                success: true,
                html: html,
                error: null
            };
           
        } catch (error) {
            return {
                success: false,
                html: null,
                error: error.message
            };
        }
    }

    /**
     * 获取格式化的 HTML 内容（带样式容器）
     * @param {Object} editorData - EditorJS 保存的数据
     * @returns {string} 带样式容器的 HTML 字符串
     */
    getFormattedHTML(editorData) {
        const result = this.safeParse(editorData);
        
        if (result.success) {
            return `<div style="border: 1px solid #ddd; padding: 10px; background: white; border-radius: 4px;">${result.html}</div>`;
        } else {
            return `<div style="color: red; padding: 10px;">HTML 解析失败: ${result.error}</div>`;
        }
    }
}

// 创建全局实例
const htmlParser = new HTMLParser();

// 导出模块（支持多种模块系统）
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = { HTMLParser, htmlParser };
} else if (typeof window !== 'undefined') {
    // 浏览器环境
    window.HTMLParser = HTMLParser;
    window.htmlParser = htmlParser;
}

// 自动初始化（如果在浏览器环境中）
if (typeof window !== 'undefined') {
    // 等待 DOM 加载完成后尝试初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => htmlParser.init(), 100);
        });
    } else {
        // DOM 已加载，延迟初始化以确保 edjsHTML 已加载
        setTimeout(() => htmlParser.init(), 100);
    }
}