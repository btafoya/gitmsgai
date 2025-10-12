import * as vscode from 'vscode';
import { AIProvider, ProviderConfig, DEFAULT_MODELS, PROVIDER_ENDPOINTS } from './types';

/**
 * Get provider configuration from VSCode settings
 * @param provider The AI provider to get config for
 * @returns Provider configuration from settings
 */
export function getProviderConfig(provider: AIProvider): ProviderConfig {
    const config = vscode.workspace.getConfiguration('gitmsgai');

    // Get provider-specific settings
    const providerConfig = config.get<any>(`${provider}`);

    // Get base URL (with fallback to default)
    const baseUrl = providerConfig?.baseUrl || config.get<string>(`${provider}.baseUrl`) || PROVIDER_ENDPOINTS[provider].baseUrl;

    // Get model (with fallback to default)
    const model = providerConfig?.model || config.get<string>(`${provider}.model`) || DEFAULT_MODELS[provider];

    // Get timeout (global setting)
    const timeout = config.get<number>('timeout', 30) * 1000; // Convert to milliseconds

    return {
        provider,
        baseUrl,
        model,
        timeout
    };
}

/**
 * Get provider API key from SecretStorage
 * @param context Extension context
 * @param provider The AI provider to get API key for
 * @returns API key or undefined if not set
 */
export async function getProviderApiKey(
    context: vscode.ExtensionContext,
    provider: AIProvider
): Promise<string | undefined> {
    try {
        const secretKey = `gitmsgai.${provider}.apiKey`;
        return await context.secrets.get(secretKey);
    } catch (error: any) {
        console.error(`Error retrieving API key for ${provider}:`, error);
        vscode.window.showErrorMessage(`Failed to retrieve ${provider} API key: ${error.message}`);
        return undefined;
    }
}

/**
 * Set provider API key in SecretStorage
 * @param context Extension context
 * @param provider The AI provider to set API key for
 * @param apiKey The API key to store
 */
export async function setProviderApiKey(
    context: vscode.ExtensionContext,
    provider: AIProvider,
    apiKey: string
): Promise<void> {
    try {
        const secretKey = `gitmsgai.${provider}.apiKey`;
        await context.secrets.store(secretKey, apiKey);
    } catch (error: any) {
        console.error(`Error storing API key for ${provider}:`, error);
        throw new Error(`Failed to store ${provider} API key: ${error.message}`);
    }
}

/**
 * Validate provider configuration
 * @param context Extension context
 * @param provider The AI provider to validate
 * @returns Validation result with status and optional message
 */
export async function validateProviderConfig(
    context: vscode.ExtensionContext,
    provider: AIProvider
): Promise<{ valid: boolean; message?: string }> {
    const endpoint = PROVIDER_ENDPOINTS[provider];

    // Check if provider requires API key
    if (endpoint.requiresApiKey) {
        const apiKey = await getProviderApiKey(context, provider);
        if (!apiKey || apiKey.trim() === '') {
            return {
                valid: false,
                message: `${provider} API key is not set. Please configure your API key.`
            };
        }
    }

    // Get provider config
    const config = getProviderConfig(provider);

    // Validate model is set
    if (!config.model || config.model.trim() === '') {
        return {
            valid: false,
            message: `${provider} model is not configured.`
        };
    }

    // Validate base URL is set
    if (!config.baseUrl || config.baseUrl.trim() === '') {
        return {
            valid: false,
            message: `${provider} base URL is not configured.`
        };
    }

    return { valid: true };
}

/**
 * Get complete provider configuration including API key from SecretStorage
 * @param context Extension context
 * @param provider The AI provider to get complete config for
 * @returns Complete provider configuration with API key
 */
export async function getCompleteProviderConfig(
    context: vscode.ExtensionContext,
    provider: AIProvider
): Promise<ProviderConfig> {
    const config = getProviderConfig(provider);
    const apiKey = await getProviderApiKey(context, provider);

    return {
        ...config,
        apiKey
    };
}
