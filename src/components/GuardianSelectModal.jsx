import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { creatures } from '../assets/creaturesData';
import CreatureCardPreview from './CreatureCardPreview';
import CardInstanceSelector from './CardInstanceSelector';
import '../styles/guardian-select-modal.css';

function GuardianSelectModal({ onSelectGuardian, onClose }) {
  const { lang = 'ptbr', getCardInstances, cardCollection } = useContext(AppContext);
  const [showInstanceSelector, setShowInstanceSelector] = useState(false);
  const [selectedGuardianId, setSelectedGuardianId] = useState(null);

  // Filtrar apenas guardiões que o jogador possui
  const guardians = creatures.filter((c) => {
    return c.isGuardian === true && cardCollection && cardCollection[c.id] && cardCollection[c.id].length > 0;
  });

  const handleGuardianClick = (guardian) => {
    // Verificar se tem múltiplas instâncias desta carta
    const instances = getCardInstances(guardian.id);

    if (instances && instances.length > 1) {
      // Mostrar seletor de instância
      setSelectedGuardianId(guardian.id);
      setShowInstanceSelector(true);
    } else {
      // Selecionar direto (sem múltiplas instâncias)
      const firstInstanceId = instances?.[0]?.instanceId || null;
      onSelectGuardian({
        id: guardian.id,
        name: guardian.name?.pt || guardian.name?.ptbr || guardian.id,
        img: guardian.img,
        selectedInstanceId: firstInstanceId,
      });
      onClose();
    }
  };

  const handleInstanceSelected = (instanceId) => {
    const guardian = guardians.find(g => g.id === selectedGuardianId);
    if (guardian) {
      onSelectGuardian({
        id: guardian.id,
        name: guardian.name?.pt || guardian.name?.ptbr || guardian.id,
        img: guardian.img,
        selectedInstanceId: instanceId, // Passar a instância selecionada
      });
      onClose();
    }
    setShowInstanceSelector(false);
  };

  const getGuardianData = (guardianId) => {
    return guardians.find(g => g.id === guardianId);
  };

  return (
    <>
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
                  <div
                    style={{
                      transform: 'scale(0.30)',
                      transformOrigin: 'top left',
                      pointerEvents: 'none',
                    }}
                  >
                    <CreatureCardPreview
                      creature={guardian}
                      onClose={null}
                      allowFlip={false}
                      level={0}
                    />
                  </div>
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

      {/* Instance Selector Modal */}
      {showInstanceSelector && selectedGuardianId && (
        <CardInstanceSelector
          cardId={selectedGuardianId}
          cardData={getGuardianData(selectedGuardianId)}
          instances={getCardInstances(selectedGuardianId)}
          onSelect={handleInstanceSelected}
          onClose={() => setShowInstanceSelector(false)}
          title={lang === 'ptbr' ? 'Selecione uma cópia do guardião' : 'Select a guardian copy'}
          lang={lang}
        />
      )}
    </>
  );
}

export default GuardianSelectModal;
