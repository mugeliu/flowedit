from src.agents.base_collaborative import BaseCollaborativeAgent
from src.models.schemas import AgentState
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from src.config.settings import settings
from typing import Dict, Any, List, Tuple
import json
import re
from bs4 import BeautifulSoup


class ContentAnalystAgent(BaseCollaborativeAgent):
    """内容分析Agent - 深度优化版本"""
    
    def __init__(self):
        super().__init__("content_analyst")
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            temperature=0.1,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url
        )
        
        self.structure_prompt = PromptTemplate(
            input_variables=["content", "detected_structure"],
            template="""
你是专业的内容结构分析师，需要对内容进行深度结构化分析。

内容：{content}

检测到的初始结构：{detected_structure}

请提供详细的JSON格式分析：
{{
    "structure": {{
        "content_type": "personal_sharing",
        "has_sections": true,
        "section_count": 3,
        "sections": [
            {{
                "number": "01",
                "title": "问题描述",
                "type": "introduction",
                "content_summary": "描述失业话题和现状",
                "paragraph_count": 8,
                "has_quotes": true,
                "quotes_count": 4
            }},
            {{
                "number": "02", 
                "title": "解决方案",
                "type": "main_content",
                "content_summary": "提供实用的解决建议",
                "paragraph_count": 12,
                "has_emphasis": true,
                "has_action_items": true
            }},
            {{
                "number": "03",
                "title": "核心观点",
                "type": "conclusion",
                "content_summary": "核心理念和总结",
                "paragraph_count": 8,
                "has_philosophical_quote": true
            }}
        ],
        "total_paragraphs": 28,
        "has_quotes": true,
        "has_emphasis": true,
        "has_philosophical_content": true,
        "has_action_recommendations": true
    }},
    "content_elements": {{
        "quotes": [
            {{"text": "失业以后，每天窝在出租屋...", "type": "user_voice", "emotion": "negative"}},
            {{"text": "投简历没下文好烦躁...", "type": "user_voice", "emotion": "frustrated"}},
            {{"text": "时间是形而上的首要问题", "type": "philosophical", "emotion": "reflective"}}
        ],
        "emphasis_points": [
            {{"text": "出门，给我出门！", "type": "strong_advice", "importance": "high"}},
            {{"text": "别把自己当成一个失业的人", "type": "core_message", "importance": "critical"}}
        ],
        "action_items": [
            {{"text": "每天固定好「找工作」的时间", "category": "time_management"}},
            {{"text": "把「找工作」当成一项工作", "category": "mindset"}},
            {{"text": "冥想、运动、练字", "category": "self_improvement"}}
        ],
        "tone_analysis": {{
            "overall_tone": "encouraging_personal",
            "emotional_journey": ["empathy", "practical", "inspiring"],
            "target_audience": "unemployed_professionals",
            "writing_style": "conversational_authentic"
        }}
    }},
    "styling_requirements": {{
        "visual_hierarchy": {{
            "section_numbers_prominence": "high",
            "quotes_differentiation": "strong", 
            "emphasis_highlighting": "medium",
            "action_items_clarity": "high"
        }},
        "content_flow": {{
            "needs_section_separation": true,
            "needs_quote_styling": true,
            "needs_emphasis_blocks": true,
            "needs_reading_rhythm": true
        }},
        "emotional_design": {{
            "supportive_colors": true,
            "warm_typography": true,
            "breathing_space": true,
            "encouraging_visual_cues": true
        }}
    }}
}}

分析要求：
1. 准确识别章节标号（01、02、03）
2. 区分不同类型的引用内容（用户声音、哲学思考）
3. 识别强调内容和行动建议
4. 分析情感流转和目标读者
5. 提供具体的视觉设计需求

只输出JSON，不要其他说明文字。
"""
        )
        
        # 内容识别模式
        self.content_patterns = {
            "section_numbers": r'^(0[1-9]|[1-9][0-9]?)$',
            "quotes": [
                r'"([^"]{10,200})"',  # 双引号内容
                r'「([^」]{10,200})」'  # 中文引号内容
            ],
            "emphasis": [
                r'([^，。！？]{5,50}[！]{1,3})',  # 感叹号强调
                r'(给我[^，。！？]{2,20}！)',  # 命令式强调
                r'(别[^，。！？]{5,30})',  # 否定式建议
            ],
            "philosophical": r'["""]([^"""]{20,100})["""]',
            "action_items": [
                r'(每天[^，。]{5,30})',
                r'(建议[^，。]{5,50})',
                r'(推荐[^，。]{5,50})',
            ]
        }
    
    def execute(self, state: AgentState) -> AgentState:
        """执行深度内容分析"""
        try:
            # 内容预处理和清理
            cleaned_content = self._preprocess_content(state.original_content)
            
            # 基础结构检测
            detected_structure = self._detect_basic_structure(cleaned_content)
            
            # LLM深度分析
            deep_analysis = self._perform_deep_analysis(cleaned_content, detected_structure)
            
            # 验证和增强分析结果
            enhanced_analysis = self._enhance_analysis_with_detection(
                deep_analysis, cleaned_content
            )
            
            # 存储结果到协作状态
            state.content_analysis_summary = enhanced_analysis
            state.current_step = "content_analysis_completed"
            
            # 为后续Agent提供详细的协作上下文
            state.collaboration_context["content_features"] = {
                "structure_complexity": enhanced_analysis.get("structure", {}).get("section_count", 0),
                "has_special_elements": any([
                    enhanced_analysis.get("structure", {}).get("has_quotes", False),
                    enhanced_analysis.get("structure", {}).get("has_emphasis", False),
                    enhanced_analysis.get("structure", {}).get("has_action_recommendations", False)
                ]),
                "content_type": enhanced_analysis.get("structure", {}).get("content_type", "general"),
                "emotional_design_needed": enhanced_analysis.get("styling_requirements", {}).get("emotional_design", {}).get("supportive_colors", False),
                "visual_hierarchy_level": "high" if enhanced_analysis.get("styling_requirements", {}).get("visual_hierarchy", {}).get("section_numbers_prominence") == "high" else "medium"
            }
            
            return state
                
        except Exception as e:
            state.errors.append(f"Content analysis failed: {str(e)}")
            state.last_error = str(e)
            state.current_step = "content_analysis_failed"
            return state
    
    def _preprocess_content(self, content: str) -> str:
        """预处理和清理内容"""
        try:
            # 如果是HTML，提取文本内容
            if '<' in content and '>' in content:
                soup = BeautifulSoup(content, 'html.parser')
                
                # 提取文本，保留结构
                paragraphs = []
                for element in soup.find_all(['p', 'span', 'div']):
                    text = element.get_text(strip=True)
                    if text and len(text) > 1:
                        paragraphs.append(text)
                
                cleaned = '\n'.join(paragraphs)
            else:
                cleaned = content
            
            # 清理多余的空白和特殊字符
            cleaned = re.sub(r'\s+', ' ', cleaned)
            cleaned = re.sub(r'\n\s*\n', '\n', cleaned)
            
            return cleaned.strip()
            
        except Exception as e:
            return content  # 如果清理失败，返回原内容
    
    def _detect_basic_structure(self, content: str) -> Dict[str, Any]:
        """检测基础内容结构"""
        structure = {
            "paragraphs": [],
            "section_numbers": [],
            "quotes": [],
            "emphasis_texts": [],
            "action_items": [],
            "total_length": len(content)
        }
        
        try:
            # 按段落分割
            paragraphs = [p.strip() for p in content.split('\n') if p.strip()]
            structure["paragraphs"] = paragraphs
            
            # 检测章节标号
            for para in paragraphs:
                if re.match(self.content_patterns["section_numbers"], para.strip()):
                    structure["section_numbers"].append(para.strip())
            
            # 检测引用内容
            for pattern in self.content_patterns["quotes"]:
                quotes = re.findall(pattern, content)
                structure["quotes"].extend(quotes)
            
            # 检测强调内容
            for pattern in self.content_patterns["emphasis"]:
                emphasis = re.findall(pattern, content)
                structure["emphasis_texts"].extend(emphasis)
            
            # 检测行动建议
            for pattern in self.content_patterns["action_items"]:
                actions = re.findall(pattern, content)
                structure["action_items"].extend(actions)
            
            return structure
            
        except Exception as e:
            return structure
    
    def _perform_deep_analysis(self, content: str, structure: Dict[str, Any]) -> Dict[str, Any]:
        """使用LLM进行深度分析"""
        try:
            # 限制内容长度以避免token超限
            content_preview = content[:3000]
            structure_summary = {
                "detected_sections": len(structure.get("section_numbers", [])),
                "detected_quotes": len(structure.get("quotes", [])),
                "detected_emphasis": len(structure.get("emphasis_texts", [])),
                "paragraph_count": len(structure.get("paragraphs", [])),
                "content_length": structure.get("total_length", 0)
            }
            
            prompt_text = self.structure_prompt.format(
                content=content_preview,
                detected_structure=json.dumps(structure_summary, ensure_ascii=False, indent=2)
            )
            
            response = self.llm.invoke(prompt_text)
            analysis_result = json.loads(response.content)
            
            if isinstance(analysis_result, dict) and "structure" in analysis_result:
                return analysis_result
            else:
                return self._generate_fallback_analysis(structure)
                
        except (json.JSONDecodeError, Exception) as e:
            return self._generate_fallback_analysis(structure)
    
    def _generate_fallback_analysis(self, structure: Dict[str, Any]) -> Dict[str, Any]:
        """生成备用分析结果"""
        section_count = len(structure.get("section_numbers", []))
        has_quotes = len(structure.get("quotes", [])) > 0
        has_emphasis = len(structure.get("emphasis_texts", [])) > 0
        
        return {
            "structure": {
                "content_type": "general",
                "has_sections": section_count > 0,
                "section_count": section_count,
                "total_paragraphs": len(structure.get("paragraphs", [])),
                "has_quotes": has_quotes,
                "has_emphasis": has_emphasis,
                "has_action_recommendations": len(structure.get("action_items", [])) > 0
            },
            "content_elements": {
                "quotes": [{"text": quote, "type": "general", "emotion": "neutral"} 
                          for quote in structure.get("quotes", [])[:5]],
                "emphasis_points": [{"text": emp, "type": "general", "importance": "medium"} 
                                  for emp in structure.get("emphasis_texts", [])[:3]],
                "action_items": [{"text": action, "category": "general"} 
                               for action in structure.get("action_items", [])[:3]]
            },
            "styling_requirements": {
                "visual_hierarchy": {
                    "section_numbers_prominence": "high" if section_count > 0 else "none",
                    "quotes_differentiation": "medium" if has_quotes else "none",
                    "emphasis_highlighting": "medium" if has_emphasis else "none"
                },
                "content_flow": {
                    "needs_section_separation": section_count > 1,
                    "needs_quote_styling": has_quotes,
                    "needs_emphasis_blocks": has_emphasis
                }
            }
        }
    
    def _enhance_analysis_with_detection(self, analysis: Dict[str, Any], 
                                       content: str) -> Dict[str, Any]:
        """用检测结果增强分析"""
        try:
            enhanced = analysis.copy()
            
            # 重新检测关键元素以确保准确性
            content_lower = content.lower()
            
            # 检测哲学性内容
            philosophical_indicators = ['时间', '生活', '人生', '意识', '存在', '思考']
            has_philosophical = any(indicator in content_lower for indicator in philosophical_indicators)
            
            if has_philosophical:
                enhanced["structure"]["has_philosophical_content"] = True
                enhanced["styling_requirements"]["emotional_design"] = {
                    "supportive_colors": True,
                    "warm_typography": True,
                    "breathing_space": True,
                    "encouraging_visual_cues": True
                }
            
            # 检测情感强度
            strong_emotions = ['！', '？', '哀鸿遍野', '拖垮', '焦虑', '内耗']
            emotion_count = sum(content.count(emotion) for emotion in strong_emotions)
            
            if emotion_count > 3:
                enhanced["content_elements"]["emotional_intensity"] = "high"
                enhanced["styling_requirements"]["emotional_design"]["supportive_colors"] = True
            
            # 验证章节检测的准确性
            section_pattern = r'(^|\n)(0[1-9]|[1-9])\s*$'
            actual_sections = re.findall(section_pattern, content, re.MULTILINE)
            if len(actual_sections) != enhanced["structure"].get("section_count", 0):
                enhanced["structure"]["section_count"] = len(actual_sections)
                enhanced["structure"]["has_sections"] = len(actual_sections) > 0
            
            return enhanced
            
        except Exception as e:
            return analysis  # 如果增强失败，返回原分析结果
    
    def validate_preconditions(self, state: AgentState) -> bool:
        """验证执行前置条件"""
        return (
            state.original_content is not None and 
            len(state.original_content.strip()) > 10 and  # 至少10个字符
            state.style_requirements is not None
        )
    
    def validate_output(self, state: AgentState) -> bool:
        """验证输出质量"""
        if not state.content_analysis_summary:
            return False
            
        analysis = state.content_analysis_summary
        return (
            isinstance(analysis, dict) and
            "structure" in analysis and
            "content_elements" in analysis and
            "styling_requirements" in analysis and
            isinstance(analysis["structure"], dict)
        )
    
    def _extract_relevant_input(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输入数据"""
        return {
            "content_length": len(state.original_content),
            "content_type": "html" if "<" in state.original_content else "text",
            "style_requirements": state.style_requirements
        }
    
    def _extract_relevant_output(self, state: AgentState) -> Dict[str, Any]:
        """提取相关输出数据"""
        if not state.content_analysis_summary:
            return {}
        
        analysis = state.content_analysis_summary
        structure = analysis.get("structure", {})
        
        return {
            "content_type": structure.get("content_type", "unknown"),
            "section_count": structure.get("section_count", 0),
            "has_quotes": structure.get("has_quotes", False),
            "has_emphasis": structure.get("has_emphasis", False),
            "total_paragraphs": structure.get("total_paragraphs", 0),
            "complexity_score": self._calculate_complexity_score(analysis)
        }
    
    def _calculate_complexity_score(self, analysis: Dict[str, Any]) -> float:
        """计算内容复杂度分数"""
        score = 0.0
        structure = analysis.get("structure", {})
        
        # 基础分数
        score += 0.2
        
        # 章节加分
        if structure.get("has_sections", False):
            score += 0.3
            score += min(structure.get("section_count", 0) * 0.1, 0.3)
        
        # 特殊元素加分
        if structure.get("has_quotes", False):
            score += 0.2
        if structure.get("has_emphasis", False):
            score += 0.15
        if structure.get("has_action_recommendations", False):
            score += 0.1
        if structure.get("has_philosophical_content", False):
            score += 0.15
        
        return min(score, 1.0)
    
    def get_collaboration_feedback(self, state: AgentState) -> str:
        """为StyleDesigner提供详细反馈"""
        if not state.content_analysis_summary:
            return "内容分析未完成，无法提供反馈"
            
        analysis = state.content_analysis_summary
        structure = analysis.get("structure", {})
        styling = analysis.get("styling_requirements", {})
        
        feedback_parts = []
        
        # 结构相关反馈
        if structure.get("has_sections", False):
            section_count = structure.get("section_count", 0)
            feedback_parts.append(f"检测到{section_count}个章节标号，需要设计突出的章节标记样式")
        
        # 引用相关反馈
        if structure.get("has_quotes", False):
            quotes_data = analysis.get("content_elements", {}).get("quotes", [])
            quote_types = set([q.get("type", "general") for q in quotes_data])
            if len(quote_types) > 1:
                feedback_parts.append("发现多种类型引用（用户声音、哲学思考），建议使用不同颜色边框区分")
            else:
                feedback_parts.append("检测到引用内容，建议使用统一的引用样式")
        
        # 强调内容反馈
        if structure.get("has_emphasis", False):
            emphasis_data = analysis.get("content_elements", {}).get("emphasis_points", [])
            high_importance = [e for e in emphasis_data if e.get("importance") == "high"]
            if high_importance:
                feedback_parts.append("发现高重要性强调内容，建议使用醒目的强调样式")
            else:
                feedback_parts.append("检测到强调内容，建议使用适中的强调样式")
        
        # 情感设计反馈
        emotional_design = styling.get("emotional_design", {})
        if emotional_design.get("supportive_colors", False):
            feedback_parts.append("内容情感强度较高，建议使用温暖支持性的色彩搭配")
        
        # 视觉层次反馈
        visual_hierarchy = styling.get("visual_hierarchy", {})
        if visual_hierarchy.get("section_numbers_prominence") == "high":
            feedback_parts.append("章节标号需要高度突出，建议使用大尺寸、高对比度的设计")
        
        # 内容类型反馈
        content_type = structure.get("content_type", "general")
        if content_type == "personal_sharing":
            feedback_parts.append("个人分享类型内容，建议使用亲和力强的设计风格")
        
        return "; ".join(feedback_parts) if feedback_parts else "标准内容结构，使用常规样式设计"