import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'
import { ExternalLink, Github, Heart, Shield, Lock, Database, Keyboard } from 'lucide-react'

export function AboutSettings() {
  const shortcuts = [
    { action: '保存文章', key: 'Ctrl + S' },
    { action: '撤销', key: 'Ctrl + Z' },
    { action: '重做', key: 'Ctrl + Y' },
    { action: '粗体', key: 'Ctrl + B' },
    { action: '斜体', key: 'Ctrl + I' },
    { action: '删除块', key: 'Delete' },
    { action: '新建段落', key: 'Enter' },
    { action: '新建块', key: 'Tab' },
  ]

  return (
    <div className="space-y-6">
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
              F
            </div>
            FlowEdit
          </CardTitle>
          <CardDescription>增强微信公众平台编辑器体验</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">版本</span>
            <span className="text-sm font-mono">1.0.0</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">更新日期</span>
            <span className="text-sm">2024-01-15</span>
          </div>
          
          <div className="pt-4 space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Github className="w-4 h-4 mr-2" />
              GitHub 仓库
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Heart className="w-4 h-4 mr-2" />
              问题反馈
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>功能特性</CardTitle>
          <CardDescription>FlowEdit为你提供的强大功能</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              现代化的Editor.js编辑体验
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              丰富的内容块类型支持
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              本地文章历史管理
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              智能侧边栏导航
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
              一键转换为微信格式
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            隐私安全
          </CardTitle>
          <CardDescription>数据隐私和安全保护</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-green-600" />
              <div>
                <h3 className="font-medium">本地存储</h3>
                <p className="text-sm text-muted-foreground">所有数据仅存储在你的设备上</p>
              </div>
            </div>
            <span className="text-green-600 text-sm font-medium">安全</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-green-600" />
              <div>
                <h3 className="font-medium">数据加密</h3>
                <p className="text-sm text-muted-foreground">敏感数据使用加密存储</p>
              </div>
            </div>
            <span className="text-green-600 text-sm font-medium">已启用</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="font-medium">权限最小化</h3>
                <p className="text-sm text-muted-foreground">仅请求必要的系统权限</p>
              </div>
            </div>
            <span className="text-blue-600 text-sm font-medium">遵循</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>权限说明</CardTitle>
          <CardDescription>扩展程序所需的权限及用途</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">存储权限</h3>
              <p className="text-sm text-muted-foreground">允许在本地存储文章数据和设置</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            快捷键参考
          </CardTitle>
          <CardDescription>编辑器中可用的快捷键列表</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <span className="text-sm">{shortcut.action}</span>
                <kbd className="px-2 py-1 text-xs bg-muted border border-border rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>开源许可</CardTitle>
          <CardDescription>FlowEdit 是一个开源项目</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>本项目采用 MIT 许可证开源，你可以自由使用、修改和分发。</p>
            <p>感谢所有贡献者的支持和参与！</p>
          </div>
          <div className="pt-4">
            <Button variant="outline" size="sm">
              查看许可证
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}