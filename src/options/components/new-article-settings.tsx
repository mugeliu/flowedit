import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'
import { PenTool, FileText, Clock, ExternalLink } from 'lucide-react'

export function NewArticleSettings() {
  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="w-5 h-5" />
            创作工具
          </CardTitle>
          <CardDescription>选择你的创作方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">新建空白文章</h3>
                  <p className="text-sm text-muted-foreground mt-1">从空白页面开始，自由创作</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    开始创作
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">继续上次编辑</h3>
                  <p className="text-sm text-muted-foreground mt-1">恢复最近的草稿内容</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    查看草稿
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>便捷的创作辅助功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">打开微信编辑器</h3>
              <p className="text-sm text-muted-foreground">直接跳转到微信公众平台编辑器</p>
            </div>
            <Button variant="outline" size="sm">
              立即打开
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">导入本地文档</h3>
              <p className="text-sm text-muted-foreground">从本地文件导入内容到编辑器</p>
            </div>
            <Button variant="outline" size="sm">
              选择文件
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">从模板创建</h3>
              <p className="text-sm text-muted-foreground">使用预设模板快速开始</p>
            </div>
            <Button variant="outline" size="sm">
              浏览模板
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>创作提示</CardTitle>
          <CardDescription>提升你的写作效率</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              使用快捷键 Ctrl+S 随时保存草稿
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              合理使用标题和段落结构，提升可读性
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              图片建议使用微信官方图片工具上传
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              完成后可一键转换为微信公众号格式
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}