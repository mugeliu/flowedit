// 灵活的多层嵌套模板结构示例
const flexibleTemplates = {
  header: {
    // 变体1：简单3层结构
    simple: {
      h1: {
        layers: [
          {
            tag: "section",
            style: "margin: 2em 0; display: flex; justify-content: center;",
          },
          {
            tag: "div",
            style:
              "padding: 1em 2em; background: {{theme.primary}}; border-radius: 12px;",
          },
          {
            tag: "span",
            style: "font-size: 20px; font-weight: 700; color: {{theme.white}};",
            content: true, // 标记这一层放置内容
          },
        ],
      },
    },

    // 变体2：复杂5层结构
    complex: {
      h1: {
        layers: [
          {
            tag: "section",
            style:
              "margin: 2.5em 0; position: relative; display: flex; justify-content: center;",
          },
          {
            tag: "div",
            style:
              "position: relative; transform: perspective(1000px) rotateY(-5deg);",
          },
          {
            tag: "section",
            style:
              "padding: 0.5em; background: linear-gradient(45deg, {{theme.primary}}, {{theme.primaryDark}}); border-radius: 16px; box-shadow: {{theme.alpha.25}} 0px 10px 30px -8px;",
          },
          {
            tag: "div",
            style:
              "padding: 1.5em 3em; background: {{theme.white}}; border-radius: 12px; position: relative;",
          },
          {
            tag: "h1",
            style:
              "font-size: 22px; font-weight: 800; color: {{theme.text}}; text-align: center; letter-spacing: 1px; margin: 0;",
            content: true,
          },
        ],
      },

      h2: {
        layers: [
          {
            tag: "section",
            style: "margin: 1.8em 0 1.2em; position: relative;",
          },
          {
            tag: "div",
            style:
              "display: inline-flex; align-items: center; position: relative;",
          },
          {
            tag: "span",
            style:
              "display: inline-block; width: 12px; height: 12px; background: {{theme.primary}}; border-radius: 50%; margin-right: 1em; box-shadow: {{theme.alpha.40}} 0px 3px 10px;",
          },
          {
            tag: "section",
            style:
              "padding: 0.8em 2em 0.8em 1.5em; background: {{theme.primaryLight}}; border-radius: 0 10px 10px 0; border-left: 4px solid {{theme.primary}};",
          },
          {
            tag: "h2",
            style:
              "font-size: 18px; font-weight: 600; color: {{theme.text}}; margin: 0; line-height: 1.4;",
            content: true,
          },
        ],
      },
    },

    // 变体3：超复杂结构 - 带装饰元素
    ultra: {
      h1: {
        layers: [
          {
            tag: "section",
            style:
              "margin: 3em 0 2em; position: relative; display: flex; justify-content: center; align-items: center;",
          },
          // 背景装饰层
          {
            tag: "div",
            style:
              "position: absolute; width: 200px; height: 200px; background: radial-gradient(circle, {{theme.alpha.10}} 0%, transparent 70%); border-radius: 50%; z-index: 0;",
          },
          // 主容器
          {
            tag: "div",
            style:
              "position: relative; z-index: 2; transform: perspective(800px) rotateX(10deg);",
          },
          // 外边框
          {
            tag: "section",
            style:
              "padding: 3px; background: linear-gradient(135deg, {{theme.primary}} 0%, {{theme.primaryDark}} 50%, {{theme.primary}} 100%); border-radius: 20px;",
          },
          // 内容区域
          {
            tag: "div",
            style:
              "padding: 2em 3.5em; background: {{theme.white}}; border-radius: 17px; position: relative; overflow: hidden;",
          },
          // 内容前的装饰线
          {
            tag: "div",
            style:
              "position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, {{theme.primary}} 0%, {{theme.primaryDark}} 100%);",
          },
          // 实际文字内容
          {
            tag: "h1",
            style:
              "font-size: 24px; font-weight: 900; color: {{theme.text}}; text-align: center; letter-spacing: 1.5px; margin: 0; text-transform: uppercase; position: relative; z-index: 1;",
            content: true,
          },
        ],
      },
    },
  },
};

// 模板渲染函数
function renderFlexibleTemplate(category, variant, type, content, theme) {
  const template = flexibleTemplates[category]?.[variant]?.[type];
  if (!template) {
    throw new Error(`Template not found: ${category}.${variant}.${type}`);
  }

  // 替换主题变量的函数
  function replaceThemeVars(styleString, themeObj) {
    return styleString.replace(
      /\{\{theme\.(\w+(?:\.\w+)*)\}\}/g,
      (match, path) => {
        const value = path
          .split(".")
          .reduce((obj, key) => obj?.[key], themeObj);
        return value || match;
      }
    );
  }

  // 递归构建嵌套HTML
  function buildNestedHTML(layers, currentIndex = 0) {
    if (currentIndex >= layers.length) {
      return content;
    }

    const layer = layers[currentIndex];
    const processedStyle = replaceThemeVars(layer.style, theme);

    if (layer.content) {
      // 这是内容层
      return `<${layer.tag} style="${processedStyle}">${content}</${layer.tag}>`;
    } else {
      // 这是包装层，继续递归
      const innerHTML = buildNestedHTML(layers, currentIndex + 1);
      return `<${layer.tag} style="${processedStyle}">${innerHTML}</${layer.tag}>`;
    }
  }

  return buildNestedHTML(template.layers);
}

// 主题配置
const theme = {
  primary: "rgb(16, 185, 129)",
  primaryDark: "rgb(5, 150, 105)",
  primaryLight: "rgba(16, 185, 129, 0.06)",
  text: "rgb(4, 120, 87)",
  white: "rgb(255, 255, 255)",
  alpha: {
    10: "rgba(16, 185, 129, 0.1)",
    25: "rgba(16, 185, 129, 0.25)",
    40: "rgba(16, 185, 129, 0.4)",
  },
};

// 使用示例
console.log(
  "简单结构:",
  renderFlexibleTemplate("header", "simple", "h1", "标题内容", theme)
);
console.log(
  "复杂结构:",
  renderFlexibleTemplate("header", "complex", "h1", "复杂标题", theme)
);
console.log(
  "超复杂结构:",
  renderFlexibleTemplate("header", "ultra", "h1", "超级标题", theme)
);

// 输出结果示例：
/*
简单结构会生成：
<section style="margin: 2em 0; display: flex; justify-content: center;">
  <div style="padding: 1em 2em; background: rgb(16, 185, 129); border-radius: 12px;">
    <span style="font-size: 20px; font-weight: 700; color: rgb(255, 255, 255);">标题内容</span>
  </div>
</section>

复杂结构会生成多达5层的嵌套...
超复杂结构会生成多达7层的嵌套，包含装饰元素...
*/
