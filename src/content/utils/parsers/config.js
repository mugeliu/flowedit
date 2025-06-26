/**
 * 配置文件
 * 包含解析器的各种配置选项和默认设置
 */
/**
 * HTML模板样式配置文件
 * 用于EditorJS块转换为HTML时的样式渲染
 */

// 内联样式配置
export const inlineStyles = {
  strong: {
    fontWeight: 700,
    color: "rgb(34, 197, 94)",
  },
  b: {
    fontWeight: 700,
    color: "rgb(34, 197, 94)",
  },
  em: {
    fontStyle: "italic",
    color: "rgb(22, 163, 74)",
    fontWeight: 500,
    letterSpacing: "0.5px",
  },
  i: {
    fontStyle: "italic",
    color: "rgb(22, 163, 74)",
    fontWeight: 500,
    letterSpacing: "0.5px",
  },
  u: {
    textDecoration: "underline",
    textDecorationColor: "rgb(16, 185, 129)",
    textUnderlineOffset: "3px",
    textDecorationThickness: "2px",
  },
  code: {
    fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
    fontSize: "0.85em",
    background: "rgba(16, 185, 129, 0.1)",
    color: "rgb(6, 78, 59)",
    padding: "0.25em 0.6em",
    borderRadius: "5px",
    border: "1px solid rgba(16, 185, 129, 0.25)",
    fontWeight: 500,
    letterSpacing: "0.3px",
  },
  mark: {
    background: "rgba(16, 185, 129, 0.2)",
    padding: "0.1em 0.4em",
    borderRadius: "3px",
  },
  a: {
    color: "rgb(16, 185, 129)",
    textDecoration: "underline",
    textDecorationColor: "rgba(16, 185, 129, 0.6)",
    textUnderlineOffset: "2px",
  },
  sup: {
    color: "rgba(16, 185, 129, 0.8)",
    fontSize: "0.7em",
    marginLeft: "0.2em",
  },
};

// 模板配置
export const blockTemplates = {
  header: {
    h1:{
      tag: "section",
      style: {
        textAlign: "center",
        margin: "1.8em auto 1.2em", 
        width: "92%",
        maxWidth: "600px"
      },
      children: [
        {
          tag: "h1",
          style: {
            display: "inline-block",
            padding: "0.8em 2.2em",
            margin: "0",
            fontSize: "20px",
            fontWeight: "600",
            lineHeight: "1.2",
            color: "#fff",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: "12px",
            boxShadow: "0 6px 20px -4px rgba(16, 185, 129, 0.25), 0 2px 8px -2px rgba(0,0,0,0.1)",
            WebkitTextFillColor: "currentColor"
          },
          content: true,
          inlineStyleHandling: {
            needWrapper: false,
          },
        }
      ]
    },
    h2: {
      tag: "section",
      style: {
        margin: "1.5em 0 1em"
      },
      children: [
        {
          tag: "h2",
          style: {
            display: "inline-flex",
            alignItems: "center",
            padding: "0.8em 1.8em 0.8em 1.2em",
            margin: "0",
            fontSize: "18px",
            fontWeight: "600",
            lineHeight: "1.4",
            fontFamily: "-apple-system, sans-serif",
            color: "#047857",
            background: "rgba(16, 185, 129, 0.06)",
            borderLeft: "4px solid #10b981",
            borderRadius: "0 8px 8px 0"
          },
          content: true,
          inlineStyleHandling: {
            needWrapper: false,
          },
          children: [
            {
              tag: "span",
              style: {
                display: "block",
                width: "8px",
                height: "8px",
                background: "#10b981",
                borderRadius: "50%",
                marginRight: "0.8em",
                flexShrink: "0"
              }
            },
          ]
        }
      ]
    },
    h3: {
      tag: "section",
      style: {
        fontStyle: "normal",
        fontVariantLigatures: "normal",
        fontVariantCaps: "normal",
        letterSpacing: "0.2px",
        orphans: 2,
        textIndent: "0px",
        textTransform: "none",
        widows: 2,
        wordSpacing: "0px",
        WebkitTextStrokeWidth: "0px",
        whiteSpace: "normal",
        textDecorationThickness: "initial",
        textDecorationStyle: "initial",
        textDecorationColor: "initial",
        boxSizing: "border-box",
        borderWidth: "0px",
        borderStyle: "solid",
        fontSize: "17px",
        fontWeight: 500,
        margin: "1.2em 0px 0.8em",
        textAlign: "left",
        lineHeight: 1.5,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        display: "block",
        padding: "0px",
        color: "rgb(4, 120, 87)",
      },
      children: [
        {
          tag: "section",
          style: {
            display: "inline-flex",
            alignItems: "center",
            padding: "0.6em 1.5em 0.6em 1em",
            background:
              "linear-gradient(90deg, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0.01) 80%, transparent 100%)",
            borderLeft: "3px solid rgba(16, 185, 129, 0.6)",
            borderRadius: "0px 6px 6px 0px",
            minWidth: "fit-content",
          },
          children: [
            {
              tag: "span",
              style: {
                display: "inline-block",
                width: "6px",
                height: "6px",
                background: "rgba(16, 185, 129, 0.8)",
                borderRadius: "50%",
                marginRight: "0.6em",
                verticalAlign: "middle",
              },
            },
            {
              tag: "h3",
              style: {
                margin: 0,
                padding: 0,
                fontSize: "inherit",
                fontWeight: "inherit",
                color: "inherit",
              },
              content: true,
              inlineStyleHandling: {
                needWrapper: false,
              },
            },
          ],
        },
      ],
    },
  },

  paragraph: {
    default: {
      tag: "p",
      style: {
        // 您指定的新样式
        fontSize: "16px",
        color: "rgb(55, 65, 81)",
        letterSpacing: "0.3px",
        padding: "0.5em 0.5em",
        
        // 保留的必要兼容性样式
        margin: "0",
        lineHeight: "1.7",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        WebkitTextFillColor: "currentColor",
        textAlign: "justify",
        wordBreak: "break-word"
      },
      content: true,
      inlineStyleHandling: {
        needWrapper: false,
      }
    },
  },

  quote: {
    default: {
      tag: "section",
      style: {
        fontStyle: "normal",
        fontVariantLigatures: "normal",
        fontVariantCaps: "normal",
        orphans: 2,
        textIndent: "0px",
        textTransform: "none",
        widows: 2,
        wordSpacing: "0px",
        WebkitTextStrokeWidth: "0px",
        whiteSpace: "normal",
        textDecorationThickness: "initial",
        textDecorationStyle: "initial",
        textDecorationColor: "initial",
        boxSizing: "border-box",
        borderWidth: "0px",
        borderStyle: "solid",
        margin: "1.5em 0px",
        textAlign: "left",
        lineHeight: 1.6,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        display: "block",
        padding: "0px",
      },
      children: [
        {
          tag: "section",
          style: {
            background: "rgba(16, 185, 129, 0.06)",
            borderLeft: "4px solid rgb(16, 185, 129)",
            padding: "1.2em 1.8em",
            borderRadius: "0px 8px 8px 0px",
            boxShadow: "rgba(16, 185, 129, 0.1) 0px 2px 8px -2px",
          },
          children: [
            {
              tag: "blockquote",
              style: {
                fontSize: "16px",
                color: "rgb(55, 65, 81)",
                fontStyle: "italic",
                margin: "0px 0px 1em 0px",
                letterSpacing: "0.2px",
              },
              content: true,
              inlineStyleHandling: {
                needWrapper: false,
              },
            },
          ],
        },
      ],
    },
  },

  delimiter: {
    default: {
      tag: "section",
      style: {
        fontStyle: "normal",
        fontVariantLigatures: "normal",
        fontVariantCaps: "normal",
        orphans: 2,
        textIndent: "0px",
        textTransform: "none",
        widows: 2,
        wordSpacing: "0px",
        WebkitTextStrokeWidth: "0px",
        whiteSpace: "normal",
        textDecorationThickness: "initial",
        textDecorationStyle: "initial",
        textDecorationColor: "initial",
        boxSizing: "border-box",
        borderWidth: "0px",
        borderStyle: "solid",
        margin: "2em 0px",
        textAlign: "center",
        lineHeight: 1,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        padding: "0px",
      },
      children: [
        {
          tag: "hr",
          style: {
            width: "80%",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.2) 20%, rgba(16, 185, 129, 0.6) 50%, rgba(16, 185, 129, 0.2) 80%, transparent 100%)",
            borderRadius: "1px",
            border: "none",
          },
        },
      ],
    },
  },

  raw: {
    default: {
      //tag: "section",
      style: {},
      content: true,
    },
  },

  image: {
    default: {
      tag: "section",
      style: {},
      children: [
        {
          tag: "figure",
          style: {
            margin: "10px 0px",
            padding: "0px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            visibility: "visible",
          },
          children: [
            {
              tag: "img",
              style: {
                visibility: "visible",
                maxWidth: "100%",
                height: "auto",
              },
              content: true,
            },
          ],
        },
      ],
    },
  },

  code: {
    default: {
      tag: "section",
      style: {},
      children: [
        {
          tag: "pre",
          style: {
            "--md-primary-color": "rgba(26,104,64,1)",
            textAlign: "left",
            lineHeight: 1.5,
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            fontSize: "90%",
            overflowX: "auto",
            borderRadius: "8px",
            padding: "1em",
            margin: "10px 8px",
            backgroundColor: "#2d2d2d",
            border: "1px solid #1a6840",
          },
          children: [
            {
              tag: "code",
              style: {
                "--md-primary-color": "rgba(26,104,64,1)",
                textAlign: "left",
                lineHeight: 1.75,
                fontFamily:
                  "'Fira Code', Menlo, 'Operator Mono', Consolas, Monaco, monospace",
                fontSize: "90%",
                margin: 0,
                whiteSpace: "pre",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                color: "#e0e0e0",
              },
              content: true,
              inlineStyleHandling: {
                needWrapper: false,
              },
            },
          ],
        },
      ],
    },
  },

  List: {
    ordered: {
      tag: "section",
      style: {
        textIndent: "0px",
        margin: "1.2em 0",
      },
      children: [
        {
          tag: "ol",
          style: {
            listStyleType: "decimal",
            paddingLeft: "2em",
          },
          content: true,
        },
      ],
    },
    unordered: {
      tag: "section",
      style: {
        textIndent: "0px",
        margin: "1.2em 0",
      },
      children: [
        {
          tag: "ul",
          style: {
            listStyleType: "disc",
            paddingLeft: "2em",
          },
          content: true,
        },
      ],
    },
    checklist: {
      tag: "section",
      style: {
        textIndent: "0px",
        margin: "1.2em 0",
      },
      children: [
        {
          tag: "ul",
          style: {
            listStyle: "none",
            paddingLeft: "1em",
          },
          content: true,
        },
      ],
    },
  },

  listItem: {
    default: {
      tag: "li",
      style: {
        margin: "0.3em 0",
        lineHeight: 1.6,
      },
      content: true,
      inlineStyleHandling: {
        needWrapper: false,
      },
    },
    checklist: {
      tag: "li",
      style: {
        margin: "0.3em 0",
        lineHeight: 1.6,
      },
      children: [
        {
          tag: "span",
          style: {
            marginRight: "0.5em",
            fontFamily: "monospace",
            fontSize: "1.1em",
            color: "rgb(16, 185, 129)",
          },
        },
        {
          tag: "span",
          style: {},
          content: true,
          inlineStyleHandling: {
            needWrapper: false,
          },
        },
      ],
    },
  },
};

// 默认导出
export default {
  inlineStyles,
  blockTemplates,
};
