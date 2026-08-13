import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useGame } from '../game/store'
import { runVisible, submitSolution } from '../game/verify'
import { display, outputsMatch, preloadPython } from '../runtime/runner'
import { LANGUAGES, isAvailable, serverEnabled, byId } from '../runtime/languages'
import { ITEMS, TIER_LABEL } from '../game/rules'
import { track, EVENTS } from '../game/analytics'

const CodeEditor = lazy(() => import('./CodeEditor'))

const draftKey = (missionId, lang) => `code-runner:draft:${missionId}:${lang}`

export default function Mission({ mission, onExit, onResult }) {
  const game = useGame()
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(null) // 'run' | 'submit'
  const [report, setReport] = useState(null)
  const [tab, setTab] = useState('brief')
  const [revealed, setRevealed] = useState(0)
  const [pyStatus, setPyStatus] = useState('idle')

  const saved = game.progress[mission.id]

  // Load the player's draft for this mission+language, or the starter template.
  useEffect(() => {
    const draft = localStorage.getItem(draftKey(mission.id, language))
    setCode(draft ?? mission.starter[language])
    setReport(null)
  }, [mission.id, language])

  useEffect(() => {
    if (code) localStorage.setItem(draftKey(mission.id, language), code)
  }, [code, mission.id, language])

  // Warm Pyodide as soon as the player switches to Python, so Run is not a wait.
  useEffect(() => {
    if (language === 'python' && pyStatus === 'idle') {
      setPyStatus('loading')
      preloadPython((ok) => setPyStatus(ok ? 'ready' : 'failed'))
    }
  }, [language, pyStatus])

  const hintsUsed = revealed

  async function handleRun() {
    track(EVENTS.CODE_RUN, { mission: mission.id, language })
    setBusy('run')
    setReport(null)
    const result = await runVisible(mission, language, code)
    setReport({ mode: 'run', ...result })
    setBusy(null)
    onResult?.(game.recordRun())
  }

  async function handleSubmit() {
    setBusy('submit')
    setReport(null)
    const outcome = await submitSolution(mission, language, code, hintsUsed)
    track(outcome.tier ? EVENTS.MISSION_CLEARED : EVENTS.SUBMITTED,
      { mission: mission.id, language, tier: outcome.tier, stage: outcome.stage })
    setReport({ mode: 'submit', ...outcome })
    const events = game.recordSubmit(mission, language, outcome.tier)
    setBusy(null)
    onResult?.(events, outcome)
  }

  function revealHint(i) {
    track(EVENTS.HINT_REVEALED, { mission: mission.id, tier: i + 1 })
    setRevealed(i + 1)
    game.useHint(mission.id, i)
  }

  const langLabel = LANGUAGES.find((l) => l.id === language)?.label

  return (
    <div className="mission">
      <div className="panel-problem">
        <button className="btn btn-ghost" onClick={onExit} style={{ marginBottom: 14 }}>← Back to map</button>
        <div className="eyebrow">Level {String(mission.level).padStart(3, '0')}</div>
        <h2 style={{ fontSize: 24, marginTop: 4 }}>{mission.title}</h2>

        <div className="tabs" role="tablist" style={{ marginTop: 16 }}>
          {['brief', 'examples', 'hints'].map((t) => (
            <button key={t} role="tab" aria-selected={tab === t}
              className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
              {t === 'brief' ? 'Mission' : t === 'examples' ? 'Examples' : `Hints (${revealed}/3)`}
            </button>
          ))}
        </div>

        {tab === 'brief' && (
          <>
            <p className="story">{mission.story.briefing}</p>
            <div className="meta-grid">
              <div className="meta"><small>Topic</small><b>{mission.topic}</b></div>
              <div className="meta"><small>Difficulty</small><b>{'◆'.repeat(mission.difficulty)}</b></div>
              <div className="meta"><small>Target complexity</small><b>{mission.expectedComplexity}</b></div>
              <div className="meta"><small>Reward</small><b>{40 * mission.difficulty} XP base</b></div>
            </div>
            <div className="section-h">Objective</div>
            <p>{mission.description}</p>
            <div className="section-h">Constraints</div>
            <p style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--fg-dim)' }}>{mission.constraints}</p>
            <div className="section-h">Ratings</div>
            <div className="tierline">
              {['bronze', 'silver', 'gold'].map((t) => (
                <div key={t} className={`tierbox ${t} ${saved?.bestTier === t ? 'on' : ''}`}>
                  <small>{t}</small>{TIER_LABEL[t]}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--fg-faint)' }}>
              {mission.perf
                ? 'Efficient requires your solution to keep pace with the reference on a large input. Perfect additionally requires no hints.'
                : 'Perfect requires clearing all hidden tests without revealing a hint.'}
            </p>
          </>
        )}

        {tab === 'examples' && (
          <>
            <div className="section-h">Worked examples</div>
            {mission.examples.map((ex, i) => (
              <div className="example" key={i}>
                <div>Input: {ex.input}</div>
                <div>Output: {ex.output}</div>
                {ex.explanation && <div><em>{ex.explanation}</em></div>}
              </div>
            ))}
          </>
        )}

        {tab === 'hints' && (
          <>
            <div className="section-h">Guidance</div>
            <p style={{ fontSize: 13, color: 'var(--fg-faint)' }}>
              Hints do not cost XP. They only prevent a Perfect rating on this attempt.
            </p>
            {mission.hints.map((h, i) => (
              i < revealed
                ? <div className="hint" key={i}><b style={{ color: 'var(--accent)' }}>Hint {i + 1}. </b>{h}</div>
                : (
                  <div className="hint hint-locked" key={i}>
                    <span>Hint {i + 1} — {['conceptual direction', 'approach', 'near-solution'][i]}</span>
                    <button className="btn" disabled={i > revealed} onClick={() => revealHint(i)}>Reveal</button>
                  </div>
                )
            ))}
          </>
        )}
      </div>

      <div className="panel-code">
        <div className="code-bar">
          <select className="lang" value={language} aria-label="Language"
            onChange={(e) => setLanguage(e.target.value)}>
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id} disabled={!isAvailable(l.id)}>
                {l.label}
              </option>
            ))}
          </select>
          {!isAvailable(language) && (
            <span style={{ fontSize: 12, color: 'var(--warn)' }}>
              This language needs an execution service — see LANGUAGES.md.
            </span>
          )}
          {language === 'python' && pyStatus === 'loading' && (
            <span style={{ fontSize: 12, color: 'var(--fg-faint)' }}>Preparing Python…</span>
          )}
          {language === 'python' && pyStatus === 'failed' && (
            <span style={{ fontSize: 12, color: 'var(--bad)' }}>Python runtime unavailable — check your connection.</span>
          )}
          <div className="hud-spacer" />
          <button className="btn btn-ghost" onClick={() => setCode(mission.starter[language])}>Reset code</button>
          <button className="btn" onClick={handleRun} disabled={!!busy}>
            {busy === 'run' ? 'Running…' : '▶ Run'}
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!!busy}>
            {busy === 'submit' ? 'Verifying…' : 'Submit'}
          </button>
        </div>

        <Suspense fallback={<div className="editor-host" style={{ padding: 20, color: 'var(--fg-faint)' }}>Loading editor…</div>}>
          <CodeEditor value={code} language={language} onChange={setCode} onRun={handleRun} onSubmit={handleSubmit} />
        </Suspense>

        <Console report={report} busy={busy} mission={mission} langLabel={langLabel} language={language} />
      </div>
    </div>
  )
}

function Console({ report, busy, mission, langLabel, language }) {
  const game = useGame()
  const [extraInput, setExtraInput] = useState(null)
  // Tests resolve one at a time rather than all at once. The results are
  // already in hand — this is purely about letting the player watch them land,
  // which is the most satisfying moment in the loop.
  const [revealed, setRevealed] = useState(0)
  const reduced = game.settings.reducedMotion

  const visibleCount = report?.mode === 'run'
    ? (report.cases?.length ?? 0)
    : (report?.visible?.cases?.length ?? 0)

  useEffect(() => {
    if (!report) { setRevealed(0); return }
    if (reduced) { setRevealed(visibleCount); return }
    setRevealed(0)
    const timers = []
    for (let i = 1; i <= visibleCount; i++) {
      timers.push(setTimeout(() => setRevealed(i), i * 190))
    }
    return () => timers.forEach(clearTimeout)
  }, [report, visibleCount, reduced])

  const summary = useMemo(() => {
    if (busy === 'run') return 'Running visible tests…'
    if (busy === 'submit') {
      return byId(language)?.where === 'server'
        ? 'Compiling and running every test…'
        : 'Verifying against hidden tests…'
    }
    if (!report) return `Ready · ${langLabel} · Ctrl+Enter to run, Ctrl+Shift+Enter to submit`
    if (report.mode === 'run') return `Visible tests ${report.passed}/${report.total}`
    const v = report.visible, h = report.hidden
    return `Visible ${v.passed}/${v.total}${h ? ` · Hidden ${h.passed}/${h.total}` : ''}`
  }, [report, busy, langLabel, language])

  const failure = report && (report.mode === 'run' ? report.failure : (report.hidden?.failure || report.visible.failure))

  return (
    <div className="console">
      <div className="console-bar">
        <span className={`tag ${!report ? 'tag-idle' : failure ? 'tag-fail' : 'tag-pass'}`}>
          {!report ? 'IDLE' : failure ? 'FAILED' : 'PASSED'}
        </span>
        <span style={{ fontSize: 13, color: 'var(--fg-dim)' }}>{summary}</span>
      </div>

      <div className="console-body">
        {!report && !busy && (
          <p style={{ color: 'var(--fg-faint)', fontSize: 13, margin: 0 }}>
            Run checks the three visible tests and never affects your streak. Submit runs 18 freshly
            generated hidden tests as well.
          </p>
        )}

        {(() => {
          const cases = report?.mode === 'run'
            ? report.cases
            : report?.visible?.cases
          const results = report?.mode === 'run'
            ? report?.results
            : report?.visible?.results
          const shown = cases ?? mission.visible.map((v) => ({ args: v.args, expected: null }))

          return shown.map((c, i) => {
            const r = results?.find((x) => x.index === i)
            const settled = !!report && i < revealed
            const passed = settled && !!r?.ok && c.expected !== null && outputsMatch(c.expected, r.actualJson)
            const failed = settled && !passed
            const state = !report ? 'idle' : !settled ? 'checking' : passed ? 'pass' : 'fail'

            return (
              <div className={`tcase tcase-${state}`} key={i}>
                <span className={`tag ${passed ? 'tag-pass' : failed ? 'tag-fail' : state === 'checking' ? 'tag-run' : 'tag-idle'}`}>
                  {passed ? 'PASS' : failed ? 'FAIL' : state === 'checking' ? '···' : `#${i + 1}`}
                </span>
                <span className="kv tcase-line">
                  {display(c.args.length === 1 ? c.args[0] : c.args)}
                  {settled && c.expected !== null && (
                    <> → <b>{display(c.expected)}</b></>
                  )}
                  {failed && r?.ok && (
                    <> , got <b style={{ color: 'var(--bad)' }}>{display(JSON.parse(r.actualJson))}</b></>
                  )}
                </span>
              </div>
            )
          })
        })()}

        {report?.mode === 'submit' && report.hidden && revealed >= visibleCount && (
          <div className={`hidden-band ${report.hidden.passed === report.hidden.total ? 'ok' : 'bad'}`}>
            <span className={`tag ${report.hidden.passed === report.hidden.total ? 'tag-pass' : 'tag-fail'}`}>
              {report.hidden.passed === report.hidden.total ? 'PASS' : 'FAIL'}
            </span>
            <span>Hidden tests — {report.hidden.passed} of {report.hidden.total} passed</span>
            <div className="hidden-pips">
              {Array.from({ length: report.hidden.total }, (_, i) => (
                <i key={i} className={i < report.hidden.passed ? 'on' : ''}
                  style={{ animationDelay: reduced ? '0ms' : `${i * 45}ms` }} />
              ))}
            </div>
          </div>
        )}

        {failure && <FailureReport failure={failure} report={report} mission={mission} game={game}
          extraInput={extraInput} setExtraInput={setExtraInput} />}

        {report?.mode === 'submit' && report.tier && (
          <div className="analysis" style={{ borderLeftColor: 'var(--good)' }}>
            <h5 style={{ color: 'var(--good)' }}>Verified</h5>
            <div>All {report.visible.total} visible and {report.hidden.total} hidden tests passed.</div>
            {report.perf?.status === 'ok' && report.perf.serverJudged && (
              <div style={{ marginTop: 6, color: 'var(--fg-dim)' }}>
                At n = {report.perf.scale.toLocaleString()}: {report.perf.growth}
              </div>
            )}
            {report.perf?.status === 'ok' && !report.perf.serverJudged && (
              <div style={{ marginTop: 6, color: 'var(--fg-dim)' }}>
                At n = {report.perf.scale.toLocaleString()}: your solution {report.perf.userMs.toFixed(0)} ms
                vs reference {report.perf.refMs.toFixed(0)} ms. {report.perf.growth}
              </div>
            )}
            {report.perf?.status === 'timeout' && (
              <div style={{ marginTop: 6, color: 'var(--warn)' }}>
                Correct, but too slow at n = {report.perf.scale.toLocaleString()} to earn an efficiency rating.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * A wrong answer, laid out so it can be read at a glance.
 *
 * This is the screen a player stares at when they are stuck and closest to
 * giving up, so it gets the input, the expected value and their own value on
 * aligned rows — and for arrays, the first differing position called out
 * explicitly, because scanning two long lists for the mismatch by eye is the
 * single most tedious part of debugging.
 */
function Diff({ failure, isHidden, revealed }) {
  const { expected, actual, input } = failure

  // Where do the two answers first disagree?
  let hint = null
  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) {
      hint = `Lengths differ — expected ${expected.length} values, received ${actual.length}.`
    } else {
      const at = expected.findIndex((v, i) => JSON.stringify(v) !== JSON.stringify(actual[i]))
      if (at >= 0) hint = `First difference at position ${at}: expected ${JSON.stringify(expected[at])}, received ${JSON.stringify(actual[at])}.`
    }
  } else if (typeof expected === 'string' && typeof actual === 'string') {
    if (expected.length !== actual.length) {
      hint = `Lengths differ — expected ${expected.length} characters, received ${actual.length}.`
    } else {
      const at = [...expected].findIndex((ch, i) => ch !== actual[i])
      if (at >= 0) hint = `First difference at character ${at}.`
    }
  } else if (typeof expected === 'number' && typeof actual === 'number') {
    const d = actual - expected
    hint = `Off by ${d > 0 ? '+' : ''}${Number(d.toFixed(6))}.`
  } else if (typeof expected === 'boolean' && typeof actual === 'boolean') {
    hint = `Expected ${expected}, received ${actual}.`
  }

  return (
    <div className="diff">
      <div className="diff-where">
        {isHidden ? `Hidden test #${failure.caseIndex + 1}` : `Visible test #${failure.caseIndex + 1}`}
      </div>

      <div className="diff-row">
        <span className="diff-label">Input</span>
        <code className="diff-value">
          {revealed
            ? display(input.length === 1 ? input[0] : input)
            : <em className="diff-masked">hidden — spend an Energy Cell to reveal</em>}
        </code>
      </div>
      <div className="diff-row diff-expected">
        <span className="diff-label">Expected</span>
        <code className="diff-value">{display(expected)}</code>
      </div>
      <div className="diff-row diff-actual">
        <span className="diff-label">You returned</span>
        <code className="diff-value">{display(actual)}</code>
      </div>

      {hint && <div className="diff-hint">{hint}</div>}
    </div>
  )
}

/** Debugging is part of the learning, so failures explain themselves. */
function FailureReport({ failure, report, mission, game, extraInput, setExtraInput }) {
  const isHidden = report.mode === 'submit' && report.stage === 'hidden'
  const canUseCell = isHidden && !extraInput && (game.inventory.energy_cell || 0) > 0

  const heading = {
    wrong_answer: 'Wrong answer',
    runtime: 'Runtime error',
    timeout: 'Time limit exceeded',
    syntax: 'Code could not be parsed',
    missing_entry: 'Entry function not found',
    boot: 'Execution service unavailable',
    unavailable: 'Language unavailable',
    compile: 'Compilation failed'
  }[failure.kind] || 'Failed'

  return (
    <div className="analysis">
      <h5>{heading}</h5>
      {failure.kind === 'wrong_answer' && (
        <Diff failure={failure} isHidden={isHidden} revealed={!isHidden || !!extraInput} />
      )}

      {failure.kind === 'timeout' && (
        <div className="kv">
          Execution was stopped at test #{failure.caseIndex + 1}. This usually means a loop that never
          ends, or an approach that does too much work per element for the input size.
        </div>
      )}
      {(failure.kind === 'runtime' || failure.kind === 'syntax') && (
        <pre style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--bad)' }}>
          {failure.message}
        </pre>
      )}
      {failure.kind === 'missing_entry' && <div className="kv">{failure.message}</div>}
      {(failure.kind === 'boot' || failure.kind === 'unavailable') && <div className="kv">{failure.message}</div>}

      {canUseCell && (
        <button className="btn" style={{ marginTop: 10 }}
          onClick={() => { if (game.consumeItem('energy_cell')) setExtraInput(true) }}>
          {ITEMS.energy_cell.icon} Use Energy Cell — reveal this hidden test's input
        </button>
      )}
    </div>
  )
}