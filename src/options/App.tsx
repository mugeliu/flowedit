import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/components/ui/card'
import { Button } from '../shared/components/ui/button'

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">FlowEdit 设置</h1>
          <p className="text-muted-foreground">配置你的编辑器偏好设置</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>编辑器设置</CardTitle>
            <CardDescription>自定义编辑器的行为和外观</CardDescription>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App