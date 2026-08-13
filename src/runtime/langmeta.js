/** Metadata the harness generator needs. Mirrors tools/lang/languages.mjs. */
import { LANGUAGES } from './languages'

const COMMENT = { python: '#', ruby: '#' }

export const byId = (id) => {
  const l = LANGUAGES.find((x) => x.id === id)
  return l ? { ...l, comment: COMMENT[id] ?? '//' } : null
}

export function entryName(langId, camel) {
  if (langId === 'python' || langId === 'ruby' || langId === 'rust') {
    return camel.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())
  }
  return camel
}
