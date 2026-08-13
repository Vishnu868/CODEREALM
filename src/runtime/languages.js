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
 *
 * Judge0 wins if both are set. With neither, the server languages appear in the
 * picker but are disabled with an explanation — never silently missing, and
 * never appearing to work and then failing at submit time.
 */
export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', where: 'browser', judgeId: 63 },
  { id: 'python', label: 'Python 3', where: 'browser', judgeId: 71 },
  { id: 'c', label: 'C', where: 'server', judgeId: 50 },
  { id: 'cpp', label: 'C++17', where: 'server', judgeId: 54 },
  { id: 'java', label: 'Java', where: 'server', judgeId: 62 },
  { id: 'typescript', label: 'TypeScript', where: 'server', judgeId: 74 },
  { id: 'csharp', label: 'C#', where: 'server', judgeId: 51 },
  { id: 'go', label: 'Go', where: 'server', judgeId: 60 },
  { id: 'rust', label: 'Rust', where: 'server', judgeId: 73 },
  { id: 'kotlin', label: 'Kotlin', where: 'server', judgeId: 78 },
  { id: 'swift', label: 'Swift', where: 'server', judgeId: 83 },
  { id: 'ruby', label: 'Ruby', where: 'server', judgeId: 72 }
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

/** Wandbox covers most of the set, but not Kotlin or Swift. */
const WANDBOX_MISSING = new Set(['kotlin', 'swift'])

export function isAvailable(id) {
  const l = byId(id)
  if (!l) return false
  if (l.where === 'browser') return true
  if (!serverEnabled) return false
  if (provider === 'wandbox' && WANDBOX_MISSING.has(id)) return false
  return true
}