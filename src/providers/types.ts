/**
 * AI Provider types and configurations
 */

/**
 * Supported AI providers
 */
export enum AIProvider {
    Local = 'local'
}

/**
 * Provider configuration interface
 */
export interface ProviderConfig {
    provider: AIProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
    timeout?: number;
    customHeaders?: Record<string, string>;
}

/**
 * Provider endpoint configuration
 */
export interface ProviderEndpoint {
    baseUrl: string;
    chatCompletionsPath: string;
    modelsPath?: string;
    requiresApiKey: boolean;
}

/**
 * Provider endpoint mappings
 */
export const PROVIDER_ENDPOINTS: Record<AIProvider, ProviderEndpoint> = {
    [AIProvider.Local]: {
        baseUrl: 'http://localhost:11434/v1',
        chatCompletionsPath: '/chat/completions',
        modelsPath: '/models',
        requiresApiKey: false
    }
};

/**
 * Default models for each provider
 */
export const DEFAULT_MODELS: Record<AIProvider, string> = {
    [AIProvider.Local]: 'qwen3-coder-next:cloud'
};
