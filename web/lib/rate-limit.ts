/**
 * In-Memory Rate Limiter for Authentication & Sensitive Endpoints
 * Protects against brute-force attacks and credential stuffing
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    store.forEach((value, key) => {
      if (now > value.resetAt) {
        store.delete(key);
      }
    });
  }, 5 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Check and increment rate limit for a specific identifier
 * @param identifier Unique key (e.g. `ip:1.2.3.4` or `login:user@example.com`)
 * @param maxAttempts Maximum allowed attempts in window (default: 5)
 * @param windowMs Time window in milliseconds (default: 15 minutes)
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): RateLimitResult {
  // Relax rate limits for local development / testing environments
  if (
    process.env.NODE_ENV !== "production" &&
    (identifier.includes("127.0.0.1") ||
      identifier.includes("::1") ||
      identifier.includes("localhost"))
  ) {
    return {
      allowed: true,
      remaining: 999,
      retryAfterSeconds: 0,
    };
  }

  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetAt) {
    store.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: Math.max(0, maxAttempts - 1),
      retryAfterSeconds: 0,
    };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - record.count),
    retryAfterSeconds: 0,
  };
}

/**
 * Reset rate limit for an identifier upon successful authentication
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

/**
 * Helper to extract client IP address from Next.js request headers
 */
export function getClientIp(headers: Headers): string {
  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}
