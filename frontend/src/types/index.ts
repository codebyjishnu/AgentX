// Message types for chat interface
export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

// Project types
export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  lastModified: string
  status?: 'active' | 'archived' | 'draft'
  sandboxUrl?: string
}

// Sandbox types
export interface Sandbox {
  id: string
  projectId: string
  url: string
  status: 'initializing' | 'running' | 'stopped' | 'error'
  createdAt: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Chat API types
export interface ChatRequest {
  message: string
  projectId?: string
  conversationId?: string
}

export interface ChatResponse {
  message: Message
  sandboxUpdate?: {
    url: string
    status: string
  }
}

// Project API types
export interface CreateProjectRequest {
  name: string
  description?: string
  template?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  status?: 'active' | 'archived' | 'draft'
}

