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
 */
export async function selectProviderCommand(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Create QuickPick items for all providers
        const providerItems: vscode.QuickPickItem[] = [
            {
                label: 'OpenRouter',
                description: 'Access 400+ models from multiple providers',
                detail: 'Unified API for OpenAI, Anthropic, Google, and more. Free and paid models available.'
            },
            {
                label: 'OpenAI',
                description: 'Official OpenAI API',
                detail: 'GPT-4, GPT-4 Turbo, GPT-3.5 Turbo. Requires OpenAI API key.'
            },
            {
                label: 'Google',
                description: 'Google AI Studio',
                detail: 'Gemini 2.0 Flash, Gemini 1.5 Pro/Flash. Requires Google AI API key.'
            },
            {
                label: 'Claude',
                description: 'Anthropic Claude API',
                detail: 'Claude 3.5 Sonnet, Claude 3 Opus/Haiku. Requires Anthropic API key.'
            },
            {
                label: 'Local',
                description: 'Local AI models',
                detail: 'Ollama, LM Studio, or other local servers. No API key required.'
            }
        ];

        // Show QuickPick
        const selected = await vscode.window.showQuickPick(providerItems, {
            placeHolder: 'Select an AI provider for generating commit messages',
            title: 'GitMsgAI: Select Provider'
        });

        if (!selected) {
            return; // User cancelled
        }

        // Map label to provider enum
        const providerMap: Record<string, AIProvider> = {
            'OpenRouter': AIProvider.OpenRouter,
            'OpenAI': AIProvider.OpenAI,
            'Google': AIProvider.Google,
            'Claude': AIProvider.Claude,
            'Local': AIProvider.Local
        };

        const provider = providerMap[selected.label];
        if (!provider) {
            vscode.window.showErrorMessage('Invalid provider selected');
            return;
        }

        // Update settings with selected provider
        const config = vscode.workspace.getConfiguration('gitmsgai');
        await config.update('provider', provider, vscode.ConfigurationTarget.Global);

        vscode.window.showInformationMessage(`AI provider set to ${selected.label}`);

        // Check if API key is needed
        const endpoint = PROVIDER_ENDPOINTS[provider];
        if (endpoint.requiresApiKey) {
            const apiKey = await getProviderApiKey(context, provider);
            if (!apiKey) {
                const action = await vscode.window.showInformationMessage(
                    `${selected.label} requires an API key. Would you like to set it now?`,
                    'Set API Key',
                    'Later'
                );

                if (action === 'Set API Key') {
                    await setApiKeyCommand(context);
                }
            }
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to select provider: ${error.message}`);
    }
}

/**
 * Command to set API key for current provider
 */
export async function setApiKeyCommand(context: vscode.ExtensionContext): Promise<void> {
    try {
        // Get current provider from settings
        const config = vscode.workspace.getConfiguration('gitmsgai');
        const providerString = config.get<string>('provider', 'openrouter');
        const provider = providerString as AIProvider;

        // Check if provider requires API key
        const endpoint = PROVIDER_ENDPOINTS[provider];
        if (!endpoint.requiresApiKey) {
            vscode.window.showInformationMessage(
                `${provider} does not require an API key. Local models run without authentication.`
            );
            return;
        }

        // Provider-specific instructions and URLs
        const providerInfo: Record<AIProvider, { name: string; url: string; pricingUrl?: string; instructions: string; placeholder: string }> = {
            [AIProvider.OpenRouter]: {
                name: 'OpenRouter',
                url: 'https://openrouter.ai/keys',
                pricingUrl: 'https://openrouter.ai/models',
                instructions: 'Get your API key from OpenRouter. Visit the URL below and create a new API key.',
                placeholder: 'sk-or-v1-...'
            },
            [AIProvider.OpenAI]: {
                name: 'OpenAI',
                url: 'https://platform.openai.com/api-keys',
                pricingUrl: 'https://openai.com/api/pricing/',
                instructions: 'Get your API key from OpenAI Platform. Visit the URL below and create a new API key.',
                placeholder: 'sk-...'
            },
            [AIProvider.Google]: {
                name: 'Google AI',
                url: 'https://makersuite.google.com/app/apikey',
                pricingUrl: 'https://ai.google.dev/pricing',
                instructions: 'Get your API key from Google AI Studio. Visit the URL below and create a new API key.',
                placeholder: 'AI...'
            },
            [AIProvider.Claude]: {
                name: 'Anthropic Claude',
                url: 'https://console.anthropic.com/settings/keys',
                pricingUrl: 'https://www.anthropic.com/pricing#anthropic-api',
                instructions: 'Get your API key from Anthropic Console. Visit the URL below and create a new API key.',
                placeholder: 'sk-ant-...'
            },
            [AIProvider.Local]: {
                name: 'Local',
                url: '',
                instructions: '',
                placeholder: ''
            }
        };

        const info = providerInfo[provider];

        // Show instructions with option to open URL
        const buttons: string[] = ['Open API Keys', 'Continue'];
        if (info.pricingUrl) {
            buttons.splice(1, 0, 'View Pricing');
        }

        const action = await vscode.window.showInformationMessage(
            info.instructions,
            ...buttons
        );

        if (action === 'Open API Keys') {
            vscode.env.openExternal(vscode.Uri.parse(info.url));
        } else if (action === 'View Pricing' && info.pricingUrl) {
            vscode.env.openExternal(vscode.Uri.parse(info.pricingUrl));
        } else if (action !== 'Continue') {
            return; // User cancelled
        }

        // Show input box with password masking
        const apiKey = await vscode.window.showInputBox({
            prompt: `Enter your ${info.name} API Key`,
            password: true,
            ignoreFocusOut: true,
            placeHolder: info.placeholder,
            validateInput: (value) => {
                if (!value || value.trim() === '') {
                    return 'API key cannot be empty';
                }

                // Basic validation for known prefixes
                if (provider === AIProvider.OpenRouter && !value.startsWith('sk-or-')) {
                    return 'OpenRouter API keys typically start with "sk-or-"';
                } else if (provider === AIProvider.OpenAI && !value.startsWith('sk-')) {
                    return 'OpenAI API keys typically start with "sk-"';
                } else if (provider === AIProvider.Claude && !value.startsWith('sk-ant-')) {
                    return 'Claude API keys typically start with "sk-ant-"';
                }

                return null;
            }
        });

        if (!apiKey) {
            return; // User cancelled
        }

        // Save API key using setProviderApiKey
        await setProviderApiKey(context, provider, apiKey);
        vscode.window.showInformationMessage(`${info.name} API key has been saved securely.`);

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
        const config = vscode.workspace.getConfiguration('gitmsgai');
        const providerString = config.get<string>('provider', 'openrouter');
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
                await vscode.commands.executeCommand('gitmsgai.selectProvider');
            } else if (action === 'Set API Key') {
                await vscode.commands.executeCommand('gitmsgai.setApiKey');
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
