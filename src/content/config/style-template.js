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
  head: ``,

  // 尾部模板
  ending: ``,

  // 内联样式配置
  inlineStyles: {
    a: `<span textstyle style="color: rgb(16, 185, 129); text-decoration: underline; text-decoration-color: rgba(16, 185, 129, 0.5); text-underline-offset: 2px;">{{content}}</span>`,

    b: `<span textstyle style="font-weight: 700; color: rgb(16, 185, 129);">{{content}}</span>`,

    i: `<span textstyle style="font-style: italic; color: rgb(16, 185, 129); letter-spacing: 0.5px; font-weight: 500;">{{content}}</span>`,

    u: `<span textstyle style="text-decoration: underline; text-decoration-color: rgb(16, 185, 129); text-underline-offset: 3px; text-decoration-thickness: 2px;">{{content}}</span>`,

    mark: `<span textstyle style="background: rgba(16, 185, 129, 0.2); padding: 0.1em 0.4em; border-radius: 3px;">{{content}}</span>`,

    code: `<span textstyle style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 0.85em; background: rgba(16, 185, 129, 0.1); color: rgb(6, 95, 70); padding: 0.25em 0.6em; border-radius: 5px; border: 1px solid rgba(16, 185, 129, 0.25); font-weight: 500; letter-spacing: 0.3px;">{{content}}</span>`,

    sup: `<sup textstyle style="color: rgba(16, 185, 129, 0.7); font-size: 0.7em; margin-left: 0.2em;">{{sup}}</sup>`,
  },
  header: {
    h1: `<section style="font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.5px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box;border-width: 0px;border-style: solid;font-size: 20px;font-weight: 600;margin: 1.8em 0px 1.2em;text-align: center;line-height: 1.4;font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif;display: flex;justify-content: center;padding: 0px;color: rgb(4, 120, 87);"><section style="display: inline-block;padding: 1em 2.2em;color: rgb(255, 255, 255);background: linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%);border-radius: 12px;box-shadow: rgba(16, 185, 129, 0.25) 0px 6px 20px -4px, rgba(0, 0, 0, 0.1) 0px 2px 8px -2px;"><span leaf="">{{content}}</span></section></section>`,

    h2: `<section style="font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.3px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box;border-width: 0px;border-style: solid;font-size: 18px;font-weight: 600;margin: 1.5em 0px 1em;text-align: left;line-height: 1.4;font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif;display: block;padding: 0px;color: rgb(4, 120, 87);"><section style="display: inline-flex; align-items: center; padding: 0.8em 1.8em 0.8em 1.2em; background: rgba(16, 185, 129, 0.06); border-left: 4px solid rgb(16, 185, 129); border-radius: 0px 8px 8px 0px; min-width: fit-content;"><span style="display: inline-block; width: 8px; height: 8px; background: rgb(16, 185, 129); border-radius: 50%; margin-right: 0.8em; vertical-align: middle;"></span><span leaf="">{{content}}</span></section></section>`,

    h3: `<section style="font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;letter-spacing: 0.2px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box;border-width: 0px;border-style: solid;font-size: 17px;font-weight: 500;margin: 1.2em 0px 0.8em;text-align: left;line-height: 1.5;font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif;display: block;padding: 0px;color: rgb(4, 120, 87);"><section style="display: inline-flex; align-items: center; padding: 0.6em 1.5em 0.6em 1em; background: linear-gradient(90deg, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0.01) 80%, transparent 100%); border-left: 3px solid rgba(16, 185, 129, 0.6); border-radius: 0px 6px 6px 0px; min-width: fit-content;"><span style="display: inline-block; width: 6px; height: 6px; background: rgba(16, 185, 129, 0.8); border-radius: 50%; margin-right: 0.6em; vertical-align: middle;"></span><span leaf="">{{content}}</span></section></section>`,
  },

  paragraph: {
    default: `<section style="font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box;border-width: 0px;border-style: solid;margin: 0.8em 0px;text-align: left;line-height: 1.7;font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif;display: block;padding: 0px;"><section style="font-size: 16px; color: rgb(55, 65, 81); letter-spacing: 0.3px; padding: 0.5em 0.5em;"><span leaf="">{{content}}</span></section></section>`,
  },

  quote: {
    default: `<section style="font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box;border-width: 0px;border-style: solid;margin: 1.5em 0px;text-align: left;line-height: 1.6;font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif;display: block;padding: 0px;"><section style="background: rgba(16, 185, 129, 0.06); border-left: 4px solid rgb(16, 185, 129); padding: 1.2em 1.8em; border-radius: 0px 8px 8px 0px; box-shadow: rgba(16, 185, 129, 0.1) 0px 2px 8px -2px;"><section style="font-size: 16px; color: rgb(55, 65, 81); font-style: italic; margin: 0px 0px 1em 0px; letter-spacing: 0.2px;"><span leaf="">{{content}}</span></section><section style="display: flex; justify-content: flex-end; color: rgba(16, 185, 129, 0.8); font-size: 14px; font-weight: 500; font-style: normal;"><span leaf="">{{caption}}</span></section></section></section>`,
  },

  delimiter: {
    default: `<section style="font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;box-sizing: border-box;border-width: 0px;border-style: solid;margin: 2em 0px;text-align: center;line-height: 1;font-family: -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, Roboto, &quot;Helvetica Neue&quot;, Arial, sans-serif;display: flex;justify-content: center;padding: 0px;"><section style="width: 80%; height: 2px; background: linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.2) 20%, rgba(16, 185, 129, 0.6) 50%, rgba(16, 185, 129, 0.2) 80%, transparent 100%); border-radius: 1px;"></section></section>`,
  },

  raw: {
    default: ``,
  },

  image: {
    default: `<section><figure style="margin: 10px 0px; padding: 0px; display: flex; flex-direction: column; justify-content: center; align-items: center; visibility: visible;"><span leaf="" style="visibility: visible;"><img src="{{url}}" style="display: block; margin: 0px auto; max-width: 100%; border-style: none; border-radius: 4px; object-fit: fill; box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px; height: auto !important; visibility: visible !important; width: 677px !important;" /></span><figcaption style="color: #888; font-size: 12px; line-height: 1.5em; letter-spacing: 0em; text-align: center; font-weight: normal; margin: 5px 0px 0px 0px; padding: 0px;"><span leaf="">{{caption}}</span></figcaption></figure></section>`,
  },

  List: {
    ordered: `<section data-block="list" data-style="ordered" style="text-indent:0px;margin:1.2em 0;"><ol style="list-style-type:{{listStyle}};padding-left:2em;">{{items}}</ol></section>`,

    unordered: `<section data-block="list" data-style="unordered" style="text-indent:0px;margin:1.2em 0;"><ul style="list-style-type:disc;padding-left:2em;">{{items}}</ul></section>`,

    checklist: `<section data-block="list" data-style="checklist" style="text-indent:0px;margin:1.2em 0;"><ul style="list-style:none;padding-left:1em;">{{items}}</ul></section>`,

    // 嵌套列表容器模板
    nestedOrdered: `<ol style="list-style-type:{{listStyle}};padding-left:{{paddingLeft}}em;margin:0.5em 0;">{{items}}</ol>`,

    nestedUnordered: `<ul style="list-style-type:disc;padding-left:{{paddingLeft}}em;margin:0.5em 0;">{{items}}</ul>`,

    nestedChecklist: `<ul style="list-style:none;padding-left:{{paddingLeft}}em;margin:0.5em 0;">{{items}}</ul>`,
  },

  // 列表项子模板
  listItem: {
    default: `<li style="margin:0.3em 0;line-height:1.6;"><section><span leaf="">{{content}}</span></section></li>`,
    checklist: `<li style="margin:0.3em 0;line-height:1.6;"><section><span style="margin-right:0.5em;font-family:monospace;font-size:1.1em;color:rgb(16, 185, 129);">{{checkbox}}</span><span leaf="">{{content}}</span></section></li>`,
  },

  code: {
    default: `<section><pre style="--md-primary-color:rgba(26,104,64,1);text-align:left;line-height:1.5;font-family:Menlo,Monaco,'Courier New',monospace;font-size:90%;overflow-x:auto;border-radius:8px;padding:1em;margin:10px 8px;background-color:#2d2d2d;border:1px solid #1a6840;" class="hljs code__pre"><span style="display:block;padding-bottom:10px;" class="mac-sign"><svg viewBox="0 0 450 130" height="13px" width="45px" y="0px" x="0px" version="1.1" xmlns="http://www.w3.org/2000/svg"><ellipse fill="rgb(237,108,96)" stroke-width="2" stroke="rgb(220,60,54)" ry="52" rx="50" cy="65" cx="50"></ellipse><ellipse fill="rgb(247,193,81)" stroke-width="2" stroke="rgb(218,151,33)" ry="52" rx="50" cy="65" cx="225"></ellipse><ellipse fill="rgb(100,200,86)" stroke-width="2" stroke="rgb(27,161,37)" ry="52" rx="50" cy="65" cx="400"></ellipse></svg></span><code style="--md-primary-color:rgba(26,104,64,1);text-align:left;line-height:1.75;font-family:'Fira Code',Menlo,Operator Mono,Consolas,Monaco,monospace;font-size:90%;margin:0;white-space:pre;word-wrap:break-word;overflow-wrap:break-word;color:#e0e0e0;" class="language-python">{{content}}</code></pre></section>`,
  },

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
