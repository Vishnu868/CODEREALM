/**
 * Analytics hooks.
 *
 * Deliberately a no-op by default. The call sites exist so a provider can be
 * added later without touching game code, but nothing is collected and nothing
 * is sent until someone wires up `sink`. This is Phase 8 scaffolding, not a
 * working analytics system — see README.
 */
let sink = null

/** Register a handler, e.g. setSink((name, props) => plausible(name, { props })). */
export function setSink(fn) { sink = fn }

export function track(event, props = {}) {
  if (!sink) return
  try { sink(event, props) } catch { /* analytics must never break gameplay */ }
}

export const EVENTS = {
  MISSION_OPENED: 'mission_opened',
  CODE_RUN: 'code_run',
  SUBMITTED: 'submitted',
  MISSION_CLEARED: 'mission_cleared',
  HINT_REVEALED: 'hint_revealed',
  STREAK_BROKEN: 'streak_broken'
}
