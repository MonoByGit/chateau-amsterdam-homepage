// lib/auth/rate-limit.ts
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Entry = { count: number; firstAttemptAt: number };

let attempts = new Map<string, Entry>();

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs?: number } {
  const entry = attempts.get(key);
  if (!entry) {
    return { allowed: true };
  }

  const elapsed = Date.now() - entry.firstAttemptAt;
  if (elapsed > WINDOW_MS) {
    attempts.delete(key);
    return { allowed: true };
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: WINDOW_MS - elapsed };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string): void {
  const entry = attempts.get(key);
  if (!entry) {
    attempts.set(key, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export function resetRateLimiter(): void {
  attempts = new Map();
}
