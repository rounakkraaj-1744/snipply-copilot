export interface SnipplyConfig {
  apiKey: string
  model: string
  enableInlineCompletion: boolean
  completionDelay: number
  maxTokens: number
}

export interface CompletionContext {
  document: string
  position: number
  language: string
  prefix: string
  suffix: string
}

export interface SnipplyError extends Error {
  code?: string
  statusCode?: number
}