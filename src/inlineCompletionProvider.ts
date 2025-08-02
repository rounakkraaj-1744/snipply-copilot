import * as vscode from 'vscode';
import { snipplyProvider, CompletionRequest } from './provider';

export class InlineCompletionProvider implements vscode.InlineCompletionItemProvider {
    private currentSuggestion: string | null = null;
    private lastRequestTime = 0;
    private debounceTimer: NodeJS.Timeout | null = null;

    constructor(private provider: snipplyProvider) {}

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {
        
        const config = vscode.workspace.getConfiguration('snipply');
        if (!config.get<boolean>('enabled', true)) {
            return null;
        }

        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        const debounceMs = config.get<number>('debounceMs', 300);
        const now = Date.now();
        
        if (now - this.lastRequestTime < debounceMs) {
            return new Promise((resolve) => {
                this.debounceTimer = setTimeout(async () => {
                    const result = await this.getCompletion(document, position, token);
                    resolve(result);
                }, debounceMs);
            });
        }

        this.lastRequestTime = now;
        return this.getCompletion(document, position, token);
    }

    private async getCompletion(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[] | null> {
        
        if (token.isCancellationRequested) {
            return null;
        }

        const lineText = document.lineAt(position.line).text;
        const beforeCursor = lineText.substring(0, position.character);
        const afterCursor = lineText.substring(position.character);

        if (beforeCursor.match(/\w$/) && afterCursor.match(/^\w/)) {
            return null;
        }

        if (beforeCursor.trim().length < 2) {
            return null;
        }

        const prefix = this.getPrefix(document, position);
        const suffix = this.getSuffix(document, position);

        if (!prefix.trim()) {
            return null;
        }

        const request: CompletionRequest = {
            prefix,
            suffix,
            language: document.languageId,
            filename: document.fileName,
            cursorPosition: position
        };

        try {
            const completion = await this.provider.getCompletion(request);
            
            if (completion && completion.text && !token.isCancellationRequested) {
                this.currentSuggestion = completion.text;
                
                vscode.commands.executeCommand('setContext', 'snipply.suggestionVisible', true);
                
                return [{
                    insertText: completion.text,
                    range: new vscode.Range(position, position),
                    filterText: beforeCursor
                }];
            }
        } catch (error) {
            console.error('Inline completion failed:', error);
        }

        this.currentSuggestion = null;
        vscode.commands.executeCommand('setContext', 'snipply.suggestionVisible', false);
        return null;
    }

    private getPrefix(document: vscode.TextDocument, position: vscode.Position): string {
        const maxLines = 20;
        const maxChars = 2000;
        
        let prefix = '';
        let lineCount = 0;
        
        for (let i = Math.max(0, position.line - maxLines); i <= position.line; i++) {
            const line = document.lineAt(i);
            
            if (i === position.line) {
                prefix += line.text.substring(0, position.character);
            } else {
                prefix += line.text + '\n';
            }
            
            lineCount++;
            if (prefix.length > maxChars) {
                prefix = prefix.substring(prefix.length - maxChars);
                break;
            }
        }
        
        return prefix;
    }

    private getSuffix(document: vscode.TextDocument, position: vscode.Position): string {
        const maxLines = 10;
        const maxChars = 1000;
        
        let suffix = '';
        let lineCount = 0;
        
        for (let i = position.line; i < Math.min(document.lineCount, position.line + maxLines); i++) {
            const line = document.lineAt(i);
            
            if (i === position.line) {
                suffix += line.text.substring(position.character);
            } else {
                suffix += '\n' + line.text;
            }
            
            lineCount++;
            if (suffix.length > maxChars) {
                suffix = suffix.substring(0, maxChars);
                break;
            }
        }
        
        return suffix;
    }

    acceptCurrentSuggestion(): void {
        if (this.currentSuggestion) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const position = editor.selection.active;
                editor.edit(editBuilder => {
                    editBuilder.insert(position, this.currentSuggestion!);
                });
            }
        }
        this.dismissCurrentSuggestion();
    }

    dismissCurrentSuggestion(): void {
        this.currentSuggestion = null;
        vscode.commands.executeCommand('setContext', 'snipply.suggestionVisible', false);
    }
}