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

export const judgeUrl = judgeUrlRaw
export const pistonUrl = pistonUrlRaw === 'default' ? '' : pistonUrlRaw

/** 'judge' | 'piston' | null */
export const provider = judgeUrlRaw ? 'judge' : (pistonUrlRaw ? 'piston' : null)
export const serverEnabled = provider !== null

export const byId = (id) => LANGUAGES.find((l) => l.id === id)

export function availableLanguages() {
  return LANGUAGES.filter((l) => l.where === 'browser' || serverEnabled)
}

export function isAvailable(id) {
  const l = byId(id)
  return !!l && (l.where === 'browser' || serverEnabled)
}
