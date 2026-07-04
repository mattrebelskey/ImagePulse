import { useState, useEffect } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';
import { Settings } from './components/Settings';
import { AuthScreen } from './components/AuthScreen';
import { supabase } from './lib/supabase.js';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!authReady) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '20vh' }}>
        <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{session.user.email}</span>
        <button
          className="btn btn-secondary"
          onClick={() => supabase.auth.signOut()}
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1>ImagePulse</h1>
        <p>The heartbeat of print-on-demand trends.</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            className="btn"
            style={{
              background: activeTab === 'dashboard' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'dashboard' ? 'black' : 'white'
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className="btn"
            style={{
              background: activeTab === 'history' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'history' ? 'black' : 'white'
            }}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className="btn"
            style={{
              background: activeTab === 'settings' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'settings' ? 'black' : 'white'
            }}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </header>

      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'history' && <History />}
        {activeTab === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
