import { useState, useEffect } from 'react';
import { KeyRound, Loader2, CheckCircle, Trash2, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../lib/api.js';

// One row per provider, mirroring api/_lib/providers.js. Gemini ships first;
// a new generator later is a new entry here + a server registry entry.
const PROVIDER_INFO = [
  {
    id: 'gemini',
    label: 'Google Gemini',
    hint: 'Get a free key at aistudio.google.com/apikey. It powers niche research, package generation, and the trademark safety check.',
    placeholder: 'Paste your Gemini API key (AIza...)',
  },
];

export function Settings() {
  const [keys, setKeys] = useState([]); // [{ provider, key_last4, validated_at }]
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState({});   // provider -> input value
  const [busy, setBusy] = useState({});       // provider -> 'saving' | 'deleting'
  const [messages, setMessages] = useState({}); // provider -> { type: 'error'|'success', text }

  const fetchKeys = () => {
    apiFetch('/api/byok-keys')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setKeys(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch API keys:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const setMessage = (provider, message) => {
    setMessages(prev => ({ ...prev, [provider]: message }));
  };

  const saveKey = async (provider) => {
    const draft = (drafts[provider] || '').trim();
    if (!draft) {
      setMessage(provider, { type: 'error', text: 'Paste your API key first.' });
      return;
    }
    setBusy(prev => ({ ...prev, [provider]: 'saving' }));
    setMessage(provider, null);
    try {
      const res = await apiFetch('/api/byok-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, key: draft }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(provider, { type: 'error', text: data.error || 'Failed to save the key.' });
      } else {
        setDrafts(prev => ({ ...prev, [provider]: '' }));
        setMessage(provider, { type: 'success', text: `Key validated and saved. Generation now runs on your key (ending in ${data.key_last4}).` });
        fetchKeys();
      }
    } catch (err) {
      console.error('Failed to save API key:', err);
      setMessage(provider, { type: 'error', text: 'Something went wrong saving the key. Please try again.' });
    } finally {
      setBusy(prev => ({ ...prev, [provider]: null }));
    }
  };

  const deleteKey = async (provider) => {
    setBusy(prev => ({ ...prev, [provider]: 'deleting' }));
    setMessage(provider, null);
    try {
      const res = await apiFetch(`/api/byok-keys/${provider}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setMessage(provider, { type: 'success', text: 'Key removed.' });
      fetchKeys();
    } catch (err) {
      console.error('Failed to delete API key:', err);
      setMessage(provider, { type: 'error', text: 'Failed to remove the key. Please try again.' });
    } finally {
      setBusy(prev => ({ ...prev, [provider]: null }));
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', opacity: 0.7, padding: '3rem' }}>Loading settings...</div>;
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <KeyRound size={24} color="var(--accent-primary)" />
        <h2>API Keys</h2>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
        <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: '0.15rem' }} />
        <span>Your keys are validated with the provider, encrypted before they are stored, and never shown again — only the last 4 characters. Calls run on your key; it never appears in logs.</span>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {PROVIDER_INFO.map(info => {
          const saved = keys.find(k => k.provider === info.id);
          const state = busy[info.id];
          const message = messages[info.id];
          return (
            <div key={info.id} className="glass-panel animate-fade-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{info.label}</h3>
                {saved ? (
                  <span className="badge" style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>
                    Active &middot; ****{saved.key_last4}
                  </span>
                ) : (
                  <span className="badge" style={{ opacity: 0.7 }}>No key</span>
                )}
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{info.hint}</p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="password"
                  autoComplete="off"
                  value={drafts[info.id] || ''}
                  onChange={e => setDrafts(prev => ({ ...prev, [info.id]: e.target.value }))}
                  placeholder={saved ? 'Paste a new key to replace the saved one' : info.placeholder}
                  style={{ flex: '1 1 260px', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
                <button
                  className="btn"
                  onClick={() => saveKey(info.id)}
                  disabled={state === 'saving'}
                  style={{ background: 'var(--accent-primary)', color: 'black', opacity: state === 'saving' ? 0.7 : 1 }}
                >
                  {state === 'saving' ? <><Loader2 size={14} className="animate-spin" /> Validating...</> : <><CheckCircle size={14} /> {saved ? 'Replace Key' : 'Save & Validate'}</>}
                </button>
                {saved && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => deleteKey(info.id)}
                    disabled={state === 'deleting'}
                    title="Remove this key; generation falls back to the house key while testing"
                  >
                    {state === 'deleting' ? <Loader2 size={14} className="animate-spin" /> : <><Trash2 size={14} /> Remove</>}
                  </button>
                )}
              </div>

              {message && (
                <p style={{ fontSize: '0.82rem', color: message.type === 'error' ? '#f87171' : '#4ade80' }}>
                  {message.text}
                </p>
              )}

              {saved?.validated_at && (
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                  Last validated {new Date(saved.validated_at).toLocaleString()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
