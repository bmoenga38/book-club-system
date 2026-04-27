/**
 * Convert raw errors (from Convex, fetch, NextAuth, etc.) into clean,
 * user-friendly messages. Strips stack traces, request IDs, and noisy prefixes.
 */

const FRIENDLY_DEFAULT = "Something went wrong. Please try again.";
const NETWORK_MESSAGE = "Connection lost. Check your internet and try again.";

/**
 * Network-related error patterns we should map to a friendly connection message.
 */
const NETWORK_PATTERNS = [
  /failed to fetch/i,
  /networkerror/i,
  /network request failed/i,
  /load failed/i,
  /aborted/i,
  /timeout/i,
  /timed out/i,
  /econnrefused/i,
  /enotfound/i,
  /enetunreach/i,
  /could not connect/i,
  /no internet/i,
  /offline/i,
];

/**
 * Server error patterns from Convex / Next.js / Sentry that we should
 * replace with a friendly default since they leak implementation details.
 */
const SERVER_NOISE_PATTERNS = [
  /^server error$/i,
  /^internal server error$/i,
  /^unknown error$/i,
  /^uncaught \(in promise\)/i,
  /minified react error #/i,
  /^typeerror:?\s*$/i,
];

function isNetworkError(text: string): boolean {
  return NETWORK_PATTERNS.some((p) => p.test(text));
}

function isPureServerNoise(text: string): boolean {
  return SERVER_NOISE_PATTERNS.some((p) => p.test(text));
}

/**
 * Strip Convex/Next.js error prefixes that leak implementation details.
 * Examples removed:
 *   - [CONVEX M(borrowings:request)] [Request ID: abc123]
 *   - [CONVEX Q(users:getProfile)]
 *   - Server Error
 *   - Error: ...
 *   - ConvexError: ...
 *   - Uncaught Error: ...
 */
function stripPrefixes(raw: string): string {
  let s = raw.trim();

  // Strip [CONVEX M(...)] / [CONVEX Q(...)] / [CONVEX A(...)] prefixes
  s = s.replace(/\[CONVEX [QMAH]\([^)]*\)\]\s*/gi, "");

  // Strip [Request ID: ...] markers anywhere
  s = s.replace(/\[Request ID:\s*[^\]]+\]\s*/gi, "");

  // Strip leading "Server Error" labels
  s = s.replace(/^Server Error[:\s]*/i, "");

  // Strip leading "Uncaught Error: " / "Uncaught (in promise) " noise
  s = s.replace(/^Uncaught(?:\s+\(in promise\))?(?:\s+Error)?:\s*/i, "");

  // Strip leading "ConvexError: " / "Error: " / "TypeError: " etc.
  s = s.replace(/^(?:Convex|Type|Range|Reference|Syntax|URI)?Error:\s*/i, "");

  return s.trim();
}

/**
 * Cut everything after the first stack-trace boundary.
 * Convex errors often contain "\n    at " or "\nat " stack frames.
 */
function stripStackTrace(raw: string): string {
  const idx = raw.search(/\n\s*at\s/);
  if (idx >= 0) return raw.slice(0, idx).trim();

  // Some errors use literal " at " on the same line
  const callMatch = raw.match(/\bat\s+\S+\s*\(/);
  if (callMatch && callMatch.index !== undefined) {
    return raw.slice(0, callMatch.index).trim();
  }

  return raw.trim();
}

/**
 * Pull out the inner message from common wrapper patterns.
 */
function extractMessage(raw: string): string {
  // "ConvexError: real message" → "real message"
  const convexMatch = raw.match(/ConvexError:\s*(.+?)(?:\n|$)/i);
  if (convexMatch?.[1]) return convexMatch[1].trim();

  // "Uncaught Error: real message" → "real message"
  const uncaughtMatch = raw.match(/Uncaught(?:\s+\(in promise\))?\s+Error:\s*(.+?)(?:\n|$)/i);
  if (uncaughtMatch?.[1]) return uncaughtMatch[1].trim();

  return raw;
}

/**
 * Main formatter. Accepts anything an error-handling site might receive:
 * Error instances, plain strings, unknown objects.
 */
export function formatError(err: unknown, fallback: string = FRIENDLY_DEFAULT): string {
  // Handle null/undefined
  if (err == null) return fallback;

  // Pull a string out of whatever was thrown
  let raw: string;
  if (typeof err === "string") {
    raw = err;
  } else if (err instanceof Error) {
    raw = err.message || err.toString();
  } else if (typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    raw = (err as { message: string }).message;
  } else {
    // Numbers, plain objects, etc. → can't render them safely
    return fallback;
  }

  if (!raw) return fallback;

  // Network failure short-circuit (do this BEFORE stripping)
  if (isNetworkError(raw)) return NETWORK_MESSAGE;

  // Try to extract a clean inner message
  const extracted = extractMessage(raw);

  // Strip stack trace, then prefixes, then trim
  let cleaned = stripStackTrace(extracted);
  cleaned = stripPrefixes(cleaned);
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Catch network patterns again post-strip
  if (isNetworkError(cleaned)) return NETWORK_MESSAGE;

  // If we ended up with empty string or pure server noise, use the fallback
  if (!cleaned || isPureServerNoise(cleaned)) return fallback;

  // Sentence-case nicety: capitalize first letter
  if (cleaned[0] && cleaned[0].toLowerCase() === cleaned[0]) {
    cleaned = cleaned[0].toUpperCase() + cleaned.slice(1);
  }

  // Cap length to keep toasts readable. If truncated, end with "…" — no period.
  if (cleaned.length > 200) {
    cleaned = cleaned.slice(0, 199).trimEnd() + "…";
    return cleaned;
  }

  // Add period if missing
  if (!/[.!?…]$/.test(cleaned)) cleaned += ".";

  return cleaned;
}
