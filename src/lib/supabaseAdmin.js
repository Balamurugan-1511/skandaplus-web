import { createClient } from '@supabase/supabase-js';

// SERVER-ONLY. Uses the service_role key, which bypasses Storage RLS —
// never import this file from a 'use client' component or expose the key
// to the browser. It's only used inside API routes.
let client = null;

export function getSupabaseAdmin() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase is not configured: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env'
    );
  }

  client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

// Uploads a Buffer to a bucket and returns its public URL.
export async function uploadToBucket(bucket, path, buffer, contentType) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
