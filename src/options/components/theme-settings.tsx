import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'

export function ThemeSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">主题外观</h2>
        <p className="text-muted-foreground">自定义编辑器的视觉样式</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>主题选择</CardTitle>
          <CardDescription>选择你喜欢的编辑器主题</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-50 to-blue-100 border"></div>
                <div>
                  <p className="font-medium">默认主题</p>
                  <p className="text-sm text-muted-foreground">简洁明亮的默认样式</p>
                </div>
              </div>
              <Button variant="outline" size="sm">选择</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-slate-700 to-slate-900 border"></div>
                <div>
                  <p className="font-medium">深色主题</p>
                  <p className="text-sm text-muted-foreground">适合夜间使用的深色样式</p>
                </div>
              </div>
              <Button variant="outline" size="sm">选择</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-green-50 to-green-100 border"></div>
                <div>
                  <p className="font-medium">护眼主题</p>
                  <p className="text-sm text-muted-foreground">减少眼疲劳的柔和色调</p>
                </div>
              </div>
              <Button variant="outline" size="sm">选择</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>字体设置</CardTitle>
          <CardDescription>调整编辑器的字体样式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">字体大小</h3>
              <p className="text-sm text-muted-foreground">调整编辑器中的字体大小</p>
            </div>
            <Button variant="outline" size="sm">
              16px
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">行高</h3>
              <p className="text-sm text-muted-foreground">调整文本行之间的间距</p>
            </div>
            <Button variant="outline" size="sm">
              1.6
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}