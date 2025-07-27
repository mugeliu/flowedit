import React from 'react'
import { PenTool, Save, Lightbulb, Move, Type, List, Quote, Code, Image, Minus } from 'lucide-react'

export function EditorSettings() {
  return (
    <div className="space-y-6">
      {/* 编辑体验 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">编辑体验</h2>
          <p className="text-gray-600 mt-1">配置编辑器的交互体验</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Save className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">自动保存</h3>
                <p className="text-sm text-gray-600">自动保存你的文章草稿</p>
              </div>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-300">
              开启
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">智能提示</h3>
                <p className="text-sm text-gray-600">显示编辑建议和提示</p>
              </div>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium border border-green-300">
              开启
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Move className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">拖拽排序</h3>
                <p className="text-sm text-gray-600">支持通过拖拽调整内容块顺序</p>
              </div>
            </div>
            <div className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium border border-purple-300">
              开启
            </div>
          </div>
        </div>
      </div>

      {/* 工具栏配置 */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">工具栏配置</h2>
          <p className="text-gray-600 mt-1">选择编辑器中显示的工具</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">标题工具</span>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">开启</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <List className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">列表工具</span>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">开启</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <Quote className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">引用工具</span>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">开启</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">代码工具</span>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">开启</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <Image className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">图片工具</span>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">开启</div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-gray-200 transition-all">
              <div className="flex items-center gap-3">
                <Minus className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">分割线</span>
              </div>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">开启</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}