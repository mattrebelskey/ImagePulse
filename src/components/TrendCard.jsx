import { Heart } from 'lucide-react';

export function TrendCard({ trend, isSelected, onClick, isFavorite, onToggleFavorite }) {
  return (
    <div
      className="glass-panel"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        padding: '1.5rem',
        position: 'relative',
        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--glass-border)',
        boxShadow: isSelected ? '0 0 20px rgba(139, 92, 246, 0.2)' : 'var(--glass-shadow)',
        transform: isSelected ? 'scale(1.02)' : 'none'
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleFavorite) onToggleFavorite(trend);
        }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid var(--glass-border)',
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

      <div style={{ marginBottom: '1rem', paddingRight: '2.5rem' }}>
        <span className="badge" style={{ marginBottom: '0.5rem' }}>{trend.category}</span>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{trend.title}</h3>
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
