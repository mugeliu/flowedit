import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'
import { PenTool, Settings, Palette, History, BarChart3, Clock, FileText, Users } from 'lucide-react'

export function OverviewSettings() {
  const quickActions = [
    {
      title: "编辑器",
      description: "开始创作新的文章内容",
      icon: PenTool,
      action: "editor",
      color: "bg-blue-500"
    },
    {
      title: "基本设置",
      description: "配置扩展的基本功能",
      icon: Settings,
      action: "general",
      color: "bg-green-500"
    },
    {
      title: "我的样式",
      description: "管理自定义样式模板",
      icon: Palette,
      action: "styles",
      color: "bg-purple-500"
    },
    {
      title: "历史文章",
      description: "查看已保存的文章",
      icon: History,
      action: "history",
      color: "bg-orange-500"
    }
  ]

  const stats = [
    { label: "总文章数", value: "12", icon: FileText },
    { label: "今日编辑", value: "3", icon: Clock },
    { label: "自定义样式", value: "5", icon: Palette },
    { label: "使用天数", value: "28", icon: BarChart3 }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">欢迎使用 FlowEdit</CardTitle>
          <CardDescription>
            增强微信公众平台编辑器体验，提供现代化的富文本编辑功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>选择你想要进行的操作</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <div key={index} className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium group-hover:text-primary transition-colors">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>最近活动</CardTitle>
          <CardDescription>你的最近编辑记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <PenTool className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">编辑了文章《如何提升用户体验设计》</p>
                <p className="text-xs text-muted-foreground">2小时前</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Palette className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">创建了新样式模板《商务风格》</p>
                <p className="text-xs text-muted-foreground">1天前</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">更新了编辑器配置</p>
                <p className="text-xs text-muted-foreground">3天前</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用提示</CardTitle>
          <CardDescription>充分利用FlowEdit的强大功能</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              使用 Ctrl+S 随时保存你的文章草稿
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              在"我的样式"中创建个性化的文章模板
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              使用拖拽功能重新排列文章内容块
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              完成编辑后可一键转换为微信公众号格式
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}