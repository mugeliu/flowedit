import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'
import { Badge } from '../../shared/components/ui/badge'
import { Palette, Eye, Upload, Check, Loader2, Sparkles, Download, Wand2, Settings, Star, Heart, TrendingUp } from 'lucide-react'
import { TemplateManager } from '../../shared/services/template-manager.js'
import { createLogger } from '../../shared/services/logger.js'
import { PreviewDialog } from '../../shared/components/preview-dialog'
import testData from '../../../assets/test-data.json'

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
  
  // 预览对话框状态
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

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
      // 只保留内置模板
      const builtinTemplates = availableTemplates.filter(t => t.source === 'builtin')
      setTemplates(builtinTemplates)
      logger.info('加载模板列表成功', { count: builtinTemplates.length })
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

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template)
    setPreviewOpen(true)
  }

  const handleImportTemplate = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.flowedit'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        try {
          const text = await file.text()
          const templateData = JSON.parse(text)
          
          // 生成唯一的模板ID
          const templateId = `imported_${Date.now()}`
          
          // 使用TemplateManager的缓存功能保存导入的模板
          await templateManager.cacheTemplate(templateId, {
            ...templateData,
            id: templateId,
            source: 'imported',
            importedAt: Date.now()
          })
          
          logger.info('模板导入并缓存成功:', templateId)
          
          // 重新加载模板列表以显示导入的模板
          await loadTemplates()
        } catch (error) {
          logger.error('模板导入失败:', error)
        }
      }
    }
    input.click()
  }

  const loadTestData = async () => {
    return testData
  }

  const getTemplateIcon = (template: Template) => {
    switch (template.id) {
      case 'default':
        return <Sparkles className="w-6 h-6" />
      case 'business-minimal':
        return <Settings className="w-6 h-6" />
      case 'warm-orange':
        return <Heart className="w-6 h-6" />
      case 'literary-green':
        return <Star className="w-6 h-6" />
      case 'abstract-illustration':
        return <Wand2 className="w-6 h-6" />
      case 'diffused-gradient':
        return <TrendingUp className="w-6 h-6" />
      default:
        return <Palette className="w-6 h-6" />
    }
  }

  const getTemplateGradient = (template: Template) => {
    const gradients = {
      'default': 'from-emerald-400 via-teal-500 to-blue-500',
      'business-minimal': 'from-slate-400 via-gray-500 to-zinc-600',
      'warm-orange': 'from-orange-400 via-red-500 to-pink-500',
      'literary-green': 'from-green-400 via-emerald-500 to-teal-600',
      'abstract-illustration': 'from-purple-400 via-violet-500 to-indigo-600',
      'diffused-gradient': 'from-blue-400 via-cyan-500 to-teal-500',
      'ultra-bold-typography': 'from-red-400 via-rose-500 to-pink-600',
      'handcraft-texture': 'from-amber-400 via-orange-500 to-yellow-500'
    }
    return gradients[template.id] || 'from-slate-400 via-gray-500 to-zinc-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">加载样式模板</h3>
            <p className="text-sm text-gray-500">正在获取可用的样式模板...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentTemplate = templates.find(t => t.id === currentTemplateId)

  return (
    <div className="space-y-6">
      {/* 当前使用模板 */}
      {currentTemplate && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">当前样式</h2>
            </div>
            
            <div className="relative">
              <div className={`h-32 rounded-xl bg-gradient-to-br ${getTemplateGradient(currentTemplate)} p-6 flex items-center justify-between text-white overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    {getTemplateIcon(currentTemplate)}
                    <h3 className="text-lg font-semibold">{currentTemplate.name}</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      v{currentTemplate.version}
                    </Badge>
                  </div>
                  <p className="text-white/90 text-sm max-w-md">{currentTemplate.description}</p>
                </div>
                <div className="relative z-10 flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePreviewTemplate(currentTemplate)}
                    className="bg-white/20 hover:bg-white/30 text-white border-0"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    预览
                  </Button>
                </div>
                
                {/* 装饰元素 */}
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10 blur-xl"></div>
                <div className="absolute bottom-4 right-16 w-16 h-16 rounded-full bg-white/5 blur-lg"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 模板网格 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">模板库</h2>
              <p className="text-gray-600 mt-1">选择您喜欢的样式模板</p>
            </div>
            <Button
              onClick={handleImportTemplate}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
            >
              <Upload className="w-4 h-4 mr-2" />
              导入模板
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const isActive = template.id === currentTemplateId
              const isSwitching = switching === template.id
              
              return (
                <div key={template.id} className={`group relative bg-white rounded-xl border-2 transition-all duration-300 overflow-hidden ${
                  isActive 
                    ? 'border-blue-500 shadow-lg shadow-blue-500/25' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1'
                }`}>
                  {/* 模板预览色块 */}
                  <div className={`h-24 bg-gradient-to-br ${getTemplateGradient(template)} relative overflow-hidden rounded-t-xl`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    
                    {/* 顶部状态指示器 */}
                    {isActive && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    
                    {/* 模板标题在底部 */}
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="font-bold text-white text-sm truncate drop-shadow-lg">{template.name}</h3>
                    </div>
                    
                    {/* 图标居中 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white/80 drop-shadow-lg">
                        {getTemplateIcon(template)}
                      </div>
                    </div>
                  </div>
                  
                  {/* 模板信息 */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{template.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                        {template.category}
                      </span>
                      <Badge variant="outline" className="text-xs px-2 py-1">
                        v{template.version}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template)}
                        className="flex-1 text-xs h-8 hover:bg-gray-50"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        预览
                      </Button>
                      
                      {!isActive && (
                        <Button
                          size="sm"
                          onClick={() => handleTemplateSwitch(template.id)}
                          disabled={isSwitching}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 text-xs h-8 shadow-md hover:shadow-lg transition-all"
                        >
                          {isSwitching ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            "使用"
                          )}
                        </Button>
                      )}
                      
                      {isActive && (
                        <div className="flex-1 flex items-center justify-center gap-1 text-blue-600 text-xs font-medium bg-blue-50 rounded-md py-2 border border-blue-200">
                          <Check className="w-3 h-3" />
                          使用中
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* 样式预览对话框 */}
      {previewTemplate && (
        <PreviewDialog
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          title={`${previewTemplate.name} 样式预览`}
          subtitle={previewTemplate.description}
          loadData={loadTestData}
          templateId={previewTemplate.id}
          metadata={{
            模板分类: previewTemplate.category,
            版本: previewTemplate.version,
            来源: '内置模板'
          }}
        />
      )}
    </div>
  )
}