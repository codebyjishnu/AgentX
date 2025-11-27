import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Clock, Folder } from "lucide-react"

interface ChatHistory {
  id: string
  name: string
  createdAt: string
  lastModified: string
}

// Static mock data
const mockChatHistorys: ChatHistory[] = [];

interface ChatHistoryListProps {
  onSelectChatHistory?: (ChatHistory: ChatHistory) => void
}

export default function ChatHistoryList({ onSelectChatHistory }: ChatHistoryListProps) {
  return (
    <Card className="h-full bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Recent Chats
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2 p-4 pt-0">
            {mockChatHistorys.map((chatHistory) => (
              <div
                key={chatHistory.id}
                onClick={() => onSelectChatHistory?.(chatHistory)}
                className="p-3 rounded-lg border border-border/50 bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                      {chatHistory.name}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{chatHistory.lastModified}</span>
                      </div>
                      <span>Created: {chatHistory.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

