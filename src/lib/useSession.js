'use client';

import { useCallback, useEffect, useState } from 'react';

// Single source of truth for "who is logged in" on the client.
// Reads the real httpOnly session cookie via /api/auth/me — the same
// cookie the middleware checks — instead of trusting localStorage.
export function useSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    return fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        setUser(data?.success ? data.user : null);
        return data?.success ? data.user : null;
      })
      .catch(() => {
        setUser(null);
        return null;
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Clear the legacy localStorage session too, so every part of the
    // site (old and new) agrees the user is logged out.
    try {
      localStorage.removeItem('skandaplus_current_user');
    } catch {
      // localStorage may be unavailable (e.g. private browsing) — ignore.
    }
    setUser(null);
  }, []);

  return { user, loading, refresh, logout };
}
