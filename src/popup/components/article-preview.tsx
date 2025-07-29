import React, { useState, useEffect } from 'react'
import { Button } from '../../shared/components/ui/button'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createLogger } from '../../shared/services/logger.js'

const logger = createLogger('ArticlePreview')

interface Article {
  id: string
  title: string
  summary: string
  createdAt: string
  updatedAt: string
  status: string
  wordCount: number
}

interface ArticlePreviewProps {
  article: Article
  onBack: () => void
}

export function ArticlePreview({ article, onBack }: ArticlePreviewProps) {
  const [previewContent, setPreviewContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadArticlePreview()
  }, [article.id])

  const loadArticlePreview = async () => {
    try {
      setLoading(true)
      setError(null)

      // 加载文章的EditorJS数据
      const { storage } = await import('../../shared/services/storage/index.js')
      const editorData = await storage.getArticleEditorData(article.id)
      
      if (!editorData) {
        throw new Error('无法加载文章数据')
      }

      // 使用当前模板渲染文章
      const { convertToHtml } = await import('../../shared/services/parsers/index.js')
      const html = await convertToHtml(editorData)
      setPreviewContent(html)

      logger.info('文章预览加载成功', { 
        articleId: article.id,
        title: article.title,
        blocksCount: editorData.blocks?.length || 0
      })

    } catch (error) {
      logger.error('加载文章预览失败:', error)
      setError(error instanceof Error ? error.message : '加载预览失败')
      toast.error('加载预览失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full bg-white flex flex-col">
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 px-2 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <FileText className="w-4 h-4" />
            <h2 className="font-semibold">文章预览</h2>
          </div>
        </div>

        {/* 加载状态 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="text-sm text-gray-500">正在生成预览...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-white flex flex-col">
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 px-2 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <FileText className="w-4 h-4" />
            <h2 className="font-semibold">预览失败</h2>
          </div>
        </div>

        {/* 错误状态 */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">预览加载失败</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button
              onClick={loadArticlePreview}
              className="bg-red-600 hover:bg-red-700"
            >
              重试
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 px-2 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <FileText className="w-4 h-4" />
            <h2 className="font-semibold">文章预览</h2>
          </div>
          <div className="text-right text-xs">
            <div className="font-medium">{article.title}</div>
            <div className="text-green-100">{article.wordCount} 字</div>
          </div>
        </div>
      </div>

      {/* 预览内容 */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-xs mx-auto bg-white shadow-sm">
          {/* 预览容器 */}
          <div 
            className="preview-content p-3"
            dangerouslySetInnerHTML={{ __html: previewContent }}
            style={{
              fontSize: '12px',
              lineHeight: '1.5',
              color: '#333'
            }}
          />
        </div>
      </div>
    </div>
  )
}