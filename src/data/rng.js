/**
 * Deterministic PRNG. Must stay identical to content/lib/rand.js — the
 * verifier's generated tests and the game's generated tests have to agree.
 */
export function makeRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
