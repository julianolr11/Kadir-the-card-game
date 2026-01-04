import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import CreatureCardPreview from './CreatureCardPreview';
import DeckEditor from './DeckEditor';
import GuardianSelectModal from './GuardianSelectModal';
import lvlIcon from '../assets/img/icons/lvlicon.png';
import soulEssence from '../assets/img/icons/soul-essence.png';
import burnIcon from '../assets/img/icons/burn.png';
import freezeIcon from '../assets/img/icons/freeze.png';
import paralyzeIcon from '../assets/img/icons/paralyze.png';
import poisonIcon from '../assets/img/icons/poison.png';
import sleepIcon from '../assets/img/icons/sleep.png';
import bleedIcon from '../assets/img/icons/bleed.png';
import shieldIcon from '../assets/img/icons/shield.png';
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
  HP_PLUS_1: {
    name: { pt: '+1 Vida', en: '+1 HP' },
    desc: { pt: 'Inicia com +1 de vida', en: 'Start with +1 HP' },
    hpBonus: 1,
  },
  HP_PLUS_2: {
    name: { pt: '+2 Vida', en: '+2 HP' },
    desc: { pt: 'Inicia com +2 de vida', en: 'Start with +2 HP' },
    hpBonus: 2,
  },
  FIRST_ROUND_SHIELD: {
    name: { pt: 'Escudo Inicial', en: 'Initial Shield' },
    desc: { pt: 'Recebe escudo no 1º turno', en: 'Gain shield on 1st turn' },
    hpBonus: 0,
  },
  GUARDIAN_KILL_XP_BONUS: {
    name: { pt: '+3% XP', en: '+3% XP' },
    desc: {
      pt: '+3% XP por abate do guardião',
      en: '+3% XP per guardian kill',
    },
    hpBonus: 0,
  },
  ARMOR_PLUS_2: {
    name: { pt: 'Pele Impenetrável', en: 'Impenetrable Skin' },
    desc: { pt: 'Ganha 2 de armadura', en: 'Gains 2 armor' },
    hpBonus: 0,
  },
  KILL_XP_BONUS_10: {
    name: { pt: '+10% XP', en: '+10% XP' },
    desc: {
      pt: '+10% XP por abate do guardião',
      en: '+10% XP per guardian kill',
    },
    hpBonus: 0,
  },
};

// Mapa de ícones de status effects
const STATUS_ICONS = {
  burn: burnIcon,
  freeze: freezeIcon,
  paralyze: paralyzeIcon,
  poison: poisonIcon,
  sleep: sleepIcon,
  bleed: bleedIcon,
  armor: shieldIcon,
};

// Mapa de cores para status effects
const STATUS_COLORS = {
  burn: '#ff6450',
  freeze: '#64c8ff',
  paralyze: '#ffff64',
  poison: '#9664ff',
  sleep: '#c896ff',
  bleed: '#ff6464',
  armor: '#4169e1',
};

// Função para renderizar displayText com ícones e cores
const renderDisplayText = (displayText, langKey = 'pt') => {
  if (!displayText) return null;
  const text =
    typeof displayText === 'object' ? displayText[langKey] : displayText;
  if (!text) return null;

  return (
    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
      {text
        .split('\n')
        .map((line, idx) => {
          // Pular linhas de essências (números + "essência(s)")
          if (/^\d+\s+essências?$/i.test(line.trim())) return null;

          // Pular linhas com [habilidade] ou [perk] (já são mostradas no badge)
          if (/\[habilidade\]|\[ability\]|\[perk\]/i.test(line)) return null;

          // Pular linhas que começam com "nv X -" ou "Lv X -" (título já exibido)
          if (/^(nv|lv)\s+\d+\s*-/i.test(line.trim())) return null;

          let rendered = line;

          // Substituir emojis por texto colorido com ícone
          rendered = rendered.replace(
            /🔥/g,
            `<img src="${
              burnIcon
            }" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${
              STATUS_COLORS.burn
            }; font-weight: 600;">queimadura</span>`,
          );
          rendered = rendered.replace(
            /❄️/g,
            `<img src="${
              freezeIcon
            }" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${
              STATUS_COLORS.freeze
            }; font-weight: 600;">congelamento</span>`,
          );
          rendered = rendered.replace(
            /⚡/g,
            `<img src="${
              paralyzeIcon
            }" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${
              STATUS_COLORS.paralyze
            }; font-weight: 600;">paralisia</span>`,
          );
          rendered = rendered.replace(
            /☠️/g,
            `<img src="${
              poisonIcon
            }" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${
              STATUS_COLORS.poison
            }; font-weight: 600;">veneno</span>`,
          );
          rendered = rendered.replace(
            /😴/g,
            `<img src="${
              sleepIcon
            }" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${
              STATUS_COLORS.sleep
            }; font-weight: 600;">sono</span>`,
          );
          rendered = rendered.replace(
            /🩸/g,
            `<img src="${
              bleedIcon
            }" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${
              STATUS_COLORS.bleed
            }; font-weight: 600;">sangramento</span>`,
          );
          rendered = rendered.replace(
            /🛡️/g,
            `<img src="${
              shieldIcon
            }" style="width: 14px; height: 14px; vertical-align: middle; margin: 0 2px;" /> <span style="color: ${
              STATUS_COLORS.armor
            }; font-weight: 600;">armadura</span>`,
          );

          // Colorir palavras-chave que não foram substituídas por emoji
          let colored = rendered;
          if (!rendered.includes('queimadura</span>')) {
            colored = colored.replace(
              /queimadura/gi,
              (match) =>
                `<span style="color: ${STATUS_COLORS.burn}; font-weight: 600;">queimadura</span>`,
            );
          }
          if (!rendered.includes('congelamento</span>')) {
            colored = colored.replace(
              /congelamento/gi,
              (match) =>
                `<span style="color: ${STATUS_COLORS.freeze}; font-weight: 600;">congelamento</span>`,
            );
          }
          if (!rendered.includes('paralisia</span>')) {
            colored = colored.replace(
              /paralisia/gi,
              (match) =>
                `<span style="color: ${STATUS_COLORS.paralyze}; font-weight: 600;">paralisia</span>`,
            );
          }
          if (!rendered.includes('veneno</span>')) {
            colored = colored.replace(
              /veneno/gi,
              (match) =>
                `<span style="color: ${STATUS_COLORS.poison}; font-weight: 600;">veneno</span>`,
            );
          }
          if (!rendered.includes('sono</span>')) {
            colored = colored.replace(
              /sono/gi,
              (match) =>
                `<span style="color: ${STATUS_COLORS.sleep}; font-weight: 600;">sono</span>`,
            );
          }
          if (!rendered.includes('sangramento</span>')) {
            colored = colored.replace(
              /sangramento/gi,
              (match) =>
                `<span style="color: ${STATUS_COLORS.bleed}; font-weight: 600;">sangramento</span>`,
            );
          }
          if (!rendered.includes('armadura</span>')) {
            colored = colored.replace(
              /armadura/gi,
              (match) =>
                `<span style="color: ${STATUS_COLORS.armor}; font-weight: 600;">armadura</span>`,
            );
          }

          // Remover linhas vazias após filtros
          if (!colored.trim()) return null;

          return (
            <div key={idx} dangerouslySetInnerHTML={{ __html: colored }} />
          );
        })
        .filter(Boolean)}
    </div>
  );
};

// Função auxiliar para carregar dados da carta
const getGuardianData = (guardianId) => {
  try {
    return require(`../assets/cards/booster1/${guardianId}.js`);
  } catch (error) {
    console.warn(`Guardião ${guardianId} não encontrado`, error);
    return null;
  }
};

function DeckBuilder({ onNavigate }) {
  const {
    activeGuardian,
    lang = 'ptbr',
    saveDeck,
    getDeck,
    deleteDeck,
    saveGuardianLoadout,
    loadGuardianLoadout,
    setActiveGuardian,
    getCardInstances,
  } = useContext(AppContext) || {};
  const [slots, setSlots] = useState(Array(MAX_DECKS).fill(null));
  const [openingSlotId, setOpeningSlotId] = useState(null);
  const [showLoadoutModal, setShowLoadoutModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([null, null]);
  const [selectedPerk, setSelectedPerk] = useState(null);
  const [hovering, setHovering] = useState(false);
  const [guardianLoadout, setGuardianLoadout] = useState(null);
  const [editingDeckIndex, setEditingDeckIndex] = useState(null);
  const [pendingEditIndex, setPendingEditIndex] = useState(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [promptSlotIndex, setPromptSlotIndex] = useState(null);
  const [deckNameInput, setDeckNameInput] = useState('');
  const [showGuardianSelectModal, setShowGuardianSelectModal] = useState(false);

  // Abrir editor quando slot pendente for criado
  React.useEffect(() => {
    if (pendingEditIndex !== null && slots[pendingEditIndex]) {
      console.log('Slot criado! Abrindo editor para índice:', pendingEditIndex);
      setEditingDeckIndex(pendingEditIndex);
      setPendingEditIndex(null);
    }
  }, [pendingEditIndex, slots]);

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

  // Helper para obter a melhor instância do guardião (prioriza holo)
  const getBestGuardianInstance = () => {
    if (!activeGuardian?.id) return { isHolo: false, level: 0 };

    const instances = getCardInstances(activeGuardian.id);
    if (!instances || instances.length === 0) return { isHolo: false, level: 0 };

    // Priorizar: holo > maior level > primeira instância
    const holoInstance = instances.find(inst => inst.isHolo);
    if (holoInstance) return { isHolo: holoInstance.isHolo, level: holoInstance.level };

    const sorted = [...instances].sort((a, b) => b.level - a.level);
    return { isHolo: sorted[0]?.isHolo || false, level: sorted[0]?.level || 0 };
  };

  function triggerOpen(slotId) {
    setOpeningSlotId(slotId);
    setTimeout(() => setOpeningSlotId(null), 320);
  }

  function handleCreate(idx) {
    console.log('🎯 handleCreate chamado! idx:', idx);
    setPromptSlotIndex(idx);
    setDeckNameInput(`Deck ${idx + 1}`);
    setShowNamePrompt(true);
  }

  function confirmCreateDeck() {
    const idx = promptSlotIndex;
    const name = deckNameInput.trim();
    console.log('📝 Nome digitado:', name);
    if (!name) {
      console.log('❌ Cancelado (nome vazio)');
      setShowNamePrompt(false);
      return;
    }
    const deckId = `deck-${idx + 1}`;
    const next = [...slots];
    next[idx] = { id: deckId, name };
    console.log('✅ Novo slot criado:', next[idx]);
    setSlots(next);
    triggerOpen(idx);
    console.log('🔄 setPendingEditIndex:', idx);
    setShowNamePrompt(false);
    // Marcar para abrir editor quando slot for criado
    setPendingEditIndex(idx);
  }

  function handleEdit(idx) {
    const current = slots[idx];
    if (!current) return handleCreate(idx);
    // Abrir editor de deck
    setEditingDeckIndex(idx);
  }

  function handleDelete(idx) {
    const current = slots[idx];
    if (!current) return;
    const confirmDelete = window.confirm(`Remover ${current.name}?`);
    if (!confirmDelete) return;

    // Remover do localStorage
    if (deleteDeck) {
      deleteDeck(current.id);
    }

    // Remover do estado local
    const next = [...slots];
    next[idx] = null;
    setSlots(next);
    triggerOpen(idx);
  }

  function handleChangeGuardian() {
    // Salvar o loadout atual do guardião ativo
    if (activeGuardian?.id) {
      saveGuardianLoadout(activeGuardian.id, {
        selectedSkills,
        selectedPerk,
      });
    }
    // Abrir modal de seleção de guardião
    setShowGuardianSelectModal(true);
  }

  function handleSelectGuardian(newGuardian) {
    // Atualizar o guardião ativo
    if (setActiveGuardian) {
      setActiveGuardian(newGuardian);
    }

    // Carregar o loadout do novo guardião (se existir)
    const loadedLoadout = loadGuardianLoadout(newGuardian.id);
    if (loadedLoadout) {
      setSelectedSkills(loadedLoadout.selectedSkills || [null, null]);
      setSelectedPerk(loadedLoadout.selectedPerk || null);
    } else {
      // Se não houver loadout salvo, resetar para padrão
      setSelectedSkills([null, null]);
      setSelectedPerk(null);
    }

    setGuardianLoadout(null);
    setShowGuardianSelectModal(false);
  }

  // Pegar dados estendidos do guardião
  const guardianData = useMemo(() => {
    if (!activeGuardian?.id) return null;
    return getGuardianData(activeGuardian.id);
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

    // Adicionar itens da unlock table (que já inclui as habilidades padrão do nível 0)
    guardianData.unlockTable.forEach((unlock) => {
      // Pular items de tipo 'none'
      if (unlock.type === 'none') return;

      if (unlock.type === 'skill') {
        unlocks.push({
          level: unlock.level,
          type: 'skill',
          id: unlock.id,
          name: unlock.name,
          desc: unlock.desc,
          displayText: unlock.displayText,
          cost: unlock.cost || 1,
          statusEffect: unlock.statusEffect,
          isDefault: false,
        });
      } else if (unlock.type === 'perk') {
        unlocks.push({
          level: unlock.level,
          type: 'perk',
          id: unlock.id,
          name: PERK_DATA[unlock.id]?.name ||
            unlock.name || { pt: 'Perk', en: 'Perk' },
          desc: PERK_DATA[unlock.id]?.desc || unlock.desc || { pt: '', en: '' },
          displayText: unlock.displayText,
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

  // Calcular armadura com base no perk selecionado
  const armorValue = useMemo(() => {
    if (!selectedPerk) return 0;
    if (selectedPerk === 'ARMOR_PLUS_2') return 2;
    return 0;
  }, [selectedPerk]);

  // Calcular status effects baseado nas habilidades selecionadas
  // Nota: Status effects são aplicados aos INIMIGOS, não ao guardião
  const statusEffects = useMemo(() => {
    const effects = {
      burn: 0,
      freeze: 0,
      paralyze: 0,
      poison: 0,
      sleep: 0,
      bleed: 0,
    };

    // Não mostrar status effects no guardião - eles são aplicados nos inimigos
    return effects;
  }, [selectedSkills, allUnlocks]);

  // Guardião com HP ajustado para exibição no modal
  const guardianWithBonusHp = useMemo(() => {
    if (!activeGuardian || !hpBonus) return activeGuardian;
    return { ...activeGuardian, hp: (activeGuardian.hp || 0) + hpBonus };
  }, [activeGuardian, hpBonus]);

  // Guardião com habilidades selecionadas para exibição em tempo real
  const guardianWithSelectedSkills = useMemo(() => {
    if (!activeGuardian || !allUnlocks || !guardianData) return guardianWithBonusHp;

    // Encontrar os dados completos das skills selecionadas
    const selectedAbilities = selectedSkills
      .filter((skillId) => skillId)
      .map((skillId) => {
        const unlock = allUnlocks.find((u) => u.id === skillId);
        if (unlock && unlock.type === 'skill') {
          return {
            name: unlock.name,
            desc: unlock.displayText || unlock.desc,
            cost: unlock.cost,
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
  }, [
    activeGuardian,
    guardianWithBonusHp,
    selectedSkills,
    allUnlocks,
    guardianData,
  ]);

  // Função para salvar configuração
  const handleSaveLoadout = () => {
    setGuardianLoadout({
      guardianId: activeGuardian?.id,
      selectedSkills,
      selectedPerk,
      hpBonus,
      armorValue,
    });
    setShowLoadoutModal(false);
  };

  // Usar loadout salvo se existir, senão usar guardião atual
  const currentGuardianForDisplay = useMemo(() => {
    if (guardianLoadout && guardianLoadout.guardianId === activeGuardian?.id) {
      // Recalcular com base no loadout salvo
      if (!activeGuardian || !allUnlocks || !guardianData) return activeGuardian;

      const selectedAbilities = guardianLoadout.selectedSkills
        .filter((skillId) => skillId)
        .map((skillId) => {
          const unlock = allUnlocks.find((u) => u.id === skillId);
          if (unlock && unlock.type === 'skill') {
            return {
              name: unlock.name,
              desc: unlock.displayText || unlock.desc,
              cost: unlock.cost,
            };
          }
          return null;
        })
        .filter(Boolean);

      if (selectedAbilities.length === 0) {
        return {
          ...activeGuardian,
          hp: (activeGuardian.hp || 0) + guardianLoadout.hpBonus,
          abilities: guardianData.defaultSkills,
        };
      }

      return {
        ...activeGuardian,
        hp: (activeGuardian.hp || 0) + guardianLoadout.hpBonus,
        abilities: selectedAbilities,
      };
    }
    return activeGuardian;
  }, [activeGuardian, guardianLoadout, allUnlocks, guardianData]);

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
            <div
              className="guardian-card-wrapper"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onClick={() => setShowLoadoutModal(true)}
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <div
                style={{
                  transform: 'scale(0.92)',
                  transformOrigin: 'top center',
                  marginBottom: '-44px',
                  filter: hovering ? 'blur(4px)' : 'blur(0)',
                  transition: 'filter 200ms ease',
                }}
              >
                <CreatureCardPreview
                  creature={currentGuardianForDisplay}
                  onClose={null}
                  level={guardianProgress.level}
                  isHolo={getBestGuardianInstance().isHolo}
                  allowFlip={false}
                />
              </div>
              <button
                className="guardian-loadout-btn"
                style={{
                  opacity: hovering ? 1 : 0,
                  visibility: hovering ? 'visible' : 'hidden',
                  transition: 'opacity 200ms ease, visibility 200ms ease',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLoadoutModal(true);
                }}
              >
                Mudar habilidades
              </button>
            </div>
          ) : (
            <div className="guardian-card-empty">
              <div className="guardian-empty-text">Nenhum guardião ativo</div>
            </div>
          )}
          <button
            className="guardian-change-btn"
            onClick={handleChangeGuardian}
          >
            Trocar guardião
          </button>
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
                  <div className="deck-slot-title">
                    {slot ? slot.name : `Deck ${idx + 1}`}
                  </div>
                  <div className="deck-slot-status">
                    {slot ? 'Pronto para editar' : 'Vazio'}
                  </div>
                </div>

                {!slot && (
                  <button
                    className="deck-slot-cta"
                    onClick={() => {
                      console.log('Botão Criar Deck clicado! idx:', idx);
                      handleCreate(idx);
                    }}
                  >
                    <span className="deck-slot-plus">+</span>
                    Criar deck
                  </button>
                )}

                {slot && (
                  <div className="deck-slot-actions">
                    <button
                      className="deck-slot-btn"
                      onClick={() => handleEdit(idx)}
                    >
                      Editar
                    </button>
                    <button
                      className="deck-slot-btn danger"
                      onClick={() => handleDelete(idx)}
                    >
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
        <div
          className="loadout-modal-overlay"
          onClick={() => setShowLoadoutModal(false)}
        >
          <div
            className="loadout-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="loadout-modal-close"
              onClick={() => setShowLoadoutModal(false)}
            >
              ✕
            </button>

            <div className="loadout-modal-body">
              {/* Carta à esquerda */}
              <div className="loadout-modal-left">
                <div className="loadout-card-block">
                  <div className="loadout-card-scale">
                    <CreatureCardPreview
                      creature={guardianWithSelectedSkills}
                      onClose={null}
                      level={guardianProgress.level}
                      isHolo={getBestGuardianInstance().isHolo}
                      allowFlip
                      armor={armorValue}
                      burn={statusEffects.burn}
                      freeze={statusEffects.freeze}
                      paralyze={statusEffects.paralyze}
                      poison={statusEffects.poison}
                      sleep={statusEffects.sleep}
                      bleed={statusEffects.bleed}
                    />
                  </div>
                </div>
                <div className="guardian-progress">
                  <div className="guardian-progress-top">
                    <span>Progresso para o próximo nível</span>
                  </div>
                  <div className="guardian-progress-bar">
                    <div
                      className="guardian-progress-fill"
                      style={{ width: `${progressPct}%` }}
                    />
                    <div className="guardian-progress-xp">
                      {guardianProgress.level >= 10
                        ? 'Nível máximo'
                        : `${guardianProgress.xp}/${nextLevelXp} XP`}
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
                      <div className="loadout-section-header">
                        <div className="loadout-section-label">
                          Habilidades e Perks (Escolha 2 habilidades + 1 perk)
                        </div>
                        <div className="loadout-selected-count">
                          Habilidades: {selectedSkills.filter((s) => s).length}
                          /2 | Perk: {selectedPerk ? '1/1' : '0/1'}
                        </div>
                      </div>
                      <div className="loadout-skill-scroll">
                        {allUnlocks.map((unlock, idx) => {
                          const isUnlocked =
                            unlock.level <= guardianProgress.level;
                          const isSkill = unlock.type === 'skill';
                          const isPerk = unlock.type === 'perk';
                          const isSkillSelected =
                            isSkill && selectedSkills.includes(unlock.id);
                          const isPerkSelected =
                            isPerk && selectedPerk === unlock.id;
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
                                    setSelectedSkills(
                                      selectedSkills.map((s) =>
                                        s === unlock.id ? null : s,
                                      ),
                                    );
                                  } else if (
                                    selectedSkills.filter((s) => s).length < 2
                                  ) {
                                    const newSkills = [...selectedSkills];
                                    const emptyIdx = newSkills.findIndex(
                                      (s) => !s,
                                    );
                                    newSkills[emptyIdx] = unlock.id;
                                    setSelectedSkills(newSkills);
                                  }
                                } else if (isPerk) {
                                  // Lógica para perks
                                  setSelectedPerk(
                                    isPerkSelected ? null : unlock.id,
                                  );
                                }
                              }}
                            >
                              <div className="loadout-skill-level">
                                Nv. {unlock.level}
                              </div>
                              <div className="loadout-skill-name">
                                {getName(unlock.name)}
                                {isSkill && (
                                  <span className="loadout-skill-badge">
                                    {' '}
                                    [HABILIDADE]
                                  </span>
                                )}
                                {isPerk && (
                                  <span className="loadout-perk-badge">
                                    {' '}
                                    [PERK]
                                  </span>
                                )}
                              </div>
                              <div className="loadout-skill-desc">
                                {unlock.displayText
                                  ? renderDisplayText(
                                      unlock.displayText,
                                      langKey,
                                    )
                                  : getName(unlock.desc)}
                              </div>
                              {isSkill && unlock.cost && (
                                <div className="loadout-skill-cost">
                                  {[...Array(unlock.cost)].map((_, i) => (
                                    <img
                                      key={i}
                                      src={soulEssence}
                                      alt="Essência"
                                      className="loadout-essence-icon"
                                    />
                                  ))}
                                </div>
                              )}
                              {!isUnlocked && (
                                <div className="loadout-skill-locked">🔒</div>
                              )}
                              {isSelected && (
                                <div className="loadout-skill-check">✓</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      className="loadout-save-btn"
                      onClick={handleSaveLoadout}
                    >
                      Salvar Configuração
                    </button>
                  </>
                ) : (
                  <div className="loadout-section">
                    <div className="loadout-section-label">
                      Dados do guardião não encontrados
                    </div>
                    <div className="loadout-selection-info">
                      Adicione este guardião em guardiansData.js para configurar
                      habilidades.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nome do Deck */}
      {showNamePrompt && (
        <div
          className="loadout-modal-overlay"
          onClick={() => setShowNamePrompt(false)}
        >
          <div
            className="loadout-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '32px' }}
          >
            <button
              className="loadout-modal-close"
              onClick={() => setShowNamePrompt(false)}
            >
              ✕
            </button>

            <h2
              style={{
                color: '#f6e8ff',
                marginBottom: '28px',
                marginTop: '4px',
                fontSize: '24px',
                fontWeight: '700',
                textAlign: 'center',
              }}
            >
              Criar Novo Deck
            </h2>

            <div style={{ marginBottom: '28px' }}>
              <label
                style={{
                  display: 'block',
                  color: '#cbb9f2',
                  marginBottom: '12px',
                  fontSize: '15px',
                  fontWeight: '500',
                }}
              >
                Nome do Deck:
              </label>
              <input
                type="text"
                value={deckNameInput}
                onChange={(e) => setDeckNameInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && confirmCreateDeck()}
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  border: '2px solid rgba(144, 97, 249, 0.5)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: 'Poppins, Arial, sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = 'rgba(144, 97, 249, 0.8)')
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = 'rgba(144, 97, 249, 0.5)')
                }
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowNamePrompt(false)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) =>
                  (e.target.style.background = 'rgba(255, 255, 255, 0.15)')
                }
                onMouseLeave={(e) =>
                  (e.target.style.background = 'rgba(255, 255, 255, 0.08)')
                }
              >
                Cancelar
              </button>
              <button
                onClick={confirmCreateDeck}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '10px',
                  border: '2px solid rgba(144, 97, 249, 0.8)',
                  background:
                    'linear-gradient(135deg, rgba(144, 97, 249, 0.3), rgba(122, 90, 248, 0.25))',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background =
                    'linear-gradient(135deg, rgba(144, 97, 249, 0.5), rgba(122, 90, 248, 0.4))';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background =
                    'linear-gradient(135deg, rgba(144, 97, 249, 0.3), rgba(122, 90, 248, 0.25))';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deck Editor */}
      {editingDeckIndex !== null && slots[editingDeckIndex] && (
        <DeckEditor
          deckId={slots[editingDeckIndex].id}
          deckName={slots[editingDeckIndex].name}
          guardianId={activeGuardian?.id || activeGuardian?.name}
          initialCards={
            getDeck?.(slots[editingDeckIndex].id)?.cards || (() => {
              // Novo deck: adicionar guardião no primeiro slot (melhor instância)
              const newDeck = Array(20).fill(null);
              const guardianCardId = activeGuardian?.id || activeGuardian?.name;
              if (guardianCardId && getCardInstances) {
                const guardianInstances = getCardInstances(guardianCardId);
                if (guardianInstances && guardianInstances.length > 0) {
                  // Usar a melhor instância (prioriza holo)
                  const holoInstance = guardianInstances.find(inst => inst.isHolo);
                  const bestInstance = holoInstance || guardianInstances[0];
                  newDeck[0] = bestInstance.instanceId;
                }
              }
              return newDeck;
            })()
          }
          onClose={() => setEditingDeckIndex(null)}
          onSave={(deckData) => {
            if (saveDeck) saveDeck(deckData);
            // Atualizar nome do deck se mudou
            if (deckData.name !== slots[editingDeckIndex].name) {
              const next = [...slots];
              next[editingDeckIndex] = {
                ...slots[editingDeckIndex],
                name: deckData.name,
              };
              setSlots(next);
            }
          }}
        />
      )}

      {/* Guardian Select Modal */}
      {showGuardianSelectModal && (
        <GuardianSelectModal
          onSelectGuardian={handleSelectGuardian}
          onClose={() => setShowGuardianSelectModal(false)}
        />
      )}
    </div>
  );
}

export default DeckBuilder;
