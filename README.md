# FlowEdit

**FlowEdit：增强微信公众平台编辑器体验**

FlowEdit 是一个 Chrome 浏览器扩展，专为微信公众平台编辑器设计，通过集成 Editor.js 富文本编辑器和智能功能模块，显著提升内容创作体验。基于插件化架构，提供模块化、可扩展的编辑增强解决方案。

## 功能特性

### 🚀 智能编辑器
- 基于 Editor.js 的现代化富文本编辑体验
- 支持标题、段落、引用、列表、图片、代码等丰富内容类型
- 完整的内联样式支持（粗体、斜体、下划线、标记等）
- 拖拽排序和键盘快捷键支持

### 🖼️ 微信图片工具
- 专为微信公众平台优化的图片上传和管理
- 支持本地图片上传和素材库图片选择
- 图片格式验证和状态管理

### 📋 侧边栏管理
- 便捷的内容管理和导航界面
- 实时预览功能
- 工具面板和设置管理

### 📚 历史文章管理
- 文章历史记录存储
- 支持文章状态跟踪（草稿、已发布等）
- 搜索和排序功能
- 元数据管理

### 🔧 HTML 解析转换
- 高效的 EditorJS 数据与 HTML 双向转换
- 模板化渲染系统
- 内联样式处理
- 安全的 HTML 输出

### 🎯 无缝集成
- 与微信公众平台编辑器完美融合
- 基于 postMessage 的安全通信
- 不干扰原生编辑器功能

## 安装使用

### 开发环境安装

1. **克隆项目**
```bash
git clone <repository-url>
cd flowedit
```

2. **安装依赖**
```bash
npm install
```

3. **构建项目**
```bash
npm run build
```

4. **加载扩展**
- 打开 Chrome 浏览器
- 进入 `chrome://extensions/`
- 开启「开发者模式」
- 点击「加载已解压的扩展程序」
- 选择项目的 `dist` 目录

### 使用方法

1. 安装扩展后，访问微信公众平台编辑器（`https://mp.weixin.qq.com/cgi-bin/appmsg*`）
2. FlowEdit 会自动检测编辑器就绪状态并激活
3. 使用侧边栏管理内容和工具
4. 享受现代化的内容创作体验

## 项目架构

### 插件化架构设计

FlowEdit 采用插件化架构，所有功能模块都遵循统一的插件接口：

```javascript
// 标准插件接口
export default {
  async initialize() {
    // 功能初始化逻辑
  },
  cleanup() {
    // 资源清理
  },
  isEnabled() {
    // 可选：功能开关检查
    return true;
  }
};
```

### 核心目录结构

```
src/content/
├── main.js                    # 主入口文件和插件编排
├── config/                    # 配置管理
│   ├── index.js              # Editor.js 配置和工具设置
│   └── debug-config.js       # 调试模式配置
├── features/                  # 功能模块（插件）
│   ├── smart-editor/          # 智能编辑器
│   │   ├── index.js          # 插件入口
│   │   ├── manager.js        # 编辑器管理
│   │   ├── editor-ui.js      # UI 组件
│   │   └── smart-button.js   # 智能按钮
│   ├── sidebar/               # 侧边栏管理
│   │   ├── index.js          # 插件入口
│   │   ├── manager.js        # 侧边栏管理
│   │   ├── preview.js        # 预览功能
│   │   └── sidebar-toggle.js # 切换组件
│   └── history-sidebar/       # 历史文章管理
│       ├── index.js          # 插件入口
│       ├── manager.js        # 历史管理
│       ├── history-sidebar.js # 侧边栏组件
│       └── history-sidebar-toggle.js # 切换组件
├── services/                  # 核心服务
│   ├── plugin-registry.js     # 插件注册管理系统
│   ├── system-initializer.js  # 应用服务初始化
│   ├── dom-monitor.js         # DOM 变化监控
│   ├── editor-bridge.js       # 微信编辑器 API 桥接
│   └── simple-logger.js       # 日志系统
├── tools/                     # 自定义 Editor.js 工具
│   └── custom-wechat-image-tool.js # 微信图片工具
├── utils/                     # 工具函数和辅助模块
│   ├── parsers/               # HTML 转换系统
│   │   ├── index.js          # 主转换器
│   │   ├── TemplateLoader.js # 模板加载器
│   │   ├── InlineStyleProcessor.js # 内联样式处理
│   │   ├── Renderer.js       # 渲染引擎
│   │   ├── BlockRendererRegistry.js # 块渲染器注册表
│   │   └── renderers/        # 具体的块渲染器
│   ├── storage/               # 存储服务
│   │   ├── index.js          # 存储服务入口
│   │   ├── browser-storage.js # 浏览器存储抽象
│   │   ├── article-storage.js # 文章存储服务
│   │   └── article-serializer.js # 文章序列化
│   ├── dom.js                # DOM 操作工具
│   ├── editor.js             # 编辑器工具
│   └── toast.js              # 通知组件
└── editorjs-bundle.js         # Editor.js 依赖包
```

### 技术栈

- **核心框架**: Editor.js - 现代化块级编辑器
- **构建工具**: Vite - 快速的前端构建工具
- **扩展平台**: Chrome Extension Manifest V3
- **模块系统**: ES6 Modules
- **样式系统**: CSS + 动态样式注入
- **存储系统**: Chrome Extension Storage API

## 核心组件详解

### 1. 系统初始化 (`src/content/main.js`)
- 插件注册和生命周期管理
- 编辑器桥接服务初始化
- WeChat 编辑器就绪状态检查
- DOM 监控服务启动
- 调试模式错误处理

### 2. 插件注册系统 (`src/content/services/plugin-registry.js`)
- 标准化插件接口管理
- 插件生命周期控制（注册、初始化、清理）
- 批量操作支持
- 初始化状态跟踪
- 详细的状态报告

### 3. 编辑器桥接 (`src/content/services/editor-bridge.js`)
- 页面脚本注入和通信桥接
- 微信编辑器 API 调用封装
- postMessage 安全通信
- 异步回调处理
- 微信数据访问接口

### 4. 存储架构 (`src/content/utils/storage/`)
- 多层存储抽象
- 文章数据序列化和元数据管理
- 搜索和排序功能
- 状态跟踪支持

### 5. HTML 转换系统 (`src/content/utils/parsers/`)
- EditorJS 数据与 HTML 双向转换
- 模板化渲染引擎
- 块类型渲染器注册表
- 内联样式处理
- 安全的 HTML 输出

### 6. 日志系统 (`src/content/services/simple-logger.js`)
- 模块化日志记录
- 调试模式支持
- 集中化配置管理

## 开发指南

### 添加新功能模块

1. **创建插件目录**
```bash
mkdir src/content/features/new-feature
```

2. **实现插件接口**
```javascript
// src/content/features/new-feature/index.js
export default {
  async initialize() {
    console.log('新功能初始化');
    // 功能初始化逻辑
  },
  cleanup() {
    console.log('新功能清理');
    // 资源清理逻辑
  },
  isEnabled() {
    return true; // 可选：功能开关
  }
};
```

3. **注册插件**
```javascript
// src/content/main.js
import newFeaturePlugin from "./features/new-feature/index.js";
pluginRegistry.register("new-feature", newFeaturePlugin);
```

### 添加 Editor.js 工具

1. **导入工具到 bundle**
```javascript
// src/editorjs-bundle.js
import NewTool from 'new-editorjs-tool';
EditorJS.NewTool = NewTool;
```

2. **配置工具**
```javascript
// src/content/config/index.js
export const editorConfig = {
  tools: {
    newTool: {
      class: "NewTool",
      config: {
        // 工具配置
      }
    }
  }
};
```

### 使用存储系统

```javascript
import { storage } from '../utils/storage/index.js';

// 保存文章
await storage.saveArticle(editorData, {
  title: '文章标题',
  status: 'draft',
  tags: ['标签1', '标签2']
});

// 获取文章列表
const articles = await storage.getArticles({
  sortBy: 'updatedAt',
  sortOrder: 'desc'
});

// 搜索文章
const results = await storage.searchArticles('关键词');
```

### HTML 转换

```javascript
import { convertToHtml } from '../utils/parsers/index.js';

// 转换 EditorJS 数据为 HTML
const html = convertToHtml(editorData, styleTemplate);
```

### 日志记录

```javascript
import { createLogger } from '../services/simple-logger.js';

const logger = createLogger('ModuleName');
logger.info('信息日志');
logger.warn('警告日志');
logger.error('错误日志', error);
```

## 构建和部署

### 构建配置 (Vite)

项目使用 Vite 进行构建，配置特点：
- 两个主要入口点：`main.js` 和 `editorjs-bundle.js`
- 禁用代码分割，确保单文件输出
- 自动复制 manifest、assets 和 scripts
- 支持 ES6 模块和现代 JavaScript 特性

### 构建命令

```bash
# 开发构建
npm run build

# 安装依赖
npm install

# 运行测试（当前为最小测试设置）
npm test
```

## 调试和开发

### 调试模式

可通过以下方式启用调试模式：

1. **配置文件方式**
```javascript
// src/content/config/debug-config.js
export const DEBUG_MODE = true;
```

2. **运行时方式**
```javascript
// 在浏览器控制台设置
localStorage.setItem('flowedit_debug', 'true');
```

调试模式功能：
- 全局错误监听和处理
- 详细的日志输出
- 插件状态跟踪

### 开发工具

- Chrome DevTools 用于调试内容脚本
- 扩展管理页面查看加载状态
- 控制台日志查看运行信息

## 技术细节

### WeChat 编辑器集成

- 通过 `editor-bridge.js` 与微信编辑器 API 通信
- 监控 `mp_editor_get_isready` API 确保编辑器就绪
- 注入 `scripts/page-injector.js` 实现跨上下文通信
- 使用 postMessage 确保安全的数据传输

### Chrome 扩展结构

- Manifest V3 规范
- 内容脚本注入到微信编辑器页面
- 使用 Chrome 存储权限
- Web 可访问资源：`scripts/page-injector.js`、`assets/style-template.json`

### 模块系统

- 全面使用 ES6 模块（`"type": "module"`）
- 插件化架构实现模块化
- 统一的错误处理和日志记录
- 面向服务的架构设计

## 贡献指南

### 提交 Issue
- 详细描述问题或建议
- 提供复现步骤（如果是 Bug）
- 包含环境信息（浏览器版本、操作系统等）

### 提交 Pull Request
- Fork 项目并创建功能分支
- 确保代码符合项目规范
- 实现必要的插件接口
- 添加适当的日志记录
- 提交清晰的 commit 信息

### 代码规范
- 使用 ES6+ 语法
- 遵循插件化设计原则
- 实现标准插件接口
- 添加模块化日志记录
- 保持代码风格一致性

## 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。
