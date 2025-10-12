/**
 * AI Provider types and configurations
 */

/**
 * Supported AI providers
 */
export enum AIProvider {
    OpenRouter = 'openrouter',
    OpenAI = 'openai',
    Google = 'google',
    Claude = 'claude',
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
    [AIProvider.OpenRouter]: {
        baseUrl: 'https://openrouter.ai/api/v1',
        chatCompletionsPath: '/chat/completions',
        modelsPath: '/models',
        requiresApiKey: true
    },
    [AIProvider.OpenAI]: {
        baseUrl: 'https://api.openai.com/v1',
        chatCompletionsPath: '/chat/completions',
        modelsPath: '/models',
        requiresApiKey: true
    },
    [AIProvider.Google]: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        chatCompletionsPath: '/chat/completions',
        modelsPath: '/models',
        requiresApiKey: true
    },
    [AIProvider.Claude]: {
        baseUrl: 'https://api.anthropic.com/v1',
        chatCompletionsPath: '/messages',
        modelsPath: undefined,
        requiresApiKey: true
    },
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
    [AIProvider.OpenRouter]: 'google/gemini-2.0-flash-exp:free',
    [AIProvider.OpenAI]: 'gpt-4o-mini',
    [AIProvider.Google]: 'gemini-2.0-flash-exp',
    [AIProvider.Claude]: 'claude-3-5-haiku-20241022',
    [AIProvider.Local]: 'openai/gpt-oss-20b'
};
