/**
 * Language support.
 *
 * ── The key idea ──────────────────────────────────────────────────────────
 * A mission needs NO reference solution per language. Expected outputs are
 * always computed by the JavaScript reference; a player's program merely has to
 * read the arguments, call one function, and print the answer. So adding a
 * language costs one adapter here — not 100 solutions.
 *
 * ── Why a line format, not JSON ───────────────────────────────────────────
 * Judge sandboxes have no third-party libraries, and C++ has no JSON parser in
 * its standard library. Writing a JSON parser per language would be the bulk of
 * the work and the bulk of the bugs. Instead every value is encoded
 * in a trivially readable form:
 *
 *   int          one line: 42
 *   bool         one line: 1 or 0
 *   string       one line of raw text (may be empty)
 *   int[]        a count line, then one line of space-separated values
 *   string[]     a count line, then one line per element
 *   int[][]      a row-count line, then each row as an int[]
 *   string[][]   a row-count line, then each row as a string[]
 *
 * Arguments arrive on stdin in declaration order; the answer is printed in the
 * same encoding. The runner converts to and from this format, so comparison
 * still happens on canonical JSON.
 */

export const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', where: 'browser', judgeId: 63, ext: 'js', comment: '//' },
  { id: 'python', label: 'Python 3', where: 'browser', judgeId: 71, ext: 'py', comment: '#' },
  { id: 'cpp', label: 'C++17', where: 'judge', judgeId: 54, ext: 'cpp', comment: '//' },
  { id: 'java', label: 'Java', where: 'judge', judgeId: 62, ext: 'java', comment: '//' }
]

export const byId = (id) => LANGUAGES.find((l) => l.id === id)

/** camelCase for most, snake_case where the language convention demands it. */
export function entryName(langId, camel) {
  if (langId === 'python') {
    return camel.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())
  }
  return camel
}

// ── Type names per language ────────────────────────────────────────────────
const TYPES = {
  cpp: { int: 'long long', bool: 'bool', string: 'string', 'int[]': 'vector<long long>', 'string[]': 'vector<string>', 'int[][]': 'vector<vector<long long>>', 'string[][]': 'vector<vector<string>>' },
  java: { int: 'long', bool: 'boolean', string: 'String', 'int[]': 'long[]', 'string[]': 'String[]', 'int[][]': 'long[][]', 'string[][]': 'String[][]' }
}

const typeName = (lang, t) => TYPES[lang]?.[t] ?? t

// ── Starter templates ──────────────────────────────────────────────────────
export function starterFor(langId, signature, entryCamel, hint) {
  const name = entryName(langId, entryCamel)
  const p = signature.params
  const r = signature.returns
  const body = `${byId(langId).comment} ${hint}`

  switch (langId) {
    case 'javascript':
      return `function ${name}(${p.map((x) => x.name).join(', ')}) {\n  ${body}\n  \n}`
    case 'python':
      return `def ${name}(${p.map((x) => x.name).join(', ')}):\n    ${body}\n    pass`
    case 'cpp':
      return `${typeName('cpp', r)} ${name}(${p.map((x) => `${typeName('cpp', x.type)} ${x.name}`).join(', ')}) {\n    ${body}\n    \n}`
    case 'java':
      return `public static ${typeName('java', r)} ${name}(${p.map((x) => `${typeName('java', x.type)} ${x.name}`).join(', ')}) {\n        ${body}\n        \n    }`
    default:
      return body
  }
}

