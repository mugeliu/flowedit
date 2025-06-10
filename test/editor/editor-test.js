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
    return !!(window.EditorJSBundle && window.EditorJSBundle.EditorJS);
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
        showStatus('EditorJS 未加载，请检查 editorjs-bundle.js 文件', 'error');
        return;
    }



    try {
        editor = new window.EditorJSBundle.EditorJS({
            holder: 'editorjs',
            placeholder: '开始输入内容...',
            autofocus: true,
            tools: {
                paragraph: {
                    class: window.EditorJSBundle.Paragraph,
                    inlineToolbar: true,
                },
                header: {
                    class: window.EditorJSBundle.Header,
                    config: {
                        levels: [1, 2, 3, 4, 5, 6],
                        defaultLevel: 2,
                        placeholder: '请输入标题'
                    },
                    inlineToolbar: true,
                    toolbox: [
                    { title: 'Heading 1', icon: Icon('H1'), data: { level: 1 } },
                    { title: 'Heading 2', icon: Icon('H2'), data: { level: 2 } },
                    { title: 'Heading 3', icon: Icon('H3'), data: { level: 3 } },
                        ],    
                },
                quote: {
                    class: window.EditorJSBundle.Quote,
                    inlineToolbar: true,
                    config: {
                        quotePlaceholder: '输入引用内容',
                        captionPlaceholder: '引用来源',
                    }
                },
                image: {
                    class: window.EditorJSBundle.ImageTool,
                    inlineToolbar: true,
                    config: {
                        endpoints: {
                        }
                    }
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
                    text: '示例标题',
                    level: 2
                }
            },
            {
                type: 'paragraph',
                data: {
                    text: '这是一个示例段落，包含一些<b>粗体</b>和<i>斜体</i>文本。'
                }
            },
            {
                type: 'header',
                data: {
                    text: '另一个标题',
                    level: 3
                }
            },
            {
                type: 'paragraph',
                data: {
                    text: '这是另一个段落，用于测试多个块的数据结构。'
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
console.log('EditorJS Bundle 状态:', {
    loaded: checkEditorJSLoaded(),
    EditorJS: window.EditorJSBundle?.EditorJS,
    Paragraph: window.EditorJSBundle?.Paragraph,
    Header: window.EditorJSBundle?.Header,
    edjsHTML: window.edjsHTML
});