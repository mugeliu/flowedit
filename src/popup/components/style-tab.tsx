import React, { useState, useEffect } from 'react'
import { Button } from '../../shared/components/ui/button'
import { Palette, Eye, Crown, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { TemplateManager } from '../../shared/services/template-manager.js'
import { createLogger } from '../../shared/services/logger.js'
import { StylePreview } from './style-preview'

const logger = createLogger('StyleTab')

interface Template {
  id: string
  name: string
  description: string
  category: string
  source: 'builtin' | 'remote'
}

// 为不同主题定义颜色方案
const getThemeColors = (templateId: string, isSelected: boolean) => {
  const colorSchemes = {
    'default': {
      gradient: 'from-green-400 to-emerald-500',
      bg: isSelected ? 'bg-green-50' : 'bg-white',
      border: isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-gray-200',
      text: 'text-green-700'
    },
    'business-minimal': {
      gradient: 'from-blue-400 to-indigo-500',
      bg: isSelected ? 'bg-blue-50' : 'bg-white',
      border: isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200',
      text: 'text-blue-700'
    },
    'literary-green': {
      gradient: 'from-teal-400 to-cyan-500',
      bg: isSelected ? 'bg-teal-50' : 'bg-white',
      border: isSelected ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200',
      text: 'text-teal-700'
    },
    'warm-orange': {
      gradient: 'from-orange-400 to-red-500',
      bg: isSelected ? 'bg-orange-50' : 'bg-white',
      border: isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200',
      text: 'text-orange-700'
    },
    'ultra-bold-typography': {
      gradient: 'from-purple-400 to-pink-500',
      bg: isSelected ? 'bg-purple-50' : 'bg-white',
      border: isSelected ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200',
      text: 'text-purple-700'
    },
    'abstract-illustration': {
      gradient: 'from-pink-400 to-rose-500',
      bg: isSelected ? 'bg-pink-50' : 'bg-white',
      border: isSelected ? 'border-pink-500 ring-2 ring-pink-200' : 'border-gray-200',
      text: 'text-pink-700'
    },
    'handcraft-texture': {
      gradient: 'from-amber-400 to-yellow-500',
      bg: isSelected ? 'bg-amber-50' : 'bg-white',
      border: isSelected ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200',
      text: 'text-amber-700'
    },
    'diffused-gradient': {
      gradient: 'from-violet-400 to-indigo-500',
      bg: isSelected ? 'bg-violet-50' : 'bg-white',
      border: isSelected ? 'border-violet-500 ring-2 ring-violet-200' : 'border-gray-200',
      text: 'text-violet-700'
    }
  }
  
  return colorSchemes[templateId] || colorSchemes['default']
}

export function StyleTab() {
  const [currentTemplateId, setCurrentTemplateId] = useState('default')
  const [localTemplates, setLocalTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null)
  const [confirmTemplate, setConfirmTemplate] = useState<Template | null>(null)

  const templateManager = new TemplateManager()

  useEffect(() => {
    loadTemplatesAndCurrent()
  }, [])

  const loadTemplatesAndCurrent = async () => {
    try {
      setLoading(true)
      
      const allTemplates = await templateManager.getAvailableTemplates()
      const builtinTemplates = allTemplates.filter(t => t.source === 'builtin')
      setLocalTemplates(builtinTemplates)
      
      const current = await templateManager.getCurrentTemplate()
      setCurrentTemplateId(current.id)
      
      logger.info('加载模板成功', { 
        total: allTemplates.length, 
        builtin: builtinTemplates.length,
        current: current.id 
      })
    } catch (error) {
      logger.error('加载模板失败:', error)
      setLocalTemplates([{
        id: 'default',
        name: '绿色渐变主题',
        description: '默认主题',
        category: '现代风格',
        source: 'builtin'
      }])
      setCurrentTemplateId('default')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateClick = (templateId: string) => {
    // 如果点击的是当前模板，不做任何操作
    if (templateId === currentTemplateId) {
      return
    }
    
    // 显示确认对话框
    const template = localTemplates.find(t => t.id === templateId)
    if (template) {
      setConfirmTemplate(template)
    }
  }

  const handleConfirmTemplateChange = async () => {
    if (!confirmTemplate) return
    
    try {
      await templateManager.switchTemplate(confirmTemplate.id)
      setCurrentTemplateId(confirmTemplate.id)
      
      logger.info(`模板切换成功: ${confirmTemplate.name}`)
      toast.success(`模板已切换至: ${confirmTemplate.name}`)
      setConfirmTemplate(null)
    } catch (error) {
      logger.error('模板切换失败:', error)
      toast.error('模板切换失败')
    }
  }

  const handleCancelTemplateChange = () => {
    setConfirmTemplate(null)
  }

  const handlePreview = (templateId: string) => {
    setPreviewTemplateId(templateId)
    logger.info('开始预览模板:', { templateId })
  }

  const handleBackFromPreview = () => {
    setPreviewTemplateId(null)
    // 重新加载模板状态以同步选择
    loadTemplatesAndCurrent()
    logger.info('返回模板选择')
  }

  const handleApplyFromPreview = (templateId: string) => {
    const template = localTemplates.find(t => t.id === templateId)
    if (template && templateId !== currentTemplateId) {
      setConfirmTemplate(template)
    }
  }

  // 如果正在预览，显示预览组件
  if (previewTemplateId) {
    return (
      <StylePreview 
        templateId={previewTemplateId} 
        onBack={handleBackFromPreview}
        onApplyTemplate={handleApplyFromPreview}
      />
    )
  }

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* 确认对话框 */}
      {confirmTemplate && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 m-4 max-w-xs w-full shadow-xl">
            <div className="text-center mb-3">
              <h3 className="text-base font-semibold text-gray-900 mb-1">切换样式主题</h3>
              <p className="text-xs text-gray-600">
                确定要切换到 <span className="font-medium text-blue-600">{confirmTemplate.name}</span> 主题吗？
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelTemplateChange}
                className="flex-1 h-8 text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                取消
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmTemplateChange}
                className="flex-1 h-8 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <Check className="w-3 h-3 mr-1" />
                确定
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 固定头部区域 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <h2 className="font-semibold">样式主题</h2>
        </div>
      </div>

      {/* 滚动内容区域 */}
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-gray-500">加载主题中...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {localTemplates.map((template) => {
              const isSelected = currentTemplateId === template.id
              const colors = getThemeColors(template.id, isSelected)
              
              return (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template.id)}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${colors.bg} ${colors.border} hover:shadow-sm`}
                >
                  {/* 选中状态指示器 - 只在右上角显示"当前"标签 */}
                  {isSelected && (
                    <div className="absolute -top-1 -right-1">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <Crown className="w-3 h-3" />
                        <span>当前</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* 主题色块 */}
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-sm`}>
                        <Palette className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{template.name}</h3>
                        <p className="text-xs text-gray-500">{template.category}</p>
                      </div>
                    </div>
                    
                    {/* 预览按钮 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePreview(template.id)
                      }}
                      className="h-7 px-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2 leading-tight">
                    {template.description}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}