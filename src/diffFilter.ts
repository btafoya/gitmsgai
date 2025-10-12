import { minimatch } from 'minimatch';

/**
 * Represents a single file section in a git diff output
 */
export interface DiffSection {
    /** The full diff content for this file including header and changes */
    content: string;
    /** The file path extracted from the diff header */
    filePath: string;
    /** The line number where this section starts in the original diff */
    startLine: number;
    /** The line number where this section ends in the original diff */
    endLine: number;
}

/**
 * Result of filtering a diff with sensitive file exclusions
 */
export interface FilterResult {
    /** The filtered diff content with sensitive files removed */
    filteredDiff: string;
    /** List of file paths that were excluded from the diff */
    excludedFiles: string[];
    /** Whether all files in the diff were excluded */
    allFilesExcluded: boolean;
}

/**
 * Parses a git diff output and extracts individual file sections
 *
 * @param diff - The raw git diff output
 * @returns Array of DiffSection objects, one per file
 *
 * @example
 * ```typescript
 * const diff = `diff --git a/file1.txt b/file1.txt
 * index 123..456
 * --- a/file1.txt
 * +++ b/file1.txt
 * @@ -1,1 +1,1 @@
 * -old
 * +new`;
 *
 * const sections = parseDiff(diff);
 * console.log(sections[0].filePath); // "file1.txt"
 * ```
 */
export function parseDiff(diff: string): DiffSection[] {
    if (!diff || diff.trim().length === 0) {
        return [];
    }

    const sections: DiffSection[] = [];
    const lines = diff.split('\n');
    let currentSection: { content: string[], filePath: string, startLine: number } | null = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for the start of a new file diff section
        // Format: "diff --git a/path/to/file b/path/to/file"
        if (line.startsWith('diff --git ')) {
            // Save the previous section if it exists
            if (currentSection) {
                sections.push({
                    content: currentSection.content.join('\n'),
                    filePath: currentSection.filePath,
                    startLine: currentSection.startLine,
                    endLine: i - 1
                });
            }

            // Extract file path from "diff --git a/path b/path"
            const match = line.match(/diff --git a\/(.+?) b\//);
            const filePath = match ? match[1] : '';

            // Start a new section
            currentSection = {
                content: [line],
                filePath: filePath,
                startLine: i
            };
        } else if (currentSection) {
            // Add line to current section
            currentSection.content.push(line);
        }
    }

    // Don't forget the last section
    if (currentSection) {
        sections.push({
            content: currentSection.content.join('\n'),
            filePath: currentSection.filePath,
            startLine: currentSection.startLine,
            endLine: lines.length - 1
        });
    }

    return sections;
}

/**
 * Checks if a file path matches any of the provided glob patterns
 *
 * @param filePath - The file path to check
 * @param patterns - Array of glob patterns (e.g., "*.env", "**\/secrets\/**")
 * @returns true if the file matches any pattern, false otherwise
 *
 * @example
 * ```typescript
 * matchesPattern('.env', ['.env*', '*.key']); // true
 * matchesPattern('config.js', ['.env*', '*.key']); // false
 * matchesPattern('secrets/api.key', ['**\/secrets\/**']); // true
 * ```
 */
export function matchesPattern(filePath: string, patterns: string[]): boolean {
    if (!filePath || patterns.length === 0) {
        return false;
    }

    // Test against each pattern
    for (const pattern of patterns) {
        // minimatch options:
        // - dot: true allows matching files starting with '.'
        // - matchBase: true allows patterns like "*.txt" to match "path/to/file.txt"
        if (minimatch(filePath, pattern, { dot: true, matchBase: true })) {
            return true;
        }
    }

    return false;
}

/**
 * Filters a git diff to exclude files matching sensitive patterns
 *
 * @param diff - The raw git diff output
 * @param excludePatterns - Array of glob patterns for files to exclude
 * @returns FilterResult containing the filtered diff and list of excluded files
 *
 * @example
 * ```typescript
 * const diff = `diff --git a/.env b/.env
 * ...
 * diff --git a/src/app.ts b/src/app.ts
 * ...`;
 *
 * const result = filterDiff(diff, ['.env*', '*.key']);
 * console.log(result.excludedFiles); // ['.env']
 * console.log(result.filteredDiff); // Contains only src/app.ts diff
 * ```
 */
export function filterDiff(diff: string, excludePatterns: string[]): FilterResult {
    // Handle empty diff or no patterns
    if (!diff || diff.trim().length === 0) {
        return {
            filteredDiff: '',
            excludedFiles: [],
            allFilesExcluded: false
        };
    }

    if (!excludePatterns || excludePatterns.length === 0) {
        return {
            filteredDiff: diff,
            excludedFiles: [],
            allFilesExcluded: false
        };
    }

    // Parse the diff into sections
    const sections = parseDiff(diff);

    if (sections.length === 0) {
        return {
            filteredDiff: diff,
            excludedFiles: [],
            allFilesExcluded: false
        };
    }

    // Filter sections
    const excludedFiles: string[] = [];
    const includedSections: DiffSection[] = [];

    for (const section of sections) {
        if (matchesPattern(section.filePath, excludePatterns)) {
            excludedFiles.push(section.filePath);
        } else {
            includedSections.push(section);
        }
    }

    // Build the filtered diff
    const filteredDiff = includedSections
        .map(section => section.content)
        .join('\n');

    const allFilesExcluded = includedSections.length === 0;

    return {
        filteredDiff: filteredDiff.trim(),
        excludedFiles,
        allFilesExcluded
    };
}

/**
 * Default patterns for sensitive files that should be excluded from diffs
 */
export const DEFAULT_EXCLUDE_PATTERNS = [
    '.env*',
    '*.key',
    '*.pem',
    '*.p12',
    '*.pfx',
    'credentials.json',
    'secrets.*',
    '*.secret',
    '**/secrets/**'
];
