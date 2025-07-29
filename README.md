# FlowEdit

**FlowEdit：增强微信公众平台编辑器体验**

FlowEdit 是一个 Chrome 浏览器扩展，专为微信公众平台编辑器设计，通过集成现代化富文本编辑器和智能功能，显著提升内容创作体验。

## ✨ 主要功能

### 🚀 现代化编辑器
- 基于 Editor.js 的块级编辑体验
- 支持标题、段落、引用、列表、图片、代码等内容类型
- 完整的内联样式支持（粗体、斜体、下划线、标记等）
- 拖拽排序和直观的编辑界面

### 📋 内容管理
- 文章历史记录和版本管理
- 便捷的侧边栏导航
- 实时预览功能
- 搜索和排序工具

### 🎨 样式系统
- 内置样式模板
- HTML 格式转换
- 微信公众号格式优化
- 自定义样式支持

### 🖼️ 图片工具
- 专为微信平台优化的图片处理
- 支持本地上传和素材库选择
- 图片格式验证和管理

### 📱 设置面板
- 完整的选项页面和设置管理
- 个性化配置选项
- 使用统计和数据管理

## 🚀 快速开始

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

1. 安装扩展后，访问微信公众平台编辑器
2. FlowEdit 会自动激活并显示增强功能
3. 使用侧边栏管理文章和工具
4. 通过选项页面进行个性化设置

## 📁 项目结构

```
src/
├── content/           # 内容脚本（主要功能）
│   ├── main.js        # 入口文件
│   ├── features/      # 功能模块
│   ├── services/      # 核心服务
│   └── utils/         # 工具函数
├── popup/             # 弹窗应用
├── options/           # 设置页面
├── shared/            # 共享组件和服务
│   ├── components/    # UI 组件
│   ├── services/      # 业务服务
│   └── utils/         # 工具函数
└── editorjs-bundle.js # 编辑器工具包
```

## 🛠️ 开发命令

```bash
# 完整构建
npm run build

# 分别构建各部分
npm run build:content    # 内容脚本
npm run build:editorjs   # 编辑器工具包
npm run build:react      # React 应用

# 开发模式
npm run dev
```

## 🔧 技术栈

- **核心**: Editor.js 富文本编辑器
- **构建**: Vite 构建工具
- **UI**: React + TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **平台**: Chrome Extension Manifest V3
- **存储**: Chrome Storage API

## 📖 使用指南

### 编辑器功能
- 点击编辑器工具栏添加不同类型的内容块
- 使用拖拽重新排列内容顺序
- 通过内联工具栏添加文本样式
- 支持撤销/重做操作

### 文章管理
- 所有文章自动保存到本地存储
- 在历史页面查看和管理已保存的文章
- 支持文章搜索和状态筛选
- 可直接在选项页面编辑历史文章

### 样式转换
- 使用预览功能查看最终效果
- 支持转换为微信公众号格式
- 可导出为 HTML 或其他格式

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 使用 ES6+ 语法
- 遵循项目的代码风格
- 添加适当的注释和日志
- 确保新功能不影响现有功能

### 提交信息
- feat: 新功能
- fix: 修复问题  
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构

## 📄 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

---

**FlowEdit** - 让微信公众号内容创作更高效 🚀
