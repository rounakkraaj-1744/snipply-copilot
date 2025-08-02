# 🚀 Groq API Setup Guide

This guide will help you get started with Groq API for snipply Copilot - the fast, affordable alternative to expensive AI coding assistants!

## Why Choose Groq?

### 💰 **Cost-Effective**
- **Free Tier**: 30 requests per minute free
- **Paid Plans**: Starting at just $0.27 per million tokens
- **No Monthly Fees**: Pay only for what you use
- **10x Cheaper**: Than most other providers

### ⚡ **Lightning Fast**
- **LPU Technology**: Groq's Language Processing Units
- **Sub-second Response**: Typical response time < 500ms
- **Real-time Coding**: Perfect for inline completions

### 🎯 **Excellent for Code**
- **Llama 3 Models**: State-of-the-art coding performance
- **Context Aware**: Understands your codebase
- **Multiple Languages**: Python, JavaScript, Java, C++, Go, Rust, and more

## Step-by-Step Setup

### 1. Create Your Groq Account

1. Go to [console.groq.com](https://console.groq.com/)
2. Click "Sign Up" 
3. Use your email or GitHub account
4. Verify your email address

### 2. Get Your API Key

1. Once logged in, go to **API Keys** section
2. Click **"Create API Key"**
3. Give it a name like "snipply Copilot"
4. Copy the API key (starts with `gsk_`)
5. **Keep it safe!** You can't see it again

### 3. Configure snipply Copilot

1. Open VS Code with snipply Copilot installed
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type and select: **"snipply: Set API Key"**
4. Paste your Groq API key
5. Hit Enter

### 4. Choose Your Model

Open VS Code Settings (`Ctrl+,`) and search for "snipply":

#### **For Best Quality** (Recommended)
```json
{
  "snipply.groqModel": "llama3-70b-8192"
}
```

#### **For Fastest Speed**
```json
{
  "snipply.groqModel": "llama3-8b-8192"
}
```

#### **For Balanced Performance**
```json
{
  "snipply.groqModel": "mixtral-8x7b-32768"
}
```

### 5. Test Your Setup

1. Create a new file (e.g., `test.py`)
2. Start typing some code:
   ```python
   def fibonacci(n):
       if n <= 1:
           return n
       # snipply should suggest the next line here!
   ```
3. You should see inline suggestions appear
4. Press **Tab** to accept them

## Model Comparison

| Model | Parameters | Speed | Quality | Best For |
|-------|------------|-------|---------|----------|
| **llama3-70b-8192** | 70B | Medium | Excellent | Complex code, algorithms |
| **llama3-8b-8192** | 8B | Fast | Good | Simple completions, quick edits |
| **mixtral-8x7b-32768** | 8x7B | Fast | Very Good | Balanced usage |
| **gemma-7b-it** | 7B | Very Fast | Good | Lightweight tasks |

## Usage Tips

### 🎯 **Optimize for Your Needs**

**For Learning/Hobby Projects:**
- Use `llama3-8b-8192` for faster, free completions
- Set `maxTokens` to 50 for shorter suggestions

**For Professional Development:**
- Use `llama3-70b-8192` for highest quality
- Set `maxTokens` to 150 for more complete suggestions

**For Rapid Prototyping:**
- Use `mixtral-8x7b-32768` for balanced performance
- Lower `debounceMs` to 200 for quicker suggestions

### ⚙️ **Performance Settings**

```json
{
  // Fast & Efficient Setup
  "snipply.groqModel": "llama3-8b-8192",
  "snipply.maxTokens": 80,
  "snipply.debounceMs": 250,
  "snipply.temperature": 0.1,
  
  // High Quality Setup  
  "snipply.groqModel": "llama3-70b-8192",
  "snipply.maxTokens": 120,
  "snipply.debounceMs": 400,
  "snipply.temperature": 0.05
}
```

## Free Tier Limits

### What You Get Free:
- **30 requests per minute**
- **6,000 tokens per request**
- **All models available**
- **No credit card required**

### Making the Most of Free Tier:
1. **Increase debounce delay** to 500ms to reduce requests
2. **Lower max tokens** to 50-80 for efficiency  
3. **Use caching** (automatically enabled)
4. **Choose faster models** like `llama3-8b-8192`

## Troubleshooting

### ❌ "Invalid API Key"
- Double-check you copied the full key (starts with `gsk_`)
- Make sure there are no extra spaces
- Try creating a new API key

### ❌ "Rate Limit Exceeded" 
- You've hit the 30 requests/minute limit
- Wait a minute or upgrade to paid plan
- Increase `debounceMs` setting to reduce requests

### ❌ "No Completions Appearing"
- Check the status bar shows snipply is enabled
- Try typing more context (at least 2-3 lines)
- Check VS Code Developer Console for errors

### ❌ "Slow Responses"
- Switch to faster model like `llama3-8b-8192`
- Check your internet connection
- Try different Groq servers (automatic)

## Billing & Pricing

### Free Forever:
- 30 requests/minute
- Perfect for learning and small projects

### Paid Plans:
- **Pay-as-you-go**: $0.27 per 1M tokens (input) / $0.27 per 1M tokens (output)
- **No monthly fees**
- **Only pay for what you use**
- **Volume discounts available**

### Cost Calculator:
- **1 completion ≈ 100 tokens**
- **1,000 completions ≈ $0.03**
- **10,000 completions ≈ $0.27**

Much cheaper than GitHub Copilot at $10/month!

## Advanced Tips

### 🔥 **Pro Configuration**
```json
{
  "snipply.enabled": true,
  "snipply.apiProvider": "groq",
  "snipply.groqModel": "llama3-70b-8192",
  "snipply.maxTokens": 100,
  "snipply.debounceMs": 300,
  "snipply.temperature": 0.1
}
```

### 🚀 **Speed Demon Configuration**  
```json
{
  "snipply.groqModel": "llama3-8b-8192",
  "snipply.maxTokens": 60,
  "snipply.debounceMs": 200,
  "snipply.temperature": 0.05
}
```

### 🎯 **Quality First Configuration**
```json
{
  "snipply.groqModel": "llama3-70b-8192", 
  "snipply.maxTokens": 150,
  "snipply.debounceMs": 500,
  "snipply.temperature": 0.02
}
```

## Get Help

- **Groq Documentation**: [docs.groq.com](https://docs.groq.com)
- **Groq Discord**: [discord.gg/groq](https://discord.gg/groq)
- **Groq Status**: [status.groq.com](https://status.groq.com)

Happy coding with Groq! 🚀