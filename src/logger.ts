import * as vscode from "vscode";

export class Logger {
  private static outputChannel: vscode.OutputChannel;

  static initialize() {
    this.outputChannel = vscode.window.createOutputChannel("Snipply Copilot");
  }

  static info(message: string) {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] INFO: ${message}`);
  }

  static error(message: string, error?: Error) {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] ERROR: ${message}`);
    if (error) {
      this.outputChannel.appendLine(`Stack: ${error.stack}`);
    }
  }

  static warn(message: string) {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(`[${timestamp}] WARN: ${message}`);
  }

  static show() {
    this.outputChannel.show();
  }

  static dispose() {
    this.outputChannel.dispose();
  }
}
