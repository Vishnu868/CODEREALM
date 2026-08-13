# Languages

Twelve languages, in two groups.

| Language | Runs | Cost |
|---|---|---|
| JavaScript | In your browser | Free, unlimited |
| Python 3 | In your browser (Pyodide) | Free, unlimited |
| C, C++17, Java, TypeScript, C#, Go, Rust, Kotlin, Swift, Ruby | On an execution service | **Free via Piston**, or paid via your own Judge0 |

**C and C++ are free.** Not by compiling in the browser — that route means shipping ~40 MB
of unmaintained WebAssembly toolchain — but through Piston, a public execution service that
costs nothing and needs no account. One environment variable turns it on:

```
VITE_PISTON_URL=default
```

With nothing configured the game still runs JavaScript and Python in the browser exactly as
before; the compiled languages appear in the picker but are disabled with an explanation,
rather than silently vanishing or appearing to work and failing at submit time.

---

## Why the split

Python and JavaScript run in the browser because both have browser runtimes: JavaScript
natively, Python through Pyodide. Nothing leaves the player's machine, so they are free and
unlimited.

The other ten need a compiler on a machine somewhere. C and C++ *can* be compiled in a
browser — clang builds to WebAssembly — but the working builds ship roughly 40 MB of
compiler and system headers against Pyodide's 6 MB, and the available packages are
hobby-scale and largely unmaintained. That is a poor trade for two languages.

Using a service instead costs one HTTP request per test case and nothing in bundle size.

## Choosing a service

| | Piston (free) | Judge0 (your own VM) |
|---|---|---|
| Cost | Nothing | A few dollars a month |
| Setup | One env var | Deploy a VM |
| Rate limits | Shared, a few requests/second | Yours alone |
| Isolation | Someone else's server | Yours, no public ingress |
| Speed | Sequential, a few seconds per submission | Batched, faster |

**Start with Piston.** Move to Judge0 if the rate limit starts hurting real players — it is
a config change, not a rebuild. You can also self-host Piston, which is also free and
removes the shared limit.

## Speed: one request per submission

The obvious design sends one request per test case. A submit runs 3 visible plus 18 hidden
plus a performance case — **21 requests**, sequential because of the rate limit, each
recompiling the same program. That is roughly five seconds of waiting and a good way to hit
a 429 mid-submission, which would look to the player like a wrong answer.

Instead the generated program **loops over the cases itself**. Stdin carries a case count
followed by every case's arguments; the program prints every answer; the client splits them
apart. One request, one compilation, all 21 cases.

Measured locally: 21 cases of level 4 run in **3 ms** in both C and C++. The wall-clock cost
of a submit is therefore one round trip plus compilation — typically one to two seconds —
not twenty-one round trips.

Both clients batch this way. The Judge0 path uses a single submission rather than its batch
endpoint for the same reason.

### How performance is rated on a service

The browser path times the player's solution against the reference **on the same machine**,
so a slow laptop is never punished. On a shared execution service there is no comparable
reference run, and a ratio against someone else's hardware would be meaningless.

So compiled languages are judged the way a real contest judge does it: the performance case
is included in the batch, and the language's own time limit decides. A solution of the wrong
complexity class does not finish. Efficient is awarded for completing it, Perfect for
completing it without hints.

---

## What adding a language actually costs

**One adapter. Not 100 solutions.**

This falls out of how verification works. Expected outputs are always computed by the
mission's **JavaScript** reference solution — see [CONTENT.md](CONTENT.md). A player's
program never needs a reference in its own language; it only has to read the arguments,
call one function, and print the answer.

So each language needs exactly three things, all in `tools/lang/`:

1. **Type names** — how `int[]` is spelled (`vector<long long>`, `[]int64`, `Vec<i64>`…).
2. **A starter template** — generated from each mission's typed signature.
3. **An I/O harness** — reads arguments, calls the function, prints the result.

Every mission now carries a `signature` block:

```json
"signature": {
  "params": [
    { "name": "n", "type": "int" },
    { "name": "activation", "type": "int[]" },
    { "name": "links", "type": "int[][]" }
  ],
  "returns": "int"
}
```

Seven types cover the whole campaign: `int`, `bool`, `string`, `int[]`, `string[]`,
`int[][]`, `string[][]`. Starter templates for all eleven languages are **generated at
build time** from these signatures, which is why `mission.json` still only contains
hand-written JavaScript and Python starters.

> One mission had to change for this. Level 48 originally took a mixed array of
> `["push", 5]` and `["min"]`, which cannot be typed in a statically typed language. It now
> takes two parallel arrays, `ops` and `values`. If you write new missions, keep every
> argument to those seven types.

---

## The wire format

Judge sandboxes have no third-party libraries, and C++, Go, Rust and Java have no JSON
parser in their standard library. Writing nine JSON parsers would have been the bulk of the
work and the bulk of the bugs. So arguments cross on stdin in a form that is trivial to
read anywhere:

```
int          42
bool         1  or  0
string       a length line, then the raw text
int[]        a count line, then one line of space-separated values
string[]     a count line, then each element as a length line + a text line
int[][]      a row-count line, then each row as an int[]
string[][]   a row-count line, then each row as a string[]
```

Results come back the same way and are converted to JSON before comparison, so the
canonical-comparison logic is unchanged.

**Strings carry an explicit length.** Without it an empty string is indistinguishable from
a blank separator line — this was a real segfault during development, not a hypothetical.

---

## What has been tested, and what has not

Being precise about this, because it decides how much you should trust it.

**Verified locally, by compiling and running:**
- The **C++ harness compiles for all 100 missions** (`g++ -fsyntax-only -std=c++17`).
- The **C harness compiles for all 100 missions** (`gcc -fsyntax-only -std=c11`).
- Five real **C++** solutions — levels 4, 13, 48, 49 and 100, chosen to cover `int[]`,
  `string`, `string[]`, `int[][]` and array returns — compile, run, and match the
  JavaScript reference on every visible test.
- The same five in **C**, including the length-carrying signatures and `char**` handling.
- Starter templates and harnesses **generate without error** for all 100 missions in all
  ten service languages.

**Not verified:**
- Neither `src/runtime/judge.js` nor `src/runtime/piston.js` has ever made a real request —
  no execution service was reachable from the build environment.
- Java, C#, Go, Rust, Kotlin, Swift, TypeScript and Ruby harnesses have never been
  compiled or run — no compilers for them were available in the build environment. They
  follow the same pattern as the two tested ones, but expect one or two to need a fix.

**Before enabling compiled languages for players, smoke-test each one.** Take level 1,
paste the generated program into your judge with a trivial correct body, and confirm the
output. `tools/lang/harness.mjs` is where any fix goes — one file, one function per
language.

---

## Setting up an execution service

### Piston, free (recommended first step)

```
VITE_PISTON_URL=default
```

That is the whole setup — it points at the public instance. To self-host, deploy Piston
(github.com/engineer-man/piston) and set the variable to your own URL.

### Judge0, your own VM

Judge0 is the standard open-source option and is what the language IDs in
`src/runtime/languages.js` refer to.

1. Deploy Judge0 on a VM — its repository has a Docker Compose setup.
2. **Give it no public ingress.** It executes untrusted code; it should be reachable only
   from your app, hold no secrets, and have no access to your database.
3. Set the URL in your environment:

   ```
   VITE_JUDGE_URL=https://judge.yourdomain.com
   ```

4. Restart. The compiled languages become selectable.

Read [SECURITY.md](SECURITY.md) first. Judge0 wraps **isolate**, the sandbox used for IOI
grading — namespaces, cgroups, seccomp filters, and CPU, memory, process and output caps.
Do not substitute a plain Docker container: that is a packaging boundary, not a boundary
against hostile code.

Expect a small VM to cost a few dollars a month and to handle 10–20 concurrent
submissions. Per-user rate limiting matters more here than anywhere else in the app,
because each submission now costs real compute.

---

## Adding a thirteenth language

1. Add an entry to `LANGUAGES` in both `tools/lang/languages.mjs` and
   `src/runtime/languages.js`, with its Judge0 id, plus a mapping in
   `src/runtime/piston.js`.
2. Add its type names to `TYPES` and a case to `starterFor`.
3. Add a harness to `HARNESS` in `tools/lang/harness.mjs`, plus its reader and writer.
4. Optionally add a grammar loader in `src/components/CodeEditor.jsx` — languages without
   one fall back to a near neighbour, which is fine for highlighting.
5. `npm run content:build`, then smoke-test on your judge.

No mission content changes. That is the whole point of the signature layer.
