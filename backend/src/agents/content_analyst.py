from src.agents.base_collaborative import BaseCollaborativeAgent
from src.models.schemas import AgentState
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from src.config.settings import settings
from typing import Dict, Any
import json
from bs4 import BeautifulSoup


class ContentAnalystAgent(BaseCollaborativeAgent):
    """内容分析Agent - 纯大模型驱动版本"""
    
    def __init__(self):
        super().__init__("content_analyst")
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.1,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        
        self.structure_prompt = PromptTemplate(
            input_variables=["content"],
            template="""
你是专业的内容结构分析师，请深度分析以下内容，识别其结构和元素特征。

内容：
{content}

请智能分析这篇内容的结构和元素，输出JSON格式结果：

{{
    "structure": {{
        "content_type": "分析内容类型（如：personal_advice, tutorial, opinion等）",
        "total_sections": "识别的章节数量",
        "title": "提取的文章主标题",
        "sections": [
            {{
                "section_number": "识别的章节标号",
                "title": "章节主题", 
                "content_type": "章节内容类型",
                "emotional_tone": "情感色调",
                "key_elements": ["该章节包含的关键元素类型"]
            }}
        ]
    }},
    
    "content_elements": {{
        "quotes": [
            {{
                "text": "识别的引用文本",
                "emotional_category": "情感分类（如：negative, frustrated, philosophical等）",
                "context": "引用的上下文背景"
            }}
        ],
        "emphasis_points": [
            {{
                "text": "识别的强调文本",
                "importance_level": "重要程度（如：high, critical, medium）",
                "type": "强调类型（如：action_call, core_message, warning等）"
            }}
        ],
        "action_recommendations": [
            {{
                "text": "识别的行动建议文本",
                "category": "建议类型（如：time_management, mindset, skill等）",
                "practicality": "实用性评估"
            }}
        ],
        "author_info": {{
            "text": "识别的作者信息",
            "type": "作者信息类型"
        }}
    }},
    
    "visual_design_needs": {{
        "hierarchy_requirements": {{
            "title_prominence": "标题突出需求",
            "section_differentiation": "章节区分需求",  
            "quote_styling": "引用样式需求",
            "emphasis_treatment": "强调处理需求"
        }},
        "bauhaus_features_needed": {{
            "geometric_elements": "是否需要几何元素",
            "color_coding": "是否需要颜色编码",
            "structured_layouts": "是否需要结构化布局",
            "typography_hierarchy": "是否需要字体层次"
        }}
    }}
}}

请基于内容的实际特点进行智能分析，不要假设任何内容细节。
"""
        )
        
    def execute(self, state: AgentState) -> AgentState:
        """执行深度内容分析 - 完全基于大模型"""
        try:
            # 预处理内容（只做基本清理）
            cleaned_content = self._preprocess_content(state.original_content)
            
            # 直接使用大模型进行全面分析
            deep_analysis = self._perform_llm_deep_analysis(cleaned_content, state)
            
            # 存储结果到协作状态
            state.content_analysis_summary = deep_analysis
            state.current_step = "content_analysis_completed"
            
            # 为后续Agent提供详细的协作上下文
            state.collaboration_context["content_features"] = {
                "structure_complexity": deep_analysis.get("structure", {}).get("total_sections", 0),
                "has_special_elements": bool(deep_analysis.get("content_elements", {})),
                "content_type": deep_analysis.get("structure", {}).get("content_type", "general"),
                "visual_hierarchy_level": "high"
            }
            
            return state
                
        except Exception as e:
            state.errors.append(f"Content analysis failed: {str(e)}")
            state.last_error = str(e)
            state.current_step = "content_analysis_failed"
            return state
    
    def _perform_llm_deep_analysis(self, content: str, state: AgentState) -> Dict[str, Any]:
        """使用复杂模型进行全面智能分析"""
        prompt_text = self.structure_prompt.format(content=content)
        response = self.call_llm(prompt_text, state.task_id, model_type="complex")
        
        try:
            analysis_result = json.loads(response)
            
            # 验证返回结构的完整性
            if not isinstance(analysis_result, dict):
                raise ValueError("GPT-4返回的不是有效的字典格式")
            
            if "structure" not in analysis_result:
                raise ValueError("GPT-4返回结果缺少'structure'字段")
                
            if "content_elements" not in analysis_result:
                raise ValueError("GPT-4返回结果缺少'content_elements'字段")
                
            if "visual_design_needs" not in analysis_result:
                raise ValueError("GPT-4返回结果缺少'visual_design_needs'字段")
            
            return analysis_result
                
        except json.JSONDecodeError as e:
            raise ValueError(f"GPT-4返回的不是有效JSON格式: {str(e)}")
        except Exception as e:
            raise ValueError(f"分析结果验证失败: {str(e)}")
    
    def _preprocess_content(self, content: str) -> str:
        """智能内容预处理 - 使用预处理专用模型"""
        try:
            # 如果是HTML，尝试智能解析
            if '<' in content and '>' in content:
                # 先用代码快速清理
                soup = BeautifulSoup(content, 'html.parser')
                basic_text = soup.get_text()
                
                # 如果内容复杂（长度>500或包含特殊结构），使用LLM增强处理
                if len(basic_text) > 500 or self._has_complex_structure(content):
                    return self._llm_enhanced_preprocessing(content, basic_text)
                else:
                    # 简单内容用代码处理
                    texts = []
                    for element in soup.find_all(['p', 'span', 'div', 'h1', 'h2', 'h3']):
                        text = element.get_text(strip=True)
                        if text:
                            texts.append(text)
                    return '\n'.join(texts)
            return content
        except Exception:
            return content
    
    def _has_complex_structure(self, content: str) -> bool:
        """检测是否为复杂HTML结构"""
        complexity_indicators = [
            content.count('<p>') > 10,  # 段落多
            '<table>' in content,       # 包含表格
            content.count('<span') > 15, # span标签多
            '<section>' in content      # 包含语义结构
        ]
        return any(complexity_indicators)
    
    def _llm_enhanced_preprocessing(self, html_content: str, basic_text: str) -> str:
        """使用预处理模型增强内容清理"""
        preprocessing_prompt = f"""请将以下HTML内容转换为结构清晰的纯文本，保持原有的逻辑结构和段落分割：

HTML内容：
{html_content[:2000]}  # 限制长度避免token超限

要求：
1. 保持章节编号（如01、02、03）
2. 保持引用内容的完整性
3. 去除HTML标签但保持文本结构
4. 每个段落占一行
5. 去除重复内容

请直接输出清理后的纯文本内容："""
        
        try:
            cleaned_text = self.call_llm(preprocessing_prompt, model_type="preprocessing")
            # 验证LLM处理结果的质量
            if len(cleaned_text.strip()) > len(basic_text.strip()) * 0.5:
                return cleaned_text.strip()
            else:
                # 如果LLM结果质量不佳，回退到代码处理
                return basic_text
        except Exception:
            # LLM处理失败时回退到代码处理
            return basic_text
    
    
    def validate_preconditions(self, state: AgentState) -> bool:
        """验证执行前置条件"""
        return (
            state.original_content is not None and 
            len(state.original_content.strip()) > 10 and
            state.style_requirements is not None
        )
    
    def validate_output(self, state: AgentState) -> bool:
        """验证输出质量"""
        return (
            state.content_analysis_summary is not None and
            isinstance(state.content_analysis_summary, dict) and
            "structure" in state.content_analysis_summary
        )
    
    def _extract_relevant_input(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输入数据"""
        return {
            "content_length": len(state.original_content) if state.original_content else 0,
            "style_name": state.style_requirements.get("style_name", ""),
            "has_content": bool(state.original_content and state.original_content.strip())
        }
    
    def _extract_relevant_output(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输出数据"""
        if not state.content_analysis_summary:
            return {}
        
        analysis = state.content_analysis_summary
        return {
            "content_type": analysis.get("structure", {}).get("content_type", "unknown"),
            "sections_count": analysis.get("structure", {}).get("total_sections", 0),
            "quotes_count": len(analysis.get("content_elements", {}).get("quotes", [])),
            "emphasis_count": len(analysis.get("content_elements", {}).get("emphasis_points", [])),
            "has_author_info": bool(analysis.get("content_elements", {}).get("author_info", {}).get("text"))
        }
    
    def get_collaboration_feedback(self, state: AgentState) -> str:
        """为StyleDesigner提供协作反馈 - 使用快速模型生成"""
        if not state.content_analysis_summary:
            return ""
        
        analysis = state.content_analysis_summary
        
        # 使用快速模型生成反馈
        feedback_prompt = f"""基于以下内容分析结果，生成给StyleDesigner的简洁协作反馈：

分析结果：{json.dumps(analysis, ensure_ascii=False, indent=2)}

请生成一句话的协作反馈，格式：内容包含X个章节，需要不同的视觉区分; 包含Y个引用，需要多样化的引用样式; 包含Z个强调点，需要突出的视觉处理; 需要包豪斯特征：具体特征列表

直接输出反馈文本，不要解释："""

        try:
            feedback = self.call_llm(feedback_prompt, state.task_id, model_type="fast")
            return feedback.strip()
        except Exception:
            # 快速模型失败时的代码备选方案
            feedback_parts = []
            
            sections_count = analysis.get("structure", {}).get("total_sections", 0)
            if sections_count > 1:
                feedback_parts.append(f"内容包含{sections_count}个章节，需要不同的视觉区分")
            
            elements = analysis.get("content_elements", {})
            if elements.get("quotes"):
                feedback_parts.append(f"包含{len(elements['quotes'])}个引用，需要多样化的引用样式")
            
            if elements.get("emphasis_points"):
                feedback_parts.append(f"包含{len(elements['emphasis_points'])}个强调点，需要突出的视觉处理")
            
            design_needs = analysis.get("visual_design_needs", {})
            bauhaus_features = design_needs.get("bauhaus_features_needed", {})
            needed_features = [k for k, v in bauhaus_features.items() if v]
            if needed_features:
                feedback_parts.append(f"需要包豪斯特征：{', '.join(needed_features)}")
            
            return "; ".join(feedback_parts) if feedback_parts else "标准内容结构，需要基础包豪斯风格处理"