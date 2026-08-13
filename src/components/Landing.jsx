import { useGame } from '../game/store'
import { LANGUAGES, serverEnabled } from '../runtime/languages'

/**
 * The landing page.
 *
 * A player arriving at a map of 100 locked nodes has no idea what they are
 * looking at. This page answers, in order: what is this, what will I do, what
 * will I learn, and what happens when I fail. Then it gets out of the way.
 *
 * It is shown once and dismissed by entering. Returning players land straight on
 * the map with a Continue button here if they ever come back to it.
 */

const ZONES = [
  {
    id: 'valley',
    range: '1–10',
    name: 'Beginner Valley',
    line: 'The relays are silent. Bring them back one at a time.',
    topics: 'Output, conditionals, loops, functions, first arrays'
  },
  {
    id: 'district',
    range: '11–30',
    name: 'Programming District',
    line: 'The district logs everything. Learn to read it.',
    topics: 'Arrays, strings, hashing, prefix sums, sliding windows'
  },
  {
    id: 'network',
    range: '31–50',
    name: 'Network Zone',
    line: 'Nothing here is indexed. Learn to search it.',
    topics: 'Binary search, sorting, recursion, linked lists, stacks'
  },
  {
    id: 'forest',
    range: '51–60',
    name: 'Data Structure Forest',
    line: 'The lattice branches in two at every junction.',
    topics: 'Trees, traversals, binary search trees'
  },
  {
    id: 'core',
    range: '61–100',
    name: 'The Core',
    line: 'Everything is connected. Prove you can see how.',
    topics: 'Graphs, greedy, backtracking, dynamic programming'
  }
]

const ACCENT = {
  valley: '#4dd6c1',
  district: '#6aa9ff',
  forest: '#8fd96a',
  network: '#c88fff',
  core: '#ffb46b'
}

const LOOP = [
  { n: '01', t: 'Read the briefing', d: 'A sector has failed, and the reason is a problem you can solve.' },
  { n: '02', t: 'Write real code', d: 'A proper editor, your language, no multiple choice.' },
  { n: '03', t: 'Run it, free', d: 'Check the visible tests as often as you like. Running never costs you anything.' },
  { n: '04', t: 'Submit', d: 'Eighteen hidden tests, generated fresh, plus a check that it scales.' },
  { n: '05', t: 'The sector powers up', d: 'XP, a rating, your streak — and the next node unlocks.' }
]

export default function Landing({ onEnter }) {
  const { highestCleared, xp } = useGame()
  const returning = highestCleared > 0
  const free = LANGUAGES.filter((l) => l.where === 'browser')
  const server = LANGUAGES.filter((l) => l.where === 'server')

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-inner">
          <div className="eyebrow">Signal received</div>
          <h1 className="hero-title">CODE RUNNER</h1>
          <div className="hero-sub">Restore the Core</div>

          <p className="hero-lede">
            The Core ran everything, and the Core has gone dark. The failure spread outward —
            relays silent, gates locked, whole sectors without power.
          </p>
          <p className="hero-lede">
            The network is broken because <em>its logic is broken</em>. A gate rejects valid signals
            because its comparison is wrong. A junction cannot route power because nobody wrote the
            rule. You are a Code Runner. You repair the system by writing the code that makes it
            work, one sector at a time, until the Core comes back online.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onEnter}>
              {returning ? `Continue at level ${highestCleared + 1}` : 'Begin at Sector 1'}
            </button>
            {returning && (
              <span className="hero-progress">
                {highestCleared} / 100 sectors restored · {xp.toLocaleString()} XP
              </span>
            )}
          </div>

          <div className="hero-stats">
            <div><b>100</b><small>Missions</small></div>
            <div><b>5</b><small>Zones</small></div>
            <div><b>27</b><small>Topics</small></div>
            <div><b>{LANGUAGES.length}</b><small>Languages</small></div>
          </div>
        </div>
      </section>

      <section className="band">
        <h2 className="band-title">How a repair works</h2>
        <div className="loop-grid">
          {LOOP.map((s) => (
            <div className="loop-step" key={s.n}>
              <span className="loop-n">{s.n}</span>
              <b>{s.t}</b>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
        <p className="band-note">
          Failing costs you nothing but your clean streak. XP, unlocked sectors, items and ratings
          are never taken away — and a failed test shows you the input, what was expected, and what
          your code actually returned.
        </p>
      </section>

      <section className="band">
        <h2 className="band-title">The route to the Core</h2>
        <div className="zone-grid">
          {ZONES.map((z) => (
            <div className="zone-card" key={z.id} style={{ borderTopColor: ACCENT[z.id] }}>
              <div className="zone-range" style={{ color: ACCENT[z.id] }}>SECTORS {z.range}</div>
              <b>{z.name}</b>
              <p className="zone-line">{z.line}</p>
              <p className="zone-topics">{z.topics}</p>
            </div>
          ))}
        </div>
        <p className="band-note">
          The order is deliberate. Recursion gets its own sectors before trees, because it is the
          wall most people hit. Hashing arrives early, so a genuinely satisfying problem is only
          five sectors in. Difficulty rises because problems combine more ideas — never because the
          numbers got bigger.
        </p>
      </section>

      <section className="band">
        <h2 className="band-title">Three ways to clear a sector</h2>
        <div className="tier-grid">
          <div className="tier-card bronze">
            <div className="tier-mark">◆</div>
            <b>SOLVED</b>
            <p>Every visible and hidden test passes. This is all that is ever needed to unlock the next sector.</p>
          </div>
          <div className="tier-card silver">
            <div className="tier-mark">◆◆</div>
            <b>EFFICIENT</b>
            <p>Solved, and fast enough on a large input. A correct answer of the wrong complexity will not finish.</p>
          </div>
          <div className="tier-card gold">
            <div className="tier-mark">◆◆◆</div>
            <b>PERFECT</b>
            <p>Efficient, and you never opened a hint. Hints cost no XP — only this.</p>
          </div>
        </div>
      </section>

      <section className="band">
        <h2 className="band-title">Write it in your language</h2>
        <div className="lang-row">
          {free.map((l) => <span className="lang-chip on" key={l.id}>{l.label}</span>)}
          {server.map((l) => (
            <span className={`lang-chip ${serverEnabled ? 'on' : ''}`} key={l.id}>{l.label}</span>
          ))}
        </div>
        <p className="band-note">
          {serverEnabled
            ? 'Every language above is ready. JavaScript and Python run instantly in your browser; the rest compile on the execution service.'
            : 'JavaScript and Python run instantly in your browser, with nothing to install. The rest need an execution service — they are shown greyed until one is configured.'}
          {' '}The same problem, the same tests, whichever you choose. Solving a sector a second
          time in another language earns a bonus, and is never required.
        </p>
      </section>

      <section className="closing">
        <h2>The Core is waiting.</h2>
        <p>One sector at a time. It starts with a single pulse down a dead relay.</p>
        <button className="btn btn-primary btn-lg" onClick={onEnter}>
          {returning ? `Continue at level ${highestCleared + 1}` : 'Begin at Sector 1'}
        </button>
      </section>
    </div>
  )
}
