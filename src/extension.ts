import * as vscode from 'vscode';
import axios, { CancelTokenSource } from 'axios';
import { CommitMessageCache } from './cache';
import {
    validateApiResponse,
    sanitizeErrorMessage,
    sanitizeDiffContent,
    createSafeError,
    validateApiKey,
    validateModel
} from './utils/security';
import {
    getConventionalCommitsConfig,
    processCommitMessage,
    detectScopeFromDiff
} from './conventionalCommits';
import {
    filterDiff,
    DEFAULT_EXCLUDE_PATTERNS
} from './diffFilter';
import {
    migrateApiKey,
    getApiKey,
    setApiKeySecure
} from './secretManager';
import { initializeRateLimiter, performSecurityChecks } from './securityIntegration';
import { selectModelCommand, initializeAutoUpdate, initializePricingCache } from './modelPicker';
import { AIProvider } from './providers/types';
import { getCompleteProviderConfig, validateProviderConfig } from './providers/providerManager';
import { makeApiRequest } from './providers/apiClient';
import { migrateToMultiProvider } from './migration';
import {
    selectProviderCommand,
    setApiKeyCommand as setApiKeyProviderCommand,
    testConnectionCommand
} from './commands/providerCommands';

// Create output channel for debugging
const outputChannel = vscode.window.createOutputChannel('GitMsgAI');

export function activate(context: vscode.ExtensionContext) {
    const cache = new CommitMessageCache(context);
    const version = vscode.extensions.getExtension('chaserich.gitmsgai')?.packageJSON.version || 'unknown';
    const now = new Date().toISOString();
    outputChannel.appendLine(`GitMsgAI extension activated - v${version} - ${now}`);

    // Initialize rate limiter (SEC-05)
    const rateLimiter = initializeRateLimiter(context);

    // Initialize pricing cache from OpenRouter
    initializePricingCache();

    // Initialize auto-update for models list
    initializeAutoUpdate(context);

    // Check version and show appropriate welcome/update messages
    (async () => {
        const hasBeenActivatedBefore = context.globalState.get<boolean>('hasBeenActivated', false);
        const lastVersion = context.globalState.get<string>('lastVersion');
        const currentVersion = version;

        // Check if this is an update (version changed)
        if (hasBeenActivatedBefore && lastVersion && lastVersion !== currentVersion) {
            await context.globalState.update('lastVersion', currentVersion);

            // Show a friendly update notification without requiring reload
            // The extension is already running the new code after update
            const action = await vscode.window.showInformationMessage(
                `GitMsgAI updated to v${currentVersion}! 🎉`,
                'What\'s New',
                'Dismiss'
            );

            if (action === 'What\'s New') {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/ChaseRichGit/gitmsgai/blob/main/CHANGELOG.md'));
            }
        }
        // First time activation
        else if (!hasBeenActivatedBefore) {
            // Mark as activated and store version
            await context.globalState.update('hasBeenActivated', true);
            await context.globalState.update('lastVersion', currentVersion);

            // Welcome the user and open settings
            const action = await vscode.window.showInformationMessage(
                'Welcome to GitMsgAI! 🎉 Get started by setting up your OpenRouter API key and selecting your preferred AI model.',
                'Open Settings',
                'Set API Key',
                'Select Model'
            );

            if (action === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', '@ext:chaserich.gitmsgai');
            } else if (action === 'Set API Key') {
                vscode.commands.executeCommand('gitmsgai.setApiKey');
            } else if (action === 'Select Model') {
                vscode.commands.executeCommand('gitmsgai.selectModel');
            }
        }
        // Existing installation, same version - just update stored version if needed
        else if (!lastVersion) {
            await context.globalState.update('lastVersion', currentVersion);
        }
    })();

    // Migrate from single-provider to multi-provider config
    (async () => {
        try {
            await migrateToMultiProvider(context);
        } catch (error: any) {
            console.error('Multi-provider migration error:', error);
        }
    })();

    // Perform automatic migration on activation (SEC-02, SEC-03)
    (async () => {
        try {
            const migrated = await migrateApiKey(context);
            if (migrated) {
                const action = await vscode.window.showInformationMessage(
                    'GitMsgAI: Your OpenRouter API key has been migrated to secure storage.',
                    'Learn More',
                    'OK'
                );

                if (action === 'Learn More') {
                    vscode.window.showInformationMessage(
                        'Your API key is now stored securely using VS Code\'s SecretStorage API instead of plain-text settings. ' +
                        'This improves security by encrypting your credentials.'
                    );
                }
            }
        } catch (error: any) {
            console.error('Migration error:', error);
        }
    })();

    // Register provider commands
    const setApiKeyCommand = vscode.commands.registerCommand('gitmsgai.setApiKey', async () => {
        await setApiKeyProviderCommand(context);
    });

    const selectProviderCommandDisposable = vscode.commands.registerCommand('gitmsgai.selectProvider', async () => {
        await selectProviderCommand(context);
    });

    const testConnectionCommandDisposable = vscode.commands.registerCommand('gitmsgai.testConnection', async () => {
        await testConnectionCommand(context);
    });

    let disposable = vscode.commands.registerCommand('gitmsgai.generateCommitMessage', async () => {
        try {
            // Perform security checks (SEC-05, SEC-07)
            const checkedRateLimiter = await performSecurityChecks(context, rateLimiter);
            if (!checkedRateLimiter) {
                return;
            }

            // Record this request for rate limiting (SEC-05)
            checkedRateLimiter.recordRequest();

            const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
            if (!gitExtension) {
                vscode.window.showErrorMessage('Git extension not found');
                return;
            }

            const git = gitExtension.getAPI(1);
            const repository = git.repositories[0];

            if (!repository) {
                vscode.window.showErrorMessage('No Git repository found');
                return;
            }

            // Get ALL changes (staged + unstaged)
            const stagedChanges = repository.state.indexChanges;
            const workingTreeChanges = repository.state.workingTreeChanges;

            outputChannel.appendLine(`Repository state from API:`);
            outputChannel.appendLine(`  - Staged files (indexChanges): ${stagedChanges.length}`);
            outputChannel.appendLine(`  - Working tree changes: ${workingTreeChanges.length}`);

            // Get diff for ALL changes (both staged and unstaged)
            outputChannel.appendLine(`Getting diff for all changes (staged + unstaged)...`);

            let changes = '';

            // Use repository.diff() with cached parameter
            // diff(true) = staged changes only
            // diff(false) = unstaged changes only

            // First, try to get staged changes
            try {
                const stagedDiff = await repository.diff(true);
                if (stagedDiff && stagedDiff.trim().length > 0) {
                    changes += stagedDiff;
                    outputChannel.appendLine(`Got staged diff: ${stagedDiff.length} characters`);
                }
            } catch (e) {
                outputChannel.appendLine(`Failed to get staged diff: ${e}`);
            }

            // Then, get unstaged changes (working tree vs index)
            try {
                const unstagedDiff = await repository.diff(false);
                if (unstagedDiff && unstagedDiff.trim().length > 0) {
                    // If we have both staged and unstaged, combine them
                    if (changes.length > 0) {
                        changes += '\n\n' + unstagedDiff;
                        outputChannel.appendLine(`Got unstaged diff: ${unstagedDiff.length} characters (combined with staged)`);
                    } else {
                        changes = unstagedDiff;
                        outputChannel.appendLine(`Got unstaged diff: ${changes.length} characters`);
                    }
                }
            } catch (e) {
                outputChannel.appendLine(`Failed to get unstaged diff: ${e}`);
            }

            // Handle brand new files (untracked files with status 7)
            // For these files, repository.diff() returns nothing because there's no "before" state
            // We need to generate a synthetic diff showing all content as additions
            const allFileChanges = [...stagedChanges, ...workingTreeChanges];
            const newFiles = allFileChanges.filter((change: any) => change.status === 7); // Status 7 = untracked/new file

            if (newFiles.length > 0) {
                outputChannel.appendLine(`Found ${newFiles.length} new/untracked files`);

                for (const newFile of newFiles) {
                    try {
                        const filePath = newFile.uri.fsPath;
                        const relativePath = vscode.workspace.asRelativePath(filePath);
                        outputChannel.appendLine(`  - Reading new file: ${relativePath}`);

                        // Read the file content
                        const fileContent = await vscode.workspace.fs.readFile(newFile.uri);
                        const contentString = Buffer.from(fileContent).toString('utf8');

                        // Generate a synthetic diff for the new file
                        // Format matches standard git diff output
                        const lines = contentString.split('\n');
                        const syntheticDiff = [
                            `diff --git a/${relativePath} b/${relativePath}`,
                            `new file mode 100644`,
                            `--- /dev/null`,
                            `+++ b/${relativePath}`,
                            `@@ -0,0 +1,${lines.length} @@`,
                            ...lines.map(line => `+${line}`)
                        ].join('\n');

                        // Append to changes
                        if (changes.length > 0) {
                            changes += '\n\n' + syntheticDiff;
                        } else {
                            changes = syntheticDiff;
                        }

                        outputChannel.appendLine(`  ✓ Generated synthetic diff for ${relativePath}: ${syntheticDiff.length} characters`);
                    } catch (fileError: any) {
                        outputChannel.appendLine(`  ✗ Failed to read new file ${newFile.uri.fsPath}: ${fileError.message}`);
                    }
                }
            }

            // Final check: do we have ANY diff content?
            if (!changes || changes.trim().length === 0) {
                const totalChanges = stagedChanges.length + workingTreeChanges.length;
                if (totalChanges > 0) {
                    vscode.window.showErrorMessage(
                        `Found ${totalChanges} changed files but could not get diff. Please check the "GitMsgAI" output panel.`
                    );
                    outputChannel.appendLine('Changed files:');
                    [...stagedChanges, ...workingTreeChanges].forEach((change: any, index: number) => {
                        if (index < 10) {
                            outputChannel.appendLine(`  - ${change.uri.fsPath} (status: ${change.status})`);
                        }
                    });
                } else {
                    // Check if this might be a first commit (no previous commits)
                    try {
                        const headCommit = await repository.getCommit('HEAD');
                        // If we got here, HEAD exists, so not a first commit
                        vscode.window.showErrorMessage(
                            'No changes found. Please make some changes to your files first.'
                        );
                    } catch (headError) {
                        // HEAD doesn't exist - this is likely a first commit scenario
                        outputChannel.appendLine('No HEAD commit found - this appears to be a first commit scenario');

                        const action = await vscode.window.showInformationMessage(
                            'This appears to be your first commit. Would you like to use a standard "First Commit" message?',
                            'Use "First Commit"',
                            'Enter Custom Message',
                            'Cancel'
                        );

                        if (action === 'Use "First Commit"') {
                            repository.inputBox.value = 'First Commit';
                            vscode.window.showInformationMessage('Applied "First Commit" message');
                        } else if (action === 'Enter Custom Message') {
                            const customMessage = await vscode.window.showInputBox({
                                prompt: 'Enter your first commit message',
                                placeHolder: 'e.g., Initial commit, Project setup, etc.',
                                value: 'First Commit'
                            });
                            if (customMessage && customMessage.trim().length > 0) {
                                repository.inputBox.value = customMessage;
                                vscode.window.showInformationMessage('Applied custom commit message');
                            }
                        }
                        return;
                    }
                }
                outputChannel.show();
                return;
            }

            outputChannel.appendLine(`✓ Got diff content: ${changes.length} characters`);
            outputChannel.appendLine(`First 500 chars of diff:\n${changes.substring(0, 500)}\n`);

            // Log all changed files
            const allChanges = [...stagedChanges, ...workingTreeChanges];
            if (allChanges.length > 0) {
                outputChannel.appendLine(`Changed files (${allChanges.length} total):`);
                allChanges.forEach((change: any, index: number) => {
                    if (index < 20) {
                        const staged = stagedChanges.includes(change) ? '[STAGED]' : '[UNSTAGED]';
                        outputChannel.appendLine(`  - ${staged} ${change.uri.fsPath} (${change.status})`);
                    }
                });
                if (allChanges.length > 20) {
                    outputChannel.appendLine(`  ... and ${allChanges.length - 20} more files`);
                }
            }

            // Get current provider from settings with backward compatibility
            const config = vscode.workspace.getConfiguration('gitmsgai');
            const currentProvider = config.get<string>('provider', 'openrouter') as AIProvider;

            // Get provider-specific model with fallback to old 'model' setting for backward compatibility
            let model = config.get<string>(`${currentProvider}.model`);
            if (!model) {
                // Fall back to old 'model' setting
                model = config.get<string>('model') || 'google/gemini-2.0-flash-exp:free';
            }

            // Get the API key from SecretStorage (SEC-01, SEC-02, SEC-03)
            const apiKey = await getApiKey(context);
            const promptTemplate = config.get<string>('prompt') || 'You are a Git commit message generator. Analyze ONLY the actual code changes provided below.\n\n**CRITICAL RULES:**\n1. ONLY analyze the changes shown in the diff below\n2. NEVER make up or assume changes that aren\'t in the diff\n3. If the diff is empty or you cannot see changes, output: ERROR: No changes detected\n4. Base your message ONLY on what you can see in the diff\n\n**Changes:**\n{changes}\n\n**Generate a DETAILED commit message following this format:**\n\n<type>(<scope>): <subject>\n\n<body>\n\n**Format Guidelines:**\n- Types: feat, fix, docs, style, refactor, test, chore\n- Subject: One-line summary (50-72 chars max)\n- Body: REQUIRED for multiple files or significant changes\n  * List major changes as bullet points\n  * Group related changes together\n  * Be specific about what changed in each area\n  * Use present tense ("add" not "added")\n\n**Rules:**\n1. If 5+ files changed, ALWAYS include a detailed body\n2. Group changes by category (security, docs, features, fixes)\n3. List key files or modules that changed\n4. Explain WHY for breaking changes\n5. Add \'!\' after type for BREAKING CHANGES\n\n**Example for multiple files:**\nfeat(security)!: implement comprehensive security enhancements\n\nSecurity improvements:\n- Add SecretStorage API for encrypted key storage\n- Implement rate limiting with sliding window algorithm\n- Add input validation and error sanitization\n- Filter sensitive files from diffs (.env, *.key, etc.)\n\nFeatures added:\n- Local caching of commit suggestions\n- Review mode with edit/regenerate options\n- Request timeout and cancellation support\n- Enhanced conventional commits validation\n\nDocumentation:\n- Add comprehensive README with security guide\n- Create SECURITY.md with best practices\n- Add CHANGELOG following Keep a Changelog format\n\nBREAKING CHANGE: API key now requires SecretStorage setup\n\n**Output ONLY the commit message. If you cannot see changes, output ERROR.**';

            // Debug: Log prompt template info
            const hasChangesPlaceholder = promptTemplate.includes('{changes}');
            const promptPreview = promptTemplate.substring(0, 200) + '...';
            outputChannel.appendLine(`Prompt template loaded from config: ${hasChangesPlaceholder ? 'HAS' : 'MISSING'} {changes} placeholder`);
            outputChannel.appendLine(`Prompt preview: ${promptPreview}`);
            const enableCache = config.get<boolean>('enableCache', false);
            const reviewBeforeApply = config.get<boolean>('reviewBeforeApply', false);
            const timeout = config.get<number>('timeout', 30) * 1000; // Convert to milliseconds
            const excludePatterns = config.get<string[]>('excludePatterns', DEFAULT_EXCLUDE_PATTERNS);
            const warnOnSensitiveFiles = config.get<boolean>('warnOnSensitiveFiles', true);

            // Filter sensitive files from diff (FEAT-03)
            outputChannel.appendLine(`Before filtering: ${changes.length} characters`);
            const filterResult = filterDiff(changes, excludePatterns);
            outputChannel.appendLine(`After filtering: ${filterResult.filteredDiff.length} characters, excluded ${filterResult.excludedFiles.length} files`);

            // Show warning if sensitive files were excluded (FEAT-03)
            if (warnOnSensitiveFiles && filterResult.excludedFiles.length > 0) {
                const fileList = filterResult.excludedFiles.join(', ');
                const fileCount = filterResult.excludedFiles.length;
                const fileWord = fileCount === 1 ? 'file' : 'files';
                vscode.window.showWarningMessage(
                    `Excluded ${fileCount} sensitive ${fileWord} from diff: ${fileList}`
                );
            }

            // Check if all files were excluded (FEAT-03)
            if (filterResult.allFilesExcluded) {
                vscode.window.showErrorMessage(
                    'All changed files match exclusion patterns. No changes to analyze. ' +
                    'Please review your gitmsgai.excludePatterns setting or stage different files.'
                );
                return;
            }

            // Use filtered diff instead of original changes
            const filteredChanges = filterResult.filteredDiff;

            // Verify we still have changes after filtering
            if (!filteredChanges || filteredChanges.trim().length === 0) {
                vscode.window.showErrorMessage(
                    'No changes remaining after filtering. All files were excluded or diff is empty.'
                );
                return;
            }

            // If API key not found in SecretStorage, prompt user to set it (SEC-01, SEC-02, SEC-03)
            if (!apiKey) {
                const action = await vscode.window.showErrorMessage(
                    'OpenRouter API key is not set. Please configure your API key to use GitMsgAI.',
                    'Set API Key',
                    'Cancel'
                );

                if (action === 'Set API Key') {
                    await vscode.commands.executeCommand('gitmsgai.setApiKey');
                }
                return;
            }

            // Validate API key (SEC-04)
            const apiKeyValidation = validateApiKey(apiKey);
            if (!apiKeyValidation.valid) {
                vscode.window.showErrorMessage(apiKeyValidation.message || 'Invalid API key');
                return;
            }

            // Validate model (SEC-04)
            const modelValidation = validateModel(model, currentProvider);
            if (!modelValidation.valid) {
                vscode.window.showWarningMessage(modelValidation.message || 'Invalid model name, using default');
            }

            // Sanitize diff content before sending (SEC-04)
            outputChannel.appendLine(`Before sanitization: ${filteredChanges.length} characters`);
            const sanitizedDiff = sanitizeDiffContent(filteredChanges);
            outputChannel.appendLine(`After sanitization: ${sanitizedDiff.length} characters`);

            // CRITICAL: Verify sanitized diff has actual content
            if (!sanitizedDiff || sanitizedDiff.trim().length < 10) {
                const msg = 'Diff content is empty or too short after sanitization. Cannot generate commit message without actual code changes.';
                vscode.window.showErrorMessage(msg);
                outputChannel.appendLine(`ERROR: ${msg}`);
                outputChannel.appendLine(`Sanitized diff: "${sanitizedDiff}"`);
                outputChannel.show();
                return;
            }

            // Log diff size for debugging (not the content, just metadata)
            outputChannel.appendLine(`Processing diff with ${sanitizedDiff.length} characters`);

            // Verify diff contains actual diff markers (lines starting with +, -, or @@)
            const hasDiffMarkers = /^[\+\-@]/m.test(sanitizedDiff);
            if (!hasDiffMarkers) {
                const msg = 'Diff does not contain expected change markers (+/-). Please ensure you have staged actual code changes.';
                vscode.window.showErrorMessage(msg);
                outputChannel.appendLine(`ERROR: ${msg}`);
                outputChannel.appendLine(`Diff preview: ${sanitizedDiff.substring(0, 500)}`);
                outputChannel.show();
                return;
            }

            // Check cache if enabled (using sanitized diff as cache key, without scope hint)
            if (enableCache) {
                const cachedEntry = cache.get(sanitizedDiff);
                if (cachedEntry) {
                    const timeAgo = CommitMessageCache.formatTimeAgo(cachedEntry.timestamp);
                    const action = await vscode.window.showInformationMessage(
                        `Found cached suggestion from ${timeAgo}`,
                        'Use Cached',
                        'Generate New'
                    );

                    if (action === 'Use Cached') {
                        repository.inputBox.value = cachedEntry.message;
                        vscode.window.showInformationMessage(`Using cached suggestion (from ${timeAgo})`);
                        return;
                    } else if (action !== 'Generate New') {
                        // User dismissed the dialog
                        return;
                    }
                    // If 'Generate New' is selected, continue with API call
                }
            }

            // Get conventional commits config and detect scope (FEAT-05)
            const conventionalConfig = getConventionalCommitsConfig();
            let enhancedPrompt = promptTemplate;
            let scopeHint = '';

            // If scope detection is enabled, add scope hint to diff (FEAT-05)
            if (conventionalConfig.enabled && conventionalConfig.enableScopeDetection) {
                const scopeDetection = detectScopeFromDiff(sanitizedDiff);
                if (scopeDetection.scope && scopeDetection.confidence !== 'low') {
                    scopeHint = `\n\n[HINT: Detected scope suggestion: "${scopeDetection.scope}" based on changed files]`;
                }
            }

            // Add scope hint to the diff content, not the template
            const diffWithHint = sanitizedDiff + scopeHint;

            // Validate provider configuration
            const validation = await validateProviderConfig(context, currentProvider);
            if (!validation.valid) {
                vscode.window.showErrorMessage(validation.message || 'Provider configuration is invalid');
                return;
            }

            // Get complete provider configuration
            const providerConfig = await getCompleteProviderConfig(context, currentProvider);

            // Generate commit message with review/timeout support
            await generateWithReview(
                repository,
                diffWithHint, // Use diff with scope hint if applicable
                apiKey!, // Validated above - won't be undefined here
                model,
                enhancedPrompt, // Use prompt template (not modified)
                enableCache,
                reviewBeforeApply,
                timeout,
                cache,
                currentProvider, // Pass the provider for multi-provider support
                context, // Pass context for provider config
                providerConfig // Pass complete provider config
            );

        } catch (error: any) {
            // Sanitize error message before displaying (SEC-06)
            const safeError = sanitizeErrorMessage(error);
            vscode.window.showErrorMessage('Error: ' + safeError);
        }
    });

    // Register clear cache command
    let clearCacheCommand = vscode.commands.registerCommand('gitmsgai.clearCache', async () => {
        try {
            const cacheSize = cache.getSize();
            if (cacheSize === 0) {
                vscode.window.showInformationMessage('Cache is already empty');
                return;
            }

            const action = await vscode.window.showWarningMessage(
                `Clear ${cacheSize} cached commit message${cacheSize !== 1 ? 's' : ''}?`,
                'Clear',
                'Cancel'
            );

            if (action === 'Clear') {
                await cache.clear();
                vscode.window.showInformationMessage('Commit message cache cleared successfully');
            }
        } catch (error: any) {
            vscode.window.showErrorMessage('Failed to clear cache: ' + error.message);
        }
    });

    // Register model picker command
    let selectModelCommandDisposable = vscode.commands.registerCommand('gitmsgai.selectModel', async () => {
        await selectModelCommand(context);
    });

    context.subscriptions.push(
        disposable,
        clearCacheCommand,
        setApiKeyCommand,
        selectModelCommandDisposable,
        selectProviderCommandDisposable,
        testConnectionCommandDisposable
    );
}

async function generateWithReview(
    repository: any,
    sanitizedDiff: string,
    apiKey: string,
    model: string,
    promptTemplate: string,
    enableCache: boolean,
    reviewBeforeApply: boolean,
    timeout: number,
    cache: CommitMessageCache,
    currentProvider: AIProvider,
    context: vscode.ExtensionContext,
    providerConfig: any
): Promise<void> {
    let cancelTokenSource: CancelTokenSource | undefined;

    try {
        // Show loading message with cancel support (FEAT-02)
        const commitMessage = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Generating commit message...",
            cancellable: true // Make progress cancellable
        }, async (progress, token) => {
            // Create cancel token for axios (FEAT-02)
            cancelTokenSource = axios.CancelToken.source();

            // Listen for user cancellation (FEAT-02)
            token.onCancellationRequested(() => {
                if (cancelTokenSource) {
                    cancelTokenSource.cancel('Request cancelled by user');
                }
            });

            try {
                // DEBUG: Check inputs before replacement
                outputChannel.appendLine(`DEBUG: promptTemplate length: ${promptTemplate.length}, has {changes}: ${promptTemplate.includes('{changes}')}`);
                outputChannel.appendLine(`DEBUG: Count of {changes} in template: ${(promptTemplate.match(/\{changes\}/g) || []).length}`);
                outputChannel.appendLine(`DEBUG: sanitizedDiff length: ${sanitizedDiff.length}`);

                // Count occurrences before replacement
                const beforeCount = (promptTemplate.match(/\{changes\}/g) || []).length;
                outputChannel.appendLine(`DEBUG: Found ${beforeCount} occurrences of {changes} to replace`);

                // Check if diff contains {changes} that would be re-inserted
                const diffContainsPlaceholder = sanitizedDiff.includes('{changes}');
                if (diffContainsPlaceholder) {
                    const countInDiff = (sanitizedDiff.match(/\{changes\}/g) || []).length;
                    outputChannel.appendLine(`DEBUG: WARNING - Diff itself contains {changes} ${countInDiff} times`);
                }

                // Prepare the final prompt - use split/join to avoid regex replacement issues
                // This prevents any {changes} in the diff from being treated as placeholders
                outputChannel.appendLine(`DEBUG: Using split/join method for replacement`);
                const parts = promptTemplate.split('{changes}');
                outputChannel.appendLine(`DEBUG: Split into ${parts.length} parts`);
                const finalPrompt = parts.join(sanitizedDiff);
                outputChannel.appendLine(`DEBUG: Joined parts back together`);

                // Check if any remain after replacement
                const afterCount = (finalPrompt.match(/\{changes\}/g) || []).length;
                outputChannel.appendLine(`DEBUG: After replacement, ${afterCount} occurrences of {changes} remain`);

                // DEBUGGING: Log what we're sending (first 500 chars of diff portion)
                const diffPreview = sanitizedDiff.substring(0, 500);
                outputChannel.appendLine('='.repeat(80));
                outputChannel.appendLine(`Sending request to ${currentProvider} API`);
                outputChannel.appendLine(`Model: ${model}`);
                outputChannel.appendLine(`Diff preview (first 500 chars):\n${diffPreview}`);
                outputChannel.appendLine(`Total prompt length: ${finalPrompt.length} characters`);
                outputChannel.appendLine(`DEBUG: finalPrompt still has {changes}: ${finalPrompt.includes('{changes}')}`);
                outputChannel.appendLine('='.repeat(80));

                // CRITICAL: Final check that {changes} was actually replaced
                // Note: The diff content itself may contain {changes} text - that's OK
                // We only error if the prompt still has the TEMPLATE placeholder (not the diff content)
                const expectedPlaceholders = (promptTemplate.match(/\{changes\}/g) || []).length;
                const actualPlaceholders = (finalPrompt.match(/\{changes\}/g) || []).length;
                const diffPlaceholders = (sanitizedDiff.match(/\{changes\}/g) || []).length;

                // If we have more {changes} than expected from the diff, template wasn't replaced
                if (actualPlaceholders > diffPlaceholders) {
                    const errMsg = 'CRITICAL ERROR: Prompt template variable {changes} was not replaced. This would cause the AI to hallucinate.';
                    outputChannel.appendLine(`ERROR: ${errMsg}`);
                    outputChannel.appendLine(`ERROR: Expected ${expectedPlaceholders} template placeholders to be replaced`);
                    outputChannel.appendLine(`ERROR: Found ${actualPlaceholders} total, diff has ${diffPlaceholders}`);
                    outputChannel.appendLine(`ERROR: Template preview: ${promptTemplate.substring(0, 300)}`);
                    outputChannel.show();
                    throw new Error(errMsg);
                }

                outputChannel.appendLine(`✓ Template replacement successful: ${actualPlaceholders} occurrences in final prompt are from diff content`);

                // Call provider API with timeout and cancel token using new provider system
                outputChannel.appendLine(`Using provider: ${currentProvider}`);
                const response = await makeApiRequest(
                    providerConfig,
                    finalPrompt,
                    timeout,
                    cancelTokenSource?.token
                );

                // Validate API response structure (SEC-04)
                const validation = validateApiResponse(response);
                if (!validation.valid) {
                    throw new Error(validation.message || 'Invalid API response');
                }

                // Use the sanitized content from validation (SEC-04)
                const commitMessage = validation.sanitizedContent!;

                // DEBUGGING: Log what AI returned
                outputChannel.appendLine('='.repeat(80));
                outputChannel.appendLine('Received response from API');
                outputChannel.appendLine(`Generated message: "${commitMessage}"`);
                outputChannel.appendLine('='.repeat(80));

                // Check if AI returned an error indicating it couldn't see changes
                // Only check at the start of the message to avoid false positives from valid content
                const messageStart = commitMessage.substring(0, 100).toLowerCase();
                if (messageStart.startsWith('error:') ||
                    messageStart.startsWith('error -') ||
                    messageStart.includes('no changes detected') ||
                    messageStart.includes('cannot see changes')) {
                    outputChannel.appendLine(`ERROR: AI returned error response: ${commitMessage}`);
                    outputChannel.show();
                    throw new Error('AI could not detect any changes in the diff. Please ensure you have made changes to your files.');
                }

                // CRITICAL: Check if message is suspiciously generic or template-like
                // Only check for truly generic one-liner messages, not detailed multi-paragraph ones
                const firstLine = commitMessage.split('\n')[0].trim();
                const lines = commitMessage.split('\n').filter(l => l.trim());
                const isShortMessage = lines.length <= 2;
                const isDetailedMessage = lines.length > 3 && commitMessage.length > 100;

                // Skip validation for detailed multi-paragraph messages
                if (isDetailedMessage) {
                    outputChannel.appendLine('✓ Message validation: Detailed message detected, skipping generic checks');
                    return commitMessage;
                }

                // Only check first line for generic patterns (one-liners only)
                const genericPatterns = [
                    /^(feat|fix|docs|chore|refactor):\s*update\s*$/i,
                    /^(feat|fix|docs|chore|refactor):\s*changes?\s*$/i,
                    /^(feat|fix|docs|chore|refactor):\s*modify\s*$/i,
                    /\{[a-z_]+\}/i,  // Contains template placeholders like {changes}, {variable}
                ];

                // Only apply "commit message" check to short messages
                if (isShortMessage && /commit\s*message/i.test(firstLine)) {
                    genericPatterns.push(/commit\s*message/i);
                }

                for (const pattern of genericPatterns) {
                    if (pattern.test(firstLine)) {
                        outputChannel.appendLine(`ERROR: Generated message appears generic/template: ${commitMessage}`);
                        outputChannel.show();
                        throw new Error(`AI generated a generic message: "${commitMessage}". This suggests it may not have seen your actual changes. Please verify your changes and try again.`);
                    }
                }

                return commitMessage;

            } catch (error: any) {
                // Handle specific error types (FEAT-02)
                if (axios.isCancel(error)) {
                    throw new Error('Request was cancelled by user');
                } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                    const timeoutSeconds = timeout / 1000;
                    throw new Error(`Request timed out after ${timeoutSeconds} seconds. Try increasing the timeout in settings.`);
                } else {
                    throw error;
                }
            }
        });

        if (!commitMessage) {
            return; // User cancelled
        }

        // Process commit message with conventional commits validation (FEAT-05)
        const conventionalConfig = getConventionalCommitsConfig();
        const processedResult = processCommitMessage(commitMessage, sanitizedDiff, conventionalConfig);

        // Show warning if message was reformatted (FEAT-05)
        if (processedResult.wasReformatted && conventionalConfig.enabled) {
            vscode.window.showInformationMessage(
                'Commit message was reformatted to follow conventional commits format'
            );
        }

        // Show warning if validation still failed after reformatting (FEAT-05)
        if (!processedResult.validation.valid && conventionalConfig.enabled) {
            vscode.window.showWarningMessage(
                `Commit message validation: ${processedResult.validation.message || 'Invalid format'}`
            );
        }

        // Use the processed message (either original or reformatted)
        const finalMessage = processedResult.message;

        // Store in cache if enabled (using sanitized diff as key)
        if (enableCache) {
            await cache.set(sanitizedDiff, finalMessage);
        }

        // Apply message based on review setting (FEAT-01)
        if (reviewBeforeApply) {
            await reviewAndApply(
                repository,
                finalMessage,
                sanitizedDiff,
                apiKey,
                model,
                promptTemplate,
                enableCache,
                timeout,
                cache,
                currentProvider,
                context,
                providerConfig
            );
        } else {
            // Directly apply to commit input box
            repository.inputBox.value = finalMessage;
            vscode.window.showInformationMessage('Commit message generated successfully');
        }

    } catch (error: any) {
        // Sanitize error message before displaying (SEC-06)
        const safeError = createSafeError('generating commit message', error);
        vscode.window.showErrorMessage(safeError);
    }
}

async function reviewAndApply(
    repository: any,
    commitMessage: string,
    sanitizedDiff: string,
    apiKey: string,
    model: string,
    promptTemplate: string,
    enableCache: boolean,
    timeout: number,
    cache: CommitMessageCache,
    currentProvider: AIProvider,
    context: vscode.ExtensionContext,
    providerConfig: any
): Promise<void> {
    // Show QuickPick with options (FEAT-01)
    const options = [
        { label: '✓ Accept', description: 'Apply this commit message', value: 'accept' },
        { label: '✎ Edit', description: 'Edit the message before applying', value: 'edit' },
        { label: '↻ Regenerate', description: 'Generate a new commit message', value: 'regenerate' },
        { label: '✗ Cancel', description: 'Discard this message', value: 'cancel' }
    ];

    const selected = await vscode.window.showQuickPick(options, {
        placeHolder: `Review: ${commitMessage}`,
        title: 'Review Commit Message'
    });

    if (!selected) {
        return; // User dismissed
    }

    switch (selected.value) {
        case 'accept':
            // Apply directly to commit input box (FEAT-01)
            repository.inputBox.value = commitMessage;
            vscode.window.showInformationMessage('Commit message applied');
            break;

        case 'edit':
            // Show InputBox pre-filled with message for editing (FEAT-01)
            const editedMessage = await vscode.window.showInputBox({
                value: commitMessage,
                prompt: 'Edit the commit message',
                placeHolder: 'Enter your commit message',
                validateInput: (text) => {
                    return text.trim().length === 0 ? 'Commit message cannot be empty' : null;
                }
            });

            if (editedMessage) {
                repository.inputBox.value = editedMessage;
                vscode.window.showInformationMessage('Edited commit message applied');
            }
            break;

        case 'regenerate':
            // Call the generation function again (FEAT-01)
            vscode.window.showInformationMessage('Regenerating commit message...');
            await generateWithReview(
                repository,
                sanitizedDiff,
                apiKey,
                model,
                promptTemplate,
                enableCache,
                true, // Keep review enabled
                timeout,
                cache,
                currentProvider,
                context,
                providerConfig
            );
            break;

        case 'cancel':
            // Do nothing (FEAT-01)
            vscode.window.showInformationMessage('Commit message discarded');
            break;
    }
}

export function deactivate() {}
