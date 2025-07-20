# FlowEdit 模板加载流程文档

## 概述

FlowEdit 采用统一的模板管理系统，支持内置模板和远程模板，通过 `chrome.storage.local` 进行模板缓存和用户设置存储，确保高性能和良好的用户体验。

## 整体架构

```
┌─ 内置模板 (assets/templates/)
│  ├─ default.json
│  ├─ wechat-official.json
│  └─ minimal-clean.json
│
├─ 远程模板 (API)
│  ├─ tech-blue-v2
│  ├─ elegant-purple
│  └─ ...更多在线模板
│
└─ 本地存储 (chrome.storage.local)
   ├─ currentTemplateId: "wechat-official"
   ├─ currentTemplate: { 完整模板数据 }
   └─ cachedTemplates: { 远程模板缓存 }
```

## 详细流程

### 1. 插件初始化阶段

**触发时机**：插件首次安装或启动时

**流程步骤**：
1. 检查 chrome.storage.local 中是否存在 `currentTemplate`
2. 如果不存在（首次使用），从 assets 加载默认模板
3. 将默认模板的完整数据存储到 chrome.storage.local
4. 记录当前模板ID为 "default"

**存储结果**：
```
chrome.storage.local = {
  currentTemplateId: "default",
  currentTemplate: {
    完整的默认模板数据...
  }
}
```

### 2. 设置页面模板选择

**触发时机**：用户打开 options 页面查看/切换模板

#### 2.1 获取可用模板列表

**内置模板扫描**：
- 遍历预定义的内置模板文件列表
- 从每个模板文件中读取元数据（name, description）
- 构建内置模板列表，标记 source: 'builtin'

**远程模板获取**：
- 调用远程API获取可用模板列表
- 解析返回的模板元数据
- 构建远程模板列表，标记 source: 'remote'

**合并结果**：
- 将内置和远程模板列表合并
- 返回完整的可用模板列表

#### 2.2 渲染模板选择器

**显示逻辑**：
- 读取当前使用的模板ID
- 渲染所有可用模板，显示友好的中文名称
- 高亮当前正在使用的模板
- 区分内置和在线模板

**用户界面**：
```
┌─ 模板选择 ─────────────────┐
│ ✓ 绿色渐变主题 [内置]       │
│   默认主题，现代感十足      │
│                           │
│   微信公众号官方样式 [内置] │
│   仿微信公众号官方文章样式  │
│                           │
│   科技蓝色主题 v2 [在线]    │
│   现代科技感蓝色主题       │
└───────────────────────────┘
```

#### 2.3 用户选择新模板

**选择流程**：
1. 用户点击某个模板选项
2. 显示加载状态提示
3. 调用模板加载机制获取完整模板数据
4. 将新模板数据完整替换 chrome.storage.local 中的 currentTemplate
5. 更新 currentTemplateId
6. 更新UI状态，显示切换成功

### 3. 模板加载机制

#### 3.1 统一加载入口

**加载优先级**：
1. **缓存优先**：检查 chrome.storage.local 中的 cachedTemplates
2. **内置模板**：尝试从 assets/templates/ 加载
3. **远程下载**：从API下载并缓存

#### 3.2 内置模板加载

**加载过程**：
- 根据模板ID构建文件路径：`assets/templates/${templateId}.json`
- 使用 chrome.runtime.getURL() 获取扩展内部资源
- fetch 加载模板JSON数据
- 直接返回模板数据（无需缓存，assets本身就是缓存）

#### 3.3 远程模板加载与缓存

**下载过程**：
- 根据模板ID调用远程API
- 下载完整模板数据
- 将模板数据存储到 chrome.storage.local 的 cachedTemplates 中
- 记录缓存时间和版本信息

**缓存机制**：
- 缓存有效期：7天
- 存储格式：`{ data: 模板数据, cachedAt: 时间戳, version: 版本号 }`
- 缓存检查：优先使用未过期的缓存版本

**存储结果**：
```
chrome.storage.local = {
  currentTemplateId: "tech-blue-v2",
  currentTemplate: { 当前使用的完整模板数据 },
  cachedTemplates: {
    "tech-blue-v2": {
      data: { 完整模板数据 },
      cachedAt: 时间戳,
      version: "2.1.0"
    }
  }
}
```

### 4. 网页内容使用模板

**触发时机**：用户在微信编辑器中编辑内容，EditorJS onChange 事件触发

#### 4.1 获取当前模板

**获取流程**：
1. 直接从 chrome.storage.local 读取 currentTemplate
2. 如果存在，立即返回（无网络请求，极快）
3. 如果不存在（异常情况），降级加载默认模板

#### 4.2 应用模板渲染内容

**渲染流程**：
1. EditorJS 内容变化触发 onChange 事件
2. 获取当前编辑器数据
3. 加载当前模板（从存储直接读取）
4. 使用 HTML 转换器将 EditorJS 数据 + 模板 → HTML
5. 更新预览区域显示

## 数据流图

```
插件启动
    ↓
检查 storage.currentTemplate
    ↓
[无] 加载 default.json → 存储到 storage
[有] 直接使用现有模板
    ↓
用户打开设置页面
    ↓
扫描内置模板 + 获取远程列表 → 显示选择器
    ↓
用户选择新模板
    ↓
加载模板数据（内置/远程/缓存）→ 替换 storage.currentTemplate
    ↓
网页内容编辑
    ↓
直接读取 storage.currentTemplate → 渲染内容
```

## 性能优化机制

### 1. **模板缓存策略**
- **当前模板**：完整存储，使用时零延迟
- **远程模板**：下载后缓存7天，避免重复下载
- **内置模板**：浏览器自动缓存，加载快速

### 2. **加载优先级**
1. 当前模板（存储中）- 毫秒级
2. 缓存模板（存储中）- 毫秒级  
3. 内置模板（assets）- 快速
4. 远程下载 - 较慢，但会缓存

### 3. **错误降级机制**
- 远程加载失败 → 使用缓存版本
- 缓存过期/损坏 → 重新下载
- 网络异常 → 使用内置默认模板
- 所有失败 → 使用硬编码的最简模板

## 关键优势

1. **极致性能**：当前模板完整缓存，内容渲染时无任何网络请求
2. **离线友好**：远程模板下载后完全离线可用，不依赖网络
3. **即时切换**：模板切换后立即生效，无需刷新或重启
4. **无限扩展**：支持任意数量的远程模板，无需修改代码
5. **稳定可靠**：多层降级机制，确保任何情况下都有可用模板
6. **存储高效**：只存储当前使用的模板，按需缓存其他模板

## 存储空间评估

- 单个模板大小：3-4KB
- 当前使用模板：4KB
- 缓存10个远程模板：40KB  
- 预估总占用：~50KB
- Chrome storage.local 限制：5MB+
- 存储使用率：< 1%