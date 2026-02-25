// app/lib/supabaseAdmin.js
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,   // public URL is OK
  process.env.SUPABASE_SERVICE_ROLE_KEY   // ⚠ must be service role key, server-only
);