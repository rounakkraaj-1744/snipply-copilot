# Snipply Copilot

An AI-powered code assistant for Visual Studio Code that provides intelligent code completion, generation, and assistance using Groq's fast LLM inference. Your intelligent coding companion that understands context and helps you code faster.

## Features

- **Inline Code Completion**: Real-time code suggestions as you type
- **Code Generation**: Generate code from natural language descriptions  
- **Code Explanation**: Get detailed explanations of selected code
- **Code Refactoring**: Improve code quality with AI suggestions
- **Code Fixing**: Automatically fix bugs and syntax errors
- **Multiple Language Support**: Works with all popular programming languages
- **Fast & Responsive**: Powered by Groq's lightning-fast inference

## Installation

1. Install the extension from the VS Code marketplace
2. Get your Groq API key from [Groq Console](https://console.groq.com/)
3. Configure the API key in VS Code settings (`snipplyCopilot.apiKey`)

## Configuration

Open VS Code settings and configure:

- `snipplyCopilot.apiKey`: Your Groq API key
- `snipplyCopilot.model`: Choose from available Groq models
- `snipplyCopilot.enableInlineCompletion`: Enable/disable inline completions
- `snipplyCopilot.completionDelay`: Delay before triggering completions (ms)
- `snipplyCopilot.maxTokens`: Maximum tokens for completions

## Usage

### Inline Completion
Simply start typing and Snipply Copilot will provide intelligent code suggestions.

### Commands
- `Ctrl+Shift+G` (Cmd+Shift+G on Mac): Generate code from description
- `Ctrl+Shift+E` (Cmd+Shift+E on Mac): Explain selected code
- Right-click on selected code for refactoring and fixing options

### Context Menu
Right-click on selected code to access:
- Explain Code
- Refactor Code  
- Fix Code
