#!/usr/bin/env node
/**
 * npm run content:build
 *
 * Compiles content/ into public/content/, which the game fetches at runtime.
 *
 * Why this exists: with missions inside the JS bundle, every content fix needed
 * a full redeploy and the bundle grew with every level added. As versioned JSON
 * on the CDN, a typo fix is a content push, and the app's bundle size is flat
 * whether there are 5 missions or 500.
 *
 * The reference solution and generator are emitted as source strings, because
 * the game verifies client-side and needs to execute them. See SECURITY.md —
 * this is a deliberate, documented consequence of free client-side execution,
 * not an oversight.
 */
import fs from 'node:fs'
import path from 'node:path'
import { loadAll, validateSchema, c } from './lib.mjs'
import { LANGUAGES, starterFor, entryName } from '../lang/languages.mjs'

const OUT = path.resolve('public/content')
const RAND = path.resolve('content/lib/rand.js')

const missions = await loadAll()

// Never build unverified content.
let bad = 0
for (const m of missions) {
  const errs = validateSchema(m)
  if (errs.length) {
    bad++
    console.log(`${c.red('FAIL')}  ${m.dir}: ${errs[0]}`)
  }
}
if (bad) {
  console.log(c.red(`\n${bad} mission(s) failed schema validation. Run "npm run content:verify" for detail.\n`))
  process.exit(1)
}

// The generator helpers get inlined, so the emitted source is self-contained.
const helpers = fs.readFileSync(RAND, 'utf8')
  .replace(/^export\s+/gm, '')
  .trim()

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const index = []
for (const m of missions) {
  const x = m.meta
  // Starter templates and entry names for every language are DERIVED from the
  // mission's typed signature at build time. Only JavaScript and Python have
  // hand-written starters in mission.json; the rest are generated, which is why
  // adding a language costs one adapter rather than 100 templates.
  const entryCamel = x.entry.javascript
  const starter = { ...x.starter }
  const entry = { ...x.entry }
  for (const lang of LANGUAGES) {
    entry[lang.id] = entry[lang.id] ?? entryName(lang.id, entryCamel)
    if (!starter[lang.id]) {
      starter[lang.id] = starterFor(lang.id, x.signature, entryCamel, starterHint(x))
    }
  }

  const doc = {
    ...x,
    entry,
    starter,
    refSrc: wrap(m.sources.ref),
    genSrc: wrap(m.sources.gen, helpers)
  }
  fs.writeFileSync(path.join(OUT, `${x.id}.json`), JSON.stringify(doc))
  index.push({
    id: x.id,
    level: x.level,
    title: x.title,
    zone: x.zone,
    topic: x.topic,
    difficulty: x.difficulty,
    milestone: x.milestone ?? null,
    file: `${x.id}.json`
  })
}

const calibrationPath = path.resolve('content/calibration.json')
const calibration = fs.existsSync(calibrationPath)
  ? JSON.parse(fs.readFileSync(calibrationPath, 'utf8'))
  : { weights: { javascript: 1, python: 5 }, note: 'Default weights — run npm run content:measure to replace with measured values.' }

const version = new Date().toISOString()
fs.writeFileSync(
  path.join(OUT, 'index.json'),
  JSON.stringify({ version, totalCampaignLevels: 100, calibration, missions: index }, null, 2)
)

const bytes = fs.readdirSync(OUT).reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0)
console.log(c.green(`\nBuilt ${missions.length} missions → public/content/  (${(bytes / 1024).toFixed(1)} kB total)`))
console.log(c.dim(`version ${version}\n`))

/** One-line reminder placed in every generated starter template. */
function starterHint(x) {
  const first = x.description.split('. ')[0]
  return first.length > 90 ? 'Implement this function.' : first + '.'
}

/**
 * Turn an ES module that default-exports a function into a source string that
 * `new Function(src)()` evaluates to that function.
 */
function wrap(src, prelude = '') {
  const body = src
    .replace(/^\s*import[^\n]*\n/gm, '')   // helpers are inlined instead
    .replace(/export\s+default\s+/, 'return ')
    .trim()
  return `${prelude}\n${body}`
}
