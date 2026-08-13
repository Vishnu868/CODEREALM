import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const CONTENT_ROOT = path.resolve('content/missions')
export const LANGUAGES = ['javascript', 'python']

/** Load every mission folder, with its executable parts imported. */
export async function loadAll() {
  const dirs = fs.readdirSync(CONTENT_ROOT)
    .filter((d) => /^level-\d{3}$/.test(d))
    .sort()

  const missions = []
  for (const dir of dirs) {
    const base = path.join(CONTENT_ROOT, dir)
    const meta = JSON.parse(fs.readFileSync(path.join(base, 'mission.json'), 'utf8'))
    const mod = async (rel) => {
      const p = path.join(base, rel)
      if (!fs.existsSync(p)) return null
      return (await import(pathToFileURL(p).href)).default
    }
    missions.push({
      dir,
      base,
      meta,
      ref: await mod('solutions/reference.js'),
      independent: await mod('solutions/independent.js'),
      naive: await mod('solutions/naive.js'),
      gen: await mod('generator.js'),
      sources: {
        ref: read(base, 'solutions/reference.js'),
        gen: read(base, 'generator.js')
      }
    })
  }
  return missions
}

function read(base, rel) {
  const p = path.join(base, rel)
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null
}

/**
 * Schema validation. Deliberately strict — a mission that reaches players with a
 * missing hint or a mismatched entry name is a mission nobody can finish.
 */
export function validateSchema(m) {
  const e = []
  const x = m.meta
  const req = ['id', 'level', 'zone', 'title', 'topic', 'difficulty', 'expectedComplexity',
    'story', 'description', 'constraints', 'entry', 'starter', 'examples', 'visible', 'hints']
  for (const k of req) if (x[k] === undefined) e.push(`missing field "${k}"`)
  if (e.length) return e

  if (!Number.isInteger(x.level) || x.level < 1 || x.level > 100) e.push('level must be 1–100')
  if (!Number.isInteger(x.difficulty) || x.difficulty < 1 || x.difficulty > 6) e.push('difficulty must be 1–6')
  if (x.id !== `level_${String(x.level).padStart(3, '0')}`) e.push(`id "${x.id}" does not match level ${x.level}`)
  if (m.dir !== `level-${String(x.level).padStart(3, '0')}`) e.push(`folder ${m.dir} does not match level ${x.level}`)

  if (!x.story?.briefing) e.push('story.briefing is empty')
  if (!x.story?.success) e.push('story.success is empty')

  if (!Array.isArray(x.hints) || x.hints.length !== 3) e.push('exactly 3 hints are required')

  if (!Array.isArray(x.examples) || x.examples.length === 0) e.push('at least one example is required')
  if (!Array.isArray(x.visible) || x.visible.length === 0) e.push('at least one visible test is required')
  if (Array.isArray(x.examples) && Array.isArray(x.visible) && x.examples.length !== x.visible.length) {
    e.push(`examples (${x.examples.length}) and visible tests (${x.visible.length}) must line up 1:1`)
  }
  for (const [i, v] of (x.visible || []).entries()) {
    if (!Array.isArray(v.args)) e.push(`visible[${i}].args must be an array of arguments`)
  }

  for (const lang of LANGUAGES) {
    if (!x.entry?.[lang]) e.push(`entry.${lang} is missing`)
    if (!x.starter?.[lang]) e.push(`starter.${lang} is missing`)
  }

  // The harness calls entry by name. If the starter defines something else, every
  // player hits "function not found" before writing a line.
  if (x.starter?.javascript && x.entry?.javascript &&
      !new RegExp(`function\\s+${escapeRe(x.entry.javascript)}\\s*\\(`).test(x.starter.javascript)) {
    e.push(`starter.javascript does not define function ${x.entry.javascript}`)
  }
  if (x.starter?.python && x.entry?.python &&
      !new RegExp(`def\\s+${escapeRe(x.entry.python)}\\s*\\(`).test(x.starter.python)) {
    e.push(`starter.python does not define def ${x.entry.python}`)
  }

  if (x.perf) {
    if (!Number.isInteger(x.perf.scale) || x.perf.scale < 1000) e.push('perf.scale should be a large integer (>= 1000)')
    if (!(x.perf.silverFactor > x.perf.goldFactor)) e.push('perf.silverFactor must be greater than perf.goldFactor')
    if (!m.naive) e.push('missions with a perf gate must ship solutions/naive.js so the gate can be proven')
  }

  if (typeof m.ref !== 'function') e.push('solutions/reference.js must default-export a function')
  if (typeof m.gen !== 'function') e.push('generator.js must default-export a function')
  if (typeof m.independent !== 'function') e.push('solutions/independent.js must default-export a function')

  return e
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Canonical comparison — identical to the one the game uses at runtime. */
export function canonical(v) {
  if (v === undefined) return 'undefined'
  if (typeof v === 'number') return Number.isFinite(v) ? String(Number(v.toFixed(9))) : String(v)
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']'
  if (v && typeof v === 'object') {
    return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}'
  }
  return JSON.stringify(v)
}

export const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`
}

/** Best-of-N timing. */
export function time(fn, reps = 5) {
  let best = Infinity
  for (let i = 0; i < reps; i++) {
    const t0 = performance.now()
    fn()
    best = Math.min(best, performance.now() - t0)
  }
  return best
}

/**
 * Project how long the naive solution would take at full scale.
 *
 * We cannot simply run it: an O(n^2) solution at n = 2,000,000 is 4x10^12
 * operations and would never return, and a synchronous call cannot be
 * interrupted. So we time it at two small sizes, recover the growth exponent,
 * and extrapolate. Two points is enough to separate O(n) from O(n^2), which is
 * all this check needs to decide.
 */
export function projectNaive(naive, gen, scale) {
  const n1 = 4000
  const n2 = 16000
  const a1 = gen(makeRngLocal(11), n1)
  const a2 = gen(makeRngLocal(11), n2)
  const sized1 = sizedArg(a1)
  const sized2 = sizedArg(a2)
  if (sized1 === null || sized2 === null || sized1 !== n1 || sized2 !== n2) return null

  const t1 = Math.max(time(() => naive(...a1), 3), 0.05)
  const t2 = Math.max(time(() => naive(...a2), 3), 0.05)
  const exponent = Math.log(t2 / t1) / Math.log(n2 / n1)
  const projectedMs = t2 * Math.pow(scale / n2, exponent)
  return { t1, t2, n1, n2, exponent, projectedMs }
}

/**
 * The argument whose length defines the input size. Arrays and strings both
 * count — a string-input mission is just as capable of having a performance
 * gate, and skipping it leaves that gate unproven.
 */
export function sizedArg(args) {
  const found = args.find((a) => Array.isArray(a) || typeof a === 'string')
  return found === undefined ? null : found.length
}

function makeRngLocal(seed) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}
