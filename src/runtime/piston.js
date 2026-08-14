/**
 * Piston client — the free path for compiled languages.
 *
 * Piston (github.com/engineer-man/piston) runs a public execution API at no
 * cost and with no account, which is what makes C, C++, Java and the rest free
 * here. The same client works against a self-hosted instance.
 *
 * ── One request per submission, not one per test ──────────────────────────
 * The generated program loops over every test case internally (see
 * tools/lang/harness.mjs), so all 21 cases of a submit travel in a single
 * request. Locally this runs 21 cases in ~3 ms; the wall-clock cost is one
 * round trip plus compilation, not 21 rate-limited round trips.
 *
 * NOT TESTED AGAINST A LIVE INSTANCE — no network access to it from the build
 * environment. See LANGUAGES.md.
 */
import { encodeBatch, decodeBatch } from './wire'
import { pistonKey } from './languages'

const DEFAULT_URL = 'https://emkc.org/api/v2/piston'

/** Piston identifies languages by name and version, not numeric id. */
const PISTON_LANG = {
  cpp: { language: 'c++', version: '10.2.0', file: 'main.cpp' },
  java: { language: 'java', version: '15.0.2', file: 'Main.java' }
}

export const supportsPiston = (id) => Boolean(PISTON_LANG[id])

export async function runOnPiston({ language, program, signature, cases, url, timeLimitS = 5 }) {
  const spec = PISTON_LANG[language]
  if (!spec) throw new Error(`no Piston mapping for ${language}`)
  const base = (url || DEFAULT_URL).replace(/\/$/, '')

  const payload = await postWithRetry(`${base}/execute`, {
    language: spec.language,
    version: spec.version,
    files: [{ name: spec.file, content: program }],
    stdin: encodeBatch(signature.params, cases),
    compile_timeout: 15000,
    // The whole batch shares one budget, so scale it with the case count.
    run_timeout: Math.min(30000, Math.round(timeLimitS * 1000 * Math.max(2, cases.length / 4)))
  })

  const fail = (kind, message) =>
    cases.map((_, i) => ({ index: i, ok: false, errorKind: kind, message, ms: 0 }))

  if (payload.compile && payload.compile.code !== 0) {
    return fail('compile', clean(payload.compile.stderr || payload.compile.output))
  }
  const run = payload.run || {}
  if (run.signal === 'SIGKILL' || /timed? out/i.test(run.stderr || '')) {
    return fail('timeout', 'Time limit exceeded.')
  }
  if (run.code !== 0) {
    return fail('runtime', clean(run.stderr || 'Program exited with an error.'))
  }

  let values
  try {
    values = decodeBatch(signature.returns, run.stdout || '', cases.length)
  } catch {
    return fail('runtime', 'Program output could not be read.')
  }

  // A program that stops early leaves later cases undefined; report those as
  // failures rather than silently treating them as wrong answers.
  const totalMs = run.wall_time ? Number(run.wall_time) : 0
  return cases.map((_, i) => (
    values[i] === undefined
      ? { index: i, ok: false, errorKind: 'runtime', message: 'The program stopped before this test case.', ms: 0 }
      : { index: i, ok: true, actualJson: JSON.stringify(values[i]), ms: totalMs / cases.length }
  ))
}

async function postWithRetry(url, body, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Only sent when configured; a self-hosted instance needs no key.
        ...(pistonKey ? { Authorization: pistonKey } : {})
      },
      body: JSON.stringify(body)
    })
    if (res.status === 429) { await sleep(800 * (i + 1)); continue }
    if (res.ok) return res.json()

    // Distinguish "could not reach it" from "it reached us and said no" — the
    // two have completely different fixes, and conflating them sends people
    // hunting for a network problem that does not exist.
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        pistonKey
          ? `The execution service rejected the key (${res.status}). Check VITE_PISTON_KEY.`
          : `The execution service requires authentication (${res.status}). ` +
          `The public endpoint no longer runs code anonymously. Either self-host ` +
          `Piston and point VITE_PISTON_URL at it, or set VITE_PISTON_KEY if your ` +
          `instance issues keys. JavaScript and Python need neither.`
      )
    }
    if (res.status === 404) {
      throw new Error(`No execution service at ${url} (404). Check VITE_PISTON_URL.`)
    }
    throw new Error(`The execution service returned ${res.status}.`)
  }
  throw new Error('The execution service is busy — try again in a moment.')
}

// Compiler messages name the generated harness file, which the player did not
// write. Strip those references so errors point at their own code.
function clean(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.replace(/^\/?(piston|box|tmp)\/[^\s:]*[:\s]/, ''))
    .join('\n')
    .trim()
    .slice(0, 4000)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))