/* eslint-disable no-restricted-globals */
/**
 * JavaScript execution worker.
 *
 * Player code runs here, off the main thread, so an infinite loop freezes only
 * this worker — the main thread terminates it on timeout and the UI stays alive.
 *
 * This is a fault-isolation boundary, NOT a security boundary. A Web Worker
 * shares the page origin. It is the right level of isolation for single-player
 * code the player wrote themselves and is running on their own machine; it is
 * NOT sufficient for running someone else's code. See SECURITY.md.
 */

// Remove the most obvious ways for player code to reach out of the worker.
try { self.fetch = undefined } catch (e) {}
try { self.XMLHttpRequest = undefined } catch (e) {}
try { self.importScripts = undefined } catch (e) {}

function serialise(value) {
  return JSON.stringify(value === undefined ? null : value)
}

self.onmessage = (event) => {
  const { code, entry, cases } = event.data

  let fn
  try {
    // Player code is evaluated once; the entry function is then pulled out.
    // eslint-disable-next-line no-new-func
    const factory = new Function(`"use strict";\n${code}\n;return typeof ${entry} === "function" ? ${entry} : null;`)
    fn = factory()
  } catch (err) {
    self.postMessage({ type: 'fatal', kind: 'syntax', message: String(err && err.message ? err.message : err) })
    return
  }

  if (!fn) {
    self.postMessage({
      type: 'fatal',
      kind: 'missing_entry',
      message: `No function named "${entry}" was found. Keep the function name from the starter code.`
    })
    return
  }

  const results = []
  for (let i = 0; i < cases.length; i++) {
    self.postMessage({ type: 'progress', index: i })
    const args = JSON.parse(cases[i].argsJson)
    const started = performance.now()
    try {
      const out = fn(...args)
      results.push({ index: i, ok: true, actualJson: serialise(out), ms: performance.now() - started })
    } catch (err) {
      results.push({
        index: i,
        ok: false,
        errorKind: 'runtime',
        message: String(err && err.message ? err.message : err),
        ms: performance.now() - started
      })
    }
  }

  self.postMessage({ type: 'done', results })
}
