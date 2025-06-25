/**
 * HTML模板样式配置文件
 * 用于EditorJS块转换为HTML时的样式渲染
 */



// 内联样式配置
export const blockInlineStyles = {
  strong: {
    fontWeight: 700,
    color: "rgb(34, 197, 94)"
  },
  b: {
    fontWeight: 700,
    color: "rgb(34, 197, 94)"
  },
  em: {
    fontStyle: "italic",
    color: "rgb(22, 163, 74)",
    fontWeight: 500,
    letterSpacing: "0.5px"
  },
  i: {
    fontStyle: "italic",
    color: "rgb(22, 163, 74)",
    fontWeight: 500,
    letterSpacing: "0.5px"
  },
  u: {
    textDecoration: "underline",
    textDecorationColor: "rgb(16, 185, 129)",
    textUnderlineOffset: "3px",
    textDecorationThickness: "2px"
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
    letterSpacing: "0.3px"
  },
  mark: {
    background: "rgba(16, 185, 129, 0.2)",
    padding: "0.1em 0.4em",
    borderRadius: "3px"
  },
  a: {
    color: "rgb(16, 185, 129)",
    textDecoration: "underline",
    textDecorationColor: "rgba(16, 185, 129, 0.6)",
    textUnderlineOffset: "2px"
  },
  sup: {
    color: "rgba(16, 185, 129, 0.8)",
    fontSize: "0.7em",
    marginLeft: "0.2em"
  }
};

// 模板配置
export const flexibleTemplatesWithInlineStyles = {
  header: {
    h1: {
      layers: [
        {
          tag: "section",
          style: {
            fontStyle: "normal",
            fontVariantLigatures: "normal",
            fontVariantCaps: "normal",
            letterSpacing: "0.5px",
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
            fontSize: "20px",
            fontWeight: 600,
            margin: "1.8em 0px 1.2em",
            textAlign: "center",
            lineHeight: 1.4,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            display: "flex",
            justifyContent: "center",
            padding: "0px",
            color: "rgb(4, 120, 87)"
          }
        },
        {
          tag: "section",
          style: {
            display: "inline-block",
            padding: "1em 2.2em",
            color: "rgb(255, 255, 255)",
            background: "linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)",
            borderRadius: "12px",
            boxShadow: "rgba(16, 185, 129, 0.25) 0px 6px 20px -4px, rgba(0, 0, 0, 0.1) 0px 2px 8px -2px"
          }
        },
        {
          tag: "h1",
          style: {
            margin: 0,
            padding: 0,
            fontSize: "inherit",
            fontWeight: "inherit",
            color: "inherit"
          },
          content: true,
          inlineStyleHandling: {
            needWrapper: false,
          },
        },
      ],
    },
    h2: {
      layers: [
        {
          tag: "section",
          style: {
            fontStyle: "normal",
            fontVariantLigatures: "normal",
            fontVariantCaps: "normal",
            letterSpacing: "0.3px",
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
            fontSize: "18px",
            fontWeight: 600,
            margin: "1.5em 0px 1em",
            textAlign: "left",
            lineHeight: 1.4,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            display: "block",
            padding: "0px",
            color: "rgb(4, 120, 87)"
          }
        },
        {
          tag: "section",
          style: {
            display: "inline-flex",
            alignItems: "center",
            padding: "0.8em 1.8em 0.8em 1.2em",
            background: "rgba(16, 185, 129, 0.06)",
            borderLeft: "4px solid rgb(16, 185, 129)",
            borderRadius: "0px 8px 8px 0px",
            minWidth: "fit-content"
          }
        },
        {
          tag: "span",
          style: {
            display: "inline-block",
            width: "8px",
            height: "8px",
            background: "rgb(16, 185, 129)",
            borderRadius: "50%",
            marginRight: "0.8em",
            verticalAlign: "middle"
          }
        },
        {
          tag: "h2",
          style: {
            margin: 0,
            padding: 0,
            fontSize: "inherit",
            fontWeight: "inherit",
            color: "inherit"
          },
          content: true,
          inlineStyleHandling: {
            needWrapper: false
          },
        },
      ],
    },
    h3: {
      layers: [
        {
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
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            display: "block",
            padding: "0px",
            color: "rgb(4, 120, 87)"
          }
        },
        {
          tag: "section",
          style: {
            display: "inline-flex",
            alignItems: "center",
            padding: "0.6em 1.5em 0.6em 1em",
            background: "linear-gradient(90deg, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0.01) 80%, transparent 100%)",
            borderLeft: "3px solid rgba(16, 185, 129, 0.6)",
            borderRadius: "0px 6px 6px 0px",
            minWidth: "fit-content"
          }
        },
        {
          tag: "span",
          style: {
            display: "inline-block",
            width: "6px",
            height: "6px",
            background: "rgba(16, 185, 129, 0.8)",
            borderRadius: "50%",
            marginRight: "0.6em",
            verticalAlign: "middle"
          }
        },
        {
          tag: "h3",
          style: {
            margin: 0,
            padding: 0,
            fontSize: "inherit",
            fontWeight: "inherit",
            color: "inherit"
          },
          content: true,
          inlineStyleHandling: {
              needWrapper: false,
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
            margin: "0.8em 0px",
            textAlign: "left",
            lineHeight: 1.7,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            display: "block",
            padding: "0px"
          }
        },
        {
          tag: "section",
          style: {
            fontSize: "16px",
            color: "rgb(55, 65, 81)",
            letterSpacing: "0.3px",
            padding: "0.5em 0.5em"
          }
        },
        {
          tag: "p",
          style: {
            margin: 0,
            padding: 0
          },
          content: true,
          inlineStyleHandling: {
              needWrapper: false
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
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            display: "block",
            padding: "0px"
          }
        },
        {
          tag: "section",
          style: {
            background: "rgba(16, 185, 129, 0.06)",
            borderLeft: "4px solid rgb(16, 185, 129)",
            padding: "1.2em 1.8em",
            borderRadius: "0px 8px 8px 0px",
            boxShadow: "rgba(16, 185, 129, 0.1) 0px 2px 8px -2px"
          }
        },
        {
          tag: "blockquote",
          style: {
            fontSize: "16px",
            color: "rgb(55, 65, 81)",
            fontStyle: "italic",
            margin: "0px 0px 1em 0px",
            letterSpacing: "0.2px"
          },
          content: true,
          inlineStyleHandling: {
             needWrapper: false
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
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
            display: "flex",
            justifyContent: "center",
            padding: "0px"
          }
        },
        {
          tag: "hr",
          style: {
            width: "80%",
            height: "2px",
            background: "linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.2) 20%, rgba(16, 185, 129, 0.6) 50%, rgba(16, 185, 129, 0.2) 80%, transparent 100%)",
            borderRadius: "1px",
            border: "none"
          }
        },
      ],
    },
  },

  raw: {
    default: {
      layers: [
        {
          tag: "div",
          style: {},
          content: true
        },
      ],
    },
  },

  image: {
    default: {
      layers: [
        {
          tag: "section",
          style: {}
        },
        {
          tag: "figure",
          style: {
            margin: "10px 0px",
            padding: "0px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            visibility: "visible"
          },
        },
        {
          tag: "img",
          style: {
            visibility: "visible",
            maxWidth: "100%",
            height: "auto"
          },
          content: true
        },
      ],
    },
  },

  code: {
    default: {
      layers: [
        {
          tag: "section",
          style: {}
        },
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
            border: "1px solid #1a6840"
          },
        },
        {
          tag: "code",
          style: {
            "--md-primary-color": "rgba(26,104,64,1)",
            textAlign: "left",
            lineHeight: 1.75,
            fontFamily: "'Fira Code', Menlo, 'Operator Mono', Consolas, Monaco, monospace",
            fontSize: "90%",
            margin: 0,
            whiteSpace: "pre",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            color: "#e0e0e0"
          },
          content: true,
          inlineStyleHandling: {
             needWrapper: false,
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
          style: {
            textIndent: "0px",
            margin: "1.2em 0"
          },
        },
        {
          tag: "ol",
          style: {
            listStyleType: "decimal",
            paddingLeft: "2em"
          },
          content: true
        },
      ],
    },
    unordered: {
      layers: [
        {
          tag: "section",
          style: {
            textIndent: "0px",
            margin: "1.2em 0"
          },
        },
        {
          tag: "ul",
          style: {
            listStyleType: "disc",
            paddingLeft: "2em"
          },
          content: true
        },
      ],
    },
    checklist: {
      layers: [
        {
          tag: "section",
          style: {
            textIndent: "0px",
            margin: "1.2em 0"
          },
        },
        {
          tag: "ul",
          style: {
            listStyle: "none",
            paddingLeft: "1em"
          },
          content: true
        },
      ],
    },
  },

  listItem: {
    default: {
      layers: [
        {
          tag: "li",
          style: {
            margin: "0.3em 0",
            lineHeight: 1.6
          },
          content: true,
          inlineStyleHandling: {
              needWrapper: false,
            },
        },
      ],
    },
    checklist: {
      layers: [
        {
          tag: "li",
          style: {
            margin: "0.3em 0",
            lineHeight: 1.6
          },
        },
        {
          tag: "span",
          style: {
            marginRight: "0.5em",
            fontFamily: "monospace",
            fontSize: "1.1em",
            color: "rgb(16, 185, 129)"
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
  blockInlineStyles,
  flexibleTemplatesWithInlineStyles,
};
