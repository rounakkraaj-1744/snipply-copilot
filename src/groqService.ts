import * as vscode from "vscode"
import Groq from "groq-sdk"
import { Logger } from "./utils/logger"
import { ConfigManager } from "./utils/configManager"
import { ErrorHandler } from "./utils/errorHandler"

export interface CompletionRequest {
  prompt: string
  language: string
  maxTokens?: number
  temperature?: number
}

export interface CompletionResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export class GroqService {
  private groq: Groq | null = null
  private isInitialized = false

  constructor() {
    this.initialize()

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("snipplyCopilot.apiKey")) {
        this.initialize()
      }
    })
  }

  private initialize() {
    const config = ConfigManager.getConfig()

    if (config.apiKey && config.apiKey.trim()) {
      this.groq = new Groq({
        apiKey: config.apiKey.trim(),
      })
      this.isInitialized = true
      Logger.info("Groq service initialized successfully")
    } else {
      this.groq = null
      this.isInitialized = false
      Logger.warn("Groq service not initialized - missing API key")
    }
  }

  public isReady(): boolean {
    return this.isInitialized && this.groq !== null
  }

  public async generateCompletion(request: CompletionRequest): Promise<CompletionResponse> {
    if (!this.isReady()) {
      throw new Error("Groq service not initialized. Please configure your API key.")
    }

    const config = ConfigManager.getConfig()
    const model = config.model || "llama-3.1-70b-versatile"
    const maxTokens = request.maxTokens || config.maxTokens || 1000

    try {
      const completion = await this.groq!.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an expert code assistant. Generate high-quality, clean, and well-documented code in ${request.language}. Focus on best practices, readability, and efficiency.`,
          },
          {
            role: "user",
            content: request.prompt,
          },
        ],
        model: model,
        max_tokens: maxTokens,
        temperature: request.temperature || 0.1,
        stream: false,
      })

      const text = completion.choices[0]?.message?.content || ""

      return {
        text,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
      }
    } catch (error) {
      console.error("Groq API error:", error)
      ErrorHandler.handleError(error)
      throw new Error(`Failed to generate completion: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  public async generateInlineCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
  ): Promise<string> {
    if (!this.isReady()) {
      return ""
    }

    const config = ConfigManager.getConfig()
    const model = config.model || "llama-3.1-8b-instant" // Use faster model for inline

    // Get context around cursor
    const linePrefix = document.lineAt(position).text.substring(0, position.character)
    const lineSuffix = document.lineAt(position).text.substring(position.character)

    // Get surrounding context (5 lines before and after)
    const startLine = Math.max(0, position.line - 5)
    const endLine = Math.min(document.lineCount - 1, position.line + 5)
    const contextLines = []

    for (let i = startLine; i <= endLine; i++) {
      if (i === position.line) {
        contextLines.push(linePrefix + "<CURSOR>" + lineSuffix)
      } else {
        contextLines.push(document.lineAt(i).text)
      }
    }

    const contextCode = contextLines.join("\n")
    const language = document.languageId

    const prompt = `Complete the code at the <CURSOR> position. Only return the completion text, no explanations or markdown formatting.

Language: ${language}
Context:
${contextCode}

Complete the code at <CURSOR>:`

    try {
      const completion = await this.groq!.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a code completion assistant. Complete code at the cursor position. Return only the completion text without any formatting, explanations, or markdown. Focus on the most likely continuation based on context.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: model,
        max_tokens: 200,
        temperature: 0.1,
        stream: false,
        stop: ["\n\n", "```"],
      })

      return completion.choices[0]?.message?.content?.trim() || ""
    } catch (error) {
      console.error("Inline completion error:", error)
      ErrorHandler.handleError(error)
      return ""
    }
  }
}
