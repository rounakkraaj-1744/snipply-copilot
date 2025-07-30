import * as vscode from "vscode";
import { GroqService } from "./groqService";
import { InlineCompletionProvider } from "./inlineCompletionProvider";
import { CodeAssistantProvider } from "./codeAssistantProvider";

let groqService: GroqService;
let inlineCompletionProvider: InlineCompletionProvider;
let codeAssistantProvider: CodeAssistantProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log("Groq Code Assistant is now active!");

  groqService = new GroqService();
  inlineCompletionProvider = new InlineCompletionProvider(groqService);
  codeAssistantProvider = new CodeAssistantProvider(groqService);

  const inlineCompletionDisposable = vscode.languages.registerInlineCompletionItemProvider(
    { pattern: "**" },
    inlineCompletionProvider,
  );

  const generateCodeCommand = vscode.commands.registerCommand("groqAssistant.generateCode", async () => {
    await codeAssistantProvider.generateCode();
  });

  const explainCodeCommand = vscode.commands.registerCommand("groqAssistant.explainCode", async () => {
    await codeAssistantProvider.explainCode();
  });

  const refactorCodeCommand = vscode.commands.registerCommand("groqAssistant.refactorCode", async () => {
    await codeAssistantProvider.refactorCode();
  });

  const fixCodeCommand = vscode.commands.registerCommand("groqAssistant.fixCode", async () => {
    await codeAssistantProvider.fixCode();
  });

  const toggleInlineCompletionCommand = vscode.commands.registerCommand(
    "groqAssistant.toggleInlineCompletion",
    async () => {
      const config = vscode.workspace.getConfiguration("groqAssistant");
      const currentValue = config.get("enableInlineCompletion", true);
      await config.update("enableInlineCompletion", !currentValue, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`Inline completion ${!currentValue ? "enabled" : "disabled"}`);
    },
  );

  context.subscriptions.push(
    inlineCompletionDisposable,
    generateCodeCommand,
    explainCodeCommand,
    refactorCodeCommand,
    fixCodeCommand,
    toggleInlineCompletionCommand,
  );

  vscode.window
    .showInformationMessage("Groq Code Assistant activated! Configure your API key in settings.", "Open Settings")
    .then((selection) => {
      if (selection === "Open Settings") {
        vscode.commands.executeCommand("workbench.action.openSettings", "groqAssistant");
      }
    });
}

export function deactivate() {
  console.log("Groq Code Assistant deactivated");
}