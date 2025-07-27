import React, { useState, useEffect } from 'react'
import { Button } from '../../shared/components/ui/button'
import { X, Loader2, AlertCircle, Calendar, User, Hash, Palette } from 'lucide-react'
import { convertToHtml } from '../../shared/services/parsers/index.js'
import { createLogger } from '../../shared/services/logger.js'

const logger = createLogger('PreviewDialog')

interface PreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  loadData: () => Promise<any>
  templateId?: string // 如果提供，使用指定模板；否则使用当前模板
  metadata?: {
    createdAt?: string
    updatedAt?: string
    wordCount?: number
    status?: string
    [key: string]: any
  }
}

export function PreviewDialog({ 
  isOpen, 
  onClose,
  title,
  subtitle,
  loadData,
  templateId,
  metadata
}: PreviewDialogProps) {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editorData, setEditorData] = useState<any>(null)

  useEffect(() => {
    if (isOpen) {
      generatePreview()
    }
  }, [isOpen, templateId])

  const generatePreview = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 加载数据
      const data = await loadData()
      if (!data) {
        throw new Error('无法加载数据')
      }

      setEditorData(data)

      // 转换为HTML
      let html: string
      if (templateId) {
        // 使用指定模板
        html = await convertToHtml(data, templateId)
        logger.info(`预览生成成功: ${title} (模板: ${templateId})`)
      } else {
        // 使用当前模板
        html = await convertToHtml(data)
        logger.info(`预览生成成功: ${title} (当前模板)`)
      }
      
      setHtmlContent(html)
      
    } catch (error) {
      logger.error('生成预览失败:', error)
      setError(error instanceof Error ? error.message : '生成预览失败')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 对话框内容 - 手机预览模式 */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] flex flex-col mx-4">
        {/* 头部 */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {templateId && <Palette className="w-4 h-4 text-primary" />}
              <h2 className="text-base font-semibold truncate">{title}</h2>
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {metadata && (
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                {metadata.wordCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    <span>{metadata.wordCount}字</span>
                  </div>
                )}
                {metadata.status && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    metadata.status === '已发布' 
                      ? 'bg-green-100 text-green-700' 
                      : metadata.status === '草稿'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {metadata.status}
                  </span>
                )}
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-6 w-6 p-0 ml-2"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">生成预览中...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-32 text-red-600">
              <AlertCircle className="w-6 h-6 mb-2" />
              <span className="text-center text-sm">{error}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generatePreview}
                className="mt-2 text-xs"
              >
                重试
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-2">
              {/* 预览信息 - 精简版 */}
              {metadata && (
                <div className="mb-2 p-2 bg-white rounded text-xs">
                  <div className="font-medium mb-1">
                    {templateId ? `样式预览` : `内容预览`}
                  </div>
                  <div className="text-muted-foreground">
                    {templateId && <div>模板: {templateId}</div>}
                  </div>
                </div>
              )}
              
              {/* 渲染的HTML内容 - 手机适配 */}
              <div 
                className="bg-white rounded-lg p-3 shadow-sm"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                style={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  lineHeight: '1.6',
                  color: '#333',
                  fontSize: '14px',
                  wordBreak: 'break-word'
                }}
              />
            </div>
          )}
        </div>

        {/* 底部操作区 */}
        <div className="flex justify-end gap-2 p-2 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} size="sm" className="text-xs">
            关闭
          </Button>
          <Button onClick={generatePreview} disabled={loading} size="sm" className="text-xs">
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                重新生成
              </>
            ) : (
              '刷新预览'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}