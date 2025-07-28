import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'
import { PenTool, Settings, Palette, History, FileText, Clock, ChevronRight } from 'lucide-react'
import { storage } from '../../shared/services/storage/index.js'
import { createLogger } from '../../shared/services/logger.js'

const logger = createLogger('OverviewSettings')

interface OverviewSettingsProps {
  onSectionChange?: (section: string) => void
  onEditArticle?: (articleId: string) => void
}

export function OverviewSettings({ onSectionChange, onEditArticle }: OverviewSettingsProps) {
  const [stats, setStats] = useState({
    totalArticles: 0,
    todayArticles: 0,
    templates: 0
  })

  const [recentArticles, setRecentArticles] = useState([])

  useEffect(() => {
    loadStats()
    loadRecentArticles()
  }, [])

  const loadStats = async () => {
    try {
      const articles = await storage.getAllArticles()
      const today = new Date().toDateString()
      const todayCount = articles.filter(article => 
        new Date(article.updatedAt).toDateString() === today
      ).length

      setStats({
        totalArticles: articles.length,
        todayArticles: todayCount,
        templates: 5 // 固定值，或从模板系统获取
      })
    } catch (error) {
      logger.error('加载统计数据失败:', error)
    }
  }

  const loadRecentArticles = async () => {
    try {
      const articles = await storage.getAllArticles()
      const recent = articles
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3)
      setRecentArticles(recent)
    } catch (error) {
      logger.error('加载最近文章失败:', error)
    }
  }

  const quickActions = [
    {
      title: "开始创作",
      description: "使用增强编辑器创作新文章",
      icon: PenTool,
      action: "editor-page",
      color: "bg-blue-500"
    },
    {
      title: "历史文章",
      description: "查看和编辑已保存的文章",
      icon: History,
      action: "history",
      color: "bg-green-500"
    },
    {
      title: "样式管理",
      description: "管理和创建自定义样式模板",
      icon: Palette,
      action: "styles",
      color: "bg-purple-500"
    },
    {
      title: "扩展设置",
      description: "配置编辑器功能和偏好",
      icon: Settings,
      action: "general",
      color: "bg-gray-500"
    }
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return '刚刚'
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* 欢迎区域 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <PenTool className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">欢迎使用 FlowEdit</h2>
          </div>
          <p className="text-gray-600 mb-6">增强微信公众平台编辑器，让内容创作更高效</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalArticles}</div>
              <div className="text-sm text-gray-600">总文章数</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <Clock className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.todayArticles}</div>
              <div className="text-sm text-gray-600">今日编辑</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <Palette className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.templates}</div>
              <div className="text-sm text-gray-600">可用模板</div>
            </div>
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">快速操作</h2>
          <p className="text-gray-600 mt-1">选择你想要进行的操作</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const gradients = {
                'bg-blue-500': 'from-blue-400 via-blue-500 to-blue-600',
                'bg-green-500': 'from-green-400 via-green-500 to-green-600',
                'bg-purple-500': 'from-purple-400 via-purple-500 to-purple-600',
                'bg-gray-500': 'from-gray-400 via-gray-500 to-gray-600'
              }
              const gradientClass = gradients[action.color] || 'from-gray-400 via-gray-500 to-gray-600'
              
              return (
                <div 
                  key={index} 
                  className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                  onClick={() => onSectionChange?.(action.action)}
                >
                  <div className={`h-16 bg-gradient-to-br ${gradientClass} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-3 left-4">
                      <action.icon className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute bottom-2 left-4 right-4">
                      <h3 className="font-bold text-white text-sm truncate drop-shadow-lg">{action.title}</h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{action.description}</p>
                    <div className="flex items-center justify-end mt-3">
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 最近文章 */}
      {recentArticles.length > 0 && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">最近文章</h2>
                <p className="text-gray-600 mt-1">你最近编辑的文章</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onSectionChange?.('history')}
                className="hover:bg-gray-50"
              >
                查看全部
              </Button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {recentArticles.map((article, index) => (
                <div 
                  key={article.id} 
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-200"
                  onClick={() => onEditArticle?.(article.id)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(article.updatedAt)}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}