# snipply Copilot

A VS Code extension that provides AI-powered inline code completion and suggestions, similar to GitHub Copilot. **Powered primarily by Groq's fast and affordable API** with optional Claude support.

## ✨ Why Groq?

- **🚀 Lightning Fast**: Groq's LPU technology provides incredibly fast inference
- **💰 Cost-Effective**: Much more affordable than other providers
- **🆓 Free Tier**: Generous free tier to get started
- **🎯 Code-Optimized**: Excellent performance on coding tasks
- **🔓 Open Models**: Uses open-source models like Llama 3

## Features

- **Inline Code Completion**: Get AI-powered code suggestions as you type
- **Tab to Accept**: Press Tab to accept suggestions, just like GitHub Copilot
- **Groq-Powered**: Fast, affordable completions using Groq's API
- **Smart Caching**: Efficient caching system to reduce API calls
- **Language Support**: Works with all programming languages supported by VS Code
- **Highly Configurable**: Customize models, temperature, debounce timing, and more
- **Context-Aware**: Understands your code context for better suggestions

## Quick Start

### 1. Get Your Free Groq API Key

1. Visit [console.groq.com](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key (starts with `gsk_`)

### 2. Install & Setup

1. Clone this repository
2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. Open the project in VS Code and press `F5` to launch the extension

4. Set your API key:
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
   - Run `snipply: Set API Key`
   - Paste your Groq API key

5. Start coding and enjoy AI completions! 🎉

## Configuration

Open VS Code settings and search for "snipply" to configure:

### Core Settings
- **snipply.enabled**: Enable/disable the extension (default: true)
- **snipply.apiProvider**: Choose "groq" or "claude" (default: "groq" - recommended!)
- **snipply.groqModel**: Choose your Groq model (default: "llama3-70b-8192")
- **snipply.maxTokens**: Maximum tokens for completion (default: 100)
- **snipply.debounceMs**: Debounce delay in milliseconds (default: 300)
- **snipply.temperature**: Temperature for generation (default: 0.1)

### Recommended Groq Models
- **llama3-70b-8192** (default) - Best quality, great for complex code
- **llama3-8b-8192** - Faster, good for simple completions
- **mixtral-8x7b-32768** - Good balance of speed and quality
- **gemma-7b-it** - Lightweight and fast

💡 **Tip**: Start with `llama3-8b-8192` for faster responses, upgrade to `llama3-70b-8192` for better quality!

## Usage

1. **Enable the extension**: The extension is enabled by default
2. **Start typing code**: As you type, snipply will suggest completions
3. **Accept suggestions**: Press `Tab` to accept the suggestion
4. **Dismiss suggestions**: Press `Escape` to dismiss the current suggestion

## Commands

- `snipply: Toggle snipply Copilot` - Enable/disable the extension
- `snipply: Set API Key` - Set your API key
- `snipply: Clear Completion Cache` - Clear the completion cache

## Keybindings

- `Tab` - Accept current suggestion (when suggestion is visible)
- `Escape` - Dismiss current suggestion (when suggestion is visible)

## Status Bar

The status bar shows:
- snipply status (enabled/disabled)
- Current API provider
- Click to toggle on/off

## Groq vs Claude Comparison

| Feature | Groq | Claude |
|---------|------|---------|
| **Cost** | 🟢 Very Affordable | 🔴 Expensive |
| **Speed** | 🟢 Lightning Fast | 🟡 Moderate |
| **Free Tier** | 🟢 Generous Free Tier | 🔴 No Free Tier |
| **Code Quality** | 🟢 Excellent | 🟢 Excellent |
| **Setup** | 🟢 Easy & Free | 🔴 Requires Payment |

**Recommendation**: Use Groq for the best balance of cost, speed, and quality!

## Supported Models

### 🚀 Groq Models (Recommended)
- **llama3-70b-8192** - Best quality, 70B parameters
- **llama3-8b-8192** - Fast and efficient, 8B parameters  
- **mixtral-8x7b-32768** - Mixture of experts model
- **gemma-7b-it** - Google's Gemma model
- **llama3-groq-70b-8192-tool-use-preview** - Latest with tool use
- **llama3-groq-8b-8192-tool-use-preview** - Faster tool use variant

### 💰 Claude Models (Optional)
- **claude-3-sonnet-20240229** - High quality but expensive

## Performance Features

- **Smart Caching**: Completions are cached to reduce API calls
- **Debouncing**: Rapid typing doesn't trigger excessive requests
- **Context-Aware**: Only suggests completions when contextually appropriate
- **Request Queuing**: Prevents duplicate requests for the same context
- **Efficient Context**: Limited context window for optimal performance

## File Structure

```
snipply-copilot/
├── src/
│   ├── extension.ts           # Main extension entry point
│   ├── provider.ts            # AI completion provider
│   ├── inlineCompletionProvider.ts  # VS Code inline completion integration
│   └── apiKeyManager.ts       # Secure API key management
├── package.json               # Extension manifest
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## Development

### Building

```bash
npm install
npm run compile
```

### Testing

1. Open the project in VS Code
2. Press F5 to launch a new Extension Development Host window
3. Test the extension in the new window

### Packaging

```bash
npm install -g vsce
vsce package
```

## Troubleshooting

### No Completions Appearing

1. Check if the extension is enabled (status bar should show green checkmark)
2. Verify API key is set correctly
3. Check VS Code Developer Console for errors
4. Ensure you're typing in a supported file type

### API Errors

1. Verify your API key is valid
2. Check your API quota/limits
3. Try switching between Groq and Claude providers
4. Clear the completion cache

### Performance Issues

1. Increase debounce delay in settings
2. Reduce max tokens setting
3. Clear completion cache regularly

## Privacy & Security

- API keys are stored securely using VS Code's SecretStorage
- Code context is sent to AI providers for completion generation
- Completions are cached locally to reduce API calls
- No code is stored permanently by the extension

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0
- Initial release
- Support for Groq and Claude APIs
- Inline completion with Tab acceptance
- Configurable settings
- Secure API key storage
- Smart caching system

## Support

For issues and feature requests, please create an issue on the GitHub repository.

## Acknowledgments

- Inspired by GitHub Copilot
- Built with VS Code Extension API
- Powered by Groq and Anthropic APIs