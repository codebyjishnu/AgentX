import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { ScrollArea } from "./ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Send, User, Bot, Wand, FolderOpen, Plus } from "lucide-react"
import type { Project } from "../types"
import { useSendMessage } from "../hooks/queries/useProjectQuery"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatInterfaceProps {
  onSendMessage?: (message: string) => void,
  projectDetails?:Project
}

export default function ChatInterface({ onSendMessage,projectDetails}:    ChatInterfaceProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const initialMessageProcessed = useRef(false)
  const streamingMessageIdRef = useRef<string | null>(null)

  // Hook to send message via SSE
  const { sendMessage: sendMessageSSE, isPending: isSending } = useSendMessage(projectDetails?.id)

  // Get initial message from navigation state
  const getInitialMessages = (): Message[] => {
    const state = location.state as { initialMessage?: string } | null
    if (state?.initialMessage) {
      return [{
        id: Date.now().toString(),
        role: "user",
        content: state.initialMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]
    }
    return []
  }

  const [messages, setMessages] = useState<Message[]>(getInitialMessages)
  const [input, setInput] = useState("")

  // Helper to send message and handle streaming response
  const handleSendMessage = (content: string) => {
    // Create AI message placeholder for streaming
    const aiMessageId = Date.now().toString()
    streamingMessageIdRef.current = aiMessageId

    const aiMessage: Message = {
      id: aiMessageId,
      role: "assistant",
      content: "Processing...",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, aiMessage])

    sendMessageSSE(content, {
      onMessage: (message) => {
        // Update single message with current status while streaming
        setMessages(prev =>
          prev.map(msg =>
            msg.id === streamingMessageIdRef.current
              ? { ...msg, content: message }
              : msg
          )
        )
      },
      onFileCreation: (data) => {
        // Update single message with file creation status
        setMessages(prev =>
          prev.map(msg =>
            msg.id === streamingMessageIdRef.current
              ? { ...msg, content: data.message }
              : msg
          )
        )
      },
      onFileUpdate: (data) => {
        // Update single message with file update status
        setMessages(prev =>
          prev.map(msg =>
            msg.id === streamingMessageIdRef.current
              ? { ...msg, content: data.message }
              : msg
          )
        )
      },
      onComplete: (data) => {
        console.log("onComplete received:", data)
        const messageId = streamingMessageIdRef.current
        // Show final message with summary when action is complete
        if (messageId) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === messageId
                ? { ...msg, content: data.summary || "Task completed successfully." }
                : msg
            )
          )
        }
        streamingMessageIdRef.current = null
      },
      onError: (error) => {
        console.error("Failed to send message:", error)
        // Update message to show error
        setMessages(prev =>
          prev.map(msg =>
            msg.id === streamingMessageIdRef.current
              ? { ...msg, content: "Sorry, an error occurred. Please try again." }
              : msg
          )
        )
        streamingMessageIdRef.current = null
      }
    })
  }

  // Handle initial message - send to API
  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null
    if (state?.initialMessage && !initialMessageProcessed.current) {
      initialMessageProcessed.current = true

       
      handleSendMessage(state.initialMessage)
      onSendMessage?.(state.initialMessage)

      // Clear the state to prevent re-triggering on navigation
      window.history.replaceState({}, document.title)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, onSendMessage])

  const handleProjectChange = (projectId: string) => {
    navigate(`/project/${projectId}`)
  }
// Mock projects for now - this would come from API/context in real app
const mockProjects: Project[] = [
  { id: "1", name: "Netflix Clone", created_at: "2024-01-15", updated_at: "2024-01-20", status: "active" },
  { id: "2", name: "Admin Dashboard", created_at: "2024-01-10", updated_at: "2024-01-18", status: "active" },
  { id: "3", name: "E-commerce App", created_at: "2024-01-05", updated_at: "2024-01-15", status: "draft" },
]

  const handleSend = () => {
    if (!input.trim() || isSending) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newMessage])
    const messageContent = input
    setInput("")

    handleSendMessage(messageContent)
    onSendMessage?.(messageContent)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Project Selector Header */}
      <div className="border-b border-border/50 p-3 bg-card/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-muted-foreground" />
            <Select
              value={projectDetails?.name || ""}
              onValueChange={handleProjectChange}
            >
              <SelectTrigger className="w-[200px] h-8 text-sm">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projectDetails && (
              <span className="text-xs text-muted-foreground ml-2">
                Last modified: {new Date(projectDetails.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className={`flex flex-col gap-1 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground px-2">{message.timestamp}</span>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-foreground" />
                </div>
              )}
            </div>
          ))}

        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4 bg-card/30">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe the app you want to create..."
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="h-auto px-4"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Wand className="w-3 h-3" />
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  )
}

