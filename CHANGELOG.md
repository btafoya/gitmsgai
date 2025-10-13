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
- **New Icon**: Changed from sparkle to robot head icon
- **Icon Position**: Robot head icon now appears inline in the git message input box
- **Command Names**: All commands now use "GitMsgAI:" prefix
- **UI Updates**: All UI text, notifications, and output channels updated to "GitMsgAI"

#### Features
- **Multi-Provider Support**: OpenRouter, OpenAI, Google, Claude, and Local (Ollama/LM Studio)
- **Interactive Model Selection**: Browse and select from 400+ AI models with pricing information
- **Conventional Commits**: Automatic formatting with configurable types and scopes
- **Smart Caching**: Reuse commit messages for identical changes
- **Review Mode**: Preview and approve messages before applying
- **Security Features**: Encrypted API key storage, rate limiting, sensitive file exclusion
- **Scope Detection**: Auto-detect scope from changed file paths

---

## Previous Version History (Pre-Rebrand as "GitMsgAI")

The following versions were released under the original name "AI Commit Message Generator" before the rebrand to "GitMsgAI" at version 0.0.1.

## [0.0.0.6] - 2025-10-07

### Changed
- **Default Settings**: Changed default behavior for better out-of-box experience
  - Conventional Commits: OFF by default (generates verbose, detailed messages by default)
  - Cache: OFF by default
  - Review Before Apply: OFF by default (applies directly to commit box)
  - Show Consent Warning: OFF by default
- **Settings Organization**: Reorganized settings for improved clarity
  - Moved "Conventional Commits" section to top of provider settings
  - Moved "Review Before Apply" and "Show Consent Warning" into Conventional Commits section
  - Added clear explanation: Conventional Commits generates short messages; default mode is verbose

### Fixed
- Updated fallback defaults in extension.ts to match new configuration defaults

## [0.0.0.5] - 2025-10-07

### Changed
- **Marketplace Preparation**: Updated extension category from "Other" to "SCM Providers"
- **Package Metadata**: Enhanced package.json with QNA, bugs, and homepage fields
- **Keywords**: Expanded keywords for improved marketplace search
- **Documentation**: Added marketplace badges to README and placeholders for screenshots/demo assets
- **File Organization**: Moved development files to archive folder

### Added
- Placeholder documentation for required marketplace assets
- GitHub Discussions link for community questions
- Official bug tracker URL

### Fixed
- Cleaned up .vscodeignore to properly exclude development files

## [0.0.0.4] - 2025-10-07

### Added
- **Multi-Provider Support**: Complete support for 5 AI providers (OpenRouter, OpenAI, Google, Claude, Local)
- **Provider Selection Command**: New command for easy provider switching
- **Per-Provider Configuration**: Each provider maintains separate API key and model settings
- **Local AI Support**: Full support for Ollama and LM Studio for completely private, offline commit generation
- **Dynamic Model Fetching**: Automatic model discovery for Ollama and LM Studio providers
- **Provider Testing**: New command to verify setup

### Changed
- **Default Model**: Updated OpenRouter default to `google/gemini-2.0-flash-exp:free`
- **Model Picker**: Now shows provider-specific models with accurate pricing and context limits
- **Documentation**: Complete rewrite of README with multi-provider setup guide
- **Configuration UI**: Reorganized settings by provider for better clarity

## [0.0.0.3] - 2025-10-07

### Added
- **Interactive Model Selection**: Browse and select models with pricing, context, and description
- **Auto-Update Models**: Automatic refresh of available models from provider APIs
- **Model Caching**: Cache model lists to reduce API calls
- **Provider Metadata**: Display model pricing, context limits, and capabilities
- **Enhanced Model Picker**: Complete redesign with search, filter, and detailed model information
- **Pricing Display**: Show cost per million tokens for informed model selection
- **Context Length Display**: View model context windows (e.g., "2M tokens")
- **Model Descriptions**: See detailed capabilities and characteristics for each model

### Changed
- **Model Selection UX**: Improved quick pick interface with better formatting and organization
- **Default Settings**: Updated recommended models and pricing information

## [0.0.0.2] - 2025-10-06

### Added
- **OpenRouter Model Picker**: New interactive model selection feature
  - Browse 400+ AI models directly from VSCode
  - View model details: pricing, context length, and descriptions
  - Search and filter models by name or ID
  - Automatic caching of models list (1 hour) to reduce API calls
  - One-click model selection updates configuration

### Fixed
- **Generic message detection**: Fixed overly aggressive validation rejecting valid detailed commit messages
- **Template placeholder detection**: Fixed pattern matching incorrectly flagging markdown bold formatting
- **Commit message truncation**: Increased maximum length from 500 to 5000 characters
- **Error detection**: Fixed overly broad error detection flagging valid commit messages containing "error"
- **Placeholder replacement bug**: Fixed critical issue where `{changes}` text in diff content caused validation errors

## [0.0.0.1] - 2025-10-06

### Added

#### Core Features
- **Enhanced prompt template**: Comprehensive instructions for detailed multi-paragraph commit messages
- **Commit message caching**: Reuse previously generated commit messages for identical diffs
  - Configurable cache size (default: 10 entries)
  - Shows "time ago" indicator for cached messages
  - Manual cache clearing via command palette
- **Review mode**: Preview and approve commit messages before applying
  - Quick pick interface with Accept/Edit/Regenerate/Cancel options
  - Inline editing with validation
- **Request timeout & cancellation**: Configurable timeout with user-cancellable progress notifications
- **Enhanced conventional commits support**:
  - Automatic scope detection from file paths
  - Configurable commit types and scopes
  - Breaking change detection (! suffix)
  - Message validation and reformatting
- **Sensitive file exclusion**:
  - Default patterns for common sensitive files
  - Custom exclusion patterns
  - Warning notifications when sensitive files are detected

### Changed
- **Diff size limit**: Increased from 50KB to 500KB to leverage larger context windows
- **Version logging**: Added version number and timestamp to extension activation logs

### Security

- **SecretStorage API integration**: API keys now stored with OS-level encryption
  - Windows: Credential Manager
  - macOS: Keychain
  - Linux: Secret Service API
  - No more plain text API keys in settings.json
- **Rate limiting**: Sliding window rate limiter to prevent API abuse
- **Input validation & sanitization**: API response validation, commit message sanitization
- **Error message sanitization**: API keys masked in error messages
- **User consent & transparency**: First-run consent warning explaining data sent to providers

### Fixed
- Potential information leakage through error messages
- API key exposure in settings.json
- Unbounded API request rates
- Missing validation for API responses
- Control characters in commit messages

[0.0.6]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/ChaseRichGit/gitmsgai/compare/v0.0.1...v0.0.5
[0.0.1]: https://github.com/ChaseRichGit/gitmsgai/releases/tag/v0.0.1
