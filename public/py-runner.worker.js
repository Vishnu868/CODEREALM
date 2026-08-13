/* eslint-disable no-restricted-globals */
/**
 * Python execution worker, powered by Pyodide (CPython compiled to WebAssembly).
 *
 * Pyodide is ~6 MB and is fetched from the jsDelivr CDN on first Python use
 * only, then cached by the browser. The map, the editor and every JavaScript
 * mission load without touching it.
 *
 * Same caveat as the JS worker: this isolates faults (infinite loops, crashes),
 * not attackers. See SECURITY.md.
 */

const PYODIDE_VERSION = '0.26.4'
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`

let pyodideReady = null

async function boot() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      self.importScripts(`${PYODIDE_URL}pyodide.js`)
      const py = await self.loadPyodide({ indexURL: PYODIDE_URL })
      return py
    })()
  }
  return pyodideReady
}

self.onmessage = async (event) => {
  const { type, code, entry, cases } = event.data

  if (type === 'preload') {
    try {
      await boot()
      self.postMessage({ type: 'ready' })
    } catch (err) {
      self.postMessage({ type: 'fatal', kind: 'boot', message: 'Could not load the Python runtime. Check your connection and try again.' })
    }
    return
  }

  let py
  try {
    py = await boot()
  } catch (err) {
    self.postMessage({ type: 'fatal', kind: 'boot', message: 'Could not load the Python runtime. Check your connection and try again.' })
    return
  }

  // Define the player's function once.
  try {
    py.runPython(code)
  } catch (err) {
    self.postMessage({ type: 'fatal', kind: 'syntax', message: cleanTrace(String(err)) })
    return
  }

  let fn
  try {
    fn = py.globals.get(entry)
  } catch (e) {
    fn = null
  }
  if (!fn) {
    self.postMessage({
      type: 'fatal',
      kind: 'missing_entry',
      message: `No function named "${entry}" was found. Keep the function name from the starter code.`
    })
    return
  }

  // A tiny Python-side bridge: take JSON args, call the function, return JSON.
  py.runPython(`
import json as _json
def _run_case(_fn, _args_json):
    _args = _json.loads(_args_json)
    return _json.dumps(_fn(*_args))
`)
  const runCase = py.globals.get('_run_case')

  const results = []
  for (let i = 0; i < cases.length; i++) {
    self.postMessage({ type: 'progress', index: i })
    const started = performance.now()
    try {
      const actualJson = runCase(fn, cases[i].argsJson)
      results.push({ index: i, ok: true, actualJson, ms: performance.now() - started })
    } catch (err) {
      results.push({
        index: i,
        ok: false,
        errorKind: 'runtime',
        message: cleanTrace(String(err)),
        ms: performance.now() - started
      })
    }
  }

  self.postMessage({ type: 'done', results })
}

// Pyodide tracebacks include internal frames the player did not write.
function cleanTrace(text) {
  const lines = text.split('\n').filter((l) => !l.includes('pyodide') && !l.includes('_pyodide'))
  return lines.slice(-6).join('\n').trim() || text
}
