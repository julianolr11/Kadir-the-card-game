// Card data for Alatoy
module.exports = {
  id: 22,
  title: {
    pt: 'A Enguia das Profundezas Sombrias',
    en: 'The Eel of Shadow Depths',
  },
  num: 22,
  height: 2.1,
  weakness: 'ar',
  name: { pt: 'Alatoy', en: 'Alatoy' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'agua',
  img: require('../../img/creatures/alatoy_bio.webp'),
  color: 'water',
  hp: 8,
  abilities: [
    {
      name: { pt: 'Luz Abissal', en: 'Abyssal Light' },
      cost: 1,
      desc: {
        pt: 'Emite uma luz verde-escura que reduz a precisão dos inimigos por 2 turnos.',
        en: 'Emits a dark green light that reduces enemies’ accuracy for 2 turns.',
      },
    },
    {
      name: { pt: 'Descarga Sombria', en: 'Shadow Discharge' },
      cost: 1,
      desc: {
        pt: 'Causa dano extra se o alvo estiver sob efeito de redução de precisão.',
        en: 'Deals extra damage if the target is under accuracy reduction.',
      },
    },
  ],
  field: { pt: 'Fosso Luminescente', en: 'Luminous Trench' },
  fielddesc: {
    pt: 'Enquanto Alatoy estiver em campo, criaturas de água recebem +1 de defesa.',
    en: 'While Alatoy is on the field, water creatures gain +1 defense.',
  },
  storyTitle: { pt: 'Mistérios do Abismo', en: 'Mysteries of the Abyss' },
  story: [
    {
      pt: 'Alatoy desliza silenciosamente pelas águas profundas, suas barbatanas iluminando o caminho para o desconhecido.',
      en: 'Alatoy glides silently through the deep waters, its fins lighting the way to the unknown.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'alatoy_skill_1',
      name: { pt: 'Golpe da Profundeza', en: 'Depth Strike' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo com pressão abissal.',
        en: 'Deals 3 damage to the enemy with abyssal pressure.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'alatoy_skill_2',
      name: { pt: 'Corrente Gelada', en: 'Frozen Current' },
      desc: {
        pt: 'Causa 2 de dano e reduz a velocidade do inimigo.',
        en: 'Deals 2 damage and reduces enemy speed.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'alatoy_blessing',
    name: { pt: 'Proteção Aquática', en: 'Aquatic Protection' },
    desc: {
      pt: 'Criaturas de água recebem +3% de defesa enquanto Alatoy estiver em campo.',
      en: 'Water creatures gain +3% defense while Alatoy is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'alatoy_skill_3',
      name: { pt: 'Onda Congelante', en: 'Freezing Wave' },
      desc: {
        pt: 'Causa 3 de dano e congela o inimigo por 1 turno.',
        en: 'Deals 3 damage and freezes the enemy for 1 turn.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    {
      level: 3,
      type: 'skill',
      id: 'alatoy_skill_4',
      name: { pt: 'Implosão Aquática', en: 'Aquatic Implosion' },
      desc: {
        pt: 'Causa 3 de dano e reduz defesa do inimigo.',
        en: 'Deals 3 damage and reduces enemy defense.',
      },
      cost: 2,
    },
    { level: 4, type: 'perk', id: 'WATER_RESISTANCE' },
    {
      level: 5,
      type: 'skill',
      id: 'alatoy_skill_5',
      name: { pt: 'Maremoto', en: 'Tidal Wave' },
      desc: {
        pt: 'Causa 4 de dano em área atingindo todos os inimigos.',
        en: 'Deals 4 area damage hitting all enemies.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'HP_PLUS_1' },
    {
      level: 7,
      type: 'skill',
      id: 'alatoy_skill_6',
      name: { pt: 'Abismo Gélido', en: 'Glacial Abyss' },
      desc: {
        pt: 'Causa 4 de dano e congela o campo por 2 turnos.',
        en: 'Deals 4 damage and freezes the field for 2 turns.',
      },
      cost: 2,
    },
    { level: 8, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
    { level: 9, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 10,
      type: 'skill',
      id: 'alatoy_skill_7',
      name: { pt: 'Fúria Oceânica', en: 'Ocean Fury' },
      desc: {
        pt: 'Supremo: 4 de dano e restaura 2 de vida.',
        en: 'Ultimate: 4 damage and restores 2 HP.',
      },
      cost: 3,
    },
  ],
};
