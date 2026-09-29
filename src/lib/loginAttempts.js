// In-memory tracker for failed login attempts, keyed by account email.
//
// This sits on top of the IP-based rate limit already in middleware.js and
// adds two more layers, both scoped to the account being logged into:
//   1. Progressive backoff — each consecutive failure makes the *next*
//      attempt on that account wait longer before it's even evaluated.
//   2. Hard lockout — after MAX_ATTEMPTS consecutive failures, the account
//      is locked for LOCKOUT_DURATION_MS no matter what.
//
// Storage: in-memory Map, same tradeoff already documented on the rate
// limiter in middleware.js — resets on cold start, not shared across
// multiple instances. Fine for a single running instance/VPS/one warm
// Vercel lambda; if this app is ever scaled to run on more than one
// instance at once, swap this Map for a shared store (Upstash Redis via
// @upstash/ratelimit is the easiest drop-in — same get/set shape, just
// async) so every instance agrees on the count.

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const BACKOFF_BASE_MS = 1000; // 1s, doubles per consecutive failure
const BACKOFF_CAP_MS = 16000; // never make a legitimate user wait more than this between attempts

const attempts = new Map(); // email -> { failCount, lockedUntil, nextAttemptAt }

function getState(email) {
  return attempts.get(email) || { failCount: 0, lockedUntil: 0, nextAttemptAt: 0 };
}

/**
 * Call BEFORE touching the DB or checking a password. If this returns
 * blocked: true, the caller should return the exact same generic failure
 * response it would return for a wrong password — never a distinct
 * "locked out" or "slow down" message.
 */
export function checkBeforeAttempt(email) {
  const state = getState(email);
  const now = Date.now();

  if (now < state.lockedUntil) {
    return { blocked: true, reason: 'locked', retryAfterMs: state.lockedUntil - now };
  }
  if (now < state.nextAttemptAt) {
    return { blocked: true, reason: 'backoff', retryAfterMs: state.nextAttemptAt - now };
  }
  return { blocked: false };
}

/**
 * Call after ANY failed attempt on this email — wrong password, or no such
 * account at all. (Recording failures for non-existent accounts too is
 * what stops an attacker from telling a valid email from an invalid one
 * by watching whether lockout ever triggers.)
 *
 * Returns { justLocked } — true only on the exact attempt that crosses the
 * threshold, so the caller knows to fire the lockout email exactly once.
 */
export function recordFailure(email) {
  const now = Date.now();
  const state = getState(email);

  state.failCount += 1;

  if (state.failCount >= MAX_ATTEMPTS) {
    const justLocked = now >= state.lockedUntil; // not already mid-lockout
    state.lockedUntil = now + LOCKOUT_DURATION_MS;
    state.nextAttemptAt = state.lockedUntil;
    attempts.set(email, state);
    return { justLocked };
  }

  const backoffMs = Math.min(BACKOFF_BASE_MS * 2 ** (state.failCount - 1), BACKOFF_CAP_MS);
  state.nextAttemptAt = now + backoffMs;
  attempts.set(email, state);
  return { justLocked: false };
}

/** Call after a successful login — wipes all failure state for the account. */
export function recordSuccess(email) {
  attempts.delete(email);
}
