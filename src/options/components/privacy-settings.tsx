import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'

export function PrivacySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">隐私安全</h2>
        <p className="text-muted-foreground">管理数据隐私和安全设置</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>数据隐私</CardTitle>
          <CardDescription>控制数据收集和使用方式</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">本地存储</h3>
              <p className="text-sm text-muted-foreground">所有数据仅存储在你的设备上</p>
            </div>
            <span className="text-green-600 text-sm font-medium">安全</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">数据加密</h3>
              <p className="text-sm text-muted-foreground">敏感数据使用加密存储</p>
            </div>
            <span className="text-green-600 text-sm font-medium">已启用</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>权限管理</CardTitle>
          <CardDescription>管理扩展程序的权限</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">存储权限</h3>
              <p className="text-sm text-muted-foreground">允许在本地存储文章数据</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              必需
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">页面访问</h3>
              <p className="text-sm text-muted-foreground">仅在微信公众平台编辑器页面工作</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              必需
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}