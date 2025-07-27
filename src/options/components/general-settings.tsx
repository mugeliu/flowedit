import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/components/ui/card'
import { Button } from '../../shared/components/ui/button'

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">扩展状态</h2>
          <p className="text-gray-600 mt-1">控制扩展的启用状态</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">启用FlowEdit</h3>
                <p className="text-sm text-gray-600">在微信公众平台编辑器中启用FlowEdit功能</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-300">
              已启用
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">•</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">自动启动</h3>
                <p className="text-sm text-gray-600">页面加载时自动启动编辑器</p>
              </div>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-300">
              开启
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}