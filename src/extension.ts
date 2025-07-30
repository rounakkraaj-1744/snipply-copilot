import * as vscode from "vscode"
import { GroqService } from "./groqService"
import { InlineCompletionProvider } from "./inlineCompletionProvider"
import { CodeAssistantProvider } from "./codeAssistantProvider"
import { Logger } from "./utils/logger"

let groqService: GroqService
let inlineCompletionProvider: InlineCompletionProvider
let codeAssistantProvider: CodeAssistantProvider

export function activate(context: vscode.ExtensionContext) {
  Logger.initialize()
  Logger.info("Snipply Copilot is now active!")

  // Initialize services
  groqService = new GroqService()
  inlineCompletionProvider = new InlineCompletionProvider(groqService)
  codeAssistantProvider = new CodeAssistantProvider(groqService)

  // Register inline completion provider
  const inlineCompletionDisposable = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: "**" },
    inlineCompletionProvider,
  )

  // Register commands
  const generateCodeCommand = vscode.commands.registerCommand("snipplyCopilot.generateCode", async () => {
    await codeAssistantProvider.generateCode()
  })

  const explainCodeCommand = vscode.commands.registerCommand("snipplyCopilot.explainCode", async () => {
    await codeAssistantProvider.explainCode()
  })

  const refactorCodeCommand = vscode.commands.registerCommand("snipplyCopilot.refactorCode", async () => {
    await codeAssistantProvider.refactorCode()
  })

  const fixCodeCommand = vscode.commands.registerCommand("snipplyCopilot.fixCode", async () => {
    await codeAssistantProvider.fixCode()
  })

  const toggleInlineCompletionCommand = vscode.commands.registerCommand(
    "snipplyCopilot.toggleInlineCompletion",
    async () => {
      const config = vscode.workspace.getConfiguration("snipplyCopilot")
      const currentValue = config.get("enableInlineCompletion", true)
      await config.update("enableInlineCompletion", !currentValue, vscode.ConfigurationTarget.Global)
      vscode.window.showInformationMessage(`Inline completion ${!currentValue ? "enabled" : "disabled"}`)
    },
  )

  // Add all disposables to context
  context.subscriptions.push(
    inlineCompletionDisposable,
    generateCodeCommand,
    explainCodeCommand,
    refactorCodeCommand,
    fixCodeCommand,
    toggleInlineCompletionCommand,
  )

  // Show welcome message
  vscode.window
    .showInformationMessage("Snipply Copilot activated! Configure your API key in settings.", "Open Settings")
    .then((selection) => {
      if (selection === "Open Settings") {
        vscode.commands.executeCommand("workbench.action.openSettings", "snipplyCopilot")
      }
    })
}

export function deactivate() {
  Logger.info("Snipply Copilot deactivated")
  Logger.dispose()
}
