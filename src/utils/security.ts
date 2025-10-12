/**
 * Security utilities for input validation and error sanitization
 * Implements SEC-04 (API response validation) and SEC-06 (error sanitization)
 */

/**
 * Maximum allowed length for commit messages
 * Increased to allow detailed multi-paragraph commit messages with comprehensive change descriptions
 */
const MAX_COMMIT_MESSAGE_LENGTH = 5000;

/**
 * Pattern to detect API keys (Bearer tokens, base64-like strings)
 */
const API_KEY_PATTERN = /(?:Bearer\s+)?[\w\-]{20,}|sk-[a-zA-Z0-9]{20,}/gi;

/**
 * Pattern to detect sensitive file paths
 */
const SENSITIVE_PATH_PATTERN = /(?:\/home\/[^\/\s]+|C:\\Users\\[^\\\/\s]+|\/Users\/[^\/\s]+)/gi;

/**
 * Dangerous characters and escape sequences to strip from commit messages
 */
const DANGEROUS_CHARS_PATTERN = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]|(?:\x1B\[[0-9;]*[a-zA-Z])/g;

/**
 * Validation result interface
 */
interface ValidationResult {
    valid: boolean;
    message?: string;
    sanitizedContent?: string;
}

/**
 * Validates the structure of an OpenRouter API response
 *
 * @param response - The API response object to validate
 * @returns ValidationResult indicating if the response is valid and containing sanitized content
 *
 * @example
 * ```typescript
 * const result = validateApiResponse(apiResponse);
 * if (result.valid) {
 *   console.log(result.sanitizedContent);
 * } else {
 *   console.error(result.message);
 * }
 * ```
 */
export function validateApiResponse(response: any): ValidationResult {
    // Check if response exists
    if (!response) {
        return {
            valid: false,
            message: 'API response is null or undefined'
        };
    }

    // Check if response.data exists (axios wraps response in data)
    const data: any = response.data || response;

    let content: string | undefined;

    // Try OpenAI/OpenRouter format first (choices array)
    if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        const firstChoice = data.choices[0];

        if (firstChoice?.message?.content) {
            content = firstChoice.message.content;
        }
    }
    // Try Claude/Anthropic format (content array)
    else if (data.content && Array.isArray(data.content) && data.content.length > 0) {
        const firstContent = data.content[0];

        if (firstContent?.text) {
            content = firstContent.text;
        } else if (typeof firstContent === 'string') {
            content = firstContent;
        }
    }
    // Try Google format (candidates array)
    else if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
        const firstCandidate = data.candidates[0];

        if (firstCandidate?.content?.parts && Array.isArray(firstCandidate.content.parts)) {
            content = firstCandidate.content.parts.map((p: any) => p.text).join('');
        }
    }

    // Validate content was extracted
    if (!content || typeof content !== 'string') {
        return {
            valid: false,
            message: 'Invalid API response: could not extract text content from response'
        };
    }

    // Sanitize the content
    const sanitizedContent = sanitizeCommitMessage(content);

    if (!sanitizedContent || sanitizedContent.trim().length === 0) {
        return {
            valid: false,
            message: 'Invalid API response: message content is empty after sanitization'
        };
    }

    return {
        valid: true,
        sanitizedContent: sanitizedContent
    };
}

/**
 * Sanitizes a commit message by removing dangerous characters and limiting length
 *
 * @param message - The raw commit message to sanitize
 * @returns Sanitized commit message safe for use
 *
 * @example
 * ```typescript
 * const safe = sanitizeCommitMessage(userInput);
 * ```
 */
export function sanitizeCommitMessage(message: string): string {
    if (!message || typeof message !== 'string') {
        return '';
    }

    // Trim whitespace
    let sanitized = message.trim();

    // Strip dangerous characters and escape sequences (ANSI codes, control chars)
    sanitized = sanitized.replace(DANGEROUS_CHARS_PATTERN, '');

    // Limit length
    if (sanitized.length > MAX_COMMIT_MESSAGE_LENGTH) {
        sanitized = sanitized.substring(0, MAX_COMMIT_MESSAGE_LENGTH);

        // Try to end at a word boundary if truncated
        const lastSpace = sanitized.lastIndexOf(' ');
        if (lastSpace > MAX_COMMIT_MESSAGE_LENGTH * 0.8) {
            sanitized = sanitized.substring(0, lastSpace);
        }
    }

    return sanitized;
}

/**
 * Sanitizes error messages by removing sensitive information
 *
 * @param error - The error object or message to sanitize
 * @returns Safe error message with sensitive data removed
 *
 * @example
 * ```typescript
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const safeMessage = sanitizeErrorMessage(error);
 *   vscode.window.showErrorMessage(safeMessage);
 * }
 * ```
 */
export function sanitizeErrorMessage(error: any): string {
    let errorMessage: string;

    // Extract error message
    if (error instanceof Error) {
        errorMessage = error.message;

        // Include response data if available (axios errors)
        if ((error as any).response?.data) {
            const responseData = (error as any).response.data;
            if (typeof responseData === 'string') {
                errorMessage += ': ' + responseData;
            } else if (responseData.error) {
                errorMessage += ': ' + JSON.stringify(responseData.error);
            }
        }
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
    } else {
        errorMessage = 'An unknown error occurred';
    }

    // Strip API keys and tokens
    errorMessage = errorMessage.replace(API_KEY_PATTERN, '***API_KEY***');

    // Strip sensitive file paths
    errorMessage = errorMessage.replace(SENSITIVE_PATH_PATTERN, '***PATH***');

    // Limit error message length
    if (errorMessage.length > 300) {
        errorMessage = errorMessage.substring(0, 297) + '...';
    }

    return errorMessage;
}

/**
 * Sanitizes diff content by limiting size and removing potential sensitive data
 *
 * @param diff - The git diff content to sanitize
 * @param maxLength - Maximum length allowed (default: 500000 characters for large context models like Gemini)
 * @returns Sanitized diff content
 *
 * @example
 * ```typescript
 * const safeDiff = sanitizeDiffContent(gitDiff);
 * ```
 */
export function sanitizeDiffContent(diff: string, maxLength: number = 500000): string {
    if (!diff || typeof diff !== 'string') {
        return '';
    }

    let sanitized = diff;

    // Limit diff size to prevent sending too much data
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
        sanitized += '\n... (diff truncated due to size)';
    }

    // Strip potential API keys from diff (in case they were accidentally added)
    sanitized = sanitized.replace(API_KEY_PATTERN, '***API_KEY***');

    return sanitized;
}

/**
 * Creates a safe error wrapper that sanitizes all error information
 *
 * @param context - Context string describing where the error occurred
 * @param error - The original error
 * @returns Sanitized error message with context
 *
 * @example
 * ```typescript
 * try {
 *   await fetchData();
 * } catch (error) {
 *   const safeError = createSafeError('fetching data', error);
 *   console.error(safeError);
 * }
 * ```
 */
export function createSafeError(context: string, error: any): string {
    const sanitizedError = sanitizeErrorMessage(error);
    return `Error ${context}: ${sanitizedError}`;
}

/**
 * Validates that required configuration values are present and valid
 *
 * @param apiKey - The API key to validate
 * @returns ValidationResult indicating if the API key is valid
 *
 * @example
 * ```typescript
 * const result = validateApiKey(apiKey);
 * if (!result.valid) {
 *   vscode.window.showErrorMessage(result.message);
 * }
 * ```
 */
export function validateApiKey(apiKey: string | undefined): ValidationResult {
    if (!apiKey || typeof apiKey !== 'string') {
        return {
            valid: false,
            message: 'API key is required. Please set your OpenRouter API key in settings.'
        };
    }

    if (apiKey.trim().length === 0) {
        return {
            valid: false,
            message: 'API key cannot be empty. Please set your OpenRouter API key in settings.'
        };
    }

    if (apiKey.length < 20) {
        return {
            valid: false,
            message: 'API key appears to be invalid (too short). Please check your OpenRouter API key.'
        };
    }

    return {
        valid: true
    };
}

/**
 * Validates model name format
 *
 * @param model - The model name to validate
 * @param provider - Provider type (optional, for provider-specific validation)
 * @returns ValidationResult indicating if the model name is valid
 *
 * @example
 * ```typescript
 * const result = validateModel(modelName, 'openrouter');
 * if (!result.valid) {
 *   console.warn(result.message);
 * }
 * ```
 */
export function validateModel(model: string | undefined, provider?: string): ValidationResult {
    if (!model || typeof model !== 'string') {
        return {
            valid: false,
            message: 'Model name is required'
        };
    }

    if (model.trim().length === 0) {
        return {
            valid: false,
            message: 'Model name cannot be empty'
        };
    }

    // Only OpenRouter requires provider/model format
    if (provider === 'openrouter' && !model.includes('/')) {
        return {
            valid: false,
            message: 'OpenRouter model name should be in format: provider/model-name'
        };
    }

    return {
        valid: true
    };
}
