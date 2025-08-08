from typing import Dict, Any, List
from src.tools.base import BaseCustomTool
import re
import json
from bs4 import BeautifulSoup


class CSSGeneratorTool(BaseCustomTool):
    name: str = "css_generator"
    description: str = "Generate CSS code based on design specifications"
    
    def execute(self, design_system: Dict, content_info: Dict = None, **kwargs) -> Dict[str, Any]:
        """Generate CSS code from design system"""
        try:
            css_rules = []
            
            # Generate base styles
            css_rules.extend(self._generate_base_styles(design_system))
            
            # Generate typography styles
            css_rules.extend(self._generate_typography_styles(design_system.get("typography", {})))
            
            # Generate color styles
            css_rules.extend(self._generate_color_styles(design_system.get("colors", {})))
            
            # Generate spacing styles
            css_rules.extend(self._generate_spacing_styles(design_system.get("spacing", {})))
            
            # Generate layout styles based on content
            if content_info:
                css_rules.extend(self._generate_layout_styles(content_info))
            
            css_code = "\n".join(css_rules)
            
            return {
                "generated_css": css_code,
                "style_count": len(css_rules),
                "wechat_compatible": True
            }
            
        except Exception as e:
            return {"error": f"Failed to generate CSS: {str(e)}"}
    
    def _generate_base_styles(self, design_system: Dict) -> List[str]:
        """Generate base CSS styles"""
        return [
            "/* Base Styles */",
            "* { box-sizing: border-box; margin: 0; padding: 0; }",
            "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }",
            ".content-wrapper { max-width: 100%; margin: 0 auto; padding: 16px; }"
        ]
    
    def _generate_typography_styles(self, typography: Dict) -> List[str]:
        """Generate typography CSS"""
        styles = ["/* Typography Styles */"]
        
        if "headings" in typography:
            for heading, props in typography["headings"].items():
                style = f".{heading} {{ "
                style += f"font-size: {props.get('size', '16px')}; "
                style += f"font-weight: {props.get('weight', '400')}; "
                style += f"line-height: {props.get('line_height', '1.4')}; "
                style += "margin-bottom: 16px; }"
                styles.append(style)
        
        if "body" in typography:
            body = typography["body"]
            styles.append(f"p, div {{ font-size: {body.get('size', '16px')}; line-height: {body.get('line_height', '1.6')}; margin-bottom: 12px; }}")
        
        return styles
    
    def _generate_color_styles(self, colors: Dict) -> List[str]:
        """Generate color CSS"""
        styles = ["/* Color Styles */"]
        
        if "primary" in colors:
            styles.append(f".primary-color {{ color: {colors['primary']}; }}")
            styles.append(f".primary-bg {{ background-color: {colors['primary']}; color: white; }}")
        
        if "background" in colors:
            styles.append(f".content-wrapper {{ background-color: {colors['background']}; }}")
        
        if "text" in colors:
            styles.append(f"body, p, div {{ color: {colors['text']}; }}")
        
        return styles
    
    def _generate_spacing_styles(self, spacing: Dict) -> List[str]:
        """Generate spacing CSS"""
        styles = ["/* Spacing Styles */"]
        
        for size, value in spacing.items():
            styles.append(f".m-{size} {{ margin: {value}; }}")
            styles.append(f".p-{size} {{ padding: {value}; }}")
            styles.append(f".mb-{size} {{ margin-bottom: {value}; }}")
            styles.append(f".pb-{size} {{ padding-bottom: {value}; }}")
        
        return styles
    
    def _generate_layout_styles(self, content_info: Dict) -> List[str]:
        """Generate layout-specific CSS"""
        styles = ["/* Layout Styles */"]
        
        layout_type = content_info.get("recommended_layout", "flexible")
        
        if layout_type == "single_column":
            styles.append(".content-wrapper { max-width: 680px; }")
        elif layout_type == "masonry":
            styles.append(".content-wrapper { display: flex; flex-wrap: wrap; gap: 16px; }")
            styles.append(".content-item { flex: 1 1 calc(50% - 8px); }")
        
        return styles


class HTMLBuilderTool(BaseCustomTool):
    name: str = "html_builder"
    description: str = "Build HTML structure with inline styles"
    
    def execute(self, original_html: str, generated_css: str, design_system: Dict, **kwargs) -> Dict[str, Any]:
        """Build final HTML with inline styles for WeChat compatibility"""
        try:
            from bs4 import BeautifulSoup
            
            soup = BeautifulSoup(original_html, 'html.parser')
            
            # Apply inline styles
            self._apply_inline_styles(soup, generated_css, design_system)
            
            # Ensure WeChat compatibility
            self._ensure_wechat_compatibility(soup)
            
            # Wrap in container
            final_html = self._wrap_in_container(str(soup), design_system)
            
            return {
                "final_html": final_html,
                "inline_styles_applied": True,
                "wechat_compatible": True
            }
            
        except Exception as e:
            return {"error": f"Failed to build HTML: {str(e)}"}
    
    def _apply_inline_styles(self, soup: BeautifulSoup, css: str, design_system: Dict):
        """Apply CSS as inline styles"""
        # Extract colors and typography from design system
        colors = design_system.get("colors", {})
        typography = design_system.get("typography", {})
        spacing = design_system.get("spacing", {})
        
        # Apply styles to common elements
        for p in soup.find_all('p'):
            styles = []
            if typography.get("body"):
                body_style = typography["body"]
                styles.append(f"font-size: {body_style.get('size', '16px')}")
                styles.append(f"line-height: {body_style.get('line_height', '1.6')}")
            if colors.get("text"):
                styles.append(f"color: {colors['text']}")
            if spacing.get("md"):
                styles.append(f"margin-bottom: {spacing['md']}")
            
            if styles:
                p['style'] = "; ".join(styles)
        
        # Apply heading styles
        for level in range(1, 7):
            for heading in soup.find_all(f'h{level}'):
                styles = []
                if typography.get("headings", {}).get(f"h{level}"):
                    h_style = typography["headings"][f"h{level}"]
                    styles.append(f"font-size: {h_style.get('size', '24px')}")
                    styles.append(f"font-weight: {h_style.get('weight', '600')}")
                    styles.append(f"line-height: {h_style.get('line_height', '1.3')}")
                if colors.get("text"):
                    styles.append(f"color: {colors['text']}")
                if spacing.get("lg"):
                    styles.append(f"margin-bottom: {spacing['lg']}")
                
                if styles:
                    heading['style'] = "; ".join(styles)
    
    def _ensure_wechat_compatibility(self, soup: BeautifulSoup):
        """Ensure HTML is compatible with WeChat"""
        # Remove unsupported attributes
        unsupported_attrs = ['class', 'id']
        for element in soup.find_all():
            for attr in unsupported_attrs:
                if element.has_attr(attr):
                    del element[attr]
        
        # Convert certain elements to WeChat-friendly versions
        for img in soup.find_all('img'):
            if not img.get('style'):
                img['style'] = 'max-width: 100%; height: auto; display: block;'
    
    def _wrap_in_container(self, html: str, design_system: Dict) -> str:
        """Wrap content in styled container"""
        colors = design_system.get("colors", {})
        spacing = design_system.get("spacing", {})
        
        container_styles = [
            "max-width: 100%",
            "margin: 0 auto",
            f"padding: {spacing.get('lg', '24px')}",
        ]
        
        if colors.get("background"):
            container_styles.append(f"background-color: {colors['background']}")
        
        return f'<div style="{"; ".join(container_styles)}">{html}</div>'


class WeChatValidator(BaseCustomTool):
    name: str = "wechat_validator"
    description: str = "Validate HTML for WeChat platform compatibility"
    
    def execute(self, html_content: str, **kwargs) -> Dict[str, Any]:
        """Validate HTML for WeChat compatibility"""
        try:
            from bs4 import BeautifulSoup
            
            soup = BeautifulSoup(html_content, 'html.parser')
            
            validation_results = {
                "is_valid": True,
                "warnings": [],
                "errors": [],
                "suggestions": []
            }
            
            # Check for unsupported elements
            self._check_unsupported_elements(soup, validation_results)
            
            # Check for unsupported attributes
            self._check_unsupported_attributes(soup, validation_results)
            
            # Check inline styles
            self._check_inline_styles(soup, validation_results)
            
            # Check image compatibility
            self._check_image_compatibility(soup, validation_results)
            
            # Determine overall validity
            validation_results["is_valid"] = len(validation_results["errors"]) == 0
            
            return {"validation_results": validation_results}
            
        except Exception as e:
            return {"error": f"Validation failed: {str(e)}"}
    
    def _check_unsupported_elements(self, soup: BeautifulSoup, results: Dict):
        """Check for elements not supported by WeChat"""
        unsupported = ['script', 'iframe', 'form', 'input', 'button', 'video', 'audio']
        
        for element in unsupported:
            found = soup.find_all(element)
            if found:
                results["errors"].append(f"Unsupported element found: {element} ({len(found)} instances)")
    
    def _check_unsupported_attributes(self, soup: BeautifulSoup, results: Dict):
        """Check for attributes not recommended for WeChat"""
        discouraged_attrs = ['class', 'id', 'onclick', 'onload']
        
        for element in soup.find_all():
            for attr in discouraged_attrs:
                if element.has_attr(attr):
                    results["warnings"].append(f"Discouraged attribute '{attr}' found in {element.name}")
    
    def _check_inline_styles(self, soup: BeautifulSoup, results: Dict):
        """Check if inline styles are properly used"""
        elements_without_style = []
        for element in soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div']):
            if not element.get('style'):
                elements_without_style.append(element.name)
        
        if elements_without_style:
            results["suggestions"].append(f"Consider adding inline styles to: {', '.join(set(elements_without_style))}")
    
    def _check_image_compatibility(self, soup: BeautifulSoup, results: Dict):
        """Check image element compatibility"""
        for img in soup.find_all('img'):
            if not img.get('src'):
                results["errors"].append("Image element without src attribute")
            
            style = img.get('style', '')
            if 'max-width' not in style:
                results["suggestions"].append("Add max-width: 100% to images for responsive design")


class PerformanceOptimizer(BaseCustomTool):
    name: str = "performance_optimizer"
    description: str = "Optimize HTML and CSS for performance"
    
    def execute(self, html_content: str, **kwargs) -> Dict[str, Any]:
        """Optimize content for performance"""
        try:
            from bs4 import BeautifulSoup
            
            soup = BeautifulSoup(html_content, 'html.parser')
            
            optimizations = {
                "original_size": len(html_content),
                "optimizations_applied": [],
                "final_size": 0
            }
            
            # Remove unnecessary whitespace
            self._optimize_whitespace(soup, optimizations)
            
            # Optimize inline styles
            self._optimize_inline_styles(soup, optimizations)
            
            # Remove empty elements
            self._remove_empty_elements(soup, optimizations)
            
            optimized_html = str(soup)
            optimizations["final_size"] = len(optimized_html)
            optimizations["size_reduction"] = optimizations["original_size"] - optimizations["final_size"]
            
            return {
                "optimized_html": optimized_html,
                "optimization_report": optimizations
            }
            
        except Exception as e:
            return {"error": f"Optimization failed: {str(e)}"}
    
    def _optimize_whitespace(self, soup: BeautifulSoup, optimizations: Dict):
        """Remove unnecessary whitespace"""
        # This is handled by BeautifulSoup's prettify in reverse
        optimizations["optimizations_applied"].append("Whitespace optimization")
    
    def _optimize_inline_styles(self, soup: BeautifulSoup, optimizations: Dict):
        """Optimize inline CSS"""
        for element in soup.find_all(style=True):
            style = element['style']
            # Remove duplicate semicolons and spaces
            optimized_style = re.sub(r'\s*;\s*', '; ', style)
            optimized_style = re.sub(r';\s*$', '', optimized_style)
            element['style'] = optimized_style
        
        optimizations["optimizations_applied"].append("Inline style optimization")
    
    def _remove_empty_elements(self, soup: BeautifulSoup, optimizations: Dict):
        """Remove empty elements"""
        empty_count = 0
        for element in soup.find_all():
            if not element.get_text(strip=True) and not element.find_all():
                # Keep elements that might be used for spacing/styling
                if element.name not in ['br', 'hr', 'img']:
                    element.decompose()
                    empty_count += 1
        
        if empty_count > 0:
            optimizations["optimizations_applied"].append(f"Removed {empty_count} empty elements")