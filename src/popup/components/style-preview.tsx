import React, { useState, useEffect } from 'react'
import { Button } from '../../shared/components/ui/button'
import { ArrowLeft, Palette, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { TemplateManager } from '../../shared/services/template-manager.js'
import { createLogger } from '../../shared/services/logger.js'

const logger = createLogger('StylePreview')

interface Template {
  id: string
  name: string
  description: string
  category: string
  source: 'builtin' | 'remote'
}

interface StylePreviewProps {
  templateId: string
  onBack: () => void
  onApplyTemplate?: (templateId: string) => void
}

export function StylePreview({ templateId, onBack, onApplyTemplate }: StylePreviewProps) {
  const [template, setTemplate] = useState<Template | null>(null)
  const [previewContent, setPreviewContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const templateManager = new TemplateManager()

  useEffect(() => {
    loadTemplateAndPreview()
  }, [templateId])

  const loadTemplateAndPreview = async () => {
    try {
      setLoading(true)
      setError(null)

      // 加载模板信息
      const allTemplates = await templateManager.getAvailableTemplates()
      const targetTemplate = allTemplates.find(t => t.id === templateId)
      
      if (!targetTemplate) {
        throw new Error(`模板 ${templateId} 未找到`)
      }
      
      setTemplate(targetTemplate)

      // 加载测试数据
      const response = await fetch('/assets/test-data.json')
      if (!response.ok) {
        throw new Error('无法加载测试数据')
      }
      const testData = await response.json()

      // 使用解析器生成预览HTML
      const { convertToHtml } = await import('../../shared/services/parsers/index.js')
      
      // 应用指定模板并生成HTML
      const html = await convertToHtml(testData, templateId)
      setPreviewContent(html)

      logger.info('预览内容加载成功', { 
        templateId, 
        templateName: targetTemplate.name,
        blocksCount: testData.blocks?.length || 0
      })

    } catch (error) {
      logger.error('加载预览失败:', error)
      setError(error instanceof Error ? error.message : '加载预览失败')
      toast.error('加载预览失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full bg-white flex flex-col">
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 px-2 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Palette className="w-4 h-4" />
            <h2 className="font-semibold">样式预览</h2>
          </div>
        </div>

        {/* 加载状态 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <p className="text-sm text-gray-500">正在生成预览...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-white flex flex-col">
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-red-500 to-orange-600 text-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 px-2 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Palette className="w-4 h-4" />
            <h2 className="font-semibold">预览失败</h2>
          </div>
        </div>

        {/* 错误状态 */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">预览加载失败</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <Button
              onClick={loadTemplateAndPreview}
              className="bg-red-600 hover:bg-red-700"
            >
              重试
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* 头部 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="h-7 px-2 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Palette className="w-4 h-4" />
            <h2 className="font-semibold">样式预览</h2>
          </div>
          {/* 应用按钮移至右上角 */}
          <Button
            size="sm"
            onClick={async () => {
              try {
                if (onApplyTemplate) {
                  // 使用父组件的应用逻辑
                  onApplyTemplate(templateId)
                } else {
                  // 备用逻辑：直接应用模板
                  const templateManager = new TemplateManager()
                  await templateManager.switchTemplate(templateId)
                  toast.success(`已应用 ${template?.name} 模板`)
                }
                onBack()
              } catch (error) {
                logger.error('应用模板失败:', error)
                toast.error('应用模板失败')
              }
            }}
            className="h-7 px-3 bg-white/20 hover:bg-white/30 text-white border border-white/30"
          >
            应用
          </Button>
        </div>
      </div>

      {/* 预览内容 */}
<div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-xs mx-auto bg-white shadow-sm">
          {/* 预览容器 */}
          <div 
            className="preview-content p-3"
            dangerouslySetInnerHTML={{ __html: previewContent }}
            style={{
              fontSize: '12px',
              lineHeight: '1.5',
              color: '#333'
            }}
          />
        </div>
      </div>
    </div>
  )
}