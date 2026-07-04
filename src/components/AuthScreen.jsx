import { useState } from 'react';
import { LogIn, UserPlus, Loader2, MailCheck } from 'lucide-react';
import { supabase } from '../lib/supabase.js';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.8z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.29 14.29A7.2 7.2 0 0 1 4.91 12c0-.8.14-1.57.38-2.29v-3.1H1.28a12 12 0 0 0 0 10.78l4.01-3.1z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.61l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z" />
    </svg>
  );
}

export function AuthScreen() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange in App.jsx takes it from here.
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          // Email confirmation is on: no session until the link is clicked.
          setConfirmSent(true);
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message || 'Google sign-in is not available yet.');
    }
  };

  if (confirmSent) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10vh' }}>
        <div className="glass-panel" style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <MailCheck size={40} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.75rem' }}>Check your email</h3>
          <p style={{ fontSize: '0.9rem' }}>
            We sent a confirmation link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
            Click it, then come back and sign in.
          </p>
          <button
            className="btn btn-secondary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => { setConfirmSent(false); setMode('signin'); }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8vh' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>ImagePulse</h1>
        <p>The heartbeat of print-on-demand trends.</p>
      </header>

      <div className="glass-panel" style={{ maxWidth: '420px', width: '100%' }}>
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h3>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </div>

          {error && <div style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={busy} style={{ marginTop: '0.5rem' }}>
            {busy ? (
              <Loader2 className="animate-spin" size={18} />
            ) : mode === 'signin' ? (
              <><LogIn size={18} /> Sign In</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
        </div>

        <button className="btn btn-secondary" onClick={signInWithGoogle} style={{ width: '100%' }}>
          <GoogleIcon /> Continue with Google
        </button>

        <p style={{ fontSize: '0.85rem', textAlign: 'center', marginTop: '1.25rem' }}>
          {mode === 'signin' ? "New here?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
            style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, padding: 0 }}
          >
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
