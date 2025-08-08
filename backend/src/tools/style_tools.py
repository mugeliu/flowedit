from typing import Dict, Any, List
from src.tools.base import BaseCustomTool
import json
import re


class StyleAnalyzerTool(BaseCustomTool):
    name: str = "style_analyzer"
    description: str = "Analyze style characteristics from style requirements"
    
    def execute(self, style_name: str, style_features: List[str] = None, **kwargs) -> Dict[str, Any]:
        """Analyze style characteristics"""
        # Basic style analysis logic
        style_characteristics = {
            "primary_color": self._extract_color_from_style(style_name),
            "typography": self._get_typography_for_style(style_name),
            "layout_type": self._get_layout_type(style_name),
            "mood": self._get_style_mood(style_name),
            "features": style_features or []
        }
        
        return {
            "style_characteristics": style_characteristics,
            "analysis_confidence": 0.8
        }
    
    def _extract_color_from_style(self, style_name: str) -> str:
        """Extract primary color from style name"""
        color_mapping = {
            "professional": "#2c3e50",
            "minimal": "#333333",
            "elegant": "#1a1a1a",
            "modern": "#007acc",
            "warm": "#e67e22",
            "cool": "#3498db",
            "nature": "#27ae60"
        }
        
        for key, color in color_mapping.items():
            if key.lower() in style_name.lower():
                return color
        return "#333333"
    
    def _get_typography_for_style(self, style_name: str) -> Dict[str, str]:
        """Get typography settings for style"""
        return {
            "font_family": "Arial, sans-serif",
            "heading_size": "24px",
            "body_size": "16px",
            "line_height": "1.6"
        }
    
    def _get_layout_type(self, style_name: str) -> str:
        """Determine layout type from style"""
        if "minimal" in style_name.lower():
            return "clean"
        elif "modern" in style_name.lower():
            return "grid"
        else:
            return "traditional"
    
    def _get_style_mood(self, style_name: str) -> str:
        """Determine mood from style name"""
        mood_mapping = {
            "professional": "serious",
            "elegant": "sophisticated", 
            "warm": "friendly",
            "cool": "calm",
            "modern": "dynamic"
        }
        
        for key, mood in mood_mapping.items():
            if key.lower() in style_name.lower():
                return mood
        return "neutral"


class ColorPaletteGenerator(BaseCustomTool):
    name: str = "color_palette_generator"
    description: str = "Generate color palette based on primary color"
    
    def execute(self, primary_color: str, **kwargs) -> Dict[str, Any]:
        """Generate complementary color palette"""
        # Simple color palette generation
        palette = {
            "primary": primary_color,
            "secondary": self._get_secondary_color(primary_color),
            "accent": self._get_accent_color(primary_color),
            "background": "#ffffff",
            "text": "#333333",
            "light": "#f8f9fa",
            "dark": "#212529"
        }
        
        return {"color_palette": palette}
    
    def _get_secondary_color(self, primary: str) -> str:
        """Generate secondary color"""
        # Basic color harmony logic
        return "#6c757d"
    
    def _get_accent_color(self, primary: str) -> str:
        """Generate accent color"""
        return "#28a745"


class TypographyDesigner(BaseCustomTool):
    name: str = "typography_designer"
    description: str = "Design typography system for the style"
    
    def execute(self, style_mood: str, **kwargs) -> Dict[str, Any]:
        """Design typography system"""
        typography_system = {
            "headings": {
                "h1": {"size": "32px", "weight": "700", "line_height": "1.2"},
                "h2": {"size": "28px", "weight": "600", "line_height": "1.3"},
                "h3": {"size": "24px", "weight": "600", "line_height": "1.4"}
            },
            "body": {
                "size": "16px",
                "weight": "400",
                "line_height": "1.6"
            },
            "caption": {
                "size": "14px",
                "weight": "400",
                "line_height": "1.4"
            },
            "font_family": self._get_font_family(style_mood)
        }
        
        return {"typography_system": typography_system}
    
    def _get_font_family(self, mood: str) -> str:
        """Get appropriate font family for mood"""
        font_mapping = {
            "serious": "Georgia, serif",
            "modern": "Helvetica, Arial, sans-serif",
            "friendly": "Open Sans, sans-serif",
            "sophisticated": "Playfair Display, serif"
        }
        return font_mapping.get(mood, "Arial, sans-serif")


class SpacingCalculator(BaseCustomTool):
    name: str = "spacing_calculator"
    description: str = "Calculate spacing system for consistent layout"
    
    def execute(self, layout_type: str = "traditional", **kwargs) -> Dict[str, Any]:
        """Calculate spacing system"""
        base_unit = 8  # Base spacing unit in pixels
        
        spacing_system = {
            "xs": f"{base_unit // 2}px",      # 4px
            "sm": f"{base_unit}px",           # 8px
            "md": f"{base_unit * 2}px",       # 16px
            "lg": f"{base_unit * 3}px",       # 24px
            "xl": f"{base_unit * 4}px",       # 32px
            "xxl": f"{base_unit * 6}px",      # 48px
        }
        
        if layout_type == "minimal":
            # Increase spacing for minimal design
            for key in spacing_system:
                current = int(spacing_system[key].replace('px', ''))
                spacing_system[key] = f"{current * 1.5:.0f}px"
        
        return {"spacing_system": spacing_system}