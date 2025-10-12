/**
 * Provider-Aware Model Picker
 * Allows users to browse and select AI models from various providers
 */

import axios from 'axios';
import * as vscode from 'vscode';
import { AIProvider } from './providers/types';
import { getProviderApiKey } from './providers/providerManager';

interface ModelArchitecture {
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
}

interface ModelPricing {
    prompt: string;
    completion: string;
    request: string;
    image: string;
    web_search: string;
    internal_reasoning: string;
    input_cache_read: string;
    input_cache_write: string;
}

interface TopProvider {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
}

interface OpenRouterModel {
    id: string;
    canonical_slug: string;
    name: string;
    created: number;
    description: string;
    context_length: number;
    architecture: ModelArchitecture;
    pricing: ModelPricing;
    top_provider: TopProvider;
    per_request_limits: any;
    supported_parameters: string[];
}

interface ModelsResponse {
    data: OpenRouterModel[];
}

// Cache for models list (provider-specific)
const modelsCacheMap: Map<string, { data: OpenRouterModel[]; timestamp: number }> = new Map();

// Global pricing cache from OpenRouter (maps model names to pricing)
const pricingCache: Map<string, ModelPricing> = new Map();
let pricingCacheTimestamp: number = 0;

/**
 * Get cache duration from settings (in milliseconds)
 */
function getCacheDuration(): number {
    const config = vscode.workspace.getConfiguration('gitmsgai');
    const hours = config.get<number>('modelsUpdateInterval', 24);
    return hours * 60 * 60 * 1000; // Convert hours to milliseconds
}

/**
 * Check if auto-update is enabled
 */
function isAutoUpdateEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('gitmsgai');
    return config.get<boolean>('autoUpdateModels', true);
}

/**
 * Get hardcoded model list for a provider
 */
function getHardcodedModels(provider: AIProvider): OpenRouterModel[] {
    const createModel = (id: string, name: string, description: string, contextLength: number = 128000): OpenRouterModel => ({
        id,
        canonical_slug: id,
        name,
        created: Date.now(),
        description,
        context_length: contextLength,
        architecture: {
            input_modalities: ['text'],
            output_modalities: ['text'],
            tokenizer: 'tokenizer',
            instruct_type: null
        },
        pricing: {
            prompt: '0',
            completion: '0',
            request: '0',
            image: '0',
            web_search: '0',
            internal_reasoning: '0',
            input_cache_read: '0',
            input_cache_write: '0'
        },
        top_provider: {
            context_length: contextLength,
            max_completion_tokens: 4096,
            is_moderated: false
        },
        per_request_limits: null,
        supported_parameters: ['temperature', 'max_tokens']
    });

    switch (provider) {
        case AIProvider.OpenAI:
            return [
                createModel('gpt-4o', 'GPT-4o', 'Most advanced GPT-4 model with vision capabilities', 128000),
                createModel('gpt-4o-mini', 'GPT-4o Mini', 'Faster and more affordable GPT-4o model', 128000),
                createModel('gpt-4-turbo', 'GPT-4 Turbo', 'GPT-4 with improved instruction following', 128000),
                createModel('gpt-3.5-turbo', 'GPT-3.5 Turbo', 'Fast and efficient model for most tasks', 16385)
            ];
        case AIProvider.Google:
            return [
                createModel('gemini-2.0-flash-exp', 'Gemini 2.0 Flash (Experimental)', 'Latest experimental Gemini model with improved performance', 1000000),
                createModel('gemini-1.5-pro', 'Gemini 1.5 Pro', 'Advanced reasoning and multimodal capabilities', 2000000),
                createModel('gemini-1.5-flash', 'Gemini 1.5 Flash', 'Fast and versatile performance across diverse tasks', 1000000),
                createModel('gemini-1.5-flash-8b', 'Gemini 1.5 Flash-8B', 'High volume and lower intelligence tasks', 1000000)
            ];
        case AIProvider.Claude:
            return [
                createModel('claude-3-5-sonnet-20241022', 'Claude 3.5 Sonnet', 'Most intelligent Claude model with balanced performance', 200000),
                createModel('claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 'Fastest and most compact Claude model', 200000),
                createModel('claude-3-opus-20240229', 'Claude 3 Opus', 'Powerful model for complex tasks', 200000)
            ];
        case AIProvider.Local:
            return [
                createModel('qwen2.5-coder:latest', 'Qwen 2.5 Coder', 'Specialized code generation model from Alibaba', 32768),
                createModel('codellama:latest', 'Code Llama', 'Meta\'s specialized code generation model', 16384),
                createModel('deepseek-coder:latest', 'DeepSeek Coder', 'Advanced code understanding and generation', 16384),
                createModel('llama3.2:latest', 'Llama 3.2', 'Latest Llama model for general tasks', 128000)
            ];
        default:
            return [];
    }
}

/**
 * Fetch available models from API or return hardcoded list
 */
async function fetchModels(provider: AIProvider, forceRefresh: boolean = false, apiKey?: string): Promise<OpenRouterModel[]> {
    const cacheKey = `modelListCache_${provider}`;
    const cacheDuration = getCacheDuration();
    const autoUpdate = isAutoUpdateEnabled();

    // Check cache first (unless force refresh or auto-update is disabled)
    const cachedData = modelsCacheMap.get(cacheKey);
    if (!forceRefresh && cachedData && autoUpdate && Date.now() - cachedData.timestamp < cacheDuration) {
        return cachedData.data;
    }

    try {
        let models: OpenRouterModel[] = [];

        // Fetch from provider-specific API endpoints
        switch (provider) {
            case AIProvider.OpenRouter:
                models = await fetchOpenRouterModels();
                break;

            case AIProvider.OpenAI:
                models = await fetchOpenAIModels(apiKey);
                break;

            case AIProvider.Google:
                models = await fetchGoogleModels(apiKey);
                break;

            case AIProvider.Claude:
                models = await fetchClaudeModels(apiKey);
                break;

            case AIProvider.Local:
                models = await fetchLocalModels(apiKey);
                break;
        }

        // Update cache
        modelsCacheMap.set(cacheKey, {
            data: models,
            timestamp: Date.now()
        });

        return models;
    } catch (error) {
        console.error(`Failed to fetch models from ${provider}:`, error);
        // Fall back to hardcoded models on error
        const models = getHardcodedModels(provider);
        modelsCacheMap.set(cacheKey, {
            data: models,
            timestamp: Date.now()
        });
        return models;
    }
}

/**
 * Fetch and cache pricing data from OpenRouter
 * This allows us to show pricing for models from other providers
 */
async function fetchAndCachePricing(): Promise<void> {
    const cacheDuration = getCacheDuration();

    // Check if cache is still valid
    if (pricingCacheTimestamp && Date.now() - pricingCacheTimestamp < cacheDuration) {
        return;
    }

    try {
        const response = await axios.get<ModelsResponse>('https://openrouter.ai/api/v1/models', {
            timeout: 10000,
            headers: {
                'User-Agent': 'GitMsgAI-VSCode/1.0'
            }
        });

        // Clear old cache
        pricingCache.clear();

        // Cache pricing for all models
        for (const model of response.data.data) {
            // Cache by both full ID and base model name
            pricingCache.set(model.id, model.pricing);

            // Extract base model name (e.g., "openai/gpt-4o" -> "gpt-4o")
            const baseModelName = model.id.split('/').pop();
            if (baseModelName) {
                pricingCache.set(baseModelName, model.pricing);
            }

            // Also cache by canonical slug
            if (model.canonical_slug && model.canonical_slug !== model.id) {
                pricingCache.set(model.canonical_slug, model.pricing);
            }
        }

        pricingCacheTimestamp = Date.now();
        console.log(`GitMsgAI: Cached pricing for ${pricingCache.size} models from OpenRouter`);
    } catch (error) {
        console.error('GitMsgAI: Failed to fetch pricing from OpenRouter:', error);
    }
}

/**
 * Get pricing for a model from cache
 */
function getPricingFromCache(modelId: string): ModelPricing | null {
    // Try exact match first
    let pricing = pricingCache.get(modelId);
    if (pricing) {
        return pricing;
    }

    // Try base model name
    const baseModelName = modelId.split('/').pop();
    if (baseModelName) {
        pricing = pricingCache.get(baseModelName);
        if (pricing) {
            return pricing;
        }
    }

    return null;
}

/**
 * Fetch models from OpenRouter API
 */
async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
    const response = await axios.get<ModelsResponse>('https://openrouter.ai/api/v1/models', {
        timeout: 10000,
        headers: {
            'User-Agent': 'AI-Commit-VSCode/1.0'
        }
    });
    return response.data.data;
}

/**
 * Fetch models from OpenAI API
 */
async function fetchOpenAIModels(apiKey?: string): Promise<OpenRouterModel[]> {
    if (!apiKey) {
        return getHardcodedModels(AIProvider.OpenAI);
    }

    const response = await axios.get('https://api.openai.com/v1/models', {
        timeout: 10000,
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    // Convert OpenAI format to our format
    const openaiModels = response.data.data;
    return openaiModels
        .filter((m: any) => m.id.startsWith('gpt-')) // Only GPT models for chat
        .map((m: any) => {
            // Try to get pricing from OpenRouter cache
            const cachedPricing = getPricingFromCache(m.id) || getPricingFromCache(`openai/${m.id}`);

            return {
                id: m.id,
                canonical_slug: m.id,
                name: m.id.toUpperCase().replace(/-/g, ' '),
                created: m.created || Date.now(),
                description: `OpenAI model created ${new Date((m.created || 0) * 1000).toLocaleDateString()}`,
                context_length: getOpenAIContextLength(m.id),
                architecture: {
                    input_modalities: ['text'],
                    output_modalities: ['text'],
                    tokenizer: 'tiktoken',
                    instruct_type: 'chat'
                },
                pricing: cachedPricing || {
                    prompt: '0',
                    completion: '0',
                    request: '0',
                    image: '0',
                    web_search: '0',
                    internal_reasoning: '0',
                    input_cache_read: '0',
                    input_cache_write: '0'
                },
                top_provider: {
                    context_length: getOpenAIContextLength(m.id),
                    max_completion_tokens: 4096,
                    is_moderated: true
                },
                per_request_limits: null,
                supported_parameters: ['temperature', 'top_p', 'max_tokens']
            };
        });
}

/**
 * Get context length for OpenAI models
 */
function getOpenAIContextLength(modelId: string): number {
    if (modelId.includes('gpt-4o')) return 128000;
    if (modelId.includes('gpt-4-turbo')) return 128000;
    if (modelId.includes('gpt-4-32k')) return 32768;
    if (modelId.includes('gpt-4')) return 8192;
    if (modelId.includes('gpt-3.5-turbo-16k')) return 16385;
    if (modelId.includes('gpt-3.5')) return 4096;
    return 4096;
}

/**
 * Fetch models from Google Gemini API
 */
async function fetchGoogleModels(apiKey?: string): Promise<OpenRouterModel[]> {
    if (!apiKey) {
        return getHardcodedModels(AIProvider.Google);
    }

    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
        timeout: 10000
    });

    // Convert Google format to our format
    const googleModels = response.data.models || [];
    return googleModels
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => {
            // Extract model name from full path (e.g., "models/gemini-2.0-flash-exp")
            const modelId = m.name.replace('models/', '');

            // Try to get pricing from OpenRouter cache
            const cachedPricing = getPricingFromCache(modelId) || getPricingFromCache(`google/${modelId}`);

            return {
                id: modelId,
                canonical_slug: modelId,
                name: m.displayName || modelId,
                created: Date.now(),
                description: m.description || `Google Gemini model`,
                context_length: m.inputTokenLimit || 32768,
                architecture: {
                    input_modalities: m.supportedGenerationMethods || ['text'],
                    output_modalities: ['text'],
                    tokenizer: 'sentencepiece',
                    instruct_type: 'chat'
                },
                pricing: cachedPricing || {
                    prompt: '0',
                    completion: '0',
                    request: '0',
                    image: '0',
                    web_search: '0',
                    internal_reasoning: '0',
                    input_cache_read: '0',
                    input_cache_write: '0'
                },
                top_provider: {
                    context_length: m.inputTokenLimit || 32768,
                    max_completion_tokens: m.outputTokenLimit || 8192,
                    is_moderated: false
                },
                per_request_limits: null,
                supported_parameters: ['temperature', 'top_p', 'top_k']
            };
        });
}

/**
 * Fetch models from Claude API
 */
async function fetchClaudeModels(apiKey?: string): Promise<OpenRouterModel[]> {
    if (!apiKey) {
        return getHardcodedModels(AIProvider.Claude);
    }

    const response = await axios.get('https://api.anthropic.com/v1/models', {
        timeout: 10000,
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        }
    });

    // Convert Claude format to our format
    const claudeModels = response.data.data || [];
    return claudeModels.map((m: any) => {
        // Try to get pricing from OpenRouter cache
        const cachedPricing = getPricingFromCache(m.id) || getPricingFromCache(`anthropic/${m.id}`);

        return {
            id: m.id,
            canonical_slug: m.id,
            name: m.display_name || m.id,
            created: new Date(m.created_at).getTime() / 1000,
            description: `Claude model ${m.id}`,
            context_length: 200000, // Claude 3.5 has 200k context
            architecture: {
                input_modalities: ['text'],
                output_modalities: ['text'],
                tokenizer: 'claude',
                instruct_type: 'chat'
            },
            pricing: cachedPricing || {
                prompt: '0',
                completion: '0',
                request: '0',
                image: '0',
                web_search: '0',
                internal_reasoning: '0',
                input_cache_read: '0',
                input_cache_write: '0'
            },
            top_provider: {
                context_length: 200000,
                max_completion_tokens: 4096,
                is_moderated: false
            },
            per_request_limits: null,
            supported_parameters: ['temperature', 'top_p', 'max_tokens']
        };
    });
}

/**
 * Fetch models from Local API (Ollama/LM Studio)
 */
async function fetchLocalModels(apiKey?: string): Promise<OpenRouterModel[]> {
    const config = vscode.workspace.getConfiguration('gitmsgai');
    const baseUrl = config.get<string>('local.baseUrl', 'http://localhost:11434/v1');

    try {
        // Remove /v1 suffix if present and add /api/tags for Ollama or /v1/models for LM Studio
        const cleanBaseUrl = baseUrl.replace(/\/v1\/?$/, '');

        // Try Ollama format first (http://localhost:11434/api/tags)
        try {
            const ollamaResponse = await axios.get(`${cleanBaseUrl}/api/tags`, {
                timeout: 5000
            });

            if (ollamaResponse.data.models) {
                // Ollama format
                return ollamaResponse.data.models.map((m: any) => ({
                    id: m.name,
                    canonical_slug: m.name,
                    name: m.name,
                    created: Date.now(),
                    description: `Ollama model - ${m.size ? `Size: ${formatBytes(m.size)}` : 'Local model'}`,
                    context_length: 32768,
                    architecture: {
                        input_modalities: ['text'],
                        output_modalities: ['text'],
                        tokenizer: 'local',
                        instruct_type: 'chat'
                    },
                    pricing: {
                        prompt: '0',
                        completion: '0',
                        request: '0',
                        image: '0',
                        web_search: '0',
                        internal_reasoning: '0',
                        input_cache_read: '0',
                        input_cache_write: '0'
                    },
                    top_provider: {
                        context_length: 32768,
                        max_completion_tokens: 4096,
                        is_moderated: false
                    },
                    per_request_limits: null,
                    supported_parameters: ['temperature', 'top_p', 'max_tokens']
                }));
            }
        } catch (ollamaError) {
            // Not Ollama, try LM Studio format
        }

        // Try LM Studio format (http://localhost:1234/v1/models)
        const lmStudioResponse = await axios.get(`${cleanBaseUrl}/v1/models`, {
            timeout: 5000
        });

        if (lmStudioResponse.data.data) {
            // LM Studio/OpenAI format
            return lmStudioResponse.data.data.map((m: any) => ({
                id: m.id,
                canonical_slug: m.id,
                name: m.id,
                created: m.created || Date.now(),
                description: `LM Studio model - ${m.owned_by || 'Local model'}`,
                context_length: 32768,
                architecture: {
                    input_modalities: ['text'],
                    output_modalities: ['text'],
                    tokenizer: 'local',
                    instruct_type: 'chat'
                },
                pricing: {
                    prompt: '0',
                    completion: '0',
                    request: '0',
                    image: '0',
                    web_search: '0',
                    internal_reasoning: '0',
                    input_cache_read: '0',
                    input_cache_write: '0'
                },
                top_provider: {
                    context_length: 32768,
                    max_completion_tokens: 4096,
                    is_moderated: false
                },
                per_request_limits: null,
                supported_parameters: ['temperature', 'top_p', 'max_tokens']
            }));
        }
    } catch (error) {
        console.error('Failed to fetch local models:', error);
    }

    // Fall back to hardcoded models
    return getHardcodedModels(AIProvider.Local);
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format pricing for display
 */
function formatPricing(pricing: ModelPricing, provider: AIProvider): string {
    const promptCost = parseFloat(pricing.prompt) * 1000000; // Convert to cost per million tokens
    const completionCost = parseFloat(pricing.completion) * 1000000;

    // Local models are actually free (running on your own hardware)
    if (provider === AIProvider.Local) {
        return 'Free (Local)';
    }

    // If we have pricing data (from OpenRouter cache or direct), show it
    if (promptCost === 0 && completionCost === 0) {
        // Check if this is truly free or just missing pricing data
        // If both are exactly 0 and it's OpenRouter, it's likely a free model
        if (provider === AIProvider.OpenRouter) {
            return 'Free';
        }
        // For other providers, if pricing is 0, we don't have data
        return 'See provider pricing';
    }

    // Show actual pricing
    return `$${promptCost.toFixed(2)}/$${completionCost.toFixed(2)} per 1M tokens`;
}

/**
 * Format context length for display
 */
function formatContextLength(length: number): string {
    if (length >= 1000000) {
        return `${(length / 1000000).toFixed(1)}M tokens`;
    } else if (length >= 1000) {
        return `${(length / 1000).toFixed(0)}k tokens`;
    }
    return `${length} tokens`;
}

/**
 * Show model picker and return selected model ID
 * @param context - Extension context for API key retrieval
 * @param forceRefresh - Force refresh the models list from API
 */
export async function showModelPicker(context: vscode.ExtensionContext, forceRefresh: boolean = false): Promise<string | undefined> {
    try {
        // Fetch pricing data from OpenRouter (for all providers)
        // This runs in background and updates cache if needed
        fetchAndCachePricing().catch(err => {
            console.error('GitMsgAI: Failed to fetch pricing data:', err);
        });

        // Get current provider from settings
        const config = vscode.workspace.getConfiguration('gitmsgai');
        const currentProvider = config.get<string>('provider', 'openrouter') as AIProvider;

        // Show loading indicator
        return await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Loading ${currentProvider} models...`,
                cancellable: true
            },
            async (progress, token) => {
                // Get API key for the provider
                const apiKey = await getProviderApiKey(context, currentProvider);

                // Fetch models
                const models = await fetchModels(currentProvider, forceRefresh, apiKey);

                if (token.isCancellationRequested) {
                    return undefined;
                }

                // Sort models by name
                models.sort((a, b) => a.name.localeCompare(b.name));

                // Create QuickPick items with switch provider action at the top
                const items: vscode.QuickPickItem[] = [
                    {
                        label: '$(arrow-swap) Switch Provider...',
                        description: '',
                        detail: 'Change to a different AI provider',
                        kind: vscode.QuickPickItemKind.Separator
                    } as any,
                    ...models.map(model => ({
                        label: model.name,
                        description: model.id,
                        detail: `${formatContextLength(model.context_length)} • ${formatPricing(model.pricing, currentProvider)} • ${model.description.substring(0, 100)}...`
                    }))
                ];

                // Show QuickPick
                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select an AI model for commit message generation',
                    matchOnDescription: true,
                    matchOnDetail: true,
                    title: `GitMsgAI: Select Model (${currentProvider})`
                });

                if (!selected) {
                    return undefined;
                }

                // Check if user selected the "Switch Provider" action
                if (selected.label === '$(arrow-swap) Switch Provider...') {
                    // Execute the selectProvider command
                    await vscode.commands.executeCommand('gitmsgai.selectProvider');
                    return undefined;
                }

                // Return the model ID (from description)
                return selected.description;
            }
        );
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to load models: ${error.message}`);
        return undefined;
    }
}

/**
 * Command handler for model picker
 */
export async function selectModelCommand(context: vscode.ExtensionContext, forceRefresh: boolean = false): Promise<void> {
    const modelId = await showModelPicker(context, forceRefresh);

    if (!modelId) {
        return; // User cancelled
    }

    // Get current provider
    const config = vscode.workspace.getConfiguration('gitmsgai');
    const currentProvider = config.get<string>('provider', 'openrouter') as AIProvider;

    // Update configuration to provider-specific setting
    await config.update(`${currentProvider}.model`, modelId, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage(`GitMsgAI model updated to: ${modelId}`);
}

/**
 * Initialize pricing cache on extension startup
 */
export function initializePricingCache(): void {
    // Fetch pricing data in background on startup
    fetchAndCachePricing().catch(err => {
        console.error('GitMsgAI: Failed to initialize pricing cache:', err);
    });
}

/**
 * Initialize auto-update timer for models list
 */
export function initializeAutoUpdate(context: vscode.ExtensionContext): void {
    const config = vscode.workspace.getConfiguration('gitmsgai');
    const autoUpdate = config.get<boolean>('autoUpdateModels', true);

    if (!autoUpdate) {
        return; // Auto-update disabled
    }

    const updateInterval = config.get<number>('modelsUpdateInterval', 24);
    const intervalMs = updateInterval * 60 * 60 * 1000; // Convert hours to milliseconds

    // Update models list periodically
    const timer = setInterval(async () => {
        try {
            const currentProvider = config.get<string>('provider', 'openrouter') as AIProvider;
            console.log(`GitMsgAI: Auto-updating models list from ${currentProvider}...`);

            // Only fetch from API for OpenRouter
            if (currentProvider === AIProvider.OpenRouter) {
                const apiKey = await getProviderApiKey(context, currentProvider);
                await fetchModels(currentProvider, true, apiKey); // Force refresh
                console.log('GitMsgAI: Models list updated successfully');
            }
        } catch (error) {
            console.error('GitMsgAI: Failed to auto-update models list:', error);
        }
    }, intervalMs);

    // Register for cleanup
    context.subscriptions.push({
        dispose: () => clearInterval(timer)
    });

    // Also update once on startup (if cache is expired) - only for OpenRouter
    const currentProvider = config.get<string>('provider', 'openrouter') as AIProvider;
    if (currentProvider === AIProvider.OpenRouter) {
        getProviderApiKey(context, currentProvider).then(apiKey => {
            fetchModels(currentProvider, false, apiKey).catch(error => {
                console.error('GitMsgAI: Failed to fetch models on startup:', error);
            });
        });
    }
}

/**
 * Clear models cache (useful for testing or forcing refresh)
 */
export function clearModelsCache(): void {
    modelsCacheMap.clear();
}
