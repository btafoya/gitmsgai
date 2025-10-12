# GitMsgAI

> **[Install from VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=ChaseRich.gitmsgai)**

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/ChaseRich.gitmsgai?style=for-the-badge&logo=visual-studio-code&logoColor=white&color=0078d7)](https://marketplace.visualstudio.com/items?itemName=ChaseRich.gitmsgai)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/ChaseRich.gitmsgai?style=for-the-badge&logo=visual-studio-code&logoColor=white&color=0078d7)](https://marketplace.visualstudio.com/items?itemName=ChaseRich.gitmsgai)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/ChaseRich.gitmsgai?style=for-the-badge&logo=visual-studio-code&logoColor=white&color=0078d7)](https://marketplace.visualstudio.com/items?itemName=ChaseRich.gitmsgai)
[![GitHub License](https://img.shields.io/github/license/ChaseRichGit/gitmsgai?style=for-the-badge&logo=github&logoColor=white&color=green)](https://github.com/ChaseRichGit/gitmsgai/blob/main/LICENSE)
[![GitHub Issues](https://img.shields.io/github/issues/ChaseRichGit/gitmsgai?style=for-the-badge&logo=github&logoColor=white&color=orange)](https://github.com/ChaseRichGit/gitmsgai/issues)

---

![GitMsgAI](https://raw.githubusercontent.com/ChaseRichGit/gitmsgai/main/images/marketplace/GitMsgAI.gif)

---

AI-powered commit message generator for VS Code. Get perfect commits in seconds using any of 5 AI providers, 400+ models, or completely free local AI.

## 🚀 Why GitMsgAI?

**Better than writing commits yourself:**
- ✅ Consistent format across your team
- ✅ Never forget what you changed
- ✅ Follows best practices automatically
- ✅ Saves 5+ minutes per day

**Better than other AI commit tools:**
- ✅ **5 providers** vs just 1 (most tools only support OpenAI)
- ✅ **Free local models** with Ollama/LM Studio (zero API costs)
- ✅ **Smart caching** saves 80%+ on API calls
- ✅ **Enterprise security** (rate limiting, sensitive file exclusion)
- ✅ **400+ models** to choose from

**Better pricing:**
- 🆓 **$0** - Use Ollama or LM Studio (completely free forever)
- 💵 **$0.05/1M tokens** - GPT-5 Nano (latest GPT model)
- 🎁 **Free tier** - OpenRouter Gemini (no credit card needed)

## ⚡ Quick Start (30 seconds)

### Option 1: Free Tier (No Credit Card Required)
1. **[Install extension](https://marketplace.visualstudio.com/items?itemName=ChaseRich.gitmsgai)**
2. Click the 🤖 robot icon in your Git panel
3. Extension will prompt for API key → Get free key from [OpenRouter](https://openrouter.ai/)
4. Paste key → Done! Uses free Gemini model by default

### Option 2: Completely Free Forever (Local AI)
1. Install [Ollama](https://ollama.ai/) (takes 2 minutes)
2. Run: `ollama pull qwen2.5-coder`
3. **[Install extension](https://marketplace.visualstudio.com/items?itemName=ChaseRich.gitmsgai)**
4. Click 🤖 robot icon → Select "Local" provider → Done!

**No API key, no credit card, no tracking. Just works.**

## ✨ Features

### 🎯 Core Features
- **AI-Powered Commit Messages**: Uses AI to analyze your changes and generate meaningful commit messages
- **Multi-Provider Support**: Choose from 5 AI providers (OpenRouter, OpenAI, Google, Claude, Local)
- **Interactive Model Picker**: Browse and select from 400+ AI models with pricing and context info
- **Conventional Commits Support**: Automatically follows conventional commit format with configurable types and scopes
- **Smart Caching**: Reuses recent commit messages for identical changes to save API costs
- **Review Mode**: Preview and approve commit messages before applying
- **Customizable**: Configure AI model, prompt template, and conventional commit rules

### 🔒 Security Features
- **SecretStorage API** for secure API key management (OS-level encryption)
- **Rate limiting** to prevent API abuse
- **Sensitive file exclusion** patterns
- **Input validation** and sanitization
- **User consent warnings** for external API usage

---

### Model Selection
![Model Picker](https://raw.githubusercontent.com/ChaseRichGit/gitmsgai/main/images/marketplace/Model.Picker.png)

### Provider Selection
![Provider Selection](https://raw.githubusercontent.com/ChaseRichGit/gitmsgai/main/images/marketplace/Provider.Picker.png)

### Review Mode
![Review Mode Placeholder](https://raw.githubusercontent.com/ChaseRichGit/gitmsgai/main/images/marketplace/GitMsgAI-Confirm.png)

---

## Multi-Provider Support

GitMsgAI supports **5 different AI providers**, giving you the flexibility to choose the best option for your workflow:

### Supported Providers

| Provider | API Key Required | Model Selection | Best For |
|----------|-----------------|-----------------|----------|
| **OpenRouter** | Yes | 400+ models from multiple providers | Maximum flexibility, one API for many models |
| **OpenAI** | Yes | GPT-5 Nano (latest, most efficient) | Cutting-edge performance |
| **Google** | Yes | Gemini 2.5 Flash Lite Preview (newest) | Latest model, best pricing |
| **Claude** | Yes | Sonnet 4.5 (current flagship) | Top-tier coding and reasoning |
| **Local** | No | GPT-OSS-20B, Qwen 2.5 Coder (Free) | Privacy, no API costs, offline use |

### Quick Setup by Provider

#### OpenRouter (Default)
1. Get your API key from [OpenRouter](https://openrouter.ai/)
2. Run: `GitMsgAI: Set API Key`
3. Browse 400+ models with `GitMsgAI: Select Model`
4. **Best for**: Access to many models through one API

#### OpenAI
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Run: `GitMsgAI: Select Provider` → Choose "OpenAI"
3. Run: `GitMsgAI: Set API Key`
4. **Best for**: Enterprise use, consistent quality

#### Google (Gemini)
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Run: `GitMsgAI: Select Provider` → Choose "Google"
3. Run: `GitMsgAI: Set API Key`
4. **Best for**: Large diffs, free tier available

#### Claude (Anthropic)
1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Run: `GitMsgAI: Select Provider` → Choose "Claude"
3. Run: `GitMsgAI: Set API Key`
4. **Best for**: Natural commit messages, code understanding

#### Local Models (Ollama/LM Studio)
1. Install [Ollama](https://ollama.ai/) or [LM Studio](https://lmstudio.ai/)
2. Download a model (recommended: `qwen2.5-coder:latest`, `gpt-oss-20b`, `codellama`)
3. Run: `GitMsgAI: Select Provider` → Choose "Local"
4. Set your base URL (default: `http://localhost:11434/v1` for Ollama)
5. **Best for**: Privacy, no API costs, offline use

### Switching Providers

You can easily switch between providers at any time:

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run: `GitMsgAI: Select Provider`
3. Choose your desired provider
4. Set the API key if needed (not required for Local)
5. Select a model for the new provider

Each provider maintains its own API key and model selection, so you can switch back and forth without reconfiguring.

For detailed setup instructions and troubleshooting, see [docs/PROVIDERS.md](docs/PROVIDERS.md).

## Requirements

You need an API key from one of the supported providers (OpenRouter, OpenAI, Google, Claude) or a local AI setup (Ollama/LM Studio). See the [Multi-Provider Support](#multi-provider-support) section for details on each provider.

## Setup

### First-Time Setup

1. **Install the extension** from the VS Code Marketplace

2. **Select your AI provider** (optional - defaults to OpenRouter):
   - Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Run: `GitMsgAI: Select Provider`
   - Choose from: OpenRouter, OpenAI, Google, Claude, or Local
   - See [Multi-Provider Support](#multi-provider-support) for provider details

3. **Set up your API key**:
   - Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Run: `GitMsgAI: Set API Key`
   - Enter your API key for the selected provider
   - Your key will be securely stored using VS Code's SecretStorage API
   - Note: Not required for Local provider (Ollama/LM Studio)

4. **Select your AI model**:
   - Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Run: `GitMsgAI: Select Model`
   - Browse available models for your selected provider
   - Select your preferred model

5. **Configure your preferences** (optional):
   - Customize the prompt template
   - Configure conventional commit types and scopes

### Selecting a Model

The extension includes an interactive model picker that shows available models for your selected provider:

**How to use:**
1. Command Palette → `GitMsgAI: Select Model`
2. Browse the list with search/filter capabilities
3. View model details (varies by provider):
   - **Context length** (e.g., "2M tokens" for large context windows)
   - **Pricing** (cost per million tokens, when available)
   - **Description** (model capabilities and characteristics)
4. Select a model to automatically update your configuration

**Provider-specific notes:**
- **OpenRouter**: Browse 400+ models with auto-updating list (every 24 hours by default)
- **OpenAI**: See GPT-4, GPT-3.5 Turbo, and other OpenAI models
- **Google**: Choose from Gemini Pro, Flash, and other Google models
- **Claude**: Select from Claude 3.5 Sonnet, Opus, Haiku, and other versions
- **Local**: Pick from common Ollama/LM Studio models or enter a custom model name

**Recommended Models by Provider (Cheapest First):**

| Provider | Model | Pricing (Input/Output per 1M tokens) | Context | Best For |
|----------|-------|--------------------------------------|---------|----------|
| **Local (LM Studio)** | `openai/gpt-oss-20b` | **Free** | 32k tokens | Privacy, offline, no API costs |
| **Local (Ollama)** | `qwen2.5-coder:latest` | **Free** | 32k tokens | Code-focused, completely free |
| **OpenRouter** | `google/gemini-2.0-flash-exp:free` | **Free** | 1M tokens | Free tier, large context |
| **OpenAI** | `gpt-5-nano` | $0.05 / $0.40 | 128k tokens | Latest GPT-5, ultra-efficient |
| **Google** | `gemini-2.5-flash-lite-preview` | $0.10 / $0.40 | 2M tokens | Latest Gemini, advanced reasoning |
| **Claude** | `claude-3-5-haiku-20241022` | $0.80 / $4.00 | 200k tokens | Budget-friendly Claude |
| **Claude** | `claude-sonnet-4-5-20250929` | $3.00 / $15.00 | 200k tokens | Latest flagship, agentic coding |
| **OpenAI** | `gpt-5-mini` | $0.25 / $2.00 | 128k tokens | Balanced GPT-5 performance |
| **Google** | `gemini-2.5-flash-preview` | $0.30 / $1.20 | 2M tokens | Full Gemini 2.5 with thinking |
| **Claude** | `claude-opus-4-1-20250514` | $15.00 / $75.00 | 200k tokens | Maximum intelligence |

**💡 Cost-saving tips:**
- **Best value**: Use Local models (Ollama/LM Studio) with GPT-OSS-20B for completely free commit messages
- **Cheapest API**: OpenAI GPT-5 Nano at $0.05/$0.40 per 1M tokens (latest generation)
- **Free tier**: OpenRouter's `google/gemini-2.0-flash-exp:free` or Google AI Studio's free quota
- **Latest tech**: GPT-5 Nano ($0.05/$0.40) and Gemini 2.5 Flash Lite ($0.10/$0.40) offer cutting-edge performance at low cost
- **For quality**: Claude Sonnet 4.5 ($3/$15) is the best coding model for agentic workflows
- **OpenRouter advantage**: Access 400+ models with live pricing through one API - prices shown are what you pay (no markup)

## Usage

### Basic Usage

1. Make changes to your code
2. Stage your changes in Git (using Source Control panel)
3. Click the robot head icon (🤖) in the Source Control message input box or title bar
4. The AI will analyze your changes and generate a commit message
5. Edit the message if needed and commit as usual

### Using Cache

When you generate a commit message for the same set of changes:

1. The extension checks if a cached message exists
2. If found, you'll see: "Found cached suggestion from X minutes ago"
3. Choose:
   - **Use Cached** - Apply the previously generated message (no API call)
   - **Generate New** - Create a fresh message (uses API)
   - **Dismiss** - Cancel the operation

To clear the cache:
- Command Palette → `GitMsgAI: Clear Cache`

### Review Mode

Enable review mode to preview messages before applying:

```json
{
  "gitmsgai.reviewBeforeApply": true
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
  "gitmsgai.conventionalCommits.enabled": true,
  "gitmsgai.conventionalCommits.types": ["feat", "fix", "docs", "style", "refactor", "test", "chore"],
  "gitmsgai.conventionalCommits.enableScopeDetection": true
}
```

## Extension Settings

### Core Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gitmsgai.provider` | string | `openrouter` | AI provider (openrouter, openai, google, claude, local) |
| `gitmsgai.openrouter.model` | string | `google/gemini-2.0-flash-exp:free` | OpenRouter model (free tier recommended) |
| `gitmsgai.openai.model` | string | `gpt-5-nano` | OpenAI model |
| `gitmsgai.google.model` | string | `gemini-2.5-flash-lite-preview` | Google Gemini model |
| `gitmsgai.claude.model` | string | `claude-sonnet-4-5-20250929` | Claude model |
| `gitmsgai.local.model` | string | `openai/gpt-oss-20b` | Local model (Ollama/LM Studio) |
| `gitmsgai.prompt` | string | (see below) | Custom prompt template (use `{changes}` placeholder) |
| `gitmsgai.timeout` | number | `30` | API request timeout in seconds |

### Security & Privacy Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gitmsgai.rateLimitPerMinute` | number | `10` | Maximum API requests per minute |
| `gitmsgai.showConsentWarning` | boolean | `true` | Show warning about external API usage |
| `gitmsgai.excludePatterns` | array | `[".env*", "*.key", ...]` | Glob patterns for sensitive files to exclude from diffs |
| `gitmsgai.warnOnSensitiveFiles` | boolean | `true` | Show warning when sensitive files are excluded |

### Feature Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gitmsgai.reviewBeforeApply` | boolean | `true` | Review messages before applying |
| `gitmsgai.enableCache` | boolean | `true` | Enable commit message caching |
| `gitmsgai.cacheSize` | number | `10` | Maximum cached messages |
| `gitmsgai.autoUpdateModels` | boolean | `true` | Automatically update models list from OpenRouter |
| `gitmsgai.modelsUpdateInterval` | number | `24` | How often to update models list (in hours) |

### Conventional Commits Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `gitmsgai.conventionalCommits.enabled` | boolean | `true` | Enable conventional commits support |
| `gitmsgai.conventionalCommits.types` | array | `["feat", "fix", "docs", ...]` | Allowed commit types |
| `gitmsgai.conventionalCommits.scopes` | array | `[]` | Allowed scopes (empty = any) |
| `gitmsgai.conventionalCommits.enableScopeDetection` | boolean | `true` | Auto-detect scope from file paths |
| `gitmsgai.conventionalCommits.requireScope` | boolean | `false` | Require scope in messages |

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

## Security Features

### Secure API Key Storage

Your OpenRouter API key is stored securely using VS Code's SecretStorage API:

- **Encrypted Storage**: Keys are encrypted at the OS level
- **No Plain Text**: Keys never appear in settings.json
- **Cross-Platform**: Works on Windows (Credential Manager), macOS (Keychain), Linux (Secret Service)

### Rate Limiting

Protects against accidental API abuse:

- Default: 10 requests per minute
- Configurable via `gitmsgai.rateLimitPerMinute`
- Shows clear error when limit reached with countdown timer

### Input Validation & Sanitization

All data is validated before processing:

- API responses are validated for correct structure
- Commit messages are sanitized to remove dangerous characters
- Error messages are scrubbed to prevent leaking sensitive data

### User Consent

On first use, the extension shows a consent dialog explaining:

- What data is sent to OpenRouter (git diff)
- How to disable the warning
- Privacy implications

## Privacy & Security

### What Data is Sent to AI Providers

When you generate a commit message, the extension sends data to your selected AI provider:

- **Git diff** of your staged changes (code differences only)
- **Your prompt template** with the diff substituted
- **No personal information** (name, email, etc.)
- **No API keys or secrets** (filtered out by default)

**Note for Local provider**: When using Ollama or LM Studio, all data stays on your machine. Nothing is sent to external servers.

Example of what gets sent:

```
Given these staged changes:
diff --git a/src/app.ts b/src/app.ts
index 123..456
--- a/src/app.ts
+++ b/src/app.ts
@@ -10,3 +10,4 @@
-console.log('old');
+console.log('new');

Generate a commit message that follows these rules:
1. Start with a type (feat/fix/docs)
2. Keep it under 50 characters
3. Use imperative mood
```

### What Data is Stored Locally

- **API Keys**: Encrypted in OS-level secure storage (SecretStorage) - one per provider
- **Provider Settings**: Selected provider, models, and base URLs in VS Code settings
- **Cache**: Recent commit messages stored in VS Code workspace state
- **Settings**: User preferences in VS Code settings
- **Consent Flag**: Whether you've acknowledged the data privacy warning

### Sensitive File Protection

By default, certain files are excluded from being sent to the AI:

- `.env*` files (environment variables)
- `*.key`, `*.pem`, `*.p12`, `*.pfx` (certificate files)
- `credentials.json` (credential files)
- `secrets.*`, `*.secret` (secret files)
- Files in `**/secrets/**` directories

If sensitive files are detected in your staged changes, you'll see a warning.

## Advanced Configuration

### Custom Prompt for Team Conventions

Example: Jira ticket integration

```json
{
  "gitmsgai.prompt": "Given these staged changes:\n{changes}\n\nGenerate a commit message in this format:\n[JIRA-XXX] Brief description\n\nDetailed explanation of changes."
}
```

### Fine-tune Rate Limiting

For CI/CD or bulk operations:

```json
{
  "gitmsgai.rateLimitPerMinute": 20
}
```

### Aggressive Caching

Reduce API costs by increasing cache size:

```json
{
  "gitmsgai.enableCache": true,
  "gitmsgai.cacheSize": 50
}
```

### Custom Conventional Commit Types

For monorepos or specific workflows:

```json
{
  "gitmsgai.conventionalCommits.types": [
    "feat",
    "fix",
    "docs",
    "build",
    "ci",
    "perf",
    "hotfix"
  ],
  "gitmsgai.conventionalCommits.scopes": [
    "api",
    "ui",
    "auth",
    "db"
  ],
  "gitmsgai.conventionalCommits.requireScope": true
}
```

## Commands

| Command | Description |
|---------|-------------|
| `GitMsgAI: Generate Commit Message` | Generate a commit message for staged changes |
| `GitMsgAI: Select Provider` | Choose your AI provider (OpenRouter, OpenAI, Google, Claude, Local) |
| `GitMsgAI: Set API Key` | Securely store your API key for the selected provider |
| `GitMsgAI: Select Model` | Browse and select from available models for your provider |
| `GitMsgAI: Test Provider Connection` | Test your provider configuration and API key |
| `GitMsgAI: Clear Cache` | Clear all cached commit messages |

## Troubleshooting

### "Please set your API key"

- Run `GitMsgAI: Set API Key` command
- Make sure you've selected the correct provider with `GitMsgAI: Select Provider`
- Verify you have an API key from your selected provider
- Note: Local provider (Ollama/LM Studio) does not require an API key

### "Failed to generate commit message"

- Run `GitMsgAI: Test Provider Connection` to diagnose the issue
- Check your internet connection (not needed for Local provider)
- Verify your API key is valid:
  - OpenRouter: [openrouter.ai](https://openrouter.ai/)
  - OpenAI: [platform.openai.com](https://platform.openai.com/)
  - Google: [makersuite.google.com](https://makersuite.google.com/)
  - Claude: [console.anthropic.com](https://console.anthropic.com/)
- For Local provider: Ensure Ollama/LM Studio is running
- Increase `gitmsgai.timeout` if requests are timing out

### "Rate limit exceeded"

- Wait for the cooldown period (shown in error message)
- Or increase `gitmsgai.rateLimitPerMinute`

### Provider-specific issues

**OpenRouter**: Check [openrouter.ai/status](https://openrouter.ai/) for outages

**OpenAI**: Verify you have credits/billing set up at [platform.openai.com](https://platform.openai.com/)

**Google**: Ensure API is enabled in your Google Cloud project

**Claude**: Check your usage limits at [console.anthropic.com](https://console.anthropic.com/)

**Local**: Ensure Ollama/LM Studio is running and the model is downloaded

### Cache not working

- Ensure `gitmsgai.enableCache` is `true`
- Cache only works for identical diffs
- Run `GitMsgAI: Clear Cache` to reset

For more detailed troubleshooting, see [docs/PROVIDERS.md](docs/PROVIDERS.md).

## Development

Want to contribute? See development setup:

1. Clone the repository
2. Run `npm install`
3. Open in VS Code
4. Press F5 to start debugging
5. Make your changes and submit a PR

## Privacy Policy

This extension:

- Only sends git diffs to your selected AI provider when you click the generate button
- Stores your API keys securely using OS-level encryption (one per provider)
- Supports fully local AI models (Ollama/LM Studio) for complete privacy
- Does not collect telemetry or analytics
- Does not track your usage
- Open source - audit the code yourself!

**Privacy by Provider:**
- **OpenRouter, OpenAI, Google, Claude**: Data sent to external APIs (see their privacy policies)
- **Local (Ollama/LM Studio)**: All data stays on your machine, completely private

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Report bugs: [GitHub Issues](https://github.com/ChaseRichGit/gitmsgai/issues)
- Security vulnerabilities: See [SECURITY.md](SECURITY.md)
- Feature requests: [GitHub Issues](https://github.com/ChaseRichGit/gitmsgai/issues)
