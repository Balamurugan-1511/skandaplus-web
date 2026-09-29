import { cookies, headers } from 'next/headers';
import { verifyToken, AUTH_COOKIE } from '@/lib/auth';

// Reads and verifies the session on the server — from the httpOnly cookie
// (browser/web clients) or an "Authorization: Bearer <token>" header
// (the mobile app, which never sends cookies). Cookie is checked first
// since that's the primary path; the header is a fallback for callers that
// have no cookie at all. Returns the decoded token payload
// ({ id, email, name, role }) or null if not logged in.
export async function getSessionUser() {
  const cookieStore = await cookies();
  let token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    const headerStore = await headers();
    const authHeader = headerStore.get('authorization') || headerStore.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice('Bearer '.length).trim();
    }
  }

  if (!token) return null;
  return verifyToken(token);
}

// Use at the top of any API route that only admins should be able to call.
// Returns the admin user on success, or null if the caller should be
// rejected (the route should then return a 401/403 response itself).
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return null;
  return user;
}
