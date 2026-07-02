import { Activity, Search as SearchIcon, Heart } from 'lucide-react';

export function TrendCard({ trend, isSelected, onClick, isFavorite, onToggleFavorite }) {
  return (
    <div 
      className="glass-panel" 
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        padding: '1.5rem',
        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--glass-border)',
        boxShadow: isSelected ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'var(--glass-shadow)',
        transform: isSelected ? 'scale(1.02)' : 'none'
      }}
    >
      <div className="trend-image-placeholder" style={{ position: 'relative' }}>
        <img 
          src={`http://localhost:3000/api/preview-image?prompt=${encodeURIComponent(trend.title + ' trending aesthetic print on demand design, isolated on white background')}`}
          alt={trend.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
        />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%)', pointerEvents: 'none' }}></div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavorite) onToggleFavorite(trend);
          }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            padding: '8px',
            cursor: 'pointer',
            color: isFavorite ? '#ef4444' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          <Heart size={18} fill={isFavorite ? '#ef4444' : 'none'} />
        </button>
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <span className="badge" style={{ marginBottom: '0.5rem' }}>{trend.category}</span>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{trend.title}</h3>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <SearchIcon size={16} />
          <span>{trend.searchVolume}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Activity size={16} color={trend.competition === 'Low' ? '#4ade80' : trend.competition === 'Medium' ? '#facc15' : '#f87171'} />
          <span>{trend.competition} Comp.</span>
        </div>
      </div>
      
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Top Keywords:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {trend.keywords.map(kw => (
            <span key={kw} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
