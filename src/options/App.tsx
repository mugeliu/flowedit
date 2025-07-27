import React, { useState } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '../shared/components/ui/sidebar'
import { Toaster } from '../shared/components/ui/sonner'
import { AppSidebar } from './components/app-sidebar'
import { OverviewSettings } from './components/overview-settings'
import { EditorPageSettings } from './components/editor-page-settings'
import { GeneralSettings } from './components/general-settings'
import { EditorSettings } from './components/editor-settings'
import { StylesSettings } from './components/styles-settings'
import { HistorySettings } from './components/history-settings'
import { AboutSettings } from './components/about-settings'

function App() {
  const [activeSection, setActiveSection] = useState('overview')
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)

  const handleEditArticle = (articleId: string) => {
    setEditingArticleId(articleId)
    setActiveSection('editor-page')
  }

  const handleSectionChange = (section: string) => {
    // 如果不是跳转到编辑器，清除编辑文章ID
    if (section !== 'editor-page') {
      setEditingArticleId(null)
    }
    setActiveSection(section)
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSettings onSectionChange={handleSectionChange} onEditArticle={handleEditArticle} />
      case 'editor-page':
        return <EditorPageSettings articleId={editingArticleId} />
      case 'general':
        return <GeneralSettings />
      case 'editor':
        return <EditorSettings />
      case 'styles':
        return <StylesSettings />
      case 'history':
        return <HistorySettings onEditArticle={handleEditArticle} onSectionChange={handleSectionChange} />
      case 'about':
        return <AboutSettings />
      default:
        return <OverviewSettings onSectionChange={handleSectionChange} onEditArticle={handleEditArticle} />
    }
  }

  const getPageTitle = () => {
    switch (activeSection) {
      case 'overview':
        return 'FlowEdit 控制台'
      case 'editor-page':
        return '编辑器'
      case 'general':
        return '基本设置'
      case 'editor':
        return '编辑器设置'
      case 'styles':
        return '我的样式'
      case 'history':
        return '历史文章'
      case 'about':
        return '关于'
      default:
        return 'FlowEdit 控制台'
    }
  }

  return (
    <SidebarProvider>
      <Toaster />
      <div className="flex h-screen w-full">
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange} 
        />
        <SidebarInset className="flex-1">
          {activeSection !== 'editor-page' && activeSection !== 'overview' && (
            <header className="flex h-16 shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-2">
                <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
              </div>
            </header>
          )}
          <main className={`flex-1 overflow-auto ${
            activeSection === 'editor-page' ? 'p-4' : 
            activeSection === 'overview' ? 'p-6' : 'p-6'
          }`}>
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default App