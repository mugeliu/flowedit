from typing import Dict, Any, List
from src.tools.base import BaseCustomTool
from bs4 import BeautifulSoup
import re
import json


class HTMLParserTool(BaseCustomTool):
    name: str = "html_parser"
    description: str = "Parse HTML structure and extract semantic information"
    
    def execute(self, html_content: str, **kwargs) -> Dict[str, Any]:
        """Parse HTML and extract structure"""
        try:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            structure = {
                "elements": self._extract_elements(soup),
                "hierarchy": self._build_hierarchy(soup),
                "text_content": self._extract_text_content(soup),
                "media_elements": self._extract_media_elements(soup),
                "total_elements": len(soup.find_all())
            }
            
            return {"html_structure": structure}
            
        except Exception as e:
            return {"error": f"Failed to parse HTML: {str(e)}"}
    
    def _extract_elements(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract all elements with their properties"""
        elements = []
        for element in soup.find_all():
            if element.name:
                elements.append({
                    "tag": element.name,
                    "attributes": dict(element.attrs) if element.attrs else {},
                    "text_length": len(element.get_text(strip=True)),
                    "has_children": len(element.find_all()) > 0
                })
        return elements
    
    def _build_hierarchy(self, soup: BeautifulSoup) -> Dict:
        """Build document hierarchy"""
        hierarchy = {"levels": {}}
        
        for level in range(1, 7):  # h1-h6
            headings = soup.find_all(f'h{level}')
            if headings:
                hierarchy["levels"][f"h{level}"] = len(headings)
        
        return hierarchy
    
    def _extract_text_content(self, soup: BeautifulSoup) -> Dict:
        """Extract and analyze text content"""
        text = soup.get_text()
        return {
            "total_length": len(text),
            "word_count": len(text.split()),
            "paragraph_count": len(soup.find_all('p'))
        }
    
    def _extract_media_elements(self, soup: BeautifulSoup) -> Dict:
        """Extract media elements"""
        return {
            "images": len(soup.find_all('img')),
            "videos": len(soup.find_all('video')),
            "links": len(soup.find_all('a'))
        }


class ContentClassifier(BaseCustomTool):
    name: str = "content_classifier"
    description: str = "Classify content type and determine appropriate styling"
    
    def execute(self, html_structure: Dict, **kwargs) -> Dict[str, Any]:
        """Classify content based on structure analysis"""
        elements = html_structure.get("elements", [])
        text_content = html_structure.get("text_content", {})
        
        content_type = self._classify_content_type(elements, text_content)
        content_weight = self._calculate_content_weight(elements)
        
        return {
            "content_classification": {
                "primary_type": content_type,
                "content_weight": content_weight,
                "recommended_layout": self._get_recommended_layout(content_type),
                "styling_priority": self._get_styling_priority(content_type)
            }
        }
    
    def _classify_content_type(self, elements: List[Dict], text_content: Dict) -> str:
        """Classify the primary content type"""
        # Count different element types
        element_counts = {}
        for element in elements:
            tag = element["tag"]
            element_counts[tag] = element_counts.get(tag, 0) + 1
        
        # Classification logic
        if element_counts.get("img", 0) > 3:
            return "image_heavy"
        elif text_content.get("word_count", 0) > 500:
            return "text_heavy"
        elif element_counts.get("h1", 0) + element_counts.get("h2", 0) > 3:
            return "structured_article"
        else:
            return "mixed_content"
    
    def _calculate_content_weight(self, elements: List[Dict]) -> Dict:
        """Calculate weight distribution of content"""
        total_elements = len(elements)
        if total_elements == 0:
            return {"text": 0, "media": 0, "structure": 0}
        
        text_elements = sum(1 for e in elements if e["tag"] in ["p", "span", "div", "article"])
        media_elements = sum(1 for e in elements if e["tag"] in ["img", "video", "audio"])
        structure_elements = sum(1 for e in elements if e["tag"] in ["h1", "h2", "h3", "h4", "h5", "h6", "section", "header", "footer"])
        
        return {
            "text": text_elements / total_elements,
            "media": media_elements / total_elements,
            "structure": structure_elements / total_elements
        }
    
    def _get_recommended_layout(self, content_type: str) -> str:
        """Get recommended layout for content type"""
        layout_mapping = {
            "image_heavy": "masonry",
            "text_heavy": "single_column",
            "structured_article": "structured",
            "mixed_content": "flexible"
        }
        return layout_mapping.get(content_type, "flexible")
    
    def _get_styling_priority(self, content_type: str) -> List[str]:
        """Get styling priorities for content type"""
        priority_mapping = {
            "image_heavy": ["image_styling", "spacing", "typography"],
            "text_heavy": ["typography", "readability", "spacing"],
            "structured_article": ["hierarchy", "typography", "spacing"],
            "mixed_content": ["balance", "typography", "spacing"]
        }
        return priority_mapping.get(content_type, ["typography", "spacing"])


class SentimentAnalyzer(BaseCustomTool):
    name: str = "sentiment_analyzer"
    description: str = "Analyze emotional weight and sentiment of content"
    
    def execute(self, html_content: str, **kwargs) -> Dict[str, Any]:
        """Analyze sentiment and emotional weight"""
        soup = BeautifulSoup(html_content, 'html.parser')
        text = soup.get_text()
        
        sentiment = self._analyze_sentiment(text)
        emotional_weight = self._calculate_emotional_weight(text)
        tone = self._determine_tone(text)
        
        return {
            "sentiment_analysis": {
                "sentiment": sentiment,
                "emotional_weight": emotional_weight,
                "tone": tone,
                "recommended_colors": self._get_colors_for_sentiment(sentiment),
                "recommended_typography": self._get_typography_for_tone(tone)
            }
        }
    
    def _analyze_sentiment(self, text: str) -> str:
        """Basic sentiment analysis"""
        positive_words = ["good", "great", "excellent", "amazing", "wonderful", "fantastic", "success", "achievement", "love", "happy", "joy"]
        negative_words = ["bad", "terrible", "awful", "horrible", "sad", "angry", "hate", "failure", "problem", "issue", "error"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count * 1.5:
            return "positive"
        elif negative_count > positive_count * 1.5:
            return "negative"
        else:
            return "neutral"
    
    def _calculate_emotional_weight(self, text: str) -> float:
        """Calculate emotional intensity"""
        emotional_indicators = ["!", "?", "amazing", "incredible", "urgent", "important", "critical"]
        text_lower = text.lower()
        
        weight = sum(1 for indicator in emotional_indicators if indicator in text_lower)
        return min(weight / 10.0, 1.0)  # Normalize to 0-1
    
    def _determine_tone(self, text: str) -> str:
        """Determine overall tone"""
        formal_indicators = ["furthermore", "consequently", "therefore", "moreover", "respectively"]
        casual_indicators = ["hey", "cool", "awesome", "yeah", "ok", "btw"]
        
        text_lower = text.lower()
        formal_count = sum(1 for word in formal_indicators if word in text_lower)
        casual_count = sum(1 for word in casual_indicators if word in text_lower)
        
        if formal_count > casual_count:
            return "formal"
        elif casual_count > formal_count:
            return "casual"
        else:
            return "balanced"
    
    def _get_colors_for_sentiment(self, sentiment: str) -> Dict[str, str]:
        """Get color recommendations based on sentiment"""
        color_mapping = {
            "positive": {"primary": "#28a745", "accent": "#17a2b8"},
            "negative": {"primary": "#6c757d", "accent": "#dc3545"},
            "neutral": {"primary": "#007bff", "accent": "#6f42c1"}
        }
        return color_mapping.get(sentiment, color_mapping["neutral"])
    
    def _get_typography_for_tone(self, tone: str) -> Dict[str, str]:
        """Get typography recommendations based on tone"""
        typography_mapping = {
            "formal": {"font_family": "Georgia, serif", "weight": "400"},
            "casual": {"font_family": "Open Sans, sans-serif", "weight": "300"},
            "balanced": {"font_family": "Arial, sans-serif", "weight": "400"}
        }
        return typography_mapping.get(tone, typography_mapping["balanced"])


class HierarchyExtractor(BaseCustomTool):
    name: str = "hierarchy_extractor"
    description: str = "Extract and analyze document hierarchy"
    
    def execute(self, html_content: str, **kwargs) -> Dict[str, Any]:
        """Extract document hierarchy and structure"""
        soup = BeautifulSoup(html_content, 'html.parser')
        
        hierarchy = self._extract_heading_hierarchy(soup)
        sections = self._extract_sections(soup)
        visual_weight = self._calculate_visual_weights(soup)
        
        return {
            "hierarchy_analysis": {
                "heading_structure": hierarchy,
                "sections": sections,
                "visual_weights": visual_weight,
                "recommended_improvements": self._get_hierarchy_recommendations(hierarchy)
            }
        }
    
    def _extract_heading_hierarchy(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract heading hierarchy"""
        headings = []
        for level in range(1, 7):
            for heading in soup.find_all(f'h{level}'):
                headings.append({
                    "level": level,
                    "text": heading.get_text(strip=True),
                    "length": len(heading.get_text(strip=True)),
                    "position": len(headings)
                })
        return headings
    
    def _extract_sections(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract content sections"""
        sections = []
        for section in soup.find_all(['section', 'article', 'div']):
            if section.get('class') or section.get('id') or section.name == 'section':
                sections.append({
                    "tag": section.name,
                    "attributes": dict(section.attrs) if section.attrs else {},
                    "content_length": len(section.get_text(strip=True)),
                    "child_count": len(section.find_all())
                })
        return sections
    
    def _calculate_visual_weights(self, soup: BeautifulSoup) -> Dict[str, float]:
        """Calculate visual importance weights"""
        total_text = len(soup.get_text())
        if total_text == 0:
            return {}
        
        weights = {}
        for level in range(1, 7):
            headings = soup.find_all(f'h{level}')
            if headings:
                total_heading_text = sum(len(h.get_text()) for h in headings)
                weights[f'h{level}'] = total_heading_text / total_text
        
        return weights
    
    def _get_hierarchy_recommendations(self, hierarchy: List[Dict]) -> List[str]:
        """Get recommendations for hierarchy improvement"""
        recommendations = []
        
        levels = [h['level'] for h in hierarchy]
        if not levels:
            recommendations.append("Add heading structure for better organization")
        elif 1 not in levels:
            recommendations.append("Consider adding an H1 heading for main title")
        elif levels.count(1) > 1:
            recommendations.append("Multiple H1 headings detected - consider using H2 for subsections")
        
        return recommendations