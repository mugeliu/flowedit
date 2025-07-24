import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'
import { Palette, Eye, Download, Upload, Plus, Trash2, Check, Loader2, Globe, HardDrive, Sparkles } from 'lucide-react'
import { TemplateManager } from '../../shared/services/template-manager.js'
import { createLogger } from '../../shared/services/logger.js'

const logger = createLogger('StylesSettings')

interface Template {
  id: string
  name: string
  description: string
  category: string
  source: 'builtin' | 'remote'
  version: string
  author?: string
}

export function StylesSettings() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [currentTemplateId, setCurrentTemplateId] = useState('default')
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)

  const templateManager = new TemplateManager()

  // 加载模板列表和当前模板
  useEffect(() => {
    loadTemplates()
    loadCurrentTemplate()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      const availableTemplates = await templateManager.getAvailableTemplates()
      setTemplates(availableTemplates)
      logger.info('加载模板列表成功', { count: availableTemplates.length })
    } catch (error) {
      logger.error('加载模板列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentTemplate = async () => {
    try {
      const current = await templateManager.getCurrentTemplate()
      setCurrentTemplateId(current.id)
    } catch (error) {
      logger.error('获取当前模板失败:', error)
    }
  }

  const handleTemplateSwitch = async (templateId: string) => {
    try {
      setSwitching(templateId)
      await templateManager.switchTemplate(templateId)
      setCurrentTemplateId(templateId)
      
      // 显示成功提示
      const template = templates.find(t => t.id === templateId)
      logger.info(`模板切换成功: ${template?.name || templateId}`)
    } catch (error) {
      logger.error('模板切换失败:', error)
    } finally {
      setSwitching(null)
    }
  }

  const getPreviewColors = (template: Template) => {
    // 根据模板ID返回对应的预览颜色
    switch (template.id) {
      case 'default':
        return 'from-emerald-50 to-emerald-100 text-emerald-700'
      case 'business-minimal':
        return 'from-gray-50 to-gray-100 text-gray-700'
      case 'warm-orange':
        return 'from-orange-50 to-orange-100 text-orange-700'
      case 'literary-green':
        return 'from-green-50 to-green-100 text-green-700'
      case 'abstract-illustration':
        return 'from-purple-50 to-purple-100 text-purple-700'
      case 'diffused-gradient':
        return 'from-blue-50 to-blue-100 text-blue-700'
      case 'ultra-bold-typography':
        return 'from-red-50 to-red-100 text-red-700'
      case 'handcraft-texture':
        return 'from-amber-50 to-amber-100 text-amber-700'
      default:
        return 'from-slate-50 to-slate-100 text-slate-700'
    }
  }

  const renderTemplateCard = (template: Template) => {
    const isActive = template.id === currentTemplateId
    const isSwitching = switching === template.id
    const previewColors = getPreviewColors(template)
    
    return (
      <div 
        key={template.id} 
        className={`border rounded-lg p-4 transition-all ${
          isActive 
            ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
            : 'hover:border-primary/50'
        }`}
      >
        {/* 预览区域 */}
        <div className={`w-full h-24 rounded-md bg-gradient-to-br ${previewColors} border mb-3 flex flex-col items-center justify-center relative overflow-hidden`}>
          <div className="text-xs font-medium mb-1">{template.name}</div>
          <div className="flex space-x-1">
            <div className="w-8 h-1 bg-current opacity-60 rounded"></div>
            <div className="w-4 h-1 bg-current opacity-40 rounded"></div>
            <div className="w-6 h-1 bg-current opacity-50 rounded"></div>
          </div>
          {template.source === 'remote' && (
            <div className="absolute top-2 right-2">
              <Globe className="w-3 h-3 opacity-60" />
            </div>
          )}
        </div>
        
        {/* 模板信息 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">{template.name}</h3>
            {isActive && (
              <div className="flex items-center gap-1 text-primary text-xs">
                <Check className="w-3 h-3" />
                使用中
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
          
          {/* 标签信息 */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                template.source === 'builtin' 
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {template.source === 'builtin' ? (
                  <HardDrive className="w-3 h-3" />
                ) : (
                  <Globe className="w-3 h-3" />
                )}
                {template.source === 'builtin' ? '内置' : '在线'}
              </span>
              <span className="text-muted-foreground">{template.category}</span>
            </div>
            <span className="text-muted-foreground">v{template.version}</span>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Eye className="w-3 h-3 mr-1" />
              预览
            </Button>
            {!isActive && (
              <Button 
                size="sm" 
                onClick={() => handleTemplateSwitch(template.id)}
                disabled={isSwitching}
                className="flex-1"
              >
                {isSwitching ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  "使用"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const builtinTemplates = templates.filter(t => t.source === 'builtin')
  const remoteTemplates = templates.filter(t => t.source === 'remote')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">加载模板中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* 当前使用的模板 */}
      {currentTemplateId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              当前主题
            </CardTitle>
            <CardDescription>正在使用的样式模板</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const currentTemplate = templates.find(t => t.id === currentTemplateId)
              return currentTemplate ? (
                <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getPreviewColors(currentTemplate)} flex items-center justify-center`}>
                    <Palette className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{currentTemplate.name}</h3>
                    <p className="text-sm text-muted-foreground">{currentTemplate.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        currentTemplate.source === 'builtin' 
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {currentTemplate.source === 'builtin' ? '内置' : '在线'}
                      </span>
                      <span className="text-xs text-muted-foreground">{currentTemplate.category}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  未找到当前模板信息
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* 内置模板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            内置模板
            <span className="text-sm font-normal text-muted-foreground">({builtinTemplates.length})</span>
          </CardTitle>
          <CardDescription>系统提供的预设样式模板，无需网络连接</CardDescription>
        </CardHeader>
        <CardContent>
          {builtinTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {builtinTemplates.map(renderTemplateCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              暂无内置模板
            </div>
          )}
        </CardContent>
      </Card>

      {/* 在线模板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            在线模板
            <span className="text-sm font-normal text-muted-foreground">({remoteTemplates.length})</span>
          </CardTitle>
          <CardDescription>来自云端的更多样式选择，需要网络连接</CardDescription>
        </CardHeader>
        <CardContent>
          {remoteTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {remoteTemplates.map(renderTemplateCard)}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无在线模板</p>
              <p className="text-sm">未来将提供更多云端模板</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 自定义样式 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            自定义样式
          </CardTitle>
          <CardDescription>创建和管理你的个人样式模板</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">暂无自定义样式</p>
                <p className="text-xs text-muted-foreground">你可以基于现有模板创建自己的样式</p>
              </div>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                新建样式
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 样式管理 */}
      <Card>
        <CardHeader>
          <CardTitle>样式管理</CardTitle>
          <CardDescription>导入导出和分享你的样式模板</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">导出样式包</h3>
                <p className="text-sm text-muted-foreground">将所有自定义样式导出为文件</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">导入样式包</h3>
                <p className="text-sm text-muted-foreground">从文件导入样式模板</p>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                导入
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div>
              <h3 className="font-medium">重置为默认</h3>
              <p className="text-sm text-muted-foreground">清空所有自定义样式，恢复默认设置</p>
            </div>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}