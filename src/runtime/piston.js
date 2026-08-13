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

const DEFAULT_URL = 'https://emkc.org/api/v2/piston'

/** Piston identifies languages by name and version, not numeric id. */
const PISTON_LANG = {
  c: { language: 'c', version: '10.2.0', file: 'main.c' },
  cpp: { language: 'c++', version: '10.2.0', file: 'main.cpp' },
  java: { language: 'java', version: '15.0.2', file: 'Main.java' },
  csharp: { language: 'csharp', version: '6.12.0', file: 'Main.cs' },
  go: { language: 'go', version: '1.16.2', file: 'main.go' },
  rust: { language: 'rust', version: '1.68.2', file: 'main.rs' },
  kotlin: { language: 'kotlin', version: '1.8.20', file: 'Main.kt' },
  swift: { language: 'swift', version: '5.3.3', file: 'main.swift' },
  ruby: { language: 'ruby', version: '3.0.1', file: 'main.rb' },
  typescript: { language: 'typescript', version: '5.0.3', file: 'main.ts' }
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.status === 429) { await sleep(800 * (i + 1)); continue }
    if (!res.ok) throw new Error(`execution service returned ${res.status}`)
    return res.json()
  }
  throw new Error('the execution service is busy — try again in a moment')
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
