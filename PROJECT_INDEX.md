# Project Index: GitMsgOllama

**Generated:** 2026-03-27

## Project Overview

AI-powered commit message generator for VS Code. Supports 5 AI providers (OpenRouter, OpenAI, Google, Claude, Local/Ollama), 400+ models, smart caching, and enterprise security features.

- **Version:** 0.0.6
- **Type:** VS Code Extension (TypeScript)
- **License:** MIT

## 📁 Project Structure

```
gitmsgollama/
├── src/
│   ├── extension.ts         # Main extension entry point
│   ├── cache.ts             # Commit message caching
│   ├── conventionalCommits.ts # Conventional commits support
│   ├── diffFilter.ts        # Sensitive file filtering
│   ├── migration.ts         # Config migration
│   ├── modelPicker.ts       # Interactive model selector
│   ├── rateLimiter.ts       # API rate limiting
│   ├── secretManager.ts    # Secure API key storage
│   ├── securityIntegration.ts
│   ├── utils/
│   │   └── security.ts     # Security utilities
│   ├── commands/
│   │   └── providerCommands.ts
│   └── providers/
│       ├── apiClient.ts    # Multi-provider API calls
│       ├── providerManager.ts
│       └── types.ts
├── package.json
├── tsconfig.json
├── webpack.config.js
├── README.md
├── CHANGELOG.md
├── SECURITY.md
└── docs/
    └── PROVIDERS.md
```

## 🚀 Entry Points

- **Main Extension:** `src/extension.ts` - VS Code extension activation and command registration
- **Build:** `npm run compile` (webpack)
- **Package:** `npm run package` (production build)
- **Test:** `npm run test`

## Core Modules

### Module: extension.ts
- **Path:** `src/extension.ts`
- **Purpose:** Main extension entry point - registers commands, handles git diffs, generates commit messages
- **Key Functions:**
  - `activate()` - Extension initialization
  - `generateWithReview()` - Generates commit with review mode
  - `reviewAndApply()` - User review flow

### Module: cache.ts
- **Path:** `src/cache.ts`
- **Purpose:** Commit message caching with SHA-256 hash keys
- **Class:** `CommitMessageCache`
- **Methods:** `get()`, `set()`, `clear()`, `getSize()`

### Module: conventionalCommits.ts
- **Path:** `src/conventionalCommits.ts`
- **Purpose:** Conventional commits format validation and scope detection
- **Key Functions:**
  - `detectScopeFromDiff()` - Auto-detect scope from file paths
  - `validateCommitMessage()` - Validate format
  - `processCommitMessage()` - Main processing function

### Module: diffFilter.ts
- **Path:** `src/diffFilter.ts`
- **Purpose:** Filter sensitive files from git diffs
- **Key Functions:**
  - `filterDiff()` - Main filtering
  - `parseDiff()` - Parse diff into sections
  - `matchesPattern()` - Glob pattern matching

### Module: providers/apiClient.ts
- **Path:** `src/providers/apiClient.ts`
- **Purpose:** Multi-provider API request handling
- **Supports:** OpenRouter, OpenAI, Google, Claude, Local (Ollama/LM Studio)

### Module: modelPicker.ts
- **Path:** `src/modelPicker.ts`
- **Purpose:** Interactive model selection UI with pricing display

### Module: security utilities
- **Path:** `src/utils/security.ts`
- **Purpose:** Input validation, sanitization, API key validation

## 🔧 Configuration

- **package.json:** Extension metadata, commands, settings definitions
- **tsconfig.json:** TypeScript configuration
- **webpack.config.js:** Build configuration

### VS Code Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `gitmsgollama.provider` | `openrouter` | AI provider |
| `gitmsgollama.timeout` | `30` | API timeout (seconds) |
| `gitmsgollama.rateLimitPerMinute` | `10` | Rate limit |
| `gitmsgollama.enableCache` | `false` | Enable caching |
| `gitmsgollama.reviewBeforeApply` | `false` | Review mode |
| `gitmsgollama.conventionalCommits.enabled` | `false` | Conventional commits |

## 📚 Documentation

- **README.md:** Main documentation with setup, features, troubleshooting
- **docs/PROVIDERS.md:** Provider-specific setup instructions
- **SECURITY.md:** Security policies and best practices
- **CHANGELOG.md:** Version history

## 🧪 Test Coverage

- **Test Framework:** Mocha + @vscode/test-electron
- **Test Command:** `npm run test`
- **Test Location:** `out/test/`

## 🔗 Key Dependencies

- **axios** (^1.6.2) - HTTP client for API requests
- **minimatch** (^10.0.3) - Glob pattern matching
- **vscode** (^1.85.0) - VS Code API
- **typescript** (^5.3.3)
- **webpack** (^5.89.0)

## 📝 Quick Start

1. **Install:** `npm install`
2. **Build:** `npm run compile`
3. **Run in VS Code:** Press F5 (Start Debugging)
4. **Package:** `npm run package` → generates `.vsix` file

## Commands

| Command | Description |
|---------|-------------|
| `gitmsgollama.generateCommitMessage` | Generate commit message |
| `gitmsgollama.selectProvider` | Choose AI provider |
| `gitmsgollama.setApiKey` | Set API key |
| `gitmsgollama.selectModel` | Browse/select models |
| `gitmsgollama.testConnection` | Test provider connection |
| `gitmsgollama.clearCache` | Clear cached messages |

## Security Features

- SecretStorage API for encrypted API key storage
- Rate limiting (sliding window algorithm)
- Input validation and sanitization
- Sensitive file filtering (`.env`, `*.key`, etc.)
- Error message sanitization

## Architecture Notes

- Multi-provider system with provider-specific API clients
- Backward compatibility for single-provider config migration
- Supports both staged and unstaged changes
- Handles new/untracked files with synthetic diffs
- Review mode with accept/edit/regenerate/cancel options