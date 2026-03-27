# Ollama Provider Guide

This guide provides detailed information about using Ollama with GitMsgOllama for generating commit messages locally.

## Table of Contents

- [Overview](#overview)
- [Benefits](#benefits)
- [Requirements](#requirements)
- [Installation](#installation)
- [Setup in GitMsgOllama](#setup-in-gitmsgollama)
- [Recommended Models](#recommended-models)
- [Performance Tips](#performance-tips)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Overview

GitMsgOllama supports running AI models completely locally on your machine using Ollama for maximum privacy and zero API costs.

## Benefits

- **Complete privacy**: Data never leaves your machine
- **No API costs**: Free to use
- **Offline use**: Works without internet
- **No rate limits**: Limited only by your hardware
- **Full control**: Choose any model, customize settings
- **No API key needed**: No account required

## Requirements

- **Hardware**:
  - Minimum: 8GB RAM for 7B models
  - Recommended: 16GB+ RAM for 13B models
  - GPU: Optional but significantly faster (NVIDIA/AMD/Apple Silicon)
- **Disk Space**: 4-20GB per model
- **OS**: Windows, macOS, or Linux

## Installation

1. Download Ollama from [Ollama.ai](https://ollama.ai/)
2. Install the application
3. Download a model:
   ```bash
   ollama pull codellama:7b
   # or
   ollama pull mistral:7b
   # or
   ollama pull llama2:13b
   ```

## Setup in GitMsgOllama

1. Ensure Ollama is running (it starts automatically)
2. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Run: `GitMsgOllama: Select Provider`
4. Choose "Local"
5. Set base URL: `http://localhost:11434/v1` (default)
6. Run: `GitMsgOllama: Select Model`
7. Choose your downloaded model

## Recommended Models

| Model | Size | RAM Required | Best For |
|-------|------|--------------|----------|
| `codellama:7b` | 3.8GB | 8GB | Coding, fast responses |
| `mistral:7b` | 4.1GB | 8GB | General purpose, quality |
| `llama2:13b` | 7.3GB | 16GB | Higher quality |
| `deepseek-coder:6.7b` | 3.8GB | 8GB | Code-specific tasks |
| `phi3:mini` | 2.3GB | 4GB | Lightweight, very fast |

## Performance Tips

- **Use quantized models**: GGUF Q4 or Q5 models for best speed/quality balance
- **GPU acceleration**: Enable in Ollama settings
- **Model size**: Start with 7B models, upgrade to 13B if you have RAM
- **Context length**: Reduce if responses are slow

## Troubleshooting

**"Connection refused"**
- Ensure Ollama is running
- Check base URL matches the server port (`http://localhost:11434/v1`)
- Check firewall isn't blocking local connections

**"Model not found"**
- Verify model is downloaded in Ollama
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

## Best Practices

### Privacy

- **Complete privacy**: Your code never leaves your machine
- **Perfect for sensitive code**: Keep proprietary code completely private

### Cost Optimization

1. **No API costs**: Free to use after initial setup
2. **Choose right model**: Don't use larger models for simple commits

### Performance

1. **GPU acceleration**: 10x faster inference with GPU
2. **Quantized models**: Use Q4 or Q5 for best speed/quality balance
3. **Keep diffs focused**: Smaller, focused commits = faster generation

### Quality

1. **Use larger models for important commits**: 13B models for release notes, major features
2. **Review before committing**: Enable `gitmsgollama.reviewBeforeApply`
3. **Customize prompts**: Tailor to your team's commit style

---

**Need more help?** Check the [main README](../README.md) or [open an issue](https://github.com/btafoya/gitmsgollama/issues).