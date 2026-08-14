/**
 * Wandbox client — a no-server path for compiled languages.
 *
 * Wandbox (wandbox.org) is a public compile-and-run service with a documented
 * API and no key. It exists so other tools can use it, which makes it a
 * legitimate option when you cannot host a judge yourself.
 *
 * ── The trade you are making ──────────────────────────────────────────────
 * This is someone else's free service, exactly like the Piston endpoint that
 * stopped serving anonymous requests. It can change or go away, and when it does
 * compiled languages stop working until you point at something else. JavaScript
 * and Python are unaffected either way, because they run in the player's own
 * browser.
 *
 * Be a good guest: one request per submission, not one per test case. The
 * generated program loops over every case internally, so a 21-test submit is a
 * single compile — the same batching the other providers use.
 *
 * NOT TESTED AGAINST THE LIVE SERVICE — no network access to it from the build
 * environment. Verify with one submission before relying on it.
 */
import { encodeBatch, decodeBatch } from './wire'

const DEFAULT_URL = 'https://wandbox.org/api/compile.json'

/** Wandbox identifies compilers by exact name, not by language. */
const WANDBOX_LANG = {
  cpp: { compiler: 'gcc-13.2.0', options: 'warning,gnu++17' },
  java: { compiler: 'openjdk-jdk-11+28', options: '' }
}

export const supportsWandbox = (id) => Boolean(WANDBOX_LANG[id])

export async function runOnWandbox({ language, program, signature, cases, url, timeLimitS = 10 }) {
  const spec = WANDBOX_LANG[language]
  if (!spec) {
    throw new Error(`${language} is not available on this execution service. This build supports C++ and Java.`)
  }

  const res = await fetch(url || DEFAULT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: spec.compiler,
      options: spec.options,
      code: program,
      stdin: encodeBatch(signature.params, cases),
      save: false
    })
  })

  const fail = (kind, message) =>
    cases.map((_, i) => ({ index: i, ok: false, errorKind: kind, message, ms: 0 }))

  if (res.status === 429) return fail('runtime', 'The execution service is busy — try again in a moment.')
  if (!res.ok) return fail('runtime', `The execution service returned ${res.status}.`)

  const payload = await res.json()

  // A non-zero compiler exit means it never ran.
  if (payload.compiler_error && payload.status !== '0' && !payload.program_output) {
    return fail('compile', clean(payload.compiler_error))
  }
  if (payload.signal === 'Killed' || /time limit/i.test(payload.program_error || '')) {
    return fail('timeout', 'Time limit exceeded.')
  }
  if (payload.status !== '0' && !payload.program_output) {
    return fail('runtime', clean(payload.program_error || payload.compiler_error || 'Program exited with an error.'))
  }

  let values
  try {
    values = decodeBatch(signature.returns, payload.program_output || '', cases.length)
  } catch {
    return fail('runtime', 'Program output could not be read.')
  }

  return cases.map((_, i) => (
    values[i] === undefined
      ? { index: i, ok: false, errorKind: 'runtime', message: 'The program stopped before this test case.', ms: 0 }
      : { index: i, ok: true, actualJson: JSON.stringify(values[i]), ms: 0 }
  ))
}

// Compiler messages name the generated harness file, which the player did not
// write. Strip those references so errors point at their own code.
function clean(text) {
  return String(text || '')
    .split('\n')
    .map((l) => l.replace(/^(prog\.\w+|\/[^\s:]*):/, ''))
    .join('\n')
    .trim()
    .slice(0, 4000)
}