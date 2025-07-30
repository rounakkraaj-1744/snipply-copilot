import * as vscode from "vscode"
import type { GroqService } from "./groqService"
import { Logger } from "./logger"

const logger = new Logger()

export class CodeAssistantProvider {
  constructor(private groqService: GroqService) {}

  async generateCode() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found")
      logger.error("No active editor found")
      return
    }

    if (!this.groqService.isReady()) {
      vscode.window.showErrorMessage("Please configure your Snipply Copilot API key in settings")
      logger.error("Snipply Copilot API key not configured")
      return
    }

    const prompt = await vscode.window.showInputBox({
      prompt: "Describe the code you want to generate",
      placeHolder: "e.g., Create a function to sort an array of objects by name",
    })

    if (!prompt) {
      return
    }

    const language = editor.document.languageId
    const position = editor.selection.active

    try {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Generating code...",
          cancellable: false,
        },
        async () => {
          const response = await this.groqService.generateCompletion({
            prompt: `Generate ${language} code for: ${prompt}`,
            language: language,
          })

          const generatedCode = this.extractCodeFromResponse(response.text)

          await editor.edit((editBuilder) => {
            editBuilder.insert(position, generatedCode)
          })

          vscode.window.showInformationMessage("Code generated successfully!")
        },
      )
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error generating code with Snipply Copilot: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
      logger.error(`Error generating code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async explainCode() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found")
      logger.error("No active editor found")
      return
    }

    if (!this.groqService.isReady()) {
      vscode.window.showErrorMessage("Please configure your Snipply Copilot API key in settings")
      logger.error("Snipply Copilot API key not configured")
      return
    }

    const selection = editor.selection
    const selectedText = editor.document.getText(selection)

    if (!selectedText.trim()) {
      vscode.window.showErrorMessage("Please select some code to explain")
      logger.error("No code selected to explain")
      return
    }

    const language = editor.document.languageId

    try {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Explaining code...",
          cancellable: false,
        },
        async () => {
          const response = await this.groqService.generateCompletion({
            prompt: `Explain this ${language} code in detail:\n\n${selectedText}`,
            language: language,
          })

          // Show explanation in a new document
          const doc = await vscode.workspace.openTextDocument({
            content: response.text,
            language: "markdown",
          })

          await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside)
        },
      )
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error explaining code with Snipply Copilot: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
      logger.error(`Error explaining code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async refactorCode() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found")
      logger.error("No active editor found")
      return
    }

    if (!this.groqService.isReady()) {
      vscode.window.showErrorMessage("Please configure your Snipply Copilot API key in settings")
      logger.error("Snipply Copilot API key not configured")
      return
    }

    const selection = editor.selection
    const selectedText = editor.document.getText(selection)

    if (!selectedText.trim()) {
      vscode.window.showErrorMessage("Please select some code to refactor")
      logger.error("No code selected to refactor")
      return
    }

    const language = editor.document.languageId

    const refactorType = await vscode.window.showQuickPick(
      [
        "Improve readability",
        "Optimize performance",
        "Add error handling",
        "Extract functions",
        "Simplify logic",
        "Add comments",
      ],
      {
        placeHolder: "Select refactoring type",
      },
    )

    if (!refactorType) {
      return
    }

    try {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Refactoring code...",
          cancellable: false,
        },
        async () => {
          const response = await this.groqService.generateCompletion({
            prompt: `Refactor this ${language} code to ${refactorType.toLowerCase()}. Return only the refactored code:\n\n${selectedText}`,
            language: language,
          })

          const refactoredCode = this.extractCodeFromResponse(response.text)

          await editor.edit((editBuilder) => {
            editBuilder.replace(selection, refactoredCode)
          })

          vscode.window.showInformationMessage("Code refactored successfully!")
        },
      )
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error refactoring code with Snipply Copilot: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
      logger.error(`Error refactoring code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async fixCode() {
    const editor = vscode.window.activeTextEditor
    if (!editor) {
      vscode.window.showErrorMessage("No active editor found")
      logger.error("No active editor found")
      return
    }

    if (!this.groqService.isReady()) {
      vscode.window.showErrorMessage("Please configure your Snipply Copilot API key in settings")
      logger.error("Snipply Copilot API key not configured")
      return
    }

    const selection = editor.selection
    const selectedText = editor.document.getText(selection)

    if (!selectedText.trim()) {
      vscode.window.showErrorMessage("Please select some code to fix")
      logger.error("No code selected to fix")
      return
    }

    const language = editor.document.languageId

    try {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Fixing code...",
          cancellable: false,
        },
        async () => {
          const response = await this.groqService.generateCompletion({
            prompt: `Fix any bugs, syntax errors, or logical issues in this ${language} code. Return only the fixed code:\n\n${selectedText}`,
            language: language,
          })

          const fixedCode = this.extractCodeFromResponse(response.text)

          await editor.edit((editBuilder) => {
            editBuilder.replace(selection, fixedCode)
          })

          vscode.window.showInformationMessage("Code fixed successfully!")
        },
      )
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error fixing code with Snipply Copilot: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
      logger.error(`Error fixing code: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private extractCodeFromResponse(response: string): string {
    // Remove markdown code blocks if present
    const codeBlockRegex = /```[\w]*\n?([\s\S]*?)\n?```/g
    const match = codeBlockRegex.exec(response)

    if (match && match[1]) {
      return match[1].trim()
    }

    // If no code blocks found, return the response as is
    return response.trim()
  }
}
