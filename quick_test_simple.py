#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Quick API Test Script
"""

import requests
import json
import time
from pathlib import Path

def quick_test():
    """Quick API functionality test"""
    
    print("=== Quick API Functionality Test ===")
    
    # 1. Health check test
    print("1. Testing health check...")
    try:
        health_response = requests.get("http://127.0.0.1:8000/api/v1/health", timeout=10)
        if health_response.status_code == 200:
            health_data = health_response.json()
            print(f"   [OK] Service status: {health_data['status']}")
            print(f"   [OK] Active tasks: {health_data['active_tasks']}")
        else:
            print(f"   [FAIL] Health check failed: {health_response.status_code}")
            return
    except Exception as e:
        print(f"   [FAIL] Cannot connect to service: {e}")
        return
    
    # 2. Read test content
    print("\n2. Reading test content...")
    test_dir = Path("F:/project/flowedit/test")
    try:
        with open(test_dir / "test.html", "r", encoding="utf-8") as f:
            original_content = f.read()
        print(f"   [OK] Original content length: {len(original_content)} characters")
    except Exception as e:
        print(f"   [FAIL] Failed to read test file: {e}")
        return
    
    # 3. Create transformation task
    print("\n3. Creating transformation task...")
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
            print(f"   [OK] Task created successfully! ID: {task_id}")
            
            # 4. Monitor task progress
            print(f"\n4. Monitoring task progress...")
            return monitor_quick_progress(task_id)
            
        else:
            print(f"   [FAIL] Task creation failed: {response.status_code}")
            print(f"   Error details: {response.text}")
            return False
    
    except Exception as e:
        print(f"   [FAIL] Task creation exception: {e}")
        return False

def monitor_quick_progress(task_id):
    """Quick task progress monitoring"""
    
    status_url = f"http://127.0.0.1:8000/api/v1/task/{task_id}"
    max_attempts = 60  # 2 minutes, 2-second intervals
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(status_url, timeout=10)
            
            if response.status_code == 200:
                task_status = response.json()
                status = task_status["status"]
                progress = task_status["progress"]
                
                print(f"   Progress {attempt + 1}: {status} - {progress:.1f}%")
                
                if status == "completed":
                    result_html = task_status.get("result")
                    if result_html:
                        print(f"   [OK] Task completed! Generated HTML length: {len(result_html)} characters")
                        
                        # Save result
                        output_file = Path("F:/project/flowedit/test/quick_test_result.html")
                        with open(output_file, "w", encoding="utf-8") as f:
                            f.write(result_html)
                        print(f"   [OK] Result saved to: {output_file}")
                        
                        # Quick quality check
                        quick_quality_check(result_html)
                        return True
                    else:
                        print("   [FAIL] Task completed but no result")
                        return False
                
                elif status == "failed":
                    error_msg = task_status.get("error", "Unknown error")
                    print(f"   [FAIL] Task failed: {error_msg}")
                    return False
                
                elif status == "running":
                    time.sleep(2)
                    continue
            
            else:
                print(f"   [FAIL] Status check failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"   [FAIL] Status check exception: {e}")
            time.sleep(2)
    
    print("   [FAIL] Task monitoring timeout")
    return False

def quick_quality_check(html_content):
    """Quick quality check"""
    
    print(f"\n5. Quick quality check...")
    
    checks = {
        "Contains HTML tags": "<" in html_content and ">" in html_content,
        "Contains inline styles": "style=" in html_content,
        "Contains section structure": "<section" in html_content,
        "Contains headings": "<h1" in html_content,
        "Contains paragraphs": "<p" in html_content,
        "Contains Bauhaus colors": any(color in html_content for color in ["#E53E3E", "#3182CE", "#D69E2E"]),
        "Contains typography": "font-family:" in html_content,
        "Contains border styling": "border" in html_content,
    }
    
    passed_checks = 0
    for check, result in checks.items():
        status = "[PASS]" if result else "[FAIL]"
        print(f"   {status} {check}")
        if result:
            passed_checks += 1
    
    success_rate = passed_checks / len(checks) * 100
    print(f"\n   Quality check pass rate: {success_rate:.1f}% ({passed_checks}/{len(checks)})")
    
    if success_rate >= 75:
        print("   RESULT: System working well!")
        return True
    elif success_rate >= 50:
        print("   RESULT: System basically functional, room for improvement")
        return True
    else:
        print("   RESULT: System needs fixes")
        return False

if __name__ == "__main__":
    success = quick_test()
    print(f"\n{'='*50}")
    if success:
        print("END-TO-END TEST: SUCCESS")
        print("The optimized LangGraph + LangChain system is functioning properly!")
    else:
        print("END-TO-END TEST: FAILED") 
        print("System needs attention.")
    print(f"{'='*50}")