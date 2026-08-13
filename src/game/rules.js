/**
 * Progression rules — the reward economy in one place.
 *
 * Deliberately closed: there is no currency and no shop. Items enter the
 * inventory only through streaks and achievements, so the economy cannot be
 * farmed or inflated.
 */

export const TIER_LABEL = { bronze: 'SOLVED', silver: 'EFFICIENT', gold: 'PERFECT' }
export const TIER_ICON = { bronze: '◆', silver: '◆◆', gold: '◆◆◆' }
export const TIER_RANK = { bronze: 1, silver: 2, gold: 3 }

export const ITEMS = {
  energy_cell: {
    name: 'Energy Cell',
    icon: '▣',
    detail: 'Reveals the input of the hidden test you failed, so you can debug it directly.'
  },
  hint_scanner: {
    name: 'Hint Scanner',
    icon: '◎',
    detail: 'Unlocks the next hint tier without it counting against a Perfect rating.'
  },
  streak_shield: {
    name: 'Streak Shield',
    icon: '⬡',
    detail: 'Absorbs one failed submission so your clean streak survives it.'
  }
}

/** Streak milestones. Rewards land at 3, so a good session always ends on one. */
export const STREAK_REWARDS = {
  3: 'energy_cell',
  5: 'hint_scanner',
  10: 'streak_shield',
  15: 'energy_cell',
  20: 'streak_shield'
}

export const ACHIEVEMENTS = {
  first_compile: { name: 'First Compile', detail: 'Run your first program.' },
  first_clear: { name: 'Signal Restored', detail: 'Complete your first mission.' },
  clean_coder: { name: 'Clean Coder', detail: 'Reach a 3-mission clean streak.' },
  perfectionist: { name: 'Perfectionist', detail: 'Earn a Perfect rating.' },
  debugger: { name: 'Debugger', detail: 'Recover from 5 failed submissions.' },
  polyglot: { name: 'Polyglot', detail: 'Clear the same mission in two languages.' },
  valley_clear: { name: 'Valley Cleared', detail: 'Complete every mission in Beginner Valley.' }
}

/** Base XP scales with mission difficulty, then is modified by tier and streak. */
export function calculateXp({ difficulty, tier, streak, firstClear }) {
  if (!firstClear) return { base: 0, tierBonus: 0, streakBonus: 0, total: 0 }
  const base = 40 * difficulty
  const tierBonus = Math.round(base * (tier === 'gold' ? 0.5 : tier === 'silver' ? 0.25 : 0))
  const streakBonus = Math.round(base * Math.min(streak * 0.05, 0.5))
  return { base, tierBonus, streakBonus, total: base + tierBonus + streakBonus }
}

/** Player level curve — roughly Player 25 by Campaign 100 on a Bronze-only run. */
export function playerLevelFor(xp) {
  let level = 1
  let need = 200
  let spent = 0
  while (xp - spent >= need) {
    spent += need
    level++
    need = Math.round(need * 1.18)
  }
  return { level, into: xp - spent, need }
}

/** Mastery per topic = mean tier rank across that topic's cleared missions. */
export function computeMastery(missions, progress) {
  const byTopic = {}
  for (const m of missions) {
    const t = (byTopic[m.topic] ||= { cleared: 0, total: 0, points: 0 })
    t.total++
    const p = progress[m.id]
    if (p?.bestTier) {
      t.cleared++
      t.points += TIER_RANK[p.bestTier]
    }
  }
  return Object.entries(byTopic).map(([topic, t]) => ({
    topic,
    percent: t.total ? Math.round((t.points / (t.total * 3)) * 100) : 0,
    cleared: t.cleared,
    total: t.total
  }))
}
