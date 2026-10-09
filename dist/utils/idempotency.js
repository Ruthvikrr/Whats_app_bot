/**
 * In-memory Idempotency Store for WhatsApp Webhook Events.
 *
 * NOTE FOR PRODUCTION:
 * This in-memory implementation is intended for single-instance / development environments.
 * If you deploy multiple server instances or restart the container, in-memory state is not shared or persisted.
 * In production environments with horizontal scaling, replace this with a distributed store
 * such as Redis using an atomic `SET key "1" EX 900 NX` (15-minute TTL) pattern.
 */
export class IdempotencyService {
    processedIds = new Map();
    ttlMs;
    maxCapacity;
    /**
     * @param ttlSeconds Time-to-live for stored message IDs in seconds (default: 15 minutes / 900s)
     * @param maxCapacity Maximum number of entries stored before trimming oldest (default: 5000)
     */
    constructor(ttlSeconds = 900, maxCapacity = 5000) {
        this.ttlMs = ttlSeconds * 1000;
        this.maxCapacity = maxCapacity;
    }
    /**
     * Checks if a message ID has already been seen and is still within TTL.
     */
    isDuplicate(messageId) {
        this.cleanupExpired();
        const entryTime = this.processedIds.get(messageId);
        if (!entryTime) {
            return false;
        }
        if (Date.now() - entryTime > this.ttlMs) {
            this.processedIds.delete(messageId);
            return false;
        }
        return true;
    }
    /**
     * Marks a message ID as processed.
     */
    markProcessed(messageId) {
        if (this.processedIds.size >= this.maxCapacity) {
            const oldestKey = this.processedIds.keys().next().value;
            if (oldestKey) {
                this.processedIds.delete(oldestKey);
            }
        }
        this.processedIds.set(messageId, Date.now());
    }
    /**
     * Cleans up expired entries.
     */
    cleanupExpired() {
        const now = Date.now();
        for (const [id, timestamp] of this.processedIds.entries()) {
            if (now - timestamp > this.ttlMs) {
                this.processedIds.delete(id);
            }
            else {
                // Map keys are ordered by insertion, so if this one is not expired, subsequent ones might still be newer
                break;
            }
        }
    }
    /**
     * Clears the store. Primarily used in test teardown.
     */
    clear() {
        this.processedIds.clear();
    }
    size() {
        return this.processedIds.size;
    }
}
export const idempotencyService = new IdempotencyService();
