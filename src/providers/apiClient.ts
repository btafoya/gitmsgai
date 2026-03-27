import axios, { CancelToken } from 'axios';
import * as vscode from 'vscode';
import { AIProvider, ProviderConfig, PROVIDER_ENDPOINTS } from './types';

/**
 * Build the complete API endpoint URL for a provider
 * @param config Provider configuration
 * @returns Complete API endpoint URL
 */
export function buildApiEndpoint(config: ProviderConfig): string {
    const endpoint = PROVIDER_ENDPOINTS[config.provider];
    const baseUrl = config.baseUrl || endpoint.baseUrl;

    // Remove trailing slash from base URL if present
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // Ensure path starts with /
    const path = endpoint.chatCompletionsPath.startsWith('/')
        ? endpoint.chatCompletionsPath
        : `/${endpoint.chatCompletionsPath}`;

    return `${cleanBaseUrl}${path}`;
}

/**
 * Build provider-specific request headers
 * @param config Provider configuration
 * @returns Headers object for the API request
 */
export function buildRequestHeaders(config: ProviderConfig): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    // Add API key if available
    if (config.apiKey) {
        switch (config.provider) {
            case AIProvider.OpenRouter:
            case AIProvider.OpenAI:
            case AIProvider.Local:
                headers['Authorization'] = `Bearer ${config.apiKey}`;
                break;

            case AIProvider.Google:
                // Google uses API key in query params, but we'll add it as header for OpenAI compatibility
                headers['Authorization'] = `Bearer ${config.apiKey}`;
                break;

            case AIProvider.Claude:
                headers['x-api-key'] = config.apiKey;
                headers['anthropic-version'] = '2023-06-01';
                break;
        }
    }

    // Add provider-specific headers
    if (config.provider === AIProvider.OpenRouter) {
        headers['HTTP-Referer'] = 'https://github.com/btafoya/gitmsgollama';
        headers['X-Title'] = 'GitMsgOllama VSCode Extension';
    }

    // Add custom headers if provided
    if (config.customHeaders) {
        Object.assign(headers, config.customHeaders);
    }

    return headers;
}

/**
 * Build request body for the provider
 * @param provider Provider type
 * @param model Model name
 * @param prompt Prompt text
 * @returns Request body object
 */
export function buildRequestBody(provider: AIProvider, model: string, prompt: string): any {
    // Claude has a different request format
    if (provider === AIProvider.Claude) {
        return {
            model: model,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 4096 // Required for Claude API
        };
    }

    // OpenAI-compatible format for other providers
    return {
        model: model,
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ]
    };
}

/**
 * Make API request to the provider
 * @param config Provider configuration
 * @param prompt Prompt text
 * @param timeout Request timeout in milliseconds
 * @param cancelToken Axios cancel token for request cancellation
 * @returns API response
 */
export async function makeApiRequest(
    config: ProviderConfig,
    prompt: string,
    timeout: number,
    cancelToken?: CancelToken
): Promise<any> {
    const endpoint = buildApiEndpoint(config);
    const headers = buildRequestHeaders(config);
    const body = buildRequestBody(config.provider, config.model, prompt);

    try {
        const response = await axios.post(endpoint, body, {
            headers,
            timeout: timeout || config.timeout || 30000,
            cancelToken
        });

        return response;
    } catch (error: any) {
        // Re-throw axios errors with better context
        if (axios.isCancel(error)) {
            throw new Error('Request was cancelled by user');
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            const timeoutSeconds = (timeout || config.timeout || 30000) / 1000;
            throw new Error(`Request timed out after ${timeoutSeconds} seconds. Try increasing the timeout in settings.`);
        } else if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const message = error.response.data?.error?.message || error.response.statusText || 'Unknown error';
            throw new Error(`${config.provider} API error (${status}): ${message}`);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error(`No response from ${config.provider} API. Check your network connection and base URL.`);
        } else {
            // Something else happened
            throw new Error(`Failed to make API request: ${error.message}`);
        }
    }
}
