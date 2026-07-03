import { useState, useEffect } from 'react';
import { Clock, Copy, CheckCircle, Trash2 } from 'lucide-react';

export function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  const fetchHistory = () => {
    fetch('/api/history')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setHistory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch history:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const deleteEntry = async (id) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete history entry:', err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', opacity: 0.7, padding: '3rem' }}>Loading history...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        <Clock size={24} color="var(--accent-primary)" />
        <h2>Generation History</h2>
      </div>

      {history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', opacity: 0.7 }}>
          <p>No history yet. Generate a package from the Dashboard and it will be logged here automatically.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {history.map(item => (
            <div key={item.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <span className="badge" style={{ marginBottom: '0.5rem' }}>{item.product_type}</span>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--accent-primary)' }}>{item.trend_title}</h3>
                </div>
                <button
                  onClick={() => deleteEntry(item.id)}
                  title="Remove from history"
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {item.titles?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Titles</div>
                  {item.titles.map((title, idx) => (
                    <p key={idx} style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{title}</p>
                  ))}
                </div>
              )}

              {item.tags?.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {item.tags.map((tag, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {item.prompts?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prompts</div>
                  {item.prompts.map((prompt, idx) => {
                    const key = `${item.id}-${idx}`;
                    return (
                      <div key={key} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{prompt}</p>
                        <button
                          className="btn"
                          onClick={() => copyToClipboard(prompt, key)}
                          style={{ alignSelf: 'flex-end', padding: '0.3rem 0.7rem', fontSize: '0.75rem', background: copiedKey === key ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.1)', color: copiedKey === key ? '#4ade80' : 'white', border: '1px solid', borderColor: copiedKey === key ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255,255,255,0.1)' }}
                        >
                          {copiedKey === key ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 'auto' }}>
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
