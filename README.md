# GitMsgOllama

> **[Install from VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=btafoya.gitmsgollama)**

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/btafoya.gitmsgollama?style=for-the-badge&logo=visual-studio-code&logoColor=white&color=0078d7)](https://marketplace.visualstudio.com/items?itemName=btafoya.gitmsgollama)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/btafoya.gitmsgollama?style=for-the-badge&logo=visual-studio-code&logoColor=white&color=0078d7)](https://marketplace.visualstudio.com/items?itemName=btafoya.gitmsgollama)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/btafoya.gitmsgollama?style=for-the-badge&logo=visual-studio-code&logoColor=white&color=0078d7)](https://marketplace.visualstudio.com/items?itemName=btafoya.gitmsgollama)
[![GitHub License](https://img.shields.io/github/license/ChaseRichGit/gitmsgollama?style=for-the-badge&logo=github&logoColor=white&color=green)](https://github.com/btafoya/gitmsgollama/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/ChaseRichGit/gitmsgollama?style=for-the-badge&logo=github&logoColor=white&color=orange)](https://github.com/btafoya/gitmsgollama/issues)

---

![GitMsgOllama](https://raw.githubusercontent.com/btafoya/gitmsgollama/main/images/marketplace/GitMsgOllama.gif)

---

AI-powered commit message generator for VS Code. Get perfect commits in seconds using local AI with Ollama.

## Why GitMsgOllama?

**Better than writing commits yourself:**
- Consistent format across your team
- Never forget what you changed
- Follows best practices automatically
- Saves 5+ minutes per day

**Completely free and private:**
- Zero API costs - runs entirely on your machine
- Complete privacy - your code never leaves your computer
- Offline use - works without internet
- No account required - no API keys needed

## Quick Start (2 minutes)

1. Install [Ollama](https://ollama.ai/) (takes 1-2 minutes)
2. Run: `ollama pull qwen2.5-coder`
3. **[Install extension](https://marketplace.visualstudio.com/items?itemName=btafoya.gitmsgollama)**
4. Click the robot icon in your Git panel
5. Select "Local" provider
6. Done! **No API key, no credit card, no tracking.**

## Features

### Core Features
- **AI-Powered Commit Messages**: Uses AI to analyze your changes and generate meaningful commit messages
- **Local AI Only**: Privacy-first approach with Ollama for completely local operation
- **Conventional Commits Support**: Automatically follows conventional commit format with configurable types and scopes
- **Smart Caching**: Reuses recent commit messages for identical changes
- **Review Mode**: Preview and approve commit messages before applying
- **Customizable**: Configure AI model, prompt template, and conventional commit rules

### Privacy Features
- **Local Processing**: Your code never leaves your machine
- **No API Keys**: No account or credentials required
- **Offline Capable**: Works without internet
- **Open Source**: Audit the code yourself

---

## Local AI Setup

GitMsgOllama uses **Ollama** for completely local, private AI-powered commit messages.

### Supported Models

| Model | Size | RAM Required | Best For |
|-------|------|--------------|----------|
| `qwen2.5-coder` | ~4GB | 8GB | Code-focused, recommended |
| `codellama:7b` | 3.8GB | 8GB | Coding, fast responses |
| `mistral:7b` | 4.1GB | 8GB | General purpose, quality |
| `llama2:13b` | 7.3GB | 16GB | Higher quality |
| `deepseek-coder:6.7b` | 3.8GB | 8GB | Code-specific tasks |

### Setup Steps

1. **Install Ollama** from [Ollama.ai](https://ollama.ai/)

2. **Download a model**:
   ```bash
   ollama pull qwen2.5-coder
   # or
   ollama pull codellama:7b
   ```

3. **Install the extension** from VS Code Marketplace

4. **Configure in VS Code**:
   - Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Run: `GitMsgOllama: Select Provider`
   - Choose "Local"
   - Set base URL: `http://localhost:11434/v1` (default)
   - Run: `GitMsgOllama: Select Model`
   - Choose your downloaded model

5. **Start generating commit messages!**

For detailed setup instructions and troubleshooting, see [docs/PROVIDERS.md](docs/PROVIDERS.md).

## Requirements

### Hardware
- **Minimum**: 8GB RAM (for 7B models)
- **Recommended**: 16GB+ RAM (for 13B models)
- **GPU**: Optional but significantly faster (NVIDIA/AMD/Apple Silicon)

### Software
- VS Code
- Ollama (running locally)

## Usage

### Basic Usage

1. Make changes to your code
2. Stage your changes in Git (using Source Control panel)
3. Click the robot head icon in the Source Control message input box or title bar
4. The AI will analyze your changes and generate a commit message
5. Edit the message if needed and commit as usual

### Using Cache

When you generate a commit message for the same set of changes:

1. The extension checks if a cached message exists
2. If found, you'll see: "Found cached suggestion from X minutes ago"
3. Choose:
   - **Use Cached** - Apply the previously generated message
   - **Generate New** - Create a fresh message
   - **Dismiss** - Cancel the operation

To clear the cache:
- Command Palette → `GitMsgOllama: Clear Cache`

### Review Mode

Enable review mode to preview messages before applying:

```json
{
  "gitmsgollama.reviewBeforeApply": true
}
```

With review mode enabled:
1. Generate a commit message
2. Review the suggested message in a quick pick dialog
3. Choose to accept, edit, or regenerate

### Using Conventional Commits

The extension automatically generates conventional commit messages. Example output:

```
feat: add user authentication
fix(api): handle null response from endpoint
docs: update installation instructions
refactor(utils): simplify date formatting logic
```

Configure conventional commits:

```json
{
  "gitmsgollama.conventionalCommits.enabled": true,
  "gitmsgollama.conventionalCommits.types": ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
  "gitmsgollama.conventionalCommits.enableScopeDetection": true
}
```

## Extension Settings

### Core Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gitmsgollama.provider` | string | `local` | AI provider (local only) |
| `gitmsgollama.local.model` | string | `qwen2.5-coder` | Local model (Ollama) |
| `gitmsgollama.local.baseUrl` | string | `http://localhost:11434/v1` | Ollama server URL |
| `gitmsgollama.prompt` | string | (see below) | Custom prompt template (use `{changes}` placeholder) |
| `gitmsgollama.timeout` | number | `30` | API request timeout in seconds |

### Feature Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gitmsgollama.reviewBeforeApply` | boolean | `true` | Review messages before applying |
| `gitmsgollama.enableCache` | boolean | `true` | Enable commit message caching |
| `gitmsgollama.cacheSize` | number | `10` | Maximum cached messages |

### Conventional Commits Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gitmsgollama.conventionalCommits.enabled` | boolean | `true` | Enable conventional commits support |
| `gitmsgollama.conventionalCommits.types` | array | `["feat", "fix", "docs", ...]` | Allowed commit types |
| `gitmsgollama.conventionalCommits.scopes` | array | `[]` | Allowed scopes (empty = any) |
| `gitmsgollama.conventionalCommits.enableScopeDetection` | boolean | `true` | Auto-detect scope from file paths |
| `gitmsgollama.conventionalCommits.requireScope` | boolean | `false` | Require scope in messages |

### Default Prompt Template

The default prompt generates conventional commit messages:

```
Given these staged changes:
{changes}

Generate a commit message that follows these rules:
1. Start with a type (feat/fix/docs)
2. Keep it under 50 characters
3. Use imperative mood
```

You can customize this in settings to match your team's commit message style.

## Privacy

### What Data Stays Local

When you generate a commit message with local AI:

- **Git diff** of your staged changes stays on your machine
- **Your prompt template** with the diff stays local
- **No external servers** - nothing is sent to the internet
- **No API keys or accounts** required

### Complete Privacy

- Your code never leaves your machine
- No data is sent to external AI providers
- No telemetry or analytics
- No usage tracking
- Open source - audit the code yourself

## Troubleshooting

### "Connection refused"

- Ensure Ollama is running
- Check base URL matches: `http://localhost:11434/v1`
- Check firewall isn't blocking local connections

### "Model not found"

- Verify model is downloaded: Run `ollama list`
- Check model name matches exactly
- Download a model: `ollama pull qwen2.5-coder`

### "Response too slow"

- Use smaller model (7B instead of 13B)
- Enable GPU acceleration in Ollama settings
- Reduce context length
- Use quantized models

### "Out of memory"

- Use smaller model
- Close other applications
- Increase system swap/page file

For more detailed troubleshooting, see [docs/PROVIDERS.md](docs/PROVIDERS.md).

## Commands

| Command | Description |
|---------|-------------|
| `GitMsgOllama: Generate Commit Message` | Generate a commit message for staged changes |
| `GitMsgOllama: Select Provider` | Choose your AI provider (Local) |
| `GitMsgOllama: Set API Key` | Not required for Local (no API key needed) |
| `GitMsgOllama: Select Model` | Browse and select from available Ollama models |
| `GitMsgOllama: Test Provider Connection` | Test your Ollama configuration |
| `GitMsgOllama: Clear Cache` | Clear all cached commit messages |

## Development

Want to contribute? See development setup:

1. Clone the repository
2. Run `npm install`
3. Open in VS Code
4. Press F5 to start debugging
5. Make your changes and submit a PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Report bugs: [GitHub Issues](https://github.com/btafoya/gitmsgollama/issues)
- Security vulnerabilities: See [SECURITY.md](SECURITY.md)
- Feature requests: [GitHub Issues](https://github.com/btafoya/gitmsgollama/issues)

## Acknowledgments

This project is a fork of [GitMsgAI](https://github.com/ChaseRichGit/gitmsgai) by [Chase Rich](https://github.com/ChaseRichGit). The original project provided the foundation for this privacy-focused Ollama-only version.