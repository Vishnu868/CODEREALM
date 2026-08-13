/**
 * Supabase integration — accounts and cross-device progress.
 *
 * OPTIONAL BY DESIGN. With no credentials configured the app runs exactly as it
 * did in Phase 1: browser-local progress, no login screen, no network calls.
 * Setting VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY turns accounts on.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const cloudEnabled = Boolean(url && key)

/**
 * The Supabase SDK is ~70 kB gzipped — more than the entire rest of the app.
 * It is therefore imported dynamically, and only when credentials exist. A
 * player with no account configured never downloads a byte of it.
 */
let clientPromise = null

export function getClient() {
  if (!cloudEnabled) return Promise.resolve(null)
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
    )
  }
  return clientPromise
}

/** Pull the player's full state. Returns null when there is nothing stored yet. */
export async function fetchState(userId) {
  const supabase = await getClient()
  const [{ data: profile, error: pErr }, { data: rows, error: rErr }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('mission_progress').select('*').eq('user_id', userId)
  ])
  if (pErr) throw pErr
  if (rErr) throw rErr
  if (!profile) return null

  const progress = {}
  for (const r of rows ?? []) {
    progress[r.mission_id] = {
      bestTier: r.best_tier,
      attempts: r.attempts,
      hintsUsed: r.hints_used,
      languages: r.languages ?? []
    }
  }

  return {
    xp: profile.xp,
    streak: profile.streak,
    bestStreak: profile.best_streak,
    recoveries: profile.recoveries,
    inventory: profile.inventory ?? {},
    achievements: profile.achievements ?? [],
    settings: profile.settings ?? { reducedMotion: false, sound: false },
    progress
  }
}

/** Push profile-level counters. Called after any state change, debounced. */
export async function pushProfile(userId, s) {
  const supabase = await getClient()
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    xp: s.xp,
    streak: s.streak,
    best_streak: s.bestStreak,
    recoveries: s.recoveries,
    inventory: s.inventory,
    achievements: s.achievements,
    settings: s.settings,
    updated_at: new Date().toISOString()
  })
  if (error) throw error
}

/**
 * Push one mission's progress.
 *
 * The database rejects this if earlier levels are not cleared (see the
 * enforce_level_unlock trigger), so a client bug that skips a level surfaces as
 * an error rather than as corrupt saved state.
 */
export async function pushProgress(userId, missionId, level, entry) {
  const supabase = await getClient()
  const { error } = await supabase.from('mission_progress').upsert({
    user_id: userId,
    mission_id: missionId,
    level,
    best_tier: entry.bestTier ?? null,
    attempts: entry.attempts ?? 0,
    hints_used: entry.hintsUsed ?? 0,
    languages: entry.languages ?? [],
    first_cleared_at: entry.bestTier ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,mission_id' })
  if (error) throw error
}

/** Append to the submission log. Failures here are non-fatal to gameplay. */
export async function logSubmission(userId, missionId, language, sourceCode, tier, passed, runtimeMs) {
  const supabase = await getClient()
  const { error } = await supabase.from('submissions').insert({
    user_id: userId,
    mission_id: missionId,
    language,
    source_code: sourceCode,
    tier: tier ?? null,
    passed,
    runtime_ms: runtimeMs ?? null
  })
  if (error) console.warn('submission log failed:', error.message)
}

/**
 * Merge a local (signed-out) save into a cloud save on first login, so progress
 * made before signing up is not thrown away. Higher value wins on every field.
 */
export function mergeStates(local, cloud) {
  if (!cloud) return local
  if (!local) return cloud
  const rank = { bronze: 1, silver: 2, gold: 3 }
  const progress = { ...cloud.progress }
  for (const [id, l] of Object.entries(local.progress ?? {})) {
    const c = progress[id]
    progress[id] = !c
      ? l
      : {
          bestTier: (rank[l.bestTier] ?? 0) > (rank[c.bestTier] ?? 0) ? l.bestTier : c.bestTier,
          attempts: Math.max(l.attempts ?? 0, c.attempts ?? 0),
          hintsUsed: Math.max(l.hintsUsed ?? 0, c.hintsUsed ?? 0),
          languages: [...new Set([...(l.languages ?? []), ...(c.languages ?? [])])]
        }
  }
  const inventory = { ...cloud.inventory }
  for (const [k, v] of Object.entries(local.inventory ?? {})) {
    inventory[k] = Math.max(v, inventory[k] ?? 0)
  }
  return {
    xp: Math.max(local.xp, cloud.xp),
    streak: Math.max(local.streak, cloud.streak),
    bestStreak: Math.max(local.bestStreak, cloud.bestStreak),
    recoveries: Math.max(local.recoveries, cloud.recoveries),
    inventory,
    achievements: [...new Set([...(local.achievements ?? []), ...(cloud.achievements ?? [])])],
    settings: cloud.settings ?? local.settings,
    progress
  }
}

/** Auth helpers, so callers never need the client directly. */
export async function authSignIn(email, password) {
  const supabase = await getClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function authSignUp(email, password) {
  const supabase = await getClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export async function authSignOut() {
  const supabase = await getClient()
  await supabase.auth.signOut()
}

/** Current session, plus a subscription to changes. Returns an unsubscribe fn. */
export async function watchSession(onChange) {
  const supabase = await getClient()
  const { data } = await supabase.auth.getSession()
  onChange(data.session ?? null)
  const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => onChange(s ?? null))
  return () => sub.subscription.unsubscribe()
}
