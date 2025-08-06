# AI 风格化内容生成服务

基于 LangChain + LangGraph 构建的智能内容风格化系统，将用户的任意文本内容转换为符合特定设计风格的微信公众号 HTML 格式。

## 功能特性

- **智能风格生成**：基于风格描述自动生成风格DNA配置
- **内容结构化分析**：AI自动识别标题、段落、列表等内容层次
- **微信平台规范**：严格遵循微信公众号HTML和CSS限制
- **风格复用**：保存风格DNA供后续内容使用
- **实时验证**：自动检测和修复HTML合规性问题

## 技术架构

- **后端框架**：FastAPI + SQLAlchemy
- **AI工作流**：LangChain + LangGraph
- **数据库**：SQLite（可升级到PostgreSQL）
- **缓存系统**：内存缓存（可升级到Redis）
- **日志监控**：结构化日志记录和性能监控

## 项目结构

```
backend/
├── app/
│   ├── api/                 # API路由
│   │   └── routes.py
│   ├── core/                # 核心工作流组件
│   │   ├── config.py           # 配置管理
│   │   ├── exceptions.py       # 异常定义
│   │   ├── langchain_chains.py # LangChain链组件
│   │   ├── wechat_validator.py # 微信规范验证器
│   │   └── workflow.py         # LangGraph工作流
│   ├── db/                  # 数据库
│   │   └── database.py
│   ├── models/              # 数据模型
│   │   └── schemas.py
│   ├── services/            # 业务服务
│   │   ├── cache.py
│   │   └── style_dna_service.py
│   └── utils/               # 工具类
│       └── monitor.py
├── docs/                    # 设计文档
│   ├── langchain.md
│   └── update.md
├── main.py                  # 应用入口
├── requirements.txt         # Python依赖
├── .env                     # 环境配置
├── start.sh                 # Linux启动脚本
└── start.bat               # Windows启动脚本
```

## 快速开始

### 1. 环境准备

确保已安装Python 3.8+，然后创建虚拟环境：

```bash
# 创建虚拟环境
python -m venv venv

# 激活虚拟环境（Linux/Mac）
source venv/bin/activate

# 激活虚拟环境（Windows）
venv\Scripts\activate
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 配置环境变量

复制并编辑 `.env` 文件：

```bash
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=sqlite:///./style_dna.db
DEBUG=true
LOG_LEVEL=INFO
HOST=127.0.0.1
PORT=8000
OPENAI_BASE_URL=https://api.moonshot.cn
DEFAULT_MODEL=kimi-k2-0711-preview
TEMPERATURE=0.7
```

### 4. 启动服务

```bash
# 使用启动脚本
./start.sh  # Linux/Mac
# 或
start.bat   # Windows

# 或直接运行
python main.py
```

服务启动后访问：http://127.0.0.1:8000

## API接口

### 1. 创建新风格

```http
POST /api/v1/styles/create
Content-Type: application/json

{
  "raw_content": "# 人工智能的未来\n随着技术发展...",
  "theme_name": "科技极简风",
  "theme_description": "简洁现代，科技感强，使用蓝色调"
}
```

### 2. 应用已有风格

```http
POST /api/v1/styles/apply
Content-Type: application/json

{
  "raw_content": "新的文章内容...",
  "theme_name": "科技极简风"
}
```

### 3. 调整风格

```http
POST /api/v1/styles/adjust
Content-Type: application/json

{
  "theme_name": "科技极简风",
  "adjustment_request": "字体大一点，颜色更鲜艳"
}
```

### 4. 获取所有主题

```http
GET /api/v1/styles/themes
```

### 5. 监控接口

```http
# 健康检查
GET /api/v1/monitor/health

# 统计信息
GET /api/v1/monitor/stats
```

## 开发指南

### 核心概念

1. **风格DNA**：完整的样式配置规则，包含各内容层次的CSS样式
2. **工作流状态**：LangGraph工作流的状态管理
3. **内容解析**：将原始文本解析为结构化内容元素
4. **微信规范验证**：确保生成的HTML符合微信平台要求

### 扩展开发

1. **添加新的内容类型**：在 `ContentElement` 中扩展类型定义
2. **自定义验证规则**：修改 `WeChatValidatorTool` 类
3. **增强风格生成**：优化 `StyleDNAGeneratorChain` 的prompt
4. **数据库升级**：修改 `database.py` 中的连接配置

### 调试模式

设置 `DEBUG=true` 启用：
- 自动重载
- 详细日志输出
- API文档访问：http://127.0.0.1:8000/docs

## 生产部署

1. 设置 `DEBUG=false`
2. 使用PostgreSQL替代SQLite
3. 配置Redis缓存
4. 使用Gunicorn或uWSGI
5. 添加反向代理（Nginx）
6. 配置SSL证书

## 故障排除

### 常见问题

1. **API Key错误**：检查 `.env` 文件中的 `OPENAI_API_KEY`
2. **数据库连接失败**：确认 `DATABASE_URL` 配置正确
3. **端口被占用**：修改 `.env` 中的 `PORT` 配置
4. **依赖安装失败**：确保Python版本>=3.8，使用虚拟环境

### 日志查看

- 应用日志：`style_generation.log`
- 控制台输出：包含详细的执行信息
- 监控接口：`/api/v1/monitor/stats` 查看执行统计

## 许可证

本项目遵循MIT许可证。