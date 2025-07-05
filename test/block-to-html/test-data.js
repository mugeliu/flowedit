/**
 * EditorJS 测试数据
 * 包含各种类型的块用于测试转换功能
 */

const testData = {
  "time": 1751700567292,
  "blocks": [
      {
          "id": "L3cbuMmLOE",
          "type": "paragraph",
          "data": {
              "text": "这是一个预览测试文件，请点击<mark class=\"cdx-marker\">编辑plus+</mark>以启用输入预览。"
          }
      },
      {
          "id": "7efBKijFrb",
          "type": "delimiter",
          "data": {}
      },
      {
          "id": "JEw9EdxCYq",
          "type": "header",
          "data": {
              "text": "Flowedit",
              "level": 1
          }
      },
      {
          "id": "Fz9bNKmv1a",
          "type": "paragraph",
          "data": {
              "text": "这个插件的主要作用是增强微信公众号原有编辑器的功能，很方便的自动应用样式，将关注点从样式转移到文章内容中。"
          }
      },
      {
          "id": "jXFbiUjp4g",
          "type": "header",
          "data": {
              "text": "插件怎么用",
              "level": 2
          }
      },
      {
          "id": "NA-IVt2lTV",
          "type": "paragraph",
          "data": {
              "text": "插件主要是在微信公众号原本的编辑器中增强了编辑功能，通过预先设置好的样式，只需要输入不同的块就可以应用样式。"
          }
      },
      {
          "id": "fMEUT4mQ9e",
          "type": "paragraph",
          "data": {
              "text": "整个插件只有预览按钮和启用编辑的按钮。"
          }
      },
      {
          "id": "eTZ5GuHJxe",
          "type": "paragraph",
          "data": {
              "text": "用户输入完成后会将带样式的内容写入到微信原有的编辑器中。如果使用过类似<mark class=\"cdx-marker\">Notion</mark>这样的编辑器，会很快上手，不需要学习<mark class=\"cdx-marker\">Markdown</mark>"
          }
      },
      {
          "id": "zFK30xjdap",
          "type": "header",
          "data": {
              "text": "目前有什么功能",
              "level": 2
          }
      },
      {
          "id": "TzelLovn4v",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "普通文本",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "iHwxuSyn3u",
          "type": "paragraph",
          "data": {
              "text": "普通文本可以增加内联样式，可以一个输入块，也可以多个块"
          }
      },
      {
          "id": "IYMWxwYKQF",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "H1、H2、H3",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "c52oX5FW0m",
          "type": "header",
          "data": {
              "text": "这是H1",
              "level": 1
          }
      },
      {
          "id": "RnzDQCQzmH",
          "type": "header",
          "data": {
              "text": "这是H2",
              "level": 2
          }
      },
      {
          "id": "zOqw3Hp27l",
          "type": "header",
          "data": {
              "text": "这是H3",
              "level": 3
          }
      },
      {
          "id": "S0rO9pW-jv",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "Quote",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "qTdWqXqoi4",
          "type": "quote",
          "data": {
              "text": "这是flowedit的Quote内容",
              "caption": "来自flowedit",
              "alignment": "left"
          }
      },
      {
          "id": "x2n5AeqFjh",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "Image",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "Rw7ywrz0Gf",
          "type": "paragraph",
          "data": {
              "text": "img功能因涉及到需要传图片到微信素材库，可以上传并增加<code class=\"inline-code\">caption</code>的样式，目前并不完善可能会上传失败，后续需要进一步完善图片的上传以及多种图片样式的设置。"
          }
      },
      {
        "id": "tRPg4mljov",
        "type": "image",
        "data": {
            "caption": "这是一个图片block的示例",
            "withBorder": false,
            "withBackground": false,
            "stretched": false,
            "file": {
                "url": "https://mmbiz.qpic.cn/sz_mmbiz_png/mYicm6icXgkIOianyk8icqU2gticiaEaNql7mic0jFS2Yz7ibLQhicvIVBj7L68NyWepk1ia964roONZbpZyickjlkj90cA9w/0?wx_fmt=png&from=appmsg",
                "fileName": "Snipaste_2025-07-05_13-59-11"
            }
        }
    },
      {
          "id": "ryrfCQ-0Mi",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "Delimiter",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "Zeo0rU_VJI",
          "type": "delimiter",
          "data": {}
      },
      {
          "id": "QhXvRrp2gW",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "Raw HTML",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "teGZitfkMY",
          "type": "paragraph",
          "data": {
              "text": "这个可以将任意你想要的样式插入到文章中，只需要符合微信公众号的HTML格式，如果样式不符合微信公众号的格式当点击保存到草稿后会自动移除不符合的样式导致样式丢失错乱。<br>"
          }
      },
      {
          "id": "eUV6mC0wgy",
          "type": "raw",
          "data": {
              "html": "<section style='display: flex; align-items: center; padding: 20px 24px; background-color: #f9f9f9; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 800px; margin: 20px auto;'>\n  <img src='https://mmbiz.qpic.cn/sz_mmbiz_png/c8mTq8UGcvMTicOdXZvh60aEfX8yjWKvug1CCe3ngO0oib4It1NViaHicJRjB1xlmXqvVJpiaq9gicXbZm5nyBmlwhPA/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&tp=webp' alt='图标' style='width: 56px; height: auto; margin-right: 20px; flex-shrink: 0;'>\n  <div style='display: flex; flex-direction: column;'>\n    <p style='margin: 0; font-size: 20px; font-weight: 700; color: #10b981;'>Step 01</p>\n    <p style='margin: 5px 0 0; font-size: 18px; font-weight: 600; color: #333;'>Flowedit插入HTML的示例</p>\n  </div>\n</section>"
          }
      },
      {
          "id": "2dRgsUNNZO",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "List",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "l-EXepeww2",
          "type": "paragraph",
          "data": {
              "text": "列表有有序列表和无序列表，checlist, 其中checklist可以根据状态显示。"
          }
      },
      {
          "id": "fUIHSCsFGt",
          "type": "list",
          "data": {
              "style": "checklist",
              "meta": {},
              "items": [
                  {
                      "content": "这是一个checklist",
                      "meta": {
                          "checked": false
                      },
                      "items": [
                          {
                              "content": "这是有选择的",
                              "meta": {
                                  "checked": true
                              },
                              "items": []
                          },
                          {
                              "content": "这是没选择的",
                              "meta": {
                                  "checked": false
                              },
                              "items": []
                          }
                      ]
                  }
              ]
          }
      },
      {
          "id": "x1diV74Irx",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "Code",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "_7Q4hLksUb",
          "type": "code",
          "data": {
              "code": "<section>\n  <div style='display: flex; flex-direction: column;'>\n    <p style='margin: 5px 0 0; font-size: 18px; font-weight: 600; color: #333;'>Flowedit插入HTML的示例</p>\n  </div>\n</section>"
          }
      },
      {
          "id": "OvMvUtnnEu",
          "type": "paragraph",
          "data": {
              "text": "只有整体的样式，代码本身并没有，后续会考虑增加代码本身的样式。"
          }
      },
      {
          "id": "424_BDQ_8w",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "内联样式",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "RBz59CIS5x",
          "type": "paragraph",
          "data": {
              "text": "<b>加粗</b>、<i>斜体</i>、<u class=\"cdx-underline\">下划线</u>、<mark class=\"cdx-marker\">Mark</mark>、<code class=\"inline-code\">内联代码</code>、<a href=\"http://这是一个引用链接的示例\">引用链接</a>"
          }
      },
      {
          "id": "J6ieW2vo2G",
          "type": "paragraph",
          "data": {
              "text": "其中<a href=\"http://这是一个引用链接\">引用链接</a>如果是微信公众号文章，则应用<a href=\"http://github.com\">微信公众号</a>原本的样式，如果不是微信公众号文章链接或者是脚注内容，则在文章的地步增加一个所有链接的引用块。"
          }
      },
      {
          "id": "jC5AwOxJz3",
          "type": "list",
          "data": {
              "style": "unordered",
              "meta": {},
              "items": [
                  {
                      "content": "可以随意拖动block更改在文章中的位置",
                      "meta": {},
                      "items": []
                  },
                  {
                      "content": "可以根据需要切换不同的block块",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      },
      {
          "id": "29zkMRJE5m",
          "type": "header",
          "data": {
              "text": "后续计划",
              "level": 2
          }
      },
      {
          "id": "lXeuFJfFU7",
          "type": "list",
          "data": {
              "style": "ordered",
              "meta": {
                  "counterType": "numeric"
              },
              "items": [
                  {
                      "content": "增加对于多种主题样式的支持，这个插件的设计之初就是为了增加对样式的支持。",
                      "meta": {},
                      "items": []
                  },
                  {
                      "content": "增加历史文章的保存，方便更改",
                      "meta": {},
                      "items": []
                  },
                  {
                      "content": "增加多个块支持，比如 <mark class=\"cdx-marker\">Mermaid</mark>、<mark class=\"cdx-marker\">数学公式</mark>等的支持",
                      "meta": {},
                      "items": []
                  }
              ]
          }
      }
  ],
  "version": "2.31.0-rc.7"
}
// ES6 模块导出
export default testData;