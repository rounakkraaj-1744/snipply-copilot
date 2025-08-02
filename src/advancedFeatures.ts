import * as vscode from 'vscode';

export class AdvancedFeatures {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private completionAnalytics: Map<string, number> = new Map();

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('snipply');
    }

    analyzeCodeQuality(document: vscode.TextDocument, completion: string): void {
        const diagnostics: vscode.Diagnostic[] = [];
        const lines = completion.split('\n');

        lines.forEach((line, index) => {
            if (line.length > 120) {
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(index, 0, index, line.length),
                    'Line too long (>120 characters)',
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.source = 'snipply';
                diagnostics.push(diagnostic);
            }

            if (line.includes('TODO') || line.includes('FIXME')) {
                const diagnostic = new vscode.Diagnostic(
                    new vscode.Range(index, 0, index, line.length),
                    'Consider implementing this TODO',
                    vscode.DiagnosticSeverity.Information
                );
                diagnostic.source = 'snipply';
                diagnostics.push(diagnostic);
            }
        });

        if (diagnostics.length > 0) {
            this.diagnosticCollection.set(document.uri, diagnostics);
        }
    }

    trackCompletionAcceptance(language: string, accepted: boolean): void {
        const key = `${language}_${accepted ? 'accepted' : 'rejected'}`;
        const count = this.completionAnalytics.get(key) || 0;
        this.completionAnalytics.set(key, count + 1);
    }

    getAnalytics(): { [key: string]: number } {
        const result: { [key: string]: number } = {};
        this.completionAnalytics.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    detectContext(document: vscode.TextDocument, position: vscode.Position): ContextInfo {
        const line = document.lineAt(position.line);
        const beforeCursor = line.text.substring(0, position.character);
        const afterCursor = line.text.substring(position.character);

        return {
            isInFunction: this.isInFunction(document, position),
            isInClass: this.isInClass(document, position),
            isInComment: this.isInComment(beforeCursor),
            isInString: this.isInString(beforeCursor),
            currentIndentation: this.getCurrentIndentation(line.text),
            nearbyKeywords: this.getNearbyKeywords(document, position),
            functionSignature: this.getCurrentFunctionSignature(document, position)
        };
    }

    private isInFunction(document: vscode.TextDocument, position: vscode.Position): boolean {
        for (let i = position.line; i >= 0; i--) {
            const line = document.lineAt(i).text;
            if (line.match(/^\s*(function|def|fn|func)\s+\w+/)) {
                return true;
            }
            if (line.match(/^\s*(class|interface|enum)\s+\w+/)) {
                break;
            }
        }
        return false;
    }

    private isInClass(document: vscode.TextDocument, position: vscode.Position): boolean {
        for (let i = position.line; i >= 0; i--) {
            const line = document.lineAt(i).text;
            if (line.match(/^\s*(class|interface)\s+\w+/)) {
                return true;
            }
        }
        return false;
    }

    private isInComment(text: string): boolean {
        return text.trim().startsWith('//') || 
               text.trim().startsWith('#') || 
               text.trim().startsWith('/*') ||
               text.includes('<!--');
    }

    private isInString(text: string): boolean {
        const singleQuotes = (text.match(/'/g) || []).length;
        const doubleQuotes = (text.match(/"/g) || []).length;
        const backticks = (text.match(/`/g) || []).length;
        
        return (singleQuotes % 2 === 1) || 
               (doubleQuotes % 2 === 1) || 
               (backticks % 2 === 1);
    }

    private getCurrentIndentation(lineText: string): number {
        const match = lineText.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }

    private getNearbyKeywords(document: vscode.TextDocument, position: vscode.Position): string[] {
        const keywords: string[] = [];
        const range = 5;

        for (let i = Math.max(0, position.line - range); 
             i < Math.min(document.lineCount, position.line + range); 
             i++) {
            const line = document.lineAt(i).text;
            const matches = line.match(/\b(if|else|for|while|function|class|import|export|const|let|var|async|await)\b/g);
            if (matches) {
                keywords.push(...matches);
            }
        }

        return [...new Set(keywords)];
    }

    private getCurrentFunctionSignature(document: vscode.TextDocument, position: vscode.Position): string | null {
        for (let i = position.line; i >= 0; i--) {
            const line = document.lineAt(i).text;
            const match = line.match(/(function|def|fn)\s+(\w+)\s*\([^)]*\)/);
            if (match) {
                return match[0];
            }
        }
        return null;
    }

    generateContextualSuggestions(context: ContextInfo, language: string): string[] {
        const suggestions: string[] = [];

        if (context.isInFunction) {
            suggestions.push('return', 'throw', 'console.log');
        }

        if (context.isInClass) {
            suggestions.push('this.', 'super.', 'constructor');
        }

        if (context.nearbyKeywords.includes('async')) {
            suggestions.push('await', 'Promise', '.then(', '.catch(');
        }

        if (language === 'javascript' || language === 'typescript') {
            suggestions.push('const', 'let', 'var', '=>', 'console.log');
        } else if (language === 'python') {
            suggestions.push('def', 'class', 'import', 'print(', 'self.');
        } else if (language === 'java') {
            suggestions.push('public', 'private', 'static', 'void', 'System.out.println');
        }

        return suggestions;
    }

    dispose(): void {
        this.diagnosticCollection.dispose();
        this.completionAnalytics.clear();
    }
}

export interface ContextInfo {
    isInFunction: boolean;
    isInClass: boolean;
    isInComment: boolean;
    isInString: boolean;
    currentIndentation: number;
    nearbyKeywords: string[];
    functionSignature: string | null;
}