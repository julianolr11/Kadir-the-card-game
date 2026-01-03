// Card data for Owlberoth
module.exports = {
  id: 'owlberoth',
  num: 9,
  height: 3.7,
  weakness: 'puro',
  name: { pt: 'Owlberoth', en: 'Owlberoth' },
  type: { pt: 'Mística', en: 'Mystic' },
  element: 'puro',
  img: require('../../img/creatures/owlberoth_bio.webp'),
  color: 'pure',
  hp: 4,
  abilities: [
    {
      name: { pt: 'Olhar Místico', en: 'Mystic Gaze' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Voo Noturno', en: 'Night Flight' },
      cost: 1,
      desc: {
        pt: 'Aliados recebem bônus de esquiva.',
        en: 'Allies gain an evasion bonus.',
      },
    },
  ],
  field: { pt: 'Noite Sagrada', en: 'Sacred Night' },
  fielddesc: {
    pt: 'Aliados têm 3% mais chance de esquiva enquanto Owlberoth estiver em campo.',
    en: 'Allies have 3% increased evasion while Owlberoth is on the field.',
  },
  storyTitle: { pt: 'Origem de Owlberoth', en: 'Origin of Owlberoth' },
  story: [
    {
      pt: 'Owlberoth é uma criatura mística, guardiã dos segredos da noite.',
      en: 'Owlberoth is a mystical creature, guardian of the secrets of the night.',
    },
    {
      pt: 'Seu olhar penetra as trevas e revela verdades ocultas.',
      en: 'Its gaze pierces the darkness and reveals hidden truths.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'owlberoth_skill_1',
      name: { pt: 'Sabedoria Antiga', en: 'Ancient Wisdom' },
      desc: {
        pt: 'Causa 3 de dano e aumenta defesa própria.',
        en: 'Deals 3 damage and increases own defense.',
      },
      cost: 1,
      type: 'damage_buff',
    },
    {
      id: 'owlberoth_skill_2',
      name: { pt: 'Visão Perfeita', en: 'Perfect Vision' },
      desc: {
        pt: 'Causa 2 de dano e reduz velocidade do inimigo.',
        en: 'Deals 2 damage and reduces enemy speed.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'owlberoth_blessing',
    name: { pt: 'Proteção da Coruja', en: "Owl's Protection" },
    desc: {
      pt: 'Criaturas de sabedoria ganham +3% de defesa enquanto Owlberoth estiver em campo.',
      en: 'Wisdom creatures gain +3% defense while Owlberoth is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'owlberoth_skill_3',
      name: { pt: 'Reflexo Rápido', en: 'Quick Reflexes' },
      desc: {
        pt: 'Causa 3 de dano e aumenta velocidade temporariamente.',
        en: 'Deals 3 damage and increases speed temporarily.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'owlberoth_skill_4',
      name: { pt: 'Escudo Sábio', en: 'Wise Shield' },
      desc: {
        pt: 'Causa 3 de dano e fornece escudo para próximo turno.',
        en: 'Deals 3 damage and provides shield for next turn.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'owlberoth_skill_5',
      name: { pt: 'Fúria Encapuzada', en: 'Hooded Fury' },
      desc: {
        pt: 'Causa 4 de dano e cria escudo permanente.',
        en: 'Deals 4 damage and creates permanent shield.',
      },
      cost: 2,
    },
    { level: 6, type: 'none' },
    { level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'owlberoth_skill_6',
      name: { pt: 'Vigiância Eterna', en: 'Eternal Vigilance' },
      desc: {
        pt: 'Causa 4 de dano e protege todos os aliados.',
        en: 'Deals 4 damage and protects all allies.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'owlberoth_skill_7',
      name: { pt: 'Sentença do Sábio', en: "Sage's Sentence" },
      desc: {
        pt: 'Supremo: 4 de dano e cria escudo absoluto para todos os aliados.',
        en: 'Ultimate: 4 damage and creates absolute shield for all allies.',
      },
      cost: 3,
    },
  ],
};
