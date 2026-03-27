import * as vscode from 'vscode';
import { AIProvider, PROVIDER_ENDPOINTS } from '../providers/types';
import {
    getProviderApiKey,
    setProviderApiKey,
    validateProviderConfig,
    getCompleteProviderConfig
} from '../providers/providerManager';
import { makeApiRequest } from '../providers/apiClient';

/**
 * Command to select AI provider via QuickPick
 * Note: Now only supports local provider (Ollama/LM Studio)
 */
export async function selectProviderCommand(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Create QuickPick items - now only local
        const providerItems: vscode.QuickPickItem[] = [
            {
                label: 'Local',
                description: 'Local AI models (Ollama/LM Studio)',
                detail: 'Run AI models locally on your machine. No API key required.'
            }
        ];

        // Show QuickPick
        const selected = await vscode.window.showQuickPick(providerItems, {
            placeHolder: 'Select an AI provider for generating commit messages',
            title: 'GitMsgOllama: Select Provider'
        });

        if (!selected) {
            return; // User cancelled
        }

        // Update settings with selected provider
        const config = vscode.workspace.getConfiguration('gitmsgollama');
        await config.update('provider', AIProvider.Local, vscode.ConfigurationTarget.Global);

        vscode.window.showInformationMessage(`AI provider set to ${selected.label}`);
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to select provider: ${error.message}`);
    }
}

/**
 * Command to set API key for current provider
 * Note: Local provider doesn't require API key
 */
export async function setApiKeyCommand(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Get current provider from settings
        const config = vscode.workspace.getConfiguration('gitmsgollama');
        const providerString = config.get<string>('provider', 'local');
        const provider = providerString as AIProvider;

        // Check if provider requires API key
        const endpoint = PROVIDER_ENDPOINTS[provider];
        if (!endpoint.requiresApiKey) {
            vscode.window.showInformationMessage(
                `${provider} does not require an API key. Local models run without authentication.`
            );
            return;
        }

        vscode.window.showInformationMessage('API key setup is only needed for cloud providers.');

    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to set API key: ${error.message}`);
    }
}

/**
 * Command to test provider connection
 */
export async function testConnectionCommand(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Get current provider from settings
        const config = vscode.workspace.getConfiguration('gitmsgollama');
        const providerString = config.get<string>('provider', 'local');
        const provider = providerString as AIProvider;

        // Validate provider config
        const validation = await validateProviderConfig(context, provider);
        if (!validation.valid) {
            const action = await vscode.window.showErrorMessage(
                `Provider configuration invalid: ${validation.message}`,
                'Configure Provider',
                'Set API Key'
            );

            if (action === 'Configure Provider') {
                await vscode.commands.executeCommand('gitmsgollama.selectProvider');
            } else if (action === 'Set API Key') {
                await vscode.commands.executeCommand('gitmsgollama.setApiKey');
            }
            return;
        }

        // Get complete provider config
        const providerConfig = await getCompleteProviderConfig(context, provider);

        // Show progress while testing
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Testing ${provider} connection...`,
            cancellable: false
        }, async (progress) => {
            try {
                // Try a simple API call with test prompt
                const testPrompt = 'Respond with only the word "OK" if you can see this message.';

                progress.report({ message: 'Sending test request...' });

                const response = await makeApiRequest(
                    providerConfig,
                    testPrompt,
                    10000 // 10 second timeout for test
                );

                // Check response
                if (response && response.data) {
                    let responseText = '';

                    // Extract response based on provider format
                    if (response.data.choices && response.data.choices.length > 0) {
                        // OpenAI/OpenRouter/Local format
                        responseText = response.data.choices[0]?.message?.content || '';
                    } else if (response.data.content && response.data.content.length > 0) {
                        // Claude format
                        responseText = response.data.content[0]?.text || '';
                    }

                    vscode.window.showInformationMessage(
                        `Connection successful! ${provider} API is working correctly. Response: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        `Connection established but response format was unexpected. The API may still work for commit messages.`
                    );
                }
            } catch (error: any) {
                let errorMessage = error.message || 'Unknown error';

                // Provide helpful error messages
                if (errorMessage.includes('timeout')) {
                    errorMessage = `Connection timed out. Check your network connection and provider base URL.`;
                } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
                    errorMessage = `Authentication failed. Please check your API key.`;
                } else if (errorMessage.includes('404')) {
                    errorMessage = `Endpoint not found. Please check your provider base URL setting.`;
                } else if (errorMessage.includes('429')) {
                    errorMessage = `Rate limit exceeded. Please try again later.`;
                } else if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
                    errorMessage = `Provider server error. The service may be temporarily unavailable.`;
                }

                vscode.window.showErrorMessage(`Connection test failed: ${errorMessage}`);
            }
        });

    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to test connection: ${error.message}`);
    }
}