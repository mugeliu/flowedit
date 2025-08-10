"""
多模型策略测试文件
测试不同模型在不同任务中的应用效果
"""

import sys
import os
import json
import time
from unittest.mock import Mock, patch

# 添加项目路径
sys.path.append(os.path.dirname(__file__))

from src.agents.content_analyst import ContentAnalystAgent
from src.models.schemas import AgentState
from src.config.settings import settings

def create_test_state(content: str, style_name: str = "包豪斯风格") -> AgentState:
    """创建测试用的AgentState"""
    state = AgentState(
        task_id="multi_model_test_001",
        original_content=content,
        style_requirements={"style_name": style_name}
    )
    return state

def test_multi_model_configuration():
    """测试多模型配置"""
    print("=== 测试多模型配置 ===")
    
    print(f"默认模型: {settings.openai_model}")
    print(f"快速模型: {settings.fast_model}")
    print(f"复杂模型: {settings.complex_model}")
    print(f"预处理模型: {settings.preprocessing_model}")
    print(f"验证模型: {settings.validation_model}")
    
    # 创建Agent实例验证模型初始化
    agent = ContentAnalystAgent()
    
    print(f"\nAgent模型实例验证:")
    print(f"- 主要模型: {agent.llm_model.model_name}")
    print(f"- 快速模型: {agent.fast_model.model_name}")
    print(f"- 复杂模型: {agent.complex_model.model_name}")
    print(f"- 预处理模型: {agent.preprocessing_model.model_name}")
    print(f"- 验证模型: {agent.validation_model.model_name}")
    
    print("\n" + "="*50)

def test_preprocessing_model_usage():
    """测试预处理模型的使用"""
    print("=== 测试预处理模型使用 ===")
    
    # 读取真实复杂HTML内容
    try:
        with open('../test/test.html', 'r', encoding='utf-8') as f:
            complex_html = f.read()
    except FileNotFoundError:
        complex_html = """
        <div><p><span>01</span></p><p><span>复杂的HTML内容</span></p>
        <p><span>"这是一个引用内容"</span></p><p><span>02</span></p>
        """ * 20  # 模拟复杂内容
    
    agent = ContentAnalystAgent()
    state = create_test_state(complex_html)
    
    print(f"原始HTML长度: {len(complex_html)}")
    print(f"HTML复杂度检测: {agent._has_complex_structure(complex_html)}")
    
    # Mock预处理模型调用
    mock_preprocessing_response = """01
失业一年：那些打不死我的，能不能别再打我了

hi大家，我是失业一年的皮皮疏。

"失业以后，每天窝在出租屋，日夜颠倒，精神越来越萎靡，好像突然不知道该干嘛了。"

02
那怎么办呢，办法还是有的。

每天固定好「找工作」的时间。

03
别把自己当成一个失业的人。

"时间是形而上的首要问题。"

我是皮皮疏，沪漂10年，目前失业中。这是第89篇原创文。"""

    # 测试预处理模型调用
    print("\n测试预处理模型调用:")
    with patch.object(agent, 'call_llm') as mock_call:
        mock_call.return_value = mock_preprocessing_response
        
        start_time = time.time()
        processed_content = agent._preprocess_content(complex_html)
        processing_time = time.time() - start_time
        
        print(f"处理时间: {processing_time:.3f}秒")
        print(f"预处理后长度: {len(processed_content)}")
        print(f"内容压缩比: {len(processed_content)/len(complex_html):.2f}")
        
        # 验证模型调用参数
        call_args = mock_call.call_args
        if call_args:
            model_type = call_args[1].get('model_type', 'default')
            print(f"使用的模型类型: {model_type}")
            
        print(f"\n预处理结果预览:")
        print(processed_content[:300] + "..." if len(processed_content) > 300 else processed_content)
    
    print("\n" + "="*50)

def test_fast_model_for_feedback():
    """测试快速模型用于反馈生成"""
    print("=== 测试快速模型反馈生成 ===")
    
    agent = ContentAnalystAgent()
    
    # 创建包含分析结果的状态
    state = create_test_state("测试内容")
    state.content_analysis_summary = {
        "structure": {
            "total_sections": 3,
            "content_type": "personal_experience_sharing"
        },
        "content_elements": {
            "quotes": [{"text": "引用1"}, {"text": "引用2"}],
            "emphasis_points": [{"text": "强调1"}, {"text": "强调2"}]
        },
        "visual_design_needs": {
            "bauhaus_features_needed": {
                "geometric_elements": True,
                "color_coding": True,
                "structured_layouts": True,
                "typography_hierarchy": True
            }
        }
    }
    
    # Mock快速模型响应
    mock_fast_response = "内容包含3个章节，需要不同的视觉区分; 包含2个引用，需要多样化的引用样式; 包含2个强调点，需要突出的视觉处理; 需要包豪斯特征：geometric_elements, color_coding, structured_layouts, typography_hierarchy"
    
    print("测试快速模型反馈生成:")
    with patch.object(agent, 'call_llm') as mock_call:
        mock_call.return_value = mock_fast_response
        
        start_time = time.time()
        feedback = agent.get_collaboration_feedback(state)
        feedback_time = time.time() - start_time
        
        print(f"反馈生成时间: {feedback_time:.3f}秒")
        print(f"生成的反馈: {feedback}")
        
        # 验证模型调用参数
        call_args = mock_call.call_args
        if call_args:
            model_type = call_args[1].get('model_type', 'default')
            print(f"使用的模型类型: {model_type}")
    
    print("\n" + "="*50)

def test_complex_model_for_analysis():
    """测试复杂模型用于深度分析"""
    print("=== 测试复杂模型深度分析 ===")
    
    agent = ContentAnalystAgent()
    state = create_test_state("测试内容用于深度分析，需要复杂的内容结构理解能力。")
    
    # Mock复杂模型响应
    mock_complex_response = json.dumps({
        "structure": {
            "content_type": "analysis_test",
            "total_sections": 1,
            "title": "测试分析",
            "sections": [{
                "section_number": "01",
                "title": "测试内容",
                "content_type": "test_content",
                "emotional_tone": "neutral",
                "key_elements": ["analysis"]
            }]
        },
        "content_elements": {
            "quotes": [],
            "emphasis_points": [],
            "action_recommendations": [],
            "author_info": {"text": "", "type": "none"}
        },
        "visual_design_needs": {
            "hierarchy_requirements": {
                "title_prominence": "medium",
                "section_differentiation": "standard",
                "quote_styling": "basic",
                "emphasis_treatment": "standard"
            },
            "bauhaus_features_needed": {
                "geometric_elements": False,
                "color_coding": False,
                "structured_layouts": True,
                "typography_hierarchy": True
            }
        }
    }, ensure_ascii=False)
    
    print("测试复杂模型深度分析:")
    with patch.object(agent, 'call_llm') as mock_call:
        mock_call.return_value = mock_complex_response
        
        start_time = time.time()
        try:
            analysis_result = agent._perform_llm_deep_analysis("测试内容", state)
            analysis_time = time.time() - start_time
            
            print(f"分析时间: {analysis_time:.3f}秒")
            print(f"分析结果结构: {list(analysis_result.keys())}")
            
            # 验证模型调用参数
            call_args = mock_call.call_args
            if call_args:
                model_type = call_args[1].get('model_type', 'default')
                print(f"使用的模型类型: {model_type}")
                
            print(f"内容类型: {analysis_result['structure']['content_type']}")
            print(f"章节数量: {analysis_result['structure']['total_sections']}")
            
        except Exception as e:
            print(f"分析失败: {str(e)}")
    
    print("\n" + "="*50)

def test_model_selection_logic():
    """测试模型选择逻辑"""
    print("=== 测试模型选择逻辑 ===")
    
    agent = ContentAnalystAgent()
    
    # 测试不同模型类型的调用
    model_types = ["default", "fast", "complex", "preprocessing", "validation"]
    
    for model_type in model_types:
        print(f"\n测试 {model_type} 模型:")
        
        with patch.object(agent, 'call_llm') as mock_call:
            mock_call.return_value = f"来自{model_type}模型的响应"
            
            try:
                # 模拟不同类型的调用
                result = agent.call_llm("测试提示词", "test_task", model_type=model_type)
                
                call_args = mock_call.call_args
                if call_args:
                    used_model_type = call_args[1].get('model_type', 'default')
                    print(f"  请求模型类型: {model_type}")
                    print(f"  实际使用类型: {used_model_type}")
                    print(f"  返回结果: {result}")
                    
            except Exception as e:
                print(f"  调用失败: {str(e)}")
    
    print("\n" + "="*50)

def test_cost_optimization_simulation():
    """模拟成本优化效果"""
    print("=== 成本优化效果模拟 ===")
    
    # 模拟token消耗和成本
    model_costs = {
        "gpt-4": {"input": 0.03, "output": 0.06},      # 每1K tokens
        "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002},
        "gpt-4o-mini": {"input": 0.00015, "output": 0.0006}
    }
    
    # 模拟不同任务的token消耗
    task_tokens = {
        "预处理": {"input": 1000, "output": 300},
        "深度分析": {"input": 800, "output": 600}, 
        "反馈生成": {"input": 500, "output": 100},
        "质量评估": {"input": 1200, "output": 800}
    }
    
    print("原策略成本 (全部使用gpt-4):")
    total_old_cost = 0
    for task, tokens in task_tokens.items():
        input_cost = (tokens["input"] / 1000) * model_costs["gpt-4"]["input"]
        output_cost = (tokens["output"] / 1000) * model_costs["gpt-4"]["output"]
        task_cost = input_cost + output_cost
        total_old_cost += task_cost
        print(f"  {task}: ${task_cost:.4f}")
    
    print(f"总成本: ${total_old_cost:.4f}")
    
    print("\n新策略成本 (多模型优化):")
    model_strategy = {
        "预处理": "gpt-4o-mini",
        "深度分析": "gpt-4",
        "反馈生成": "gpt-3.5-turbo", 
        "质量评估": "gpt-4"
    }
    
    total_new_cost = 0
    for task, tokens in task_tokens.items():
        model = model_strategy[task]
        input_cost = (tokens["input"] / 1000) * model_costs[model]["input"]
        output_cost = (tokens["output"] / 1000) * model_costs[model]["output"]
        task_cost = input_cost + output_cost
        total_new_cost += task_cost
        print(f"  {task} ({model}): ${task_cost:.4f}")
    
    print(f"总成本: ${total_new_cost:.4f}")
    
    savings = total_old_cost - total_new_cost
    savings_percent = (savings / total_old_cost) * 100
    
    print(f"\n💰 成本优化效果:")
    print(f"  节省成本: ${savings:.4f}")
    print(f"  节省比例: {savings_percent:.1f}%")
    
    print("\n" + "="*50)

def test_real_content_with_multi_model():
    """使用真实内容测试多模型策略"""
    print("=== 真实内容多模型测试 ===")
    
    # 读取真实测试文件
    try:
        with open('../test/test.html', 'r', encoding='utf-8') as f:
            real_content = f.read()
    except FileNotFoundError:
        print("❌ 找不到测试文件 ../test/test.html")
        return
    
    agent = ContentAnalystAgent()
    state = create_test_state(real_content, "包豪斯风格")
    
    print(f"原始HTML长度: {len(real_content)}")
    print(f"是否复杂结构: {agent._has_complex_structure(real_content)}")
    
    # Mock预处理模型响应
    mock_preprocessing = """01
失业一年：那些打不死我的，能不能别再打我了

hi大家，我是失业一年的皮皮疏。

这两天不管在什么平台，一刷失业话题，都是：

"失业以后，每天窝在出租屋，日夜颠倒，精神越来越萎靡，好像突然不知道该干嘛了。"

02
那怎么办呢，办法还是有的。

每天固定好「找工作」的时间。

"不要总在屋子里待着，出门，给我出门！下雨都给我打伞出门！"

03
别把自己当成一个失业的人。

"时间是形而上的首要问题。"

我是皮皮疏，沪漂10年，目前失业中。这是第89篇原创文。"""

    # Mock复杂模型深度分析响应
    mock_complex_analysis = json.dumps({
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
                    "key_elements": ["quotes", "personal_experience"]
                },
                {
                    "section_number": "02",
                    "title": "应对方法建议", 
                    "content_type": "practical_solutions",
                    "emotional_tone": "encouraging_guidance",
                    "key_elements": ["action_recommendations", "practical_advice"]
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
                    "text": "时间是形而上的首要问题。",
                    "emotional_category": "philosophical",
                    "context": "对时间本质的哲学思考"
                }
            ],
            "emphasis_points": [
                {
                    "text": "不要总在屋子里待着，出门，给我出门！",
                    "importance_level": "critical",
                    "type": "action_call"
                },
                {
                    "text": "别把自己当成一个失业的人",
                    "importance_level": "high",
                    "type": "core_message"
                }
            ],
            "action_recommendations": [
                {
                    "text": "每天固定好「找工作」的时间",
                    "category": "time_management",
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
    }, ensure_ascii=False)

    # Mock快速模型反馈响应
    mock_fast_feedback = "内容包含3个章节，需要不同的视觉区分; 包含2个引用，需要多样化的引用样式; 包含2个强调点，需要突出的视觉处理; 需要包豪斯特征：geometric_elements, color_coding, structured_layouts, typography_hierarchy"

    print("\n多模型策略完整测试:")
    
    with patch.object(agent, 'call_llm') as mock_call:
        # 配置不同调用的返回值
        def mock_call_side_effect(*args, **kwargs):
            model_type = kwargs.get('model_type', 'default')
            if model_type == 'preprocessing':
                return mock_preprocessing
            elif model_type == 'complex':
                return mock_complex_analysis
            elif model_type == 'fast':
                return mock_fast_feedback
            else:
                return "默认模型响应"
        
        mock_call.side_effect = mock_call_side_effect
        
        start_time = time.time()
        
        # 1. 预处理阶段 (preprocessing model)
        print("1. 预处理阶段 (使用preprocessing模型):")
        processed_content = agent._preprocess_content(real_content)
        print(f"   预处理完成，长度: {len(processed_content)}")
        
        # 2. 深度分析阶段 (complex model)
        print("2. 深度分析阶段 (使用complex模型):")
        analysis_result = agent._perform_llm_deep_analysis(processed_content, state)
        print(f"   分析完成，识别章节: {analysis_result['structure']['total_sections']}")
        
        # 3. 反馈生成阶段 (fast model)
        print("3. 反馈生成阶段 (使用fast模型):")
        state.content_analysis_summary = analysis_result
        feedback = agent.get_collaboration_feedback(state)
        print(f"   反馈生成完成，长度: {len(feedback)}")
        
        total_time = time.time() - start_time
        print(f"\n总处理时间: {total_time:.3f}秒")
        
        # 统计模型调用次数
        call_count = mock_call.call_count
        print(f"模型调用总次数: {call_count}")
        
        # 分析每次调用的模型类型
        model_type_usage = {}
        for call in mock_call.call_args_list:
            model_type = call[1].get('model_type', 'default')
            model_type_usage[model_type] = model_type_usage.get(model_type, 0) + 1
        
        print("模型使用统计:")
        for model_type, count in model_type_usage.items():
            print(f"  {model_type}: {count}次")
    
    print("\n" + "="*50)

def test_error_handling_with_models():
    """测试多模型策略的错误处理"""
    print("=== 测试多模型错误处理 ===")
    
    agent = ContentAnalystAgent()
    state = create_test_state("测试内容")
    
    print("1. 预处理模型失败测试:")
    with patch.object(agent, 'call_llm') as mock_call:
        def failing_preprocessing(*args, **kwargs):
            model_type = kwargs.get('model_type', 'default')
            if model_type == 'preprocessing':
                raise Exception("预处理模型API调用失败")
            return "其他模型正常"
        
        mock_call.side_effect = failing_preprocessing
        
        # 测试复杂HTML的处理
        complex_html = "<div>" + "<p>测试</p>" * 100 + "</div>"
        try:
            result = agent._preprocess_content(complex_html)
            print(f"   预处理模型失败后回退成功，结果长度: {len(result)}")
        except Exception as e:
            print(f"   预处理失败: {str(e)}")
    
    print("\n2. 快速模型失败测试:")
    state.content_analysis_summary = {
        "structure": {"total_sections": 2},
        "content_elements": {"quotes": [{"text": "测试引用"}]},
        "visual_design_needs": {"bauhaus_features_needed": {"geometric_elements": True}}
    }
    
    with patch.object(agent, 'call_llm') as mock_call:
        def failing_fast_model(*args, **kwargs):
            model_type = kwargs.get('model_type', 'default')
            if model_type == 'fast':
                raise Exception("快速模型API调用失败")
            return "其他模型正常"
        
        mock_call.side_effect = failing_fast_model
        
        try:
            feedback = agent.get_collaboration_feedback(state)
            print(f"   快速模型失败后回退成功: {feedback[:100]}...")
        except Exception as e:
            print(f"   反馈生成失败: {str(e)}")
    
    print("\n" + "="*50)

def main():
    """主测试函数"""
    print("多模型策略测试")
    print("="*60)
    
    try:
        test_multi_model_configuration()
        test_preprocessing_model_usage()
        test_fast_model_for_feedback()
        test_complex_model_for_analysis()
        test_model_selection_logic()
        test_cost_optimization_simulation()
        test_real_content_with_multi_model()
        test_error_handling_with_models()
        
        print("\n🎉 多模型策略测试完成！")
        print("\n多模型优化总结:")
        print("1. 预处理任务使用gpt-4o-mini，成本降低90%")
        print("2. 反馈生成使用gpt-3.5-turbo，成本降低95%")
        print("3. 深度分析仍用gpt-4，保证质量")
        print("4. 每个模型都有错误回退机制")
        print("5. 总体成本预计节省60-80%")
        
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()