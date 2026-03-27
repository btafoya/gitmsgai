import * as vscode from 'vscode';
import { getProviderApiKey as getProviderApiKeyFromManager } from './providers/providerManager';

/**
 * Secret storage key for OpenRouter API key (SEC-01, SEC-02, SEC-03)
 * DEPRECATED: This is the old location. New keys are stored as 'gitmsgollama.{provider}.apiKey'
 * Kept for backward compatibility.
 */
const API_KEY_SECRET = 'openRouterApiKey';

/**
 * Old configuration key (deprecated, for migration purposes)
 * DEPRECATED: API keys should never be stored in settings. Use SecretStorage instead.
 */
const OLD_API_KEY_CONFIG = 'openRouterApiKey';

/**
 * Migrates API key from old plain-text configuration to secure SecretStorage (SEC-02, SEC-03)
 * @param context Extension context
 * @returns true if migration occurred, false otherwise
 */
export async function migrateApiKey(context: vscode.ExtensionContext): Promise<boolean> {
    try {
        // Check if API key already exists in SecretStorage
        const existingKey = await context.secrets.get(API_KEY_SECRET);
        if (existingKey) {
            // Already migrated or key exists in secrets
            return false;
        }

        // Check for old configuration
        const config = vscode.workspace.getConfiguration('gitmsgollama');
        const oldApiKey = config.get<string>(OLD_API_KEY_CONFIG);

        if (oldApiKey && oldApiKey.trim() !== '') {
            // Migrate to SecretStorage
            await context.secrets.store(API_KEY_SECRET, oldApiKey);

            // Clear old configuration (both global and workspace)
            await config.update(OLD_API_KEY_CONFIG, undefined, vscode.ConfigurationTarget.Global);
            await config.update(OLD_API_KEY_CONFIG, undefined, vscode.ConfigurationTarget.Workspace);

            return true;
        }

        return false;
    } catch (error: any) {
        console.error('Error during API key migration:', error);
        vscode.window.showErrorMessage(`Failed to migrate API key: ${error.message}`);
        return false;
    }
}

/**
 * Retrieves the API key from SecretStorage with backward compatibility (SEC-01)
 * This function checks multiple locations for the API key to ensure backward compatibility:
 * 1. New location based on current provider: 'gitmsgollama.{provider}.apiKey'
 * 2. Old SecretStorage location: 'openRouterApiKey'
 * 3. Deprecated configuration setting: 'gitmsgollama.openRouterApiKey'
 *
 * @param context Extension context
 * @returns API key or undefined if not set
 */
export async function getApiKey(context: vscode.ExtensionContext): Promise<string | undefined> {
    try {
        // Get current provider from settings
        const config = vscode.workspace.getConfiguration('gitmsgollama');
        const provider = config.get<string>('provider') || 'openrouter';

        // First, try new location based on current provider
        try {
            const newApiKey = await context.secrets.get(`gitmsgollama.${provider}.apiKey`);
            if (newApiKey && newApiKey.trim() !== '') {
                return newApiKey;
            }
        } catch (error) {
            console.error('Error reading from new API key location:', error);
        }

        // Fall back to old SecretStorage location (for backward compatibility)
        try {
            const oldApiKey = await context.secrets.get(API_KEY_SECRET);
            if (oldApiKey && oldApiKey.trim() !== '') {
                return oldApiKey;
            }
        } catch (error) {
            console.error('Error reading from old API key location:', error);
        }

        // Fall back to deprecated configuration setting (for very old installations)
        const configApiKey = config.get<string>(OLD_API_KEY_CONFIG);
        if (configApiKey && configApiKey.trim() !== '') {
            return configApiKey;
        }

        return undefined;
    } catch (error: any) {
        console.error('Error retrieving API key:', error);
        vscode.window.showErrorMessage(`Failed to retrieve API key: ${error.message}`);
        return undefined;
    }
}

/**
 * Stores the API key in SecretStorage (SEC-01)
 * @deprecated This function stores API keys in the old location for backward compatibility.
 *             For new code, use `setProviderApiKey` from './providers/providerManager' instead.
 *             This function is kept to support the legacy "Set API Key" command.
 *
 * @param context Extension context
 * @param apiKey API key to store
 */
export async function setApiKeySecure(context: vscode.ExtensionContext, apiKey: string): Promise<void> {
    try {
        // Get current provider from settings
        const config = vscode.workspace.getConfiguration('gitmsgollama');
        const provider = config.get<string>('provider') || 'openrouter';

        // Store in new location (provider-specific)
        await context.secrets.store(`gitmsgollama.${provider}.apiKey`, apiKey);

        // Also store in old location for backward compatibility
        // This ensures older versions of the extension can still access the key
        await context.secrets.store(API_KEY_SECRET, apiKey);
    } catch (error: any) {
        console.error('Error storing API key:', error);
        throw new Error(`Failed to store API key: ${error.message}`);
    }
}
