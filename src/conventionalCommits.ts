/**
 * Conventional Commits Support Module
 *
 * This module provides functionality for conventional commits format:
 * - Scope detection from changed file paths
 * - Commit message validation
 * - Breaking change detection
 * - Automatic reformatting of commit messages
 *
 * Conventional Commits Format: <type>(<scope>): <subject>
 * Example: feat(auth): add OAuth2 login support
 */

import * as vscode from 'vscode';

/**
 * Interface for conventional commit configuration
 */
export interface ConventionalCommitsConfig {
    enabled: boolean;
    types: string[];
    scopes: string[];
    enableScopeDetection: boolean;
    requireScope: boolean;
}

/**
 * Interface for commit message validation result
 */
export interface ValidationResult {
    valid: boolean;
    message?: string;
    type?: string;
    scope?: string;
    subject?: string;
    hasBreakingChange?: boolean;
}

/**
 * Interface for scope detection result
 */
export interface ScopeDetectionResult {
    scope: string | null;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
}

/**
 * Regular expression for conventional commit format
 * Matches: type(scope): subject or type: subject or type(scope)!: subject
 */
const CONVENTIONAL_COMMIT_REGEX = /^(\w+)(\(([^\)]+)\))?(!)?:\s*(.+)$/;

/**
 * Detects the scope from changed file paths
 *
 * This function analyzes the diff content to extract file paths and
 * attempts to determine a meaningful scope based on common patterns:
 * - src/auth/* -> auth
 * - src/api/* -> api
 * - src/components/ui/* -> ui
 * - docs/* -> docs
 *
 * @param diffContent - The git diff content
 * @returns Detected scope or null if no clear scope found
 */
export function detectScopeFromDiff(diffContent: string): ScopeDetectionResult {
    // Extract file paths from diff (lines starting with +++ or ---)
    const filePathRegex = /^[\+\-]{3}\s+[ab]\/(.+)$/gm;
    const filePaths: string[] = [];
    let match;

    while ((match = filePathRegex.exec(diffContent)) !== null) {
        const path = match[1];
        // Ignore /dev/null (new/deleted files marker)
        if (path !== '/dev/null') {
            filePaths.push(path);
        }
    }

    if (filePaths.length === 0) {
        return {
            scope: null,
            confidence: 'low',
            reason: 'No file paths found in diff'
        };
    }

    // Extract potential scopes from file paths
    const scopeCounts: Map<string, number> = new Map();

    for (const filePath of filePaths) {
        const parts = filePath.split('/');

        // Strategy 1: Look for common top-level directories
        if (parts.length >= 2 && parts[0] === 'src') {
            const scope = parts[1];
            scopeCounts.set(scope, (scopeCounts.get(scope) || 0) + 1);
        }
        // Strategy 2: Look for standalone directories (docs, tests, etc.)
        else if (parts.length >= 1) {
            const scope = parts[0];
            // Only consider certain common directories as scopes
            if (['docs', 'test', 'tests', 'scripts', 'config'].includes(scope)) {
                scopeCounts.set(scope, (scopeCounts.get(scope) || 0) + 1);
            }
        }

        // Strategy 3: Look for component/feature directories
        if (parts.length >= 3 && parts[0] === 'src' && parts[1] === 'components') {
            const scope = parts[2];
            scopeCounts.set(scope, (scopeCounts.get(scope) || 0) + 1);
        }

        // Strategy 4: Look for specific file types that might indicate scope
        const fileName = parts[parts.length - 1].toLowerCase();
        if (fileName.includes('auth')) {
            scopeCounts.set('auth', (scopeCounts.get('auth') || 0) + 0.5);
        }
        if (fileName.includes('api')) {
            scopeCounts.set('api', (scopeCounts.get('api') || 0) + 0.5);
        }
        if (fileName.includes('ui') || fileName.includes('component')) {
            scopeCounts.set('ui', (scopeCounts.get('ui') || 0) + 0.5);
        }
    }

    if (scopeCounts.size === 0) {
        return {
            scope: null,
            confidence: 'low',
            reason: 'No recognizable scope patterns found'
        };
    }

    // Find the most common scope
    let maxCount = 0;
    let detectedScope: string | null = null;
    let totalCounts = 0;

    for (const [scope, count] of scopeCounts.entries()) {
        totalCounts += count;
        if (count > maxCount) {
            maxCount = count;
            detectedScope = scope;
        }
    }

    // Determine confidence based on how dominant the scope is
    const dominance = maxCount / totalCounts;
    let confidence: 'high' | 'medium' | 'low';

    if (dominance >= 0.8) {
        confidence = 'high';
    } else if (dominance >= 0.5) {
        confidence = 'medium';
    } else {
        confidence = 'low';
    }

    return {
        scope: detectedScope,
        confidence,
        reason: `Found ${maxCount} occurrences of '${detectedScope}' out of ${filePaths.length} files`
    };
}

/**
 * Validates if a commit message follows conventional commits format
 *
 * @param message - The commit message to validate
 * @param config - Conventional commits configuration
 * @returns Validation result with details
 */
export function validateCommitMessage(
    message: string,
    config: ConventionalCommitsConfig
): ValidationResult {
    if (!config.enabled) {
        return { valid: true };
    }

    // Trim and check if message is empty
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
        return {
            valid: false,
            message: 'Commit message is empty'
        };
    }

    // Check if message matches conventional format
    const match = CONVENTIONAL_COMMIT_REGEX.exec(trimmedMessage);
    if (!match) {
        return {
            valid: false,
            message: 'Message does not follow conventional commits format: <type>(<scope>): <subject>'
        };
    }

    const [, type, , scope, breakingChange, subject] = match;

    // Validate type is in allowed list
    if (config.types.length > 0 && !config.types.includes(type)) {
        return {
            valid: false,
            message: `Type '${type}' is not in allowed types: ${config.types.join(', ')}`
        };
    }

    // Validate scope if required
    if (config.requireScope && !scope) {
        return {
            valid: false,
            message: 'Scope is required but not provided'
        };
    }

    // Validate scope is in allowed list (if scopes are specified)
    if (scope && config.scopes.length > 0 && !config.scopes.includes(scope)) {
        return {
            valid: false,
            message: `Scope '${scope}' is not in allowed scopes: ${config.scopes.join(', ')}`
        };
    }

    // Check subject is not empty
    if (!subject || subject.trim().length === 0) {
        return {
            valid: false,
            message: 'Commit subject is empty'
        };
    }

    // Check subject length (conventionally should be under 50 chars)
    if (subject.length > 72) {
        return {
            valid: false,
            message: 'Subject is too long (should be under 72 characters)'
        };
    }

    return {
        valid: true,
        type,
        scope: scope || undefined,
        subject,
        hasBreakingChange: breakingChange === '!'
    };
}

/**
 * Detects breaking changes in the diff content
 *
 * This function looks for patterns that typically indicate breaking changes:
 * - Removed functions/methods
 * - Removed exports
 * - Changed function signatures
 * - Removed or renamed classes
 *
 * @param diffContent - The git diff content
 * @returns True if breaking changes are detected
 */
export function detectBreakingChanges(diffContent: string): boolean {
    // Look for removed exports (common breaking change)
    const removedExportRegex = /^-\s*export\s+(function|class|const|let|var|interface|type)\s+\w+/gm;
    if (removedExportRegex.test(diffContent)) {
        return true;
    }

    // Look for removed public methods/functions
    const removedFunctionRegex = /^-\s*(public\s+)?(function|async\s+function)\s+\w+/gm;
    if (removedFunctionRegex.test(diffContent)) {
        return true;
    }

    // Look for removed class declarations
    const removedClassRegex = /^-\s*(export\s+)?(class|interface)\s+\w+/gm;
    if (removedClassRegex.test(diffContent)) {
        return true;
    }

    // Look for BREAKING CHANGE in commit message convention
    if (diffContent.includes('BREAKING CHANGE:') || diffContent.includes('BREAKING-CHANGE:')) {
        return true;
    }

    return false;
}

/**
 * Suggests a conventional commit format for a given message
 *
 * This function attempts to reformat a non-conventional commit message
 * into conventional commits format by detecting keywords and patterns.
 *
 * @param message - The original commit message
 * @param diffContent - The git diff content (for context)
 * @param config - Conventional commits configuration
 * @returns Suggested conventional commit message
 */
export function suggestConventionalFormat(
    message: string,
    diffContent: string,
    config: ConventionalCommitsConfig
): string {
    if (!config.enabled) {
        return message;
    }

    // If already valid, return as-is
    const validation = validateCommitMessage(message, config);
    if (validation.valid) {
        return message;
    }

    // Try to extract type from message keywords
    let type = 'chore'; // Default type
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('add') || lowerMessage.includes('implement') ||
        lowerMessage.includes('create') || lowerMessage.includes('new')) {
        type = 'feat';
    } else if (lowerMessage.includes('fix') || lowerMessage.includes('bug') ||
               lowerMessage.includes('resolve') || lowerMessage.includes('correct')) {
        type = 'fix';
    } else if (lowerMessage.includes('update') || lowerMessage.includes('improve') ||
               lowerMessage.includes('enhance')) {
        // Could be feat or refactor, check diff for more context
        if (diffContent.includes('function') || diffContent.includes('class')) {
            type = 'refactor';
        } else {
            type = 'feat';
        }
    } else if (lowerMessage.includes('remove') || lowerMessage.includes('delete')) {
        type = 'refactor';
    } else if (lowerMessage.includes('test')) {
        type = 'test';
    } else if (lowerMessage.includes('doc') || lowerMessage.includes('readme')) {
        type = 'docs';
    } else if (lowerMessage.includes('style') || lowerMessage.includes('format')) {
        type = 'style';
    }

    // Detect scope if enabled
    let scope: string | null = null;
    if (config.enableScopeDetection) {
        const scopeDetection = detectScopeFromDiff(diffContent);
        if (scopeDetection.confidence === 'high' || scopeDetection.confidence === 'medium') {
            scope = scopeDetection.scope;
        }
    }

    // Detect breaking changes
    const hasBreakingChange = detectBreakingChanges(diffContent);
    const breakingMarker = hasBreakingChange ? '!' : '';

    // Clean up the message to be a proper subject
    let subject = message.trim();

    // Remove trailing periods
    subject = subject.replace(/\.$/, '');

    // Ensure it starts with lowercase (conventional style)
    subject = subject.charAt(0).toLowerCase() + subject.slice(1);

    // Truncate if too long
    if (subject.length > 50) {
        subject = subject.substring(0, 47) + '...';
    }

    // Construct the conventional message
    if (scope) {
        return `${type}(${scope})${breakingMarker}: ${subject}`;
    } else {
        return `${type}${breakingMarker}: ${subject}`;
    }
}

/**
 * Gets conventional commits configuration from VS Code settings
 *
 * @returns Conventional commits configuration
 */
export function getConventionalCommitsConfig(): ConventionalCommitsConfig {
    const config = vscode.workspace.getConfiguration('gitmsgai.conventionalCommits');

    return {
        enabled: config.get<boolean>('enabled', true),
        types: config.get<string[]>('types', ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore']),
        scopes: config.get<string[]>('scopes', []),
        enableScopeDetection: config.get<boolean>('enableScopeDetection', true),
        requireScope: config.get<boolean>('requireScope', false)
    };
}

/**
 * Processes and validates a commit message with optional auto-correction
 *
 * This is the main function to be called from the extension.
 * It validates the message and attempts to reformat if invalid.
 *
 * @param message - The commit message to process
 * @param diffContent - The git diff content
 * @param config - Conventional commits configuration
 * @returns Processed commit message and validation result
 */
export function processCommitMessage(
    message: string,
    diffContent: string,
    config: ConventionalCommitsConfig
): { message: string; validation: ValidationResult; wasReformatted: boolean } {
    if (!config.enabled) {
        return {
            message,
            validation: { valid: true },
            wasReformatted: false
        };
    }

    // First validate the original message
    const validation = validateCommitMessage(message, config);

    if (validation.valid) {
        return {
            message,
            validation,
            wasReformatted: false
        };
    }

    // Try to reformat the message
    const reformattedMessage = suggestConventionalFormat(message, diffContent, config);

    // Validate the reformatted message
    const reformattedValidation = validateCommitMessage(reformattedMessage, config);

    return {
        message: reformattedMessage,
        validation: reformattedValidation,
        wasReformatted: true
    };
}
