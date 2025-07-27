import { 
  PenTool, 
  Settings, 
  Palette, 
  History, 
  Info,
  Home,
  Edit3
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter
} from "../../shared/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"

interface AppSidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

export function AppSidebar({ activeSection, onSectionChange }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSectionChange?.('overview')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
            F
          </div>
          <div>
            <p className="text-sm font-semibold">FlowEdit</p>
            <p className="text-xs text-muted-foreground">微信编辑器增强</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 首页 */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={activeSection === 'overview'}
                >
                  <button
                    onClick={() => onSectionChange?.('overview')}
                    className="w-full"
                  >
                    <Home />
                    <span>首页</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 编辑器 */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={activeSection === 'editor-page'}
                >
                  <button
                    onClick={() => onSectionChange?.('editor-page')}
                    className="w-full"
                  >
                    <PenTool />
                    <span>编辑器</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 历史文章 */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={activeSection === 'history'}
                >
                  <button
                    onClick={() => onSectionChange?.('history')}
                    className="w-full"
                  >
                    <History />
                    <span>历史文章</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 我的样式 */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={activeSection === 'styles'}
                >
                  <button
                    onClick={() => onSectionChange?.('styles')}
                    className="w-full"
                  >
                    <Palette />
                    <span>我的样式</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 基本设置 - 可折叠分组 */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full">
                      <Settings />
                      <span>设置</span>
                      <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          asChild
                          isActive={activeSection === 'general'}
                        >
                          <button
                            onClick={() => onSectionChange?.('general')}
                            className="w-full"
                          >
                            <Settings className="w-4 h-4" />
                            <span>基本设置</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton 
                          asChild
                          isActive={activeSection === 'editor'}
                        >
                          <button
                            onClick={() => onSectionChange?.('editor')}
                            className="w-full"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span>编辑器设置</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* 关于 */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  isActive={activeSection === 'about'}
                >
                  <button
                    onClick={() => onSectionChange?.('about')}
                    className="w-full"
                  >
                    <Info />
                    <span>关于</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="text-xs text-muted-foreground">
          版本 1.0.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}