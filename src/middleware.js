import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const AUTH_COOKIE = 'skandaplus_session';

// Edge middleware can't use the jsonwebtoken package (it needs Node APIs),
// so we verify the token with `jose`, which works in the Edge runtime.
async function getRole(request) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload.role || null;
  } catch {
    return null;
  }
}

// ---- Rate limiting -------------------------------------------------------
//
// Simple in-memory sliding-window limiter, keyed by "route:ip". Good enough
// to stop brute-force login attempts, registration spam, and contact-form
// flooding on a single running instance (e.g. one VPS process, or Vercel
// while it's warm). It resets on cold start and isn't shared across
// multiple instances — if this app is ever scaled to run on more than one
// server/instance at once, swap this for a shared store like Upstash Redis
// (@upstash/ratelimit) so every instance sees the same counts.
const RATE_LIMITS = {
  '/api/auth/login': { max: 10, windowMs: 60 * 1000 },
  '/api/auth/register': { max: 5, windowMs: 15 * 60 * 1000 },
  '/api/enquiries': { max: 3, windowMs: 10 * 60 * 1000 },
  '/api/auth/forgot-password': { max: 3, windowMs: 15 * 60 * 1000 },
};

const hits = new Map(); // key -> { count, resetAt }

function checkRateLimit(key, max, windowMs) {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false };
  }

  entry.count += 1;
  if (entry.count > max) {
    return { limited: true, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { limited: false };
}

function getClientIp(request) {
  // Behind Vercel/Netlify/most proxies the real client IP is the first
  // entry in x-forwarded-for; request.ip is only populated on some hosts.
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.ip || 'unknown';
}
// ---------------------------------------------------------------------------

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rate limit sensitive POST endpoints before anything else runs.
  const limitConfig = RATE_LIMITS[pathname];
  if (limitConfig && request.method === 'POST') {
    const ip = getClientIp(request);
    const { limited, retryAfterSeconds } = checkRateLimit(
      `${pathname}:${ip}`,
      limitConfig.max,
      limitConfig.windowMs
    );
    if (limited) {
      return NextResponse.json(
        {
          success: false,
          message: 'Too many attempts. Please wait a bit before trying again.',
        },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } }
      );
    }
  }

  const role = await getRole(request);

  // Guard every /admin page — only an admin-role login can reach the panel.
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Guard write operations on the content APIs — reading course/job listings
  // stays public, but creating/editing/deleting requires an admin login.
  const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const isGuardedApi = pathname.startsWith('/api/courses') || pathname.startsWith('/api/jobs');
  if (isGuardedApi && isWriteMethod && role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Admin login required.' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/courses/:path*',
    '/api/jobs/:path*',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/enquiries',
  ],
};
