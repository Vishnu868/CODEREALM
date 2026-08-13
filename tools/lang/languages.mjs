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
 * Judge sandboxes have no third-party libraries, and C, C++, Go and Rust have
 * no JSON parser in their standard library. Writing ten JSON parsers would be
 * the bulk of the work and the bulk of the bugs. Instead every value is encoded
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
  { id: 'typescript', label: 'TypeScript', where: 'judge', judgeId: 74, ext: 'ts', comment: '//' },
  { id: 'c', label: 'C', where: 'judge', judgeId: 50, ext: 'c', comment: '//' },
  { id: 'cpp', label: 'C++17', where: 'judge', judgeId: 54, ext: 'cpp', comment: '//' },
  { id: 'java', label: 'Java', where: 'judge', judgeId: 62, ext: 'java', comment: '//' },
  { id: 'csharp', label: 'C#', where: 'judge', judgeId: 51, ext: 'cs', comment: '//' },
  { id: 'go', label: 'Go', where: 'judge', judgeId: 60, ext: 'go', comment: '//' },
  { id: 'rust', label: 'Rust', where: 'judge', judgeId: 73, ext: 'rs', comment: '//' },
  { id: 'kotlin', label: 'Kotlin', where: 'judge', judgeId: 78, ext: 'kt', comment: '//' },
  { id: 'swift', label: 'Swift', where: 'judge', judgeId: 83, ext: 'swift', comment: '//' },
  { id: 'ruby', label: 'Ruby', where: 'judge', judgeId: 72, ext: 'rb', comment: '#' }
]

export const byId = (id) => LANGUAGES.find((l) => l.id === id)

/** camelCase for most, snake_case where the language convention demands it. */
export function entryName(langId, camel) {
  if (langId === 'python' || langId === 'ruby' || langId === 'rust') {
    return camel.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())
  }
  return camel
}

// ── Type names per language ────────────────────────────────────────────────
const TYPES = {
  c: { int: 'long long', bool: 'int', string: 'char*', 'int[]': 'long long*', 'string[]': 'char**', 'int[][]': 'long long**', 'string[][]': 'char***' },
  cpp: { int: 'long long', bool: 'bool', string: 'string', 'int[]': 'vector<long long>', 'string[]': 'vector<string>', 'int[][]': 'vector<vector<long long>>', 'string[][]': 'vector<vector<string>>' },
  java: { int: 'long', bool: 'boolean', string: 'String', 'int[]': 'long[]', 'string[]': 'String[]', 'int[][]': 'long[][]', 'string[][]': 'String[][]' },
  csharp: { int: 'long', bool: 'bool', string: 'string', 'int[]': 'long[]', 'string[]': 'string[]', 'int[][]': 'long[][]', 'string[][]': 'string[][]' },
  go: { int: 'int64', bool: 'bool', string: 'string', 'int[]': '[]int64', 'string[]': '[]string', 'int[][]': '[][]int64', 'string[][]': '[][]string' },
  rust: { int: 'i64', bool: 'bool', string: 'String', 'int[]': 'Vec<i64>', 'string[]': 'Vec<String>', 'int[][]': 'Vec<Vec<i64>>', 'string[][]': 'Vec<Vec<String>>' },
  kotlin: { int: 'Long', bool: 'Boolean', string: 'String', 'int[]': 'LongArray', 'string[]': 'Array<String>', 'int[][]': 'Array<LongArray>', 'string[][]': 'Array<Array<String>>' },
  swift: { int: 'Int', bool: 'Bool', string: 'String', 'int[]': '[Int]', 'string[]': '[String]', 'int[][]': '[[Int]]', 'string[][]': '[[String]]' },
  typescript: { int: 'number', bool: 'boolean', string: 'string', 'int[]': 'number[]', 'string[]': 'string[]', 'int[][]': 'number[][]', 'string[][]': 'string[][]' }
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
    case 'typescript':
      return `function ${name}(${p.map((x) => `${x.name}: ${typeName('typescript', x.type)}`).join(', ')}): ${typeName('typescript', r)} {\n  ${body}\n  \n}`
    case 'python':
      return `def ${name}(${p.map((x) => x.name).join(', ')}):\n    ${body}\n    pass`
    case 'ruby':
      return `def ${name}(${p.map((x) => x.name).join(', ')})\n  ${body}\nend`
    case 'c':
      return cStarter(name, signature, body)
    case 'cpp':
      return `${typeName('cpp', r)} ${name}(${p.map((x) => `${typeName('cpp', x.type)} ${x.name}`).join(', ')}) {\n    ${body}\n    \n}`
    case 'java':
      return `public static ${typeName('java', r)} ${name}(${p.map((x) => `${typeName('java', x.type)} ${x.name}`).join(', ')}) {\n        ${body}\n        \n    }`
    case 'csharp':
      return `public static ${typeName('csharp', r)} ${name}(${p.map((x) => `${typeName('csharp', x.type)} ${x.name}`).join(', ')}) {\n        ${body}\n        \n    }`
    case 'go':
      return `func ${name}(${p.map((x) => `${x.name} ${typeName('go', x.type)}`).join(', ')}) ${typeName('go', r)} {\n\t${body}\n\t\n}`
    case 'rust':
      return `fn ${name}(${p.map((x) => `${x.name}: ${typeName('rust', x.type)}`).join(', ')}) -> ${typeName('rust', r)} {\n    ${body}\n    \n}`
    case 'kotlin':
      return `fun ${name}(${p.map((x) => `${x.name}: ${typeName('kotlin', x.type)}`).join(', ')}): ${typeName('kotlin', r)} {\n    ${body}\n    \n}`
    case 'swift':
      return `func ${name}(${p.map((x) => `_ ${x.name}: ${typeName('swift', x.type)}`).join(', ')}) -> ${typeName('swift', r)} {\n    ${body}\n    \n}`
    default:
      return body
  }
}

/**
 * C has no length on an array, so every array parameter is followed by its
 * length, and a returned array reports its length through an out-parameter.
 * This is the price of C, and the mission's hints do not change because of it.
 */
function cStarter(name, signature, body) {
  const parts = []
  for (const x of signature.params) {
    parts.push(`${typeName('c', x.type)} ${x.name}`)
    if (x.type === 'int[]' || x.type === 'string[]') parts.push(`int ${x.name}_len`)
    if (x.type === 'int[][]' || x.type === 'string[][]') parts.push(`int ${x.name}_rows`, `int* ${x.name}_cols`)
  }
  const r = signature.returns
  if (r === 'int[]') parts.push('int* out_len')
  if (r === 'int[][]') parts.push('int* out_rows', 'int** out_cols')
  return `${typeName('c', r)} ${name}(${parts.join(', ')}) {\n    ${body}\n    \n}`
}
