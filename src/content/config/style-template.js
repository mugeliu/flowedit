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
  ending: `<section></section>`,

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
    h1: `<section style="width: 100%; display: flex; justify-content: center; align-items: center; padding: 20px 14px 0;">
  <section style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start;">
    
    <section style="display: flex; align-items: flex-start; justify-content: center;">
      
      <!-- 左侧编号模块 -->
      <section style="transform: skew(30deg); display: flex; align-items: flex-start; justify-content: center;">
        <section style="background: #1a6840; text-align: center; padding: 0 8px; height: 28px;">
          <p style="transform: skew(-30deg); font-weight: bold; font-size: 18px; color: #1a6840; line-height: 28px; text-align: center; -webkit-background-clip: text; background-image: linear-gradient(163deg, #ffffff 0%, #a5ffc0 100%); word-break: break-all; -webkit-text-fill-color: transparent;">
            <span>01</span>
          </p>
        </section>
        <section style="width: 1px; height: 42px; align-self: flex-start; background: linear-gradient(134deg, #1a6840, rgba(26, 104, 64, 0)); z-index: 2; margin-left: -1px;"></section>
      </section>

      <!-- 右侧标题模块 -->
      <section style="display: flex; align-items: flex-start; justify-content: center; transform: skew(30deg);">
        <section style="width: 1px; height: 42px; margin-top: -25px; margin-right: -1px; align-self: flex-start; background: linear-gradient(134deg, #ffffff, #d0ffd0); z-index: 2;"></section>
        <section style="background: #e0ffe0; text-align: center; height: 28px; padding: 0 18px;">
          <p style="transform: skew(-30deg); font-weight: bold; font-size: 17px; color: #1a6840; line-height: 28px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100vw;">
            <span>{{content}}</span>
          </p>
        </section>
      </section>

    </section>

  </section>
</section>
`,

    h2: `<section style="display:flex;align-items:center;padding:16px 14px 0;">
  <div style="width:4px;height:24px;background:#1a6840;margin-right:8px;border-radius:2px;"></div>
  <p style="margin:0;font-size:16px;font-weight:600;color:#1a6840;">
  {{content}}
  </p>
</section>`,

    h3: `<section style="display:flex;align-items:center;padding:8px 18px;">
  <div style="width:6px;height:6px;background:#1a6840;border-radius:50%;margin-right:8px;"></div>
  <p style="margin:0;font-size:15px;font-weight:500;color:#2c6840;">
  {{content}}
  </p>
</section>`,
  },

  paragraph: {
    //default: `<section mpa-font-style="mbraxlmy23cq" style="font-size:14px;margin-bottom:8px;line-height:2em;margin-left:32px;margin-right:32px;visibility:visible;" data-mpa-action-id="mbraxlnm103x" data-pm-slice="0 0 []"><span leaf="" style="visibility:visible;"><span textstyle="" style="letter-spacing:2px;visibility:visible;">{{content}}</span></span></section>`,
    default: `<section style="margin-bottom:8px;margin-left:16px;margin-right:16px;"><div style="font-size:14px; line-height:2em;"><span style="letter-spacing:2px;">{{content}}</span></div></section>`,
  },

  quote: {
    //default: `<section data-block="quote" style="margin-bottom:8px;"><blockquote style="background-color:rgba(26,104,64,0.1);border-left:4px solid #1a6840;margin:1.5em 10px;padding:1em 1.5em;border-radius:6px;"><p style="font-size:1.05em;color:#212529;margin:0;font-style:italic;">{{content}}</p><span style="display:block;text-align:right;color:rgba(26,104,64,0.7);font-size:1em;margin-top:1em;">—— {{caption}}</span></blockquote></section>`,
    default: `<section style="margin-bottom:8px;margin-left:16px;margin-right:16px;"><blockquote style="background-color:rgba(26,104,64,0.1); border-left:4px solid #1a6840; padding:1em 1.5em; border-radius:6px; margin:0;"><p style="font-size:1.05em; color:#212529; margin:0; font-style:italic;">{{content}}</p><span style="display:block; text-align:right; color:rgba(26,104,64,0.7); font-size:1em; margin-top:1em;">—— {{caption}}</span></blockquote></section>`,
  },

  delimiter: {
    //default: `<section data-block="delimiter" style="text-indent:0px;margin-bottom:8px;"><hr style="border:0;height:1px;background-image:linear-gradient(to right,rgba(26,104,64,0),rgba(26,104,64,0.25),rgba(26,104,64,0));margin:2em 0;"></section>`,
    default: `<section style="margin-bottom:8px;margin-left:16px;margin-right:16px;"><hr style="border:0; height:1px; background-image:linear-gradient(to right, rgba(26,104,64,0), rgba(26,104,64,0.25), rgba(26,104,64,0)); margin:2em 0;"></section>`,
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
    container:
      "margin:1.5em 8px;padding:0.5em;border:1px dashed rgba(26,104,64,0.3);background-color:rgba(26,104,64,0.05);",
    warning: "color:rgba(26,104,64,0.7);font-size:0.8em;",
    content: "margin-top:0.5em;",
  },
};

// 默认导出
export default HTML_TEMPLATES;
