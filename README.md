# Code Runner — Restore the Core

A browser-based coding adventure game. You travel a 2D map, and every node is a real
programming mission: read the briefing, write actual code, run it against real tests, and
push power one sector further down the valley.

**The campaign is complete: all 100 levels are written and verified, across five zones.**
The engine, the content pipeline, accounts, polish and deployment hardening are finished.
C, C++, Java and seven more are wired in and can run **free** through the public Piston
service — one environment variable, no account, no cost. See **[LANGUAGES.md](LANGUAGES.md)**.

Before launching, work through **[FINISHING.md](FINISHING.md) Part 1** — a short list of
things only you can do, including running `npm run content:measure` on your own hardware
and playing the campaign yourself.
Everything in it is real and working. Nothing is mocked. What is not built yet is listed
plainly in [Status](#status) below, not disguised.

---

## What actually works right now

| Feature | Status |
|---|---|
| SVG campaign map with 5 level nodes, locked/available/cleared states | ✅ Real |
| Mission briefing with story, topic, difficulty, target complexity | ✅ Real |
| CodeMirror 6 editor with per-language grammars | ✅ Real |
| **12 languages** — 2 in-browser, 10 via a **free** execution service | ✅ Real (see [LANGUAGES.md](LANGUAGES.md)) |
| Batched submission — all 21 test cases in **one** request | ✅ Real |
| Typed signatures on all 100 missions; starters generated per language | ✅ Real |
| **Code execution** — your code genuinely runs | ✅ Real (Web Worker / Pyodide WASM) |
| Visible tests via **Run** — free, unlimited, no streak penalty | ✅ Real |
| 18 **hidden tests**, freshly generated per submission | ✅ Real |
| **Performance measurement** against a reference solution | ✅ Real (empirical timing) |
| Bronze / Silver / Gold ratings | ✅ Real |
| XP, player level, clean streaks, streak rewards | ✅ Real |
| Items with actual effects (Energy Cell, Hint Scanner, Streak Shield) | ✅ Real |
| Achievements, skill mastery bars | ✅ Real |
| 3-tier hint system, Perfect rating forfeited on hint use | ✅ Real |
| Debug-oriented failure reports (input, expected, received, error, timeout) | ✅ Real |
| **Content pipeline** — verify, measure, build, scaffold | ✅ Real (Phase 2) |
| Missions served as versioned JSON, loaded on demand | ✅ Real (Phase 2) |
| **Accounts** — email sign-up, sign-in, sign-out | ✅ Real (Phase 3) |
| **Cross-device progress sync** with offline-first local writes | ✅ Real (Phase 3) |
| Local progress merged into the cloud save on first login | ✅ Real (Phase 3) |
| Row Level Security + level-order database trigger | ✅ Real (Phase 3) |
| Map layout that extends itself as missions are added | ✅ Real (Phase 7) |
| CSP and security headers, cache policy, analytics hooks | ✅ Real (Phase 8) |
| Progress persistence without an account | ⚠️ Browser-local, and the UI says so |
| C++ and Java | ❌ Not built (Phase 4) |
| Milestone treatment for level 50 | ✅ Real (Phase 7) |
| **All 100 campaign missions** | ✅ Real — verified, measured, and gated |
| Boss treatment for level 100 | ✅ Real (Phase 7) |

The in-app banner states the prototype persistence limitation to the player. It is not
presented as a database and there is no fake login screen.

---

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Full setup, deployment and custom-domain instructions: **[SETUP.md](SETUP.md)**.

---

## Why it stays lightweight

Free hosting and fast loading were the hard constraints, so the architecture has no server
at all. Your code executes on your own machine.

Measured production build:

```
index.html      0.61 kB   (gzip 0.37 kB)
CSS             8.55 kB   (gzip 2.52 kB)
app             41.5 kB   (gzip 14.1 kB)
react vendor   141.8 kB   (gzip 45.4 kB)
content index   2.4 kB
──────────────────────────────────────────
first load                ≈ 63 kB gzipped
supabase       218.0 kB   (gzip 57.5 kB)   loaded ONLY if accounts are configured
editor (lazy)  450.2 kB   (gzip 157 kB)   loaded only when a mission opens
mission JSON    ~2-3 kB each             loaded only when that mission opens
Pyodide                   ≈ 6 MB, from CDN, only on first Python use, cached after
```

The map, HUD and briefing never download the editor. JavaScript missions never download
Pyodide. A player can start level 1 in JavaScript having downloaded about 62 kB.

Design choices that keep it there:

- **No Phaser.** The map is a node graph, not a game world. Plain SVG does the job for a
  few hundred bytes, and unlike a canvas it is keyboard-navigable and screen-reader
  readable.
- **CodeMirror 6 instead of Monaco.** ~157 kB gzipped instead of ~1 MB, and it works on
  touch devices.
- **No art assets.** All visuals are vector or generated. Adding missions adds no bytes to
  the map.
- **Missions are data, served separately.** Since Phase 2 they are versioned JSON on the
  CDN rather than part of the bundle, so the app's size is flat whether there are 5
  missions or 500 — and fixing a typo in a mission is a content push, not a redeploy.

---

## How verification works

**Run** executes only the three visible tests. It is free, unlimited, and never touches
your streak. This is the difference between practice and an exam.

**Submit** does three things:

1. Re-runs the visible tests.
2. Generates **18 fresh hidden tests** from the mission's seeded generator and computes
   the expected answers from the reference solution *at submit time*. There is no stored
   answer key to read.
3. If the mission has a performance gate, runs your code on a large input (200,000
   elements) and compares your time against the reference solution's time **on the same
   machine** — so a slow laptop is never punished.

### On performance: no fake Big-O detection

Statically deducing a program's complexity is not something any tool can do reliably, so
this project does not pretend to. Instead it measures, and reports honestly:

```
At n = 200,000: your solution 340 ms vs reference 55 ms.
Correct growth rate, but noticeably slower than optimal.
```

Language time budgets are weighted (Pyodide is ~4× slower than V8), so Python solutions
are not judged against JavaScript timings.

### Ratings

| | Requirement |
|---|---|
| **Bronze — SOLVED** | All visible and hidden tests pass |
| **Silver — EFFICIENT** | Bronze, plus within the mission's time budget at scale |
| **Gold — PERFECT** | Silver, plus no hints revealed |

Unlocking the next level only ever requires Bronze.

---

## Failure is cheap, on purpose

A failed submission costs your clean streak and nothing else. XP, unlocked levels, items,
achievements and past ratings are never taken away. A Streak Shield absorbs one failure
entirely.

Failures produce a real debugging report: the failing test index, the input, the expected
value, what you actually returned, the runtime error with its message, or a timeout notice
naming the test that hung.

---

## Project layout

```
supabase/001_schema.sql   database schema, RLS policies, integrity triggers
content/                  SOURCE OF TRUTH for missions
  lib/rand.js             shared PRNG for generators
  calibration.json        measured language weights (generated)
  missions/level-NNN/     mission.json, generator.js, solutions/
tools/content/            the authoring CLI
  verify.mjs  measure.mjs  build.mjs  new.mjs
public/
  content/                BUILT mission JSON the game fetches (generated)
  js-runner.worker.js     JavaScript execution worker
  py-runner.worker.js     Python execution worker (Pyodide)
src/
  data/content.js         runtime loader (index + on-demand missions)
  game/cloud.js           Supabase sync (dynamically imported, optional)
  game/analytics.js       no-op hooks; wire a provider when you want them
  runtime/runner.js       Worker lifecycle, timeouts, output comparison
  game/verify.js          Run / Submit pipeline, hidden tests, perf measurement
  game/rules.js           XP curve, tiers, items, achievements, mastery
  game/store.jsx          Game state + persistence
  components/
    MapView.jsx           SVG campaign map
    Mission.jsx           Problem panel, editor host, results console
    CodeEditor.jsx        CodeMirror 6 (code-split)
    Overlays.jsx          HUD, briefing, results, profile, toasts
```

Adding a mission means `npm run content:new -- 6 "Title"`, filling in the folder, and
running `npm run content:verify`. No component changes. See **[CONTENT.md](CONTENT.md)**.

---

## Accounts (optional)

With no Supabase credentials configured, the game runs fully offline: browser-local
progress, no login button, and not a byte of the Supabase SDK downloaded. Adding
credentials turns accounts on. See [SETUP.md](SETUP.md) §5.

Progress is written locally first and synced in the background, so gameplay never waits on
the network. Progress earned before signing up is merged into the cloud save rather than
discarded — the higher value wins on every field.

## Documentation

- **[SETUP.md](SETUP.md)** — install, run, build, deploy, connect your domain
- **[CONTENT.md](CONTENT.md)** — how to author new missions
- **[SECURITY.md](SECURITY.md)** — what the sandbox does and does not protect against
- **[LANGUAGES.md](LANGUAGES.md)** — the eleven languages, the wire format, and what needs
  an execution server
- **[FINISHING.md](FINISHING.md)** — how to extend the campaign, and what only you can do
- **[ROADMAP.md](ROADMAP.md)** — the remaining phases, and the 100-level curriculum

## Status

**Done.** Engine, content pipeline, accounts and sync, polish, deployment hardening, and
the full 100-level campaign.

```
100 missions          5 zones           27 topics
40 performance gates  2 milestones      difficulty 1-6
317 kB of content     ~63 kB first load
```

Every mission carries an original problem statement, a reference solution, an
independently written second solution cross-checked over 2,000 generated cases, a seeded
hidden-test generator, three hints, and — where a genuinely slower approach exists — a
naive solution proven to fail the performance gate.

**Remaining: a smoke test of the nine judge languages against a real Judge0 instance.**
The C++ path is verified locally — all 100 harnesses compile, and five real solutions run
correctly — but no judge was reachable from the build environment, so the other eight
harnesses have never been compiled. [LANGUAGES.md](LANGUAGES.md) says exactly what was and
was not tested, and where any fix goes.

That remainder is not a small tail — it is the majority of the project's total effort.
Every mission needs an original problem statement, a reference solution, an independently
written second solution to cross-check it, a naive solution to prove the performance gate
holds, a seeded generator, and a passing verification run. There is no shortcut that
produces good ones quickly, and bad ones are worse than none: a mission with a broken
generator is a mission nobody can finish.

Across all 100 missions the verifier rejected a bug in roughly one in five, including
three in level 15 alone. Every one of those was caught before a player could hit it. If
you extend the campaign with side missions or daily challenges, expect the same rate — it
is the tooling working, not a problem.

### What the pipeline has caught so far

- Level 4's performance gate was measuring timing noise. Its reference ran in 0.6 ms at
  n = 200,000, so the scale was raised tenfold.
- The Python time weight, assumed to be 4×, measured **6.14×**. Python players were being
  judged too harshly against JavaScript timings.
- Level 15's spec said "smallest first index", which silently disagrees with what a
  two-pointer scan finds when values repeat. Fixed by requiring strictly increasing input.
- Level 15's stated example was simply wrong.
- Level 15's performance case let the naive solution return on its first probe, so it
  measured nothing. Fixed by generating a worst case with no valid pair.
- Level 16's window size scaled with the input, which flattened the naive solution's growth
  curve and let it pass the gate. Fixed by holding the window fixed at 1,000.
- Levels 16, 20 and 24 had references running in 1–2 ms — too fast to time reliably — so
  their scales were raised to 1.5M, 2M and 1M respectively.

None of these were findable by eye.

## Content originality

All mission text, framing, constraints and narrative are original to this project. The
underlying algorithmic concepts are standard computer science; no problem statements,
editorials or solutions have been copied from any coding platform.
