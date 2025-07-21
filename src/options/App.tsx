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

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSettings />
      case 'editor-page':
        return <EditorPageSettings />
      case 'general':
        return <GeneralSettings />
      case 'editor':
        return <EditorSettings />
      case 'styles':
        return <StylesSettings />
      case 'history':
        return <HistorySettings />
      case 'about':
        return <AboutSettings />
      default:
        return <OverviewSettings />
    }
  }

  const getPageTitle = () => {
    switch (activeSection) {
      case 'overview':
        return 'FlowEdit 设置'
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
        return 'FlowEdit 设置'
    }
  }

  return (
    <SidebarProvider>
      <Toaster />
      <div className="flex h-screen w-full">
        <AppSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <SidebarInset className="flex-1">
          {activeSection !== 'editor-page' && (
            <header className="flex h-16 shrink-0 items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="ml-2">
                <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
              </div>
            </header>
          )}
          <main className={`flex-1 overflow-auto ${activeSection === 'editor-page' ? 'p-4' : 'p-6'}`}>
            {renderContent()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default App