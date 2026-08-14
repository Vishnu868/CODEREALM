/**
 * Languages available to the player.
 *
 * `where` decides how code runs:
 *   'browser' — a Web Worker on the player's machine. Free, instant, unlimited.
 *   'server'  — sent to an execution service. Compiled languages need one.
 *
 * Two services are supported, chosen by environment variable:
 *
 *   VITE_PISTON_URL   Piston. A public instance is free and needs no account,
 *                     so compiled languages cost nothing. Rate limited.
 *                     Set to 'default' to use the public endpoint.
 *   VITE_JUDGE_URL    Judge0. Your own instance: faster, no shared limits,
 *                     stronger isolation, but you run and pay for the VM.
 *   VITE_WANDBOX_URL  Wandbox. Public, no key. Set to 'default'.
 *
 * Judge0 wins if several are set. With none, the server languages appear in the
 * picker but are disabled with an explanation — never silently missing, and
 * never appearing to work and then failing at submit time.
 *
 * ── Scope ─────────────────────────────────────────────────────────────────
 * Deliberately four languages: JavaScript and Python run in the browser, C++
 * and Java on an execution service. C, C#, Go, Rust, Kotlin, Swift, Ruby and
 * TypeScript were removed. Adding one back means (a) a row here, (b) an entry
 * in the provider map of whichever client you use, and (c) a harness in
 * runtime/harness.js — all three, or it fails at submit time.
 */
export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', where: 'browser', judgeId: 63 },
  { id: 'python', label: 'Python 3', where: 'browser', judgeId: 71 },
  { id: 'cpp', label: 'C++17', where: 'server', judgeId: 54 },
  { id: 'java', label: 'Java', where: 'server', judgeId: 62 }
]

const judgeUrlRaw = import.meta.env.VITE_JUDGE_URL || ''
const pistonUrlRaw = import.meta.env.VITE_PISTON_URL || ''
const wandboxUrlRaw = import.meta.env.VITE_WANDBOX_URL || ''

export const judgeUrl = judgeUrlRaw
export const pistonUrl = pistonUrlRaw === 'default' ? '' : pistonUrlRaw

/**
 * Optional key for a Piston instance that requires one.
 *
 * The public endpoint at emkc.org stopped serving /execute anonymously — it
 * answers /runtimes with 200 and /execute with 401. A self-hosted instance needs
 * no key at all; leave this blank for that.
 */
export const pistonKey = import.meta.env.VITE_PISTON_KEY || ''

export const wandboxUrl = wandboxUrlRaw === 'default' ? '' : wandboxUrlRaw

/**
 * Which execution service to use, in order of preference: your own Judge0, your
 * own or a keyed Piston, then Wandbox as the no-server fallback.
 *
 * 'judge' | 'piston' | 'wandbox' | null
 */
export const provider =
  judgeUrlRaw ? 'judge' : pistonUrlRaw ? 'piston' : wandboxUrlRaw ? 'wandbox' : null
export const serverEnabled = provider !== null

export const byId = (id) => LANGUAGES.find((l) => l.id === id)

export function availableLanguages() {
  return LANGUAGES.filter((l) => l.where === 'browser' || serverEnabled)
}

/**
 * Every server language here (C++, Java) is carried by all three providers, so
 * availability is purely "is a provider configured".
 */
export function isAvailable(id) {
  const l = byId(id)
  if (!l) return false
  if (l.where === 'browser') return true
  return serverEnabled
}