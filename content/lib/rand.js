/** Deterministic PRNG shared by every generator, so tests are reproducible. */
export function makeRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

export const int = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1))

export const pick = (rng, arr) => arr[int(rng, 0, arr.length - 1)]
