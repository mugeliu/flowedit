import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'

export function ShortcutsSettings() {
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
      <div>
        <h2 className="text-2xl font-bold">快捷键</h2>
        <p className="text-muted-foreground">查看和管理编辑器快捷键</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>键盘快捷键</CardTitle>
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
    </div>
  )
}