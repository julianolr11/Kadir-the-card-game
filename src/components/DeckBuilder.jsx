import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import CreatureCardPreview from './CreatureCardPreview';
import guardiansData from '../assets/guardiansData';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import soulEssence from '../assets/img/icons/soul-essence.png';
import '../styles/deckbuilder.css';

const MAX_DECKS = 3;

// Mock de progressão do jogador
const MOCK_PLAYER_PROGRESS = {
  landor: { level: 5, xp: 450 },
  raptauros: { level: 3, xp: 200 },
  virideer: { level: 7, xp: 680 },
  ekeranth: { level: 4, xp: 320 },
};

const PERK_DATA = {
  HP_PLUS_1: { name: { pt: '+1 Vida', en: '+1 HP' }, desc: { pt: 'Inicia com +1 de vida', en: 'Start with +1 HP' }, hpBonus: 1 },
  HP_PLUS_2: { name: { pt: '+2 Vida', en: '+2 HP' }, desc: { pt: 'Inicia com +2 de vida', en: 'Start with +2 HP' }, hpBonus: 2 },
  FIRST_ROUND_SHIELD: { name: { pt: 'Escudo Inicial', en: 'Initial Shield' }, desc: { pt: 'Recebe escudo no 1º turno', en: 'Gain shield on 1st turn' }, hpBonus: 0 },
  GUARDIAN_KILL_XP_BONUS: { name: { pt: '+3% XP', en: '+3% XP' }, desc: { pt: '+3% XP por abate do guardião', en: '+3% XP per guardian kill' }, hpBonus: 0 },
};

function DeckBuilder({ onNavigate }) {
  const { activeGuardian, lang = 'ptbr' } = useContext(AppContext) || {};
  const [slots, setSlots] = useState(Array(MAX_DECKS).fill(null));
  const [openingSlotId, setOpeningSlotId] = useState(null);
  const [showLoadoutModal, setShowLoadoutModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([null, null]);
  const [selectedPerk, setSelectedPerk] = useState(null);
  const [hovering, setHovering] = useState(false);

  const langKey = lang === 'en' ? 'en' : 'pt';

  // Helper para obter texto traduzido
  const getName = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    const key = lang === 'en' ? 'en' : 'pt';
    return nameObj[key] || nameObj.pt || nameObj.en || '';
  };

  // Estilo inline do guardião com fallback
  const guardianStyle = useMemo(() => {
    if (activeGuardian?.img) {
      return { backgroundImage: `url(${activeGuardian.img})` };
    }
    return {};
  }, [activeGuardian]);

  function triggerOpen(slotId) {
    setOpeningSlotId(slotId);
    setTimeout(() => setOpeningSlotId(null), 320);
  }

  function handleCreate(idx) {
    const name = window.prompt('Nome do deck', `Deck ${idx + 1}`);
    if (!name) return;
    const next = [...slots];
    next[idx] = { id: `deck-${idx + 1}`, name: name.trim() || `Deck ${idx + 1}` };
    setSlots(next);
    triggerOpen(idx);
  }

  function handleEdit(idx) {
    const current = slots[idx];
    if (!current) return handleCreate(idx);
    const name = window.prompt('Renomear deck', current.name);
    if (!name) return;
    const next = [...slots];
    next[idx] = { ...current, name: name.trim() || current.name };
    setSlots(next);
    triggerOpen(idx);
  }

  function handleDelete(idx) {
    const current = slots[idx];
    if (!current) return;
    const confirmDelete = window.confirm(`Remover ${current.name}?`);
    if (!confirmDelete) return;
    const next = [...slots];
    next[idx] = null;
    setSlots(next);
    triggerOpen(idx);
  }

  function handleChangeGuardian() {
    // TODO: abrir modal/tela de seleção de guardião
    onNavigate('iniciar');
  }

  // Pegar dados estendidos do guardião
  const guardianData = useMemo(() => {
    if (!activeGuardian?.id) return null;
    return guardiansData[activeGuardian.id] || null;
  }, [activeGuardian?.id]);

  // Pegar progresso do jogador
  const guardianProgress = useMemo(() => {
    if (!activeGuardian?.id) return { level: 0, xp: 0 };
    return MOCK_PLAYER_PROGRESS[activeGuardian.id] || { level: 0, xp: 0 };
  }, [activeGuardian?.id]);

  const nextLevelXp = useMemo(() => {
    if (!guardianProgress) return 0;
    if (guardianProgress.level >= 10) return null;
    return (guardianProgress.level + 1) * 100;
  }, [guardianProgress]);

  const progressPct = useMemo(() => {
    if (!guardianProgress) return 0;
    if (guardianProgress.level >= 10) return 100;
    const target = nextLevelXp || 0;
    if (!target) return 0;
    const pct = (guardianProgress.xp / target) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [guardianProgress, nextLevelXp]);

  // Construir lista unificada de desbloqueios (habilidades + perks) do nível 0 a 10
  const allUnlocks = useMemo(() => {
    if (!guardianData) return [];

    const unlocks = [];

    // Adicionar habilidades padrão no nível 0
    guardianData.defaultSkills.forEach((skill, idx) => {
      unlocks.push({
        level: 0,
        type: 'skill',
        id: skill.id,
        name: skill.name,
        desc: skill.desc,
        cost: skill.cost || 1,
        isDefault: true,
      });
    });

    // Adicionar itens da unlock table
    guardianData.unlockTable.forEach(unlock => {
      if (unlock.type === 'skill') {
        unlocks.push({
          level: unlock.level,
          type: 'skill',
          id: unlock.id,
          name: unlock.name,
          desc: unlock.desc,
          cost: unlock.cost || 1,
          isDefault: false,
        });
      } else if (unlock.type === 'perk') {
        unlocks.push({
          level: unlock.level,
          type: 'perk',
          id: unlock.id,
          name: PERK_DATA[unlock.id]?.name || { pt: 'Perk', en: 'Perk' },
          desc: PERK_DATA[unlock.id]?.desc || { pt: '', en: '' },
          isDefault: false,
        });
      }
    });

    // Ordenar por nível
    unlocks.sort((a, b) => a.level - b.level);

    return unlocks;
  }, [guardianData]);

  // Calcular HP com bônus do perk selecionado
  const hpBonus = useMemo(() => {
    if (!selectedPerk) return 0;
    return PERK_DATA[selectedPerk]?.hpBonus || 0;
  }, [selectedPerk]);

  // Guardião com HP ajustado para exibição no modal
  const guardianWithBonusHp = useMemo(() => {
    if (!activeGuardian || !hpBonus) return activeGuardian;
    return { ...activeGuardian, hp: (activeGuardian.hp || 0) + hpBonus };
  }, [activeGuardian, hpBonus]);

  // Guardião com habilidades selecionadas para exibição em tempo real
  const guardianWithSelectedSkills = useMemo(() => {
    if (!activeGuardian || !allUnlocks) return guardianWithBonusHp;

    // Encontrar os dados completos das skills selecionadas
    const selectedAbilities = selectedSkills
      .filter(skillId => skillId)
      .map(skillId => {
        const unlock = allUnlocks.find(u => u.id === skillId);
        if (unlock && unlock.type === 'skill') {
          return {
            name: unlock.name,
            desc: unlock.desc,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Se não há seleções, retornar sempre com habilidades padrão + HP bonus
    if (selectedAbilities.length === 0) {
      return {
        ...guardianWithBonusHp,
        abilities: guardianData.defaultSkills,
      };
    }

    // Retornar guardião com as habilidades selecionadas
    return {
      ...guardianWithBonusHp,
      abilities: selectedAbilities,
    };
  }, [activeGuardian, guardianWithBonusHp, selectedSkills, allUnlocks, guardianData]);

  return (
    <div className="deckbuilder-screen">
      <div className="deckbuilder-header">
        <button className="deckbuilder-back" onClick={() => onNavigate('home')}>
          Voltar
        </button>
        <div className="deckbuilder-titles">
          <h1>Meus Decks</h1>
          <p>Máximo de 3 decks. Cada deck usa 1 guardião + 20 cartas.</p>
        </div>
      </div>

      <div className="deckbuilder-body">
        <div className="deckbuilder-guardian">
          {activeGuardian ? (
            <>
              <div
                className="guardian-card-wrapper"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onClick={() => setShowLoadoutModal(true)}
                style={{ position: 'relative', cursor: 'pointer' }}
              >
                <div style={{ transform: 'scale(0.92)', transformOrigin: 'top center', marginBottom: '-44px' }}>
                  <CreatureCardPreview creature={activeGuardian} onClose={null} level={guardianProgress.level} allowFlip={false} />
                </div>
                <button
                  className="guardian-loadout-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLoadoutModal(true);
                  }}
                >
                  Mudar habilidades
                </button>
              </div>
            </>
          ) : (
            <div className="guardian-card-empty">
              <div className="guardian-empty-text">Nenhum guardião ativo</div>
            </div>
          )}
          <div className="guardian-helper">Troque o guardião a qualquer hora; o deck só guarda a referência.</div>
        </div>

        <div className="deckbuilder-slots">
          {Array.from({ length: MAX_DECKS }).map((_, idx) => {
            const slot = slots[idx];
            const slotKey = `slot-${idx}`;
            const isOpening = openingSlotId === idx;
            return (
              <div
                key={slotKey}
                className={`deck-slot${slot ? ' deck-slot-filled' : ' deck-slot-empty'}${isOpening ? ' deck-slot-opening' : ''}`}
              >
                <div className="deck-slot-top">
                  <div className="deck-slot-title">{slot ? slot.name : `Deck ${idx + 1}`}</div>
                  <div className="deck-slot-status">{slot ? 'Pronto para editar' : 'Vazio'}</div>
                </div>

                {!slot && (
                  <button className="deck-slot-cta" onClick={() => handleCreate(idx)}>
                    <span className="deck-slot-plus">+</span>
                    Criar deck
                  </button>
                )}

                {slot && (
                  <div className="deck-slot-actions">
                    <button className="deck-slot-btn" onClick={() => handleEdit(idx)}>
                      Editar
                    </button>
                    <button className="deck-slot-btn danger" onClick={() => handleDelete(idx)}>
                      Apagar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Loadout */}
      {showLoadoutModal && (
        <div className="loadout-modal-overlay" onClick={() => setShowLoadoutModal(false)}>
          <div className="loadout-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="loadout-modal-close" onClick={() => setShowLoadoutModal(false)}>✕</button>

            <div className="loadout-modal-body">
              {/* Carta à esquerda */}
              <div className="loadout-modal-left">
                <div className="loadout-card-block">
                  <div className="loadout-card-scale">
                    <CreatureCardPreview creature={guardianWithSelectedSkills} onClose={null} level={guardianProgress.level} allowFlip={true} />
                  </div>
                </div>
                <div className="guardian-progress">
                  <div className="guardian-progress-top">
                    <span>Progresso para o próximo nível</span>
                  </div>
                  <div className="guardian-progress-bar">
                    <div className="guardian-progress-fill" style={{ width: `${progressPct}%` }} />
                    <div className="guardian-progress-xp">
                      {guardianProgress.level >= 10 ? 'Nível máximo' : `${guardianProgress.xp}/${nextLevelXp} XP`}
                    </div>
                    <div className="guardian-progress-level-badge">
                      <img src={lvlIcon} alt="Nível" />
                      <span>{guardianProgress.level}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de habilidades à direita */}
              <div className="loadout-modal-right">
                <div className="loadout-modal-header">
                  <h3>Configurar Guardião</h3>
                </div>

                {guardianData ? (
                  <>
                    {/* Lista unificada de habilidades e perks */}
                    <div className="loadout-section">
                      <div className="loadout-section-label">Habilidades e Perks (Escolha 2 habilidades + 1 perk)</div>
                      <div className="loadout-selected-count">
                        Habilidades: {selectedSkills.filter(s => s).length}/2 | Perk: {selectedPerk ? '1/1' : '0/1'}
                      </div>
                      <div className="loadout-skill-scroll">
                        {allUnlocks.map((unlock, idx) => {
                          const isUnlocked = unlock.level <= guardianProgress.level;
                          const isSkill = unlock.type === 'skill';
                          const isPerk = unlock.type === 'perk';
                          const isSkillSelected = isSkill && selectedSkills.includes(unlock.id);
                          const isPerkSelected = isPerk && selectedPerk === unlock.id;
                          const isSelected = isSkillSelected || isPerkSelected;

                          return (
                            <div
                              key={idx}
                              className={`loadout-skill-item ${!isUnlocked ? 'locked' : ''} ${isSelected ? 'selected' : ''} ${isPerk ? 'perk' : ''}`}
                              onClick={() => {
                                if (!isUnlocked) return;

                                if (isSkill) {
                                  // Lógica para habilidades
                                  if (isSkillSelected) {
                                    setSelectedSkills(selectedSkills.map(s => s === unlock.id ? null : s));
                                  } else if (selectedSkills.filter(s => s).length < 2) {
                                    const newSkills = [...selectedSkills];
                                    const emptyIdx = newSkills.findIndex(s => !s);
                                    newSkills[emptyIdx] = unlock.id;
                                    setSelectedSkills(newSkills);
                                  }
                                } else if (isPerk) {
                                  // Lógica para perks
                                  setSelectedPerk(isPerkSelected ? null : unlock.id);
                                }
                              }}
                            >
                              <div className="loadout-skill-level">Nv. {unlock.level}</div>
                              <div className="loadout-skill-name">
                                {getName(unlock.name)}
                                {isSkill && <span className="loadout-skill-badge"> [HABILIDADE]</span>}
                                {isPerk && <span className="loadout-perk-badge"> [PERK]</span>}
                              </div>
                              <div className="loadout-skill-desc">{getName(unlock.desc)}</div>
                              {isSkill && unlock.cost && (
                                <div className="loadout-skill-cost">
                                  {[...Array(unlock.cost)].map((_, i) => (
                                    <img key={i} src={soulEssence} alt="Essência" className="loadout-essence-icon" />
                                  ))}
                                </div>
                              )}
                              {!isUnlocked && <div className="loadout-skill-locked">🔒</div>}
                              {isSelected && <div className="loadout-skill-check">✓</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button className="loadout-save-btn" onClick={() => setShowLoadoutModal(false)}>
                      Salvar Configuração
                    </button>
                  </>
                ) : (
                  <div className="loadout-section">
                    <div className="loadout-section-label">Dados do guardião não encontrados</div>
                    <div className="loadout-selection-info">Adicione este guardião em guardiansData.js para configurar habilidades.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeckBuilder;
