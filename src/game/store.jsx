import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
  cloudEnabled, fetchState, pushProfile, pushProgress, mergeStates,
  authSignIn, authSignUp, authSignOut, watchSession
} from './cloud'
import { STREAK_REWARDS, ACHIEVEMENTS, calculateXp, TIER_RANK } from './rules'

/**
 * Persistence.
 *
 * Two modes, decided by whether Supabase credentials are configured:
 *
 *   Signed out / no credentials — progress lives in this browser only, under
 *   the key below. Clearing site data erases it. The UI says so.
 *
 *   Signed in — progress syncs to Supabase and follows the player across
 *   devices. Local state is still written first so the game never blocks on the
 *   network, then pushed in the background.
 *
 * Local progress made before signing up is merged into the cloud save on first
 * login rather than discarded.
 */
const STORAGE_KEY = 'code-runner:prototype-save:v1'

const EMPTY = {
  xp: 0,
  streak: 0,
  bestStreak: 0,
  recoveries: 0,
  progress: {},          // missionId -> { bestTier, attempts, hintsUsed, languages[] }
  inventory: {},         // itemId -> count
  achievements: [],
  settings: { reducedMotion: false, sound: false }
}

const Ctx = createContext(null)

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    return { ...EMPTY, ...JSON.parse(raw) }
  } catch {
    return EMPTY
  }
}

export function GameProvider({ children, catalogue }) {
  const [state, setState] = useState(load)
  const [session, setSession] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)
  const hydrated = useRef(false)
  const pushTimer = useRef(null)

  // Local write happens on every change, always. The cloud is a mirror, never
  // the thing the UI waits on.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { }
  }, [state])

  // ---- auth session ----
  useEffect(() => {
    if (!cloudEnabled) return
    let unsubscribe = null
    let dead = false
    watchSession((s) => {
      if (dead) return
      setSession(s)
      if (!s) hydrated.current = false
    }).then((fn) => { unsubscribe = fn; if (dead) fn() })
      .catch((err) => setSyncError(err.message))
    return () => { dead = true; unsubscribe?.() }
  }, [])

  // ---- pull on sign-in, merging whatever was earned while signed out ----
  useEffect(() => {
    if (!cloudEnabled || !session?.user || hydrated.current) return
    let cancelled = false
    setSyncing(true)
    fetchState(session.user.id)
      .then(async (cloud) => {
        if (cancelled) return
        hydrated.current = true

        let merged = null
        setState((local) => {
          merged = mergeStates(local, cloud)
          return merged
        })

        // Backfill: levels cleared BEFORE signing up exist only in local state,
        // and pushProgress otherwise runs only on a submit — so without this
        // they would never reach the database. Push them in ascending level
        // order, because the schema rejects a cleared level whose predecessors
        // are not yet cleared.
        if (!merged) return
        const byLevel = [...catalogue].sort((a, b) => a.level - b.level)
        for (const mission of byLevel) {
          const entry = merged.progress[mission.id]
          if (!entry?.bestTier) continue
          const already = cloud?.progress?.[mission.id]?.bestTier
          if (already === entry.bestTier) continue
          try {
            await pushProgress(session.user.id, mission.id, mission.level, entry)
          } catch (err) {
            setSyncError(err.message)
            break
          }
        }
        await pushProfile(session.user.id, merged).catch((err) => setSyncError(err.message))
      })
      .catch((err) => !cancelled && setSyncError(err.message))
      .finally(() => !cancelled && setSyncing(false))
    return () => { cancelled = true }
  }, [session, catalogue])

  // ---- push, debounced so a burst of events is one round trip ----
  useEffect(() => {
    if (!cloudEnabled || !session?.user || !hydrated.current) return
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(() => {
      pushProfile(session.user.id, state).catch((err) => setSyncError(err.message))
    }, 1200)
    return () => clearTimeout(pushTimer.current)
  }, [state, session])

  const highestCleared = useMemo(() => {
    let max = 0
    for (const m of catalogue) if (state.progress[m.id]?.bestTier) max = Math.max(max, m.level)
    return max
  }, [state.progress, catalogue])

  const unlockedThrough = highestCleared + 1

  const isUnlocked = useCallback((level) => level <= unlockedThrough, [unlockedThrough])

  const award = useCallback((key, events) => {
    if (!ACHIEVEMENTS[key]) return false
    events.push({ type: 'achievement', key })
    return true
  }, [])

  /** Called after any Run. Only used for the First Compile achievement. */
  const recordRun = useCallback(() => {
    const events = []
    setState((s) => {
      if (s.achievements.includes('first_compile')) return s
      events.push({ type: 'achievement', key: 'first_compile' })
      return { ...s, achievements: [...s.achievements, 'first_compile'] }
    })
    return events
  }, [])

  const useHint = useCallback((missionId, index) => {
    setState((s) => {
      const p = s.progress[missionId] || { attempts: 0, hintsUsed: 0, languages: [] }
      return {
        ...s,
        progress: { ...s.progress, [missionId]: { ...p, hintsUsed: Math.max(p.hintsUsed || 0, index + 1) } }
      }
    })
  }, [])

  /**
   * Called after a Submit. Returns the list of things that happened so the UI
   * can animate them in order.
   */
  const recordSubmit = useCallback((mission, language, tier) => {
    const events = []
    let pushEntry = null
    setState((s) => {
      const next = { ...s, progress: { ...s.progress }, inventory: { ...s.inventory }, achievements: [...s.achievements] }
      const prev = next.progress[mission.id] || { attempts: 0, hintsUsed: 0, languages: [], bestTier: null }
      const entry = { ...prev, attempts: prev.attempts + 1, languages: [...(prev.languages || [])] }

      if (!tier) {
        // Failure. Nothing is lost except the clean streak — and only if the
        // player has no Streak Shield to absorb it.
        if (next.inventory.streak_shield > 0) {
          next.inventory.streak_shield -= 1
          if (next.inventory.streak_shield === 0) delete next.inventory.streak_shield
          events.push({ type: 'shield' })
        } else if (next.streak > 0) {
          events.push({ type: 'streak_broken', from: next.streak })
          next.streak = 0
        }
        next.progress[mission.id] = entry
        pushEntry = entry
        return next
      }

      const firstClear = !prev.bestTier
      if (!entry.languages.includes(language)) entry.languages.push(language)
      if (!prev.bestTier || TIER_RANK[tier] > TIER_RANK[prev.bestTier]) entry.bestTier = tier
      next.progress[mission.id] = entry

      next.streak += 1
      next.bestStreak = Math.max(next.bestStreak, next.streak)

      const xp = calculateXp({ difficulty: mission.difficulty, tier, streak: next.streak, firstClear })
      next.xp += xp.total
      events.push({ type: 'clear', tier, xp, firstClear, streak: next.streak })

      // Multi-language bonus — optional, never required to unlock anything.
      if (!firstClear && entry.languages.length > 1 && entry.languages.length > (prev.languages || []).length) {
        next.xp += 50
        events.push({ type: 'xp', amount: 50, label: 'Multi-language bonus' })
        if (!next.achievements.includes('polyglot')) { next.achievements.push('polyglot'); events.push({ type: 'achievement', key: 'polyglot' }) }
      }

      const reward = STREAK_REWARDS[next.streak]
      if (reward) {
        next.inventory[reward] = (next.inventory[reward] || 0) + 1
        events.push({ type: 'item', key: reward, streak: next.streak })
      }

      const unlockAch = (key) => {
        if (!next.achievements.includes(key)) { next.achievements.push(key); events.push({ type: 'achievement', key }) }
      }
      if (firstClear) unlockAch('first_clear')
      if (next.streak >= 3) unlockAch('clean_coder')
      if (tier === 'gold') unlockAch('perfectionist')
      if (prev.attempts > 0 && firstClear) {
        next.recoveries += 1
        if (next.recoveries >= 5) unlockAch('debugger')
      }
      if (catalogue.every((m) => next.progress[m.id]?.bestTier)) unlockAch('valley_clear')

      return next
    })
    return events
  }, [catalogue])

  const consumeItem = useCallback((key) => {
    let used = false
    setState((s) => {
      if (!s.inventory[key]) return s
      used = true
      const inv = { ...s.inventory, [key]: s.inventory[key] - 1 }
      if (inv[key] === 0) delete inv[key]
      return { ...s, inventory: inv }
    })
    return used
  }, [])

  const setSettings = useCallback((patch) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const resetProgress = useCallback(() => setState(EMPTY), [])

  const signIn = useCallback((email, password) => authSignIn(email, password), [])
  const signUp = useCallback((email, password) => authSignUp(email, password), [])
  const signOut = useCallback(async () => {
    await authSignOut()
    hydrated.current = false
  }, [])

  const value = {
    ...state, catalogue, highestCleared, unlockedThrough, isUnlocked,
    recordRun, recordSubmit, useHint, consumeItem, setSettings, resetProgress,
    cloudEnabled, session, syncing, syncError, signIn, signUp, signOut
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useGame() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}