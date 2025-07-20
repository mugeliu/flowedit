# FlowEdit 架构重构计划

## 📋 概述

将核心功能模块从 content 特定位置迁移到 shared services，提升代码架构的一致性和可维护性。

## 🎯 重构目标

### 1. 统一架构模式
- 将所有核心业务功能模块统一放置在 `src/shared/services/`
- 提升跨上下文（content、options、popup）的代码复用性
- 建立清晰的依赖关系和模块边界

### 2. 解决当前问题
- 消除 options 页面向 content 目录的awkward依赖
- 为未来功能扩展（如popup预览、background处理）做准备
- 提升代码的可测试性和可维护性

## 🚀 迁移计划

### Phase 1: Storage 服务迁移

#### 源位置
```
src/content/utils/storage/
├── article-serializer.js
├── article-storage.js
├── browser-storage.js
└── index.js
```

#### 目标位置
```
src/shared/services/storage/
├── article-serializer.js
├── article-storage.js
├── browser-storage.js
└── index.js
```

#### 影响的文件 (需要更新import路径)
- `src/content/utils/editor.js`
- `src/content/features/history-sidebar/index.js`
- `src/content/features/smart-editor/index.js`
- `src/options/components/history-settings.tsx`
- 其他可能导入storage的文件

#### 更新示例
```javascript
// 更新前
import { storage } from '../../content/utils/storage/index.js'

// 更新后  
import { storage } from '../../shared/services/storage/index.js'
```

### Phase 2: Parsers 服务迁移

#### 源位置
```
src/content/utils/parsers/
├── BlockRendererRegistry.js
├── InlineStyleProcessor.js
├── Renderer.js
├── TemplateLoader.js
├── index.js
└── renderers/
    ├── BaseBlockRenderer.js
    ├── CodeRenderer.js
    ├── DelimiterRenderer.js
    ├── GenericRenderer.js
    ├── HeaderRenderer.js
    ├── ImageRenderer.js
    ├── ListRenderer.js
    ├── ParagraphRenderer.js
    ├── QuoteRenderer.js
    └── RawRenderer.js
```

#### 目标位置
```
src/shared/services/parsers/
├── BlockRendererRegistry.js
├── InlineStyleProcessor.js
├── Renderer.js
├── TemplateLoader.js
├── index.js
└── renderers/
    └── [所有renderer文件]
```

#### 影响的文件 (需要更新import路径)
- `src/content/utils/editor.js`
- `src/content/features/sidebar/preview.js`
- 未来的options页面功能

#### 更新示例
```javascript
// 更新前
import { convertToHtml } from "./parsers/index.js"

// 更新后
import { convertToHtml } from "../../../shared/services/parsers/index.js"
```

## 📁 最终目标架构

```
src/
├── shared/
│   ├── services/
│   │   ├── storage/           ← 文章存储服务 (迁移)
│   │   ├── parsers/           ← 内容解析服务 (迁移)
│   │   ├── template-manager.js ← 模板管理服务 (已存在)
│   │   └── logger.js          ← 日志服务 (已存在)
│   └── components/
│       └── ui/                ← UI组件库 (已存在)
├── content/
│   ├── features/              ← 功能模块
│   ├── services/              ← content特定服务
│   ├── utils/
│   │   ├── dom.js            ← DOM工具函数
│   │   └── editor.js         ← 编辑器工具函数
│   └── main.js
├── options/
│   └── components/
├── popup/
│   └── App.tsx
└── background/
```

## 🔍 迁移步骤

### Step 1: 准备工作
1. 创建新的目录结构
2. 备份当前代码
3. 准备测试环境

### Step 2: Storage服务迁移
1. 移动文件到新位置
2. 更新所有import路径
3. 验证functionality正常
4. 运行构建测试

### Step 3: Parsers服务迁移
1. 移动文件到新位置
2. 更新所有import路径
3. 验证预览和导出功能正常
4. 运行构建测试

### Step 4: 功能增强
1. 在options页面中启用parsers功能
2. 实现HTML导出功能
3. 添加文章预览功能

### Step 5: 验证和清理
1. 全面测试所有功能
2. 清理遗留的空目录
3. 更新文档

## ✅ 预期收益

### 1. 架构改进
- ✅ 统一的shared services架构
- ✅ 清晰的模块依赖关系
- ✅ 更好的代码组织

### 2. 功能增强
- ✅ Options页面可以使用storage和parsers
- ✅ 支持HTML格式的文章导出
- ✅ 文章预览功能
- ✅ 为未来功能扩展做准备

### 3. 开发体验
- ✅ 更简洁的import路径
- ✅ 更好的代码复用性
- ✅ 更容易进行单元测试

## ⚠️ 注意事项

### 1. 兼容性
- 确保所有Chrome extension上下文都能正常访问shared services
- 验证动态import在不同环境下的表现

### 2. 构建系统
- 更新Vite配置以正确处理新的目录结构
- 确保打包后的路径引用正确

### 3. 测试覆盖
- 验证content script功能正常
- 验证options页面功能正常
- 验证popup功能正常

## 📅 时间估计

- **Phase 1 (Storage迁移)**: 30-45分钟
- **Phase 2 (Parsers迁移)**: 30-45分钟  
- **功能增强**: 30-60分钟
- **测试验证**: 30分钟
- **总计**: 2-3小时

## 🚦 状态跟踪

- [ ] Phase 1: Storage服务迁移
- [ ] Phase 2: Parsers服务迁移
- [ ] 功能增强实现
- [ ] 全面测试验证
- [ ] 文档更新

---

*最后更新: 2025-01-20*
*创建者: Claude Code Assistant*