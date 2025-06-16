/**
 * HTML模板样式配置文件
 * 包含所有块类型的HTML模板和内联样式配置
 * 用于EditorJS块转换为HTML时的样式渲染
 */

/**
 * HTML模板配置
 * 每个块类型对应不同的模板变体，包含完整的内联样式
 * 所有样式都在此处集中管理
 */
export const HTML_TEMPLATES = {
  // 头部模板
  head: `<section data-mpa-template="t" data-mpa-template-id="23968" data-mpa-category="style_single_material"><section style="display:flex;flex-direction:column;padding:0 10px;" data-mid=""><section style="display:flex;flex-direction:column;align-self:flex-start;" data-mid=""><section nodeleaf="" style="display:flex;justify-content:center;align-items:center;z-index:1;width:16px;margin:0 0 -1px 25px;" data-mid=""><img src="https://mmbiz.qpic.cn/mmbiz_png/dEf5U8O2YzjX7RPfmgLtXZGQ4emxXdzQs0UcN2m15pprg9EBQ6X6wYZvncMFvgT45MTASpAn6tyLMN2ibLGiawRA/0?from=appmsg" alt="" style="display:block;" data-mid=""></section><section style="background:#FFFFFF;border:1px solid #1a6840;padding:6px 18px 5px 19px;text-align:left;border-radius:32px;" data-mid=""><p yb-mpa-mark="mark-style-text" style="font-size:14px;color:#333333;line-height:20px;word-break:break-word;" data-mid="">点击上方<span style="color:#1a6840;" data-mid="">蓝字</span>关注我们</p></section><section nodeleaf="" style="display:flex;justify-content:center;align-items:center;width:24px;align-self:center;margin:-6px 0 0 0;" data-mid=""><img src="https://mmbiz.qpic.cn/mmbiz_gif/YtIDLfKRkon8SLKBvmCfjvZ4I8azbdaFnZbM5cE2jjuApZCV2VwwWaUAgspNrka1Qn9VQnbH2064IVdEaFl37w/0?from=appmsg" alt="" style="display:block;" data-mid=""></section></section></section></section>`,

  // 尾部模板
  ending: `<section data-mpa-template="t" data-mpa-template-id="23502" data-mpa-category="style_single_material"><section style="display:flex;flex-direction:column;" data-mid=""><section style="align-self:center;display:flex;flex-direction:column;" data-mid=""><section style="width:100px;margin:0 0 -21px 16px;" data-mid=""><section style="text-align:center;margin:0 0 -16px 0;" data-mid=""><p style="font-weight:bold;font-size:20px;color:#1a6840;line-height:28px;word-break:break-word;" data-mid="">HISTORY</p></section><section style="text-align:center;" data-mid=""><p style="font-weight:bold;font-size:16px;color:#1a6840;line-height:22px;word-break:break-word;" data-mid="">往期推荐 </p></section></section><section style="display:flex;justify-content:center;align-items:center;width:267px;" data-mid=""><img src="https://mmbiz.qpic.cn/mmbiz_png/JnFVjHuvmJ8D1wqQf1Fef720vyhcqcoLFlPOcljZibuqdMVpKMhfnRvkraoM2pZmlvPe4Ewm8Np90Gqq9BLBufw/0?from=appmsg" data-mid=""></section><section style="width:267px;border:1px solid #1a6840;border-top:none !important;padding:8px;" data-mid=""><section style="display:flex;flex-direction:column;padding:10px 0 11px 0;background:rgba(26,104,64,0.1);" data-mid=""><section data-mpa-template-rows="1" style="width:100%;padding:21px 27px 20px 27px;" data-mid=""><section style="display:flex;align-items:flex-start;padding:5px 5px 5px 5px;border-bottom:1.3px dashed #1a6840;" data-mid=""><section style="width:9px;height:9px;background:#1a6840;margin:5px 8px 0 0;transform:skewX(-10deg);" data-mid=""></section><section style="text-align:left;" data-mid=""><p style="font-size:14px;color:#000000;line-height:20px;word-break:break-word;" data-mid="">当季出游穿搭分享</p></section></section><section style="display:flex;align-items:flex-start;padding:5px 5px 5px 5px;border-bottom:1.3px dashed #1a6840;" data-mid=""><section style="width:9px;height:9px;background:#1a6840;margin:5px 8px 0 0;transform:skewX(-10deg);" data-mid=""></section><section style="text-align:left;" data-mid=""><p style="font-size:14px;color:#000000;line-height:20px;word-break:break-word;" data-mid="">减脂人初春低糖饮品推荐</p></section></section><section style="display:flex;align-items:flex-start;padding:5px 5px 5px 5px;border-bottom:1.3px dashed #1a6840;" data-mid=""><section style="width:9px;height:9px;background:#1a6840;margin:5px 8px 0 0;transform:skewX(-10deg);" data-mid=""></section><section style="text-align:left;" data-mid=""><p style="font-size:14px;color:#000000;line-height:20px;word-break:break-word;" data-mid="">五一踏青旅游胜地推荐</p></section></section></section></section></section></section></section></section>`,

  // 内联样式配置
  inlineStyles: {
    bold: "font-weight:bold;",
    italic: "font-style:italic;",
    underline: "text-decoration:underline;",
    strikethrough: "text-decoration:line-through;",
    code: "background:rgba(26,104,64,0.1);padding:2px 4px;border-radius:3px;font-family:'Courier New',monospace;font-size:0.9em;",
    mark: "background:rgba(26,104,64,0.2);padding:1px 2px;border-radius:2px;",
    small: "font-size:0.85em;",
    sup: "font-size:0.75em;vertical-align:super;",
    sub: "font-size:0.75em;vertical-align:sub;",
    link: "color:rgba(26,104,64,1);text-decoration:underline;transition:color 0.2s ease;",
    cite: "display:block;margin-top:0.5em;font-size:0.9em;color:rgba(26,104,64,0.7);",
  },
  header: {
    h1: `<section data-mpa-template="t" data-mpa-template-id="7371" data-mpa-category="style_single_material"><section style="width:100%;padding:0px 12px;" data-mid=""><section style="width:100%;display:flex;align-items:center;justify-content:space-between;" data-mid=""><section style="display:flex;align-items:center;width:100%;height:5px;" data-mid=""><section style="flex-shrink:0;width:6px;height:6px;background:#1a6840;border-radius:50%;" data-mid=""><span leaf=""><br class="ProseMirror-trailingBreak"></span></section><section style="width:100%;border-top:1px solid #1a6840;height:1px;" data-mid=""><span leaf=""><br class="ProseMirror-trailingBreak"></span></section></section><section style="flex-shrink:0;min-width:79px;text-align:center;background:#1a6840;padding:5px 15px 4px 15px;" data-mid=""><p style="color:#ffffff;font-size:16px;line-height:17px;word-break:break-word;" data-mid=""><span leaf="">{{content}}</span><mpchecktext></mpchecktext></p></section><section style="display:flex;align-items:center;width:100%;" data-mid=""><section style="width:100%;border-top:1px solid #1a6840;height:1px;" data-mid=""><span leaf=""><br class="ProseMirror-trailingBreak"></span></section><section style="flex-shrink:0;width:6px;height:6px;background:#1a6840;border-radius:50%;" data-mid=""><span leaf=""><br class="ProseMirror-trailingBreak"></span></section></section></section></section></section>`,

    h2: `<section data-block="header" data-level="2" style="text-indent:0px;margin-bottom:8px;"><h2 style="font-size:17px;color:rgba(26,104,64,1);font-weight:bold;margin:1.5em 8px 1em;border-bottom:1px solid rgba(26,104,64,0.3);padding-bottom:0.3em;">{{content}}</h2></section>`,

    h3: `<section data-block="header" data-level="3" style="text-indent:0px;margin-bottom:8px;"><h3 style="font-size:15px;color:rgba(26,104,64,1);font-weight:bold;margin:1.2em 8px 0.8em;">{{content}}</h3></section>`,
  },

  paragraph: {
    default: `<section mpa-font-style="mbraxlmy23cq" style="font-size:14px;margin-bottom:8px;line-height:2em;margin-left:32px;margin-right:32px;visibility:visible;" data-mpa-action-id="mbraxlnm103x" data-pm-slice="0 0 []"><span leaf="" style="visibility:visible;"><span textstyle="" style="letter-spacing:2px;visibility:visible;">{{content}}</span></span></section>`,
  },

  quote: {
    default: `<section data-block="quote" style="margin-bottom:8px;"><blockquote style="background-color:rgba(26,104,64,0.1);border-left:4px solid #1a6840;margin:1.5em 10px;padding:1em 1.5em;border-radius:6px;"><p style="font-size:1.05em;color:#212529;margin:0;font-style:italic;">{{content}}</p><span style="display:block;text-align:right;color:rgba(26,104,64,0.7);font-size:1em;margin-top:1em;">—— {{caption}}</span></blockquote></section>`,
  },

  delimiter: {
    default: `<section data-block="delimiter" style="text-indent:0px;margin-bottom:8px;"><hr style="border:0;height:1px;background-image:linear-gradient(to right,rgba(26,104,64,0),rgba(26,104,64,0.25),rgba(26,104,64,0));margin:2em 0;"></section>`,
  },

  raw: {
    default: ``,
  },

  list: {
    ordered: `<section data-block="list" data-style="ordered" style="text-indent:0px;margin-bottom:8px;"><ol style="margin:1.5em 8px;padding-left:2em;">{{items}}</ol></section>`,

    unordered: `<section data-block="list" data-style="unordered" style="text-indent:0px;margin-bottom:8px;"><ul style="margin:1.5em 8px;padding-left:2em;">{{items}}</ul></section>`,
  },

  code: {
    default: `<section><pre style="--md-primary-color:rgba(26,104,64,1);text-align:left;line-height:1.5;font-family:Menlo,Monaco,'Courier New',monospace;font-size:90%;overflow-x:auto;border-radius:8px;padding:1em;margin:10px 8px;background-color:#2d2d2d;border:1px solid #1a6840;" class="hljs code__pre"><span style="display:block;padding-bottom:10px;" class="mac-sign"><svg viewBox="0 0 450 130" height="13px" width="45px" y="0px" x="0px" version="1.1" xmlns="http://www.w3.org/2000/svg"><ellipse fill="rgb(237,108,96)" stroke-width="2" stroke="rgb(220,60,54)" ry="52" rx="50" cy="65" cx="50"></ellipse><ellipse fill="rgb(247,193,81)" stroke-width="2" stroke="rgb(218,151,33)" ry="52" rx="50" cy="65" cx="225"></ellipse><ellipse fill="rgb(100,200,86)" stroke-width="2" stroke="rgb(27,161,37)" ry="52" rx="50" cy="65" cx="400"></ellipse></svg></span><code style="--md-primary-color:rgba(26,104,64,1);text-align:left;line-height:1.75;font-family:'Fira Code',Menlo,Operator Mono,Consolas,Monaco,monospace;font-size:90%;margin:0;white-space:pre;word-wrap:break-word;overflow-wrap:break-word;color:#e0e0e0;" class="language-python">{{content}}</code></pre></section>`,
  },

  // 列表项子模板
  listItem: `<li style="margin:0.3em 0;">{{content}}</li>`,

  // 后备HTML模板
  fallback: {
    container: "margin:1.5em 8px;padding:0.5em;border:1px dashed rgba(26,104,64,0.3);background-color:rgba(26,104,64,0.05);",
    warning: "color:rgba(26,104,64,0.7);font-size:0.8em;",
    content: "margin-top:0.5em;",
  },
};

// 默认导出
export default HTML_TEMPLATES;
