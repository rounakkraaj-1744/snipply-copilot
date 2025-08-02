import * as vscode from 'vscode';

export class ApiKeyManager {
    private static readonly GROQ_KEY = 'snipply.groq.apiKey';
    private static readonly CLAUDE_KEY = 'snipply.claude.apiKey';

    constructor(private context: vscode.ExtensionContext) {}

    async setApiKey(provider: 'groq' | 'claude', apiKey: string): Promise<void> {
        const key = provider === 'groq' ? ApiKeyManager.GROQ_KEY : ApiKeyManager.CLAUDE_KEY;
        await this.context.secrets.store(key, apiKey);
    }

    async getApiKey(provider: 'groq' | 'claude'): Promise<string | undefined> {
        const key = provider === 'groq' ? ApiKeyManager.GROQ_KEY : ApiKeyManager.CLAUDE_KEY;
        return await this.context.secrets.get(key);
    }

    async hasApiKey(provider: 'groq' | 'claude'): Promise<boolean> {
        const apiKey = await this.getApiKey(provider);
        return !!apiKey;
    }

    async clearApiKey(provider: 'groq' | 'claude'): Promise<void> {
        const key = provider === 'groq' ? ApiKeyManager.GROQ_KEY : ApiKeyManager.CLAUDE_KEY;
        await this.context.secrets.delete(key);
    }

    async clearAllApiKeys(): Promise<void> {
        await this.clearApiKey('groq');
        await this.clearApiKey('claude');
    }
}