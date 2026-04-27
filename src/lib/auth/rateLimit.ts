import "server-only";

/**
 * In-memory rate limiter for login attempts.
 * Tracks attempts per key (phone or IP) with a sliding window.
 * Resets on server restart — acceptable for MVP since Convex OTP
 * has its own persistent rate limiting.
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

const store = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// Clean up stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    const expired = entry.lockedUntil
      ? now > entry.lockedUntil
      : now - entry.firstAttempt > WINDOW_MS;
    if (expired) store.delete(key);
  }
}, 10 * 60 * 1000);

export function checkLoginRateLimit(key: string): {
  allowed: boolean;
  retryAfterMs?: number;
  message?: string;
} {
  const now = Date.now();
  const entry = store.get(key);

  // No previous attempts
  if (!entry) {
    store.set(key, { attempts: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true };
  }

  // Currently locked out
  if (entry.lockedUntil && now < entry.lockedUntil) {
    const retryAfterMs = entry.lockedUntil - now;
    const mins = Math.ceil(retryAfterMs / 60000);
    return {
      allowed: false,
      retryAfterMs,
      message: `Too many login attempts. Try again in ${mins} minute${mins > 1 ? "s" : ""}.`,
    };
  }

  // Window expired — reset
  if (now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { attempts: 1, firstAttempt: now, lockedUntil: null });
    return { allowed: true };
  }

  // Within window — check attempts
  entry.attempts += 1;

  if (entry.attempts > MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    return {
      allowed: false,
      retryAfterMs: LOCKOUT_MS,
      message: "Too many login attempts. Try again in 15 minutes.",
    };
  }

  return { allowed: true };
}

export function resetLoginRateLimit(key: string) {
  store.delete(key);
}
