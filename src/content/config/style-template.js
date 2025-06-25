/**
 * HTML模板样式配置文件
 * 用于EditorJS块转换为HTML时的样式渲染
 */

// 主题配置
export const theme = {
  primary: "rgb(16, 185, 129)",
  primaryDark: "rgb(5, 150, 105)",
  text: "rgb(4, 120, 87)",
  textSecondary: "rgb(55, 65, 81)",
  white: "rgb(255, 255, 255)",
  alpha: {
    light: "rgba(16, 185, 129, 0.06)",
    subtle: "rgba(16, 185, 129, 0.1)",
    soft: "rgba(16, 185, 129, 0.2)",
    medium: "rgba(16, 185, 129, 0.25)",
    strong: "rgba(16, 185, 129, 0.6)",
    bold: "rgba(16, 185, 129, 0.8)",
  },
  // 强调色 - 绿色主题同色系
  accent: "rgb(34, 197, 94)",      // 亮绿色强调
  secondary: "rgb(22, 163, 74)",   // 中绿色强调
  info: "rgb(6, 78, 59)",          // 深绿色强调
};

// 内联样式配置
export const blockInlineStyles = {
  strong: "font-weight: 700; color: {{theme.accent}};",
  b: "font-weight: 700; color: {{theme.accent}};",
  em: "font-style: italic; color: {{theme.secondary}}; font-weight: 500; letter-spacing: 0.5px;",
  i: "font-style: italic; color: {{theme.secondary}}; font-weight: 500; letter-spacing: 0.5px;",
  u: "text-decoration: underline; text-decoration-color: {{theme.primary}}; text-underline-offset: 3px; text-decoration-thickness: 2px;",
  code: "font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 0.85em; background: {{theme.alpha.subtle}}; color: {{theme.info}}; padding: 0.25em 0.6em; border-radius: 5px; border: 1px solid {{theme.alpha.medium}}; font-weight: 500; letter-spacing: 0.3px;",
  mark: "background: {{theme.alpha.soft}}; padding: 0.1em 0.4em; border-radius: 3px;",
  a: "color: {{theme.primary}}; text-decoration: underline; text-decoration-color: {{theme.alpha.strong}}; text-underline-offset: 2px;",
  sup: "color: {{theme.alpha.bold}}; font-size: 0.7em; margin-left: 0.2em;",
};

// 模板配置
export const flexibleTemplatesWithInlineStyles = {
  header: {
    h1: {
      layers: [
        {
          tag: "section",
          style: "font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: 0.5px; orphans: 2; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; box-sizing: border-box; border-width: 0px; border-style: solid; font-size: 20px; font-weight: 600; margin: 1.8em 0px 1.2em; text-align: center; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: flex; justify-content: center; padding: 0px; color: {{theme.text}};",
        },
        {
          tag: "section",
          style: "display: inline-block; padding: 1em 2.2em; color: {{theme.white}}; background: linear-gradient(135deg, {{theme.primary}} 0%, {{theme.primaryDark}} 100%); border-radius: 12px; box-shadow: {{theme.alpha.medium}} 0px 6px 20px -4px, rgba(0, 0, 0, 0.1) 0px 2px 8px -2px;",
        },
        {
          tag: "h1",
          style: "margin: 0; padding: 0; font-size: inherit; font-weight: inherit; color: inherit;",
          content: true,
          inlineStyleHandling: {
            strategy: "merge",
            needWrapper: false,
            priority: "template",
          },
        },
      ],
    },
    h2: {
      layers: [
        {
          tag: "section",
          style: "font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: 0.3px; orphans: 2; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; box-sizing: border-box; border-width: 0px; border-style: solid; font-size: 18px; font-weight: 600; margin: 1.5em 0px 1em; text-align: left; line-height: 1.4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: block; padding: 0px; color: {{theme.text}};",
        },
        {
          tag: "section",
          style: "display: inline-flex; align-items: center; padding: 0.8em 1.8em 0.8em 1.2em; background: {{theme.alpha.light}}; border-left: 4px solid {{theme.primary}}; border-radius: 0px 8px 8px 0px; min-width: fit-content;",
        },
        {
          tag: "span",
          style: "display: inline-block; width: 8px; height: 8px; background: {{theme.primary}}; border-radius: 50%; margin-right: 0.8em; vertical-align: middle;",
        },
        {
          tag: "h2",
          style: "margin: 0; padding: 0; font-size: inherit; font-weight: inherit; color: inherit;",
          content: true,
          inlineStyleHandling: {
            strategy: "merge",
            needWrapper: false,
            priority: "template",
          },
        },
      ],
    },
    h3: {
      layers: [
        {
          tag: "section",
          style: "font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; letter-spacing: 0.2px; orphans: 2; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; box-sizing: border-box; border-width: 0px; border-style: solid; font-size: 17px; font-weight: 500; margin: 1.2em 0px 0.8em; text-align: left; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: block; padding: 0px; color: {{theme.text}};",
        },
        {
          tag: "section",
          style: "display: inline-flex; align-items: center; padding: 0.6em 1.5em 0.6em 1em; background: linear-gradient(90deg, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0.01) 80%, transparent 100%); border-left: 3px solid {{theme.alpha.strong}}; border-radius: 0px 6px 6px 0px; min-width: fit-content;",
        },
        {
          tag: "span",
          style: "display: inline-block; width: 6px; height: 6px; background: {{theme.alpha.bold}}; border-radius: 50%; margin-right: 0.6em; vertical-align: middle;",
        },
        {
          tag: "h3",
          style: "margin: 0; padding: 0; font-size: inherit; font-weight: inherit; color: inherit;",
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

  paragraph: {
    default: {
      layers: [
        {
          tag: "section",
          style: "font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; orphans: 2; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; box-sizing: border-box; border-width: 0px; border-style: solid; margin: 0.8em 0px; text-align: left; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: block; padding: 0px;",
        },
        {
          tag: "section",
          style: "font-size: 16px; color: {{theme.textSecondary}}; letter-spacing: 0.3px; padding: 0.5em 0.5em;",
        },
        {
          tag: "p",
          style: "margin: 0; padding: 0;",
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

  quote: {
    default: {
      layers: [
        {
          tag: "section",
          style: "font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; orphans: 2; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; box-sizing: border-box; border-width: 0px; border-style: solid; margin: 1.5em 0px; text-align: left; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: block; padding: 0px;",
        },
        {
          tag: "section",
          style: "background: {{theme.alpha.light}}; border-left: 4px solid {{theme.primary}}; padding: 1.2em 1.8em; border-radius: 0px 8px 8px 0px; box-shadow: {{theme.alpha.subtle}} 0px 2px 8px -2px;",
        },
        {
          tag: "blockquote",
          style: "font-size: 16px; color: {{theme.textSecondary}}; font-style: italic; margin: 0px 0px 1em 0px; letter-spacing: 0.2px;",
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

  delimiter: {
    default: {
      layers: [
        {
          tag: "section",
          style: "font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; orphans: 2; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial; box-sizing: border-box; border-width: 0px; border-style: solid; margin: 2em 0px; text-align: center; line-height: 1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; display: flex; justify-content: center; padding: 0px;",
        },
        {
          tag: "hr",
          style: "width: 80%; height: 2px; background: linear-gradient(90deg, transparent 0%, {{theme.alpha.soft}} 20%, {{theme.alpha.strong}} 50%, {{theme.alpha.soft}} 80%, transparent 100%); border-radius: 1px; border: none;",
          content: true,
        },
      ],
    },
  },

  raw: {
    default: {
      layers: [
        {
          tag: "div",
          style: "",
          content: true,
        },
      ],
    },
  },

  image: {
    default: {
      layers: [
        {
          tag: "section",
          style: "",
        },
        {
          tag: "figure",
          style: "margin: 10px 0px; padding: 0px; display: flex; flex-direction: column; justify-content: center; align-items: center; visibility: visible;",
        },
        {
          tag: "img",
          style: "visibility: visible; max-width: 100%; height: auto;",
          content: true,
        },
      ],
    },
  },

  code: {
    default: {
      layers: [
        {
          tag: "section",
          style: "",
        },
        {
          tag: "pre",
          style: "--md-primary-color: rgba(26,104,64,1); text-align: left; line-height: 1.5; font-family: Menlo, Monaco, 'Courier New', monospace; font-size: 90%; overflow-x: auto; border-radius: 8px; padding: 1em; margin: 10px 8px; background-color: #2d2d2d; border: 1px solid #1a6840;",
        },
        {
          tag: "code",
          style: "--md-primary-color: rgba(26,104,64,1); text-align: left; line-height: 1.75; font-family: 'Fira Code', Menlo, 'Operator Mono', Consolas, Monaco, monospace; font-size: 90%; margin: 0; white-space: pre; word-wrap: break-word; overflow-wrap: break-word; color: #e0e0e0;",
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

  List: {
    ordered: {
      layers: [
        {
          tag: "section",
          style: "text-indent: 0px; margin: 1.2em 0;",
        },
        {
          tag: "ol",
          style: "list-style-type: {{listStyle}}; padding-left: 2em;",
          content: true,
        },
      ],
    },
    unordered: {
      layers: [
        {
          tag: "section",
          style: "text-indent: 0px; margin: 1.2em 0;",
        },
        {
          tag: "ul",
          style: "list-style-type: disc; padding-left: 2em;",
          content: true,
        },
      ],
    },
    checklist: {
      layers: [
        {
          tag: "section",
          style: "text-indent: 0px; margin: 1.2em 0;",
        },
        {
          tag: "ul",
          style: "list-style: none; padding-left: 1em;",
          content: true,
        },
      ],
    },
  },

  listItem: {
    default: {
      layers: [
        {
          tag: "li",
          style: "margin: 0.3em 0; line-height: 1.6;",
          content: true,
          inlineStyleHandling: {
            strategy: "merge",
            needWrapper: false,
            priority: "template",
          },
        },
      ],
    },
    checklist: {
      layers: [
        {
          tag: "li",
          style: "margin: 0.3em 0; line-height: 1.6;",
        },
        {
          tag: "span",
          style: "margin-right: 0.5em; font-family: monospace; font-size: 1.1em; color: {{theme.primary}};",
        },
        {
          tag: "span",
          style: "",
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

// 默认导出
export default {
  theme,
  blockInlineStyles,
  flexibleTemplatesWithInlineStyles,
};
