/** Wire-format encoder/decoder. Kept identical to tools/lang/encode.mjs. */
export function encodeArgs(params, args) {
  const out = []
  params.forEach((p, i) => encodeValue(p.type, args[i], out))
  return out.join('\n') + '\n'
}

/**
 * Encode EVERY test case into one stdin payload: a count line, then each case's
 * arguments back to back.
 *
 * This is what makes compiled languages usable. One submission runs all 21
 * cases instead of 21 separate round trips, which turns a rate-limited
 * five-second submit into a single request.
 */
export function encodeBatch(params, cases) {
  const out = [String(cases.length)]
  for (const c of cases) params.forEach((p, i) => encodeValue(p.type, c.args[i], out))
  return out.join('\n') + '\n'
}

/** Split one program's stdout back into per-case values. */
export function decodeBatch(type, text, count) {
  const lines = text.replace(/\r/g, '').split('\n')
  let at = 0
  const results = []
  for (let i = 0; i < count; i++) {
    const [value, consumed] = decodeFrom(type, lines, at)
    at = consumed
    results.push(value)
  }
  return results
}

export function encodeValue(type, v, out) {
  switch (type) {
    case 'int': out.push(String(v)); break
    case 'bool': out.push(v ? '1' : '0'); break
    // Strings carry an explicit length line, then the raw text. Without the
    // length there is no way to read an empty string back: a bare blank line is
    // indistinguishable from a separator in most languages.
    case 'string': out.push(String(String(v).length)); out.push(String(v)); break
    case 'int[]': out.push(String(v.length)); out.push(v.join(' ')); break
    case 'string[]': out.push(String(v.length)); for (const s of v) { out.push(String(String(s).length)); out.push(String(s)) } break
    case 'int[][]': out.push(String(v.length)); for (const row of v) { out.push(String(row.length)); out.push(row.join(' ')) } break
    case 'string[][]': out.push(String(v.length)); for (const row of v) { out.push(String(row.length)); for (const s of row) { out.push(String(String(s).length)); out.push(String(s)) } } break
    default: throw new Error('encode ' + type)
  }
}

/** Parse a program's stdout back into a JavaScript value. */
export function decodeResult(type, text) {
  const lines = text.replace(/\r/g, '').split('\n')
  return decodeFrom(type, lines, 0)[0]
}

/** Read one value starting at `start`; returns [value, nextIndex]. */
export function decodeFrom(type, lines, start) {
  let at = start
  const nextLine = () => (at < lines.length ? lines[at++] : '')
  const nums = (line) => line.split(/\s+/).filter((s) => s.length > 0).map(Number)
  switch (type) {
    case 'int': return [Number(nextLine().trim()), at]
    case 'bool': return [nextLine().trim() === '1', at]
    case 'string': { nextLine(); return [nextLine(), at] }
    case 'int[]': {
      const n = Number(nextLine().trim())
      if (n === 0) { nextLine(); return [[], at] }
      return [nums(nextLine()).slice(0, n), at]
    }
    case 'string[]': {
      const n = Number(nextLine().trim())
      const out = []
      for (let i = 0; i < n; i++) { nextLine(); out.push(nextLine()) }
      return [out, at]
    }
    case 'int[][]': {
      const rows = Number(nextLine().trim())
      const out = []
      for (let i = 0; i < rows; i++) {
        const c = Number(nextLine().trim())
        if (c === 0) { nextLine(); out.push([]) } else out.push(nums(nextLine()).slice(0, c))
      }
      return [out, at]
    }
    case 'string[][]': {
      const rows = Number(nextLine().trim())
      const out = []
      for (let i = 0; i < rows; i++) {
        const c = Number(nextLine().trim())
        const row = []
        for (let j = 0; j < c; j++) { nextLine(); row.push(nextLine()) }
        out.push(row)
      }
      return [out, at]
    }
    default: throw new Error('decode ' + type)
  }
}