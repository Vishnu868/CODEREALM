# Authoring Missions

Missions live in `content/missions/level-NNN/`. Nothing about them touches the app code.

```
content/
  lib/rand.js                 shared PRNG + helpers for generators
  calibration.json            measured language weights (generated)
  missions/
    level-004/
      mission.json            all metadata, text, examples, hints
      generator.js            hidden-test generator
      solutions/
        reference.js          correct + optimal. Defines expected output.
        independent.js        second implementation, for cross-checking
        naive.js              deliberately slow, must FAIL the perf gate
```

---

## The workflow

```bash
npm run content:new -- 6 "Signal Reversal"   # scaffold with TODOs
# ... fill it in ...
npm run content:verify                        # five checks, exits non-zero on failure
npm run content:measure                       # write real time budgets
npm run content:build                         # emit public/content/
```

`npm run build` runs verify → build → vite build, so unverified content cannot be
deployed.

---

## What the verifier checks

**1. Schema.** Required fields, level/id/folder agreement, exactly three hints, examples
and visible tests lining up 1:1, and — importantly — that `starter.javascript` actually
defines the function named in `entry.javascript` (same for Python). A typo there means
every player hits "function not found" before writing a line.

**2. Example drift.** Every `examples[i].output` string is compared against what
`reference.js` actually returns for `visible[i].args`. This is the check that earns its
keep: you tweak a tie-breaking rule, and the example above it silently becomes a lie.

**3. Reference vs independent.** Both solutions run against 2,000 generated cases and must
agree every time. Set `CASES=20000` for a deeper sweep before a release. When they
disagree, the verifier prints the exact input that separated them.

**4. Generator honours scale.** For missions with a `perf` gate, `gen(rng, scale)` must
produce input of exactly that size.

**5. The naive solution must fail the gate.** If the slow solution would earn Efficient,
the gate is decorative and the rating means nothing.

> The naive solution is **projected, not run**. A quadratic solution at n = 2,000,000 is
> 4×10¹² operations and would never return, and a synchronous call cannot be interrupted.
> So it is timed at n = 4,000 and n = 16,000, the growth exponent is recovered from those
> two points, and the result is extrapolated. In practice this reports ~1.9–2.0 for a
> quadratic solution, which is all the check needs to decide.

Advisory warnings (hints too short, difficulty ≥ 4 with no perf gate) print but do not
fail the build.

---

## What `content:measure` does

Two measurements, both replacing guesses with numbers.

**Reference timing.** Each reference solution is timed at `perf.scale`, and the result is
written back to `mission.json` as `perf.optimalMs`. If the reference runs in under 3 ms the
tool warns you — timing noise would dominate the rating, and you should raise `perf.scale`.

*That warning fired on level 4 during development: its reference ran in 0.6 ms at
n = 200,000, so the scale was raised to 2,000,000.*

**Python calibration.** An identical integer/list workload runs under Node and under
Pyodide, and the real ratio is written to `content/calibration.json`. The app reads it from
the content index at startup.

*This was assumed to be about 4×. Measured, it is closer to 6×. Python players were being
judged too harshly.*

Re-run `content:measure` when you change a reference solution or a `perf.scale`. Run it on
hardware resembling a typical player's, not a build server.

---

## Writing `reference.js`

Three jobs: expected output for visible tests, expected output for the 18 generated hidden
tests, and the timing baseline for performance ratings.

It must be **correct and optimal**. If the reference is slower than a player's solution,
nobody can earn Efficient. It is never shown to the player.

## Writing `independent.js`

Write it **without looking at the reference**, and use a different approach where you can —
the reference for level 4 does a single min/max pass, the independent implementation sorts.
Two implementations of the same idea share the same blind spots; two different ideas do
not.

## Writing `generator.js`

```js
export default (rng, scale) => {
  const n = scale ?? int(rng, 1, 60)   // gen(rng) small; gen(rng, scale) exact
  ...
  return [args]                        // array of arguments to the entry function
}
```

**Over-sample the edges.** Uniform random input rarely produces the cases that break
solutions. Level 2 spends half its budget on boundaries:

```js
const edges = [19, 20, 21, 79, 80, 81, 0, -1000, 1000]
return rng() < 0.5 ? [pick(rng, edges)] : [int(rng, -1000, 1000)]
```

Also cover minimum sizes, all-equal values, all-negative values, sorted and reverse-sorted
input, and heavy duplicates.

## Writing `naive.js`

The solution a learner would plausibly reach for — the O(n²) scan, the nested comparison.
Delete the file if the mission has no `perf` gate.

---

## The `perf` block

```json
"perf": { "scale": 2000000, "silverFactor": 6, "goldFactor": 3, "optimalMs": 3.5 }
```

- `scale` — input size for the timed run. Big enough that the wrong complexity class is
  unmissable, *and* big enough that the reference takes more than a few ms.
- `silverFactor` / `goldFactor` — multiples of the reference time. 6 and 3 are the
  defaults and are forgiving on purpose.
- `optimalMs` — **generated**. Do not edit by hand.

Omit `perf` entirely where correctness is the whole lesson. Levels 1–3 have no gate.

---

## Quality bar

- **Purpose.** Introduces, reinforces, or combines a concept. Never filler.
- **Unambiguous.** Tie-breaks, empty input and boundary behaviour stated explicitly. If a
  player has to guess, the mission is broken.
- **Prerequisites met.** Nothing required that an earlier level did not teach.
- **Difficulty from concepts, not size.** More reasoning, more interacting ideas, tighter
  constraints — never just bigger numbers.
- **Language-neutral.** Solvable idiomatically in both JavaScript and Python.
- **Original.** Your own statement, framing and constraints. The algorithmic concept is
  standard computer science; the presentation must not be copied from any coding site.

---

## Extending the map

`MapView.jsx` positions nodes from a `PATH` array of five points; a sixth mission wraps
around it. When you add levels 6+, extend `PATH` or replace it with a layout function
driven by level count. Mission data already carries `zone`, which is the hook for per-zone
theming and camera panning.
