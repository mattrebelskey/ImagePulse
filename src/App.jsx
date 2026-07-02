import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { History } from './components/History';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container animate-fade-in">
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
        </div>
      </header>
      
      <main>
        {activeTab === 'dashboard' ? <Dashboard /> : <History />}
      </main>
    </div>
  );
}

export default App;
