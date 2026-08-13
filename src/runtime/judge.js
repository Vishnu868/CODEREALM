/**
 * Judge0 client — execution for compiled languages.
 *
 * NOT TESTED AGAINST A LIVE JUDGE. The wire format and the generated programs
 * were verified locally (all 100 C++ harnesses compile; five real solutions
 * compile and pass their visible tests), but no Judge0 instance was reachable
 * from the build environment. Treat this file as needing a smoke test on your
 * own instance before you enable compiled languages for players. See
 * LANGUAGES.md.
 */
import { judgeUrl, byId } from './languages'
import { encodeBatch, decodeBatch } from './wire'

const b64 = (s) => btoa(unescape(encodeURIComponent(s)))
const unb64 = (s) => (s ? decodeURIComponent(escape(atob(s))) : '')

/**
 * Run one program against every test case in a single submission.
 *
 * The generated program loops over the cases internally, so this is one
 * compile and one execution rather than one per case — the same batching that
 * makes the free Piston path usable, and it cuts Judge0 load too.
 */
export async function runOnJudge({ language, program, signature, cases, timeLimitS = 5, memoryKb = 256000 }) {
  const lang = byId(language)
  const created = await post('/submissions?base64_encoded=true&wait=false', {
    language_id: lang.judgeId,
    source_code: b64(program),
    stdin: b64(encodeBatch(signature.params, cases)),
    // One budget shared by the whole batch.
    cpu_time_limit: Math.min(15, timeLimitS * Math.max(2, cases.length / 4)),
    memory_limit: memoryKb
  })
  const r = await poll(created.token)

  const fail = (kind, message) =>
    cases.map((_, i) => ({ index: i, ok: false, errorKind: kind, message, ms: 0 }))

  const statusId = r.status?.id ?? 0
  if (statusId === 6) return fail('compile', clean(unb64(r.compile_output)))
  if (statusId === 5) return fail('timeout', 'Time limit exceeded.')
  if (statusId !== 3) return fail('runtime', clean(unb64(r.stderr) || r.status?.description || 'Execution failed.'))

  let values
  try {
    values = decodeBatch(signature.returns, unb64(r.stdout), cases.length)
  } catch {
    return fail('runtime', 'Program output could not be read.')
  }
  const per = seconds(r) / cases.length
  return cases.map((_, i) => (
    values[i] === undefined
      ? { index: i, ok: false, errorKind: 'runtime', message: 'The program stopped before this test case.', ms: 0 }
      : { index: i, ok: true, actualJson: JSON.stringify(values[i]), ms: per }
  ))
}

const seconds = (r) => (r.time ? Number(r.time) * 1000 : 0)

// Judge0 compile errors name the generated harness file; the player did not
// write that, so the path prefix is stripped before it reaches them.
function clean(text) {
  return String(text || '')
    .split('\n')
    .filter((l) => !/^\/(box|tmp)\//.test(l.trim()))
    .join('\n')
    .trim()
    .slice(0, 4000)
}

async function post(path, body) {
  const res = await fetch(judgeUrl.replace(/\/$/, '') + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`judge returned ${res.status}`)
  return res.json()
}

async function poll(token, attempts = 60) {
  const url = judgeUrl.replace(/\/$/, '') +
    `/submissions/${token}?base64_encoded=true&fields=stdout,stderr,compile_output,status,time`
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`judge returned ${res.status}`)
    const data = await res.json()
    // Statuses 1 and 2 mean queued or running.
    if ((data.status?.id ?? 0) > 2) return data
    await new Promise((r) => setTimeout(r, 250 + i * 50))
  }
  throw new Error('the judge timed out while queueing')
}
