/**
 * 测试环境设置
 * 模拟浏览器环境的 API
 */

// 模拟 localStorage
global.localStorage = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {},
  length: 0,
  key: (index) => null
};

// 模拟 sessionStorage
global.sessionStorage = {
  getItem: (key) => null,
  setItem: (key, value) => {},
  removeItem: (key) => {},
  clear: () => {},
  length: 0,
  key: (index) => null
};

// 模拟 window 对象
global.window = {
  localStorage: global.localStorage,
  sessionStorage: global.sessionStorage,
  location: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  navigator: {
    userAgent: 'Mozilla/5.0 (Test Environment)'
  }
};

// 模拟 chrome extension API
global.chrome = {
  storage: {
    local: {
      get: async (keys) => {
        if (typeof keys === 'string') {
          return { [keys]: null };
        }
        if (Array.isArray(keys)) {
          const result = {};
          keys.forEach(key => result[key] = null);
          return result;
        }
        return {};
      },
      set: async (items) => {
        // 模拟存储成功
        return;
      },
      remove: async (keys) => {
        return;
      },
      clear: async () => {
        return;
      }
    },
    sync: {
      get: async (keys) => {
        if (typeof keys === 'string') {
          return { [keys]: null };
        }
        if (Array.isArray(keys)) {
          const result = {};
          keys.forEach(key => result[key] = null);
          return result;
        }
        return {};
      },
      set: async (items) => {
        return;
      },
      remove: async (keys) => {
        return;
      },
      clear: async () => {
        return;
      }
    }
  },
  runtime: {
    getURL: (path) => `chrome-extension://test-extension-id/${path}`,
    id: 'test-extension-id'
  }
};

// 模拟 document 对象（基本功能）
global.document = {
  createElement: (tagName) => ({
    tagName: tagName.toUpperCase(),
    innerHTML: '',
    textContent: '',
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => []
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  querySelector: () => null,
  querySelectorAll: () => []
};

// 模拟 console（如果需要更好的控制）
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  // 可以在这里添加测试特定的 console 方法
};

console.log('🔧 测试环境设置完成');