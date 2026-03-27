import * as vscode from 'vscode';
import * as crypto from 'crypto';

export interface CacheEntry {
    message: string;
    timestamp: number;
}

export interface CacheData {
    [diffHash: string]: CacheEntry;
}

export class CommitMessageCache {
    private context: vscode.ExtensionContext;
    private cacheKey = 'gitmsgollama.messageCache';

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Generate a hash for the diff content
     */
    private hashDiff(diff: string): string {
        return crypto.createHash('sha256').update(diff).digest('hex');
    }

    /**
     * Get cached commit message for a given diff
     */
    public get(diff: string): CacheEntry | undefined {
        const diffHash = this.hashDiff(diff);
        const cache = this.context.workspaceState.get<CacheData>(this.cacheKey, {});
        return cache[diffHash];
    }

    /**
     * Store a commit message in the cache
     */
    public async set(diff: string, message: string): Promise<void> {
        const diffHash = this.hashDiff(diff);
        const cache = this.context.workspaceState.get<CacheData>(this.cacheKey, {});

        // Get cache size from configuration
        const config = vscode.workspace.getConfiguration('gitmsgollama');
        const cacheSize = config.get<number>('cacheSize') || 10;

        // Add new entry
        cache[diffHash] = {
            message,
            timestamp: Date.now()
        };

        // Enforce cache size limit
        const entries = Object.entries(cache);
        if (entries.length > cacheSize) {
            // Sort by timestamp and keep only the most recent entries
            const sorted = entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
            const limited = sorted.slice(0, cacheSize);
            const newCache: CacheData = {};
            for (const [hash, entry] of limited) {
                newCache[hash] = entry;
            }
            await this.context.workspaceState.update(this.cacheKey, newCache);
        } else {
            await this.context.workspaceState.update(this.cacheKey, cache);
        }
    }

    /**
     * Clear all cached commit messages
     */
    public async clear(): Promise<void> {
        await this.context.workspaceState.update(this.cacheKey, {});
    }

    /**
     * Get the number of entries in the cache
     */
    public getSize(): number {
        const cache = this.context.workspaceState.get<CacheData>(this.cacheKey, {});
        return Object.keys(cache).length;
    }

    /**
     * Format a timestamp to a human-readable "time ago" string
     */
    public static formatTimeAgo(timestamp: number): string {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);

        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }

        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        }

        const days = Math.floor(hours / 24);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
}
