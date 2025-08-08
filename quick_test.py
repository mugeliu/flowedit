#!/usr/bin/env python3
"""
快速API测试脚本
"""

import requests
import json
import time
from pathlib import Path

def quick_test():
    """快速测试API功能"""
    
    print("=== 快速API功能测试 ===")
    
    # 1. 测试健康检查
    print("1. 测试健康检查...")
    try:
        health_response = requests.get("http://127.0.0.1:8000/api/v1/health", timeout=10)
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"   ✓ 服务状态: {health_data['status']}")
            print(f"   ✓ 活跃任务: {health_data['active_tasks']}")
        else:
            print(f"   ✗ 健康检查失败: {health_response.status_code}")
            return
    except Exception as e:
        print(f"   ✗ 无法连接到服务: {e}")
        return
    
    # 2. 读取测试内容
    print("\n2. 读取测试内容...")
    test_dir = Path("F:/project/flowedit/test")
    try:
        with open(test_dir / "test.html", "r", encoding="utf-8") as f:
            original_content = f.read()
        print(f"   ✓ 原始内容长度: {len(original_content)} 字符")
    except Exception as e:
        print(f"   ✗ 读取测试文件失败: {e}")
        return
    
    # 3. 创建转换任务
    print("\n3. 创建转换任务...")
    try:
        request_data = {
            "content": original_content,
            "style_name": "Bauhaus",
            "style_features": ["geometric", "bold_colors", "minimal_design"]
        }
        
        response = requests.post(
            "http://127.0.0.1:8000/api/v1/transform",
            json=request_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            task_response = response.json()
            task_id = task_response["task_id"]
            print(f"   ✓ 任务创建成功! ID: {task_id}")
            
            # 4. 监控任务进度
            print(f"\n4. 监控任务进度...")
            monitor_quick_progress(task_id)
            
        else:
            print(f"   ✗ 任务创建失败: {response.status_code}")
            print(f"   错误详情: {response.text}")
    
    except Exception as e:
        print(f"   ✗ 任务创建异常: {e}")

def monitor_quick_progress(task_id):
    """快速监控任务进度"""
    
    status_url = f"http://127.0.0.1:8000/api/v1/task/{task_id}"
    max_attempts = 30  # 1分钟，2秒间隔
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(status_url, timeout=10)
            
            if response.status_code == 200:
                task_status = response.json()
                status = task_status["status"]
                progress = task_status["progress"]
                
                print(f"   进度 {attempt + 1}: {status} - {progress:.1f}%")
                
                if status == "completed":
                    result_html = task_status.get("result")
                    if result_html:
                        print(f"   ✓ 任务完成! 生成HTML长度: {len(result_html)} 字符")
                        
                        # 保存结果
                        output_file = Path("F:/project/flowedit/test/quick_test_result.html")
                        with open(output_file, "w", encoding="utf-8") as f:
                            f.write(result_html)
                        print(f"   ✓ 结果已保存到: {output_file}")
                        
                        # 快速质量检查
                        quick_quality_check(result_html)
                        return True
                    else:
                        print("   ✗ 任务完成但没有结果")
                        return False
                
                elif status == "failed":
                    error_msg = task_status.get("error", "未知错误")
                    print(f"   ✗ 任务失败: {error_msg}")
                    return False
                
                elif status == "running":
                    time.sleep(2)
                    continue
            
            else:
                print(f"   ✗ 状态检查失败: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   ✗ 状态检查异常: {e}")
            time.sleep(2)
    
    print("   ✗ 任务监控超时")
    return False

def quick_quality_check(html_content):
    """快速质量检查"""
    
    print(f"\n5. 快速质量检查...")
    
    checks = {
        "包含HTML标签": "<" in html_content and ">" in html_content,
        "包含内联样式": "style=" in html_content,
        "包含章节结构": "<section" in html_content,
        "包含标题": "<h1" in html_content,
        "包含段落": "<p" in html_content,
        "包含颜色样式": any(color in html_content for color in ["#E53E3E", "#3182CE", "#D69E2E"]),
        "包含字体设置": "font-family:" in html_content,
        "包含边框样式": "border" in html_content,
    }
    
    passed_checks = 0
    for check, result in checks.items():
        status = "✓" if result else "✗"
        print(f"   {status} {check}")
        if result:
            passed_checks += 1
    
    success_rate = passed_checks / len(checks) * 100
    print(f"\n   质量检查通过率: {success_rate:.1f}% ({passed_checks}/{len(checks)})")
    
    if success_rate >= 75:
        print("   🎉 系统运行良好！")
    elif success_rate >= 50:
        print("   ⚠️  系统基本可用，有改进空间")
    else:
        print("   ❌ 系统需要修复")

if __name__ == "__main__":
    quick_test()