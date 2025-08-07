# AI 风格化内容生成服务 - 需求文档

## 核心功能概述

构建一个智能内容风格化系统，将用户的任意文本内容转换为符合特定设计风格的微信公众号 HTML 格式。

## 系统架构设计

### 1. 风格 DNA 系统

**定义**：风格 DNA 是一套完整的样式配置规则，**严格限制在微信允许的 CSS 属性范围内**：

- 字体配置：`font-size`, `font-weight`, `color`, `line-height`, `letter-spacing`
- 背景色彩：`background-color`（仅纯色，不使用复杂渐变）
- 间距规范：`margin`, `padding`（使用 px 或 vw 单位）
- 边框装饰：`border`, `border-radius`, `box-shadow`
- 对齐方式：`text-align`, `vertical-align`
- 显示控制：`display`（推荐使用 flex），`opacity`

**禁止使用**：`position`, `transform`, `z-index`（除非配合 flex 使用）, 所有动画属性

**存储格式**：JSON 配置对象，仅包含微信支持的 CSS 属性和数值

### 2. 内容层次识别系统

**功能**：AI 自动解析用户输入内容，识别以下结构：

- 主标题（H1 级别）
- 副标题（H2-H3 级别）
- 正文段落
- 强调文本（重点内容）
- 引用内容
- 列表项目
- 分隔符/过渡段落

**输出**：结构化的内容对象，每个元素带有层次标签

### 3. 风格映射规则

**机制**：为每种内容层次定义对应的样式应用规则

```
内容层次 → 风格DNA中的样式配置 → CSS样式输出
主标题 → 风格DNA.主标题样式 → H1的CSS类
正文 → 风格DNA.正文样式 → P的CSS类
```

## 用户交互流程

### 首次风格创建流程

```
输入：
1. 原始内容（纯文本，任意格式）
2. 风格主题名称（如"新粗野主义"、"极简主义"）
3. 风格特征描述（详细的设计风格描述）

处理步骤：
1. 内容结构化分析
2. 基于风格描述生成风格DNA
3. 应用风格DNA到内容结构
4. 生成微信兼容HTML
5. 保存风格DNA供后续使用

输出：
- 风格化的HTML内容片段（仅内容部分）
- 风格DNA配置文件
- 样式预览说明
```

### 复用风格流程

```
输入：
1. 新的原始内容
2. 指定已有的风格主题

处理步骤：
1. 内容结构化分析
2. 加载对应风格DNA
3. 直接应用样式规则
4. 生成HTML

输出：
- 风格一致的HTML内容片段
```

### 风格调整流程

```
输入：
1. 具体的样式调整需求
2. 指定风格主题

处理步骤：
1. 修改风格DNA中的对应参数
2. 重新生成样式规则
3. 更新保存风格DNA

输出：
- 更新后的风格DNA
- 调整说明
```

## 技术实现要求

### 微信公众号 HTML 严格规范

#### ✅ 允许使用的 HTML 标签

- 文本标签：`<p>`, `<h1>`~`<h6>`, `<strong>`, `<b>`, `<em>`, `<i>`, `<u>`, `<br>`, `<span>`
- 列表标签：`<ul>`, `<ol>`, `<li>`
- 其他标签：`<a>`, `<img>`, `<svg>`, `<section>`（替代 div）

#### ❌ 严禁使用的 HTML 标签

- `<div>` - **必须用`<section>`替代**
- `<script>`, `<style>`, `<iframe>`, `<form>`, `<input>` 等交互标签

#### ✅ 允许使用的 CSS 属性

- **文本样式**：`font-size`, `color`, `font-weight`, `line-height`, `letter-spacing`, `text-align`, `text-decoration`
- **布局样式**：`margin`, `padding`, `display`, `vertical-align`, `overflow`
- **视觉效果**：`background-color`, `border`, `border-radius`, `box-shadow`, `opacity`

#### ❌ 严禁使用的 CSS 属性

- **`position`** - 完全失效，包括 relative、absolute、fixed
- **`transform`** - 在暗黑模式下失效
- **百分比负值** - 如`margin-top: -100%`
- **媒体查询**、**伪类选择器**、**关键帧动画**

#### 强制要求

- **必须使用内联样式**：所有样式通过`style`属性定义
- **禁用 id 属性**：微信会删除所有 id 属性
- **单位限制**：推荐使用`px`、`vw`、`vh`，避免百分比
- **图片要求**：必须使用微信素材库链接，设置 width 和 height 属性

### 风格生成规则

1. **微信规范优先**：所有样式生成必须严格遵循微信 HTML 限制
2. **创造性原则**：在允许的 CSS 属性范围内进行创新设计
3. **一致性原则**：同一风格 DNA 下，相同内容层次保持样式一致
4. **移动适配原则**：生成的样式适合微信移动端阅读体验
5. **简洁美观原则**：在技术限制下实现最佳视觉效果

### 输入输出格式规范

#### 输入格式示例

```
原始内容：
"
# 人工智能的未来发展
随着技术的不断进步，人工智能正在改变我们的生活方式。

## 主要应用领域
- 医疗健康
- 教育培训
- 智能制造

*这是一个充满机遇的时代。*
"

风格主题：新粗野主义
风格特征：大胆的几何形状、原始材料质感、强烈色彩对比、不对称布局、工业风格元素
```

#### 输出格式要求

```html
<!-- 仅输出应用风格DNA的内容部分，严格遵循微信规范 -->
<section style="margin: 20px 0; padding: 16px; background-color: #f8f9fa;">
  <h1
    style="font-size: 24px; color: #2c3e50; line-height: 1.2; text-align: center; margin: 0 0 16px 0;"
  >
    人工智能的未来发展
  </h1>
  <p
    style="font-size: 16px; color: #333333; line-height: 1.75; margin: 0 0 16px 0;"
  >
    随着技术的不断进步，人工智能正在改变我们的生活方式。
  </p>
  <h2 style="font-size: 20px; color: #34495e; margin: 20px 0 12px 0;">
    主要应用领域
  </h2>
  <ul style="padding-left: 20px; margin: 0 0 16px 0;">
    <li
      style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 8px;"
    >
      医疗健康
    </li>
    <li
      style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 8px;"
    >
      教育培训
    </li>
    <li
      style="font-size: 16px; color: #333333; line-height: 1.6; margin-bottom: 8px;"
    >
      智能制造
    </li>
  </ul>
  <p style="font-size: 16px; color: #333333; line-height: 1.75; margin: 0;">
    <em style="color: #e74c3c; font-style: italic;"
      >这是一个充满机遇的时代。</em
    >
  </p>
</section>
```

**关键要求**：

- 使用`<section>`替代`<div>`作为容器
- 所有样式必须内联，不使用 class 或 id
- 只使用微信支持的 CSS 属性
- 不使用 position、transform、复杂动画等被禁属性

## 系统优势总结

1. **智能化**：AI 完全驱动的样式生成，无需人工设计
2. **个性化**：每个用户每种风格都有独特的 DNA 配置
3. **一致性**：确保同一风格下内容样式的统一性
4. **可扩展**：支持用户自定义调整和风格迭代
5. **高效性**：风格 DNA 复用机制，快速处理新内容

## 实现重点

### 对 AI 的具体要求

1. 深度理解风格特征描述，转化为具体的设计参数
2. 准确识别内容结构和层次关系
3. 创造性地生成视觉样式，避免模板化
4. 确保生成的 CSS 符合微信平台限制
5. 维护风格的前后一致性

### 质量控制标准

- **微信规范符合度**：严格检查是否使用了被禁的 HTML 标签和 CSS 属性
- **内联样式完整性**：确保所有样式都通过 style 属性定义
- **移动端显示效果**：验证在微信内置浏览器的显示效果
- **暗黑模式兼容性**：避免使用在暗黑模式下会失效的属性
- **风格一致性检查**：同一风格 DNA 下相同内容层次的样式统一性

### 对 AI 的关键约束

1. **绝对禁止使用**：`<div>`, `position`, `transform`, `id`属性, 外部 CSS
2. **强制要求使用**：内联样式, `<section>`容器, 微信支持的 CSS 属性
3. **单位限制**：优先使用 px, 可使用 vw/vh, 避免百分比负值
4. **布局策略**：基于标准文档流 + flex 布局，不依赖定位
5. **兼容性优先**：所有生成的代码必须在微信平台完美显示

---

# StyleDNA 优化方案 - 模板复杂度分析与升级策略

## 项目背景

经过对后端升级后样式生成失败的分析，我们采用了工程化方法将LLM直接生成大JSON的方式改为两步骤参数化生成：
1. LLM生成可靠的小参数输出（颜色方案6参数 + 排版参数7参数）
2. 代码组装成完整的30+样式配置

在完成基础重构后，通过深入分析`/assets/templates/`中的8个专业模板，发现了巨大的视觉复杂度差距，需要进一步优化。

## 模板复杂度分析

### 1. 渐变使用程度（80%+样式使用渐变）

**linear-gradient应用场景**：
- **backgrounds**: 几乎所有背景都使用渐变替代纯色
- **button/badge样式**: `linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)`
- **文本高亮**: `background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%)`
- **容器背景**: 多层次渐变营造深度感

**当前差距**: 我们的StyleDNA仅使用了基础渐变，专业模板使用了复杂的多色渐变组合。

### 2. 阴影系统复杂性（多层叠加）

**专业模板的阴影特点**：
```css
/* 基础投影 + 内发光组合 */
box-shadow: 0 8px 30px rgba(102, 126, 234, 0.25), inset 0 2px 4px rgba(255,255,255,0.1);

/* 多层深度阴影 */
box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08);

/* 彩色阴影增强视觉效果 */
box-shadow: 0 5px 16px rgba(238, 90, 82, 0.35);
```

**当前差距**: 我们只使用单层简单阴影，缺乏专业的多层次阴影系统。

### 3. 色彩透明度精细控制

**RGBA应用策略**：
- **背景叠层**: `background: rgba(255, 255, 255, 0.92)` 创建透明叠层效果
- **伪元素装饰**: `background: rgba(102, 126, 234, 0.08)` 提供微妙的视觉装饰
- **边框透明**: `border: 1px solid rgba(16, 185, 129, 0.15)` 柔和边界

### 4. 现代CSS属性使用

**先进CSS技术**：
- **backdrop-filter**: `backdrop-filter: blur(15px)` 毛玻璃效果
- **border-image**: 渐变边框 `border-image: linear-gradient(135deg, #3498db 0%, #9b59b6 100%) 1`
- **text-shadow**: 立体文字效果
- **border-radius创意**: 不规则圆角 `border-radius: 50% 30% 50% 30%`

### 5. 空间层次系统

**Z轴设计思维**：
- **绝对定位装饰元素**: 使用`position: absolute`创建装饰几何图形
- **层叠上下文**: 通过`z-index`控制元素层级关系
- **3D视觉效果**: 通过多重阴影模拟3D深度

## 三阶段优化策略

### Phase 1: 即刻样式属性丰富化 ⚡

**目标**: 快速提升生成样式的视觉复杂度

**具体实施**:

1. **渐变系统升级**
```python
def _build_complete_style_dna(self, theme_name, colors, typography):
    # 替换所有background纯色为渐变
    primary_gradient = f"linear-gradient(135deg, {colors['primary']} 0%, {self._darken_color(colors['primary'], 15)} 100%)"
    secondary_gradient = f"linear-gradient(45deg, {colors['secondary']} 0%, {self._lighten_color(colors['secondary'], 10)} 100%)"
    
    # 多层阴影系统
    primary_shadow = f"0 4px 15px {self._to_rgba(colors['primary'], 0.25)}, 0 8px 30px {self._to_rgba(colors['primary'], 0.15)}"
```

2. **透明度色彩函数库**
```python
def _to_rgba(self, hex_color, opacity):
    """将hex颜色转换为rgba格式"""
    
def _create_shadow_set(self, base_color, intensity='medium'):
    """生成多层阴影组合"""
    
def _generate_complex_gradient(self, colors, direction='135deg'):
    """生成复杂多色渐变"""
```

3. **即刻实施的30+样式增强**
- 所有`background`属性渐变化
- `box-shadow`多层化（基础+装饰阴影）
- `border-radius`多样化（圆角/胶囊/不规则）
- `text-shadow`文字立体化
- `rgba()`透明度精细控制

**预期效果**: StyleDNA从30个简单属性升级为30+个专业级复杂样式

### Phase 2: 增强LLM参数生成 🎨

**目标**: 扩展LLM的参数输出能力，支持更精细的视觉控制

**参数扩展计划**:

1. **颜色参数扩展** (6→12参数)
```python
# 现有颜色参数
primary, secondary, accent, text, background, border

# 新增颜色参数  
primary_light, primary_dark,     # 渐变色调控制
secondary_light, secondary_dark, # 渐变深浅变化
shadow_color, decoration_color   # 阴影和装饰色彩
```

2. **视觉效果参数** (新增8参数)
```python
# 视觉风格控制参数
shadow_intensity,    # 阴影强度 (subtle/medium/dramatic)
gradient_style,      # 渐变类型 (linear/radial/conic)
border_style,        # 边框风格 (rounded/sharp/organic)
layout_density,      # 布局密度 (compact/comfortable/spacious)
decoration_level,    # 装饰程度 (minimal/moderate/rich)
contrast_mode,       # 对比模式 (low/medium/high)
texture_type,        # 纹理类型 (flat/subtle/textured)
animation_hint       # 动效提示 (static/hover/dynamic)
```

3. **排版参数精细化** (7→10参数)
```python
# 现有排版参数
font_size, line_height, letter_spacing, font_weight, 
text_align, heading_scale, body_spacing

# 新增排版参数
text_hierarchy,      # 标题层级对比度
reading_rhythm,      # 阅读节奏控制  
emphasis_style       # 强调样式偏好
```

### Phase 3: 伪元素装饰系统 ✨

**目标**: 通过CSS伪元素实现专业级视觉装饰效果

**装饰元素库**:

1. **几何装饰生成器**
```python
def _generate_geometric_decorations(self, style_theme):
    """生成几何形状装饰伪元素"""
    decorations = []
    
    if style_theme == "modern":
        decorations.append("::before { content: ''; position: absolute; top: -10px; right: -10px; width: 20px; height: 20px; background: linear-gradient(45deg, {accent} 0%, {primary} 100%); border-radius: 50%; opacity: 0.8; }")
    
    elif style_theme == "brutalist":
        decorations.append("::after { content: ''; position: absolute; bottom: -5px; left: -5px; width: 15px; height: 15px; background: {accent}; border: 2px solid {text}; }")
```

2. **背景纹理系统**
```python
def _create_texture_backgrounds(self, texture_type):
    """生成背景纹理CSS"""
    textures = {
        "dots": "radial-gradient(circle, {primary} 1px, transparent 1px)",
        "lines": "linear-gradient(90deg, transparent 24px, {accent} 25px, {accent} 26px, transparent 27px)",
        "grid": "linear-gradient({primary} 1px, transparent 1px), linear-gradient(90deg, {primary} 1px, transparent 1px)"
    }
```

## 实施时间表

- **Phase 1** (当前): 立即实施，预计提升视觉复杂度200%
- **Phase 2** (1周内): LLM参数扩展，支持精细视觉控制  
- **Phase 3** (2周内): 伪元素装饰系统，达到专业模板水准

## 质量评估指标

1. **视觉复杂度评分**: 从当前3/10分提升至8/10分
2. **CSS属性丰富度**: 30+个复杂样式属性
3. **渐变使用率**: 80%以上样式应用渐变效果
4. **阴影层次**: 平均2-3层阴影叠加
5. **色彩精细度**: RGBA透明度精确控制

## 技术实现要点

### 1. 色彩处理函数
```python
def _darken_color(self, hex_color, percentage):
    """降低颜色亮度"""

def _lighten_color(self, hex_color, percentage): 
    """提高颜色亮度"""

def _to_rgba(self, hex_color, alpha):
    """转换为RGBA格式"""
```

### 2. 渐变生成算法
```python
def _generate_smart_gradient(self, base_color, style="professional"):
    """智能渐变生成，支持多种风格"""
    if style == "professional":
        return f"linear-gradient(135deg, {base_color} 0%, {self._darken_color(base_color, 20)} 100%)"
    elif style == "vibrant":
        complementary = self._get_complementary_color(base_color)
        return f"linear-gradient(45deg, {base_color} 0%, {complementary} 100%)"
```

### 3. 阴影组合策略
```python
def _create_layered_shadow(self, color, intensity="medium"):
    """创建多层次阴影效果"""
    shadows = {
        "subtle": f"0 2px 8px {self._to_rgba(color, 0.15)}",
        "medium": f"0 4px 15px {self._to_rgba(color, 0.2)}, 0 8px 30px {self._to_rgba(color, 0.1)}",
        "dramatic": f"0 8px 30px {self._to_rgba(color, 0.25)}, 0 15px 45px {self._to_rgba(color, 0.15)}"
    }
```

## 结论

通过三阶段优化策略，我们将实现从基础样式生成到专业级模板质量的跨越式提升。Phase 1的即刻实施将快速解决当前视觉复杂度不足的问题，后续两个阶段将建立完整的专业级样式生成体系。

这种渐进式优化策略确保了系统的稳定性，同时逐步接近甚至超越现有专业模板的视觉质量水准。
