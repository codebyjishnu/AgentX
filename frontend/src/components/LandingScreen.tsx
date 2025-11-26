import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Sparkles, Clock, Folder } from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  lastModified: string
}

// Mock projects data
const mockProjects: Project[] = [
  {
    id: "1",
    name: "E-commerce Dashboard",
    description: "A full-stack e-commerce admin dashboard with analytics",
    createdAt: "2024-01-15",
    lastModified: "2 days ago"
  },
  {
    id: "2",
    name: "Task Management App",
    description: "Kanban-style task management application",
    createdAt: "2024-01-10",
    lastModified: "1 week ago"
  },
  {
    id: "3",
    name: "Blog Platform",
    description: "A modern blog platform with markdown support",
    createdAt: "2024-01-05",
    lastModified: "2 weeks ago"
  }
]

interface LandingScreenProps {
  onSendMessage?: (message: string) => void
  onSelectProject?: (project: Project) => void
}

export default function LandingScreen({ onSendMessage, onSelectProject }: LandingScreenProps) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl w-full mx-auto p-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 mb-4">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text">
            Welcome to AgentX
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered web application creator. Build full-stack applications with just a conversation.
          </p>
        </div>

        {/* Message Input Section */}
        <div className="w-full mx-auto">
              <div className="flex gap-3">
                <Textarea
                  placeholder="Describe the app you want to build..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[150px] resize-none bg-background/50 border-border/50 focus:border-primary"
                />
                {/* <Button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="h-auto px-4 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  <Send className="w-5 h-5" />
                </Button> */}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
        </div>

        {/* Projects History Section */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-4">
            <Folder className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Previous Projects</h2>
          </div>

          {mockProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProjects.map((project) => (
                <Card
                  key={project.id}
                  onClick={() => onSelectProject?.(project)}
                  className="bg-card/50 border-border/50 hover:bg-card/70 hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {project.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{project.lastModified}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/30 border-border/30 border-dashed">
              <CardContent className="p-8 text-center">
                <Folder className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">
                  No projects yet. Start by describing an app above!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

