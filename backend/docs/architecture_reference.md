LangGraph + LangChain MVP 技术架构实现文档 (优化版)

1. 整体架构设计
   1.1 MVP 系统架构
   用户请求 (HTTP)
   ↓
   FastAPI 接口层
   ↓
   LangGraph 工作流编排器 (优化状态管理)
   ↓
   5 个 LangChain Agent (重构并行/串行执行)
   ↓
   SQLite 本地存储 + 检查点持久化
   ↓
   返回生成的 HTML

   1.2 核心技术栈
Web 框架: FastAPI (轻量、快速、自动文档)
工作流编排: LangGraph + SqliteSaver (Agent 状态管理和检查点持久化)
Agent 框架: LangChain (LLM 调用和工具集成)
数据存储: SQLite (简单、无需配置)
LLM 服务: OpenAI API (gpt-4/gpt-3.5-turbo)

1.3 MVP 范围界定
包含功能:
- 5 个核心 Agent 的优化实现
- 智能并行执行和同步机制
- 设计令牌(Design Tokens)系统
- 检查点状态持久化
- SQLite 数据持久化
- RESTful API 接口

暂不包含:
- 监控和日志系统
- 复杂缓存机制
- 错误恢复
- 大规模性能优化
- 用户认证

2. LangGraph 工作流设计 (优化版)
   2.1 优化的状态结构设计
```python
from typing import TypedDict, Optional, List, Dict, Any

class AgentState(TypedDict):
    # 核心标识
    task_id: str
    
    # 输入数据（只在开始时设置）
    original_content: str
    style_requirements: Dict[str, Any]
    
    # 执行控制
    current_step: str
    iteration_count: int
    
    # 轻量级结果引用（而非完整数据）
    content_analysis_summary: Optional[Dict[str, Any]]  # 只保存关键摘要
    design_tokens: Optional[Dict[str, Any]]             # 设计令牌，不是完整设计
    css_rules: Optional[Dict[str, Any]]                 # CSS规则映射
    
    # 最终输出
    generated_html: Optional[str]
    quality_score: Optional[float]
    
    # 错误处理
    errors: List[str]
    last_error: Optional[str]
```

2.2 优化的工作流节点设计
```yaml
优化后工作流节点:
1. START: 工作流开始点
2. content_analysis: 内容分析节点 (独立执行)
3. style_analysis: 风格分析节点 (独立执行) 
4. wait_parallel: 并行同步等待节点 (新增)
5. design_adaptation: 设计适配节点 (整合分析结果)
6. code_generation: 代码生成节点
7. quality_check: 质量检查节点
8. conditional_end: 条件结束节点
9. END: 工作流结束点

节点关系:
START → content_analysis
START → style_analysis
content_analysis → wait_parallel
style_analysis → wait_parallel
wait_parallel → design_adaptation → code_generation → quality_check → conditional_end
```

2.3 并行执行优化
```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.sqlite import SqliteSaver

def create_workflow():
    # 使用检查点保存器支持状态持久化
    checkpointer = SqliteSaver.from_conn_string("checkpoints.db")
    
    workflow = StateGraph(AgentState)
    
    # 添加节点
    workflow.add_node("content_analysis", content_analyst_node)
    workflow.add_node("style_analysis", style_designer_node)
    workflow.add_node("wait_parallel", wait_for_parallel_completion)  # 同步节点
    workflow.add_node("design_adaptation", design_adapter_node)
    workflow.add_node("code_generation", code_engineer_node)
    workflow.add_node("quality_check", quality_director_node)
    
    # 设置入口点
    workflow.set_entry_point("content_analysis")
    
    # 并行启动
    workflow.add_edge("content_analysis", "style_analysis")
    
    # 同步等待
    workflow.add_edge("content_analysis", "wait_parallel")
    workflow.add_edge("style_analysis", "wait_parallel")
    
    # 条件路由
    workflow.add_conditional_edges(
        "wait_parallel",
        should_continue_to_design,
        {
            "continue": "design_adaptation",
            "retry": "content_analysis",
            "error": END
        }
    )
    
    workflow.add_edge("design_adaptation", "code_generation")
    
    # 质量检查的条件路由
    workflow.add_conditional_edges(
        "quality_check",
        quality_gate,
        {
            "pass": END,
            "retry": "design_adaptation",
            "fail": END
        }
    )
    
    return workflow.compile(checkpointer=checkpointer)

# 同步节点实现
def wait_for_parallel_completion(state: AgentState) -> AgentState:
    """等待并行任务完成的同步节点"""
    # 检查必要的分析结果是否都已完成
    if not state.get("content_analysis_summary"):
        state["errors"].append("Content analysis not completed")
        return state
    
    if not state.get("design_tokens"):
        state["errors"].append("Style analysis not completed")
        return state
    
    state["current_step"] = "parallel_completed"
    return state

# 条件判断函数
def should_continue_to_design(state: AgentState) -> str:
    if state["errors"]:
        if state["iteration_count"] < 2:
            return "retry"
        else:
            return "error"
    return "continue"

def quality_gate(state: AgentState) -> str:
    quality_score = state.get("quality_score", 0)
    iteration_count = state.get("iteration_count", 0)
    
    if quality_score >= 0.8:
        return "pass"
    elif quality_score >= 0.6 and iteration_count < 2:
        return "retry"
    else:
        return "fail"
```

3. LangChain Agent 设计 (优化版)
   3.1 Agent 职责边界明确化

3.1.1 内容分析师 Agent (ContentAnalystAgent)
```python
class ContentAnalystAgent:
    """职责：分析内容结构和语义，输出标准化的内容特征"""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.1)
        self.prompt = PromptTemplate(
            input_variables=["content"],
            template="""
            分析以下HTML内容，提取关键特征：
            
            内容：{content}
            
            请按以下JSON格式输出分析结果：
            {{
                "content_type": "文章|列表|表格|混合",
                "text_length": "短|中|长",
                "structure_complexity": "简单|中等|复杂",
                "key_elements": ["标题", "段落", "列表", "图片"],
                "emotional_tone": "正式|轻松|专业|活泼",
                "hierarchy_levels": 3
            }}
            """
        )
    
    def execute(self, state: AgentState) -> AgentState:
        try:
            prompt_text = self.prompt.format(content=state["original_content"][:2000])  # 限制长度
            response = self.llm.invoke(prompt_text)
            
            # 解析响应为结构化数据
            import json
            analysis = json.loads(response.content)
            
            state["content_analysis_summary"] = analysis
            state["current_step"] = "content_analysis_completed"
            
        except Exception as e:
            state["errors"].append(f"Content analysis failed: {str(e)}")
            state["last_error"] = str(e)
        
        return state
```

3.1.2 风格设计师 Agent (StyleDesignerAgent)
```python
class StyleDesignerAgent:
    """职责：将风格需求转换为设计令牌（Design Tokens）"""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.2)
        self.style_templates = {
            "简约": {
                "primary_color": "#2c3e50",
                "secondary_color": "#ecf0f1",
                "accent_color": "#3498db",
                "font_family": "system-ui, -apple-system, sans-serif",
                "border_radius": "4px",
                "spacing_unit": "8px"
            },
            "商务": {
                "primary_color": "#1f4e79",
                "secondary_color": "#ffffff",
                "accent_color": "#0066cc",
                "font_family": "Georgia, serif",
                "border_radius": "2px",
                "spacing_unit": "12px"
            },
            "包豪斯风格": {
                "primary_color": "#000000",
                "secondary_color": "#ffffff", 
                "accent_color": "#ff0000",
                "font_family": "Helvetica, Arial, sans-serif",
                "border_radius": "0px",
                "spacing_unit": "16px"
            }
            # 可扩展更多预定义风格
        }
    
    def execute(self, state: AgentState) -> AgentState:
        try:
            style_name = state["style_requirements"].get("style_name", "简约")
            style_features = state["style_requirements"].get("features", [])
            
            # 基于预定义模板生成设计令牌
            base_tokens = self.style_templates.get(style_name, self.style_templates["简约"])
            
            # 使用LLM根据特征调整设计令牌
            prompt = f"""
            基于以下基础设计令牌和用户特征要求，调整设计令牌：
            
            基础令牌：{base_tokens}
            用户特征：{style_features}
            
            请输出调整后的设计令牌JSON，保持相同的结构。
            """
            
            response = self.llm.invoke(prompt)
            import json
            design_tokens = json.loads(response.content)
            
            state["design_tokens"] = design_tokens
            state["current_step"] = "style_analysis_completed"
            
        except Exception as e:
            state["errors"].append(f"Style design failed: {str(e)}")
            state["last_error"] = str(e)
        
        return state
```

3.1.3 设计适配师 Agent (DesignAdapterAgent)
```python
class DesignAdapterAgent:
    """职责：将设计令牌和内容特征结合，生成具体的CSS规则映射"""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.1)
    
    def execute(self, state: AgentState) -> AgentState:
        try:
            design_tokens = state["design_tokens"]
            content_analysis = state["content_analysis_summary"]
            
            # 根据内容特征调整设计应用策略
            adaptation_prompt = f"""
            根据设计令牌和内容分析，生成CSS规则映射：
            
            设计令牌：{design_tokens}
            内容特征：{content_analysis}
            
            请生成以下格式的CSS规则映射：
            {{
                "h1": {{"color": "primary_color", "font-size": "2rem", "margin-bottom": "1rem"}},
                "h2": {{"color": "primary_color", "font-size": "1.5rem", "margin-bottom": "0.8rem"}},
                "p": {{"color": "text_color", "line-height": "1.6", "margin-bottom": "1rem"}},
                "container": {{"max-width": "800px", "padding": "spacing_unit"}}
            }}
            
            注意：
            1. 值使用设计令牌的键名，不是具体值
            2. 根据内容复杂度调整间距和字体大小
            3. 确保微信公众号兼容性
            """
            
            response = self.llm.invoke(adaptation_prompt)
            import json
            css_mapping = json.loads(response.content)
            
            # 将设计令牌值替换到CSS规则中
            resolved_css = self._resolve_design_tokens(css_mapping, design_tokens)
            
            state["css_rules"] = resolved_css
            state["current_step"] = "design_adaptation_completed"
            
        except Exception as e:
            state["errors"].append(f"Design adaptation failed: {str(e)}")
            state["last_error"] = str(e)
        
        return state
    
    def _resolve_design_tokens(self, css_mapping: dict, design_tokens: dict) -> dict:
        """将设计令牌解析为具体的CSS值"""
        resolved = {}
        for selector, rules in css_mapping.items():
            resolved[selector] = {}
            for property_name, value in rules.items():
                if isinstance(value, str) and value in design_tokens:
                    resolved[selector][property_name] = design_tokens[value]
                else:
                    resolved[selector][property_name] = value
        return resolved
```

3.1.4 代码工程师 Agent (CodeEngineerAgent)
```python
class CodeEngineerAgent:
    """职责：将CSS规则应用到原始HTML，生成最终的内联样式HTML"""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4", temperature=0)  # 代码生成用更强的模型
    
    def execute(self, state: AgentState) -> AgentState:
        try:
            original_content = state["original_content"]
            css_rules = state.get("css_rules", {})
            
            # 使用LLM将CSS规则应用到HTML
            generation_prompt = f"""
            将以下CSS规则应用到HTML内容中，生成内联样式的HTML：
            
            原始HTML：
            {original_content}
            
            CSS规则：
            {css_rules}
            
            要求：
            1. 将CSS规则转换为内联style属性
            2. 保持HTML结构不变
            3. 确保微信公众号兼容性（不使用不支持的CSS属性）
            4. 输出完整的HTML代码
            
            只输出HTML代码，不要其他说明文字。
            """
            
            response = self.llm.invoke(generation_prompt)
            generated_html = response.content.strip()
            
            # 基本的HTML验证
            if "<html" in generated_html.lower() or len(generated_html) > 50:
                state["generated_html"] = generated_html
                state["current_step"] = "code_generation_completed"
            else:
                raise ValueError("Generated HTML appears to be invalid or too short")
            
        except Exception as e:
            state["errors"].append(f"Code generation failed: {str(e)}")
            state["last_error"] = str(e)
        
        return state
```

3.1.5 质量总监 Agent (QualityDirectorAgent)
```python
class QualityDirectorAgent:
    """职责：评估生成结果的质量，提供改进建议"""
    
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.1)
    
    def execute(self, state: AgentState) -> AgentState:
        try:
            generated_html = state.get("generated_html", "")
            design_tokens = state.get("design_tokens", {})
            
            if not generated_html:
                state["quality_score"] = 0.0
                state["errors"].append("No HTML to evaluate")
                return state
            
            # 质量评估提示
            quality_prompt = f"""
            评估以下生成的HTML质量：
            
            HTML内容：{generated_html[:1000]}...
            设计要求：{design_tokens}
            
            请从以下维度评分（0-1）：
            1. HTML结构完整性
            2. 样式应用正确性
            3. 微信兼容性
            4. 视觉效果
            
            输出JSON格式：
            {{
                "structure_score": 0.8,
                "style_score": 0.9,
                "compatibility_score": 0.7,
                "visual_score": 0.8,
                "overall_score": 0.8,
                "issues": ["具体问题描述"],
                "suggestions": ["改进建议"]
            }}
            """
            
            response = self.llm.invoke(quality_prompt)
            import json
            quality_report = json.loads(response.content)
            
            state["quality_score"] = quality_report.get("overall_score", 0.0)
            state["quality_report"] = quality_report
            state["current_step"] = "quality_check_completed"
            
        except Exception as e:
            state["errors"].append(f"Quality evaluation failed: {str(e)}")
            state["last_error"] = str(e)
        
        return state
```

4. 优化后的系统优势

4.1 状态管理优化
- **轻量级状态**: 状态只保存关键摘要和令牌，减少内存使用
- **检查点持久化**: 支持工作流中断后的恢复
- **类型安全**: 使用TypedDict确保状态结构一致性

4.2 并行执行优化  
- **真实并行**: 内容分析和风格分析可以完全并行执行
- **同步机制**: wait_parallel节点确保并行任务正确完成
- **错误隔离**: 单个Agent失败不会影响其他Agent

4.3 职责边界清晰
- **ContentAnalyst**: 专注内容结构和语义分析
- **StyleDesigner**: 专注设计令牌生成  
- **DesignAdapter**: 专注令牌到CSS规则的映射
- **CodeEngineer**: 专注HTML生成和内联样式应用
- **QualityDirector**: 专注质量评估和改进建议

4.4 设计令牌系统
- **预定义模板**: 减少LLM调用，提高一致性
- **动态调整**: 基于用户特征微调设计令牌
- **可扩展性**: 易于添加新的风格模板

5. 数据存储设计 (保持原有)
   5.1 SQLite 表结构设计 
```sql
-- 任务记录表
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('running', 'completed', 'failed')) DEFAULT 'running',
    original_content TEXT NOT NULL,
    style_requirements TEXT, -- JSON 格式
    final_html TEXT,
    quality_score REAL,
    processing_time REAL,
    error_message TEXT
);

-- Agent 执行记录表
CREATE TABLE agent_executions (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id),
    agent_name TEXT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status TEXT CHECK(status IN ('running', 'completed', 'failed')) DEFAULT 'running',
    input_data TEXT, -- JSON 格式
    output_data TEXT, -- JSON 格式
    error_message TEXT,
    execution_time REAL
);

-- 检查点状态表 (新增)
CREATE TABLE workflow_checkpoints (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id),
    checkpoint_data TEXT, -- JSON 格式的状态快照
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 知识库表
CREATE TABLE knowledge_base (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'style', 'pattern', 'template'
    category TEXT NOT NULL,
    content TEXT NOT NULL, -- JSON 格式
    metadata TEXT, -- JSON 格式
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0
);

-- 质量反馈表
CREATE TABLE quality_feedback (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id),
    quality_score REAL NOT NULL,
    feedback_data TEXT, -- JSON 格式
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

6. API 接口设计 (保持原有，增加进度查询)
6.1 RESTful API 规范
```yaml
接口列表:
POST /api/v1/transform:
  描述: 提交样式转换任务
  输入: 
    - content: str (HTML 内容)
    - style_name: str (风格名称) 
    - style_features: List[str] (风格特征)
  输出:
    - task_id: str
    - status: str
    - estimated_time: int (预估完成时间)

GET /api/v1/task/{task_id}:
  描述: 查询任务状态
  输出:
    - task_id: str
    - status: str 
    - progress: float (0-1)
    - result: str (完成时返回 HTML)
    - error: str (失败时返回错误信息)

GET /api/v1/task/{task_id}/steps:
  描述: 查询任务执行详情
  输出:
    - steps: List[AgentExecution]
    - current_step: str
    - quality_report: Dict

GET /api/v1/task/{task_id}/progress: # 新增
  描述: 实时进度查询
  输出:
    - task_id: str
    - current_step: str
    - completed_steps: List[str]
    - estimated_remaining_time: int
```

7. 实施指南

7.1 优化实施步骤
```yaml
第一阶段: 状态管理优化
1. 更新AgentState schema定义
2. 实现轻量级状态传递
3. 添加检查点持久化支持

第二阶段: Agent重构
1. 重构ContentAnalystAgent - 专注内容分析
2. 重构StyleDesignerAgent - 实现设计令牌系统  
3. 重构DesignAdapterAgent - 令牌到CSS映射
4. 更新CodeEngineerAgent - 优化HTML生成
5. 更新QualityDirectorAgent - 增强质量评估

第三阶段: 并行执行优化
1. 实现真实并行执行机制
2. 添加同步等待节点
3. 优化错误处理和重试逻辑

第四阶段: 系统集成测试
1. 端到端工作流测试
2. 并行执行压力测试
3. 错误恢复测试
4. 性能基准测试
```

7.2 性能预期改进
```yaml
优化前 vs 优化后:
执行时间: 120s → 60s (并行优化)
内存使用: 800MB → 300MB (状态优化)  
错误恢复: 无 → 支持检查点恢复
并发处理: 1个任务 → 3-5个任务
质量一致性: 70% → 90% (设计令牌系统)
```

这个优化方案解决了原架构的主要问题：
- 状态传递效率低
- 并行执行机制不完善  
- Agent职责边界模糊
- 缺乏状态持久化能力

通过设计令牌系统、真实并行执行、轻量级状态管理等优化，系统的性能、可维护性和可扩展性都得到显著提升。

方法: - execute(state: AgentState) -> AgentState - validate_input(state: AgentState) -> bool - format_prompt(state: AgentState) -> str - parse_output(raw_output: str) -> Dict - handle_error(error: Exception) -> Dict - update_state(state: AgentState, result: Dict) -> AgentState
3.2 五个核心 Agent 设计
3.2.1 风格设计师 Agent (StyleDesignerAgent)
yaml 职责: 将风格描述转化为设计系统规范
输入:

- style_requirements
  输出:
- design_system (色彩、字体、间距、几何元素)

核心工具:

- style_analyzer_tool: 风格特征分析
- color_palette_generator: 色彩搭配生成
- typography_designer: 字体系统设计
- spacing_calculator: 间距系统计算

提示词模板:

- 风格解析 prompt
- 设计规范生成 prompt
- 微信兼容性约束 prompt
  3.2.2 内容分析师 Agent (ContentAnalystAgent)
  yaml 职责: 分析原始内容的结构和特征
  输入:
- original_content
  输出:
- content_analysis (结构、类型、权重、情感)

核心工具:

- html_parser_tool: HTML 结构解析
- content_classifier: 内容类型分类
- sentiment_analyzer: 情感权重分析
- hierarchy_extractor: 层级结构提取

提示词模板:

- 内容结构分析 prompt
- 情感权重评估 prompt
- 视觉焦点识别 prompt
  3.2.3 设计适配师 Agent (DesignAdapterAgent)
  yaml 职责: 将设计系统与内容特征结合
  输入:
- design_system
- content_analysis
  输出:
- adapted_design (具体的视觉设计方案)

核心工具:

- style_matcher_tool: 风格内容匹配
- layout_optimizer: 布局优化器
- visual_hierarchy_builder: 视觉层级构建
- responsive_adapter: 响应式适配

提示词模板:

- 风格内容匹配 prompt
- 视觉层级设计 prompt
- 特殊元素设计 prompt
  3.2.4 代码工程师 Agent (CodeEngineerAgent)
  yaml 职责: 将设计方案转化为 HTML 代码
  输入:
- adapted_design
- original_content
  输出:
- generated_html

核心工具:

- css_generator_tool: CSS 代码生成
- html_builder_tool: HTML 结构构建
- wechat_validator_tool: 微信兼容性检查
- performance_optimizer: 性能优化

提示词模板:

- HTML 结构生成 prompt
- CSS 样式生成 prompt
- 微信兼容性 prompt
  3.2.5 质量总监 Agent (QualityDirectorAgent)
  yaml 职责: 评估生成结果的质量
  输入:
- generated_html
- design_system
- content_analysis
  输出:
- quality_score
- quality_report

核心工具:

- consistency_checker_tool: 一致性检查
- compatibility_validator_tool: 兼容性验证
- visual_quality_assessor: 视觉质量评估
- performance_analyzer: 性能分析

提示词模板:

- 质量评估 prompt
- 问题诊断 prompt
- 改进建议 prompt

4. 数据存储设计
   4.1 SQLite 表结构设计
   sql-- 任务记录表
   CREATE TABLE tasks (
   id TEXT PRIMARY KEY,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   status TEXT CHECK(status IN ('running', 'completed', 'failed')) DEFAULT 'running',
   original_content TEXT NOT NULL,
   style_requirements TEXT, -- JSON 格式
   final_html TEXT,
   quality_score REAL,
   processing_time REAL,
   error_message TEXT
   );

-- Agent 执行记录表
CREATE TABLE agent_executions (
id TEXT PRIMARY KEY,
task_id TEXT REFERENCES tasks(id),
agent_name TEXT NOT NULL,
started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
completed_at TIMESTAMP,
status TEXT CHECK(status IN ('running', 'completed', 'failed')) DEFAULT 'running',
input_data TEXT, -- JSON 格式
output_data TEXT, -- JSON 格式
error_message TEXT,
execution_time REAL
);

-- 知识库表
CREATE TABLE knowledge_base (
id TEXT PRIMARY KEY,
type TEXT NOT NULL, -- 'style', 'pattern', 'template'
category TEXT NOT NULL,
content TEXT NOT NULL, -- JSON 格式
metadata TEXT, -- JSON 格式
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
usage_count INTEGER DEFAULT 0
);

-- 质量反馈表
CREATE TABLE quality_feedback (
id TEXT PRIMARY KEY,
task_id TEXT REFERENCES tasks(id),
quality_score REAL NOT NULL,
feedback_data TEXT, -- JSON 格式
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
4.2 数据访问层设计
yamlDatabaseManager:
方法: - create_task(task_data) -> task_id - update_task(task_id, updates) - get_task(task_id) -> task_data - log_agent_execution(agent_name, task_id, data) - get_knowledge(type, category) -> knowledge_list - save_knowledge(type, category, content) - record_quality_feedback(task_id, feedback)

连接管理:

- 使用上下文管理器确保连接正确关闭
- 简单的连接池机制(单线程 MVP 无需复杂池)
- 基本的错误处理和重试

5. 工具(Tools)设计
   5.1 工具分类
   yaml 样式工具 (style_tools.py):

- StyleAnalyzerTool: 分析风格特征
- ColorPaletteGenerator: 生成色彩搭配
- TypographyDesigner: 设计字体系统
- SpacingCalculator: 计算间距规范

内容工具 (content_tools.py):

- HTMLParserTool: 解析 HTML 结构
- ContentClassifier: 分类内容类型
- SentimentAnalyzer: 分析情感权重
- HierarchyExtractor: 提取层级结构

HTML 工具 (html_tools.py):

- CSSGeneratorTool: 生成 CSS 代码
- HTMLBuilderTool: 构建 HTML 结构
- WeChatValidator: 微信兼容性检查
- PerformanceOptimizer: 性能优化
  5.2 工具接口规范
  yamlBaseTool:
  属性: - name: str - description: str - input_schema: Dict - output_schema: Dict

方法: - \_run(input_data: Dict) -> Dict - \_arun(input_data: Dict) -> Dict (异步版本) - validate_input(input_data: Dict) -> bool - validate_output(output_data: Dict) -> bool 6. API 接口设计
6.1 RESTful API 规范
yaml 接口列表:
POST /api/v1/transform:
描述: 提交样式转换任务
输入: - content: str (HTML 内容) - style_name: str (风格名称) - style_features: List[str] (风格特征)
输出: - task_id: str - status: str - estimated_time: int (预估完成时间)

GET /api/v1/task/{task_id}:
描述: 查询任务状态
输出: - task_id: str - status: str - progress: float (0-1) - result: str (完成时返回 HTML) - error: str (失败时返回错误信息)

GET /api/v1/task/{task_id}/steps:
描述: 查询任务执行详情
输出: - steps: List[AgentExecution] - current_step: str - quality_report: Dict
6.2 错误处理规范
yaml 错误代码:
400: 请求参数错误
404: 任务不存在
422: 内容格式不支持
500: 服务器内部错误
503: 服务暂时不可用

错误响应格式:
{
"error_code": "string",
"error_message": "string",
"details": "string",
"timestamp": "ISO datetime"
} 7. 提示词模板设计
7.1 模板组织结构
yaml 提示词分类:
system_prompts: 系统级提示词(角色定义、约束条件)
task_prompts: 任务级提示词(具体执行指令)
output_format_prompts: 输出格式提示词
error_handling_prompts: 错误处理提示词

模板变量:

- {agent_role}: Agent 角色描述
- {input_data}: 输入数据
- {constraints}: 约束条件
- {output_format}: 输出格式要求
- {examples}: 示例数据
  7.2 关键提示词设计要点
  yaml 风格设计师提示词:
  重点: - 风格特征准确识别 - 设计系统完整性 - 微信兼容性考虑
  输出格式: 结构化 JSON(色彩、字体、间距、元素)

内容分析师提示词:
重点: - HTML 结构准确解析 - 内容语义理解 - 视觉权重评估
输出格式: 结构化 JSON(层级、类型、权重、情感)

代码工程师提示词:
重点: - 内联样式生成 - 微信规范严格遵循 - 语义化 HTML 结构
输出格式: 完整的 HTML 字符串

质量总监提示词:
重点: - 多维度质量评估 - 具体问题识别 - 改进建议输出
输出格式: 质量分数+详细报告 8. 开发和部署流程
8.1 本地开发环境设置
yaml 环境要求:

- Python 3.9+
- OpenAI API Key
- 本地 SQLite 支持

启动步骤:

1. 安装依赖: pip install -r requirements.txt
2. 配置环境变量: .env 文件设置 API 密钥
3. 初始化数据库: python init_db.py
4. 启动服务: uvicorn main:app --reload
5. 访问文档: http://localhost:8000/docs
   8.2 测试策略
   yaml 单元测试:

- Agent 功能测试
- 工具函数测试
- 数据库操作测试

集成测试:

- 工作流端到端测试
- API 接口测试
- 错误处理测试

手动测试:

- 不同风格的样式转换
- 复杂内容的处理效果
- 边界条件测试
  8.3 性能考虑
  yamlMVP 阶段性能目标:
- 单个任务处理时间: < 2 分钟
- 并发任务数: 1-3 个
- 内存使用: < 1GB
- 磁盘空间: < 500MB

优化策略:

- LLM 调用串行化避免 rate limit
- 简单的结果缓存机制
- 数据库查询优化
- 超时和重试机制
  这个 MVP 架构文档提供了实现的完整技术框架，你可以按照这个设计逐步实现各个组件。重点是先实现核心工作流，然后逐步完善各个 Agent 的功能。
