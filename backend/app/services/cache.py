from functools import lru_cache
import json
from typing import Optional


class StyleDNACache:
    def __init__(self):
        self._cache = {}
        self.max_size = 100  # 最大缓存数量
    
    def get_style_dna(self, theme_name: str) -> Optional[dict]:
        return self._cache.get(theme_name)
    
    def set_style_dna(self, theme_name: str, style_dna: dict):
        # 简单的LRU逻辑
        if len(self._cache) >= self.max_size:
            # 删除最旧的一个
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]
        
        self._cache[theme_name] = style_dna
    
    def clear(self):
        self._cache.clear()


# 全局缓存实例
style_cache = StyleDNACache()