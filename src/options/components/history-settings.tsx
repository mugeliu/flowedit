import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'
import { History, Search, Filter, Eye, Edit, Trash2, Download, FileText, Clock, RefreshCw } from 'lucide-react'
import { createLogger } from '../../shared/services/logger.js'
import { storage } from '../../shared/services/storage/index.js'
// import { ArticlePreview } from './article-preview'

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

export function HistorySettings() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [storage, setStorage] = useState<any>(null)
  // 移除预览相关状态
  // const [previewOpen, setPreviewOpen] = useState(false)
  // const [previewArticleId, setPreviewArticleId] = useState<string | null>(null)

  // Initialize storage service
  useEffect(() => {
    const initStorage = async () => {
      try {
        setStorage(storage)
        await loadArticles(storage)
      } catch (error) {
        logger.error('Failed to initialize storage service:', error)
        setLoading(false)
      }
    }
    initStorage()
  }, [])

  const loadArticles = async (storageService?: any) => {
    try {
      setLoading(true)
      const service = storageService || storage
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
    if (!storage) return
    
    if (confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
      try {
        const success = await storage.deleteArticle(articleId)
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
    if (!storage) return
    
    try {
      const article = await storage.getArticle(articleId)
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

  const handlePreviewArticle = (articleId: string) => {
    // 预览功能已移除
    logger.info('预览功能已移除，文章ID:', articleId)
    // 可以添加其他操作，比如跳转到编辑页面等
  }

  // Filter articles based on search term and status
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchTerm === '' || 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" />
              加载文章列表中...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                历史文章管理
              </CardTitle>
              <CardDescription>查看和管理你的所有文章</CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex gap-4 flex-wrap mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="搜索文章标题或内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">全部状态</option>
              <option value="已发布">已发布</option>
              <option value="草稿">草稿</option>
              <option value="已归档">已归档</option>
            </select>
          </div>

          {/* 文章列表 */}
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || statusFilter !== 'all' ? '未找到匹配的文章' : '暂无文章'}
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{article.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          article.status === '已发布' 
                            ? 'bg-green-100 text-green-700' 
                            : article.status === '草稿'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {article.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{article.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          创建: {article.createdAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Edit className="w-3 h-3" />
                          修改: {article.updatedAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {article.wordCount} 字
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePreviewArticle(article.id)}
                        title="预览文章"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExportArticle(article.id)}
                        title="导出文章"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteArticle(article.id)}
                        title="删除文章"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 显示文章统计信息 */}
          {articles.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>共 {filteredArticles.length} 篇文章</span>
                <span>总计 {filteredArticles.reduce((sum, article) => sum + article.wordCount, 0)} 字</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 批量操作 */}
      <Card>
        <CardHeader>
          <CardTitle>数据管理</CardTitle>
          <CardDescription>批量操作和数据维护</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">导出所有文章</h3>
              <p className="text-sm text-muted-foreground">将所有文章导出为JSON格式文件</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                if (!storage) return
                try {
                  const allArticles = await storage.getAllArticles()
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
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">清理数据</h3>
              <p className="text-sm text-muted-foreground">删除过期的草稿和临时数据</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                if (!storage) return
                if (confirm('确定要清理过期数据吗？这将删除超过30天的草稿。')) {
                  try {
                    await storage.cleanup()
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
        </CardContent>
      </Card>

      {/* 预览组件已移除 */}
      {/* <ArticlePreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        articleId={previewArticleId}
        onDelete={handleDeleteArticle}
        onExport={handleExportArticle}
      /> */}
    </div>
  )
}