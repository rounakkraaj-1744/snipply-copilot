import * as vscode from "vscode"
import type { SnipplyConfig } from "../types"

export class ConfigManager {
  private static readonly CONFIG_SECTION = "snipplyCopilot"

  static getConfig(): SnipplyConfig {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION)

    return {
      apiKey: config.get<string>("apiKey", ""),
      model: config.get<string>("model", "llama-3.1-70b-versatile"),
      enableInlineCompletion: config.get<boolean>("enableInlineCompletion", true),
      completionDelay: config.get<number>("completionDelay", 500),
      maxTokens: config.get<number>("maxTokens", 1000),
    }
  }

  static async updateConfig(key: keyof SnipplyConfig, value: any) {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION)
    await config.update(key, value, vscode.ConfigurationTarget.Global)
  }

  static onConfigChange(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(this.CONFIG_SECTION)) {
        callback()
      }
    })
  }
}
