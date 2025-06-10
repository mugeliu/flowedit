const Icon = txt => `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
            font-family="monospace" font-size="12">${txt}</text>
    </svg>`;

let editor = null;
let isEditorReady = false;
let outputMode = 'json'; // 'json' 或 'html'

// 检查 EditorJS 是否加载完成
function checkEditorJSLoaded() {
    return !!(window.EditorJS);
}

// 显示状态信息
function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
    
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}



// 初始化编辑器
async function initEditor() {
    if (!checkEditorJSLoaded()) {
        showStatus('EditorJS 未加载，请检查 CDN 连接', 'error');
        return;
    }



    try {
        editor = new window.EditorJS({
            holder: 'editorjs',
            placeholder: '开始输入内容...',
            autofocus: true,
            tools: {
                // 标题工具
                header: {
                    class: window.Header,
                    config: {
                        levels: [1, 2, 3, 4, 5, 6],
                        defaultLevel: 2,
                        placeholder: '请输入标题'
                    },
                    inlineToolbar: ['marker', 'link'],
                    toolbox: [
                        { title: 'Heading 1', icon: Icon('H1'), data: { level: 1 } },
                        { title: 'Heading 2', icon: Icon('H2'), data: { level: 2 } },
                        { title: 'Heading 3', icon: Icon('H3'), data: { level: 3 } },
                    ],    
                },
                // 引用工具
                quote: {
                    class: window.Quote,
                    inlineToolbar: ['marker', 'link'],
                    config: {
                        quotePlaceholder: '输入引用内容',
                        captionPlaceholder: '引用来源',
                    }
                },
                // 图片工具
                image: {
                    class: window.ImageTool,
                    inlineToolbar: ['marker', 'link'],
                    config: {
                        endpoints: {
                            byFile: 'http://localhost:8008/uploadFile',
                            byUrl: 'http://localhost:8008/fetchUrl',
                        }
                    }
                },
                // 简单图片工具（无需后端）
                simpleImage: {
                    class: window.SimpleImage,
                    inlineToolbar: ['marker', 'link'],
                },
                // 嵌套列表
                list: {
                    class: window.NestedList,
                    inlineToolbar: ['marker', 'link'],
                    config: {
                        defaultStyle: 'unordered'
                    },
                },
                // 检查列表
                checklist: {
                    class: window.Checklist,
                    inlineToolbar: ['marker', 'link'],
                },
                // 链接嵌入
                linkTool: {
                    class: window.LinkTool,
                    config: {
                        endpoint: 'http://localhost:8008/fetchUrl',
                    }
                },
                // 嵌入工具（YouTube, Twitch, Vimeo等）
                embed: {
                    class: window.Embed,
                    inlineToolbar: false,
                    config: {
                        services: {
                            youtube: true,
                            coub: true,
                            codepen: {
                                regex: /https?:\/\/codepen.io\/([^\/?]*)\/pen\/([^\/?]*)/,
                                embedUrl: 'https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2',
                                html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
                                height: 300,
                                width: 600,
                                id: (groups) => groups.join('/embed/')
                            }
                        }
                    }
                },
                // 表格
                table: {
                    class: window.Table,
                    inlineToolbar: true,
                    config: {
                        rows: 2,
                        cols: 3,
                    },
                },
                // 分隔符
                delimiter: {
                    class: window.Delimiter,
                },
                // 警告
                warning: {
                    class: window.Warning,
                    inlineToolbar: ['marker', 'link'],
                    config: {
                        titlePlaceholder: '标题',
                        messagePlaceholder: '消息',
                    },
                },
                // 代码块
                code: {
                    class: window.CodeTool,
                    config: {
                        placeholder: '输入代码...'
                    }
                },
                // 原始HTML
                raw: {
                    class: window.RawTool,
                    config: {
                        placeholder: '输入HTML代码...'
                    }
                },
                // 附件
                attaches: {
                    class: window.AttachesTool,
                    config: {
                        endpoint: 'http://localhost:8008/uploadFile'
                    }
                },
                // 内联工具
                marker: {
                    class: window.Marker,
                },
                inlineCode: {
                    class: window.InlineCode,
                }
            },
            data: {
                blocks: [
                    {
                        type: 'header',
                        data: {
                            text: '欢迎使用 EditorJS 测试页面',
                            level: 1
                        }
                    },
                    {
                        type: 'paragraph',
                        data: {
                            text: '这是一个测试段落。你可以在这里编辑内容，右侧会实时显示原始数据结构。'
                        }
                    }
                ]
            },
            onChange: function() {
                // 编辑器内容变化时自动刷新输出
                setTimeout(refreshOutput, 100);
            }
        });

        await editor.isReady;
        isEditorReady = true;
        showStatus('编辑器初始化成功！', 'success');
        
        // 初始化输出
        refreshOutput();
        
    } catch (error) {
        console.error('编辑器初始化失败:', error);
        showStatus('编辑器初始化失败: ' + error.message, 'error');
    }
}

// 切换输出模式
function toggleOutputMode() {
    outputMode = outputMode === 'json' ? 'html' : 'json';
    document.getElementById('outputModeLabel').textContent = 
        `当前模式: ${outputMode === 'json' ? 'JSON' : 'HTML'}`;
    refreshOutput();
}

// 刷新输出
async function refreshOutput() {
    if (!editor || !isEditorReady) {
        document.getElementById('output').textContent = '编辑器未就绪';
        return;
    }

    try {
        const outputData = await editor.save();
        const outputEl = document.getElementById('output');
        
        if (outputMode === 'json') {
            outputEl.innerHTML = '';
            outputEl.textContent = JSON.stringify(outputData, null, 2);
        } else if (outputMode === 'html') {
            if (window.htmlParser && window.htmlParser.isReady()) {
                outputEl.innerHTML = window.htmlParser.getFormattedHTML(outputData);
            } else {
                outputEl.textContent = 'HTML 解析器未加载或未初始化';
            }
        }
    } catch (error) {
        console.error('获取数据失败:', error);
        document.getElementById('output').textContent = '获取数据失败: ' + error.message;
    }
}

// 保存数据
async function saveData() {
    if (!editor || !isEditorReady) {
        showStatus('编辑器未就绪', 'error');
        return;
    }

    try {
        const outputData = await editor.save();
        console.log('保存的数据:', outputData);
        showStatus('数据已保存到控制台', 'success');
        refreshOutput();
    } catch (error) {
        console.error('保存失败:', error);
        showStatus('保存失败: ' + error.message, 'error');
    }
}

// 加载示例数据
async function loadSampleData() {
    if (!editor || !isEditorReady) {
        showStatus('编辑器未就绪', 'error');
        return;
    }

    const sampleData = {
        blocks: [
            {
                type: 'header',
                data: {
                    text: 'EditorJS 完整功能演示',
                    level: 1
                }
            },
            {
                type: 'paragraph',
                data: {
                    text: '这是一个包含<mark class="cdx-marker">高亮文本</mark>和<code class="inline-code">内联代码</code>的段落。'
                }
            },
            {
                type: 'quote',
                data: {
                    text: '这是一个引用块的示例',
                    caption: '引用来源',
                    alignment: 'left'
                }
            },
            {
                type: 'warning',
                data: {
                    title: '注意',
                    message: '这是一个警告消息的示例'
                }
            },
            {
                type: 'list',
                data: {
                    style: 'unordered',
                    items: [
                        {
                            content: '无序列表项目 1',
                            items: [
                                {
                                    content: '嵌套项目 1.1',
                                    items: []
                                },
                                {
                                    content: '嵌套项目 1.2',
                                    items: []
                                }
                            ]
                        },
                        {
                            content: '无序列表项目 2',
                            items: []
                        }
                    ]
                }
            },
            {
                type: 'checklist',
                data: {
                    items: [
                        {
                            text: '已完成的任务',
                            checked: true
                        },
                        {
                            text: '待完成的任务',
                            checked: false
                        }
                    ]
                }
            },
            {
                type: 'code',
                data: {
                    code: 'function hello() {\n    console.log("Hello, World!");\n}'
                }
            },
            {
                type: 'delimiter',
                data: {}
            },
            {
                type: 'table',
                data: {
                    withHeadings: true,
                    content: [
                        ['标题1', '标题2', '标题3'],
                        ['行1列1', '行1列2', '行1列3'],
                        ['行2列1', '行2列2', '行2列3']
                    ]
                }
            }
        ]
    };

    try {
        await editor.render(sampleData);
        showStatus('示例数据加载成功', 'success');
        setTimeout(refreshOutput, 100);
    } catch (error) {
        console.error('加载示例数据失败:', error);
        showStatus('加载示例数据失败: ' + error.message, 'error');
    }
}

// 清空编辑器
async function clearEditor() {
    if (!editor || !isEditorReady) {
        showStatus('编辑器未就绪', 'error');
        return;
    }

    try {
        await editor.clear();
        showStatus('编辑器已清空', 'success');
        setTimeout(refreshOutput, 100);
    } catch (error) {
        console.error('清空编辑器失败:', error);
        showStatus('清空编辑器失败: ' + error.message, 'error');
    }
}

// 复制输出数据
async function copyOutput() {
    const outputEl = document.getElementById('output');
    let text;
    
    if (outputMode === 'json') {
        text = outputEl.textContent;
    } else if (outputMode === 'html') {
        // 对于 HTML 模式，复制原始 HTML 代码
        try {
            const outputData = await editor.save();
            if (window.htmlParser && window.htmlParser.isReady()) {
                const result = window.htmlParser.safeParse(outputData);
                text = result.success ? result.html : '获取 HTML 内容失败: ' + result.error;
            } else {
                text = '无法获取 HTML 内容：解析器未初始化';
            }
        } catch (error) {
            text = '获取 HTML 内容失败: ' + error.message;
        }
    }
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showStatus(`${outputMode.toUpperCase()} 数据已复制到剪贴板`, 'success');
        }).catch(err => {
            console.error('复制失败:', err);
            showStatus('复制失败', 'error');
        });
    } else {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showStatus(`${outputMode.toUpperCase()} 数据已复制到剪贴板`, 'success');
        } catch (err) {
            console.error('复制失败:', err);
            showStatus('复制失败', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// 页面加载完成后初始化编辑器
window.addEventListener('load', function() {
    // 等待一小段时间确保所有脚本都加载完成
    setTimeout(initEditor, 100);
});

// 调试信息
console.log('EditorJS CDN 插件状态:', {
    loaded: checkEditorJSLoaded(),
    EditorJS: window.EditorJS,
    Header: window.Header,
    Quote: window.Quote,
    ImageTool: window.ImageTool,
    SimpleImage: window.SimpleImage,
    NestedList: window.NestedList,
    Checklist: window.Checklist,
    LinkTool: window.LinkTool,
    Embed: window.Embed,
    Table: window.Table,
    Delimiter: window.Delimiter,
    Warning: window.Warning,
    CodeTool: window.CodeTool,
    RawTool: window.RawTool,
    AttachesTool: window.AttachesTool,
    Marker: window.Marker,
    InlineCode: window.InlineCode,
    edjsHTML: window.edjsHTML
});