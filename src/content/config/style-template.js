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
  head: `<section data-mpa-template="t" data-mpa-template-id="23968" data-mpa-category="style_single_material"><section style="display: flex;flex-direction: column;padding: 0 10px;" data-mid=""><section style="display: flex;flex-direction: column;align-self: flex-start;" data-mid=""><section nodeleaf="" style="display: flex;justify-content: center;align-items: center;z-index: 1;width: 16px;margin: 0 0 -1px 25px;" data-mid=""><img src="https://mmbiz.qpic.cn/mmbiz_png/dEf5U8O2YzjX7RPfmgLtXZGQ4emxXdzQs0UcN2m15pprg9EBQ6X6wYZvncMFvgT45MTASpAn6tyLMN2ibLGiawRA/0?from=appmsg" alt="" style="display: block;" data-mid=""></section><section style="background: #FFFFFF;border: 1px solid #0092FF;padding: 6px 18px 5px 19px;text-align: left;border-radius: 32px;" data-mid=""><p yb-mpa-mark="mark-style-text" style="font-size: 14px;color: #333333;line-height: 20px;word-break: break-word;" data-mid="">点击上方<span style="color: #0092ff;" data-mid="">蓝字</span>关注我们</p></section><section nodeleaf="" style="display: flex;justify-content: center;align-items: center;width: 24px;align-self: center;margin: -6px 0 0 0;" data-mid=""><img src="https://mmbiz.qpic.cn/mmbiz_gif/YtIDLfKRkon8SLKBvmCfjvZ4I8azbdaFnZbM5cE2jjuApZCV2VwwWaUAgspNrka1Qn9VQnbH2064IVdEaFl37w/0?from=appmsg" alt="" style="display: block;" data-mid=""></section></section></section></section>`,

  // 尾部模板
  ending: `<section data-mpa-template="t" data-mpa-template-id="23502" data-mpa-category="style_single_material"><section style="display: flex;flex-direction: column;" data-mid=""><section style="align-self: center;display: flex;flex-direction: column;" data-mid=""><section style="width: 100px;margin: 0 0 -21px 16px;" data-mid=""><section style="text-align: center;margin: 0 0 -16px 0;" data-mid=""><p style="font-weight: bold;font-size: 20px;color: #F1F5FF;line-height: 28px;word-break: break-word;" data-mid="">HISTORY</p></section><section style="text-align: center;" data-mid=""><p style="font-weight: bold;font-size: 16px;color: #FFD750;line-height: 22px;word-break: break-word;" data-mid="">往期推荐 </p></section></section><section style="display: flex;justify-content: center;align-items: center;width: 267px;" data-mid=""><img src="https://mmbiz.qpic.cn/mmbiz_png/JnFVjHuvmJ8D1wqQf1Fef720vyhcqcoLFlPOcljZibuqdMVpKMhfnRvkraoM2pZmlvPe4Ewm8Np90Gqq9BLBufw/0?from=appmsg" data-mid=""></section><section style="width: 267px;border: 1px solid #86A4FF;border-top: none !important;padding: 8px;" data-mid=""><section style="display: flex;flex-direction: column;padding: 10px 0 11px 0;background: #F1F5FF;" data-mid=""><section data-mpa-template-rows="1" style="width: 100%;padding: 21px 27px 20px 27px;" data-mid=""><section style="display: flex;align-items: flex-start;padding: 5px 5px 5px 5px;border-bottom: 1.3px dashed #86A4FF;" data-mid=""><section style="width: 9px;height: 9px;background: #86A4FF;margin: 5px 8px 0 0;transform: skewX(-10deg);" data-mid=""></section><section style="text-align: left;" data-mid=""><p style="font-size: 14px;color: #000000;line-height: 20px;word-break: break-word;" data-mid="">当季出游穿搭分享</p></section></section>
  <section style="display: flex;align-items: flex-start;padding: 5px 5px 5px 5px;border-bottom: 1.3px dashed #86A4FF;" data-mid=""><section style="width: 9px;height: 9px;background: #86A4FF;margin: 5px 8px 0 0;transform: skewX(-10deg);" data-mid=""></section><section style="text-align: left;" data-mid=""><p style="font-size: 14px;color: #000000;line-height: 20px;word-break: break-word;" data-mid="">减脂人初春低糖饮品推荐</p></section></section><section style="display: flex;align-items: flex-start;padding: 5px 5px 5px 5px;border-bottom: 1.3px dashed #86A4FF;" data-mid=""><section style="width: 9px;height: 9px;background: #86A4FF;margin: 5px 8px 0 0;transform: skewX(-10deg);" data-mid=""></section><section style="text-align: left;" data-mid=""><p style="font-size: 14px;color: #000000;line-height: 20px;word-break: break-word;" data-mid="">五一踏青旅游胜地推荐</p></section></section></section></section></section></section></section></section>`,

  // 内联样式配置
  inlineStyles: {
    bold: "font-weight: bold;",
    italic: "font-style: italic;",
    underline: "text-decoration: underline;",
    strikethrough: "text-decoration: line-through;",
    code: "background: rgba(26, 104, 64, 0.1); padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 0.9em;",
    mark: "background: rgba(26, 104, 64, 0.2); padding: 1px 2px; border-radius: 2px;",
    small: "font-size: 0.85em;",
    sup: "font-size: 0.75em; vertical-align: super;",
    sub: "font-size: 0.75em; vertical-align: sub;",
    link: "color: rgba(26, 104, 64, 1); text-decoration: underline; transition: color 0.2s ease;",
    cite: "display: block; margin-top: 0.5em; font-size: 0.9em; color: rgba(26, 104, 64, 0.7);",
  },
  header: {
    h1: `<section data-mpa-template="t" data-mpa-template-id="7371" data-mpa-category="style_single_material"><section style="width: 100%;padding: 0px 12px;" data-mid=""><section style="width: 100%;display: flex;align-items: center;justify-content: space-between;" data-mid=""><section style="display: flex;align-items: center;width: 100%;height: 5px;" data-mid=""><section style="flex-shrink: 0;width: 6px;height: 6px;background: #4499e7;border-radius: 50%;" data-mid=""><span leaf=""><br class="ProseMirror-trailingBreak"></span></section><section style="width: 100%;border-top: 1px solid #4499e7;height: 1px;" data-mid=""><span leaf=""><br class="ProseMirror-trailingBreak"></span></section></section><section style="flex-shrink: 0;min-width: 79px;text-align: center;background: #4499e7;padding: 5px 15px 4px 15px;" data-mid=""><p style="color: #ffffff;font-size: 16px;line-height: 17px;word-break: break-word;" data-mid=""><span leaf="">{{content}}</span><mpchecktext></mpchecktext></p></section><section style="display: flex;align-items: center;width: 100%;" data-mid=""><section style="width: 100%;border-top: 1px solid #4499e7;height: 1px;" data-mid=""><span leaf=""><br class="ProseMirror-trailingBreak"></span></section><section style="flex-shrink: 0;width: 6px;height: 6px;background: #4499e7;border-radius: 50%;" data-mid=""><span leaf=""><br class="ProseMirror-trailingBreak"></span></section></section></section></section></section>`,

    h2: `<section data-block="header" data-level="2" style="text-indent: 0px; margin-bottom: 8px;">
      <h2 style="font-size: 17px; color: rgba(26, 104, 64, 1); font-weight: bold; margin: 1.5em 8px 1em; border-bottom: 1px solid rgba(26, 104, 64, 0.3); padding-bottom: 0.3em;">
        {{content}}
      </h2>
    </section>`,

    h3: `<section data-block="header" data-level="3" style="text-indent: 0px; margin-bottom: 8px;">
      <h3 style="font-size: 15px; color: rgba(26, 104, 64, 1); font-weight: bold; margin: 1.2em 8px 0.8em;">
        {{content}}
      </h3>
    </section>`,

    h4: `<section data-block="header" data-level="4" style="text-indent: 0px; margin-bottom: 8px;">
      <h4 style="font-size: 14px; color: rgba(26, 104, 64, 1); font-weight: bold; margin: 1em 8px 0.6em;">
        {{content}}
      </h4>
    </section>`,

    h5: `<section data-block="header" data-level="5" style="text-indent: 0px; margin-bottom: 8px;">
      <h5 style="font-size: 13px; color: rgba(26, 104, 64, 1); font-weight: bold; margin: 0.8em 8px 0.5em;">
        {{content}}
      </h5>
    </section>`,

    h6: `<section data-block="header" data-level="6" style="text-indent: 0px; margin-bottom: 8px;">
      <h6 style="font-size: 12px; color: rgba(26, 104, 64, 1); font-weight: bold; margin: 0.6em 8px 0.4em;">
        {{content}}
      </h6>
    </section>`,
  },

  paragraph: {
    default: `<section mpa-font-style="mbraxlmy23cq" style="font-size: 14px; margin-bottom: 8px; line-height: 2em; margin-left: 32px; margin-right: 32px; visibility: visible;" data-mpa-action-id="mbraxlnm103x" data-pm-slice="0 0 []"><span leaf="" style="visibility: visible;"><span textstyle="" style="letter-spacing: 2px; visibility: visible;">{{content}}</span></span></section>`,
  },

  quote: {
    default: `<section data-block="quote" style="text-indent: 0px; margin-bottom: 8px;">
      <blockquote style="margin: 1.5em 8px; padding: 1em; border-left: 4px solid rgba(26, 104, 64, 0.5); background-color: rgba(26, 104, 64, 0.05); font-style: italic;">
        {{content}}
        {{caption}}
      </blockquote>
    </section>`,
  },

  delimiter: {
    default: `<section data-block="delimiter" style="text-indent: 0px; margin-bottom: 8px;">
      <div style="text-align: center; margin: 2em 8px; color: rgba(26, 104, 64, 0.6); font-size: 1.2em;">
        ----
      </div>
    </section>`,
  },

  raw: {
    default: ``,
  },

  list: {
    ordered: `<section data-block="list" data-style="ordered" style="text-indent: 0px; margin-bottom: 8px;">
      <ol style="margin: 1.5em 8px; padding-left: 2em;">
        {{items}}
      </ol>
    </section>`,

    unordered: `<section data-block="list" data-style="unordered" style="text-indent: 0px; margin-bottom: 8px;">
      <ul style="margin: 1.5em 8px; padding-left: 2em;">
        {{items}}
      </ul>
    </section>`,
  },

  code: {
    default: `<section data-block="code" style="text-indent: 0px; margin-bottom: 8px;">
      <pre style="margin: 1.5em 8px; padding: 1em; background-color: rgba(26, 104, 64, 0.08); border-radius: 4px; overflow-x: auto;"><code style="font-family: 'Courier New', monospace; font-size: 14px;">{{content}}</code></pre>
    </section>`,
  },

  // 列表项子模板
  listItem: `<li style="margin: 0.3em 0;">{{content}}</li>`,

  // 后备HTML模板
  fallback: {
    container:
      "margin: 1.5em 8px; padding: 0.5em; border: 1px dashed rgba(26, 104, 64, 0.3); background-color: rgba(26, 104, 64, 0.05);",
    warning: "color: rgba(26, 104, 64, 0.7); font-size: 0.8em;",
    content: "margin-top: 0.5em;",
  },
};

// 默认导出
export default HTML_TEMPLATES;
