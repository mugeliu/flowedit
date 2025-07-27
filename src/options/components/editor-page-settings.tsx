import React, { useEffect, useRef, useState } from 'react'
import { Button } from '../../shared/components/ui/button'
import { Save, Download, Eye, Upload } from 'lucide-react'
import { SidebarTrigger } from '../../shared/components/ui/sidebar'
import { PreviewDialog } from '../../shared/components/preview-dialog'
import { createLogger } from '../../shared/services/logger.js'
import { storage } from '../../shared/services/storage/index.js'

const logger = createLogger('EditorPageSettings')

interface EditorPageSettingsProps {
  articleId?: string | null
}

export function EditorPageSettings({ articleId }: EditorPageSettingsProps) {
  const editorRef = useRef(null)
  const editorInstance = useRef(null)
  const [currentArticleId, setCurrentArticleId] = useState<string | null>(null)
  const [editorReady, setEditorReady] = useState(false)
  
  // 预览状态
  const [previewOpen, setPreviewOpen] = useState(false)

  useEffect(() => {
    const initializeEditor = async () => {
      if (editorRef.current && !editorInstance.current) {
        try {
          // 加载已打包的 EditorJS Bundle
          await loadEditorJSBundle()
          
          // 从全局变量获取 EditorJS 和工具
          const EditorJS = window.EditorJS
          const { Header, Paragraph, List, Code, Delimiter, ImageTool, InlineCode, Marker, Quote, Raw, Underline } = EditorJS

          // 标题工具图标资源
          const EDITOR_ICONS = {
            h1: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M19 17V10.2135C19 10.1287 18.9011 10.0824 18.836 10.1367L16 12.5"/>
            </svg>`,
            h2: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10 19 9.5 19 12C19 13.9771 16.0684 13.9997 16.0012 16.8981C15.9999 16.9533 16.0448 17 16.1 17L19.3 17"/>
            </svg>`,
            h3: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M6 7L6 12M6 17L6 12M6 12L12 12M12 7V12M12 17L12 12"/>
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M16 11C16 10.5 16.8323 10 17.6 10C18.3677 10 19.5 10.311 19.5 11.5C19.5 12.5315 18.7474 12.9022 18.548 12.9823C18.5378 12.9864 18.5395 13.0047 18.5503 13.0063C18.8115 13.0456 20 13.3065 20 14.8C20 16 19.5 17 17.8 17C17.8 17 16 17 16 16.3"/>
            </svg>`
          }

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
                toolbox: [
                  { title: "标题 1", icon: EDITOR_ICONS.h1, data: { level: 1 } },
                  { title: "标题 2", icon: EDITOR_ICONS.h2, data: { level: 2 } },
                  { title: "标题 3", icon: EDITOR_ICONS.h3, data: { level: 3 } },
                ],
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
                class: Code
              },
              raw: { 
                class: Raw
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
              image: {
                class: ImageTool,
                config: {
                  endpoints: {
                    byFile: 'https://httpbin.org/post', // 临时端点，实际使用时应配置真实的上传服务
                    byUrl: 'https://httpbin.org/post',
                  }
                }
              }
            },
            onChange: (api, event) => {
              logger.debug('内容已更改', event)
            },
            onReady: () => {
              logger.info('EditorJS 已准备就绪')
              setEditorReady(true)
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
      setEditorReady(false)
      setCurrentArticleId(null)
    }
  }, [])

  // 加载指定文章的数据
  useEffect(() => {
    const loadArticleData = async () => {
      if (articleId && editorInstance.current && editorReady && articleId !== currentArticleId) {
        try {
          logger.info(`开始加载文章: ${articleId}`)
          logger.info(`编辑器实例状态:`, {
            hasEditor: !!editorInstance.current,
            hasRender: !!editorInstance.current?.render,
            isReady: editorReady
          })
          
          const articleData = await storage.getArticleEditorData(articleId)
          logger.info(`获取到文章数据:`, articleData)
          
          if (articleData && editorInstance.current.render) {
            logger.info(`准备渲染文章数据，blocks数量: ${articleData.blocks?.length || 0}`)
            await editorInstance.current.render(articleData)
            setCurrentArticleId(articleId)
            logger.info(`文章加载成功: ${articleId}`)
          } else {
            logger.warn(`无法加载文章: ${articleId}`, {
              hasData: !!articleData,
              hasRenderMethod: !!editorInstance.current?.render
            })
          }
        } catch (error) {
          logger.error(`加载文章失败: ${articleId}`, error)
        }
      } else {
        logger.debug('跳过文章加载:', {
          articleId,
          hasEditor: !!editorInstance.current,
          editorReady,
          currentId: currentArticleId,
          shouldLoad: articleId && editorInstance.current && editorReady && articleId !== currentArticleId
        })
      }
    }

    loadArticleData()
  }, [articleId, currentArticleId, editorReady])

  const handleSave = async () => {
    try {
      if (editorInstance.current && editorInstance.current.save) {
        const editorData = await editorInstance.current.save()
        logger.info('开始保存文章数据:', editorData)
        
        // 如果是编辑现有文章，更新它；否则创建新文章
        const result = currentArticleId 
          ? await storage.updateArticle(currentArticleId, {
              editorData,
              updatedAt: new Date().toISOString()
            })
          : await storage.saveOrUpdateArticle(editorData, {
              status: 'draft' // Options页面保存为草稿
            })
        
        if (result.success || result) {
          const article = result.article || result
          logger.info(`文章已保存: ${article.title}`)
          // 如果是新文章，记录ID
          if (!currentArticleId && article.id) {
            setCurrentArticleId(article.id)
          }
          alert(`草稿《${article.title}》已保存`) // 临时使用alert，后续可改为更好的UI
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
        // const html = await convertToHtml(data)
      } else {
        logger.info('使用简化模式导出')
      }
    } catch (error) {
      logger.error('导出失败:', error)
    }
  }

  const handlePreview = async () => {
    setPreviewOpen(true)
  }

  const loadCurrentEditorData = async () => {
    try {
      if (editorInstance.current && editorInstance.current.save) {
        const data = await editorInstance.current.save()
        logger.info('加载编辑器数据用于预览:', data)
        return data
      } else {
        // 简化模式的fallback
        const titleElement = document.querySelector('[contenteditable="true"]') as HTMLElement
        if (titleElement) {
          const content = titleElement.innerHTML || '空内容'
          return {
            blocks: [{
              type: 'paragraph',
              data: {
                text: content
              }
            }]
          }
        }
        throw new Error('无法获取编辑器内容')
      }
    } catch (error) {
      logger.error('加载编辑器数据失败:', error)
      throw error
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
      <div className="flex-1 overflow-auto">
        <div 
          ref={editorRef}
          className="h-full w-full focus:outline-none min-h-[calc(100vh-160px)]"
        />
      </div>

      {/* 预览对话框 */}
      <PreviewDialog
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="编辑器内容预览"
        subtitle="当前编辑内容的样式预览"
        loadData={loadCurrentEditorData}
        metadata={{
          来源: '编辑器页面',
          模式: editorInstance.current ? 'EditorJS' : '简化模式'
        }}
      />
    </div>
  )
}

// 加载 EditorJS Bundle 的辅助函数
function loadEditorJSBundle() {
  return new Promise((resolve, reject) => {
    if (window.EditorJS) {
      logger.info('EditorJS already loaded')
      resolve()
      return
    }
    
    logger.info('Loading EditorJS bundle...')
    const script = document.createElement('script')
    script.src = chrome.runtime.getURL('scripts/editorjs-bundle.js')
    
    script.onload = () => {
      logger.info('EditorJS bundle loaded successfully')
      // 添加一个小延迟确保全局变量设置完成
      setTimeout(() => {
        if (window.EditorJS) {
          logger.info('EditorJS global variable confirmed')
          resolve()
        } else {
          logger.error('EditorJS global variable not found after loading')
          reject(new Error('EditorJS global variable not found'))
        }
      }, 100)
    }
    
    script.onerror = (error) => {
      logger.error('Failed to load EditorJS bundle:', error)
      reject(new Error('Failed to load EditorJS bundle'))
    }
    
    document.head.appendChild(script)
  })
}