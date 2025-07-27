import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'
import { Badge } from '../../shared/components/ui/badge'
import { ExternalLink, Github, Heart, Shield, Info, Star, Users, Download, Copy, Check } from 'lucide-react'

export function AboutSettings() {
  const [copied, setCopied] = useState(false)

  // 获取版本信息
  const version = chrome.runtime.getManifest().version
  const lastUpdate = new Date().toLocaleDateString('zh-CN')

  const handleCopyInfo = async () => {
    const systemInfo = `FlowEdit v${version}
浏览器: ${navigator.userAgent}
平台: ${navigator.platform}
语言: ${navigator.language}`
    
    try {
      await navigator.clipboard.writeText(systemInfo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  const openLink = (url: string) => {
    chrome.tabs.create({ url })
  }

  return (
    <div className="space-y-6">
      {/* 产品信息 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                F
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">FlowEdit</h2>
                <p className="text-gray-600">微信公众平台编辑器增强</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1.5 rounded-full border border-blue-200">
              <span className="text-sm font-medium text-blue-700">v{version}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-sm font-semibold text-gray-900">增强体验</div>
              <div className="text-xs text-gray-600">现代化编辑</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-sm font-semibold text-gray-900">隐私安全</div>
              <div className="text-xs text-gray-600">本地存储</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-gray-50" 
              size="sm"
              disabled
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub 源码
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start hover:bg-gray-50" 
              size="sm"
              disabled
            >
              <Heart className="w-4 h-4 mr-2" />
              问题反馈
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>
          </div>
        </div>
      </div>

      {/* 核心功能 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">核心功能</h2>
          <p className="text-gray-600 mt-1">已实现的功能特性</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Info className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">EditorJS 编辑器</div>
                <div className="text-sm text-gray-600">基于 EditorJS 的富文本编辑</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">本地存储</div>
                <div className="text-sm text-gray-600">文章本地保存和管理</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">样式模板</div>
                <div className="text-sm text-gray-600">预设样式模板系统</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">内容转换</div>
                <div className="text-sm text-gray-600">转换为微信公众号格式</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 系统信息 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">系统信息</h2>
              <p className="text-gray-600 mt-1">版本和环境信息</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyInfo}
              disabled={copied}
              className="hover:bg-gray-50"
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制信息'}
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">扩展版本</span>
              <span className="text-sm font-mono text-gray-900">{version}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">更新时间</span>
              <span className="text-sm text-gray-900">{lastUpdate}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">浏览器</span>
              <span className="text-sm text-gray-900">Chrome {navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">平台</span>
              <span className="text-sm text-gray-900">{navigator.platform}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}