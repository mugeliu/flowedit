import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'
import { History, Search, Filter, Eye, Edit, Trash2, Download, FileText, Clock, RefreshCw } from 'lucide-react'
import { createLogger } from '../../shared/services/logger.js'
import { storage } from '../../shared/services/storage/index.js'
import { PreviewDialog } from '../../shared/components/preview-dialog'

const logger = createLogger('HistorySettings')

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

interface HistorySettingsProps {
  onEditArticle?: (articleId: string) => void
  onSectionChange?: (section: string) => void
}

export function HistorySettings({ onEditArticle, onSectionChange }: HistorySettingsProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [storageService, setStorageService] = useState<any>(null)
  
  // 预览相关状态
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)

  // Initialize storage service
  useEffect(() => {
    const initStorage = async () => {
      try {
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

  const handleRefresh = () => {
    loadArticles()
  }

  const handleDeleteArticle = async (articleId: string) => {
    if (!storageService) return
    
    if (confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
      try {
        const success = await storageService.deleteArticle(articleId)
        if (success) {
          await loadArticles()
          logger.info(`Article ${articleId} deleted successfully`)
        } else {
          logger.error(`Failed to delete article ${articleId}`)
        }
      } catch (error) {
        logger.error('Error deleting article:', error)
      }
    }
  }

  const handleExportArticle = async (articleId: string) => {
    if (!storageService) return
    
    try {
      const article = await storageService.getArticle(articleId)
      if (article) {
        const exportData = {
          title: article.title,
          content: article.content,
          metadata: article.metadata,
          exportedAt: new Date().toISOString()
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${article.title || '文章'}.json`
        a.click()
        URL.revokeObjectURL(url)
        
        logger.info(`Article ${articleId} exported successfully`)
      }
    } catch (error) {
      logger.error('Error exporting article:', error)
    }
  }

  const handlePreviewArticle = (article: Article) => {
    setPreviewArticle(article)
    setPreviewOpen(true)
  }

  const handleLoadArticle = async () => {
    if (!storageService || !previewArticle) {
      throw new Error('存储服务未初始化或文章不存在')
    }
    // 使用 getArticleEditorData 获取 EditorJS 格式的数据
    const editorData = await storageService.getArticleEditorData(previewArticle.id)
    if (!editorData) {
      throw new Error('无法加载文章的EditorJS数据')
    }
    return editorData
  }

  // Filter articles based on search term only
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-white animate-spin" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">加载文章列表</h3>
            <p className="text-sm text-gray-500">正在获取您的文章...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 主文章列表 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <History className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">历史文章管理</h2>
              </div>
              <p className="text-gray-600">查看和管理你的所有文章</p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {/* 搜索和筛选 */}
          <div className="flex gap-4 flex-wrap mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="搜索文章标题或内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 文章列表 */}
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? '未找到匹配的文章' : '暂无文章'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? '请尝试修改搜索条件' : '开始创作你的第一篇文章吧'}
                </p>
              </div>
            ) : (
              filteredArticles.map((article) => {
                return (
                  <div key={article.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg">{article.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{article.summary}</p>
                        <div className="flex items-center gap-6 text-xs text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            创建: {article.createdAt}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Edit className="w-3.5 h-3.5" />
                            修改: {article.updatedAt}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            {article.wordCount} 字
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-6">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onEditArticle?.(article.id)}
                          className="hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                          title="编辑文章"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePreviewArticle(article)}
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                          title="预览文章"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExportArticle(article.id)}
                          className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600"
                          title="导出文章"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          onClick={() => handleDeleteArticle(article.id)}
                          title="删除文章"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* 显示文章统计信息 */}
          {articles.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">共 <span className="font-semibold text-gray-900">{filteredArticles.length}</span> 篇文章</span>
                <span className="text-gray-600">总计 <span className="font-semibold text-gray-900">{filteredArticles.reduce((sum, article) => sum + article.wordCount, 0)}</span> 字</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">数据管理</h2>
          <p className="text-gray-600 mt-1">批量操作和数据维护</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">导出所有文章</h3>
                <p className="text-sm text-gray-600">将所有文章导出为JSON格式文件</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-blue-50"
              onClick={async () => {
                if (!storageService) return
                try {
                  const allArticles = await storageService.getAllArticles()
                  const exportData = {
                    articles: allArticles,
                    exportedAt: new Date().toISOString(),
                    version: '1.0.0'
                  }
                  
                  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                    type: 'application/json' 
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `flowedit-articles-${new Date().getTime()}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                  
                  logger.info('All articles exported successfully')
                } catch (error) {
                  logger.error('Error exporting all articles:', error)
                }
              }}
            >
              导出
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">清理数据</h3>
                <p className="text-sm text-gray-600">删除过期的草稿和临时数据</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="hover:bg-orange-50"
              onClick={async () => {
                if (!storageService) return
                if (confirm('确定要清理过期数据吗？这将删除超过30天的草稿。')) {
                  try {
                    await storageService.cleanup()
                    await loadArticles()
                    logger.info('Data cleanup completed')
                  } catch (error) {
                    logger.error('Error during cleanup:', error)
                  }
                }
              }}
            >
              清理
            </Button>
          </div>
        </div>
      </div>

      {/* 文章预览对话框 */}
      {previewArticle && (
        <PreviewDialog
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false)
            setPreviewArticle(null)
          }}
          title={previewArticle.title}
          subtitle="历史文章预览"
          loadData={handleLoadArticle}
          metadata={{
            createdAt: previewArticle.createdAt,
            updatedAt: previewArticle.updatedAt,
            wordCount: previewArticle.wordCount,
            status: previewArticle.status
          }}
        />
      )}
    </div>
  )
}