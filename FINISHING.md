# Extending the Campaign

**The 100-level campaign is complete.** This document is now the guide for adding side
missions, daily challenges, or a second campaign — plus Part 1, which is the launch
checklist and still applies.

It records the procedure that produced all 100 levels, the traps that caused most of the
failures along the way, and the things only you can decide.

---

## Part 1 — What only you can do

These are not things I withheld. They are decisions and actions that require your accounts,
your money, your machine, or your judgement.

### Must do, before launch

| # | Task | Why only you |
|---|---|---|
| 1 | **Create the Supabase project and run `supabase/001_schema.sql`** | Needs your account. Takes about five minutes — SETUP.md §4. |
| 2 | **Put the two Supabase keys in your host's environment variables** | Never send credentials to anyone, including me. Use the `anon` key only. |
| 3 | **Connect your domain** | Needs registrar access — SETUP.md §6. |
| 4 | **Run `npm run content:measure` on your own hardware** | The time budgets currently in the repo were measured on a build server. Yours will differ. Do this once before launch and commit the result. |
| 5 | **Decide on email confirmation** in Supabase → Authentication | A product decision: friction at signup versus fake addresses. |
| 6 | **Play the campaign yourself, in both languages** | Automated checks confirm a mission is *correct*. Only a person can tell whether it is *clear*. Any mission where you had to guess the intent needs its description tightened. |

### Should do

| # | Task | Notes |
|---|---|---|
| 7 | Decide the Java question | It has no good in-browser story. Either drop it, or accept a small server-side judge for that one language. Costs money either way. |
| 8 | Pick an analytics provider, or none | `src/game/analytics.js` has the call sites wired and collects nothing until you register a sink. |
| 9 | Choose a difficulty stance for levels 91–100 | How brutal is the endgame? Affects how many people finish. |
| 10 | Set up a Git repository and push | Everything here assumes version control; the deploy hosts need it. |

### Do not do

- **Do not put the `service_role` key in this app.** It bypasses Row Level Security
  entirely. The `anon` key is the one that belongs in a browser.
- **Do not skip `content:verify` because a mission "looks fine".** It has caught a bug in
  roughly one in five missions I wrote carefully, including three in level 15 alone.
- **Do not batch-write twenty missions and verify at the end.** Failures compound and
  become hard to attribute. Five to ten at a time.

---

## Part 2 — The authoring procedure

For each mission, in this order. Budget roughly 30–60 minutes per mission.

**1. Scaffold.**

```bash
npm run content:new -- 26 "Rearranged Cipher"
```

**2. Write the description before writing any code.** This is the step people skip and it
is the one that decides whether the mission is good. State explicitly: what empty input
does, what happens on ties, whether bounds are inclusive, and what to return when nothing
matches. If you cannot state the tie-break in one sentence, the problem is wrong — change
the problem, not the sentence.

**3. Write `reference.js`.** Correct *and* optimal. If it is slower than a player's
solution, nobody can earn Efficient.

**4. Write `independent.js` without looking at the reference.** Use a different approach
where one exists — the level 24 reference builds a separate prefix array, the independent
version accumulates in place. Two implementations of the same idea share the same blind
spots.

**5. Write `generator.js`.** Small random inputs for `gen(rng)`, and exactly `scale`
elements for `gen(rng, scale)`. Over-sample the edges: minimum sizes, all-equal values,
all-negative values, sorted and reverse-sorted input, heavy duplicates.

**6. If the mission has a `perf` gate, write `naive.js`** — the solution a learner would
plausibly reach for.

**7. Write three hints.** Direction, then approach *plus the trap*, then the actual steps
while still leaving the code to write.

**8. Verify, and expect to fail.**

```bash
npm run content:verify
```

**9. Measure, then build.**

```bash
npm run content:measure
npm run content:build
```

**10. Solve it yourself in the editor**, in Python as well as JavaScript.

---

## Part 3 — The six traps that account for most failures

These are the mistakes actually made while writing the 100 missions, not
hypotheticals. Roughly one mission in five had a bug the verifier caught. Expect
the same rate on anything you add.

### Trap 1 — A spec that disagrees with the intended solution

Level 15 asked for "the pair with the smallest first index", but a two-pointer scan does
not find that when values repeat — so the technique the hints teach would have failed the
mission's own tests.

**Symptom:** `cross-check: reference returned X, independent returned Y`.
**Fix:** constrain the input until the answer is unique (level 15 now requires strictly
increasing values), or redefine the output so the intended technique produces it (level 23
asks for the *earliest-completing* pair, which is exactly what a hash scan finds).

### Trap 2 — A performance case the naive solution escapes

Level 15's perf case let the naive solution find a pair on its first probe and return,
so it measured nothing.

**Symptom:** `naive solution projects to 0 ms … only 0.0x the reference`.
**Fix:** generate a worst case. For a search, make the answer *absent* — level 23 uses all
even values with an odd target, so neither solution can exit early.

### Trap 3 — A parameter that scales with n and flattens the growth curve

Level 16's window size was a fraction of the input, which made the naive O(n·k) solution
look quadratic at every sample size and defeated the projection.

**Symptom:** a plausible-looking naive solution passing the gate anyway.
**Fix:** hold secondary parameters *fixed* at scale. Level 16 now uses k = 1000 regardless
of n.

### Trap 4 — A string-input mission whose gate is never checked

Levels 27 and 28 take strings, not arrays. The verifier originally looked only for an array
argument when sizing the performance case, so it skipped both gates with a warning — they
were unproven for a while without failing anything.

**Fixed in the tooling**, not in the missions: `sizedArg()` now counts strings as well as
arrays, and an unprovable gate is a hard failure rather than a warning. If you add a
mission whose input is some other shape, extend `sizedArg` rather than accepting the
warning.

### Trap 5 — A performance gate that cannot be proven, or flakes

Three of the tree missions had gates that had to be removed. On a *balanced* tree, the
obvious naive approach — recomputing subtree depths per node, or concatenating strings
instead of joining — costs O(n log n), not O(n²). That is only a logarithmic factor above
the reference, so the gate sits right at the pass/fail boundary. Level 59's flipped between
passing and failing on identical input across consecutive runs.

**A gate that flakes is worse than no gate**, because it fails players at random on
correct solutions. When a naive approach cannot be made convincingly slower, delete the
`perf` block and the `naive.js` rather than leaving decoration behind. Verify twice before
believing a marginal gate — the second run is what exposed level 59.

You will also hit this on any structure whose depth is logarithmic. Plan for tree and
balanced-structure blocks to teach *correctness and recursion*, with performance teaching
carried by the array, hashing, stack and graph blocks where the naive approach really is
quadratic.

### Trap 6 — A performance case that never reaches the work

Level 70's large grid had its destination corner blocked. Every solution — reference and
naive alike — returned -1 on its first line, so the timing measured argument validation
rather than pathfinding.

**Before trusting any gate, check that the perf case actually has a non-trivial answer.**
The same failure appeared as a blocked exit here, an early `return` on a found pair at
level 15, and a one-pass convergence at level 62. Ask what the naive solution *does* on
your worst case, not merely how big the input is.

**And one more, from `content:measure`:** if it warns that a reference runs in under 3 ms,
raise `perf.scale`. Levels 16, 20, 24 and 32 all needed this — their scales are now
1.5M, 2M, 1M and 1M respectively. Below that threshold you are rating timing noise, not solutions.

---

## Part 4 — What was built

| Levels | Zone | Block |
|---|---|---|
| 1–10 | Beginner Valley | Fundamentals, incl. a debug mission at 9 |
| 11–20 | Programming District | Arrays and strings, debug mission at 19 |
| 21–30 | Data Structure Forest | Hashing and prefix sums |
| 31–40 | Network Zone | Searching and sorting, ending on binary search on the answer |
| 41–50 | Network Zone | Recursion, linked lists, stacks — **level 50 midpoint milestone** |
| 51–60 | Data Structure Forest | Trees and binary search trees |
| 61–70 | The Core | Graphs |
| 71–80 | The Core | Greedy and backtracking |
| 81–90 | The Core | Dynamic programming |
| 91–100 | The Core | Multi-concept — **level 100 final boss** |

Recursion sits at 41, deliberately before trees: it is the biggest beginner wall and needs
its own levels rather than appearing compounded with a new data structure. Hashing sits at
21, before searching and sorting, so a learner reaches a genuinely satisfying problem
early.

To add a block of your own, follow the same shape: seven teaching levels, two
reinforcement, one synthesis, with a debug mission around the ninth.

## Part 5 — Adding more content

The 100-level campaign is finished. Everything below applies to side missions,
daily challenges, or a second campaign.

**Budget 30–60 minutes per mission.** A block of ten is roughly 5–10 hours of
focused work — not one sitting, and not something to rush. A mission with a
broken generator is worse than no mission, because it fails a player who did
nothing wrong.

A workable rhythm is author five, verify, author five, verify, then play the
whole block end to end before moving on.

**Publishing new content is a content push, not a redeploy.** The mission loader
reads whatever `content:build` emits, so adding levels 101+ or a parallel track
means writing them, verifying, and pushing — no engine changes.

**Let real players guide what comes next.** Confusions people hit in levels 1–100
will tell you more about what a second campaign should contain than planning it
in isolation ever will.

---

## Part 6 — Launch status

Items 1, 7 and 9 in Part 1 are resolved. What remains before going live:

- [ ] Push to a Git repository — Vercel deploys from one
- [ ] Supabase URL and publishable key in Vercel's environment variables
- [ ] `VITE_PISTON_URL=default` if you want C, C++, Java and the rest
- [ ] `vercel.json` in the project root — Vercel ignores `public/_headers`, so
      without it the site ships with no security headers
- [ ] **`npm run content:measure` on your own hardware**, then commit the result.
      The budgets in the repo were measured on a build server; yours will differ,
      and they decide whether players earn Efficient fairly.
- [ ] Connect the domain, then **update Supabase → Authentication → URL
      Configuration**. Miss this and sign-up confirmation emails send new players
      to localhost.
- [ ] Decide email confirmation: on means friction at signup, off means fake
      addresses.
- [ ] One live smoke test of a compiled language — the Piston client has never
      made a real request from this codebase.
- [ ] Clear level 1 while signed out, then sign up, and confirm that level
      appears in Supabase under `mission_progress`. That backfill path has never
      run against a real database.
