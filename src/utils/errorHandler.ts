import * as vscode from "vscode"
import { Logger } from "./logger"
import type { SnipplyError } from "../types"

export class ErrorHandler {
  static handle(error: SnipplyError | Error, context: string) {
    Logger.error(`Error in ${context}`, error)

    if (error.message.includes("API key")) {
      vscode.window
        .showErrorMessage(
          "Snipply Copilot: Invalid or missing API key. Please configure your Groq API key.",
          "Open Settings",
        )
        .then((selection) => {
          if (selection === "Open Settings") {
            vscode.commands.executeCommand("workbench.action.openSettings", "snipplyCopilot")
          }
        })
    } else if (error.message.includes("rate limit")) {
      vscode.window.showWarningMessage("Snipply Copilot: Rate limit exceeded. Please try again later.")
    } else if (error.message.includes("network") || error.message.includes("fetch")) {
      vscode.window.showErrorMessage("Snipply Copilot: Network error. Please check your connection.")
    } else {
      vscode.window.showErrorMessage(`Snipply Copilot: ${error.message}`)
    }
  }

  static async handleWithRetry<T>(operation: () => Promise<T>, context: string, maxRetries = 2): Promise<T | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries) {
          this.handle(error as SnipplyError, context)
          return null
        }

        Logger.warn(`Attempt ${attempt} failed in ${context}, retrying...`)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
      }
    }
    return null
  }
}
