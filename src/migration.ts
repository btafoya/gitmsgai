import * as vscode from 'vscode';
import { AIProvider } from './providers/types';
import { setProviderApiKey } from './providers/providerManager';

/**
 * Migration flags and keys
 */
const MULTI_PROVIDER_MIGRATION_FLAG = 'multiProviderMigrated';
const OLD_API_KEY_SECRET = 'openRouterApiKey'; // Old SecretStorage key
const OLD_API_KEY_CONFIG = 'openRouterApiKey'; // Old configuration key (deprecated)

/**
 * Migrates from single-provider configuration to multi-provider configuration
 * This function handles backward compatibility by:
 * 1. Detecting old configuration settings
 * 2. Migrating them to new multi-provider structure
 * 3. Preserving old settings for backward compatibility
 *
 * @param context Extension context
 * @returns Promise<void>
 */
export async function migrateToMultiProvider(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Check if migration has already been performed
        const alreadyMigrated = context.globalState.get<boolean>(MULTI_PROVIDER_MIGRATION_FLAG, false);
        if (alreadyMigrated) {
            // Already migrated, nothing to do
            return;
        }

        const config = vscode.workspace.getConfiguration('gitmsgai');
        let migrationPerformed = false;

        // Get old settings
        const oldModel = config.get<string>('model');
        const oldApiKeyFromConfig = config.get<string>(OLD_API_KEY_CONFIG);
        let oldApiKeyFromSecret: string | undefined;

        // Try to get old API key from SecretStorage (old location)
        try {
            oldApiKeyFromSecret = await context.secrets.get(OLD_API_KEY_SECRET);
        } catch (error) {
            console.error('Error reading old API key from SecretStorage:', error);
        }

        // Determine which API key to use (prefer SecretStorage over config)
        const oldApiKey = oldApiKeyFromSecret || oldApiKeyFromConfig;

        // Check if we have old configuration to migrate
        if (oldModel || oldApiKey) {
            // Get current provider setting (may already be set by user)
            const currentProvider = config.get<string>('provider');

            // Only set provider if not already configured
            if (!currentProvider) {
                // Set provider to 'openrouter' (default for migration)
                await config.update('provider', 'openrouter', vscode.ConfigurationTarget.Global);
                migrationPerformed = true;
            }

            // Migrate model setting if we have an old model value
            if (oldModel) {
                const openRouterModel = config.get<string>('openrouter.model');

                // Only migrate if openrouter.model is not already set
                if (!openRouterModel || openRouterModel === 'google/gemini-2.0-flash-exp:free') {
                    await config.update('openrouter.model', oldModel, vscode.ConfigurationTarget.Global);
                    migrationPerformed = true;
                }
            }

            // Migrate API key if we have an old API key
            if (oldApiKey && oldApiKey.trim() !== '') {
                // Check if new API key location already has a value
                const newApiKey = await context.secrets.get('gitmsgai.openrouter.apiKey');

                // Only migrate if new location is empty
                if (!newApiKey) {
                    await setProviderApiKey(context, AIProvider.OpenRouter, oldApiKey);
                    migrationPerformed = true;
                }

                // IMPORTANT: Keep old API key for backward compatibility
                // Don't delete the old keys - we'll keep them for a few versions
                // This ensures that if users downgrade or have issues, their keys are still there
            }

            // Mark migration as complete
            await context.globalState.update(MULTI_PROVIDER_MIGRATION_FLAG, true);

            // Show information message to user if migration was performed
            if (migrationPerformed) {
                const action = await vscode.window.showInformationMessage(
                    'GitMsgAI: Your configuration has been migrated to support multiple AI providers. ' +
                    'You can now switch between OpenRouter, OpenAI, Google, Claude, and local models.',
                    'Learn More',
                    'OK'
                );

                if (action === 'Learn More') {
                    vscode.window.showInformationMessage(
                        'Your existing OpenRouter settings have been preserved and moved to the new multi-provider structure. ' +
                        'You can now use the "GitMsgAI: Select Provider" command to switch between different AI providers. ' +
                        'Your old settings are kept for backward compatibility.'
                    );
                }
            } else {
                // Mark as migrated even if no changes were made (no old config found)
                await context.globalState.update(MULTI_PROVIDER_MIGRATION_FLAG, true);
            }
        } else {
            // No old configuration found, just mark as migrated
            await context.globalState.update(MULTI_PROVIDER_MIGRATION_FLAG, true);
        }

    } catch (error: any) {
        console.error('Error during multi-provider migration:', error);
        // Don't show error to user for migration issues - fail silently
        // This prevents disrupting the user experience if migration has issues
        // The extension will still work with new settings
    }
}
