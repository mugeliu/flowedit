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
    h1: {
      tag: "section",
      style: {
        textAlign: "center",
        margin: "1.8em auto 1.2em",
        width: "92%",
        maxWidth: "600px",
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
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: "12px",
            boxShadow:
              "0 6px 20px -4px rgba(16, 185, 129, 0.25), 0 2px 8px -2px rgba(0,0,0,0.1)",
            WebkitTextFillColor: "currentColor",
          },
          content: true,
          inlineStyleHandling: {
            needWrapper: false,
          },
        },
      ],
    },
    h2: {
      tag: "section",
      style: {
        margin: "1.5em 0 1em",
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
            borderRadius: "0 8px 8px 0",
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
                flexShrink: "0",
              },
            },
          ],
        },
      ],
    },
    h3: {
      tag: "section",
      style: {
        margin: "1.5em 0 1em",
      },
      children: [
        {
          tag: "h3",
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
            borderRadius: "0 8px 8px 0",
          },
          content: true,
          inlineStyleHandling: {
            needWrapper: false,
          },
          children: [
            {
              tag: "span",
              style: {
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: "rgba(16, 185, 129, 0.8)",
                borderRadius: "50%",
                marginRight: "0.8em",
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
        padding: "0.3em 0.5em",

        // 保留的必要兼容性样式
        margin: "0 0 0.6em 0",
        lineHeight: "1.5",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        WebkitTextFillColor: "currentColor",
        textAlign: "justify",
        wordBreak: "break-word",
      },
      content: true,
      inlineStyleHandling: {
        needWrapper: false,
      },
    },
  },

  quote: {
    default: {
      tag: "section",
      style: {
        borderLeft: "4px solid #10b981",
        background: "rgba(16, 185, 129, 0.06)",
        padding: "1.2em 1.8em",
        borderRadius: "0 8px 8px 0",
        boxShadow: "rgba(16, 185, 129, 0.1) 0 2px 8px -2px",
        margin: "1em 0",
        fontFamily: "-apple-system, sans-serif",
      },
      children: [
        {
          tag: "p",
          style: {
            margin: "0 0 12px 0",
            color: "#516673",
            fontStyle: "italic",
            fontSize: "16px",
            lineHeight: 1.6,
          },
          content: true,
          inlineStyleHandling: {
            needWrapper: false,
          },
        },
      ],
    },
  },

  delimiter: {
    default: {
      tag: "section",
      style: {
        display: "flex",
        justifyContent: "center",
        margin: "2em 0",
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
      tag: "figure",
      style: {
        margin: "0.8em 0",
        padding: "0",
        maxWidth: "100%", // 防止图片溢出
        lineHeight: 0, // 消除图片底部间隙
        display: "block",
        textAlign: "center",
      },
      content: true,
    },
  },

  code: {
    default: {
      tag: "section",
      style: {
      "fontFamily": "Optima, PingFang SC, serif",
      "fontSize": "16px",
      "lineHeight": "1.75"
      },
      children: [
        {
          tag: "pre",
          style: {
            "background": "#1e1e1e",
            "border": "1px solid rgba(255, 255, 255, 0.1)",
            "borderRadius": "8px",
            "fontFamily": "'Fira Code', monospace",
            "fontSize": "90%",
            "lineHeight": "1.5",
            "margin": "10px 8px 0",
            "overflowX": "auto",
            "padding": "1em",
            "whiteSpace": "pre-wrap",
            "color": "#eee"
          },
          children: [
            {
              tag: "section",
              style: {
                "marginBottom": "4px"
              },
              children: [
                {
                  tag: "svg",
                  attrs: {
                    "viewBox": "0 0 450 130",
                    "height": "13",
                    "width": "45"
                  },
                  children: [
                    {
                      tag: "ellipse",
                      attrs: {
                        "fill": "#ED6C60",
                        "stroke": "#DC3C36",
                        "strokeWidth": "2",
                        "cx": "50",
                        "cy": "65",
                        "rx": "50",
                        "ry": "52"
                      }
                    },
                    {
                      tag: "ellipse",
                      attrs: {
                        "fill": "#F7C151",
                        "stroke": "#DA9721",
                        "strokeWidth": "2",
                        "cx": "225",
                        "cy": "65",
                        "rx": "50",
                        "ry": "52"
                      }
                    },
                    {
                  tag: "ellipse",
                  attrs: {
                    "fill": "#64C856",
                    "stroke": "#1BA125",
                    "strokeWidth": "2",
                    "cx": "400",
                    "cy": "65",
                    "rx": "50",
                    "ry": "52"
                  }
                }
                ]
                },
              ]
            },
            {
              tag: "code",
              style: {
                "display": "block",
                "margin": "0",
                "padding": "0.5em 1em 1em",
                "whiteSpace": "pre",           // 👈 强制保持换行和缩进
                "overflowX": "auto"            // 👈 添加横向滚动支持
              },
              content: true,
            }
          ]
          
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
          tag: "section",
          style: {},
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
      ],
    },
  },
};

// 默认导出
export default {
  inlineStyles,
  blockTemplates,
};
