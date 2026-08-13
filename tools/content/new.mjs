#!/usr/bin/env node
/**
 * npm run content:new -- 6 "Signal Reversal"
 *
 * Scaffolds a mission folder with every file the verifier expects, pre-filled
 * with TODOs. Starting from a template rather than a blank folder is what keeps
 * 95 missions consistent.
 */
import fs from 'node:fs'
import path from 'node:path'
import { c } from './lib.mjs'

const [levelArg, ...titleParts] = process.argv.slice(2)
const level = Number(levelArg)
const title = titleParts.join(' ').trim()

if (!Number.isInteger(level) || level < 1 || level > 100 || !title) {
  console.log(c.red('\nUsage: npm run content:new -- <level 1-100> "<Title>"\n'))
  process.exit(1)
}

const pad = String(level).padStart(3, '0')
const dir = path.resolve('content/missions', `level-${pad}`)
if (fs.existsSync(dir)) {
  console.log(c.red(`\ncontent/missions/level-${pad} already exists.\n`))
  process.exit(1)
}

const camel = title.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/)
  .map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join('')
const snake = camel.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())

fs.mkdirSync(path.join(dir, 'solutions'), { recursive: true })

const mission = {
  id: `level_${pad}`,
  level,
  zone: 'valley',
  title,
  topic: 'TODO',
  difficulty: 2,
  prerequisites: [],
  expectedComplexity: 'O(n)',
  story: {
    briefing: 'TODO — what has gone wrong, in two or three sentences.',
    success: 'TODO — one line confirming the repair.'
  },
  description: 'TODO — state the task precisely. Every edge case, tie-break rule and empty-input behaviour must be explicit. If a player has to guess, the mission is broken.',
  constraints: 'TODO — e.g. 1 <= n <= 200000',
  entry: { javascript: camel, python: snake },
  starter: {
    javascript: `function ${camel}(input) {\n  // TODO\n  \n}`,
    python: `def ${snake}(input):\n    # TODO\n    pass`
  },
  examples: [
    { input: 'TODO', output: 'TODO', explanation: 'Optional.' }
  ],
  visible: [{ args: [] }],
  hints: [
    'TODO hint 1 — conceptual direction. Name the idea, give nothing away.',
    'TODO hint 2 — approach, plus the trap people fall into.',
    'TODO hint 3 — the actual steps, still leaving the code to write.'
  ]
}

fs.writeFileSync(path.join(dir, 'mission.json'), JSON.stringify(mission, null, 2) + '\n')

fs.writeFileSync(path.join(dir, 'generator.js'),
`import { int } from '../../lib/rand.js'

// Hidden-test generator.
//   gen(rng)        -> a normal correctness case, small random size
//   gen(rng, scale) -> a performance case; MUST honour \`scale\` exactly
//
// Over-sample the edges. Uniform random input rarely produces the cases that
// actually break solutions: minimum sizes, all-equal values, all-negative
// values, sorted and reverse-sorted input, duplicates.
export default (rng, scale) => {
  const n = scale ?? int(rng, 1, 60)
  const a = new Array(n)
  for (let i = 0; i < n; i++) a[i] = int(rng, -1000, 1000)
  return [a]
}
`)

fs.writeFileSync(path.join(dir, 'solutions', 'reference.js'),
`// Reference solution. Must be correct AND optimal: it defines the expected
// output for every hidden test and the timing baseline for performance
// ratings. If this is slower than a player's answer, nobody can earn Efficient.
// Never shown to the player.
export default (input) => {
  // TODO
}
`)

fs.writeFileSync(path.join(dir, 'solutions', 'independent.js'),
`// Independent implementation, written WITHOUT looking at reference.js.
// The verifier requires these two to agree across thousands of generated
// cases. If they disagree, one of them is wrong — that is the entire point.
// Use a different approach from the reference wherever you can.
export default (input) => {
  // TODO
}
`)

fs.writeFileSync(path.join(dir, 'solutions', 'naive.js'),
`// Deliberately naive solution — the one a learner would plausibly reach for.
// The verifier asserts this FAILS the performance gate. If it passes, the gate
// is decorative and the Efficient rating means nothing.
//
// Delete this file if the mission has no \`perf\` gate.
export default (input) => {
  // TODO
}
`)

console.log(c.green(`\nCreated content/missions/level-${pad}\n`))
console.log(`  1. Fill in mission.json (every TODO)`)
console.log(`  2. Write reference.js, then independent.js ${c.dim('without looking at it')}`)
console.log(`  3. Add a perf gate + naive.js if complexity is part of the lesson`)
console.log(`  4. ${c.bold('npm run content:verify')}`)
console.log(`  5. ${c.bold('npm run content:measure')} ${c.dim('then')} ${c.bold('npm run content:build')}\n`)
