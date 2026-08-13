/**
 * Execution front-end.
 *
 * Owns worker lifecycle, enforces wall-clock timeouts by terminating the
 * worker, and compares player output against the reference solution.
 */

import { LANGUAGES as ALL_LANGUAGES, byId, serverEnabled, provider, pistonUrl, wandboxUrl } from './languages'

const WORKERS = {
      javascript: '/js-runner.worker.js',
      python: '/py-runner.worker.js'
}

export const LANGUAGES = [
      { id: 'javascript', label: 'JavaScript' },
      { id: 'python', label: 'Python' }
]

/**
 * Time budgets are weighted per language so Python solutions are not judged
 * against V8 timings. These values are MEASURED by `npm run content:measure`
 * (which runs an identical workload under both runtimes) and delivered in the
 * content index — they are not estimates.
 */
// Compiled languages run on the judge and are broadly comparable to C++, so
// they share a weight of 1 until content:measure supplies a measured value.
let WEIGHTS = { javascript: 1, python: 5 }

export function setLanguageWeights(weights) {
      if (weights) WEIGHTS = { ...WEIGHTS, ...weights }
}

export function languageWeight(id) {
      return WEIGHTS[id] ?? 1
}

let pythonPreloaded = false

/** Warm the Python runtime in the background so the first Run is not a wait. */
export function preloadPython(onReady) {
      if (pythonPreloaded) return
      pythonPreloaded = true
      const w = new Worker(WORKERS.python)
      w.onmessage = (e) => {
            if (e.data.type === 'ready' || e.data.type === 'fatal') {
                  w.terminate()
                  onReady?.(e.data.type === 'ready')
            }
      }
      w.postMessage({ type: 'preload' })
}

/**
 * Execute `code` against `cases`.
 * Resolves to { status, results, lastIndex } where status is
 * 'ok' | 'syntax' | 'missing_entry' | 'timeout' | 'boot'.
 */
export function execute({ language, code, entry, cases, timeoutMs, signature }) {
      const lang = byId(language)
      if (lang && lang.where === 'server') {
            if (!serverEnabled) {
                  return Promise.resolve({
                        status: 'unavailable',
                        message: `${lang.label} runs on an execution service, which is not configured. ` +
                              `Set VITE_WANDBOX_URL=default for the free public service, or VITE_PISTON_URL / ` +
                              `VITE_JUDGE_URL for your own. JavaScript and Python need neither.`,
                        results: [],
                        lastIndex: 0
                  })
            }
            return executeOnServer({ language, code, entry, cases, timeoutMs, signature })
      }
      return new Promise((resolve) => {
            const worker = new Worker(WORKERS[language])
            let lastIndex = 0
            let settled = false

            const finish = (payload) => {
                  if (settled) return
                  settled = true
                  clearTimeout(timer)
                  worker.terminate()
                  resolve(payload)
            }

            const timer = setTimeout(() => {
                  finish({ status: 'timeout', results: [], lastIndex })
            }, timeoutMs)

            worker.onerror = (err) => {
                  finish({ status: 'syntax', message: err.message || 'Execution failed.', results: [], lastIndex })
            }

            worker.onmessage = (e) => {
                  const msg = e.data
                  if (msg.type === 'progress') { lastIndex = msg.index; return }
                  if (msg.type === 'fatal') {
                        finish({ status: msg.kind === 'boot' ? 'boot' : msg.kind, message: msg.message, results: [], lastIndex })
                        return
                  }
                  if (msg.type === 'done') finish({ status: 'ok', results: msg.results, lastIndex })
            }

            worker.postMessage({
                  type: 'run',
                  code,
                  entry,
                  cases: cases.map((c) => ({ argsJson: JSON.stringify(c.args) }))
            })
      })
}

/**
 * Canonical comparison. Both sides arrive as JSON strings, so this normalises
 * numeric formatting (Python's 15.0 vs JavaScript's 15) before comparing.
 */
export function outputsMatch(expected, actualJson) {
      let actual
      try {
            actual = JSON.parse(actualJson)
      } catch {
            return false
      }
      return canonical(expected) === canonical(actual)
}

function canonical(v) {
      if (typeof v === 'number') return Number.isFinite(v) ? String(Number(v.toFixed(9))) : String(v)
      if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']'
      if (v && typeof v === 'object') {
            return '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}'
      }
      return JSON.stringify(v)
}

/** Pretty-print a value for the results console. */
export function display(v) {
      if (typeof v === 'string') return JSON.stringify(v)
      if (Array.isArray(v) && v.length > 12) {
            return `[${v.slice(0, 12).join(', ')}, … +${v.length - 12} more]`
      }
      return JSON.stringify(v)
}

/** Compiled languages: wrap the player's function in a harness and submit it. */
async function executeOnServer({ language, code, entry, cases, timeoutMs, signature }) {
      try {
            // The harness generator and the service client are only needed for compiled
            // languages, so they load on demand rather than in the initial bundle.
            const { buildProgram } = await import('./harness')
            const program = buildProgram(language, signature, entry, code)
            const timeLimitS = Math.max(1, Math.round(timeoutMs / 1000))

            let results
            if (provider === 'judge') {
                  const { runOnJudge } = await import('./judge')
                  results = await runOnJudge({ language, program, signature, cases, timeLimitS })
            } else if (provider === 'piston') {
                  const { runOnPiston } = await import('./piston')
                  results = await runOnPiston({ language, program, signature, cases, url: pistonUrl, timeLimitS })
            } else {
                  const { runOnWandbox } = await import('./wandbox')
                  results = await runOnWandbox({ language, program, signature, cases, url: wandboxUrl, timeLimitS })
            }
            const compileError = results.find((r) => r.errorKind === 'compile')
            if (compileError) {
                  return { status: 'syntax', message: compileError.message, results: [], lastIndex: 0 }
            }
            if (results.some((r) => r.errorKind === 'timeout')) {
                  return { status: 'timeout', results, lastIndex: results.findIndex((r) => r.errorKind === 'timeout') }
            }
            return { status: 'ok', results, lastIndex: results.length - 1 }
      } catch (err) {
            return { status: 'boot', message: `Could not reach the execution server: ${err.message}`, results: [], lastIndex: 0 }
      }
}