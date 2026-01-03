import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/guardian-loadout.css';

// Mock de progressão do jogador - substituir por dados reais/contexto depois
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
  },
  HP_PLUS_2: {
    name: { pt: '+2 Vida', en: '+2 HP' },
    desc: { pt: 'Inicia com +2 de vida', en: 'Start with +2 HP' },
  },
  FIRST_ROUND_SHIELD: {
    name: { pt: 'Escudo Inicial', en: 'Initial Shield' },
    desc: { pt: 'Recebe escudo no 1º turno', en: 'Gain shield on 1st turn' },
  },
  GUARDIAN_KILL_XP_BONUS: {
    name: { pt: '+3% XP', en: '+3% XP' },
    desc: {
      pt: '+3% XP por abate do guardião',
      en: '+3% XP per guardian kill',
    },
  },
  ARMOR_PLUS_2: {
    name: { pt: 'Pele Impenetrável', en: 'Impenetrable Skin' },
    desc: { pt: 'Ganha 2 de armadura', en: 'Gains 2 armor' },
  },
  KILL_XP_BONUS_10: {
    name: { pt: '+10% XP', en: '+10% XP' },
    desc: {
      pt: '+10% XP por abate do guardião',
      en: '+10% XP per guardian kill',
    },
  },
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

function GuardianLoadout({ guardian }) {
  const { lang = 'ptbr' } = useContext(AppContext);
  const langKey = lang === 'en' ? 'en' : 'pt';

  // Pegar dados estendidos do guardião
  const guardianData = useMemo(() => {
    if (!guardian?.id) return null;
    return getGuardianData(guardian.id);
  }, [guardian?.id]);

  // Pegar progresso do jogador para este guardião
  const guardianProgress = useMemo(() => {
    if (!guardian?.id) return { level: 0, xp: 0 };
    return MOCK_PLAYER_PROGRESS[guardian.id] || { level: 0, xp: 0 };
  }, [guardian?.id]);

  // Calcular habilidades e perks desbloqueados
  const unlockedItems = useMemo(() => {
    if (!guardianData) return { skills: [], perks: [] };

    const skills = [];
    const perks = [];

    guardianData.unlockTable.forEach((unlock) => {
      if (unlock.level <= guardianProgress.level) {
        if (unlock.type === 'skill') {
          skills.push(unlock);
        } else if (unlock.type === 'perk') {
          perks.push(unlock.id);
        }
      }
    });

    return { skills, perks };
  }, [guardianData, guardianProgress.level]);

  // Estado local do loadout - substituir por contexto/persistência depois
  const [selectedSkills, setSelectedSkills] = useState([
    guardianData?.defaultSkills?.[0]?.id || null,
    guardianData?.defaultSkills?.[1]?.id || null,
  ]);
  const [selectedBlessing, setSelectedBlessing] = useState(
    guardianData?.defaultBlessing || null,
  );
  const [selectedPerk, setSelectedPerk] = useState(
    unlockedItems.perks[0] || null,
  );
  const [editingSlot, setEditingSlot] = useState(null);

  const getName = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[langKey] || obj.pt || obj.en || '';
  };

  const getDesc = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[langKey] || obj.pt || obj.en || '';
  };

  if (!guardian || !guardianData) {
    return (
      <div className="guardian-loadout-empty">
        <p>Selecione um guardião para configurar o loadout.</p>
      </div>
    );
  }

  // Combinar habilidades padrão com habilidades desbloqueadas
  const allAvailableSkills = [
    ...guardianData.defaultSkills,
    ...unlockedItems.skills,
  ];

  const availablePerks = unlockedItems.perks.map((id) => ({
    id,
    ...PERK_DATA[id],
  }));

  // Helper para pegar skill por ID
  const getSkillById = (skillId) => {
    return allAvailableSkills.find((s) => s.id === skillId);
  };

  return (
    <div className="guardian-loadout">
      <div className="loadout-header">
        <h3>Loadout do Guardião</h3>
        <div className="loadout-level">Nível {guardianProgress.level}</div>
      </div>

      <div className="loadout-section">
        <div className="loadout-section-title">
          Habilidades Ativas (2 slots)
        </div>
        <div className="loadout-slots">
          {[0, 1].map((slotIdx) => {
            const skillId = selectedSkills[slotIdx];
            const skill = getSkillById(skillId);
            return (
              <div key={slotIdx} className="loadout-slot">
                <div className="loadout-slot-label">Slot {slotIdx + 1}</div>
                {skill ? (
                  <div className="loadout-slot-content">
                    <div className="loadout-slot-name">
                      {getName(skill.name)}
                    </div>
                    <div className="loadout-slot-desc">
                      {getDesc(skill.desc)}
                    </div>
                    <button
                      className="loadout-slot-change"
                      onClick={() => setEditingSlot(`skill-${slotIdx}`)}
                    >
                      Trocar
                    </button>
                  </div>
                ) : (
                  <button
                    className="loadout-slot-empty"
                    onClick={() => setEditingSlot(`skill-${slotIdx}`)}
                  >
                    + Selecionar habilidade
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="loadout-section">
        <div className="loadout-section-title">Benção (1 slot)</div>
        <div className="loadout-slot">
          <div className="loadout-slot-label">Benção Ativa</div>
          {selectedBlessing ? (
            <div className="loadout-slot-content">
              <div className="loadout-slot-name">Benção Padrão</div>
              <div className="loadout-slot-desc">
                {getDesc(selectedBlessing)}
              </div>
              <button
                className="loadout-slot-change"
                onClick={() => setEditingSlot('blessing')}
              >
                Ver detalhes
              </button>
            </div>
          ) : (
            <div className="loadout-slot-empty">Benção não definida</div>
          )}
        </div>
      </div>

      <div className="loadout-section">
        <div className="loadout-section-title">Perk (1 slot)</div>
        <div className="loadout-slot">
          <div className="loadout-slot-label">Perk Ativo</div>
          {selectedPerk ? (
            <div className="loadout-slot-content">
              <div className="loadout-slot-name">
                {getName(PERK_DATA[selectedPerk].name)}
              </div>
              <div className="loadout-slot-desc">
                {getDesc(PERK_DATA[selectedPerk].desc)}
              </div>
              <button
                className="loadout-slot-change"
                onClick={() => setEditingSlot('perk')}
              >
                Trocar
              </button>
            </div>
          ) : (
            <button
              className="loadout-slot-empty"
              onClick={() => setEditingSlot('perk')}
            >
              + Selecionar perk
            </button>
          )}
        </div>
      </div>

      {/* Modal simples para seleção - melhorar depois */}
      {editingSlot && (
        <div
          className="loadout-modal-overlay"
          onClick={() => setEditingSlot(null)}
        >
          <div className="loadout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="loadout-modal-header">
              <h4>
                {editingSlot.startsWith('skill')
                  ? 'Selecionar Habilidade'
                  : editingSlot === 'perk'
                    ? 'Selecionar Perk'
                    : 'Benção'}
              </h4>
              <button onClick={() => setEditingSlot(null)}>✕</button>
            </div>
            <div className="loadout-modal-content">
              {editingSlot.startsWith('skill') &&
                allAvailableSkills.map((skill, idx) => (
                  <button
                    key={idx}
                    className="loadout-option"
                    onClick={() => {
                      const slotIdx = parseInt(editingSlot.split('-')[1]);
                      const newSkills = [...selectedSkills];
                      newSkills[slotIdx] = skill.id;
                      setSelectedSkills(newSkills);
                      setEditingSlot(null);
                    }}
                  >
                    <div className="loadout-option-name">
                      {getName(skill.name)}
                    </div>
                    <div className="loadout-option-desc">
                      {getDesc(skill.desc)}
                    </div>
                  </button>
                ))}
              {editingSlot === 'perk' &&
                availablePerks.map((perk) => (
                  <button
                    key={perk.id}
                    className="loadout-option"
                    onClick={() => {
                      setSelectedPerk(perk.id);
                      setEditingSlot(null);
                    }}
                  >
                    <div className="loadout-option-name">
                      {getName(perk.name)}
                    </div>
                    <div className="loadout-option-desc">
                      {getDesc(perk.desc)}
                    </div>
                  </button>
                ))}
              {editingSlot === 'blessing' && (
                <div className="loadout-option">
                  <div className="loadout-option-name">Benção Padrão</div>
                  <div className="loadout-option-desc">
                    {getDesc(selectedBlessing)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GuardianLoadout;
