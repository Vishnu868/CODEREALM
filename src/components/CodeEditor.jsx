import { useEffect, useRef } from 'react'
import { EditorState, Compartment } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, indentOnInput } from '@codemirror/language'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { oneDark } from '@codemirror/theme-one-dark'
/**
 * Grammars load on demand, one chunk each. Bundling all of them together adds
 * ~90 kB gzipped to the editor chunk for languages a given player will never
 * open; this way each costs nothing until it is chosen.
 *
 * Languages without a dedicated package borrow a near neighbour: C-family
 * syntax covers C#, Kotlin and Swift well enough for highlighting, and Ruby
 * falls back to Python.
 */
const LOADERS = {
  javascript: () => import('@codemirror/lang-javascript').then((m) => m.javascript()),
  typescript: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ typescript: true })),
  python: () => import('@codemirror/lang-python').then((m) => m.python()),
  ruby: () => import('@codemirror/lang-python').then((m) => m.python()),
  cpp: () => import('@codemirror/lang-cpp').then((m) => m.cpp()),
  csharp: () => import('@codemirror/lang-cpp').then((m) => m.cpp()),
  swift: () => import('@codemirror/lang-cpp').then((m) => m.cpp()),
  java: () => import('@codemirror/lang-java').then((m) => m.java()),
  kotlin: () => import('@codemirror/lang-java').then((m) => m.java()),
  rust: () => import('@codemirror/lang-rust').then((m) => m.rust()),
  go: () => import('@codemirror/lang-go').then((m) => m.go())
}

/**
 * CodeMirror 6 rather than Monaco: roughly 300 KB instead of 1 MB, and it
 * behaves properly on touch devices. This whole module is code-split, so the
 * map and landing screens never download it.
 */
const grammar = new Compartment()

export default function CodeEditor({ value, language, onChange, onRun, onSubmit }) {
  const host = useRef(null)
  const view = useRef(null)
  const cbs = useRef({ onChange, onRun, onSubmit })
  cbs.current = { onChange, onRun, onSubmit }

  useEffect(() => {
    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        highlightActiveLine(),
        grammar.of([]),
        oneDark,
        keymap.of([
          { key: 'Mod-Enter', preventDefault: true, run: () => { cbs.current.onRun(); return true } },
          { key: 'Mod-Shift-Enter', preventDefault: true, run: () => { cbs.current.onSubmit(); return true } },
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab
        ]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) cbs.current.onChange(u.state.doc.toString())
        }),
        EditorView.theme({ '&': { height: '100%' }, '.cm-scroller': { overflow: 'auto' } })
      ]
    })
    view.current = new EditorView({ state, parent: host.current })

    // Swap in the grammar once its chunk arrives.
    let alive = true
    const load = LOADERS[language] ?? LOADERS.javascript
    load().then((ext) => {
      if (alive && view.current) view.current.dispatch({ effects: grammar.reconfigure(ext) })
    }).catch(() => {})

    return () => { alive = false; view.current?.destroy() }
    // Rebuild only when the language changes; text edits flow through onChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  // Reset the document when the caller swaps in different code (e.g. Reset button).
  useEffect(() => {
    const v = view.current
    if (v && value !== v.state.doc.toString()) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
    }
  }, [value])

  return <div className="editor-host" ref={host} aria-label="Code editor" />
}
