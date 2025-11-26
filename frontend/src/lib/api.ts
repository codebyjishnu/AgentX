import { API_BASE_URL, API_ENDPOINTS } from '../config/constants'
import type { 
  ApiResponse, 
  ChatRequest, 
  ChatResponse, 
  CreateProjectRequest,
  UpdateProjectRequest,
  Project,
} from '../types'

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'An error occurred',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// Chat API
export const chatApi = {
  sendMessage: async (request: ChatRequest): Promise<ApiResponse<ChatResponse>> => {
    return apiCall<ChatResponse>(API_ENDPOINTS.CHAT, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },
}

// Projects API
export const projectsApi = {
  getAll: async (): Promise<ApiResponse<Project[]>> => {
    return apiCall<Project[]>(API_ENDPOINTS.PROJECTS)
  },

  getById: async (id: string): Promise<ApiResponse<Project>> => {
    return apiCall<Project>(`${API_ENDPOINTS.PROJECTS}/${id}`)
  },

  create: async (request: CreateProjectRequest): Promise<ApiResponse<Project>> => {
    return apiCall<Project>(API_ENDPOINTS.PROJECTS, {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  update: async (id: string, request: UpdateProjectRequest): Promise<ApiResponse<Project>> => {
    return apiCall<Project>(`${API_ENDPOINTS.PROJECTS}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    })
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(`${API_ENDPOINTS.PROJECTS}/${id}`, {
      method: 'DELETE',
    })
  },
}

// Sandbox API
export const sandboxApi = {
  create: async (projectId: string): Promise<ApiResponse<{ url: string; sandboxId: string }>> => {
    return apiCall<{ url: string; sandboxId: string }>(API_ENDPOINTS.SANDBOX_CREATE, {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    })
  },

  stop: async (sandboxId: string): Promise<ApiResponse<void>> => {
    return apiCall<void>(API_ENDPOINTS.SANDBOX_STOP, {
      method: 'POST',
      body: JSON.stringify({ sandboxId }),
    })
  },
}

// Export all APIs
export const api = {
  chat: chatApi,
  projects: projectsApi,
  sandbox: sandboxApi,
}

export default api

