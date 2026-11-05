import { RateLimitError } from "./errors";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding rate limiter.
 * @param key unique identifier (e.g. `ip:endpoint` or `userId:endpoint`)
 * @param limit maximum allowed requests within window
 * @param windowMs window duration in milliseconds
 */
export function checkRateLimit(key: string, limit = 10, windowMs = 60 * 1000): void {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (record.count >= limit) {
    throw new RateLimitError();
  }

  record.count += 1;
}

