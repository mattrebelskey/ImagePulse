import { useState, useEffect } from 'react';
import { Copy, Wand2, X, CheckCircle2, Tags, Type, Image as ImageIcon } from 'lucide-react';

export function PromptGenerator({ trend, onClose, initialData }) {
  const [productType, setProductType] = useState(initialData?.product_type || 'T-Shirt');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(initialData || null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setGeneratedData(initialData || null);
    if (initialData?.product_type) {
      setProductType(initialData.product_type);
    }
  }, [initialData]);

  const generatePrompts = async () => {
    setError(null);
    setIsGenerating(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/generate-prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: trend.title,
          keywords: trend.keywords,
          productType
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompts');
      }
      
      setGeneratedData(data);
      
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate prompts. Make sure your server is running and API key is set.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text, type, idx) => {
    navigator.clipboard.writeText(text);
    if (type === 'prompt') {
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else if (type === 'title') {
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } else if (type === 'tags') {
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    }
  };

  const savePackage = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('http://localhost:3000/api/favorite-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trend_title: trend.title,
          product_type: productType,
          generatedData
        })
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save package', err);
    }
    setIsSaving(false);
  };

  return (
    <div className="glass-panel" style={{ position: 'relative' }}>
      <button 
        onClick={onClose}
        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
      >
        <X size={24} />
      </button>

      <h3 style={{ marginBottom: '1.5rem' }}>{trend.title}</h3>
      
      {!generatedData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.9rem' }}>
            Generate image prompts, Etsy tags, and a product title for this niche.
          </p>
          
          {error && <div style={{ color: '#f87171', fontSize: '0.85rem' }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Product Type:</label>
            <select 
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="input-field"
              style={{ padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="T-Shirt">T-Shirt / Apparel</option>
              <option value="Clipart">Digital Clipart / PNG</option>
              <option value="Wall Art">Wall Art / Poster</option>
              <option value="Tumbler">Tumbler Wrap</option>
              <option value="Sticker">Die-Cut Sticker</option>
            </select>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={generatePrompts}
            disabled={isGenerating}
            style={{ marginTop: '0.5rem' }}
          >
            {isGenerating ? (
              <span className="animate-pulse">Curating Niche Data...</span>
            ) : (
              <>
                <Wand2 size={18} /> Generate Package
              </>
            )}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ color: 'var(--accent-secondary)' }}>Generated Package</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={savePackage}
                disabled={isSaving || saveSuccess || !!initialData}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: saveSuccess ? 'rgba(74, 222, 128, 0.2)' : undefined, color: saveSuccess ? '#4ade80' : 'white', borderColor: saveSuccess ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255,255,255,0.1)' }}
              >
                {saveSuccess ? <><CheckCircle2 size={14} /> Saved</> : (initialData ? 'Saved' : (isSaving ? 'Saving...' : 'Save Package'))}
              </button>
              {!initialData && (
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setGeneratedData(null)}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Start Over
                </button>
              )}
            </div>
          </div>
          
          {/* Title & Tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Type size={16} /> Optimized Titles (2 Options)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {generatedData.titles?.map((title, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <p style={{ fontSize: '0.95rem', flex: 1 }}>{title}</p>
                    <button className="btn" onClick={() => copyToClipboard(title, 'title')} style={{ padding: '0.4rem', background: copiedTitle ? 'rgba(74, 222, 128, 0.2)' : 'transparent', color: copiedTitle ? '#4ade80' : 'white', border: '1px solid', borderColor: copiedTitle ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255,255,255,0.1)' }}>
                      {copiedTitle ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Tags size={16} /> Etsy Tags (13)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1 }}>
                  {generatedData.tags?.map(tag => (
                    <span key={tag} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="btn" onClick={() => copyToClipboard(generatedData.tags.join(', '), 'tags')} style={{ padding: '0.4rem', background: copiedTags ? 'rgba(74, 222, 128, 0.2)' : 'transparent', color: copiedTags ? '#4ade80' : 'white', border: '1px solid', borderColor: copiedTags ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255,255,255,0.1)' }}>
                  {copiedTags ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Prompts */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <ImageIcon size={16} /> Image Prompts
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {generatedData.prompts?.map((prompt, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '1rem', 
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{prompt}</p>
                      <div style={{ alignSelf: 'flex-end', marginTop: 'auto' }}>
                        <button 
                          className="btn"
                          onClick={() => copyToClipboard(prompt, 'prompt', idx)}
                          style={{ 
                            padding: '0.4rem 0.8rem', 
                            fontSize: '0.8rem',
                            background: copiedIndex === idx ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.1)',
                            color: copiedIndex === idx ? '#4ade80' : 'white',
                            border: '1px solid',
                            borderColor: copiedIndex === idx ? 'rgba(74, 222, 128, 0.3)' : 'rgba(255,255,255,0.1)'
                          }}
                        >
                          {copiedIndex === idx ? (
                            <><CheckCircle2 size={14} /> Copied!</>
                          ) : (
                            <><Copy size={14} /> Copy Prompt</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
