/**
 * Local Model Picker
 * Allows users to browse and select AI models from local providers (Ollama/LM Studio)
 */

import axios from 'axios';
import * as vscode from 'vscode';
import { AIProvider } from './providers/types';

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

interface LocalModel {
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

// Cache for models list
let modelsCache: { data: LocalModel[]; timestamp: number } | null = null;

/**
 * Get cache duration from settings (in milliseconds)
 */
function getCacheDuration(): number {
    const config = vscode.workspace.getConfiguration('gitmsgollama');
    const hours = config.get<number>('modelsUpdateInterval', 24);
    return hours * 60 * 60 * 1000;
}

/**
 * Check if auto-update is enabled
 */
function isAutoUpdateEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('gitmsgollama');
    return config.get<boolean>('autoUpdateModels', true);
}

/**
 * Get hardcoded model list for local provider
 */
function getHardcodedModels(): LocalModel[] {
    const createModel = (id: string, name: string, description: string, contextLength: number = 32768): LocalModel => ({
        id,
        canonical_slug: id,
        name,
        created: Date.now(),
        description,
        context_length: contextLength,
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
            context_length: contextLength,
            max_completion_tokens: 4096,
            is_moderated: false
        },
        per_request_limits: null,
        supported_parameters: ['temperature', 'max_tokens']
    });

    return [
        createModel('qwen2.5-coder:latest', 'Qwen 2.5 Coder', 'Specialized code generation model from Alibaba', 32768),
        createModel('codellama:latest', 'Code Llama', 'Meta\'s specialized code generation model', 16384),
        createModel('deepseek-coder:latest', 'DeepSeek Coder', 'Advanced code understanding and generation', 16384),
        createModel('llama3.2:latest', 'Llama 3.2', 'Latest Llama model for general tasks', 128000),
        createModel('mistral:latest', 'Mistral', 'Efficient and capable general model', 32768),
        createModel('phi4:latest', 'Phi-4', 'Microsoft\'s capable small model', 16384)
    ];
}

/**
 * Fetch available models from local API or return hardcoded list
 */
async function fetchLocalModels(): Promise<LocalModel[]> {
    const cacheDuration = getCacheDuration();
    const autoUpdate = isAutoUpdateEnabled();

    // Check cache first
    if (modelsCache && autoUpdate && Date.now() - modelsCache.timestamp < cacheDuration) {
        return modelsCache.data;
    }

    const config = vscode.workspace.getConfiguration('gitmsgollama');
    const baseUrl = config.get<string>('local.baseUrl', 'http://localhost:11434/v1');

    try {
        // Remove /v1 suffix if present
        const cleanBaseUrl = baseUrl.replace(/\/v1\/?$/, '');

        // Try Ollama format first
        try {
            const ollamaResponse = await axios.get(`${cleanBaseUrl}/api/tags`, {
                timeout: 5000
            });

            if (ollamaResponse.data.models) {
                const models = ollamaResponse.data.models.map((m: any) => ({
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

                // Update cache
                modelsCache = { data: models, timestamp: Date.now() };
                return models;
            }
        } catch (ollamaError) {
            // Not Ollama, try LM Studio format
        }

        // Try LM Studio format
        const lmStudioResponse = await axios.get(`${cleanBaseUrl}/v1/models`, {
            timeout: 5000
        });

        if (lmStudioResponse.data.data) {
            const models = lmStudioResponse.data.data.map((m: any) => ({
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

            // Update cache
            modelsCache = { data: models, timestamp: Date.now() };
            return models;
        }
    } catch (error) {
        console.error('Failed to fetch local models:', error);
    }

    // Fall back to hardcoded models
    const models = getHardcodedModels();
    modelsCache = { data: models, timestamp: Date.now() };
    return models;
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
 */
export async function showModelPicker(context: vscode.ExtensionContext, forceRefresh: boolean = false): Promise<string | undefined> {
    try {
        // Get current provider from settings
        const config = vscode.workspace.getConfiguration('gitmsgollama');
        const currentProvider = config.get<string>('provider', 'local') as AIProvider;

        // Show loading indicator
        return await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Loading ${currentProvider} models...`,
                cancellable: true
            },
            async (progress, token) => {
                // Fetch models
                const models = await fetchLocalModels();

                if (token.isCancellationRequested) {
                    return undefined;
                }

                // Sort models by name
                models.sort((a, b) => a.name.localeCompare(b.name));

                // Create QuickPick items
                const items: vscode.QuickPickItem[] = models.map(model => ({
                    label: model.name,
                    description: model.id,
                    detail: `${formatContextLength(model.context_length)} • Free • ${model.description}`
                }));

                // Show QuickPick
                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select an AI model for commit message generation',
                    matchOnDescription: true,
                    matchOnDetail: true,
                    title: `GitMsgOllama: Select Model`
                });

                if (!selected) {
                    return undefined;
                }

                // Return the model ID
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
        return;
    }

    // Update configuration
    const config = vscode.workspace.getConfiguration('gitmsgollama');
    await config.update('local.model', modelId, vscode.ConfigurationTarget.Global);

    vscode.window.showInformationMessage(`GitMsgOllama model updated to: ${modelId}`);
}

/**
 * Clear models cache
 */
export function clearModelsCache(): void {
    // Cache is now cleared
}

/**
 * Initialize pricing cache (no-op for local provider)
 */
export function initializePricingCache(): void {
    // No pricing cache needed for local models
}

/**
 * Initialize auto-update timer for models list
 */
export function initializeAutoUpdate(context: vscode.ExtensionContext): void {
    const config = vscode.workspace.getConfiguration('gitmsgollama');
    const autoUpdate = config.get<boolean>('autoUpdateModels', true);

    if (!autoUpdate) {
        return;
    }

    const updateInterval = config.get<number>('modelsUpdateInterval', 24);
    const intervalMs = updateInterval * 60 * 60 * 1000;

    // Update models list periodically
    const timer = setInterval(async () => {
        try {
            console.log('GitMsgOllama: Auto-updating local models list...');
            await fetchLocalModels();
            console.log('GitMsgOllama: Models list updated successfully');
        } catch (error) {
            console.error('GitMsgOllama: Failed to auto-update models list:', error);
        }
    }, intervalMs);

    // Register for cleanup
    context.subscriptions.push({
        dispose: () => clearInterval(timer)
    });
}