# FlowEdit

**FlowEdit：增强微信公众平台编辑器体验**

FlowEdit 是一个 Chrome 浏览器扩展，专为微信公众平台编辑器设计，通过集成 Editor.js 富文本编辑器和智能功能模块，显著提升内容创作体验。

## 功能特性

- 🚀 **智能编辑器**：基于 Editor.js 的现代化富文本编辑体验
- 📝 **丰富的编辑工具**：支持标题、段落、引用、列表、图片等多种内容类型
- 🎨 **内联样式支持**：完整的文本格式化功能（粗体、斜体、下划线等）
- 🖼️ **微信图片工具**：专为微信公众平台优化的图片上传和管理
- 📋 **侧边栏管理**：便捷的内容管理和导航界面
- 🔧 **HTML 解析器**：高效的内容转换和渲染引擎
- 🎯 **无缝集成**：与微信公众平台编辑器完美融合

## 安装使用

### 开发环境

1. 克隆项目
```bash
git clone <repository-url>
cd flowedit
```

2. 安装依赖
```bash
npm install
```

3. 构建项目
```bash
npm run build
```

4. 加载扩展
- 打开 Chrome 浏览器
- 进入 `chrome://extensions/`
- 开启「开发者模式」
- 点击「加载已解压的扩展程序」
- 选择项目的 `dist` 目录

### 使用方法

1. 安装扩展后，访问微信公众平台编辑器
2. FlowEdit 会自动激活并增强编辑器功能
3. 使用侧边栏管理内容和工具
4. 享受更流畅的内容创作体验

## 项目架构

```
src/
├── content/                    # 内容脚本核心模块
│   ├── config/                # 配置管理
│   │   ├── index.js          # Editor.js 编辑器配置
│   │   ├── style-config.js   # 样式配置管理
│   │   └── style-template.js # HTML 模板配置
│   ├── features/              # 功能模块
│   │   ├── sidebar/          # 侧边栏切换功能
│   │   └── smart-editor/     # 智能编辑器功能
│   ├── services/              # 核心服务
│   │   ├── dom-watcher.js    # DOM 监听服务
│   │   ├── plugin-registry.js # 插件注册管理
│   │   ├── style-sync-service.js # 样式同步服务
│   │   ├── system-initializer.js # 系统初始化
│   │   └── user-config-manager.js # 用户配置管理
│   ├── styles/                # 样式文件
│   │   └── components.js     # 组件样式定义
│   ├── tools/                 # 自定义工具
│   │   └── custom-wechat-image-tool.js # 微信图片上传工具
│   ├── utils/                 # 工具函数
│   │   ├── dom.js            # DOM 操作工具
│   │   ├── editor.js         # 编辑器工具
│   │   ├── parser-html.js    # HTML 解析器
│   │   ├── parsers/          # 解析器模块
│   │   └── style-manager.js  # 样式管理器
│   └── main.js               # 内容脚本入口文件
└── editorjs-bundle.js         # Editor.js 依赖包
```

### 技术栈

- **核心框架**: Editor.js - 现代化块级编辑器
- **构建工具**: Vite - 快速的前端构建工具
- **扩展平台**: Chrome Extension Manifest V3
- **样式系统**: CSS Modules + 动态样式注入
- **模块系统**: ES6 Modules

### 核心模块

#### 1. 智能编辑器 (Smart Editor)
- **位置**: `src/content/features/smart-editor/`
- **功能**: 基于 Editor.js 的富文本编辑器增强
- **特性**: 
  - 现代化的块级编辑体验
  - 丰富的内容类型支持（标题、段落、引用、列表、图片等）
  - 实时预览和格式化
  - 键盘快捷键支持

#### 2. 侧边栏管理 (Sidebar)
- **位置**: `src/content/features/sidebar/`
- **功能**: 内容管理和导航界面
- **特性**:
  - 内容大纲视图
  - 快速导航
  - 工具面板
  - 设置管理

#### 3. HTML 解析器 (Parser)
- **位置**: `src/content/tools/parser-html.js`
- **功能**: Editor.js 内容与 HTML 的双向转换
- **特性**:
  - 高效的内容解析
  - 内联样式支持（粗体、斜体、下划线等）
  - 安全的 HTML 渲染
  - 可扩展的处理器架构

#### 4. 微信图片工具
- **位置**: `src/content/tools/custom-wechat-image-tool.js`
- **功能**: 专为微信公众平台优化的图片处理
- **特性**:
  - 图片上传和管理
  - 格式验证
  - UI 状态管理

## 项目结构

```
flowedit/
├── src/
│   ├── content/                 # 内容脚本
│   │   ├── main.js             # 入口文件
│   │   ├── config/             # 配置文件
│   │   ├── features/           # 功能模块
│   │   │   ├── smart-editor/   # 智能编辑器
│   │   │   └── sidebar/        # 侧边栏
│   │   ├── services/           # 服务层
│   │   ├── styles/             # 样式文件
│   │   ├── tools/              # 工具模块
│   │   └── utils/              # 工具函数
│   └── editorjs-bundle.js      # Editor.js 工具包
├── manifest.json               # 扩展清单
├── package.json               # 项目配置
├── vite.config.js             # 构建配置
└── README.md                  # 项目文档
```

## 架构设计

### 插件化架构
- **统一接口**: 所有功能模块遵循统一的插件接口规范
- **生命周期管理**: `initialize()`, `cleanup()`, `isEnabled()` 方法
- **模块解耦**: 各功能模块独立开发和维护
- **动态加载**: 支持按需加载和卸载功能模块

### 模块化设计
- **功能分离**: 编辑器、侧边栏、解析器等核心功能独立封装
- **服务层**: 统一的服务接口和数据管理
- **工具层**: 可复用的工具函数和组件
- **配置管理**: 集中的配置文件和环境管理

### 样式管理系统
- **CSS 注入**: 动态样式注入和管理
- **主题支持**: 可配置的主题和样式变量
- **响应式设计**: 适配不同屏幕尺寸
- **样式隔离**: 避免与宿主页面样式冲突

## 开发指南

### 添加新的编辑工具

1. 在 `src/editorjs-bundle.js` 中导入新工具
2. 在 `src/content/config/index.js` 中配置工具
3. 如需自定义功能，在 `src/content/tools/` 中创建工具文件

### 扩展功能模块

1. 在 `src/content/features/` 中创建新模块目录
2. 实现统一的插件接口（`initialize`, `cleanup`, `isEnabled`）
3. 在 `src/content/main.js` 中注册新模块

### 自定义样式

1. 在 `src/content/styles/` 中添加样式文件
2. 使用动态样式注入系统加载样式
3. 确保样式隔离，避免与宿主页面冲突

### 代码规范
- 使用 ES6+ 语法
- 遵循模块化设计原则
- 添加适当的注释和文档
- 保持代码风格一致性
- 统一的错误处理和日志记录

## 关键文件说明

### 扩展配置
- `manifest.json`: Chrome 扩展清单文件
- `package.json`: 项目依赖和脚本配置
- `vite.config.js`: 构建工具配置

### 核心文件
- `src/content/main.js`: 内容脚本入口文件
- `src/content/config/index.js`: Editor.js 编辑器配置
- `src/editorjs-bundle.js`: Editor.js 工具包导出

### 功能模块
- `src/content/features/smart-editor/`: 智能编辑器功能模块
- `src/content/features/sidebar/`: 侧边栏管理模块
- `src/content/tools/parser-html.js`: HTML 解析器
- `src/content/tools/custom-wechat-image-tool.js`: 微信图片工具

### 支持文件
- `src/content/services/`: 服务层模块
- `src/content/utils/`: 工具函数库
- `src/content/styles/`: 样式文件

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

### 提交 Issue
- 详细描述问题或建议
- 提供复现步骤（如果是 Bug）
- 包含环境信息（浏览器版本、操作系统等）

### 提交 Pull Request
- Fork 项目并创建功能分支
- 确保代码符合项目规范
- 添加必要的测试和文档
- 提交清晰的 commit 信息

## 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

## 设计原则

1. **可扩展性**: 支持新功能和工具的快速集成
2. **可维护性**: 清晰的代码结构和文档
3. **性能优化**: 高效的资源加载和渲染
4. **用户体验**: 直观的界面和流畅的交互
5. **兼容性**: 与微信公众平台的完美集成
6. **安全性**: 安全的内容处理和数据管理
