# StyleFlow Backend

基于 LangGraph + LangChain 的 AI 风格化内容生成后端服务，专为微信公众号平台优化。

## 🏗️ 架构概览

### 核心技术栈
- **Web 框架**: FastAPI (轻量、快速、自动文档)
- **工作流编排**: LangGraph (Agent 状态管理和流程控制)
- **Agent 框架**: LangChain (LLM 调用和工具集成)
- **数据存储**: SQLite (简单、无需配置)
- **AI 服务**: OpenAI API (GPT-4)

### 系统架构
```
用户请求 (HTTP)
    ↓
FastAPI 接口层
    ↓
LangGraph 工作流编排器
    ↓
5 个 LangChain Agent (并行/串行执行)
    ↓
SQLite 本地存储
    ↓
返回生成的 HTML
```

## 🤖 核心 Agents

### 1. StyleDesignerAgent (风格设计师)
- **职责**: 将风格描述转化为设计系统规范
- **输入**: 风格要求 (style_requirements)
- **输出**: 设计系统 (色彩、字体、间距、几何元素)

### 2. ContentAnalystAgent (内容分析师)
- **职责**: 分析原始内容的结构和特征
- **输入**: 原始 HTML 内容
- **输出**: 内容分析结果 (结构、类型、权重、情感)

### 3. DesignAdapterAgent (设计适配师)
- **职责**: 将设计系统与内容特征结合
- **输入**: 设计系统 + 内容分析结果
- **输出**: 适配设计方案 (具体的视觉设计方案)

### 4. CodeEngineerAgent (代码工程师)
- **职责**: 将设计方案转化为 HTML 代码
- **输入**: 适配设计 + 原始内容
- **输出**: 生成的 HTML (内联样式，微信兼容)

### 5. QualityDirectorAgent (质量总监)
- **职责**: 评估生成结果的质量
- **输入**: 生成的 HTML + 设计系统 + 内容分析
- **输出**: 质量评分 + 质量报告

## 🔄 工作流程

1. **START** → **parallel_analysis** (并行执行风格设计师和内容分析师)
2. **parallel_analysis** → **design_adapter** (设计适配)
3. **design_adapter** → **code_engineer** (代码生成)
4. **code_engineer** → **quality_director** (质量检查)
5. **quality_director** → **conditional_end** (条件结束)
   - `quality_score >= 0.8`: 直接结束
   - `0.6 <= quality_score < 0.8`: 重试一次
   - `quality_score < 0.6`: 降级处理
   - `iteration_count >= 3`: 强制结束

## 📊 数据库设计

### 核心表结构
- **tasks**: 任务记录表 (id, status, content, results, quality_score)
- **agent_executions**: Agent 执行记录表 (task_id, agent_name, timing, data)
- **knowledge_base**: 知识库表 (type, category, content, metadata)
- **quality_feedback**: 质量反馈表 (task_id, quality_score, feedback_data)

## 🚀 快速开始

### 环境要求
- Python 3.9+
- OpenAI API Key
- 本地 SQLite 支持

### 安装步骤

1. **克隆项目并进入目录**
```bash
cd backend
```

2. **创建虚拟环境**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，添加 OpenAI API Key
```

5. **初始化数据库**
```bash
python init_db.py
```

6. **启动服务**
```bash
# Windows
start.bat

# Linux/Mac
./start.sh

# 或直接运行
python main.py
```

### 服务访问
- **API 文档**: http://localhost:8000/docs
- **ReDoc 文档**: http://localhost:8000/redoc
- **服务首页**: http://localhost:8000
- **健康检查**: http://localhost:8000/api/v1/health
- **API 测试工具**: [api-test.html](api-test.html) - 打开本地HTML文件进行API测试

## 📡 API 接口

### POST /api/v1/transform
创建样式转换任务
```json
{
  "content": "<p>原始HTML内容</p>",
  "style_name": "professional",
  "style_features": ["clean", "modern"]
}
```

**响应**:
```json
{
  "task_id": "uuid-string",
  "status": "running",
  "progress": 0.0,
  "estimated_time": 120
}
```

### GET /api/v1/task/{task_id}
查询任务状态
```json
{
  "task_id": "uuid-string",
  "status": "completed",
  "progress": 1.0,
  "result": "<div style='...'>转换后的HTML</div>",
  "error": null
}
```

### GET /api/v1/task/{task_id}/steps
查询任务执行详情
```json
{
  "task_id": "uuid-string",
  "steps": [
    {
      "agent_name": "style_designer_agent",
      "status": "completed",
      "execution_time": 5.2
    }
  ],
  "current_step": "completed",
  "quality_report": {...}
}
```

## 🛠️ 开发指南

### 项目结构
```
src/
├── agents/           # 5个核心Agent实现
│   ├── base.py              # Agent基类
│   ├── style_designer.py    # 风格设计师
│   ├── content_analyst.py   # 内容分析师
│   ├── design_adapter.py    # 设计适配师
│   ├── code_engineer.py     # 代码工程师
│   └── quality_director.py  # 质量总监
├── tools/            # LangChain工具集
│   ├── style_tools.py       # 样式相关工具
│   ├── content_tools.py     # 内容分析工具
│   └── html_tools.py        # HTML生成工具
├── workflows/        # LangGraph工作流
│   └── style_transform.py   # 主要转换工作流
├── database/         # 数据库层
│   └── manager.py           # 数据库管理器
├── api/              # API路由层
│   └── routes.py            # RESTful API路由
├── models/           # 数据模型
│   └── schemas.py           # Pydantic模型定义
└── config/           # 配置管理
    └── settings.py          # 应用配置
```

### 添加新的工具
1. 继承 `BaseCustomTool` 类
2. 实现 `execute` 方法
3. 在相应 Agent 中注册工具

### 扩展 Agent 功能
1. 修改 Agent 的 `_initialize_tools` 方法
2. 更新 `_get_prompt_template` 方法
3. 调整 `execute` 方法逻辑

## 🧪 测试

### 运行测试
```bash
# 单元测试
pytest tests/unit/

# 集成测试
pytest tests/integration/

# 所有测试
pytest
```

### 手动测试
1. 启动服务
2. 访问 http://localhost:8000/docs
3. 使用 Swagger UI 测试 API

## 📈 性能指标

### MVP 阶段目标
- **单个任务处理时间**: < 2 分钟
- **并发任务数**: 1-3 个
- **内存使用**: < 1GB
- **磁盘空间**: < 500MB

### 优化策略
- LLM 调用串行化避免 rate limit
- 简单的结果缓存机制
- 数据库查询优化
- 超时和重试机制

## 🔒 安全注意事项

1. **API Key 安全**: 确保 `.env` 文件不被提交到版本控制
2. **输入验证**: 所有 API 输入都经过 Pydantic 验证
3. **HTML 安全**: 生成的 HTML 仅包含安全的内联样式
4. **数据库**: 使用参数化查询防止 SQL 注入

## 🚨 故障排除

### 常见问题

**Q: ModuleNotFoundError: No module named 'src'**
A: 确保从项目根目录运行 `python main.py`

**Q: OpenAI API 错误**
A: 检查 `.env` 文件中的 `OPENAI_API_KEY` 是否正确设置

**Q: 数据库连接失败**
A: 运行 `python init_db.py` 重新初始化数据库

**Q: 端口被占用**
A: 修改 `.env` 文件中的 `API_PORT` 设置

**Q: 依赖版本冲突**
A: 当前requirements.txt使用最新版本，如遇冲突可手动指定版本号：
```bash
pip install "fastapi==0.104.1" "langchain==0.0.350"
```

### 日志查看
日志级别可以在 `.env` 文件中通过 `LOG_LEVEL` 设置：
- `DEBUG`: 详细调试信息
- `INFO`: 一般信息 (默认)
- `WARNING`: 警告信息
- `ERROR`: 错误信息

## 📝 更新日志

### v1.0.0 (2024-01-08)
- ✨ 初始版本发布
- 🤖 实现5个核心Agent
- 🔄 LangGraph工作流编排  
- 📡 RESTful API接口
- 💾 SQLite数据持久化
- 📚 完整的API文档
- 🧹 清理历史遗留代码，移除过时文件
- 📋 移除dependencies固定版本号，避免依赖冲突

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请提交 GitHub Issue。