from sqlalchemy.orm import Session
from typing import Optional, List
import json
from datetime import datetime

from ..db.database import StyleDNAModel
from .cache import style_cache


class StyleDNAService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_style_dna(self, theme_name: str, style_dna: dict) -> StyleDNAModel:
        """创建新的风格DNA"""
        db_style = StyleDNAModel(
            theme_name=theme_name,
            dna_config=json.dumps(style_dna, ensure_ascii=False)
        )
        self.db.add(db_style)
        self.db.commit()
        self.db.refresh(db_style)
        
        # 更新缓存
        style_cache.set_style_dna(theme_name, style_dna)
        return db_style
    
    def get_style_dna(self, theme_name: str) -> Optional[dict]:
        """获取风格DNA，优先从缓存"""
        # 先检查缓存
        cached = style_cache.get_style_dna(theme_name)
        if cached:
            return cached
        
        # 从数据库获取
        db_style = self.db.query(StyleDNAModel).filter(
            StyleDNAModel.theme_name == theme_name
        ).first()
        
        if db_style:
            style_dna = json.loads(db_style.dna_config)
            # 更新缓存
            style_cache.set_style_dna(theme_name, style_dna)
            return style_dna
        
        return None
    
    def update_style_dna(self, theme_name: str, style_dna: dict) -> Optional[StyleDNAModel]:
        """更新风格DNA"""
        db_style = self.db.query(StyleDNAModel).filter(
            StyleDNAModel.theme_name == theme_name
        ).first()
        
        if db_style:
            db_style.dna_config = json.dumps(style_dna, ensure_ascii=False)
            db_style.updated_at = datetime.utcnow()
            self.db.commit()
            
            # 更新缓存
            style_cache.set_style_dna(theme_name, style_dna)
            return db_style
        
        return None
    
    def list_themes(self) -> List[str]:
        """获取所有主题名称列表"""
        themes = self.db.query(StyleDNAModel.theme_name).all()
        return [theme[0] for theme in themes]