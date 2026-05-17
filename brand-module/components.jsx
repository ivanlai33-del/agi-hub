import React from 'react';
import './styles/brand-system.css';

/**
 * PremiumCanvas - The main stage for the Brand Module.
 * Features a high-end gradient background and centered layout.
 */
export const PremiumCanvas = ({ children, title, subtitle }) => {
  return (
    <div className="brand-canvas">
      <header style={{ textAlign: 'center', marginBottom: '60px', maxWidth: '800px' }}>
        {title && <h1 className="brand-heading" style={{ fontSize: '4rem', marginBottom: '16px' }}>{title}</h1>}
        {subtitle && <p style={{ fontSize: '1.25rem', opacity: 0.7, color: 'var(--brand-text-sub)' }}>{subtitle}</p>}
      </header>
      
      <main style={{ width: '100%', maxWidth: '1200px', display: 'grid', gap: '32px' }}>
        {children}
      </main>
      
      <footer style={{ marginTop: 'auto', padding: '40px', opacity: 0.5, fontSize: '0.9rem' }}>
        Powered by AGI Navigation Studio | Artisan Brain Registry
      </footer>
    </div>
  );
};

/**
 * GlassCard - A premium container for AI-generated artifacts.
 */
export const GlassCard = ({ children, label, icon }) => {
  return (
    <div className="glass-card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        {icon && <span style={{ marginRight: '12px', fontSize: '1.5rem' }}>{icon}</span>}
        {label && <span style={{ fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.6 }}>{label}</span>}
      </div>
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};
