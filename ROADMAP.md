# Roadmap

Phase 1 is complete. Phases are ordered so that no phase forces earlier work to be redone.

---

## ✅ Phase 1 — Vertical slice (this repository)

SVG map, briefing, CodeMirror editor, real JavaScript and Python execution, visible and
generated hidden tests, empirical performance ratings, XP, streaks, items, achievements,
mastery, prototype persistence.

The loop that matters is proven: **map → mission → code → run → test → reward → unlock.**

---

## ✅ Phase 2 — Content pipeline

Four commands under `tools/content/`, plus the migration of missions out of the JS bundle
into versioned JSON served from `public/content/`.

- `content:new` — scaffolds a mission folder with every file the verifier expects
- `content:verify` — schema, example drift, reference-vs-independent cross-check across
  2,000 generated cases, generator scale, and the naive-must-fail-the-gate proof
- `content:measure` — real reference timings, and a real Python weight measured by running
  an identical workload under Node and Pyodide
- `content:build` — emits versioned JSON; refuses to build unverified content

**What it caught immediately.** Level 4's reference ran in 0.6 ms at n = 200,000, so its
performance rating was mostly measuring timing noise — the scale was raised to 2,000,000.
And the Python time weight, assumed to be 4×, measured closer to 6×; Python players had
been held to a stricter standard than intended. Both were invisible without tooling.

See [CONTENT.md](CONTENT.md) for the authoring workflow.

---

## ✅ Phase 3 — Accounts and progress sync

Supabase, wired so it is entirely optional: no credentials means no login button and no
SDK download.

- `supabase/001_schema.sql` — profiles, mission_progress, submissions, with Row Level
  Security on every table and a trigger that rejects a cleared level whose predecessors
  are not cleared
- Offline-first: local write always happens first, cloud push is debounced in the
  background, and gameplay never blocks on the network
- Sign-up merges any progress earned while signed out instead of discarding it
- The SDK is dynamically imported into its own chunk — it is 57 kB gzipped, four times the
  size of the app itself, and players without accounts never fetch it

**Not claimed:** this is not server-side verification. Progression is still computed in the
browser, because execution is. The database enforces what it can (ownership, level order),
which stops casual tampering and catches client bugs. See SECURITY.md.

---

## ✅ Phase 4 — More languages

Eleven languages: JavaScript and Python in the browser, plus TypeScript, C++, Java, C#,
Go, Rust, Kotlin, Swift and Ruby through a Judge0 instance.

The enabling idea is that **a mission needs no reference solution per language** — expected
outputs always come from the JavaScript reference, so a player's program only has to read
arguments, call a function, and print a result. Adding a language costs one adapter, not
100 solutions. Every mission now carries a typed signature, and starter templates are
generated from it at build time.

Verified: the C++ harness compiles for all 100 missions, and five real C++ solutions run
correctly against their visible tests. Not verified: the eight other judge harnesses, and
the Judge0 client itself — no instance was reachable from the build environment. See
LANGUAGES.md.

<details><summary>Original Phase 4 plan</summary>


**C++** compiles to WebAssembly in-browser and can stay free, at the cost of a large
one-time toolchain download.

**Java** does not have a good browser story. Realistic options: leave it out, or make it
the one feature that justifies a small server-side judge. Decide when you get there — the
language adapter layer in `runtime/runner.js` is where it plugs in either way.

Serialisation glue for trees and linked lists is the real work here, and it must be
defined once and shared across all languages.
</details>

---

## ▶ Phase 5 — Progression depth (partly done)

Full item effects, multi-language bonus surfacing, richer mastery decay, per-topic
practice recommendations.

---

## ✅ Phase 6 — Content

**All 100 written, verified and measured.**

Five zones: Beginner Valley (1–10), Programming District (11–20), Data Structure Forest
(21–30, 51–60), Network Zone (31–50, 61–70), and the Core (71–100). Forty missions carry
performance gates; difficulty runs 1 to 6 with the weight in the upper half.

The procedure used to build them, and to add more, is in [FINISHING.md](FINISHING.md).

Author in blocks of 5–10, running `npm run content:verify` before starting the next block.
Do not batch-write twenty missions and verify at the end — the failures compound and become
hard to attribute.

Blocks 1–2 (levels 1–20) are the shape to follow: seven teaching levels, two reinforcement,
one synthesis, with a debug mission around level 9 and 19.

---

## ✅ Phase 7 — Polish (core done)

- Map layout is now **generated from the mission list**, so it extends itself as content is
  added rather than wrapping nodes on top of each other past level 5
- Multi-zone rendering and labelling, driven by each mission's `zone`
- Reduced-motion setting, focusable map nodes, non-colour status indicators throughout

Level 50 now has milestone treatment: a ringed, enlarged map node, a priority-transmission
briefing, and a Core status report on completion — diegetic, not a congratulation screen.

Level 100 has boss treatment: a gold map node labelled THE CORE, a final-transmission
briefing, and a closing status report — ALL SECTORS ONLINE, CODE RUNNER STATUS: MASTER.

**Still open:** optional sound.

---

## ✅ Phase 8 — Launch hardening

- `public/_headers` — CSP (including the `wasm-unsafe-eval` Pyodide requires), nosniff,
  frame-deny, referrer and permissions policy
- Cache policy: immutable hashed assets, short-lived revalidated content
- `src/game/analytics.js` — call sites wired at every meaningful event, **no-op until a
  provider is registered**. Nothing is collected today.
- Custom domain instructions in SETUP.md

---

# The 100-level curriculum

Difficulty is driven by **concept count × reasoning depth × edge-case density** — never by
larger inputs alone. Each block runs 7 teaching levels, 2 reinforcement, 1 synthesis.

### 1–10 · Beginner Valley — Fundamentals
*No hidden tests or performance gates on 1–5. Zero-friction onboarding.*

1 Signal Echo · 2 Threshold Check · 3 Diagnostic Sweep · 4 Peak and Trough · 5 Frequency
Map · 6 Routing Logic · 7 Grid Scan · 8 Calibration Routine · 9 Broken Regulator
*(debug mission)* · 10 **Boot Sequence**

> Levels 1–5 are built. Note that 4 and 5 pull arrays and hashing earlier than a
> conventional syllabus — this gets the player to a genuinely satisfying problem inside
> five levels instead of fifteen.

### 11–20 · Arrays & Strings
11 Sensor Array Walk · 12 Signal Reversal · 13 Mirror Check *(palindrome)* · 14 Duplicate
Nodes · 15 Converging Probes *(two pointers)* · 16 Window Scan *(fixed window)* · 17
Substring Extraction · 18 Character Census · 19 Corrupted Log *(debug)* · 20 **Array Gate**

### 21–30 · Hashing & Prefix Sums
21 Lookup Table · 22 Unique Registry · 23 Paired Signal · 24 Running Total · 25 Balanced
Segment · 26 Rearranged Cipher *(anagrams)* · 27 Longest Clean Burst *(variable window)* ·
28 Grouped Transmissions · 29 Range Query Cache · 30 **Signal Registry**

### 31–40 · Searching & Sorting
31 Linear Sweep · 32 Halving Search · 33 Boundary Locator · 34 Insertion Point · 35 Rotated
Signal · 36 Merge Streams · 37 Divide and Order *(merge sort)* · 38 Partition Protocol ·
39 Kth Strongest Signal · 40 **Search on Answer**

### 41–50 · Recursion, Linked Lists, Stacks & Queues
41 Descent *(recursion basics)* · 42 Self-Similar Structure · 43 Chain Traversal · 44 Chain
Reversal · 45 Midpoint Probe · 46 Loop Detection *(Floyd)* · 47 Bracket Integrity · 48
Constant-Time Minimum · 49 Monotonic Scan · 50 **THE HALF-CORE** *(largest-rectangle class)*

> **Recursion sits here, before trees.** It is the single biggest beginner wall and
> deserves dedicated levels rather than appearing for the first time compounded with a new
> data structure.

### 51–60 · Trees
51 Node Traversal · 52 Level Sweep · 53 Depth Probe · 54 Structural Identity · 55 Mirror
Inversion · 56 Ordered Tree *(BST)* · 57 Validity Audit · 58 Common Ancestor · 59 Widest
Span *(diameter)* · 60 **Tree Serialization**

### 61–70 · Graphs
61 Network Map · 62 Breadth Sweep · 63 Depth Sweep · 64 Isolated Regions · 65 Component
Count *(union-find)* · 66 Cycle Alarm · 67 Network Clone · 68 Dependency Order
*(topological sort)* · 69 Least-Cost Route *(Dijkstra)* · 70 **Grid Pathfinding**

### 71–80 · Greedy & Backtracking
71 Overlapping Windows · 72 Maximum Throughput · 73 Exchange Argument · 74 All Orderings ·
75 Power Set · 76 Selection Sets · 77 Target Assembly · 78 Grid Word Trace · 79
Conflict-Free Placement *(N-Queens)* · 80 **Constrained Optimization**

### 81–90 · Dynamic Programming
81 Overlapping Work *(memoization)* · 82 Step Counter · 83 Non-Adjacent Selection · 84
Minimum Denominations · 85 Capacity Allocation *(knapsack)* · 86 Longest Ascent *(LIS)* ·
87 Shared Sequence *(LCS)* · 88 Transformation Cost *(edit distance)* · 89 Grid DP with
obstacles · 90 **State-Machine DP**

### 91–100 · The Core
91 Graph + DP *(DAG longest path)* · 92 Tree DP *(rerooting)* · 93 Binary search + greedy
feasibility · 94 Shortest path with a state dimension · 95 Advanced strings *(KMP class)* ·
96 Backtracking with pruning under a time limit · 97 Bitmask DP · 98 Union-find + sorting
*(MST class)* · 99 Multi-concept gauntlet · 100 **CORE RESTORATION**

> Levels 91–100 are the only ones where a correct-but-slow solution fails outright, and
> each states its complexity requirement in the briefing. Level 100 requires graph
> modelling, DP, and a provable complexity bound — genuinely hard, never artificially
> impossible.

## Difficulty curve

Blocks 1–3 stay gentle; concept introduction dominates. Blocks 4–6 climb steeply as
implementation complexity rises. Blocks 7–8 plateau in difficulty but widen in *reasoning*
— greedy correctness arguments and search-space pruning. Blocks 9–10 climb again.

The two known drop-off points are **level 41 (recursion)** and **level 81 (DP)**. Both
bands get an extra scaffolding level and additional hint tiers.

## Milestones

**Level 50** and **level 100** get milestone treatment, delivered *diegetically* — the Core
reports its own status, a sector comes online, the map's lighting changes. No screen
congratulates the player on no longer being a beginner.
