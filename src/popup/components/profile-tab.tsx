import React, { useState } from 'react'
import { Button } from '../../shared/components/ui/button'
import { 
  User, 
  Bell, 
  ArrowLeft
} from 'lucide-react'

export function ProfileTab() {
  const [showQRCode, setShowQRCode] = useState(false)

  const handleShowQRCode = () => {
    setShowQRCode(true)
  }

  const handleCloseQRCode = () => {
    setShowQRCode(false)
  }

  if (showQRCode) {
    return (
      <div className="h-full bg-white">
        {/* QR码页面头部 */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCloseQRCode}
              className="flex items-center gap-2 text-orange-100 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </button>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="font-semibold">关注更新</span>
            </div>
          </div>
        </div>

        {/* QR码内容 */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg mb-6">
            <img 
              src="/assets/qrcode.jpg" 
              alt="FlowEdit 二维码" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">微信扫码关注</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              获取插件最新功能和更新通知<br/>
              第一时间了解新特性发布
            </p>
          </div>

          <div className="w-full bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">关注后可获得</div>
                <div className="text-gray-600">新功能发布、使用技巧、问题解答</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white flex flex-col overflow-hidden">
      {/* 固定头部区域 */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <h2 className="font-semibold">我的</h2>
        </div>
      </div>

      {/* 滚动内容区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* 设置分组 - 置空状态 */}
        <div>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">设置功能开发中</h3>
            <p className="text-sm text-gray-500">更多个性化设置即将推出</p>
          </div>
        </div>

        {/* 关注更新 */}
        <div>
          <button
            onClick={handleShowQRCode}
            className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100 hover:shadow-sm hover:border-orange-200 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Bell className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-900 text-sm">
                  关注更新
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  获取最新功能通知
                </div>
              </div>
            </div>
            <div className="text-orange-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* 美化版本信息 */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
          <div className="text-center space-y-2">
            {/* Logo 区域 */}
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            
            {/* 产品信息 */}
            <div className="space-y-1">
              <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                FlowEdit
              </h3>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/70 rounded-full border border-indigo-200">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-gray-700">版本 1.0.0</span>
              </div>
            </div>
            
            {/* 描述 */}
            <p className="text-xs text-gray-600 leading-relaxed">
              微信公众号编辑器增强插件<br/>
              让内容创作更加高效便捷
            </p>
            
            {/* 装饰元素 */}
            <div className="flex justify-center space-x-1 mt-2">
              <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full opacity-60"></div>
              <div className="w-1.5 h-1.5 bg-purple-300 rounded-full opacity-80"></div>
              <div className="w-1.5 h-1.5 bg-pink-300 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}