/**
 * Rate limiter using a sliding window algorithm to prevent API abuse
 */
export class RateLimiter {
    private requestTimestamps: number[] = [];
    private maxRequests: number;
    private windowMs: number;

    /**
     * Creates a new rate limiter
     * @param maxRequests Maximum number of requests allowed in the time window
     * @param windowMs Time window in milliseconds (default: 60000 = 1 minute)
     */
    constructor(maxRequests: number, windowMs: number = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
    }

    /**
     * Checks if a request can be made based on rate limiting
     * @returns Object with allowed status and time until next request if denied
     */
    public checkRateLimit(): { allowed: boolean; waitTimeMs?: number; nextRequestTime?: Date } {
        const now = Date.now();

        // Remove timestamps outside the current window
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => now - timestamp < this.windowMs
        );

        // Check if we can make a request
        if (this.requestTimestamps.length < this.maxRequests) {
            return { allowed: true };
        }

        // Calculate time until the oldest request expires
        const oldestTimestamp = this.requestTimestamps[0];
        const waitTimeMs = this.windowMs - (now - oldestTimestamp);
        const nextRequestTime = new Date(now + waitTimeMs);

        return {
            allowed: false,
            waitTimeMs,
            nextRequestTime
        };
    }

    /**
     * Records a request timestamp
     */
    public recordRequest(): void {
        this.requestTimestamps.push(Date.now());
    }

    /**
     * Updates the rate limit configuration
     * @param maxRequests New maximum requests per window
     */
    public updateMaxRequests(maxRequests: number): void {
        this.maxRequests = maxRequests;
    }

    /**
     * Resets the rate limiter (clears all timestamps)
     */
    public reset(): void {
        this.requestTimestamps = [];
    }

    /**
     * Gets the current number of requests in the window
     */
    public getCurrentRequestCount(): number {
        const now = Date.now();
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => now - timestamp < this.windowMs
        );
        return this.requestTimestamps.length;
    }

    /**
     * Formats wait time into a human-readable string
     * @param waitTimeMs Wait time in milliseconds
     * @returns Formatted string like "30 seconds" or "2 minutes"
     */
    public static formatWaitTime(waitTimeMs: number): string {
        const seconds = Math.ceil(waitTimeMs / 1000);

        if (seconds < 60) {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }

        const minutes = Math.ceil(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
}
