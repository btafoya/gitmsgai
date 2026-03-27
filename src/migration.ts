import * as vscode from 'vscode';
import { AIProvider } from './providers/types';
import { setProviderApiKey } from './providers/providerManager';

/**
 * Migration flags and keys
 */
const LOCAL_PROVIDER_MIGRATION_FLAG = 'localProviderMigrated';

/**
 * Migrates old configuration to local-only provider
 * This function handles backward compatibility by:
 * 1. Detecting old configuration settings
 * 2. Migrating them to local provider structure
 *
 * @param context Extension context
 * @returns Promise<void>
 */
export async function migrateToMultiProvider(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Check if migration has already been performed
        const alreadyMigrated = context.globalState.get<boolean>(LOCAL_PROVIDER_MIGRATION_FLAG, false);
        if (alreadyMigrated) {
            // Already migrated, nothing to do
            return;
        }

        const config = vscode.workspace.getConfiguration('gitmsgollama');
        let migrationPerformed = false;

        // Get old settings (from previous multi-provider version)
        const oldModel = config.get<string>('model');
        const oldApiKeyFromConfig = config.get<string>('openRouterApiKey');
        let oldApiKeyFromSecret: string | undefined;

        // Try to get old API key from SecretStorage (old location)
        try {
            oldApiKeyFromSecret = await context.secrets.get('openRouterApiKey');
        } catch (error) {
            console.error('Error reading old API key from SecretStorage:', error);
        }

        // Determine which API key to use (prefer SecretStorage over config)
        const oldApiKey = oldApiKeyFromSecret || oldApiKeyFromConfig;

        // Check if we have old configuration to migrate
        if (oldModel || oldApiKey) {
            // Set provider to 'local' (default for migration)
            await config.update('provider', 'local', vscode.ConfigurationTarget.Global);
            migrationPerformed = true;

            // Migrate model setting if we have an old model value
            if (oldModel) {
                await config.update('local.model', oldModel, vscode.ConfigurationTarget.Global);
            }

            // Mark migration as complete
            await context.globalState.update(LOCAL_PROVIDER_MIGRATION_FLAG, true);

            // Show information message to user if migration was performed
            if (migrationPerformed) {
                vscode.window.showInformationMessage(
                    'GitMsgOllama: Your configuration has been updated for local-only mode. ' +
                    'The extension now uses local AI models (Ollama/LM Studio).',
                    'Learn More',
                    'OK'
                );
            } else {
                // Mark as migrated even if no changes were made (no old config found)
                await context.globalState.update(LOCAL_PROVIDER_MIGRATION_FLAG, true);
            }
        } else {
            // No old configuration found, just mark as migrated
            await context.globalState.update(LOCAL_PROVIDER_MIGRATION_FLAG, true);
        }

    } catch (error: any) {
        console.error('Error during migration:', error);
        // Don't show error to user for migration issues - fail silently
        // The extension will still work with new settings
    }
}