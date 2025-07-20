import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'

export function EditorSettings() {
  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle>编辑体验</CardTitle>
          <CardDescription>配置编辑器的交互体验</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">自动保存</h3>
              <p className="text-sm text-muted-foreground">自动保存你的文章草稿</p>
            </div>
            <Button variant="outline" size="sm">
              开启
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">智能提示</h3>
              <p className="text-sm text-muted-foreground">显示编辑建议和提示</p>
            </div>
            <Button variant="outline" size="sm">
              开启
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">拖拽排序</h3>
              <p className="text-sm text-muted-foreground">支持通过拖拽调整内容块顺序</p>
            </div>
            <Button variant="outline" size="sm">
              开启
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>工具栏配置</CardTitle>
          <CardDescription>选择编辑器中显示的工具</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">标题工具</span>
              <Button variant="outline" size="sm">开启</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">列表工具</span>
              <Button variant="outline" size="sm">开启</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">引用工具</span>
              <Button variant="outline" size="sm">开启</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">代码工具</span>
              <Button variant="outline" size="sm">开启</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">图片工具</span>
              <Button variant="outline" size="sm">开启</Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">分割线</span>
              <Button variant="outline" size="sm">开启</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}