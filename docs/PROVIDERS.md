# AI Provider Guide

This guide provides detailed information about each supported AI provider, including setup instructions, model recommendations, pricing, and troubleshooting.

## Table of Contents

- [Provider Overview](#provider-overview)
- [OpenRouter](#openrouter)
- [OpenAI](#openai)
- [Google (Gemini)](#google-gemini)
- [Claude (Anthropic)](#claude-anthropic)
- [Local (Ollama/LM Studio)](#local-ollamалm-studio)
- [Pricing Comparison](#pricing-comparison)
- [Model Recommendations](#model-recommendations)
- [Troubleshooting](#troubleshooting)

## Provider Overview

GitMsgAI supports 5 different AI providers, each with unique strengths:

| Feature | OpenRouter | OpenAI | Google | Claude | Local |
|---------|-----------|---------|--------|--------|-------|
| **API Key Required** | Yes | Yes | Yes | Yes | No |
| **Number of Models** | 400+ | 10+ | 5+ | 5+ | Unlimited |
| **Free Tier** | Via providers | No | Yes | No | Yes (all) |
| **Max Context** | Up to 2M+ | 128k | 2M | 200k | Varies |
| **Privacy** | External API | External API | External API | External API | Fully Local |
| **Setup Difficulty** | Easy | Easy | Easy | Easy | Medium |
| **Best For** | Flexibility | Enterprise | Large diffs | Code quality | Privacy |

## OpenRouter

OpenRouter aggregates 400+ AI models from various providers through a single API. This is the default and most flexible option.

### Benefits

- **One API for everything**: Access models from OpenAI, Anthropic, Google, Meta, and more
- **Wide model selection**: 400+ models to choose from
- **Transparent pricing**: See costs upfront
- **Free models available**: Many models have free tiers
- **No vendor lock-in**: Easily switch between models

### Getting Your API Key

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up or log in
3. Navigate to [Keys](https://openrouter.ai/keys)
4. Click "Create Key"
5. Copy your API key (starts with `sk-or-v1-`)

### Setup in GitMsgAI

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run: `GitMsgAI: Select Provider`
3. Choose "OpenRouter"
4. Run: `GitMsgAI: Set API Key`
5. Paste your OpenRouter API key

### Recommended Models

| Model | Context | Cost | Best For |
|-------|---------|------|----------|
| `google/gemini-2.5-flash-lite` | 2M tokens | Free | Large diffs, default choice |
| `mistralai/mistral-7b-instruct` | 32k tokens | $0.06/$0.06 per 1M tokens | Fast, cost-effective |
| `anthropic/claude-3-5-sonnet` | 200k tokens | $3/$15 per 1M tokens | High quality, coding |
| `openai/gpt-4-turbo` | 128k tokens | $10/$30 per 1M tokens | Premium quality |
| `meta-llama/llama-3.1-8b-instruct` | 128k tokens | Free | Fast, free |

### Pricing

- Visit [OpenRouter Models](https://openrouter.ai/models) for current pricing
- Pricing shown in the model picker
- Pay only for what you use
- Many free models available

### Troubleshooting

**"Invalid API key"**
- Verify your key starts with `sk-or-v1-`
- Check key at [OpenRouter Keys](https://openrouter.ai/keys)
- Ensure key has credits (add funds if needed)

**"Rate limit exceeded"**
- OpenRouter has rate limits per model
- Try a different model
- Wait a few minutes and retry

**"Model not found"**
- Update models list: restart VS Code
- Model might be deprecated - select a new one
- Check [OpenRouter Models](https://openrouter.ai/models) for availability

## OpenAI

OpenAI provides GPT models, known for high quality and reliability.

### Benefits

- **High quality**: Industry-leading language models
- **Reliable**: Enterprise-grade uptime and support
- **Well-documented**: Extensive documentation and community
- **Consistent**: Predictable output quality
- **Vision support**: GPT-4 Vision for image analysis

### Getting Your API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Name your key (e.g., "GitMsgAI VSCode")
6. Copy your API key (starts with `sk-`)
7. **Important**: You must add billing information and credits

### Setup in GitMsgAI

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run: `GitMsgAI: Select Provider`
3. Choose "OpenAI"
4. Run: `GitMsgAI: Set API Key`
5. Paste your OpenAI API key

### Available Models

| Model | Context | Cost | Best For |
|-------|---------|------|----------|
| `gpt-4-turbo` | 128k tokens | $10/$30 per 1M tokens | Best quality, large diffs |
| `gpt-4` | 8k tokens | $30/$60 per 1M tokens | High quality, standard diffs |
| `gpt-3.5-turbo` | 16k tokens | $0.50/$1.50 per 1M tokens | Cost-effective, fast |
| `gpt-4o` | 128k tokens | $5/$15 per 1M tokens | Balanced cost/quality |
| `gpt-4o-mini` | 128k tokens | $0.15/$0.60 per 1M tokens | Cheapest GPT-4 quality |

### Pricing

- View current pricing: [OpenAI Pricing](https://openai.com/pricing)
- Billed based on input/output tokens
- Commit messages typically use < 1000 tokens per request
- **Estimated cost per commit**: $0.001 - $0.03 (depending on model and diff size)

### Billing Setup

OpenAI requires billing information:

1. Go to [OpenAI Billing](https://platform.openai.com/account/billing/overview)
2. Add payment method
3. Add credits or set up auto-recharge
4. Monitor usage in the billing dashboard

### Troubleshooting

**"Incorrect API key provided"**
- Verify key starts with `sk-`
- Check key hasn't been revoked at [API Keys](https://platform.openai.com/api-keys)
- Ensure key was copied completely

**"You exceeded your current quota"**
- Add credits: [Billing](https://platform.openai.com/account/billing/overview)
- Set up auto-recharge
- Check usage limits for your account tier

**"Rate limit reached"**
- OpenAI limits requests per minute
- Wait 60 seconds and retry
- Upgrade to higher tier for more requests

## Google (Gemini)

Google's Gemini models offer large context windows and a generous free tier.

### Benefits

- **Huge context**: Up to 2M tokens
- **Free tier**: Generous free quota
- **Fast**: Low latency responses
- **Multimodal**: Supports text, images, and code
- **Competitive pricing**: Lower cost than GPT-4

### Getting Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy your API key

### Setup in GitMsgAI

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run: `GitMsgAI: Select Provider`
3. Choose "Google"
4. Run: `GitMsgAI: Set API Key`
5. Paste your Google AI API key

### Available Models

| Model | Context | Cost | Best For |
|-------|---------|------|----------|
| `gemini-1.5-pro` | 2M tokens | $1.25/$5.00 per 1M tokens | Large diffs, complex changes |
| `gemini-1.5-flash` | 1M tokens | $0.075/$0.30 per 1M tokens | Fast, cost-effective |
| `gemini-1.0-pro` | 32k tokens | $0.50/$1.50 per 1M tokens | Standard commits |

### Free Tier

Google offers a generous free tier:

- **15 requests per minute** (RPM)
- **1 million tokens per minute** (TPM)
- **1,500 requests per day** (RPD)
- Perfect for individual developers

### Pricing

- View current pricing: [Google AI Pricing](https://ai.google.dev/pricing)
- Input and output tokens billed separately
- Free tier covers most individual use
- **Estimated cost per commit**: Free (within tier) or $0.001 - $0.01

### Troubleshooting

**"API key not valid"**
- Verify key in [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure Generative Language API is enabled
- Check project has billing enabled (even for free tier)

**"Resource exhausted"**
- You've hit the free tier limit
- Wait until quota resets (usually daily)
- Enable billing for higher limits

**"Permission denied"**
- API might not be enabled for your project
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Enable "Generative Language API"

## Claude (Anthropic)

Anthropic's Claude models excel at natural language and code understanding.

### Benefits

- **High quality**: Excellent for natural language
- **Code-focused**: Strong coding capabilities
- **Large context**: Up to 200k tokens
- **Safety**: Built-in safety guardrails
- **Helpful**: Produces clear, well-structured output

### Getting Your API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to [API Keys](https://console.anthropic.com/settings/keys)
4. Click "Create Key"
5. Name your key (e.g., "GitMsgAI")
6. Copy your API key (starts with `sk-ant-`)

### Setup in GitMsgAI

1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run: `GitMsgAI: Select Provider`
3. Choose "Claude"
4. Run: `GitMsgAI: Set API Key`
5. Paste your Anthropic API key

### Available Models

| Model | Context | Cost | Best For |
|-------|---------|------|----------|
| `claude-3-5-sonnet-20241022` | 200k tokens | $3/$15 per 1M tokens | Best balance, recommended |
| `claude-3-opus-20240229` | 200k tokens | $15/$75 per 1M tokens | Highest quality, complex changes |
| `claude-3-haiku-20240307` | 200k tokens | $0.25/$1.25 per 1M tokens | Fast, cost-effective |

### Pricing

- View current pricing: [Anthropic Pricing](https://www.anthropic.com/pricing)
- Input and output tokens billed separately
- Requires billing setup
- **Estimated cost per commit**: $0.003 - $0.02

### Billing Setup

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Navigate to "Billing"
3. Add payment method
4. Purchase credits or set auto-reload
5. Monitor usage in dashboard

### Troubleshooting

**"Invalid API key"**
- Verify key starts with `sk-ant-`
- Check key at [API Keys](https://console.anthropic.com/settings/keys)
- Ensure key wasn't revoked

**"Credit balance too low"**
- Add credits in [Billing](https://console.anthropic.com/settings/billing)
- Set up auto-reload
- Check current balance

**"Rate limit exceeded"**
- Anthropic limits requests per minute
- Wait and retry
- Check rate limits in your account tier

## Local (Ollama/LM Studio)

Run AI models completely locally on your machine for maximum privacy and zero API costs.

### Benefits

- **Complete privacy**: Data never leaves your machine
- **No API costs**: Free to use
- **Offline use**: Works without internet
- **No rate limits**: Limited only by your hardware
- **Full control**: Choose any model, customize settings
- **No API key needed**: No account required

### Requirements

- **Hardware**:
  - Minimum: 8GB RAM for 7B models
  - Recommended: 16GB+ RAM for 13B models
  - GPU: Optional but significantly faster (NVIDIA/AMD/Apple Silicon)
- **Disk Space**: 4-20GB per model
- **OS**: Windows, macOS, or Linux

### Option 1: Ollama (Recommended)

Ollama is the easiest way to run local models.

#### Installation

1. Download from [Ollama.ai](https://ollama.ai/)
2. Install the application
3. Download a model:
   ```bash
   ollama pull codellama:7b
   # or
   ollama pull mistral:7b
   # or
   ollama pull llama2:13b
   ```

#### Setup in GitMsgAI

1. Ensure Ollama is running (it starts automatically)
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run: `GitMsgAI: Select Provider`
4. Choose "Local"
5. Set base URL: `http://localhost:11434/v1` (default)
6. Run: `GitMsgAI: Select Model`
7. Choose your downloaded model

#### Recommended Ollama Models

| Model | Size | RAM Required | Best For |
|-------|------|--------------|----------|
| `codellama:7b` | 3.8GB | 8GB | Coding, fast responses |
| `mistral:7b` | 4.1GB | 8GB | General purpose, quality |
| `llama2:13b` | 7.3GB | 16GB | Higher quality |
| `deepseek-coder:6.7b` | 3.8GB | 8GB | Code-specific tasks |
| `phi3:mini` | 2.3GB | 4GB | Lightweight, very fast |

### Option 2: LM Studio

LM Studio provides a GUI for managing local models.

#### Installation

1. Download from [LMStudio.ai](https://lmstudio.ai/)
2. Install the application
3. Open LM Studio
4. Browse and download models from the built-in catalog
5. Start the local server (Settings → Local Server → Start)

#### Setup in GitMsgAI

1. Start LM Studio's local server
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run: `GitMsgAI: Select Provider`
4. Choose "Local"
5. Set base URL: `http://localhost:1234/v1` (default for LM Studio)
6. Run: `GitMsgAI: Select Model`
7. Enter the model name from LM Studio

#### Recommended LM Studio Models

Search for these in LM Studio:

- `TheBloke/CodeLlama-7B-Instruct-GGUF`
- `TheBloke/Mistral-7B-Instruct-GGUF`
- `TheBloke/deepseek-coder-6.7B-instruct-GGUF`

### Performance Tips

- **Use quantized models**: GGUF Q4 or Q5 models for best speed/quality balance
- **GPU acceleration**: Enable in Ollama/LM Studio settings
- **Model size**: Start with 7B models, upgrade to 13B if you have RAM
- **Context length**: Reduce if responses are slow

### Troubleshooting

**"Connection refused"**
- Ensure Ollama/LM Studio is running
- Check base URL matches the server port
  - Ollama: `http://localhost:11434/v1`
  - LM Studio: `http://localhost:1234/v1`
- Check firewall isn't blocking local connections

**"Model not found"**
- Verify model is downloaded in Ollama/LM Studio
- Check model name matches exactly
- Run `ollama list` to see available models

**"Response too slow"**
- Use smaller model (7B instead of 13B)
- Enable GPU acceleration
- Reduce context length
- Use quantized models (Q4_K_M)

**"Out of memory"**
- Use smaller model
- Close other applications
- Increase system swap/page file

## Pricing Comparison

Approximate costs per 1,000 commit messages (assuming 500 tokens input, 100 tokens output per commit):

| Provider | Model | Cost per 1K Commits | Free Tier |
|----------|-------|-------------------|-----------|
| OpenRouter | `gemini-2.5-flash-lite` | $0 | Yes (via Google) |
| OpenRouter | `mistral-7b-instruct` | $0.04 | No |
| OpenRouter | `claude-3-5-sonnet` | $2.40 | No |
| OpenRouter | `gpt-4-turbo` | $6.80 | No |
| OpenAI | `gpt-4o-mini` | $0.15 | No |
| OpenAI | `gpt-3.5-turbo` | $0.40 | No |
| OpenAI | `gpt-4-turbo` | $6.80 | No |
| Google | `gemini-1.5-flash` | $0.07 | Yes (generous) |
| Google | `gemini-1.5-pro` | $1.13 | Yes (generous) |
| Claude | `claude-3-haiku` | $0.28 | No |
| Claude | `claude-3-5-sonnet` | $2.40 | No |
| Local | Any model | $0 | Yes (all) |

**Notes:**
- Costs are estimates based on published pricing
- Actual costs vary by diff size
- Free tiers have usage limits
- Local models have no ongoing costs but require hardware

## Model Recommendations

### By Use Case

#### Individual Developer (Free)
1. **Google Gemini Flash** via OpenRouter/Google
   - Large context, fast, completely free
2. **Local Ollama** with `codellama:7b`
   - Privacy-focused, no API costs

#### Small Team (Budget)
1. **OpenAI GPT-4o-mini**
   - Good quality, low cost ($0.15/1K commits)
2. **Google Gemini Flash**
   - Very cheap, fast

#### Enterprise (Quality)
1. **Claude 3.5 Sonnet**
   - Best for code, natural language
2. **OpenAI GPT-4 Turbo**
   - Consistent quality, enterprise support

#### Privacy-Conscious
1. **Local Ollama/LM Studio**
   - Complete privacy, no external API
2. **Self-hosted OpenAI-compatible**
   - Full control over data

### By Diff Size

#### Small diffs (< 100 lines)
- Any model works well
- Use fastest/cheapest option

#### Medium diffs (100-500 lines)
- **Google Gemini Flash**: Fast, handles well
- **Claude Haiku**: Good balance
- **GPT-3.5 Turbo**: Cost-effective

#### Large diffs (500+ lines)
- **Google Gemini Pro**: 2M context
- **Claude 3.5 Sonnet**: 200k context
- **GPT-4 Turbo**: 128k context

### By Speed Requirement

#### Fastest (< 2 seconds)
1. Local models with GPU
2. GPT-3.5 Turbo
3. Claude Haiku

#### Balanced (2-5 seconds)
1. Gemini Flash
2. GPT-4o-mini
3. Mistral 7B

#### Quality over speed (5-10 seconds)
1. Claude 3.5 Sonnet
2. GPT-4 Turbo
3. Gemini Pro

## Troubleshooting

### General Issues

#### Extension not working after provider switch

1. Run `GitMsgAI: Test Provider Connection`
2. Verify API key is set for current provider
3. Check model is selected for current provider
4. Restart VS Code

#### "No API key found"

1. Verify you're on the right provider: `GitMsgAI: Select Provider`
2. Set API key: `GitMsgAI: Set API Key`
3. Check SecretStorage isn't corrupted (restart VS Code)

#### API requests timing out

1. Increase timeout: Settings → `gitmsgai.timeout` (default: 30 seconds)
2. Try a faster model
3. Check internet connection (cloud providers)
4. Check local server status (local provider)

### Provider-Specific Issues

#### OpenRouter

**"Model requires payment"**
- Some models need credits even on OpenRouter
- Add credits at [OpenRouter](https://openrouter.ai/)
- Switch to a free model

**"Moderation flagged"**
- Your diff triggered content moderation
- Remove sensitive/inappropriate content
- Try a different model

#### OpenAI

**"This model is deprecated"**
- OpenAI retired the model
- Switch to current model (e.g., `gpt-4-turbo`)
- Update model list

**"Organization limit reached"**
- Your OpenAI organization hit its limit
- Check [Usage](https://platform.openai.com/usage)
- Upgrade plan or wait for reset

#### Google

**"API not enabled"**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Enable "Generative Language API"

**"Quota exceeded"**
- Wait for quota reset (usually midnight PT)
- Enable billing for higher limits
- Reduce request frequency

#### Claude

**"Overloaded"**
- Anthropic's servers are busy
- Wait a few minutes and retry
- Try during off-peak hours

**"Context too long"**
- Your diff exceeded 200k tokens
- Split into multiple commits
- Use a model with larger context (Gemini)

#### Local

**"Model loading failed"**
- Not enough RAM for model
- Try smaller model
- Close other applications
- Check model is fully downloaded

**"Connection reset"**
- Ollama/LM Studio crashed
- Restart the application
- Check system resources

### Still Having Issues?

1. **Check provider status pages**:
   - OpenRouter: [status.openrouter.ai](https://status.openrouter.ai/)
   - OpenAI: [status.openai.com](https://status.openai.com/)
   - Google: [status.cloud.google.com](https://status.cloud.google.com/)
   - Anthropic: [status.anthropic.com](https://status.anthropic.com/)

2. **Enable debug logging**:
   - Check VS Code's Output panel
   - Select "GitMsgAI" from dropdown
   - Look for error details

3. **Test with simple diff**:
   - Stage a single small file change
   - Try generating commit message
   - Isolate whether issue is size-related

4. **Report bugs**:
   - GitHub Issues: [gitmsgai/issues](https://github.com/ChaseRichGit/gitmsgai/issues)
   - Include: provider, model, error message, VS Code version

## Best Practices

### Security

- **Never commit API keys**: Ensure `.env` files are in `.gitignore`
- **Rotate keys regularly**: Create new API keys every few months
- **Use minimal permissions**: API keys should have minimal required permissions
- **Monitor usage**: Check provider dashboards for unexpected usage
- **Use Local for sensitive code**: Keep proprietary code completely private

### Cost Optimization

1. **Enable caching**: Reuse messages for identical diffs
2. **Use free tiers**: Gemini Flash, free OpenRouter models
3. **Choose right model**: Don't use GPT-4 for simple commits
4. **Local for high volume**: No per-request costs
5. **Monitor spending**: Set up billing alerts

### Performance

1. **Fast models for frequent commits**: GPT-3.5, Gemini Flash, Claude Haiku
2. **GPU for local models**: 10x faster inference
3. **Reduce rate limits**: Adjust `gitmsgai.rateLimitPerMinute`
4. **Keep diffs focused**: Smaller, focused commits = faster generation

### Quality

1. **Use Claude/GPT-4 for important commits**: Release notes, major features
2. **Review before committing**: Enable `gitmsgai.reviewBeforeApply`
3. **Customize prompts**: Tailor to your team's commit style
4. **Consistent provider**: Stick with one for consistent style

## Migration Guide

### Migrating from old OpenRouter-only setup

The extension automatically migrates your configuration:

1. Old `gitmsgai.model` → `gitmsgai.openrouter.model`
2. Old API key → OpenRouter provider key
3. Provider set to OpenRouter
4. Notification shown on first run

### Switching providers

Your settings are preserved per provider:

```json
{
  "gitmsgai.provider": "openai",
  "gitmsgai.openrouter.model": "gemini-2.5-flash-lite",
  "gitmsgai.openai.model": "gpt-4-turbo",
  "gitmsgai.google.model": "gemini-1.5-pro"
}
```

Each provider remembers its model selection when you switch back.

### Using multiple providers

You can switch anytime:

1. `GitMsgAI: Select Provider` → Choose new provider
2. `GitMsgAI: Set API Key` → If needed
3. `GitMsgAI: Select Model` → Pick model
4. Start using immediately

API keys and models are stored independently per provider.

## FAQ

### Which provider should I choose?

- **Maximum flexibility**: OpenRouter (400+ models)
- **Best quality**: Claude or OpenAI
- **Best free tier**: Google Gemini
- **Complete privacy**: Local (Ollama)
- **Enterprise**: OpenAI (best support)

### Can I use multiple providers?

Yes! Switch anytime with `GitMsgAI: Select Provider`. Each provider maintains its own API key and model selection.

### Do I need multiple API keys?

Only if you want to use multiple cloud providers. Each provider (OpenRouter, OpenAI, Google, Claude) needs its own API key. Local provider needs none.

### Which is cheapest?

1. **Local**: $0 (after initial setup)
2. **Google Gemini**: Free tier covers most use
3. **OpenRouter with free models**: $0 for many models
4. **OpenAI GPT-4o-mini**: ~$0.15 per 1,000 commits

### Which is fastest?

1. **Local with GPU**: < 1 second
2. **GPT-3.5 Turbo**: ~1-2 seconds
3. **Claude Haiku**: ~1-2 seconds
4. **Gemini Flash**: ~2-3 seconds

### Which is most private?

**Local (Ollama/LM Studio)**: Data never leaves your machine. Perfect for proprietary/sensitive code.

### Can I self-host other providers?

Yes! Many providers support custom base URLs:
- **OpenAI-compatible APIs**: vLLM, text-generation-webui, FastChat
- Set custom `baseUrl` in settings
- Use "Local" provider for OpenAI-compatible endpoints

### How do I get the best quality?

For best commit message quality:
1. Use **Claude 3.5 Sonnet** or **GPT-4**
2. Write focused, single-purpose commits
3. Customize the prompt template
4. Enable review mode
5. Provide good code comments

### What about costs for a team?

For a 5-person team doing 20 commits/day:
- **100 commits/day** = ~3,000/month
- **Google Gemini**: Free (within limits)
- **GPT-4o-mini**: ~$0.45/month
- **Claude Haiku**: ~$0.84/month
- **GPT-4**: ~$20/month
- **Local**: $0 (after setup)

Most teams will spend < $5/month with smart model selection.

---

**Need more help?** Check the [main README](../README.md) or [open an issue](https://github.com/ChaseRichGit/gitmsgai/issues).
