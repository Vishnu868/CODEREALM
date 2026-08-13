/**
 * Verification pipeline.
 *
 * RUN      → visible tests only. Free, unlimited, never affects the streak.
 * SUBMIT   → visible + freshly generated hidden tests + (where the mission
 *            defines one) a scaled performance measurement.
 *
 * Hidden expectations are computed at submit time from the mission's reference
 * solution, so there is no stored answer key anywhere in the shipped bundle.
 */

import { execute, outputsMatch, languageWeight } from '../runtime/runner'
import { byId } from '../runtime/languages'
import { makeRng } from '../data/rng'

const HIDDEN_COUNT = 18
const BASE_TIMEOUT_MS = 5000

/**
 * Ceilings on how long a player can be left waiting.
 *
 * Language weights are measured, not guessed, and on some machines Pyodide
 * measures north of 20x V8. Multiplying the base timeout by that unclamped
 * means a Python infinite loop leaves the player staring at a spinner for
 * nearly two minutes before anything tells them what happened.
 *
 * The weight still scales the budget — a slower runtime genuinely needs more
 * room — but past these ceilings the wait stops being informative. A solution
 * that has not finished in 25 seconds is not one second away from finishing.
 */
const MAX_TIMEOUT_MS = 25000
const MAX_PERF_TIMEOUT_MS = 45000

const budget = (base, weight, ceiling) => Math.min(base * weight, ceiling)

export function visibleCases(mission) {
  return mission.visible.map((c) => ({ args: c.args, expected: mission.ref(...c.args) }))
}

function hiddenCases(mission, seed) {
  const rng = makeRng(seed)
  const out = []
  for (let i = 0; i < HIDDEN_COUNT; i++) {
    const args = mission.gen(rng)
    out.push({ args, expected: mission.ref(...args) })
  }
  return out
}

function grade(cases, run) {
  if (run.status !== 'ok') {
    return {
      passed: 0,
      total: cases.length,
      failure: {
        kind: run.status,
        message: run.message,
        caseIndex: run.lastIndex,
        input: cases[run.lastIndex]?.args
      }
    }
  }
  let passed = 0
  let failure = null
  for (const r of run.results) {
    const c = cases[r.index]
    if (!r.ok) {
      failure = failure || { kind: 'runtime', message: r.message, caseIndex: r.index, input: c.args }
      continue
    }
    if (outputsMatch(c.expected, r.actualJson)) {
      passed++
    } else if (!failure) {
      failure = {
        kind: 'wrong_answer',
        caseIndex: r.index,
        input: c.args,
        expected: c.expected,
        actual: safeParse(r.actualJson)
      }
    }
  }
  return { passed, total: cases.length, failure, results: run.results }
}

function safeParse(json) {
  try { return JSON.parse(json) } catch { return json }
}

/** RUN — visible tests only. */
export async function runVisible(mission, language, code) {
  const cases = visibleCases(mission)
  const run = await execute({
    language,
    code,
    entry: mission.entry[language],
    signature: mission.signature,
    cases,
    timeoutMs: budget(BASE_TIMEOUT_MS, languageWeight(language), MAX_TIMEOUT_MS)
  })
  return { ...grade(cases, run), cases }
}

/** SUBMIT — full verification. Returns a tier of null | 'bronze' | 'silver' | 'gold'. */
export async function submitSolution(mission, language, code, hintsUsed) {
  const onServer = byId(language)?.where === 'server'
  if (onServer) return submitViaServer(mission, language, code, hintsUsed)

  const weight = languageWeight(language)
  const vis = visibleCases(mission)
  const visRun = await execute({
    language, code, entry: mission.entry[language], signature: mission.signature, cases: vis,
    timeoutMs: budget(BASE_TIMEOUT_MS, weight, MAX_TIMEOUT_MS)
  })
  const visible = { ...grade(vis, visRun), cases: vis }
  if (visible.passed < visible.total) {
    return { tier: null, visible, hidden: null, perf: null, stage: 'visible' }
  }

  const hid = hiddenCases(mission, (Date.now() ^ (mission.level * 2654435761)) >>> 0)
  const hidRun = await execute({
    language, code, entry: mission.entry[language], signature: mission.signature, cases: hid,
    timeoutMs: budget(BASE_TIMEOUT_MS, weight, MAX_TIMEOUT_MS)
  })
  const hidden = { ...grade(hid, hidRun), cases: hid }
  if (hidden.passed < hidden.total) {
    return { tier: null, visible, hidden, perf: null, stage: 'hidden' }
  }

  // Correct. Now measure, if this mission has a performance gate.
  let perf = null
  let tier = 'bronze'
  if (mission.perf) {
    perf = await measure(mission, language, code, weight)
    if (perf.status === 'ok') {
      // A solution that finishes comfortably fast in absolute terms is
      // efficient regardless of ratio noise on very quick reference times.
      const comfortable = perf.userMs <= 400 * weight
      if (comfortable || perf.ratio <= mission.perf.silverFactor) tier = 'silver'
      if ((comfortable || perf.ratio <= mission.perf.goldFactor) && hintsUsed === 0) tier = 'gold'
    }
  } else {
    tier = hintsUsed === 0 ? 'gold' : 'silver'
  }
  return { tier, visible, hidden, perf, stage: 'complete' }
}

/**
 * Submitting a compiled language: ONE request for everything.
 *
 * The browser path runs visible tests, then hidden tests, then a timed
 * performance case — three separate executions, which is free locally. Over a
 * network that would be three round trips plus three compilations, so the
 * cases are merged into a single run and the results split afterwards.
 *
 * Performance is rated differently here, and honestly so. The browser path
 * compares the player's time against the reference measured on the same
 * machine; on a shared execution service there is no comparable reference run,
 * so a ratio would be meaningless. Instead the performance case is included in
 * the batch and the language's own time limit does the judging: a solution of
 * the wrong complexity class does not finish, exactly as on any real judge.
 */
async function submitViaServer(mission, language, code, hintsUsed) {
  const weight = languageWeight(language)
  const vis = visibleCases(mission)
  const hid = hiddenCases(mission, (Date.now() ^ (mission.level * 2654435761)) >>> 0)

  const perfCase = mission.perf
    ? [{ args: mission.gen(makeRng(20260813), mission.perf.scale), expected: null }]
    : []
  const all = [...vis, ...hid, ...perfCase]

  const run = await execute({
    language,
    code,
    entry: mission.entry[language],
    signature: mission.signature,
    cases: all,
    timeoutMs: budget(BASE_TIMEOUT_MS, weight, MAX_TIMEOUT_MS)
  })

  const slice = (from, to) => ({
    ...run,
    results: (run.results || [])
      .filter((r) => r.index >= from && r.index < to)
      .map((r) => ({ ...r, index: r.index - from })),
    lastIndex: Math.max(0, Math.min(run.lastIndex - from, to - from - 1))
  })

  const visible = { ...grade(vis, slice(0, vis.length)), cases: vis }
  if (visible.passed < visible.total) {
    return { tier: null, visible, hidden: null, perf: null, stage: 'visible' }
  }

  const hidden = { ...grade(hid, slice(vis.length, vis.length + hid.length)), cases: hid }
  if (hidden.passed < hidden.total) {
    return { tier: null, visible, hidden, perf: null, stage: 'hidden' }
  }

  let perf = null
  let tier = 'bronze'
  if (mission.perf) {
    const perfResult = (run.results || []).find((r) => r.index === all.length - 1)
    const finished = run.status === 'ok' && perfResult?.ok
    perf = {
      status: finished ? 'ok' : 'timeout',
      scale: mission.perf.scale,
      serverJudged: true,
      growth: finished
        ? 'Completed the large input within the time limit.'
        : 'Did not finish the large input within the time limit.'
    }
    if (finished) {
      tier = 'silver'
      if (hintsUsed === 0) tier = 'gold'
    }
  } else {
    tier = hintsUsed === 0 ? 'gold' : 'silver'
  }
  return { tier, visible, hidden, perf, stage: 'complete' }
}

/**
 * Empirical performance check — the honest alternative to guessing Big-O.
 * We time the player's solution on a large input and compare it against the
 * reference solution timed on the same machine, so a slow laptop is not
 * punished. Language weight accounts for Pyodide being slower than V8.
 */
async function measure(mission, language, code, weight) {
  const rng = makeRng(20260813)
  const args = mission.gen(rng, mission.perf.scale)

  // Time the reference over several repetitions and keep the fastest. A single
  // run of a fast solution can measure as 0 ms, which would make every ratio
  // meaningless.
  let refMs = Infinity
  for (let i = 0; i < 5; i++) {
    const t0 = performance.now()
    mission.ref(...args)
    refMs = Math.min(refMs, performance.now() - t0)
  }
  refMs = Math.max(refMs, 1)

  const run = await execute({
    language, code, entry: mission.entry[language], signature: mission.signature,
    cases: [{ args, expected: null }],
    timeoutMs: budget(15000, weight, MAX_PERF_TIMEOUT_MS)
  })

  if (run.status === 'timeout') {
    return { status: 'timeout', scale: mission.perf.scale, refMs }
  }
  if (run.status !== 'ok' || !run.results[0]?.ok) {
    return { status: 'error', scale: mission.perf.scale, refMs }
  }

  const userMs = Math.max(run.results[0].ms, 0.5)
  return {
    status: 'ok',
    scale: mission.perf.scale,
    refMs,
    userMs,
    ratio: userMs / refMs / weight,
    growth: describeGrowth(userMs / refMs / weight)
  }
}

function describeGrowth(ratio) {
  if (ratio <= 3) return 'Matches the expected growth rate.'
  if (ratio <= 6) return 'Correct growth rate, but noticeably slower than optimal.'
  if (ratio <= 25) return 'Growing faster than expected — likely doing extra work per element.'
  return 'Growing much faster than expected — this looks like a higher complexity class.'
}
