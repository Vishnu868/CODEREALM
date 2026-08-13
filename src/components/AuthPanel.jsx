import { useState } from 'react'
import { useGame } from '../game/store'

/**
 * Auth panel. Only reachable when Supabase credentials are configured — with no
 * credentials there is no login button anywhere in the UI, rather than a login
 * screen that does not work.
 */
export default function AuthPanel({ onClose }) {
  const { signIn, signUp } = useGame()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  async function submit() {
    setError(null)
    setNotice(null)
    if (!email.trim() || password.length < 8) {
      setError('Enter an email address and a password of at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
        onClose()
      } else {
        await signUp(email.trim(), password)
        setNotice('Account created. If your project requires email confirmation, check your inbox before signing in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Account">
      <div className="modal" style={{ width: 'min(420px, 100%)' }}>
        <div className="eyebrow">Code Runner</div>
        <h2>{mode === 'signin' ? 'Sign in' : 'Create an account'}</h2>
        <p style={{ color: 'var(--fg-dim)', fontSize: 13.5, marginTop: 6 }}>
          Signing in syncs your progress across devices. Anything you have already earned in
          this browser is merged in, not overwritten.
        </p>

        <div className="tabs" style={{ marginTop: 16 }}>
          <button className={`tab ${mode === 'signin' ? 'on' : ''}`} onClick={() => setMode('signin')}>Sign in</button>
          <button className={`tab ${mode === 'signup' ? 'on' : ''}`} onClick={() => setMode('signup')}>Sign up</button>
        </div>

        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" value={password}
                 autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                 onChange={(e) => setPassword(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </label>

        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-notice">{notice}</p>}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Keep playing offline</button>
          <button className="btn btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  )
}
