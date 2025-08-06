import re
from bs4 import BeautifulSoup
from typing import Dict, List, Any


class WeChatValidator:
    """微信公众号HTML规范验证器"""
    
    def __init__(self):
        self.forbidden_tags = {'div', 'script', 'style', 'iframe', 'form', 'input'}
        self.forbidden_css = {'position', 'transform', 'z-index', '@media', '@keyframes'}
        self.required_inline_styles = True
    
    def validate(self, html_content: str) -> Dict[str, Any]:
        errors = []
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # 检查禁用标签
        for tag in soup.find_all():
            if tag.name in self.forbidden_tags:
                errors.append(f"发现禁用标签: <{tag.name}>")
            
            # 检查是否使用了id属性
            if tag.get('id'):
                errors.append(f"发现id属性: {tag.name}#{tag.get('id')}")
            
            # 检查内联样式
            if tag.get('style'):
                style_content = tag.get('style')
                for forbidden in self.forbidden_css:
                    if forbidden in style_content:
                        errors.append(f"发现禁用CSS属性: {forbidden}")
        
        # 检查是否使用section替代div
        if soup.find('div'):
            errors.append("发现div标签，应使用section替代")
        
        return {
            'is_valid': len(errors) == 0,
            'errors': errors,
            'suggestion': '请根据错误信息修正HTML代码' if errors else '验证通过'
        }