"""
ContentAnalyst Agent 调试测试文件
用于理解和测试 ContentAnalyst 的工作原理
"""

import sys
import os
import json
from unittest.mock import Mock, patch

# 添加项目路径
sys.path.append(os.path.dirname(__file__))

from src.agents.content_analyst import ContentAnalystAgent
from src.models.schemas import AgentState

def create_test_state(content: str, style_name: str = "包豪斯风格") -> AgentState:
    """创建测试用的AgentState"""
    state = AgentState(
        task_id="test_task_001",
        original_content=content,
        style_requirements={"style_name": style_name}
    )
    return state

def test_html_preprocessing():
    """测试HTML内容预处理功能"""
    print("=== 测试HTML预处理功能 ===")
    
    agent = ContentAnalystAgent()
    
    # 测试HTML内容
    html_content = """
    <div>
        <h1>时间管理的艺术</h1>
        <p>01</p>
        <p>时间是最珍贵的资源，每个人都拥有相同的24小时。</p>
        <p>"时间就是金钱，效率就是生命。"</p>
        <p>02</p>
        <p>制定明确的目标是时间管理的第一步。</p>
        <p><strong>重要提醒：每天早上花5分钟规划当天的任务。</strong></p>
    </div>
    """
    
    cleaned_content = agent._preprocess_content(html_content)
    print("原始HTML内容:")
    print(html_content[:200] + "...")
    print("\n预处理后内容:")
    print(cleaned_content)
    print("\n" + "="*50)

def test_error_handling():
    """测试错误处理机制"""
    print("=== 测试错误处理机制 ===")
    
    agent = ContentAnalystAgent()
    
    print("1. 无效JSON响应测试:")
    invalid_json_state = create_test_state("测试内容足够长")
    
    with patch.object(agent, 'call_llm', return_value="这不是有效的JSON"):
        try:
            invalid_result = agent.execute(invalid_json_state)
            print(f"  执行状态: {invalid_result.current_step}")
            print(f"  错误信息: {invalid_result.errors}")
            print(f"  最后错误: {invalid_result.last_error}")
        except Exception as e:
            print(f"  正确抛出异常: {str(e)}")
    
    print("\n2. 缺少字段的JSON响应测试:")
    incomplete_json = '{"structure": {"title": "test"}}'  # 缺少必要字段
    
    with patch.object(agent, 'call_llm', return_value=incomplete_json):
        try:
            incomplete_result = agent.execute(invalid_json_state)
            print(f"  执行状态: {incomplete_result.current_step}")
            print(f"  错误信息: {incomplete_result.errors}")
        except Exception as e:
            print(f"  正确抛出异常: {str(e)}")
    
    print("\n3. API调用失败测试:")
    with patch.object(agent, 'call_llm', side_effect=Exception("API调用失败")):
        try:
            api_fail_result = agent.execute(invalid_json_state)
            print(f"  执行状态: {api_fail_result.current_step}")
            print(f"  错误信息: {api_fail_result.errors}")
        except Exception as e:
            print(f"  正确抛出异常: {str(e)}")
    
    print("\n" + "="*50)

def test_content_analysis_with_mock():
    """使用Mock测试内容分析功能"""
    print("=== 测试内容分析功能 (Mock GPT-4) ===")
    
    # 模拟GPT-4返回的分析结果
    mock_gpt4_response = json.dumps({
        "structure": {
            "content_type": "personal_advice",
            "total_sections": 2,
            "title": "时间管理的艺术",
            "sections": [
                {
                    "section_number": "01",
                    "title": "时间的价值",
                    "content_type": "philosophical_reflection",
                    "emotional_tone": "motivational",
                    "key_elements": ["quote", "philosophy"]
                },
                {
                    "section_number": "02", 
                    "title": "目标制定",
                    "content_type": "practical_advice",
                    "emotional_tone": "instructional",
                    "key_elements": ["action_call", "emphasis"]
                }
            ]
        },
        "content_elements": {
            "quotes": [
                {
                    "text": "时间就是金钱，效率就是生命。",
                    "emotional_category": "motivational",
                    "context": "关于时间价值的经典表述"
                }
            ],
            "emphasis_points": [
                {
                    "text": "每天早上花5分钟规划当天的任务",
                    "importance_level": "high",
                    "type": "action_call"
                }
            ],
            "action_recommendations": [
                {
                    "text": "制定明确的目标",
                    "category": "time_management",
                    "practicality": "high"
                }
            ],
            "author_info": {
                "text": "",
                "type": "none"
            }
        },
        "visual_design_needs": {
            "hierarchy_requirements": {
                "title_prominence": "high",
                "section_differentiation": "strong",
                "quote_styling": "distinctive", 
                "emphasis_treatment": "highlight"
            },
            "bauhaus_features_needed": {
                "geometric_elements": True,
                "color_coding": True,
                "structured_layouts": True,
                "typography_hierarchy": True
            }
        }
    }, ensure_ascii=False)
    
    # 创建测试状态
    test_content = """
    时间管理的艺术
    
    01
    时间是最珍贵的资源，每个人都拥有相同的24小时。
    "时间就是金钱，效率就是生命。"
    
    02
    制定明确的目标是时间管理的第一步。
    重要提醒：每天早上花5分钟规划当天的任务。
    """
    
    state = create_test_state(test_content)
    agent = ContentAnalystAgent()
    
    # Mock GPT-4 调用
    with patch.object(agent, 'call_llm', return_value=mock_gpt4_response):
        result_state = agent.execute(state)
    
    print("输入内容:")
    print(test_content)
    print("\n执行状态:")
    print(f"current_step: {result_state.current_step}")
    print(f"错误数量: {len(result_state.errors)}")
    
    print("\n分析结果:")
    if result_state.content_analysis_summary:
        print("结构分析:")
        structure = result_state.content_analysis_summary.get("structure", {})
        print(f"  - 内容类型: {structure.get('content_type')}")
        print(f"  - 章节数量: {structure.get('total_sections')}")
        print(f"  - 标题: {structure.get('title')}")
        
        print("\n内容元素:")
        elements = result_state.content_analysis_summary.get("content_elements", {})
        print(f"  - 引用数量: {len(elements.get('quotes', []))}")
        print(f"  - 强调点数量: {len(elements.get('emphasis_points', []))}")
        print(f"  - 行动建议数量: {len(elements.get('action_recommendations', []))}")
        
        print("\n设计需求:")
        design_needs = result_state.content_analysis_summary.get("visual_design_needs", {})
        bauhaus_features = design_needs.get("bauhaus_features_needed", {})
        needed_features = [k for k, v in bauhaus_features.items() if v]
        print(f"  - 需要的包豪斯特征: {needed_features}")
    
    print("\n协作上下文:")
    context = result_state.collaboration_context.get("content_features", {})
    print(f"  - 结构复杂度: {context.get('structure_complexity')}")
    print(f"  - 有特殊元素: {context.get('has_special_elements')}")
    print(f"  - 内容类型: {context.get('content_type')}")
    
    print("\n" + "="*50)

def test_validation_functions():
    """测试验证功能"""
    print("=== 测试验证功能 ===")
    
    agent = ContentAnalystAgent()
    
    # 测试前置条件验证
    print("1. 前置条件验证测试:")
    
    # 有效状态
    valid_state = create_test_state("这是一个测试内容，长度超过10个字符。")
    valid_result = agent.validate_preconditions(valid_state)
    print(f"  有效状态验证: {valid_result}")
    
    # 无效状态 - 内容太短
    invalid_state = create_test_state("短")
    invalid_result = agent.validate_preconditions(invalid_state)
    print(f"  内容太短验证: {invalid_result}")
    
    # 无效状态 - 缺少style_requirements
    no_style_state = AgentState(
        task_id="test_task_002",
        original_content="测试内容",
        style_requirements={}  # 空的style_requirements
    )
    no_style_result = agent.validate_preconditions(no_style_state)
    print(f"  缺少风格要求验证: {no_style_result}")
    
    print("\n2. 输出验证测试:")
    
    # 有效输出
    state_with_analysis = create_test_state("测试")
    state_with_analysis.content_analysis_summary = {
        "structure": {"total_sections": 1},
        "content_elements": {},
        "visual_design_needs": {}
    }
    valid_output = agent.validate_output(state_with_analysis)
    print(f"  有效输出验证: {valid_output}")
    
    # 无效输出
    state_without_analysis = create_test_state("测试")
    invalid_output = agent.validate_output(state_without_analysis)
    print(f"  无效输出验证: {invalid_output}")
    
    print("\n" + "="*50)

def test_collaboration_feedback():
    """测试协作反馈生成"""
    print("=== 测试协作反馈生成 ===")
    
    agent = ContentAnalystAgent()
    
    # 创建包含分析结果的状态
    state = create_test_state("测试内容")
    state.content_analysis_summary = {
        "structure": {
            "total_sections": 3,
            "content_type": "tutorial"
        },
        "content_elements": {
            "quotes": [{"text": "测试引用1"}, {"text": "测试引用2"}],
            "emphasis_points": [{"text": "重要提醒"}]
        },
        "visual_design_needs": {
            "bauhaus_features_needed": {
                "geometric_elements": True,
                "color_coding": True,
                "structured_layouts": False,
                "typography_hierarchy": True
            }
        }
    }
    
    feedback = agent.get_collaboration_feedback(state)
    print("生成的协作反馈:")
    print(feedback)
    
    print("\n反馈解析:")
    feedback_parts = feedback.split("; ") if feedback else []
    for i, part in enumerate(feedback_parts, 1):
        print(f"  {i}. {part}")
    
    print("\n" + "="*50)

def test_real_content_from_file():
    """使用 test/test.html 的真实内容测试"""
    print("=== 使用真实测试数据测试 ContentAnalyst ===")
    
    # 读取真实测试文件
    try:
        with open('../test/test.html', 'r', encoding='utf-8') as f:
            real_content = f.read()
    except FileNotFoundError:
        print("❌ 找不到测试文件 ../test/test.html")
        return
    
    print("真实测试内容预览:")
    print(real_content[:300] + "..." if len(real_content) > 300 else real_content)
    
    # 创建测试状态
    state = create_test_state(real_content, "包豪斯风格")
    agent = ContentAnalystAgent()
    
    print("\n内容预处理结果:")
    cleaned_content = agent._preprocess_content(real_content)
    print("预处理后的文本内容:")
    print(cleaned_content[:500] + "..." if len(cleaned_content) > 500 else cleaned_content)
    
    # 模拟ContentAnalyst对这个真实内容的分析
    # 注意：这里我们不调用真实的GPT-4，而是模拟一个合理的分析结果
    mock_analysis = {
        "structure": {
            "content_type": "personal_experience_sharing",
            "total_sections": 3,
            "title": "失业一年：那些打不死我的，能不能别再打我了",
            "sections": [
                {
                    "section_number": "01",
                    "title": "失业现状描述",
                    "content_type": "problem_identification",
                    "emotional_tone": "empathetic_understanding",
                    "key_elements": ["quotes", "common_struggles"]
                },
                {
                    "section_number": "02", 
                    "title": "应对方法建议",
                    "content_type": "practical_solutions",
                    "emotional_tone": "encouraging_guidance",
                    "key_elements": ["action_recommendations", "time_management"]
                },
                {
                    "section_number": "03",
                    "title": "心态调整思考",
                    "content_type": "mindset_transformation", 
                    "emotional_tone": "philosophical_reflection",
                    "key_elements": ["quotes", "identity_redefinition"]
                }
            ]
        },
        "content_elements": {
            "quotes": [
                {
                    "text": "失业以后，每天窝在出租屋，日夜颠倒，精神越来越萎靡，好像突然不知道该干嘛了。",
                    "emotional_category": "frustrated",
                    "context": "描述失业状态的典型表现"
                },
                {
                    "text": "我不知道自己要干嘛，我也不知道我自己想干嘛。",
                    "emotional_category": "confused",
                    "context": "表达内心的迷茫"
                },
                {
                    "text": "时间是形而上的首要问题。",
                    "emotional_category": "philosophical",
                    "context": "对时间本质的哲学思考"
                }
            ],
            "emphasis_points": [
                {
                    "text": "不要总在屋子里待着，出门，给我出门！下雨都给我打伞出门！",
                    "importance_level": "critical",
                    "type": "action_call"
                },
                {
                    "text": "别把自己当成一个失业的人",
                    "importance_level": "high", 
                    "type": "core_message"
                },
                {
                    "text": "先去找到状态，找到自己，这比找到工作更为重要",
                    "importance_level": "critical",
                    "type": "life_philosophy"
                }
            ],
            "action_recommendations": [
                {
                    "text": "每天固定好「找工作」的时间",
                    "category": "time_management",
                    "practicality": "high"
                },
                {
                    "text": "把「找工作」当成一项工作，到点下班，到周末就休息",
                    "category": "work_life_balance",
                    "practicality": "high"
                },
                {
                    "text": "冥想、运动、练字。这些都对训练专注力有用",
                    "category": "skill_development", 
                    "practicality": "high"
                }
            ],
            "author_info": {
                "text": "我是皮皮疏，沪漂10年，目前失业中。这是第89篇原创文",
                "type": "personal_introduction"
            }
        },
        "visual_design_needs": {
            "hierarchy_requirements": {
                "title_prominence": "very_high",
                "section_differentiation": "strong_numbered_sections",
                "quote_styling": "emotional_differentiation",
                "emphasis_treatment": "strong_action_highlights"
            },
            "bauhaus_features_needed": {
                "geometric_elements": True,
                "color_coding": True,
                "structured_layouts": True, 
                "typography_hierarchy": True
            }
        }
    }
    
    print(f"\n=== 模拟的 ContentAnalyst 分析结果 ===")
    
    # 使用Mock测试
    with patch.object(agent, 'call_llm', return_value=json.dumps(mock_analysis, ensure_ascii=False)):
        result_state = agent.execute(state)
    
    print(f"执行状态: {result_state.current_step}")
    print(f"是否成功: {result_state.current_step == 'content_analysis_completed'}")
    print(f"错误数量: {len(result_state.errors)}")
    
    if result_state.content_analysis_summary:
        analysis = result_state.content_analysis_summary
        
        print(f"\n📊 内容结构分析:")
        structure = analysis["structure"]
        print(f"  - 内容类型: {structure['content_type']}")
        print(f"  - 文章标题: {structure['title']}")
        print(f"  - 章节数量: {structure['total_sections']}")
        
        print(f"\n  章节详情:")
        for i, section in enumerate(structure['sections'], 1):
            print(f"    第{i}节 ({section['section_number']}): {section['title']}")
            print(f"           类型: {section['content_type']}, 情感: {section['emotional_tone']}")
        
        print(f"\n🎯 内容元素识别:")
        elements = analysis["content_elements"]
        print(f"  - 识别到 {len(elements['quotes'])} 个引用:")
        for i, quote in enumerate(elements['quotes'], 1):
            print(f"    {i}. \"{quote['text'][:50]}...\" [{quote['emotional_category']}]")
        
        print(f"  - 识别到 {len(elements['emphasis_points'])} 个强调点:")
        for i, emp in enumerate(elements['emphasis_points'], 1):
            print(f"    {i}. {emp['text'][:50]}... [{emp['importance_level']}]")
        
        print(f"  - 识别到 {len(elements['action_recommendations'])} 个行动建议:")
        for i, action in enumerate(elements['action_recommendations'], 1):
            print(f"    {i}. {action['text'][:50]}... [{action['category']}]")
        
        print(f"\n🎨 视觉设计需求:")
        design_needs = analysis["visual_design_needs"]
        hierarchy = design_needs["hierarchy_requirements"]
        print(f"  - 标题突出需求: {hierarchy['title_prominence']}")
        print(f"  - 章节区分需求: {hierarchy['section_differentiation']}")
        print(f"  - 引用样式需求: {hierarchy['quote_styling']}")
        print(f"  - 强调处理需求: {hierarchy['emphasis_treatment']}")
        
        bauhaus_features = design_needs["bauhaus_features_needed"]
        needed_features = [k for k, v in bauhaus_features.items() if v]
        print(f"  - 需要的包豪斯特征: {needed_features}")
    
    print(f"\n🤝 协作上下文:")
    context = result_state.collaboration_context.get("content_features", {})
    for key, value in context.items():
        print(f"  - {key}: {value}")
    
    print(f"\n📢 给 StyleDesigner 的协作反馈:")
    feedback = agent.get_collaboration_feedback(result_state)
    print(f"  {feedback}")
    
    print(f"\n💡 这个分析的意义:")
    print(f"  - StyleDesigner 将基于这个分析设计 {structure['total_sections']} 种不同的章节颜色")
    print(f"  - 将为 {len(elements['quotes'])} 个引用设计不同的边框样式")
    print(f"  - 将为 {len(elements['emphasis_points'])} 个强调点设计突出的背景样式")
    print(f"  - 整体采用包豪斯的几何化、结构化设计语言")
    
    print("\n" + "="*50)

def test_edge_cases():
    """测试边界情况"""
    print("=== 测试边界情况 ===")
    
    agent = ContentAnalystAgent()
    
    # 测试1: 空内容
    print("1. 空内容测试:")
    empty_state = create_test_state("")
    empty_result = agent.validate_preconditions(empty_state)
    print(f"  空内容验证结果: {empty_result}")
    
    # 测试2: 纯HTML标签
    print("\n2. 纯HTML标签测试:")
    html_only = "<div><p></p></div>"
    html_state = create_test_state(html_only)
    cleaned_html = agent._preprocess_content(html_only)
    print(f"  清理后内容: '{cleaned_html}'")
    
    # 测试3: 特殊字符内容
    print("\n3. 特殊字符测试:")
    special_content = "测试内容包含特殊字符：@#$%^&*()，以及emoji😀🎉"
    special_cleaned = agent._preprocess_content(special_content)
    print(f"  特殊字符内容: {special_cleaned}")
    
    # 测试4: 无效JSON响应处理
    print("\n4. 无效JSON响应处理测试:")
    invalid_json_state = create_test_state("测试内容足够长")
    
    with patch.object(agent, 'call_llm', return_value="这不是有效的JSON"):
        try:
            invalid_result = agent.execute(invalid_json_state)
            print(f"  执行状态: {invalid_result.current_step}")
            print(f"  是否正确处理错误: {invalid_result.current_step == 'content_analysis_failed'}")
            print(f"  错误信息: {invalid_result.last_error}")
        except Exception as e:
            print(f"  异常处理: {str(e)}")
    
    print("\n" + "="*50)

def main():
    """主测试函数"""
    print("ContentAnalyst Agent 调试测试")
    print("="*60)
    
    try:
        # 首先测试真实数据
        test_real_content_from_file()
        
        # 然后运行其他测试
        test_html_preprocessing()
        test_error_handling()
        test_validation_functions()
        test_collaboration_feedback()
        test_content_analysis_with_mock()
        test_edge_cases()
        
        print("\n🎉 所有测试完成！")
        print("\nContentAnalyst工作原理总结:")
        print("1. 接收原始内容 → 2. HTML预处理 → 3. GPT-4深度分析")
        print("4. 结构化输出验证 → 5. 协作上下文设置 → 6. 反馈生成")
        print("7. 失败时直接抛出错误，不使用无意义的备用结果")
        
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()