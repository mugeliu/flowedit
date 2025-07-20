import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'

export function StorageSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">数据存储</h2>
        <p className="text-muted-foreground">管理文章数据和存储设置</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>存储统计</CardTitle>
          <CardDescription>查看当前的存储使用情况</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">已保存文章</h3>
              <p className="text-sm text-muted-foreground">本地保存的文章数量</p>
            </div>
            <span className="text-2xl font-bold">12</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">存储空间</h3>
              <p className="text-sm text-muted-foreground">已使用的本地存储空间</p>
            </div>
            <span className="text-lg font-medium">2.4 MB</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>数据管理</CardTitle>
          <CardDescription>管理你的文章数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">导出数据</h3>
              <p className="text-sm text-muted-foreground">将所有文章数据导出为JSON文件</p>
            </div>
            <Button variant="outline" size="sm">
              导出
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">导入数据</h3>
              <p className="text-sm text-muted-foreground">从JSON文件导入文章数据</p>
            </div>
            <Button variant="outline" size="sm">
              导入
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">清空数据</h3>
              <p className="text-sm text-muted-foreground text-red-600">删除所有保存的文章数据</p>
            </div>
            <Button variant="destructive" size="sm">
              清空
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}