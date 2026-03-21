// PermitWatch AI — Supabase Client (Lovable-ready)
// When VITE_SUPABASE_URL is set, provides Supabase client for persistence.
// This is the recommended backend for Lovable deployment.
//
// Setup:
//   1. Create project at https://supabase.com
//   2. Run the SQL schema (see README or docs/schema.sql)
//   3. Copy project URL + anon key to .env

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let _client = null;

/**
 * Check if Supabase is configured.
 */
export function isSupabaseConfigured() {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Get or create the Supabase client.
 * Lazy-loads @supabase/supabase-js only when actually needed.
 */
export async function getSupabaseClient() {
  if (_client) return _client;

  if (!isSupabaseConfigured()) {
    console.warn('[Supabase] Not configured — using local state only');
    return null;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return _client;
  } catch (e) {
    console.warn('[Supabase] @supabase/supabase-js not installed. Run: npm install @supabase/supabase-js');
    return null;
  }
}

// ── Opportunity Persistence ──

/**
 * Upsert opportunities into Supabase after a pipeline run.
 */
export async function upsertOpportunities(opportunities) {
  const client = await getSupabaseClient();
  if (!client) return { success: false, reason: 'no-supabase' };

  const { data, error } = await client
    .from('opportunities')
    .upsert(
      opportunities.map(({ saved, _raw, ...opp }) => opp),
      { onConflict: 'id' }
    );

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
  return { success: true, count: opportunities.length };
}

/**
 * Fetch opportunities from Supabase.
 */
export async function fetchStoredOpportunities(city, contractorType, filters = {}) {
  const client = await getSupabaseClient();
  if (!client) return null; // Fallback to local data

  let query = client.from('opportunities').select('*');

  if (city) query = query.eq('city', city);
  if (filters.confidenceThreshold) {
    query = query.gte('confidence_score', filters.confidenceThreshold);
  }
  if (filters.permitType && filters.permitType !== 'all') {
    query = query.eq('permit_type', filters.permitType);
  }
  if (filters.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%`);
  }

  query = query.order('confidence_score', { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(`Supabase fetch failed: ${error.message}`);

  // Filter by contractor type client-side (array contains)
  let results = data;
  if (contractorType && contractorType !== 'all') {
    results = results.filter(opp =>
      opp.contractor_personas_relevant?.includes(contractorType)
    );
  }

  return { data: results, total: results.length };
}

// ── Watchlist Persistence ──

export async function fetchWatchlist(userId) {
  const client = await getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from('watchlist')
    .select('opportunity_id, opportunities(*)')
    .eq('user_id', userId);

  if (error) throw new Error(`Watchlist fetch failed: ${error.message}`);
  return data.map(row => ({ ...row.opportunities, saved: true }));
}

export async function addWatchlistItem(userId, opportunityId) {
  const client = await getSupabaseClient();
  if (!client) return null;

  const { error } = await client
    .from('watchlist')
    .insert({ user_id: userId, opportunity_id: opportunityId });

  if (error && !error.message.includes('duplicate')) {
    throw new Error(`Watchlist add failed: ${error.message}`);
  }
  return { success: true };
}

export async function removeWatchlistItem(userId, opportunityId) {
  const client = await getSupabaseClient();
  if (!client) return null;

  const { error } = await client
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('opportunity_id', opportunityId);

  if (error) throw new Error(`Watchlist remove failed: ${error.message}`);
  return { success: true };
}

// ── Auth (Lovable uses Supabase Auth) ──

export async function supabaseSignIn(email, password) {
  const client = await getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data;
}

export async function supabaseSignUp(email, password, name) {
  const client = await getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function supabaseSignOut() {
  const client = await getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}
