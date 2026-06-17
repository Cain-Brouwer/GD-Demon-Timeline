import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'
import { useTimelineStore } from '../store/timelineStore'

function AuthModal({ onClose }) {
  const user = useTimelineStore((s) => s.user)
  const wasAlreadyLoggedIn = useRef(!!user)
  const [view, setView] = useState('sign_in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user && !wasAlreadyLoggedIn.current) {
      wasAlreadyLoggedIn.current = true
      const timer = setTimeout(onClose, 300)
      return () => clearTimeout(timer)
    }
  }, [user, onClose])

  if (!supabase) return null

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for confirmation!')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    padding: '10px 12px',
    color: 'white',
    fontSize: 13,
    fontFamily: 'monospace',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const btnStyle = {
    width: '100%',
    background: '#c084fc',
    border: 'none',
    borderRadius: 6,
    padding: '10px 12px',
    color: '#0a0015',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.5 : 1,
  }

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10002,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d001a',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 12,
          padding: 24,
          fontFamily: 'monospace',
          color: 'white',
          width: 'min(360px, 90vw)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#c084fc' }}>
            {view === 'sign_in' ? 'Sign In' : 'Create Account'}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 18,
              cursor: 'pointer',
              fontFamily: 'monospace',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        </div>

        {message && (
          <div style={{
            fontSize: 12,
            color: message.includes('Check your email') ? '#4ade80' : '#ff6b6b',
            marginBottom: 12,
            padding: '8px 10px',
            background: message.includes('Check your email') ? 'rgba(74,222,128,0.08)' : 'rgba(255,107,107,0.08)',
            borderRadius: 6,
          }}>
            {message}
          </div>
        )}

        <form onSubmit={view === 'sign_in' ? handleSignIn : handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Email</div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              required
              autoFocus
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Password</div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              required
              minLength={6}
            />
          </div>
          <button type="submit" style={btnStyle} disabled={loading}>
            {loading ? '...' : view === 'sign_in' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          {view === 'sign_in' ? (
            <>
              No account?{' '}
              <span
                onClick={() => { setView('sign_up'); setMessage('') }}
                style={{ color: '#c084fc', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Create one
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span
                onClick={() => { setView('sign_in'); setMessage('') }}
                style={{ color: '#c084fc', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign in
              </span>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default AuthModal
