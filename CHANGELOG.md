# Changelog

All notable changes to the "GitMsgAI" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.6] - 2025-10-13

### Added
- **New File Support**: Extension now generates commit messages for brand new untracked files
  - Automatically detects untracked files (status 7) that don't have diff output
  - Generates synthetic diff format showing entire file content as additions
  - Seamlessly integrates with existing diff processing for mixed changesets
  - Works for both staged and unstaged new files

## [0.0.5] - 2025-10-12

### Changed
- Clean repository history with single author identity
- Synchronized version numbering across repository and extension

## [0.0.1] - 2025-10-11

### Initial Release

This is the first release of **GitMsgAI** (formerly "AI Commit Message Generator"). The extension has been completely rebranded with a new name and icon.

#### Changed
- **Rebranding**: Extension renamed from "AI Commit Message Generator" to "GitMsgAI"
- **New Icon**: Changed from sparkle ✨ to robot head 🤖 icon
- **Icon Position**: Robot head icon now appears inline in the git message input box (like GitHub Copilot)
- **Command Names**: All commands now use "GitMsgAI:" prefix instead of "AI Commit:"
- **UI Updates**: All UI text, notifications, and output channels updated to "GitMsgAI"

#### Features (Inherited from Previous Versions)
- **Multi-Provider Support**: OpenRouter, OpenAI, Google, Claude, and Local (Ollama/LM Studio)
- **Interactive Model Selection**: Browse and select from 400+ AI models with pricing information
- **Conventional Commits**: Automatic formatting with configurable types and scopes
- **Smart Caching**: Reuse commit messages for identical changes
- **Review Mode**: Preview and approve messages before applying
- **Security Features**: Encrypted API key storage, rate limiting, sensitive file exclusion
- **Scope Detection**: Auto-detect scope from changed file paths

---

## Previous Version History (Pre-Rebrand)

## [0.6.0] - 2025-10-07 (Last version as "AI Commit")

### Changed
- **Default Settings**: Changed default behavior for better out-of-box experience
  - Conventional Commits: OFF by default (generates verbose, detailed messages by default)
  - Cache: OFF by default
  - Review Before Apply: OFF by default (applies directly to commit box)
  - Show Consent Warning: OFF by default
- **Settings Organization**: Reorganized settings for improved clarity
  - Moved "Conventional Commits" section to top of provider settings (after main settings)
  - Moved "Review Before Apply" and "Show Consent Warning" into Conventional Commits section
  - Added clear explanation: Conventional Commits generates short messages; default mode is verbose

### Fixed
- Updated fallback defaults in extension.ts to match new configuration defaults

## [0.5.7] - 2025-10-07

### Changed
- **Marketplace Preparation**: Updated extension category from "Other" to "SCM Providers" for better discoverability
- **Package Metadata**: Enhanced package.json with QNA, bugs, and homepage fields
- **Keywords**: Expanded keywords for improved marketplace search (automation, source-control, copilot, gpt, anthropic, gemini)
- **Documentation**: Added marketplace badges to README and placeholders for screenshots/demo assets
- **File Organization**: Moved development files to archive folder to clean up published package

### Added
- Placeholder documentation for required marketplace assets (screenshots, demo GIF)
- GitHub Discussions link for community questions
- Official bug tracker URL

### Fixed
- Cleaned up .vscodeignore to properly exclude development files while keeping essential documentation

## [0.5.6] - 2025-10-07

### Added
- **Multi-Provider Support**: Complete support for 5 AI providers (OpenRouter, OpenAI, Google, Claude, Local)
- **Provider Selection Command**: New `GitMsgAI: Select Provider` command for easy provider switching
- **Per-Provider Configuration**: Each provider maintains separate API key and model settings
- **Local AI Support**: Full support for Ollama and LM Studio for completely private, offline commit generation
- **Dynamic Model Fetching**: Automatic model discovery for Ollama and LM Studio providers
- **Provider Testing**: New `GitMsgAI: Test Provider Connection` command to verify setup

### Changed
- **Default Model**: Updated OpenRouter default to `google/gemini-2.0-flash-exp:free` (free tier)
- **Model Picker**: Now shows provider-specific models with accurate pricing and context limits
- **Documentation**: Complete rewrite of README with multi-provider setup guide
- **Configuration UI**: Reorganized settings by provider for better clarity

## [0.5.0] - 2025-10-07

### Added
- **Interactive Model Selection**: Browse and select models with pricing, context, and description
- **Auto-Update Models**: Automatic refresh of available models from provider APIs
- **Model Caching**: Cache model lists to reduce API calls (configurable interval)
- **Provider Metadata**: Display model pricing, context limits, and capabilities

## [0.4.0] - 2025-10-06

### Added
- **Enhanced Model Picker**: Complete redesign with search, filter, and detailed model information
- **Pricing Display**: Show cost per million tokens for informed model selection
- **Context Length Display**: View model context windows (e.g., "2M tokens")
- **Model Descriptions**: See detailed capabilities and characteristics for each model

### Changed
- **Model Selection UX**: Improved quick pick interface with better formatting and organization
- **Default Settings**: Updated recommended models and pricing information

## [0.3.0] - 2025-10-06

### Added
- **OpenRouter Model Picker**: New interactive model selection feature
  - Browse 400+ AI models directly from VSCode
  - View model details: pricing, context length, and descriptions
  - Search and filter models by name or ID
  - Automatic caching of models list (1 hour) to reduce API calls
  - One-click model selection updates configuration
  - Access via Command Palette: `GitMsgAI: Select Model`

## [0.2.4] - 2025-10-06

### Fixed
- **Generic message detection**: Fixed overly aggressive validation that was rejecting valid detailed commit messages
  - Now only checks for "commit message" text in short messages (2 lines or less)
  - Detailed multi-paragraph messages with comprehensive change descriptions are no longer falsely flagged as generic
  - Context-aware pattern matching prevents false positives

## [0.2.3] - 2025-10-06

### Fixed
- **Template placeholder detection**: Fixed pattern matching that was incorrectly flagging markdown bold formatting (`**text**`) as template placeholders
  - Changed regex from `/\{.*\}/` to `/\{[a-z_]+\}/i` to only match actual template variables like `{changes}`, `{variable}`
  - Allows proper use of markdown formatting in commit messages

## [0.2.2] - 2025-10-06

### Fixed
- **Commit message truncation**: Increased maximum commit message length from 500 to 5000 characters
  - Allows detailed multi-paragraph commit messages with comprehensive change descriptions
  - Messages are no longer prematurely truncated
- **Error detection**: Fixed overly broad error detection that was flagging valid commit messages containing the word "error"
  - Now only checks the first 100 characters for error patterns like "error:" or "error -" at the start
  - Prevents false positives when commit messages discuss "error handling" or "error sanitization"

## [0.2.1] - 2025-10-06

### Fixed
- **Placeholder replacement bug**: Fixed critical issue where `{changes}` text in diff content was causing validation errors
  - Changed from regex `.replace(/\{changes\}/g, sanitizedDiff)` to `split('{changes}').join(sanitizedDiff)`
  - Prevents diff content from being treated as regex patterns
  - Smart validation now allows `{changes}` text to appear in diff content without triggering errors

## [0.2.0] - 2025-10-06

### Added
- **Enhanced prompt template**: Updated default prompt with comprehensive instructions for detailed multi-paragraph commit messages
  - Format guidelines for grouping changes by category
  - Instructions to list files and use bullet points
  - Requirements for detailed body when 5+ files changed
  - Examples of proper multi-paragraph format

### Changed
- **Diff size limit**: Increased from 50KB to 500KB to leverage Gemini 2.5 Flash Lite's 2M context window
  - Allows sending full diffs for comprehensive analysis
  - Enables AI to generate detailed commit messages covering all changed files
- **Version logging**: Added version number and timestamp to extension activation logs for easier debugging

## [0.1.0] - 2025-10-06

### Added

#### Core Features
- **Commit message caching**: Reuse previously generated commit messages for identical diffs
  - Configurable cache size (default: 10 entries)
  - Shows "time ago" indicator for cached messages
  - Manual cache clearing via command palette
  - Stored in VS Code workspace state

- **Review mode**: Preview and approve commit messages before applying
  - Quick pick interface with Accept/Edit/Regenerate/Cancel options
  - Inline editing with validation
  - Configurable via `gitmsgai.reviewBeforeApply` setting

- **Request timeout & cancellation**:
  - Configurable timeout (default: 30 seconds)
  - User-cancellable progress notifications
  - Clear timeout error messages

- **Enhanced conventional commits support**:
  - Automatic scope detection from file paths
  - Configurable commit types and scopes
  - Breaking change detection (! suffix)
  - Message validation and reformatting
  - Optional scope requirement

- **Sensitive file exclusion**:
  - Default patterns for common sensitive files (`.env*`, `*.key`, `*.pem`, etc.)
  - Custom exclusion patterns via `gitmsgai.excludePatterns`
  - Warning notifications when sensitive files are detected
  - Prevents accidental credential leaks

#### Commands
- `GitMsgAI: Set OpenRouter API Key` - Securely store API key using SecretStorage
- `GitMsgAI: Clear Cache` - Clear all cached commit messages

#### Configuration Options
- `gitmsgai.reviewBeforeApply` - Enable review mode (default: false)
- `gitmsgai.timeout` - API request timeout in seconds (default: 30)
- `gitmsgai.rateLimitPerMinute` - Maximum API requests per minute (default: 10)
- `gitmsgai.showConsentWarning` - Show data privacy warning (default: true)
- `gitmsgai.enableCache` - Enable commit message caching (default: true)
- `gitmsgai.cacheSize` - Maximum cached messages (default: 10)
- `gitmsgai.excludePatterns` - Sensitive file exclusion patterns
- `gitmsgai.warnOnSensitiveFiles` - Show warnings for excluded files (default: true)
- `gitmsgai.conventionalCommits.enabled` - Enable conventional commits (default: true)
- `gitmsgai.conventionalCommits.types` - Allowed commit types
- `gitmsgai.conventionalCommits.scopes` - Allowed commit scopes
- `gitmsgai.conventionalCommits.enableScopeDetection` - Auto-detect scopes (default: true)
- `gitmsgai.conventionalCommits.requireScope` - Require scope in messages (default: false)

### Security

#### Critical Security Improvements
- **SecretStorage API integration**: API keys now stored with OS-level encryption
  - Windows: Credential Manager
  - macOS: Keychain
  - Linux: Secret Service API
  - No more plain text API keys in settings.json

- **Rate limiting**: Sliding window rate limiter to prevent API abuse
  - Configurable limits per minute
  - User-friendly error messages with countdown timers
  - Protects against accidental button mashing and infinite loops

- **Input validation & sanitization**:
  - API response structure validation
  - Commit message sanitization (removes control chars, limits length)
  - API key validation (format and presence checks)
  - Model name validation

- **Error message sanitization**:
  - API keys masked in error messages (`***`)
  - Sensitive file paths removed
  - Diff content sanitized in errors
  - Safe error wrapper utility

- **User consent & transparency**:
  - First-run consent warning explaining data sent to OpenRouter
  - Configurable warning display
  - Clear privacy documentation

### Changed

- **Improved prompt template**: Enhanced default prompt with better conventional commits guidance
  - More detailed type descriptions
  - Breaking change indicator instructions
  - Examples included in prompt

- **Better error handling**:
  - Specific handling for timeout errors
  - User cancellation detection
  - Network failure messages
  - Safe error propagation

- **Enhanced UI feedback**:
  - Progress notifications are now cancellable
  - Cache hit notifications show "time ago"
  - Clearer error messages
  - Review mode with visual indicators

### Breaking Changes

- **API Key Storage Migration**:
  - API keys are no longer stored in `settings.json`
  - Users must run `GitMsgAI: Set OpenRouter API Key` command to migrate
  - Old setting `gitmsgai.openRouterApiKey` is deprecated (still supported for backward compatibility)
  - **Action Required**: Run the setup command to securely store your API key

### Documentation

- **README.md**: Comprehensive update with all new features
  - Security features section
  - Updated extension settings documentation
  - Step-by-step setup guide with API key command
  - Privacy & security section explaining data flow
  - Usage examples for all new features
  - Advanced configuration examples
  - Troubleshooting guide

- **SECURITY.md**: New security documentation
  - Detailed security feature descriptions
  - Data privacy explanations
  - What data is sent to OpenRouter (explicit examples)
  - What data is stored locally
  - Security best practices for users and developers
  - Vulnerability reporting process
  - Compliance information (GDPR, corporate policies)

- **CHANGELOG.md**: This file!

### Fixed

- Potential information leakage through error messages
- API key exposure in settings.json
- Unbounded API request rates
- Missing validation for API responses
- Control characters in commit messages

## [0.0.1] - 2024-12-XX

### Added
- Initial release
- Basic AI-powered commit message generation
- OpenRouter API integration
- Configurable AI model selection
- Custom prompt templates
- Conventional commit format by default
- Sparkle button in Source Control view

[0.5.7]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.5.6...v0.5.7
[0.5.6]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.5.0...v0.5.6
[0.5.0]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.2.4...v0.3.0
[0.2.4]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/ChaseRichGit/gitmsgai/releases/tag/v0.0.1
