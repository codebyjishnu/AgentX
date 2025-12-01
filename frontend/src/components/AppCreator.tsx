import { useState } from "react"
// import { Button } from "./ui/button"
import ChatInterface from "./ChatInterface"
import SandboxPreview from "./SandboxPreview"
// import ChatHistoryList from "./ChatHistory"
// import { Plus, Menu, X, Wand } from "lucide-react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "./ui/resizable"
import { useParams } from "react-router-dom"
import { useProjectDetails } from "../hooks/queries/useProjectQuery"

export default function AppCreator() {
  const { id } = useParams()
  const { data: projectDetails, isLoading, isError } = useProjectDetails(id)
  const [isCreating, setIsCreating] = useState(false)
  const [sandboxUrl, setSandboxUrl] = useState<string | undefined>(undefined)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error loading project</div>
  }


  const handleSendMessage = (message: string) => {
    console.log("Message sent:", message)
    // This will be connected to the backend API later
  }

  const handleSandboxReady = (sandboxId: string) => {
    setSandboxUrl(sandboxId)
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background">
      {/* Header */}
      {/* <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary from-primary to-purple-600 flex items-center justify-center">
                <Wand className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-white from-primary to-purple-600 bg-clip-text text-transparent">
                AgentX
              </h1>
            </div>
          </div>
          <Button onClick={handleCreateNewApp} className="gap-2">
            <Plus className="w-4 h-4" />
            Create New App
          </Button>
        </div>
      </header> */}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Project List */}
        {/* <aside
          className={`${
            isSidebarOpen ? 'w-80' : 'w-0'
          } transition-all duration-300 border-r border-border/50 bg-card/20 overflow-hidden`}
        >
          <div className="h-full p-4">
            <ChatHistoryList />
          </div>
        </aside> */}

        {/* Main Content Area - Resizable Split View */}
        <main className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Panel - Chat Interface */}
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="h-full bg-background">
                <ChatInterface
                  onSendMessage={handleSendMessage}
                  onSandboxReady={handleSandboxReady}
                  projectDetails={projectDetails}
                />
              </div>
            </ResizablePanel>

            <ResizableHandle/>

            {/* Right Panel - Sandbox Preview */}
            <ResizablePanel defaultSize={50} minSize={40}>
              <div className="h-full bg-background p-4">
                <SandboxPreview isLoading={isCreating} sandbox_url={sandboxUrl} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>© 2024 AgentX</span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              All systems operational
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by E2B Sandbox</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

