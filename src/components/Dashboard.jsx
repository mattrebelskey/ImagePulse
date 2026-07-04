import { useState, useEffect } from 'react';
import { TrendCard } from './TrendCard';
import { PromptGenerator } from './PromptGenerator';
import { Search, TrendingUp, Sparkles, AlertCircle, Loader2, Zap } from 'lucide-react';
import { apiFetch } from '../lib/api.js';

export function Dashboard() {
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [seedInput, setSeedInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [trends, setTrends] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoritePackages, setFavoritePackages] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoritesTab, setFavoritesTab] = useState('niches'); // 'niches' or 'packages'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const fetchFavorites = () => {
    apiFetch('/api/favorites')
      .then(res => res.json())
      .then(data => setFavorites(data))
      .catch(err => console.error('Failed to fetch favorites:', err));
  };

  const fetchFavoritePackages = () => {
    apiFetch('/api/favorite-packages')
      .then(res => res.json())
      .then(data => setFavoritePackages(data))
      .catch(err => console.error('Failed to fetch favorite packages:', err));
  };

  const fetchNiches = (seed = 'General Print on Demand') => {
    setLoading(true);
    setError(null);
    setSelectedTrend(null);
    apiFetch(`/api/trends?seed=${encodeURIComponent(seed)}`)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setTrends(data);
          setSelectedCategory('All');
        } else {
          throw new Error('Data format incorrect');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to generate niches from server.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNiches();
    fetchFavorites();
    fetchFavoritePackages();
  }, []);

  const handleToggleFavorite = async (trend) => {
    const isFav = favorites.some(f => f.title === trend.title);
    if (isFav) {
      await apiFetch(`/api/favorites/${encodeURIComponent(trend.title)}`, { method: 'DELETE' });
    } else {
      await apiFetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trend)
      });
    }
    fetchFavorites();
  };

  const handleGenerate = () => {
    if (seedInput.trim()) {
      fetchNiches(seedInput.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  const displayedTrends = showFavorites ? favorites : trends;
  const categories = ['All', ...new Set(displayedTrends.map(t => t.category).filter(Boolean))];

  const filteredTrends = displayedTrends.filter(t => 
    selectedCategory === 'All' || t.category === selectedCategory
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Category Chips */}
      {categories.length > 1 && !loading && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="glass-panel"
              style={{
                padding: '0.5rem 1rem',
                border: selectedCategory === cat ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.1)',
                background: selectedCategory === cat ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                cursor: 'pointer',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-secondary)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* AI Generator Bar */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Sparkles size={24} color="var(--accent-secondary)" />
        <input 
          type="text" 
          placeholder="Enter a broad niche or seed (e.g., 'Halloween', 'Teachers', 'Gothic')..." 
          className="input-field"
          style={{ border: 'none', background: 'transparent', padding: '0', fontSize: '1.1rem', flex: 1 }}
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          className="btn btn-primary" 
          onClick={handleGenerate}
          disabled={loading}
          style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={20} /> Generate Niches</>}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTrend ? '1fr 1fr' : '1fr', gap: '2rem', transition: 'all 0.3s ease' }}>
        
        {/* Trends List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={24} color="var(--accent-primary)" />
              <h2>{showFavorites ? 'Saved Favorites' : 'AI-Generated Micro-Niches'}</h2>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setShowFavorites(!showFavorites);
                setSelectedCategory('All');
                setSelectedTrend(null);
                setSelectedPackage(null);
                if (!showFavorites) {
                  fetchFavorites();
                  fetchFavoritePackages();
                }
              }}
              style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
            >
              {showFavorites ? 'View Live AI Niches' : 'View Favorites'}
            </button>
          </div>

          {showFavorites && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
              <button 
                onClick={() => setFavoritesTab('niches')}
                style={{ background: 'none', border: 'none', color: favoritesTab === 'niches' ? 'var(--accent-primary)' : 'var(--text-secondary)', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: favoritesTab === 'niches' ? '2px solid var(--accent-primary)' : '2px solid transparent', fontWeight: 600 }}
              >
                Saved Niches
              </button>
              <button 
                onClick={() => setFavoritesTab('packages')}
                style={{ background: 'none', border: 'none', color: favoritesTab === 'packages' ? 'var(--accent-primary)' : 'var(--text-secondary)', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: favoritesTab === 'packages' ? '2px solid var(--accent-primary)' : '2px solid transparent', fontWeight: 600 }}
              >
                Saved Packages
              </button>
            </div>
          )}
          
          
          {loading && !showFavorites ? (
             <div className="glass-panel" style={{ textAlign: 'center', opacity: 0.7, padding: '3rem' }}>
               <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
               <p>Generating highly profitable, IP-safe micro-niches...</p>
             </div>
          ) : error ? (
            <div className="glass-panel" style={{ textAlign: 'center', opacity: 0.7 }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5, color: '#f87171' }} />
              <p>{error}</p>
            </div>
          ) : showFavorites && favoritesTab === 'packages' ? (
            favoritePackages.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', opacity: 0.7 }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>No saved packages yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2">
                {favoritePackages.map(pkg => (
                  <div 
                    key={pkg.id} 
                    className="glass-panel" 
                    onClick={() => {
                      setSelectedTrend({ title: pkg.trend_title, keywords: pkg.tags.slice(0,3) }); // Dummy trend for header
                      setSelectedPackage(pkg);
                    }}
                    style={{ 
                      cursor: 'pointer',
                      padding: '1.5rem',
                      borderColor: selectedPackage?.id === pkg.id ? 'var(--accent-primary)' : 'var(--glass-border)',
                      boxShadow: selectedPackage?.id === pkg.id ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'var(--glass-shadow)',
                    }}
                  >
                    <div style={{ marginBottom: '1rem' }}>
                      <span className="badge" style={{ marginBottom: '0.5rem' }}>{pkg.product_type}</span>
                      <h3 style={{ fontSize: '1.25rem' }}>{pkg.trend_title}</h3>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Contains {pkg.prompts?.length || 0} prompts, {pkg.tags?.length || 0} tags, {pkg.titles?.length || 0} titles
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : filteredTrends.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', opacity: 0.7 }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No niches generated.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2">
              {filteredTrends.map(trend => (
                <TrendCard 
                  key={trend.id || trend.title} 
                  trend={trend} 
                  isSelected={selectedTrend?.title === trend.title && !selectedPackage}
                  onClick={() => { setSelectedTrend(trend); setSelectedPackage(null); }} 
                  isFavorite={favorites.some(f => f.title === trend.title)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedTrend && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <Sparkles size={24} color="var(--accent-secondary)" />
              <h2>{selectedPackage ? 'Saved Package' : 'AI Prompt Generator'}</h2>
            </div>
            <PromptGenerator 
              trend={selectedTrend} 
              onClose={() => { setSelectedTrend(null); setSelectedPackage(null); }} 
              initialData={selectedPackage}
            />
          </div>
        )}
      </div>

    </div>
  );
}
