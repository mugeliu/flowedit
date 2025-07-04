/**
 * EditorJS 测试数据
 * 包含各种类型的块用于测试转换功能
 */

const testData = {
  "time": 1751613291081,
  "blocks": [
      {
          "id": "jRGMdmMIPo",
          "type": "header",
          "data": {
              "text": "这是一个测试",
              "level": 1
          }
      },
      {
          "id": "SODhv0cXXd",
          "type": "paragraph",
          "data": {
              "text": "开始打架发了上课"
          }
      },
      {
          "id": "GoBbVXjtaI",
          "type": "paragraph",
          "data": {
              "text": "首付款垃圾分类凯撒奖地方；发生口角发；啊开始了发家史；发烧快递费开了撒；flash减肥；&nbsp;"
          }
      },
      {
          "id": "Wz1mHqOMy9",
          "type": "paragraph",
          "data": {
              "text": "撒旦法"
          }
      },
      {
          "id": "OnWCB_4fi0",
          "type": "delimiter",
          "data": {}
      },
      {
          "id": "kRNe__cMwt",
          "type": "paragraph",
          "data": {
              "text": "WeUI 是一套同微信<code class=\"inline-code\">原生视觉</code>体验一致的基础样式库，由微信官方设计团队为微信 Web 开发量身设计，可以令用户的使用感知更加统一。包含 button、cell、<i>dialog</i>、 progress、<u class=\"cdx-underline\"> toast</u>、article、<mark class=\"cdx-marker\">actionshe</mark>et、icon 等<mark class=\"cdx-marker\">各式元素</mark>。"
          }
      },
      {
          "id": "mamE2aKDoP",
          "type": "quote",
          "data": {
              "text": "WeUI 是一套同微信原生视觉体验一致的基础样式库，由微信官方设计团队为微信 Web 开发量身设计，可以令用户的使用感知更加统一。包含 button、cell、dialog、 progress、 toast、article、actionsheet、icon 等各式元素。",
              "caption": "Weui",
              "alignment": "left"
          }
      },
      {
          "id": "4JyEW5f58V",
          "type": "raw",
          "data": {
              "html": "<section style='display: flex; justify-content: center; margin: 2em 0;'>\n\t<section style='height: 4px; width: 120px; background: linear-gradient(to right, #0ea5e9, #38bdf8); border-radius: 4px;'></section>\n</section>"
          }
      },
      {
          "id": "dYk2bxDUBS",
          "type": "code",
          "data": {
              "code": "var editor = EditorJS({\n  ...\n  \n  tools: {\n    ...\n    inlineCode: {\n      class: InlineCode,\n      shortcut: 'CMD+SHIFT+M',\n    },\n  },\n  \n  ...\n});"
          }
      },
      {
          "id": "YInKb2Fo39",
          "type": "list",
          "data": {
              "style": "checklist",
              "meta": {},
              "items": [
                  {
                      "content": "sdfafs",
                      "meta": {
                          "checked": false
                      },
                      "items": [
                          {
                              "content": "sadfadf",
                              "meta": {
                                  "checked": false
                              },
                              "items": []
                          },
                          {
                              "content": "sfdafasfd",
                              "meta": {
                                  "checked": true
                              },
                              "items": [
                                  {
                                      "content": "sdfasfda",
                                      "meta": {
                                          "checked": false
                                      },
                                      "items": [
                                          {
                                              "content": "sdafasfda",
                                              "meta": {
                                                  "checked": false
                                              },
                                              "items": []
                                          },
                                          {
                                              "content": "sdfasdfa",
                                              "meta": {
                                                  "checked": true
                                              },
                                              "items": []
                                          }
                                      ]
                                  }
                              ]
                          }
                      ]
                  }
              ]
          }
      },
      {
          "id": "fzY3X4XSdV",
          "type": "header",
          "data": {
              "text": "sdfasfafdsdaf",
              "level": 3
          }
      },
      {
          "id": "yhVHjYW2ww",
          "type": "image",
          "data": {
              "caption": "测试图片",
              "withBorder": false,
              "withBackground": false,
              "stretched": false,
              "file": {
                  "url": "https://mmbiz.qpic.cn/sz_mmbiz_jpg/mYicm6icXgkIPJYzBHsfqQ5DkQWJNaVsnynsfckIPt5FOqL6qqIV7icDGnG38PXzYd77jmKCZs4ekiab7x1j7fUs1w/0?wx_fmt=jpeg&from=appmsg",
                  "fileName": "IMG_0153"
              }
          }
      },
      {
          "id": "krfY_fcppk",
          "type": "paragraph",
          "data": {
              "text": "WeUI 是一套同微信原生视觉体验一致的基础样式库，由微信官方设计团队为微信 Web 开发量身设计，可以令用户的使用感知更加统一。包含 <code class=\"inline-code\">button、cell、dialog、 progress、 toast、article、actionsheet、icon </code>等各式元素。"
          }
      },
      {
          "id": "linkTest_1",
          "type": "paragraph",
          "data": {
              "text": "这里有一些测试链接：访问 <a href=\"https://github.com/codex-team/editor.js\">EditorJS 官方仓库</a> 了解更多信息，或者查看 <a href=\"https://editorjs.io/\">官方文档</a> 获取详细指南。"
          }
      },
      {
          "id": "linkTest_2",
          "type": "paragraph",
          "data": {
              "text": "联系我们：发送邮件到 <a href=\"mailto:support@example.com\">support@example.com</a> 或拨打电话 <a href=\"tel:+86-138-0013-8000\">+86-138-0013-8000</a>。"
          }
      },
      {
          "id": "linkTest_3",
          "type": "paragraph",
          "data": {
              "text": "更多资源：<a href=\"https://www.npmjs.com/package/@editorjs/editorjs\" target=\"_blank\">NPM 包</a>、<a href=\"#section1\" class=\"nav-link\">页面锚点</a>、<a href=\"https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/a\" title=\"MDN 文档\">HTML a 标签参考</a>。"
          }
      },
      {
          "id": "linkTest_4",
          "type": "paragraph",
          "data": {
              "text": "混合内容测试：这段文字包含 <strong>粗体</strong>、<em>斜体</em>、<code class=\"inline-code\">代码</code> 和 <a href=\"https://example.com\">链接</a>，还有 <u class=\"cdx-underline\">下划线</u> 和 <mark class=\"cdx-marker\">高亮标记</mark>。"
          }
      }
  ],
  "version": "2.31.0-rc.7"
}

//  {
//   time: 1672531200000,
//   blocks: [
//     {
//       id: "header-1",
//       type: "header",
//       data: {
//         text: "欢迎使用 <strong>FlowEdit</strong> 编辑器",
//         level: 1,
//       },
//     },
//     {
//       id: "paragraph-1",
//       type: "paragraph",
//       data: {
//         text: "这是一个功能强大的 <strong>富文本编辑器</strong>，支持多种块类型和 <em>内联样式</em>。您可以使用 <code>代码标记</code> 来突出显示代码片段。",
//       },
//     },
//     {
//       id: "header-2",
//       type: "header",
//       data: {
//         text: "主要功能特性",
//         level: 2,
//       },
//     },
//     {
//       id: "list-1",
//       type: "list",
//       data: {
//         style: "unordered",
//         items: [
//           "支持多种 <strong>块类型</strong>：标题、段落、列表、引用等",
//           "丰富的 <em>内联样式</em>：粗体、斜体、下划线、代码等",
//           "灵活的 <u>样式系统</u>：可自定义样式和主题",
//         ],
//       },
//     },
//     {
//       id: "list-2",
//       type: "list",
//       data: {
//         style: "ordered",
//         items: ["第一步：创建内容", "第二步：编辑样式", "第三步：导出 HTML"],
//       },
//     },
//     {
//       id: "quote-1",
//       type: "quote",
//       data: {
//         text: "优秀的工具能够 <strong>提升效率</strong>，而不是增加复杂性。",
//         caption: "设计哲学",
//       },
//     },
//     {
//       id: "code-1",
//       type: "code",
//       data: {
//         code: "// 示例代码\nfunction convertToHtml(editorData) {\n  const converter = new BlockToHtmlConverter();\n  return converter.convert(editorData);\n}",
//         language: "javascript",
//       },
//     },
//     {
//       id: "delimiter-1",
//       type: "delimiter",
//       data: {},
//     },
//     {
//       id: "header-3",
//       type: "header",
//       data: {
//         text: "技术架构",
//         level: 3,
//       },
//     },
//     {
//       id: "paragraph-2",
//       type: "paragraph",
//       data: {
//         text: "FlowEdit 采用模块化架构设计，包含 <code>BlockToHtmlConverter</code>、<code>BaseBlockProcessor</code> 等核心组件。",
//       },
//     },
//     {
//       id: "image-1",
//       type: "image",
//       data: {
//         file: {
//           url: "https://images.pexels.com/photos/31452638/pexels-photo-31452638.jpeg",
//         },
//         caption: "FlowEdit 编辑器界面预览",
//         withBorder: true,
//         withBackground: false,
//         stretched: false,
//       },
//     },
//     {
//       id: "quote-2",
//       type: "quote",
//       data: {
//         text: "简洁性是 <em>复杂性</em> 的终极表现形式。",
//         caption: "达芬奇",
//       },
//     },
//     {
//       id: "header-4",
//       type: "header",
//       data: {
//         text: "多层级列表示例",
//         level: 2,
//       },
//     },
//     {
//       id: "delimiter-3",
//       type: "delimiter",
//       data: {},
//     },
//     {
//       id: "list-3",
//       type: "list",
//       data: {
//         style: "unordered",
//         items: [
//           {
//             content: "前端技术栈",
//             items: [
//               {
//                 content: "JavaScript 框架",
//                 items: [
//                   {
//                     content: "React - 用户界面库",
//                   },
//                   {
//                     content: "Vue.js - 渐进式框架",
//                   },
//                   {
//                     content: "Angular - 完整解决方案",
//                   },
//                 ],
//               },
//               {
//                 content: "CSS 预处理器",
//                 items: [
//                   {
//                     content: "Sass/SCSS",
//                   },
//                   {
//                     content: "Less",
//                   },
//                   {
//                     content: "Stylus",
//                   },
//                 ],
//               },
//               {
//                 content: "构建工具",
//                 items: [
//                   {
//                     content: "Webpack - 模块打包器",
//                   },
//                   {
//                     content: "Vite - 快速构建工具",
//                   },
//                   {
//                     content: "Rollup - ES6 模块打包器",
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//     },
//     {
//       id: "delimiter-4",
//       type: "delimiter",
//       data: {},
//     },
//     {
//       id: "list-4",
//       type: "list",
//       data: {
//         style: "ordered",
//         items: [
//           {
//             content: "项目规划阶段",
//             items: [
//               {
//                 content: "需求分析",
//               },
//               {
//                 content: "技术选型",
//               },
//               {
//                 content: "架构设计",
//               },
//             ],
//           },
//           {
//             content: "开发阶段",
//             items: [
//               {
//                 content: "环境搭建",
//               },
//               {
//                 content: "核心功能开发",
//                 items: [
//                   {
//                     content: "用户界面",
//                   },
//                   {
//                     content: "业务逻辑",
//                   },
//                   {
//                     content: "数据处理",
//                   },
//                 ],
//               },
//               {
//                 content: "单元测试编写",
//               },
//               {
//                 content: "集成测试",
//               },
//             ],
//           },
//           {
//             content: "测试阶段",
//             items: [
//               {
//                 content: "功能测试",
//               },
//               {
//                 content: "性能测试",
//               },
//               {
//                 content: "兼容性测试",
//               },
//             ],
//           },
//           {
//             content: "部署阶段",
//             items: [
//               {
//                 content: "生产环境配置",
//               },
//               {
//                 content: "CI/CD 流水线",
//               },
//               {
//                 content: "监控和日志",
//               },
//             ],
//           },
//         ],
//       },
//     },
//     {
//       id: "list-5",
//       type: "list",
//       data: {
//         style: "checklist",
//         items: [
//           {
//             content: "完成项目需求分析",
//             meta: {
//               checked: true
//             }
//           },
//           {
//             content: "设计系统架构",
//             meta: {
//               checked: true
//             }
//           },
//           {
//             content: "开发核心功能",
//             meta: {
//               checked: false
//             },
//             items: [
//               {
//                 content: "用户认证模块",
//                 meta: {
//                   checked: true
//                 }
//               },
//               {
//                 content: "数据管理模块",
//                 meta: {
//                   checked: false
//                 }
//               },
//               {
//                 content: "界面优化",
//                 meta: {
//                   checked: false
//                 }
//               }
//             ]
//           },
//           {
//             content: "编写测试用例",
//             meta: {
//               checked: false
//             }
//           },
//           {
//             content: "部署到生产环境",
//             meta: {
//               checked: false
//             }
//           }
//         ],
//       },
//     },
//     {
//       id: "image-2",
//       type: "image",
//       data: {
//         file: {
//           url: "https://images.pexels.com/photos/32801750/pexels-photo-32801750.jpeg",
//         },
//         caption: "代码结构图",
//         withBorder: false,
//         withBackground: true,
//         stretched: true,
//       },
//     },
//     {
//       id: "quote-3",
//       type: "quote",
//       data: {
//         text: "代码是写给 <strong>人</strong> 看的，只是顺便能在机器上运行。",
//         caption: "Harold Abelson",
//       },
//     },
//     {
//       id: "delimiter-2",
//       type: "delimiter",
//       data: {},
//     },
//     {
//       id: "delimiter-5",
//       type: "delimiter",
//       data: {},
//     },
//     {
//       id: "header-5",
//       type: "header",
//       data: {
//         text: "总结",
//         level: 2,
//       },
//     },
//     {
//       id: "paragraph-3",
//       type: "paragraph",
//       data: {
//         text: "通过这个测试数据，我们可以验证 FlowEdit 编辑器对各种 <strong>EditorJS 块类型</strong> 的支持情况，包括文本、图片、列表、引用等多种内容形式。",
//       },
//     },
//   ],
//   version: "2.28.2",
// };

// ES6 模块导出
export default testData;
