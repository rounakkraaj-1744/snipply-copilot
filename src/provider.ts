import * as vscode from 'vscode';
import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import { ApiKeyManager } from './apiKeyManager';

export interface CompletionRequest {
    prefix: string;
    suffix: string;
    language: string;
    filename: string;
    cursorPosition: vscode.Position;
}

export interface CompletionResponse {
    text: string;
    confidence: number;
}

export class snipplyProvider {
    private groqClient: Groq | null = null;
    private claudeClient: Anthropic | null = null;
    private cache = new Map<string, CompletionResponse>();
    private requestQueue = new Map<string, Promise<CompletionResponse | null>>();

    constructor(private apiKeyManager: ApiKeyManager) {
        this.initializeClients();
    }

    private async initializeClients() {
        const config = vscode.workspace.getConfiguration('snipply');
        const provider = config.get<string>('apiProvider', 'groq');

        try {
            if (provider === 'groq') {
                const apiKey = await this.apiKeyManager.getApiKey('groq');
                if (apiKey) {
                    this.groqClient = new Groq({ apiKey });
                }
            } else if (provider === 'claude') {
                const apiKey = await this.apiKeyManager.getApiKey('claude');
                if (apiKey) {
                    this.claudeClient = new Anthropic({ apiKey });
                }
            }
        } catch (error) {
            console.error('Failed to initialize API clients:', error);
        }
    }

    async getCompletion(request: CompletionRequest): Promise<CompletionResponse | null> {
        const config = vscode.workspace.getConfiguration('snipply');

        if (!config.get<boolean>('enabled', true)) {
            return null;
        }

        const cacheKey = this.generateCacheKey(request);

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        if (this.requestQueue.has(cacheKey)) {
            return this.requestQueue.get(cacheKey)!;
        }

        const requestPromise = this.makeCompletionRequest(request);
        this.requestQueue.set(cacheKey, requestPromise);

        try {
            const result = await requestPromise;
            if (result) {
                this.cache.set(cacheKey, result);
            }
            return result;
        } finally {
            this.requestQueue.delete(cacheKey);
        }
    }

    private async makeCompletionRequest(request: CompletionRequest): Promise<CompletionResponse | null> {
        const config = vscode.workspace.getConfiguration('snipply');
        const provider = config.get<string>('apiProvider', 'groq');

        try {
            if (provider === 'groq' && this.groqClient) {
                return await this.getGroqCompletion(request);
            } else if (provider === 'claude' && this.claudeClient) {
                return await this.getClaudeCompletion(request);
            } else {
                await this.initializeClients();
                if (provider === 'groq' && this.groqClient) {
                    return await this.getGroqCompletion(request);
                } else if (provider === 'claude' && this.claudeClient) {
                    return await this.getClaudeCompletion(request);
                }
                return null;
            }
        } catch (error) {
            console.error('Completion request failed:', error);
            return null;
        }
    }

    private async getGroqCompletion(request: CompletionRequest): Promise<CompletionResponse | null> {
        if (!this.groqClient) {
            return null;
        }

        const config = vscode.workspace.getConfiguration('snipply');
        const model = config.get<string>('groqModel', 'llama3-70b-8192');
        const maxTokens = config.get<number>('maxTokens', 100);
        const temperature = config.get<number>('temperature', 0.1);

        const prompt = this.buildGroqPrompt(request);

        try {
            const completion = await this.groqClient.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: `You are an expert coding assistant similar better than GitHub Copilot. Your job is to provide accurate, concise code completions.

Rules:
- Only return the exact code completion, no explanations
- No markdown formatting or code blocks
- Match the existing code style and indentation
- Be context-aware and provide relevant completions
- Keep completions focused and concise
- Don't repeat the existing code`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                model,
                max_tokens: maxTokens,
                temperature,
                top_p: 0.9,
                stop: ['\n\n', '```', '---', '===']
            });

            const text = completion.choices[0]?.message?.content?.trim() || '';
            if (text) {
                return {
                    text: this.cleanCompletion(text),
                    confidence: this.calculateConfidence(text, request)
                };
            }
        } catch (error: any) {
            console.error('Groq completion failed:', error);

            if (error.status === 401) {
                vscode.window.showErrorMessage('Invalid Groq API key. Please check your API key.');
            } else if (error.status === 429) {
                vscode.window.showWarningMessage('Groq API rate limit reached. Please try again in a moment.');
            } else if (error.status === 402) {
                vscode.window.showErrorMessage('Groq API quota exceeded. Please check your billing.');
            }
        }

        return null;
    }

    private async getClaudeCompletion(request: CompletionRequest): Promise<CompletionResponse | null> {
        if (!this.claudeClient) {
            return null;
        }

        const config = vscode.workspace.getConfiguration('snipply');
        const maxTokens = config.get<number>('maxTokens', 100);

        const prompt = this.buildClaudePrompt(request);

        try {
            const completion = await this.claudeClient.messages.create({
                model: 'claude-3-sonnet-20240229',
                max_tokens: maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: `Complete this code naturally and concisely. Only return the completion:\n\n${prompt}`
                    }
                ]
            });

            const text = completion.content[0]?.type === 'text' ? completion.content[0].text.trim() : '';
            if (text) {
                return {
                    text: this.cleanCompletion(text),
                    confidence: 0.8
                };
            }
        } catch (error) {
            console.error('Claude completion failed:', error);
        }

        return null;
    }

    private buildGroqPrompt(request: CompletionRequest): string {
        const { prefix, suffix, language, filename } = request;

        let prompt = `Complete the following ${language} code. Provide only the next logical code completion:\n\n`;

        if (filename) {
            prompt += `File: ${filename}\n`;
        }

        const languageHints = this.getLanguageHints(language);
        if (languageHints) {
            prompt += `Context: ${languageHints}\n`;
        }

        prompt += '\nCode:\n```\n';

        const maxPrefixLength = 1500;
        const maxSuffixLength = 500;

        let contextPrefix = prefix;
        if (contextPrefix.length > maxPrefixLength) {
            contextPrefix = '...' + contextPrefix.slice(-maxPrefixLength);
        }

        let contextSuffix = suffix;
        if (contextSuffix.length > maxSuffixLength) {
            contextSuffix = contextSuffix.slice(0, maxSuffixLength) + '...';
        }

        prompt += contextPrefix;
        prompt += '<COMPLETE_HERE>';

        if (contextSuffix.trim()) {
            prompt += contextSuffix;
        }

        prompt += '\n```\n\nCompletion:';

        return prompt;
    }

    private getLanguageHints(language: string): string | null {
        const hints: { [key: string]: string } = {
            'javascript': 'Modern ES6+ JavaScript with proper error handling',
            'typescript': 'TypeScript with proper typing and modern syntax',
            'python': 'Pythonic code following PEP 8 conventions',
            'java': 'Java with proper OOP principles and modern syntax',
            'cpp': 'Modern C++ with RAII and smart pointers',
            'csharp': 'C# with modern language features and best practices',
            'go': 'Idiomatic Go code with proper error handling',
            'rust': 'Safe Rust code with ownership principles',
            'php': 'Modern PHP with proper error handling',
            'ruby': 'Ruby following community conventions',
            'swift': 'Swift with modern language features',
            'kotlin': 'Kotlin with concise and expressive syntax'
        };

        return hints[language] || null;
    }

    private calculateConfidence(completion: string, request: CompletionRequest): number {
        let confidence = 0.8;

        if (completion.length > 10 && completion.length < 200) {
            confidence += 0.1;
        }

        if (this.seemsSyntacticallyCorrect(completion, request.language)) {
            confidence += 0.1;
        }

        if (this.seemsRepetitive(completion, request.prefix)) {
            confidence -= 0.2;
        }

        return Math.min(Math.max(confidence, 0.1), 1.0);
    }

    private seemsSyntacticallyCorrect(completion: string, language: string): boolean {
        const syntaxPatterns: { [key: string]: RegExp[] } = {
            'javascript': [/^[^{}]*[{}]?[^{}]*$/, /^[^()]*[()]?[^()]*$/],
            'python': [/^[^:]*:?[^:]*$/, /^\s*[a-zA-Z_].*$/],
            'java': [/^[^{}]*[{}]?[^{}]*$/, /^[^;]*;?[^;]*$/],
        };

        const patterns = syntaxPatterns[language];
        if (!patterns) {
            return true;
        }

        return patterns.some(pattern => pattern.test(completion));
    }

    private seemsRepetitive(completion: string, prefix: string): boolean {
        const lastLines = prefix.split('\n').slice(-3).join('\n');
        return completion.includes(lastLines) || lastLines.includes(completion);
    }

    private buildClaudePrompt(request: CompletionRequest): string {
        const { prefix, suffix, language, filename } = request;

        let prompt = `Complete the following ${language} code. Provide only the completion that should come next:\n\n`;

        if (filename) {
            prompt += `File: ${filename}\n`;
        }

        prompt += `Language: ${language}\n\nCode:\n`;

        const maxPrefixLength = 1200;
        const maxSuffixLength = 400;

        let contextPrefix = prefix;
        if (contextPrefix.length > maxPrefixLength) {
            contextPrefix = '...' + contextPrefix.slice(-maxPrefixLength);
        }

        let contextSuffix = suffix;
        if (contextSuffix.length > maxSuffixLength) {
            contextSuffix = contextSuffix.slice(0, maxSuffixLength) + '...';
        }

        prompt += contextPrefix;
        prompt += '[CURSOR]';

        if (contextSuffix.trim()) {
            prompt += contextSuffix;
        }

        prompt += '\n\nComplete the code at [CURSOR]:';

        return prompt;
    }

    private cleanCompletion(text: string): string {
        text = text.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
        text = text.replace(/^(Complete|Completion|Here's|The completion):?\s*/i, '');

        const lines = text.split('\n');
        const codeLines = [];

        for (const line of lines) {
            if (line.match(/^(\/\/|#|\*|<!--)\s*(This|Here|The|Explanation)/i)) {
                break;
            }
            codeLines.push(line);
        }

        return codeLines.join('\n').trim();
    }

    private generateCacheKey(request: CompletionRequest): string {
        const contextSize = 200; // Limit context size for caching
        const prefixKey = request.prefix.slice(-contextSize);
        const suffixKey = request.suffix.slice(0, contextSize);

        return `${request.language}:${prefixKey}:${suffixKey}`;
    }

    clearCache(): void {
        this.cache.clear();
        this.requestQueue.clear();
    }

    dispose(): void {
        this.clearCache();
        this.groqClient = null;
        this.claudeClient = null;
    }
}