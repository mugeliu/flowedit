import React, { useState, useEffect } from 'react'
import { Button } from '../shared/components/ui/button'
import { Card, CardContent } from '../shared/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../shared/components/ui/select'
import { Settings, Palette } from 'lucide-react'
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
    } catch (error) {
      logger.error('模板切换失败:', error)
    }
  }

  const openOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  };

  return (
    <div className="p-3 w-64 bg-background">
      <Card className="border-0 shadow-none">
        <CardContent className="p-4 space-y-4">
          {/* 二维码区域 */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-40 h-40 rounded-lg overflow-hidden border">
              <img 
                src="/assets/qrcode.jpg" 
                alt="FlowEdit 二维码" 
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center leading-tight">
              关注插件最新功能
            </p>
          </div>

          {/* 样式模板切换 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">样式主题</span>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-10 text-sm text-muted-foreground">
                加载中...
              </div>
            ) : (
              <Select value={currentTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-full h-10">
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
            )}
            
            {!loading && localTemplates.length > 0 && (
              <p className="text-xs text-muted-foreground">
                当前: {localTemplates.find(t => t.id === currentTemplateId)?.name || '默认主题'}
              </p>
            )}
          </div>

          {/* 更多设置按钮 */}
          <Button 
            variant="outline" 
            className="w-full h-10" 
            onClick={openOptionsPage}
          >
            <Settings className="w-4 h-4 mr-2" />
            更多设置
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App