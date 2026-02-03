// Card data for Alatoy
module.exports = {
  id: 'alatoy',
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
    name: { pt: 'Choque Paralisante', en: 'Paralyzing Shock' },
    desc: {
      pt: 'Ao ser invocado, aplica paralisia a uma criatura aleatória do oponente por 2 turnos.',
      en: 'When summoned, applies paralysis to a random enemy creature for 2 turns.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Pele Abissal
    {
      level: 2,
      type: 'perk',
      id: 'ABYSSAL_SKIN',
      name: { pt: 'Pele Abissal', en: 'Abyssal Skin' },
      desc: {
        pt: 'Recebe -1 de dano de ataques físicos por 2 turnos ao entrar em campo.',
        en: 'Takes -1 physical damage for 2 turns when summoned.',
      },
    },
    // Nível 3 - Habilidade: Onda Congelante
    {
      level: 3,
      type: 'skill',
      id: 'alatoy_skill_onda_congelante',
      name: { pt: 'Onda Congelante', en: 'Freezing Wave' },
      desc: {
        pt: 'Causa 2 de dano e congela o inimigo por 1 turno.',
        en: 'Deals 2 damage and freezes the enemy for 1 turn.',
      },
      cost: 1,
      type: 'damage_freeze',
    },
    // Nível 4 - Perk: Defesa Profunda
    {
      level: 4,
      type: 'perk',
      id: 'DEEP_DEFENSE',
      name: { pt: 'Defesa Profunda', en: 'Deep Defense' },
      desc: {
        pt: 'Ganha +1 defesa enquanto estiver com escudo ativo.',
        en: 'Gain +1 defense while shielded.',
      },
    },
    // Nível 5 - Habilidade: Implosão Aquática
    {
      level: 5,
      type: 'skill',
      id: 'alatoy_skill_implosao_aquatica',
      name: { pt: 'Implosão Aquática', en: 'Aquatic Implosion' },
      desc: {
        pt: 'Causa 3 de dano e reduz defesa do inimigo em 10% por 2 turnos.',
        en: 'Deals 3 damage and reduces enemy defense by 10% for 2 turns.',
      },
      cost: 2,
      type: 'damage_defense_down',
    },
    // Nível 6 - Perk: Reflexo Abissal
    {
      level: 6,
      type: 'perk',
      id: 'ABYSSAL_REFLEX',
      name: { pt: 'Reflexo Abissal', en: 'Abyssal Reflex' },
      desc: {
        pt: 'Reflete 1 de dano de água recebido por turno.',
        en: 'Reflects 1 water damage received per turn.',
      },
    },
    // Nível 7 - Habilidade: Maremoto
    {
      level: 7,
      type: 'skill',
      id: 'alatoy_skill_maremoto',
      name: { pt: 'Maremoto', en: 'Tidal Wave' },
      desc: {
        pt: 'Causa 3 de dano em área e reduz velocidade dos inimigos por 1 turno.',
        en: 'Deals 3 area damage and reduces enemy speed for 1 turn.',
      },
      cost: 2,
      type: 'aoe_slow',
    },
    // Nível 8 - Perk: Gélido Instintivo
    {
      level: 8,
      type: 'perk',
      id: 'INSTINCTIVE_FROST',
      name: { pt: 'Gélido Instintivo', en: 'Instinctive Frost' },
      desc: {
        pt: 'Ao ser atacado, 30% de chance de congelar o atacante por 1 turno.',
        en: 'When attacked, 30% chance to freeze the attacker for 1 turn.',
      },
    },
    // Nível 9 - Habilidade: Abismo Gélido
    {
      level: 9,
      type: 'skill',
      id: 'alatoy_skill_abismo_gelido',
      name: { pt: 'Abismo Gélido', en: 'Glacial Abyss' },
      desc: {
        pt: 'Causa 4 de dano e congela o campo por 2 turnos.',
        en: 'Deals 4 damage and freezes the field for 2 turns.',
      },
      cost: 3,
      type: 'field_freeze',
    },
    // Nível 10 - Habilidade: Fúria Oceânica
    {
      level: 10,
      type: 'skill',
      id: 'alatoy_skill_furia_oceanica',
      name: { pt: 'Fúria Oceânica', en: 'Ocean Fury' },
      desc: {
        pt: 'Causa 4 de dano a todos os inimigos e restaura 2 de vida.',
        en: 'Deals 4 damage to all enemies and restores 2 HP.',
      },
      cost: 3,
      type: 'ultimate_aoe_heal',
    },
  ],
};
