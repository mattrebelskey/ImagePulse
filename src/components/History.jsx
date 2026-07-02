import { useState, useEffect } from 'react';
import { Clock, Download, CheckCircle } from 'lucide-react';

export function History() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/saved-prompts')
      .then(res => res.json())
      .then(data => {
        setPrompts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', opacity: 0.7, padding: '3rem' }}>Loading history...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Clock size={24} color="var(--accent-primary)" />
        <h2>Your Saved Prompts</h2>
      </div>

      {prompts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
          <p>No saved prompts yet. Generate some from the Dashboard!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {prompts.map(item => (
            <div key={item.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Niche: {item.trend_title}
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', flexGrow: 1, marginBottom: '1rem', fontSize: '0.95rem' }}>
                {item.prompt_text}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                
                <button
                  className="btn"
                  style={{
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => copyToClipboard(item.prompt_text, item.id)}
                >
                  {copiedId === item.id ? (
                    <><CheckCircle size={16} /> Copied!</>
                  ) : (
                    <><Download size={16} /> Copy</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
