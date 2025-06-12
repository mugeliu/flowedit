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
  // 内联样式配置
  inlineStyles: {
    bold: 'font-weight: bold;',
    italic: 'font-style: italic;',
    underline: 'text-decoration: underline;',
    strikethrough: 'text-decoration: line-through;',
    code: 'background: rgba(26, 104, 64, 0.1); padding: 2px 4px; border-radius: 3px; font-family: \'Courier New\', monospace; font-size: 0.9em;',
    mark: 'background: rgba(26, 104, 64, 0.2); padding: 1px 2px; border-radius: 2px;',
    small: 'font-size: 0.85em;',
    sup: 'font-size: 0.75em; vertical-align: super;',
    sub: 'font-size: 0.75em; vertical-align: sub;',
    link: 'color: rgba(26, 104, 64, 1); text-decoration: underline; transition: color 0.2s ease;',
    cite: 'display: block; margin-top: 0.5em; font-size: 0.9em; color: rgba(26, 104, 64, 0.7);'
  },
  header: {
    h1: `<section data-block="header" data-level="1" style="text-indent: 0px; margin-bottom: 8px;">
      <h1 style="text-align: center; font-size: 19.6px; display: table; padding: 0.5em 1em; border-bottom: 2px solid rgba(26, 104, 64, 1); margin: 2em auto 1em; margin-top: 0; color: rgba(26, 104, 64, 1); font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.05);">
        {{content}}
      </h1>
    </section>`,
    
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
    </section>`
  },
  
  paragraph: {
    default: `<section data-block="paragraph" style="text-indent: 0px; margin-bottom: 8px;">
      <p style="margin: 1.5em 8px; letter-spacing: 0.1em;">
        {{content}}
      </p>
    </section>`
  },
  
  quote: {
    default: `<section data-block="quote" style="text-indent: 0px; margin-bottom: 8px;">
      <blockquote style="margin: 1.5em 8px; padding: 1em; border-left: 4px solid rgba(26, 104, 64, 0.5); background-color: rgba(26, 104, 64, 0.05); font-style: italic;">
        {{content}}
        {{caption}}
      </blockquote>
    </section>`
  },
  
  delimiter: {
    default: `<section data-block="delimiter" style="text-indent: 0px; margin-bottom: 8px;">
      <div style="text-align: center; margin: 2em 8px; color: rgba(26, 104, 64, 0.6); font-size: 1.2em;">
        ***
      </div>
    </section>`
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
    </section>`
  },
  
  code: {
    default: `<section data-block="code" style="text-indent: 0px; margin-bottom: 8px;">
      <pre style="margin: 1.5em 8px; padding: 1em; background-color: rgba(26, 104, 64, 0.08); border-radius: 4px; overflow-x: auto;"><code style="font-family: 'Courier New', monospace; font-size: 14px;">{{content}}</code></pre>
    </section>`
  },
  
  // 列表项子模板
  listItem: `<li style="margin: 0.3em 0;">{{content}}</li>`,
  
  // 后备HTML模板
  fallback: {
    container: 'margin: 1.5em 8px; padding: 0.5em; border: 1px dashed rgba(26, 104, 64, 0.3); background-color: rgba(26, 104, 64, 0.05);',
    warning: 'color: rgba(26, 104, 64, 0.7); font-size: 0.8em;',
    content: 'margin-top: 0.5em;'
  }
};

// 默认导出
export default HTML_TEMPLATES;