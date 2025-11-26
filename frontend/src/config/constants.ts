// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  CHAT: '/api/chat',
  PROJECTS: '/api/projects',
  SANDBOX: '/api/sandbox',
  SANDBOX_CREATE: '/api/sandbox/create',
  SANDBOX_STOP: '/api/sandbox/stop',
} as const

// Application Configuration
export const APP_CONFIG = {
  NAME: 'AgentX',
  VERSION: '1.0.0',
  DESCRIPTION: 'AI-Powered Web Application Creator',
} as const

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 320,
  CHAT_MAX_HEIGHT: 120,
  MESSAGE_TIMESTAMP_FORMAT: 'en-US',
  TYPING_INDICATOR_DELAY: 1500,
} as const

// Sandbox Configuration
export const SANDBOX_CONFIG = {
  INITIALIZATION_TIMEOUT: 30000, // 30 seconds
  DEFAULT_TEMPLATE: 'react-typescript',
  SUPPORTED_TEMPLATES: [
    'react-typescript',
    'react-javascript',
    'vue-typescript',
    'vue-javascript',
    'next-typescript',
    'next-javascript',
  ],
} as const

// Mock Data Flags (for development)
export const FEATURE_FLAGS = {
  USE_MOCK_DATA: true,
  ENABLE_WELCOME_SCREEN: false,
  ENABLE_PROJECT_TEMPLATES: true,
  ENABLE_CODE_EXPORT: true,
} as const

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEND_MESSAGE: 'Enter',
  NEW_LINE: 'Shift+Enter',
  TOGGLE_SIDEBAR: 'Ctrl+B',
  NEW_PROJECT: 'Ctrl+N',
} as const

