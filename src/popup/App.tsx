import React, { useState, useEffect } from 'react'
import { Button } from '../shared/components/ui/button'
import { Card, CardContent } from '../shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shared/components/ui/select'
import { Toaster } from '../shared/components/ui/sonner'
import { Settings, Palette, Bell, X } from 'lucide-react'
import { toast } from 'sonner'
import { TemplateManager } from '../shared/services/template-manager.js'
import { createLogger } from '../shared/services/logger.js'

const logger = createLogger('PopupApp')

interface Template {
  id: string
  name: string
  description: string
  category: string
  source: 'builtin' | 'remote'
}

function App() {
  const [currentTemplateId, setCurrentTemplateId] = useState('default')
  const [localTemplates, setLocalTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [showQRCode, setShowQRCode] = useState(false)

  const templateManager = new TemplateManager()

  useEffect(() => {
    loadTemplatesAndCurrent()
  }, [])

  const loadTemplatesAndCurrent = async () => {
    try {
      setLoading(true)
      
      // 加载所有可用模板，过滤出本地模板
      const allTemplates = await templateManager.getAvailableTemplates()
      const builtinTemplates = allTemplates.filter(t => t.source === 'builtin')
      setLocalTemplates(builtinTemplates)
      
      // 获取当前模板
      const current = await templateManager.getCurrentTemplate()
      setCurrentTemplateId(current.id)
      
      logger.info('加载模板成功', { 
        total: allTemplates.length, 
        builtin: builtinTemplates.length,
        current: current.id 
      })
    } catch (error) {
      logger.error('加载模板失败:', error)
      // 设置默认值
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

  const handleTemplateChange = async (newTemplateId: string) => {
    try {
      await templateManager.switchTemplate(newTemplateId)
      setCurrentTemplateId(newTemplateId)
      
      const template = localTemplates.find(t => t.id === newTemplateId)
      logger.info(`模板切换成功: ${template?.name || newTemplateId}`)
      toast.success(`模板已切换至: ${template?.name || newTemplateId}`)
    } catch (error) {
      logger.error('模板切换失败:', error)
      toast.error('模板切换失败')
    }
  }

  const openOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  };

  const handleShowQRCode = () => {
    setShowQRCode(true)
  }

  const handleCloseQRCode = () => {
    setShowQRCode(false)
  }

  return (
    <div className="p-4 w-72 bg-background">
      <Toaster />
      
      {showQRCode ? (
        // 二维码页面
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bell className="w-3 h-3 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">关注更新</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCloseQRCode}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-40 h-40 rounded-xl overflow-hidden border border-gray-200 shadow-md">
                <img 
                  src="/assets/qrcode.jpg" 
                  alt="FlowEdit 二维码" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-1">微信扫码关注</h4>
                <p className="text-sm text-gray-600">
                  获取插件最新功能和更新通知
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // 主页面
        <div className="space-y-6">
          {/* 样式主题选择 */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-gray-900">样式主题</span>
              </div>
            </div>
            
            <div className="p-4">
              {loading ? (
                <div className="flex items-center justify-center h-10 text-sm text-gray-500">
                  加载中...
                </div>
              ) : (
                <div className="space-y-3">
                  <Select value={currentTemplateId} onValueChange={handleTemplateChange}>
                    <SelectTrigger className="w-full h-10 border-gray-200 hover:border-gray-300">
                      <SelectValue placeholder="选择样式主题" />
                    </SelectTrigger>
                    <SelectContent>
                      {localTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {localTemplates.length > 0 && (
                    <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      当前: {localTemplates.find(t => t.id === currentTemplateId)?.name || '默认主题'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <Button 
              className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg" 
              onClick={openOptionsPage}
            >
              <Settings className="w-4 h-4 mr-2" />
              更多设置
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full h-10 hover:bg-gray-50" 
              onClick={handleShowQRCode}
            >
              <Bell className="w-4 h-4 mr-2" />
              关注更新
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App