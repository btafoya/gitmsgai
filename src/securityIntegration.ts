/**
 * Security integration for rate limiting (SEC-05) and user consent (SEC-07)
 *
 * To integrate this into extension.ts:
 * 1. Import RateLimiter at the top
 * 2. Add checkUserConsent function before activate()
 * 3. Initialize rateLimiter in activate()
 * 4. Add consent and rate limit checks at start of generateCommitMessage command
 * 5. Record API requests in generateWithReview before axios call
 */

import * as vscode from 'vscode';
import { RateLimiter } from './rateLimiter';

// Workspace state key for consent (SEC-07)
export const CONSENT_STATE_KEY = 'gitmsgollama.userConsent';

/**
 * Shows the user consent warning for first-run or when reset (SEC-07)
 */
export async function checkUserConsent(context: vscode.ExtensionContext): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('gitmsgollama');
    const showConsentWarning = config.get<boolean>('showConsentWarning', true);

    // If user has disabled the warning in settings, assume consent
    if (!showConsentWarning) {
        return true;
    }

    // Check if user has already given consent
    const hasConsented = context.workspaceState.get<boolean>(CONSENT_STATE_KEY);
    if (hasConsented) {
        return true;
    }

    // Show consent dialog
    const message = 'This extension sends your code changes to OpenRouter AI service to generate commit messages. Your code will be transmitted to an external API. Do you want to continue?';
    const result = await vscode.window.showWarningMessage(
        message,
        { modal: true },
        'Continue',
        'Don\'t Show Again',
        'Cancel'
    );

    if (result === 'Continue') {
        // User consents for this session only
        return true;
    } else if (result === 'Don\'t Show Again') {
        // User consents and wants to not be asked again
        await context.workspaceState.update(CONSENT_STATE_KEY, true);
        return true;
    }

    // User declined or dismissed
    return false;
}

/**
 * Initialize rate limiter and configuration watchers (SEC-05)
 * Call this in activate() after creating cache
 */
export function initializeRateLimiter(context: vscode.ExtensionContext): RateLimiter {
    // Initialize rate limiter with configurable limit (SEC-05)
    const config = vscode.workspace.getConfiguration('gitmsgollama');
    const rateLimitPerMinute = config.get<number>('rateLimitPerMinute', 10);
    const rateLimiter = new RateLimiter(rateLimitPerMinute);

    // Update rate limiter when configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('gitmsgollama.rateLimitPerMinute')) {
                const newLimit = vscode.workspace.getConfiguration('gitmsgollama').get<number>('rateLimitPerMinute', 10);
                rateLimiter.updateMaxRequests(newLimit);
            }
            // Reset consent if showConsentWarning is re-enabled
            if (e.affectsConfiguration('gitmsgollama.showConsentWarning')) {
                const showWarning = vscode.workspace.getConfiguration('gitmsgollama').get<boolean>('showConsentWarning', true);
                if (showWarning) {
                    context.workspaceState.update(CONSENT_STATE_KEY, undefined);
                }
            }
        })
    );

    return rateLimiter;
}

/**
 * Check consent and rate limits before making API call (SEC-05, SEC-07)
 * Returns RateLimiter if checks pass, null otherwise
 */
export async function performSecurityChecks(
    context: vscode.ExtensionContext,
    rateLimiter: RateLimiter
): Promise<RateLimiter | null> {
    // Check user consent first (SEC-07)
    const hasConsent = await checkUserConsent(context);
    if (!hasConsent) {
        vscode.window.showInformationMessage('Operation cancelled. Code changes will not be sent to external service.');
        return null;
    }

    // Check rate limit (SEC-05)
    const rateLimitCheck = rateLimiter.checkRateLimit();
    if (!rateLimitCheck.allowed) {
        const waitTime = RateLimiter.formatWaitTime(rateLimitCheck.waitTimeMs!);
        const nextTime = rateLimitCheck.nextRequestTime!.toLocaleTimeString();
        vscode.window.showErrorMessage(
            `Rate limit exceeded. Please wait ${waitTime} (next request available at ${nextTime}).`
        );
        return null;
    }

    return rateLimiter;
}
