import * as vscode from "vscode";
import type { GroqService } from "./groqService";

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
  private completionCache = new Map<string, { completion: string; timestamp: number }>();
  private readonly CACHE_DURATION = 30000;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(private groqService: GroqService) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken,
  ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {
    
    const config = vscode.workspace.getConfiguration("groqAssistant");
    const isEnabled = config.get<boolean>("enableInlineCompletion", true);

    if (!isEnabled || !this.groqService.isReady()) {
      return null;
    }

    if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic) {
      const line = document.lineAt(position).text;
      const beforeCursor = line.substring(0, position.character);

      if (beforeCursor.trim().length === 0) {
        return null;
      }

      if (beforeCursor.trim().startsWith("//") || beforeCursor.trim().startsWith("/*")) {
        return null;
      }
    }

    const contextKey = this.createContextKey(document, position);

    const cached = this.completionCache.get(contextKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      if (cached.completion) {
        return [new vscode.InlineCompletionItem(cached.completion)];
      }
      return null;
    }

    try {
      if (context.triggerKind === vscode.InlineCompletionTriggerKind.Automatic) {
        const delay = config.get<number>("completionDelay", 500);

        return new Promise((resolve) => {
          if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
          }

          this.debounceTimer = setTimeout(async () => {
            if (token.isCancellationRequested) {
              resolve(null);
              return;
            }

            const completion = await this.getCompletion(document, position, contextKey);
            resolve(completion);
          }, delay);
        });
      } else {
        return await this.getCompletion(document, position, contextKey);
      }
    } catch (error) {
      console.error("Inline completion error:", error);
      return null;
    }
  }

  private async getCompletion(
    document: vscode.TextDocument,
    position: vscode.Position,
    contextKey: string,
  ): Promise<vscode.InlineCompletionItem[] | null> {
    try {
      const completionText = await this.groqService.generateInlineCompletion(
        document,
        position,
        {} as vscode.InlineCompletionContext,
      );

      this.completionCache.set(contextKey, {
        completion: completionText,
        timestamp: Date.now(),
      });

      if (completionText && completionText.trim()) {
        return [new vscode.InlineCompletionItem(completionText)];
      }
    } catch (error) {
      console.error("Error getting completion:", error);
    }

    return null;
  }

  private createContextKey(document: vscode.TextDocument, position: vscode.Position): string {
    const line = document.lineAt(position).text;
    const beforeCursor = line.substring(0, position.character);
    return `${document.uri.toString()}:${position.line}:${beforeCursor}`;
  }

  private cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.completionCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.completionCache.delete(key);
      }
    }
  }
}