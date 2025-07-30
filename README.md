# Groq Code Assistant

An AI-powered code assistant for Visual Studio Code that provides intelligent code completion, generation, and assistance using Groq's fast LLM inference.

## Features

- **Inline Code Completion**: Real-time code suggestions as you type
- **Code Generation**: Generate code from natural language descriptions
- **Code Explanation**: Get detailed explanations of selected code
- **Code Refactoring**: Improve code quality with AI suggestions
- **Code Fixing**: Automatically fix bugs and syntax errors
- **Multiple Language Support**: Works with all popular programming languages

## Installation

1. Install the extension from the VS Code marketplace
2. Get your Groq API key from [Groq Console](https://console.groq.com/)
3. Configure the API key in VS Code settings (`groqAssistant.apiKey`)

## Configuration

Open VS Code settings and configure:

- `groqAssistant.apiKey`: Your Groq API key
- `groqAssistant.model`: Choose from available Groq models
- `groqAssistant.enableInlineCompletion`: Enable/disable inline completions
- `groqAssistant.completionDelay`: Delay before triggering completions (ms)
- `groqAssistant.maxTokens`: Maximum tokens for completions

## Usage

### Inline Completion
Simply start typing and the extension will provide intelligent code suggestions.

### Commands
- `Ctrl+Shift+G` (Cmd+Shift+G on Mac): Generate code from description
- `Ctrl+Shift+E` (Cmd+Shift+E on Mac): Explain selected code
- Right-click on selected code for refactoring and fixing options

### Context Menu
Right-click on selected code to access:
- Explain Code
- Refactor Code
- Fix Code

## Supported Models

- `llama-3.1-70b-versatile`: Best for complex code generation
- `llama-3.1-8b-instant`: Fast model for inline completions
- `mixtral-8x7b-32768`: Good balance of speed and quality
- `gemma2-9b-it`: Efficient for most coding tasks

## Requirements

- Visual Studio Code 1.74.0 or higher
- Groq API key
- Internet connection

## Privacy

This extension sends code context to Groq's API for processing. Please review Groq's privacy policy and ensure compliance with your organization's policies.

## License

MIT License
