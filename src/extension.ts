import * as vscode from 'vscode';
import { snipplyProvider } from './provider';
import { ApiKeyManager } from './apiKeyManager';
import { InlineCompletionProvider } from './inlineCompletionProvider';

let provider: snipplyProvider;
let inlineProvider: InlineCompletionProvider;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log('snipply Copilot is now active!');

    const apiKeyManager = new ApiKeyManager(context);
    provider = new snipplyProvider(apiKeyManager);
    inlineProvider = new InlineCompletionProvider(provider);

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'snipply.toggle';
    updateStatusBar();
    statusBarItem.show();

    const inlineCompletionDisposable = vscode.languages.registerInlineCompletionItemProvider(
        { pattern: '**' },
        inlineProvider
    );

    const toggleCommand = vscode.commands.registerCommand('snipply.toggle', () => {
        const config = vscode.workspace.getConfiguration('snipply');
        const enabled = config.get<boolean>('enabled', true);
        config.update('enabled', !enabled, vscode.ConfigurationTarget.Global);
        updateStatusBar();
        vscode.window.showInformationMessage(`snipply Copilot ${!enabled ? 'enabled' : 'disabled'}`);
    });

    const setApiKeyCommand = vscode.commands.registerCommand('snipply.setApiKey', async () => {
        const config = vscode.workspace.getConfiguration('snipply');
        const provider = config.get<string>('apiProvider', 'groq');
        
        let prompt = '';
        let placeholder = '';
        
        if (provider === 'groq') {
            prompt = 'Enter your Groq API key (Get one free at console.groq.com)';
            placeholder = 'gsk_...';
        }
        else {
            prompt = 'Enter your Claude API key (Paid service from console.anthropic.com)';
            placeholder = 'sk-ant-...';
        }
        
        const apiKey = await vscode.window.showInputBox({
            prompt,
            password: true,
            placeHolder: placeholder
        });

        if (apiKey) {
          //@ts-ignore
            await apiKeyManager.setApiKey(provider, apiKey);
            vscode.window.showInformationMessage(`${provider.toUpperCase()} API key saved successfully! 🚀`);
        }
    });

    const clearCacheCommand = vscode.commands.registerCommand('snipply.clearCache', () => {
        provider.clearCache();
        vscode.window.showInformationMessage('Completion cache cleared!');
    });

    const acceptSuggestionCommand = vscode.commands.registerCommand('snipply.acceptSuggestion', () => {
        inlineProvider.acceptCurrentSuggestion();
    });

    const dismissSuggestionCommand = vscode.commands.registerCommand('snipply.dismissSuggestion', () => {
        inlineProvider.dismissCurrentSuggestion();
    });

    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('snipply')) {
            updateStatusBar();
        }
    });

    context.subscriptions.push(
        inlineCompletionDisposable,
        toggleCommand,
        setApiKeyCommand,
        clearCacheCommand,
        acceptSuggestionCommand,
        dismissSuggestionCommand,
        configChangeDisposable,
        statusBarItem
    );
}

function updateStatusBar() {
    const config = vscode.workspace.getConfiguration('snipply');
    const enabled = config.get<boolean>('enabled', true);
    const provider = config.get<string>('apiProvider', 'groq');
    
    statusBarItem.text = `$(rocket) snipply ${enabled ? '$(check)' : '$(x)'} ${provider.toUpperCase()}`;
    statusBarItem.tooltip = `snipply Copilot is ${enabled ? 'enabled' : 'disabled'} (using ${provider.toUpperCase()})`;
}

export function deactivate() {
    if (provider) {
        provider.dispose();
    }
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}