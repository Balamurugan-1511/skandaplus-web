import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Single source of truth for password hashing. Every route that creates or
// checks a password should import from here instead of calling bcryptjs
// directly, so the cost factor and hash format only need to change in one
// place.

export const SALT_ROUNDS = 12; // bcrypt cost factor — 12 is the current minimum bar.

// bcrypt hash format: $2a$12$<22-char-salt><31-char-hash>
// The middle field is the cost factor the hash was created with.
const BCRYPT_HASH_RE = /^\$2[aby]\$(\d{2})\$/;

/**
 * Hash a plaintext password for storage. Always uses the current
 * SALT_ROUNDS, regardless of what any existing hash in the DB used.
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verify a plaintext password against a stored hash.
 *
 * Handles two cases:
 *  - A proper bcrypt hash -> bcrypt.compare (constant-time internally).
 *  - Anything that is NOT a bcrypt hash (e.g. a legacy plaintext value
 *    left over from before this app used bcrypt) -> constant-time string
 *    comparison, never `===`. This only exists so old accounts can still
 *    log in once, at which point they get transparently rehashed — see
 *    needsRehash() below and its use in the login route.
 */
export async function verifyPassword(plainPassword, storedHash) {
  if (!storedHash) return false;

  if (isBcryptHash(storedHash)) {
    return bcrypt.compare(plainPassword, storedHash);
  }

  // Legacy / non-bcrypt value in the DB — compare in constant time so we
  // don't leak timing information, even though this path only exists to
  // let a pre-migration account log in exactly once.
  return timingSafeStringEqual(plainPassword, storedHash);
}

/**
 * True if `storedHash` should be replaced next time we have the plaintext
 * password available (i.e. right after a successful login). Covers both
 * "not bcrypt at all" (plaintext, or an old MD5/SHA1 hash) and "bcrypt but
 * below our current cost factor".
 */
export function needsRehash(storedHash) {
  if (!isBcryptHash(storedHash)) return true;
  const match = storedHash.match(BCRYPT_HASH_RE);
  const cost = match ? parseInt(match[1], 10) : 0;
  return cost < SALT_ROUNDS;
}

function isBcryptHash(value) {
  return typeof value === 'string' && BCRYPT_HASH_RE.test(value);
}

// Constant-time comparison for the legacy fallback path. Never use `===`
// or `a === b` on secrets — that short-circuits on the first differing
// byte and leaks timing info. crypto.timingSafeEqual requires equal-length
// buffers, so on a length mismatch we still run a dummy comparison of the
// same cost before returning false, rather than returning immediately.
function timingSafeStringEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ''), 'utf8');
  const bufB = Buffer.from(String(b ?? ''), 'utf8');

  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}
