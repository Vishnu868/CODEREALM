#!/usr/bin/env node
/**
 * npm run content:verify
 *
 * Five checks per mission. Any failure exits non-zero, so this can gate a
 * deploy. Nothing here is advisory.
 */
import { loadAll, validateSchema, canonical, c, time, projectNaive, sizedArg } from './lib.mjs'
import { makeRng } from '../../content/lib/rand.js'

const CROSS_CHECK_CASES = Number(process.env.CASES || 2000)

const missions = await loadAll()
let failed = 0
let warned = 0

console.log(c.bold(`\nVerifying ${missions.length} missions · ${CROSS_CHECK_CASES} generated cases each\n`))

for (const m of missions) {
  const x = m.meta
  const problems = []
  const warnings = []

  // ── 1. Schema ────────────────────────────────────────────────────────────
  for (const e of validateSchema(m)) problems.push(['schema', e])

  if (problems.length === 0) {
    // ── 2. Visible tests execute, and examples match reality ───────────────
    // Stated example output drifts constantly: a tie-break rule changes and the
    // prose above it does not. This catches it.
    for (const [i, v] of x.visible.entries()) {
      let got
      try {
        got = m.ref(...v.args)
      } catch (err) {
        problems.push(['example', `visible[${i}] threw in reference: ${err.message}`])
        continue
      }
      if (got === undefined) {
        problems.push(['example', `visible[${i}]: reference returned undefined — is it still a TODO stub?`])
        continue
      }
      const stated = String(x.examples[i].output ?? '').trim()
      const actual = typeof got === 'string' ? JSON.stringify(got) : canonical(got)
      const statedNorm = stated.replace(/\s+/g, '')
      if (actual.replace(/\s+/g, '') !== statedNorm) {
        problems.push(['example', `examples[${i}].output says ${stated} but reference returns ${actual}`])
      }
    }

    // ── 3. Reference vs independent implementation ─────────────────────────
    const rng = makeRng(0x5eed ^ (x.level * 2654435761))
    let mismatch = null
    let genThrew = null
    for (let i = 0; i < CROSS_CHECK_CASES && !mismatch && !genThrew; i++) {
      let args
      try {
        args = m.gen(rng)
      } catch (err) {
        genThrew = err.message
        break
      }
      if (!Array.isArray(args)) { genThrew = 'generator must return an array of arguments'; break }
      let a, b
      try { a = m.ref(...args) } catch (err) { mismatch = { args, err: `reference threw: ${err.message}` }; break }
      try { b = m.independent(...args) } catch (err) { mismatch = { args, err: `independent threw: ${err.message}` }; break }
      if (canonical(a) !== canonical(b)) {
        mismatch = { args, err: `reference returned ${canonical(a)}, independent returned ${canonical(b)}` }
      }
    }
    if (genThrew) problems.push(['generator', genThrew])
    if (mismatch) {
      problems.push(['cross-check', `${mismatch.err}\n      input: ${trunc(JSON.stringify(mismatch.args))}`])
    }

    // ── 4. Perf case is generated at the right size, and is measurable ──────
    if (x.perf) {
      let perfArgs
      try {
        perfArgs = m.gen(makeRng(7), x.perf.scale)
      } catch (err) {
        problems.push(['perf', `generator threw when asked for scale ${x.perf.scale}: ${err.message}`])
      }
      if (perfArgs) {
        const sized = sizedArg(perfArgs)
        if (sized === null) {
          problems.push(['perf', 'perf case has no array or string argument, so the input size cannot be checked'])
        } else if (sized !== x.perf.scale) {
          problems.push(['perf', `generator ignored scale: asked for ${x.perf.scale}, produced ${sized}`])
        }

        // ── 5. The naive solution MUST fail the gate ───────────────────────
        // If it passes, Efficient is unearnable-by-failure — i.e. meaningless.
        // The naive solution is projected rather than run at full scale: a
        // quadratic solution at this input size would never return.
        const refMs = time(() => m.ref(...perfArgs), 5)
        const proj = projectNaive(m.naive, m.gen, x.perf.scale)
        if (!proj) {
          problems.push(['perf', 'could not project the naive solution — the generator did not honour the sample sizes, ' +
            'so this performance gate is unproven'])
        } else {
          const factor = proj.projectedMs / Math.max(refMs, 0.1)
          if (factor <= x.perf.silverFactor) {
            problems.push(['perf', `naive solution projects to ${proj.projectedMs.toFixed(0)} ms at n=${x.perf.scale.toLocaleString()}, ` +
              `only ${factor.toFixed(1)}x the reference — it would earn Efficient. ` +
              `Raise perf.scale or tighten silverFactor (${x.perf.silverFactor}).`])
          } else {
            console.log(c.dim(`      gate holds: naive projects to ${fmtMs(proj.projectedMs)} vs reference ${refMs.toFixed(1)} ms ` +
              `(growth exponent ~${proj.exponent.toFixed(2)})`))
          }
        }
      }
    }

    // ── Advisory checks ─────────────────────────────────────────────────────
    for (const [i, h] of x.hints.entries()) {
      if (h.length < 40) warnings.push(`hints[${i}] is very short — is it actually useful?`)
    }
    if (x.description.length < 60) warnings.push('description is very short — is every edge case stated?')
    if (!x.perf && x.difficulty >= 4) warnings.push('difficulty >= 4 with no perf gate — intentional?')
  }

  const label = `${x.id ?? m.dir}  ${x.title ?? ''}`
  if (problems.length) {
    failed++
    console.log(`${c.red('FAIL')}  ${label}`)
    for (const [kind, msg] of problems) console.log(`      ${c.red(kind)}: ${msg}`)
  } else {
    console.log(`${c.green('PASS')}  ${label}`)
  }
  for (const w of warnings) { warned++; console.log(`      ${c.yellow('warn')}: ${w}`) }
}

// ── Campaign-level checks ─────────────────────────────────────────────────
const levels = missions.map((m) => m.meta.level).filter(Number.isInteger).sort((a, b) => a - b)
const gaps = []
for (let i = 1; i < levels.length; i++) if (levels[i] !== levels[i - 1] + 1) gaps.push(`${levels[i - 1]} → ${levels[i]}`)
if (gaps.length) {
  failed++
  console.log(`\n${c.red('FAIL')}  campaign has gaps in the level sequence: ${gaps.join(', ')}`)
}
const dupes = levels.filter((l, i) => levels.indexOf(l) !== i)
if (dupes.length) {
  failed++
  console.log(`\n${c.red('FAIL')}  duplicate levels: ${[...new Set(dupes)].join(', ')}`)
}

console.log(
  failed
    ? c.red(`\n${failed} mission(s) failed verification.\n`)
    : c.green(`\nAll ${missions.length} missions verified${warned ? ` (${warned} warning${warned > 1 ? 's' : ''})` : ''}.\n`)
)
process.exit(failed ? 1 : 0)

function fmtMs(ms) {
  if (ms > 60000) return `${(ms / 60000).toFixed(1)} min`
  if (ms > 1000) return `${(ms / 1000).toFixed(1)} s`
  return `${ms.toFixed(0)} ms`
}

function timeIt(fn, reps, capMs) {
  let best = Infinity
  const started = Date.now()
  for (let i = 0; i < reps; i++) {
    const t0 = performance.now()
    fn()
    best = Math.min(best, performance.now() - t0)
    if (capMs && Date.now() - started > capMs) return null
  }
  return best
}

function trunc(s) { return s.length > 160 ? s.slice(0, 160) + ` … (${s.length} chars)` : s }
