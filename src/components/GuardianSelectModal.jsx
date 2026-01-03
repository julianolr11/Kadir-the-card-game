import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { creatures } from '../assets/creaturesData';
import CreatureCardPreview from './CreatureCardPreview';
import '../styles/guardian-select-modal.css';

function GuardianSelectModal({ onSelectGuardian, onClose }) {
  const { lang = 'ptbr' } = useContext(AppContext);

  // Filtrar apenas guardiões
  const guardians = creatures.filter((c) => c.isGuardian === true);

  const handleGuardianClick = (guardian) => {
    onSelectGuardian(guardian);
    onClose();
  };

  return (
    <div className="guardian-select-modal-overlay" onClick={onClose}>
      <div
        className="guardian-select-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="guardian-select-header">
          <h2>{lang === 'ptbr' ? 'Selecionar Guardião' : 'Select Guardian'}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="guardian-select-grid">
          {guardians.map((guardian) => (
            <div
              key={guardian.id}
              className="guardian-select-item"
              onClick={() => handleGuardianClick(guardian)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleGuardianClick(guardian);
                }
              }}
            >
              <div className="guardian-select-card">
                <CreatureCardPreview
                  creature={guardian}
                  onClose={null}
                  allowFlip={false}
                  level={0}
                />
              </div>
              <div className="guardian-select-name">
                {typeof guardian.name === 'object'
                  ? guardian.name[lang === 'en' ? 'en' : 'pt']
                  : guardian.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GuardianSelectModal;
