// 内容层内联样式处理方案
const flexibleTemplatesWithInlineStyles = {
  header: {
    h1: {
      layers: [
        {
          tag: "section",
          style: "margin: 2em 0; display: flex; justify-content: center;",
        },
        {
          tag: "div",
          style:
            "padding: 1.5em 3em; background: {{theme.primary}}; border-radius: 12px; box-shadow: {{theme.alpha.25}} 0px 8px 20px;",
        },
        {
          tag: "h1",
          style:
            "font-size: 20px; font-weight: 700; color: {{theme.white}}; margin: 0; text-align: center;",
          content: true,
          // 关键：定义如何处理内联样式
          inlineStyleHandling: {
            // 合并策略：merge(合并) | replace(替换) | append(追加)
            strategy: "merge",
            // 内联样式的包装模板
            wrapperTemplate:
              '<span style="{{combinedStyle}}">{{processedContent}}</span>',
            // 是否需要额外的包装层来处理内联样式
            needWrapper: true,
            // 样式优先级：template(模板优先) | inline(内联优先)
            priority: "template",
          },
        },
      ],
    },
    h2: {
      layers: [
        {
          tag: "section",
          style: "margin: 1.5em 0; display: block;",
        },
        {
          tag: "h2",
          style:
            "font-size: 18px; font-weight: 600; color: {{theme.text}}; margin: 0;",
          content: true,
          inlineStyleHandling: {
            strategy: "merge",
            // 直接应用到当前标签，不需要额外包装
            needWrapper: false,
            priority: "inline", // 内联样式优先
          },
        },
      ],
    },
  },

  paragraph: {
    p: {
      layers: [
        {
          tag: "section",
          style: "margin: 1em 0; padding: 0;",
        },
        {
          tag: "p",
          style:
            "font-size: 16px; line-height: 1.6; color: {{theme.text}}; margin: 0;",
          content: true,
          inlineStyleHandling: {
            strategy: "merge",
            needWrapper: false,
            priority: "template",
          },
        },
      ],
    },
  },
};

// 内联样式处理器
class InlineStyleProcessor {
  constructor(theme) {
    this.theme = theme;
  }

  // 替换主题变量
  replaceThemeVars(styleString) {
    return styleString.replace(
      /\{\{theme\.(\w+(?:\.\w+)*)\}\}/g,
      (match, path) => {
        const value = path
          .split(".")
          .reduce((obj, key) => obj?.[key], this.theme);
        return value || match;
      }
    );
  }

  // 合并样式
  mergeStyles(templateStyle, inlineStyle, priority = "template") {
    if (!inlineStyle) return templateStyle;
    if (!templateStyle) return inlineStyle;

    if (priority === "template") {
      return `${inlineStyle}; ${templateStyle}`;
    } else {
      return `${templateStyle}; ${inlineStyle}`;
    }
  }

  // 处理内容中的内联样式
  processInlineStyles(content, inlineStyles) {
    if (!inlineStyles || Object.keys(inlineStyles).length === 0) {
      return content;
    }

    let processedContent = content;

    // 处理各种内联样式标记
    Object.entries(inlineStyles).forEach(([styleType, template]) => {
      const regex = new RegExp(
        `<${styleType}([^>]*)>(.*?)</${styleType}>`,
        "g"
      );
      processedContent = processedContent.replace(
        regex,
        (match, attrs, innerContent) => {
          // 提取原有的style属性
          const existingStyle = attrs.match(/style="([^"]*)"/)
            ? attrs.match(/style="([^"]*)"/)[1]
            : "";
          // 生成新的样式
          const newStyle = this.replaceThemeVars(template);
          // 合并样式
          const combinedStyle = this.mergeStyles(
            newStyle,
            existingStyle,
            "template"
          );

          return `<${styleType} style="${combinedStyle}">${innerContent}</${styleType}>`;
        }
      );
    });

    return processedContent;
  }

  // 渲染内容层
  renderContentLayer(layer, content, blockInlineStyles = {}) {
    const processedStyle = this.replaceThemeVars(layer.style);
    const handling = layer.inlineStyleHandling;

    if (!handling) {
      // 没有特殊处理，直接返回
      return `<${layer.tag} style="${processedStyle}">${content}</${layer.tag}>`;
    }

    // 处理内容中的内联样式
    let processedContent = this.processInlineStyles(content, blockInlineStyles);

    if (handling.needWrapper) {
      // 需要包装层处理内联样式
      const wrapperStyle = handling.wrapperTemplate.includes(
        "{{combinedStyle}}"
      )
        ? processedStyle
        : "";

      const wrappedContent = handling.wrapperTemplate
        .replace("{{combinedStyle}}", wrapperStyle)
        .replace("{{processedContent}}", processedContent);

      return `<${layer.tag} style="${processedStyle}">${wrappedContent}</${layer.tag}>`;
    } else {
      // 直接在当前标签上处理
      return `<${layer.tag} style="${processedStyle}">${processedContent}</${layer.tag}>`;
    }
  }
}

// 主渲染函数
function renderWithInlineStyles(
  category,
  type,
  content,
  blockInlineStyles,
  theme
) {
  const template = flexibleTemplatesWithInlineStyles[category]?.[type];
  if (!template) {
    throw new Error(`Template not found: ${category}.${type}`);
  }

  const processor = new InlineStyleProcessor(theme);

  function buildNestedHTML(layers, currentIndex = 0) {
    if (currentIndex >= layers.length) {
      return content;
    }

    const layer = layers[currentIndex];
    const processedStyle = processor.replaceThemeVars(layer.style);

    if (layer.content) {
      // 这是内容层，需要处理内联样式
      return processor.renderContentLayer(layer, content, blockInlineStyles);
    } else {
      // 这是包装层，继续递归
      const innerHTML = buildNestedHTML(layers, currentIndex + 1);
      return `<${layer.tag} style="${processedStyle}">${innerHTML}</${layer.tag}>`;
    }
  }

  return buildNestedHTML(template.layers);
}

// 使用示例
const theme = {
  primary: "rgb(16, 185, 129)",
  primaryDark: "rgb(5, 150, 105)",
  text: "rgb(4, 120, 87)",
  white: "rgb(255, 255, 255)",
  alpha: {
    25: "rgba(16, 185, 129, 0.25)",
    10: "rgba(16, 185, 129, 0.1)",
  },
  // 强调色 - 绿色主题同色系
  accent: "rgb(34, 197, 94)",      // 亮绿色强调
  secondary: "rgb(22, 163, 74)",   // 中绿色强调
  info: "rgb(6, 78, 59)",          // 深绿色强调
};

// 定义block的内联样式
const blockInlineStyles = {
  strong: "font-weight: 700; color: {{theme.accent}};",
  em: "font-style: italic; color: {{theme.secondary}}; font-weight: 500;",
  code: "font-family: monospace; background: {{theme.alpha.10}}; padding: 0.2em 0.4em; border-radius: 3px; color: {{theme.info}};",
};

// 测试内容（包含内联样式）
const testContent =
  "这是一个<strong>粗体文字</strong>和<em>斜体文字</em>的<code>代码</code>示例";

// 渲染结果
console.log(
  "H1 with inline styles:",
  renderWithInlineStyles(
    "header",
    "h1",
    testContent,
    blockInlineStyles,
    theme
  )
);

console.log(
  "H2 without wrapper:",
  renderWithInlineStyles(
    "header",
    "h2",
    testContent,
    blockInlineStyles,
    theme
  )
);

/* 预期输出：
H1 with inline styles:
<section style="margin: 2em 0; display: flex; justify-content: center;">
  <div style="padding: 1.5em 3em; background: rgb(16, 185, 129); border-radius: 12px; box-shadow: rgba(16, 185, 129, 0.25) 0px 8px 20px;">
    <h1 style="font-size: 20px; font-weight: 700; color: rgb(255, 255, 255); margin: 0; text-align: center;">
      <span style="font-size: 20px; font-weight: 700; color: rgb(255, 255, 255); margin: 0; text-align: center;">
        这是一个<strong style="font-weight: 700; color: rgb(16, 185, 129);">粗体文字</strong>和<em style="font-style: italic; color: rgb(16, 185, 129); font-weight: 500;">斜体文字</em>的<code style="font-family: monospace; background: rgba(16, 185, 129, 0.1); padding: 0.2em 0.4em; border-radius: 3px;">代码</code>示例
      </span>
    </h1>
  </div>
</section>
*/
