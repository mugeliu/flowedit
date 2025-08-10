"""
测试多模型回退策略
验证当环境变量中没有设置特定模型时，系统是否正确回退到主模型
"""

import os
import sys
from unittest.mock import patch

sys.path.append(os.path.dirname(__file__))

def test_model_fallback_scenarios():
    """测试不同的模型回退场景"""
    
    print("=== 测试多模型回退策略 ===")
    
    # 场景1: 只设置主模型，其他模型未设置
    print("\n场景1: 只有主模型配置")
    env_vars_scenario1 = {
        'OPENAI_API_KEY': 'test_key',
        'OPENAI_MODEL': 'gpt-4',
        'OPENAI_BASE_URL': '',
        # 多模型配置全部为空
        'FAST_MODEL': '',
        'COMPLEX_MODEL': '',
        'PREPROCESSING_MODEL': '',
        'VALIDATION_MODEL': ''
    }
    
    with patch.dict(os.environ, env_vars_scenario1, clear=True):
        # 重新导入以应用新的环境变量
        if 'src.config.settings' in sys.modules:
            del sys.modules['src.config.settings']
        
        from src.config.settings import Settings
        test_settings = Settings()
        
        print(f"  主模型: {test_settings.openai_model}")
        print(f"  快速模型: {test_settings.fast_model}")
        print(f"  复杂模型: {test_settings.complex_model}")
        print(f"  预处理模型: {test_settings.preprocessing_model}")
        print(f"  验证模型: {test_settings.validation_model}")
        
        # 验证回退是否正确
        all_same = all([
            test_settings.fast_model == test_settings.openai_model,
            test_settings.complex_model == test_settings.openai_model,
            test_settings.preprocessing_model == test_settings.openai_model,
            test_settings.validation_model == test_settings.openai_model
        ])
        print(f"  ✅ 回退策略正确: {all_same}")
    
    # 场景2: 部分模型有配置
    print("\n场景2: 部分模型有配置")
    env_vars_scenario2 = {
        'OPENAI_API_KEY': 'test_key',
        'OPENAI_MODEL': 'gpt-4',
        'FAST_MODEL': 'gpt-3.5-turbo',
        'PREPROCESSING_MODEL': 'gpt-4o-mini',
        # COMPLEX_MODEL和VALIDATION_MODEL未设置
        'COMPLEX_MODEL': '',
        'VALIDATION_MODEL': ''
    }
    
    with patch.dict(os.environ, env_vars_scenario2, clear=True):
        if 'src.config.settings' in sys.modules:
            del sys.modules['src.config.settings']
        
        from src.config.settings import Settings
        test_settings = Settings()
        
        print(f"  主模型: {test_settings.openai_model}")
        print(f"  快速模型: {test_settings.fast_model}")
        print(f"  复杂模型: {test_settings.complex_model}")
        print(f"  预处理模型: {test_settings.preprocessing_model}")
        print(f"  验证模型: {test_settings.validation_model}")
        
        # 验证部分回退是否正确
        expected_results = {
            "fast_model": "gpt-3.5-turbo",  # 有配置
            "preprocessing_model": "gpt-4o-mini",  # 有配置
            "complex_model": "gpt-4",  # 回退到主模型
            "validation_model": "gpt-4"  # 回退到主模型
        }
        
        results_correct = all([
            test_settings.fast_model == expected_results["fast_model"],
            test_settings.preprocessing_model == expected_results["preprocessing_model"],
            test_settings.complex_model == expected_results["complex_model"],
            test_settings.validation_model == expected_results["validation_model"]
        ])
        print(f"  ✅ 部分回退策略正确: {results_correct}")
    
    # 场景3: 全部模型都有配置
    print("\n场景3: 全部模型都有配置")
    env_vars_scenario3 = {
        'OPENAI_API_KEY': 'test_key',
        'OPENAI_MODEL': 'gpt-4',
        'FAST_MODEL': 'gpt-3.5-turbo',
        'COMPLEX_MODEL': 'gpt-4-turbo',
        'PREPROCESSING_MODEL': 'gpt-4o-mini',
        'VALIDATION_MODEL': 'gpt-3.5-turbo'
    }
    
    with patch.dict(os.environ, env_vars_scenario3, clear=True):
        if 'src.config.settings' in sys.modules:
            del sys.modules['src.config.settings']
        
        from src.config.settings import Settings
        test_settings = Settings()
        
        print(f"  主模型: {test_settings.openai_model}")
        print(f"  快速模型: {test_settings.fast_model}")
        print(f"  复杂模型: {test_settings.complex_model}")
        print(f"  预处理模型: {test_settings.preprocessing_model}")
        print(f"  验证模型: {test_settings.validation_model}")
        
        # 验证配置是否完全独立
        all_different = len(set([
            test_settings.openai_model,
            test_settings.fast_model,
            test_settings.complex_model,
            test_settings.preprocessing_model,
            test_settings.validation_model
        ])) == 4  # 应该有4种不同的模型
        
        print(f"  ✅ 独立配置正确: {all_different}")
    
    # 场景4: 使用第三方API的配置示例
    print("\n场景4: 第三方API配置示例")
    env_vars_scenario4 = {
        'OPENAI_API_KEY': 'moonshot_api_key',
        'OPENAI_MODEL': 'moonshot-v1-8k',
        'OPENAI_BASE_URL': 'https://api.moonshot.cn/v1',
        'FAST_MODEL': 'moonshot-v1-8k',
        'COMPLEX_MODEL': 'moonshot-v1-32k',
        'PREPROCESSING_MODEL': 'moonshot-v1-8k',
        'VALIDATION_MODEL': 'moonshot-v1-8k'
    }
    
    with patch.dict(os.environ, env_vars_scenario4, clear=True):
        if 'src.config.settings' in sys.modules:
            del sys.modules['src.config.settings']
        
        from src.config.settings import Settings
        test_settings = Settings()
        
        print(f"  API端点: {test_settings.openai_base_url}")
        print(f"  主模型: {test_settings.openai_model}")
        print(f"  快速模型: {test_settings.fast_model}")
        print(f"  复杂模型: {test_settings.complex_model}")
        print(f"  预处理模型: {test_settings.preprocessing_model}")
        print(f"  验证模型: {test_settings.validation_model}")
        
        # 验证第三方API配置
        third_party_correct = (
            'moonshot' in test_settings.openai_base_url and
            'moonshot' in test_settings.openai_model and
            'moonshot' in test_settings.complex_model
        )
        print(f"  ✅ 第三方API配置正确: {third_party_correct}")

def test_agent_model_initialization():
    """测试Agent的模型初始化"""
    print("\n=== 测试Agent模型初始化 ===")
    
    # 恢复原始环境
    env_vars = {
        'OPENAI_API_KEY': 'test_key',
        'OPENAI_MODEL': 'gpt-4',
        'FAST_MODEL': 'gpt-3.5-turbo',
        'COMPLEX_MODEL': 'gpt-4-turbo',
        'PREPROCESSING_MODEL': 'gpt-4o-mini',
        'VALIDATION_MODEL': 'gpt-3.5-turbo'
    }
    
    with patch.dict(os.environ, env_vars, clear=True):
        if 'src.config.settings' in sys.modules:
            del sys.modules['src.config.settings']
        if 'src.agents.content_analyst' in sys.modules:
            del sys.modules['src.agents.content_analyst']
        
        from src.agents.content_analyst import ContentAnalystAgent
        
        agent = ContentAnalystAgent()
        
        print("Agent模型实例验证:")
        print(f"  主要模型: {agent.llm_model.model_name}")
        print(f"  快速模型: {agent.fast_model.model_name}")
        print(f"  复杂模型: {agent.complex_model.model_name}")
        print(f"  预处理模型: {agent.preprocessing_model.model_name}")
        print(f"  验证模型: {agent.validation_model.model_name}")
        
        # 验证模型类型正确映射
        model_mapping_correct = (
            agent.fast_model.model_name == 'gpt-3.5-turbo' and
            agent.complex_model.model_name == 'gpt-4-turbo' and
            agent.preprocessing_model.model_name == 'gpt-4o-mini' and
            agent.validation_model.model_name == 'gpt-3.5-turbo'
        )
        print(f"  ✅ 模型映射正确: {model_mapping_correct}")

def main():
    print("多模型回退策略测试")
    print("=" * 60)
    
    try:
        test_model_fallback_scenarios()
        test_agent_model_initialization()
        
        print("\n🎉 多模型回退策略测试完成!")
        print("\n配置策略总结:")
        print("1. 如果.env中配置了特定模型，使用配置的模型")
        print("2. 如果.env中没有配置特定模型，回退到OPENAI_MODEL")
        print("3. 支持完全的第三方API配置")
        print("4. 向后兼容现有的单模型配置")
        print("5. 用户可以选择性启用多模型优化")
        
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()