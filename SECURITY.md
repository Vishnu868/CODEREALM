# Security Model

This document states plainly what the current architecture protects against and what it
does not. Nothing here is oversold.

---

## The core trade-off

Player code runs **in the player's own browser**, inside a Web Worker (JavaScript) or
Pyodide/WebAssembly (Python).

That choice is what makes the game free to host and fast to load. It also means the two
guarantees a server-side judge would give you are not available:

1. Hidden test data lives on the player's machine during execution.
2. Progression is computed on the player's machine.

## What the Web Worker boundary actually is

It is a **fault-isolation boundary, not a security boundary.**

It protects against:

- **Infinite loops.** The worker is terminated on wall-clock timeout; the page stays
  responsive.
- **Crashes and exceptions.** They kill the worker, not the app.
- **Runaway memory.** The browser reclaims it when the worker is terminated.
- **Main-thread blocking.** Player code never touches the UI thread.

It does **not** protect against:

- **Same-origin access.** A worker shares the page origin. `fetch`, `XMLHttpRequest` and
  `importScripts` are removed from the worker global before player code runs, which stops
  casual misuse — but this is defence in depth, not a sandbox.
- **Anything an attacker writes.** If you ever let one user run another user's code in
  this architecture, you have an XSS vector. Do not do that.

**This model is correct for what the game is: single-player, running code the player wrote
themselves, on their own machine.** It is exactly as safe as a browser developer console.
It would be entirely wrong for shared or submitted code.

---

## Cheating

The honest position: **a determined player can cheat, and it does not matter here.**

Code that runs client-side can be inspected. Someone with developer tools open can read
the generated tests or edit their saved progress.

What is at stake: a free, single-player campaign with no prizes, no rankings, and nothing
to win. Cheating means lying to yourself about whether you can write a hash map.

Mitigations that cost nothing and are implemented:

- **No stored answer key.** Hidden expectations are computed at submit time by running the
  mission's reference solution against freshly generated inputs. There is no list of
  expected outputs anywhere in the bundle to look up.
- **Fresh tests per submission.** The generator is seeded from the submission time, so
  tests differ between attempts and cannot be memorised.
- **Hints are tracked**, which is what makes the Perfect rating meaningful.
- **Reference solutions are not printed** anywhere in the UI.

### If you ever add a public leaderboard

Do not extend this model to cover it. Add server-side re-verification for that feature
alone: on a leaderboard-eligible submission, send the source to a server-side judge and
re-run it there. Everything else can stay free and client-side. Scoping paid verification
to the one feature that needs it is the whole point.

---

## Secrets

- No API keys, tokens or credentials exist in this codebase, and none are required.
- `.env` and `.env.local` are gitignored.
- Any `VITE_`-prefixed variable is **compiled into the public bundle**. Treat every one as
  published. A Supabase *anon* key is built for that; a *service role* key must never be
  used in a browser application.

---

## Third-party dependencies at runtime

One: **Pyodide**, fetched from `cdn.jsdelivr.net` on first Python use. It is CPython
compiled to WebAssembly, maintained under the Python software ecosystem.

If you would rather not depend on a third-party CDN, self-host it — see SETUP.md §6.

---

## What accounts do and do not change (Phase 3, implemented)

Accounts add storage and identity. They do **not** add verification, because execution is
still client-side.

What the database does enforce:

- **Row Level Security on every table.** A player can only read or write their own rows.
  Without these policies everything would be world-readable through the anon key, which
  ships in the browser bundle.
- **Level ordering.** A trigger rejects a cleared level whose predecessors are not cleared.
- **Value constraints.** XP, streaks and attempt counts cannot go negative; tiers must be
  one of three known values.

This stops casual tampering and catches genuine client bugs. It does not stop someone who
edits their own client, and it is not claimed to.

**Never put the `service_role` key in this application.** It bypasses RLS entirely. Only
the `anon` key belongs in a browser.

## What would change with server-side execution

Were execution to move server-side, these rules would apply from day one:

- The client sends `{ missionId, language, sourceCode }` and **nothing else**. A client
  claim of `"completed": true` is ignored.
- XP, tiers, unlocks, streaks, items and achievements are computed on the server from a
  verified submission record.
- The server checks that level *N−1* is actually cleared before accepting a submission
  for *N*.
- Rate limits and a per-user compute budget cap abuse.
- Test data and reference solutions never leave the server.

If code execution ever moves server-side too, the Web Worker is not an acceptable
substitute for a real sandbox. Use **isolate** (via Judge0) on a dedicated host with no
network egress, no access to the application database, and per-execution CPU, memory,
process-count and output limits.

---

## Reporting

Found a problem? Open an issue describing the impact. Please do not include working
exploit code in a public issue.
