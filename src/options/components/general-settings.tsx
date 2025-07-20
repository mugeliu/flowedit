import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle>扩展状态</CardTitle>
          <CardDescription>控制扩展的启用状态</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">启用FlowEdit</h3>
              <p className="text-sm text-muted-foreground">在微信公众平台编辑器中启用FlowEdit功能</p>
            </div>
            <Button variant="outline" size="sm">
              已启用
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">自动启动</h3>
              <p className="text-sm text-muted-foreground">页面加载时自动启动编辑器</p>
            </div>
            <Button variant="outline" size="sm">
              开启
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}