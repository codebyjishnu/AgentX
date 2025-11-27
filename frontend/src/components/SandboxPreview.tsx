import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Monitor, RefreshCw, Maximize2, Code, Eye } from "lucide-react"
import { useState } from "react"

interface SandboxPreviewProps {
  isLoading?: boolean
}

export default function SandboxPreview({ isLoading = false }: SandboxPreviewProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview')
  
  return (
    <Card className="h-full bg-card/50 border-border/50 flex flex-col">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Live Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'preview' ? 'default' : 'ghost'}
                onClick={() => setViewMode('preview')}
                className="h-7 px-3"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'code' ? 'default' : 'ghost'}
                onClick={() => setViewMode('code')}
                className="h-7 px-3"
              >
                <Code className="w-4 h-4 mr-1" />
                Code
              </Button>
            </div>
            <Button size="sm" variant="outline" className="h-8">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground">Initializing sandbox...</p>
            </div>
          </div>
        ) : (
          <div className="h-full w-full bg-secondary/20">
            {viewMode === 'preview' ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Monitor className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      No App Running
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Create a new app or select an existing project to see the live preview here.
                      The sandbox will run in an isolated E2B environment.
                    </p>
                  </div>
                  <div className="pt-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Sandbox Ready
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full p-4 font-mono text-sm">
                <div className="bg-background/50 rounded-lg p-4 h-full overflow-auto">
                  <div className="text-muted-foreground">
                    <div className="mb-2 text-primary">// App.tsx</div>
                    <div className="space-y-1">
                      <div><span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-green-400">'react'</span></div>
                      <div className="mt-4"><span className="text-purple-400">function</span> <span className="text-blue-400">App</span>() {'{'}</div>
                      <div className="ml-4"><span className="text-purple-400">return</span> (</div>
                      <div className="ml-8">{'<'}div className=<span className="text-green-400">"app"</span>{'>'}</div>
                      <div className="ml-12">{'<'}h1{'>'}Hello AgentX!{'<'}/h1{'>'}</div>
                      <div className="ml-8">{'<'}/div{'>'}</div>
                      <div className="ml-4">)</div>
                      <div>{'}'}</div>
                      <div className="mt-4"><span className="text-purple-400">export default</span> App</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

