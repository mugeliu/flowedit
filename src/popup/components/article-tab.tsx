import React, { useState, useEffect } from 'react'
import { Button } from '../../shared/components/ui/button'
import { FileText, Eye, Trash2, Clock, Search } from 'lucide-react'
import { toast } from 'sonner'
import { createLogger } from '../../shared/services/logger.js'
import { ArticlePreview } from './article-preview'

const logger = createLogger('ArticleTab')

interface Article {
  id: string
  title: string
  summary: string
  createdAt: string
  updatedAt: string
  status: string
  wordCount: number
  metadata?: any
}

export function ArticleTab() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)
  const [storageService, setStorageService] = useState<any>(null)
  const [showSearch, setShowSearch] = useState(false)

  // Initialize storage service
  useEffect(() => {
    const initStorage = async () => {
      try {
        const { storage } = await import('../../shared/services/storage/index.js')
        setStorageService(storage)
        await loadArticles(storage)
      } catch (error) {
        logger.error('Failed to initialize storage service:', error)
        setLoading(false)
      }
    }
    initStorage()
  }, [])

  const loadArticles = async (storageServiceParam?: any) => {
    try {
      setLoading(true)
      const service = storageServiceParam || storageService
      if (!service) return

      const articleList = await service.getAllArticles({
        sortOrder: 'updatedAt_desc',
        limit: 50
      })

      // Transform articles to match UI interface
      const transformedArticles = articleList.map((article: any) => ({
        id: article.id,
        title: article.title || '未命名文章',
        summary: article.summary || '暂无摘要',
        createdAt: new Date(article.createdAt).toLocaleString('zh-CN'),
        updatedAt: new Date(article.updatedAt).toLocaleString('zh-CN'),
        status: getStatusText(article.status),
        wordCount: article.wordCount || 0,
        metadata: article.metadata
      }))

      setArticles(transformedArticles)
      logger.info(`Loaded ${transformedArticles.length} articles`)
    } catch (error) {
      logger.error('Failed to load articles:', error)
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return '已发布'
      case 'draft': return '草稿'
      case 'archived': return '已归档'
      default: return '未知'
    }
  }

  const handlePreviewArticle = (article: Article) => {
    setPreviewArticle(article)
  }

  const handleBackFromPreview = () => {
    setPreviewArticle(null)
  }

  const handleToggleSearch = () => {
    if (showSearch) {
      // 如果正在关闭搜索，清空搜索词
      setSearchTerm('')
    }
    setShowSearch(!showSearch)
  }

  const handleDeleteArticle = async (articleId: string) => {
    if (!storageService) return
    
    if (confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
      try {
        const success = await storageService.deleteArticle(articleId)
        if (success) {
          await loadArticles()
          toast.success('文章删除成功')
          logger.info(`Article ${articleId} deleted successfully`)
        } else {
          toast.error('删除文章失败')
          logger.error(`Failed to delete article ${articleId}`)
        }
      } catch (error) {
        logger.error('Error deleting article:', error)
        toast.error('删除文章失败')
      }
    }
  }

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 如果正在预览文章，显示预览组件
  if (previewArticle) {
    return <ArticlePreview article={previewArticle} onBack={handleBackFromPreview} />
  }

  return (
    <div className="h-full bg-white overflow-hidden flex flex-col">
      {/* 头部区域 */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <h2 className="font-semibold">我的文章</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSearch}
            className="h-7 px-2 text-white hover:bg-white/20"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 可展开的搜索栏 */}
      {showSearch && (
        <div className="p-3 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文章..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* 文章列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-500">加载文章中...</p>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {searchTerm ? '未找到相关文章' : '暂无文章'}
            </h3>
            <p className="text-xs text-gray-500 text-center mb-3">
              {searchTerm ? '尝试调整搜索关键词' : '暂无保存的文章'}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-all duration-200 hover:border-gray-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm leading-tight truncate pr-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewArticle(article)}
                      className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteArticle(article.id)}
                      className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.updatedAt}
                    </span>
                    <span>{article.wordCount.toLocaleString()} 字</span>
                  </div>
                  
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      article.status === '已发布'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {article.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}