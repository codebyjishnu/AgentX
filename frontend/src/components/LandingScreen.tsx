import { useState } from "react"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Send, Wand} from "lucide-react"
import { PROJECT_TEMPLATES } from "../lib/constant"
import { useCreateProject } from "../hooks/queries/useProjectQuery"
import { useNavigate } from "react-router-dom"

// interface Project {
//   id: string
//   name: string
//   description: string
//   createdAt: string
//   lastModified: string
// }

export default function LandingScreen() {
  const [message, setMessage] = useState("")
  const {mutate: createProject}=useCreateProject()
  const navigate = useNavigate()

  const handleSend = () => {
    if (message.trim()) {
       // Call the mutation inside the handler
      createProject(undefined, {
        onSuccess: (data) => {
          navigate(`/project/${data.id}`)
          setMessage("")
        },
        onError: (error) => {
          console.error("Failed to create project:", error)
        }
      })
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
    <div className="h-full w-full overflow-y-auto bg-black- from-background via-background to-primary/5">
      <div className="max-w-4xl w-full mx-auto p-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary from-primary to-purple-600 mb-4">
            <Wand className="w-10 h-10 text-white" />
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
          <div className="relative">
            <Textarea
              placeholder="Describe the app you want to build..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[150px] resize-none bg-background/50 border-border/50 focus:border-primary pr-14 pb-12 text-md"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              size="icon"
              className="absolute bottom-3 right-3 bg-primary from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>

        {/* Projects History Section */}
        <div className="flex-wrap justify-center gap-3 hidden md:flex max-w-3xl">
          {PROJECT_TEMPLATES.map((template) => (
            <Button 
              key={template.title}
              variant="outline"
              size="lg"
              className="bg-white dark:bg-sidebar text-black"
              onClick={() => setMessage(template.prompt)}
            >
              {template.emoji} {template.title}
            </Button>
          ))}
        </div>
        </div>
      </div>
  )
}

