import React from 'react';

export default function DeckSelectModal({ visible, decks = [], onClose, onSelect }) {
  if (!visible) return null;

  return (
    <div
      className="deck-select-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        className="deck-select-modal"
        style={{
          background: 'linear-gradient(180deg, #22162e 0%, #1a1125 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 12px 40px #000',
          borderRadius: 12,
          padding: 16,
          width: '90%',
          maxWidth: 520,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, color: '#ffe6b0' }}>Escolha um deck</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ffe6b0', cursor: 'pointer' }}>✕</button>
        </div>

        {decks.length === 0 && (
          <div style={{ color: '#fff', opacity: 0.8 }}>Você ainda não tem decks salvos.</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflow: 'auto' }}>
          {decks.map((deck) => (
            <button
              key={deck.id}
              style={{
                textAlign: 'left',
                background: '#2c1d3a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                padding: '12px 14px',
                color: '#ffe6b0',
                cursor: 'pointer',
              }}
              onClick={() => onSelect?.(deck)}
            >
              <div style={{ fontWeight: 600 }}>{deck.name || 'Deck sem nome'}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Guardian: {deck.guardianId || '—'}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Cartas: {deck.cards?.length || 0}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
