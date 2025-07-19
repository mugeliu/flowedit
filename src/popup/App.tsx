import React from 'react'
import { Button } from '../shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/components/ui/card'

function App() {
  const openOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  };

  return (
    <div className="p-4 w-80">
      <Card>
        <CardHeader>
          <CardTitle>FlowEdit</CardTitle>
          <CardDescription>微信编辑器增强工具</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full">
            启动编辑器
          </Button>
          <Button variant="outline" className="w-full" onClick={openOptionsPage}>
            设置
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default App