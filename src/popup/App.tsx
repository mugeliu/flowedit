import React, { useState } from 'react'
import { Toaster } from '../shared/components/ui/sonner'
import { Palette, FileText, User } from 'lucide-react'
import { StyleTab } from './components/style-tab'
import { ArticleTab } from './components/article-tab'
import { ProfileTab } from './components/profile-tab'

type TabType = 'style' | 'article' | 'profile'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('style')

  const tabs = [
    {
      id: 'style' as TabType,
      name: '样式',
      icon: Palette
    },
    {
      id: 'article' as TabType,
      name: '文章',
      icon: FileText
    },
    {
      id: 'profile' as TabType,
      name: '我的',
      icon: User
    }
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'style':
        return <StyleTab />
      case 'article':
        return <ArticleTab />
      case 'profile':
        return <ProfileTab />
      default:
        return <StyleTab />
    }
  }

  return (
    <div className="w-80 h-[480px] bg-gray-50 flex flex-col overflow-hidden">
      <Toaster />
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
      
      {/* TabBar */}
      <div className="flex bg-white border-t border-gray-100 shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 relative ${
                isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {/* 活跃指示器 */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
              )}
              
              <Icon className={`w-4 h-4 mb-1 transition-all duration-200 ${
                isActive ? 'scale-110' : 'scale-100'
              }`} />
              
              <span className={`text-xs transition-all duration-200 ${
                isActive ? 'font-semibold' : 'font-normal'
              }`}>
                {tab.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default App