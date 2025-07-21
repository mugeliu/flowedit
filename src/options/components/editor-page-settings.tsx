import React, { useEffect, useRef } from 'react'
import { Button } from '../../shared/components/ui/button'
import { Save, Download, Eye, Upload } from 'lucide-react'
import { SidebarTrigger } from '../../shared/components/ui/sidebar'
import { createLogger } from '../../shared/services/logger.js'
import { storage } from '../../shared/services/storage/index.js'

const logger = createLogger('EditorPageSettings')

export function EditorPageSettings() {
  const editorRef = useRef(null)
  const editorInstance = useRef(null)

  useEffect(() => {
    const initializeEditor = async () => {
      if (editorRef.current && !editorInstance.current) {
        try {
          // 加载已打包的 EditorJS Bundle
          await loadEditorJSBundle()
          
          // 从全局变量获取 EditorJS 和工具
          const EditorJS = window.EditorJS
          const { Header, Paragraph, List, Code, Delimiter, ImageTool, InlineCode, Marker, Quote, Raw, Underline } = EditorJS

          // 创建EditorJS实例
          editorInstance.current = new EditorJS({
            holder: editorRef.current,
            autofocus: true,
            placeholder: '开始编写内容...',
            logLevel: 'WARN',
            tools: {
              paragraph: {
                class: Paragraph,
                inlineToolbar: true,
              },
              header: {
                class: Header,
                config: {
                  levels: [1, 2, 3],
                  defaultLevel: 1,
                  placeholder: '请输入标题',
                },
              },
              quote: {
                class: Quote,
                inlineToolbar: true,
                config: {
                  quotePlaceholder: '输入引用内容',
                  captionPlaceholder: '引用来源',
                },
              },
              list: {
                class: List,
                inlineToolbar: true,
                config: {
                  defaultStyle: 'unordered',
                  maxLevel: 5,
                },
              },
              delimiter: { 
                class: Delimiter 
              },
              code: { 
                class: Code,
                config: {
                  placeholder: '输入代码...'
                }
              },
              marker: { 
                class: Marker 
              },
              inlineCode: { 
                class: InlineCode 
              },
              underline: { 
                class: Underline 
              },
              raw: { 
                class: Raw,
                config: {
                  placeholder: '输入HTML代码...'
                }
              }
              // 注意：options页面不包含image工具，因为不需要微信上传功能
            },
            onChange: (api, event) => {
              logger.debug('内容已更改', event)
            }
          })

          logger.info('EditorJS 初始化成功')
        } catch (error) {
          logger.error('EditorJS 初始化失败:', error)
          // 如果EditorJS初始化失败，显示fallback界面
          if (editorRef.current) {
            editorRef.current.innerHTML = `
              <div style="min-height: calc(100vh - 160px); padding: 40px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="max-width: 800px; margin: 0 auto;">
                  <div style="font-size: 36px; font-weight: 300; color: #212529; margin-bottom: 30px; outline: none; padding: 10px; border: none; width: 100%;" contenteditable="true" placeholder="文章标题">
                    
                  </div>
                  <div style="font-size: 18px; line-height: 1.8; color: #495057; outline: none; min-height: 400px; padding: 10px; border: none; width: 100%;" contenteditable="true" placeholder="开始编写内容...">
                    
                  </div>
                  <div style="margin-top: 30px; padding: 16px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; font-size: 14px; color: #856404;">
                    ⚠️ EditorJS 加载失败，当前使用简化编辑模式。功能受限，建议刷新页面重试。
                  </div>
                </div>
              </div>
            `
          }
        }
      }
    }

    initializeEditor()

    return () => {
      if (editorInstance.current && editorInstance.current.destroy) {
        editorInstance.current.destroy()
        editorInstance.current = null
      }
    }
  }, [])

  const handleSave = async () => {
    try {
      if (editorInstance.current && editorInstance.current.save) {
        const editorData = await editorInstance.current.save()
        logger.info('开始保存文章数据:', editorData)
        
        // 使用共享的storage服务保存文章
        const result = await storage.saveOrUpdateArticle(editorData, {
          status: 'draft' // Options页面保存为草稿
        })
        
        if (result.success) {
          logger.info(`文章已保存: ${result.article.title}`)
          // 这里可以添加成功提示UI，比如toast
          alert(`草稿《${result.article.title}》已保存`) // 临时使用alert，后续可改为更好的UI
        } else {
          logger.error('保存失败:', result)
          alert('保存失败: ' + (result.message || '未知错误'))
        }
      } else {
        logger.info('使用简化模式保存')
        // fallback保存逻辑 - 获取contenteditable内容
        const titleElement = document.querySelector('[contenteditable="true"]') as HTMLElement
        if (titleElement) {
          const content = titleElement.innerHTML
          // 简化保存逻辑，将HTML内容转换为简单的EditorJS格式
          const simpleEditorData = {
            blocks: [{
              type: 'paragraph',
              data: {
                text: content || '空内容'
              }
            }]
          }
          
          const result = await storage.saveOrUpdateArticle(simpleEditorData, {
            status: 'draft'
          })
          
          if (result.success) {
            alert(`草稿《${result.article.title}》已保存`)
          } else {
            alert('保存失败: ' + (result.message || '未知错误'))
          }
        }
      }
    } catch (error) {
      logger.error('保存失败:', error)
      alert('保存时发生错误: ' + error.message)
    }
  }

  const handleExport = async () => {
    try {
      if (editorInstance.current && editorInstance.current.save) {
        const data = await editorInstance.current.save()
        logger.info('导出文章数据:', data)
        // 这里可以调用HTML转换器
        // const html = convertToHtml(data, template)
      } else {
        logger.info('使用简化模式导出')
      }
    } catch (error) {
      logger.error('导出失败:', error)
    }
  }

  const handlePreview = async () => {
    try {
      if (editorInstance.current && editorInstance.current.save) {
        const data = await editorInstance.current.save()
        logger.info('预览文章数据:', data)
        // 打开预览窗口
      } else {
        logger.info('使用简化模式预览')
      }
    } catch (error) {
      logger.error('预览失败:', error)
    }
  }

  const handleImport = () => {
    logger.info('导入文档功能')
    // 这里可以添加文件选择和导入逻辑
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.md,.txt'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (file) {
        try {
          const text = await file.text()
          // 根据文件类型处理导入逻辑
          if (file.name.endsWith('.json')) {
            const data = JSON.parse(text)
            if (editorInstance.current && editorInstance.current.render) {
              await editorInstance.current.render(data)
            }
          }
          logger.info('文件导入成功')
        } catch (error) {
          logger.error('文件导入失败:', error)
        }
      }
    }
    input.click()
  }

  return (
    <div className="h-full flex flex-col">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center mb-4">
        <SidebarTrigger className="-ml-1" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            导入
          </Button>
          <Button variant="outline" size="sm" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            预览
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={editorRef}
          className="h-full w-full focus:outline-none"
        />
      </div>
    </div>
  )
}

// 加载 EditorJS Bundle 的辅助函数
function loadEditorJSBundle() {
  return new Promise((resolve, reject) => {
    if (window.EditorJS) {
      resolve()
      return
    }
    
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL('scripts/editorjs-bundle.js')
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}