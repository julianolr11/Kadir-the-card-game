// Card data for Aldanor
module.exports = {
  id: 'aldanor',
  title: { pt: 'O Véu da Tempestade', en: "The Storm's Veil" },
  num: 40,
  height: 22,
  weakness: 'fogo',
  name: { pt: 'Aldanor', en: 'Aldanor' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'ar',
  img: require('../../img/creatures/aldanor_bio.webp'),
  color: 'air',
  hp: 10,

  // Habilidades base (exibidas no card preview)
  abilities: [
    {
      name: { pt: 'Investida das Asas', en: 'Wing Charge' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano ar e aplica atordoamento leve por 1 turno.',
        en: 'Deals 3 air damage and applies a light stun for 1 turn.',
      },
    },
    {
      name: { pt: 'Véu Nebuloso', en: 'Misty Veil' },
      cost: 1,
      desc: {
        pt: 'Ganha evasão aumentada por 2 turnos.',
        en: 'Gains increased evasion for 2 turns.',
      },
    },
  ],

  // Campo de efeito
  field: { pt: 'Domínio das Nuvens', en: 'Dominion of Clouds' },
  fielddesc: {
    pt: 'Aliados de ar ganham +1 defesa enquanto Aldanor estiver em campo.',
    en: 'Air allies gain +1 defense while Aldanor is on the field.',
  },

  // História
  storyTitle: { pt: 'O Que Voa Antes da Chuva', en: 'That Which Flies Before the Rain' },
  story: [
    {
      pt: 'Antes de qualquer tempestade chegar, Aldanor já cruzou o céu. Sua passagem é o único aviso que os viajantes recebem.',
      en: 'Before any storm arrives, Aldanor has already crossed the sky. Its passing is the only warning travelers ever receive.',
    },
    {
      pt: 'Suas asas imensas dobram a luz da lua em véus de névoa, escondendo seu voo até que seja tarde demais para fugir.',
      en: 'Its immense wings bend the moonlight into veils of mist, hiding its flight until it is too late to flee.',
    },
    {
      pt: 'Não caça por fome — caça por instinto, arrastando presas para dentro das nuvens de onde poucas retornam.',
      en: 'It does not hunt out of hunger — it hunts by instinct, dragging prey into the clouds from which few ever return.',
    },
    {
      pt: 'Marinheiros e pastores das montanhas concordam em uma coisa: quando o céu escurece rápido demais, é hora de se esconder.',
      en: 'Sailors and mountain shepherds agree on one thing: when the sky darkens too quickly, it is time to take shelter.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,

  // Habilidades padrão do guardião (sempre disponíveis)
  defaultSkills: [
    {
      id: 'aldanor_skill_1',
      name: { pt: 'Investida das Asas', en: 'Wing Charge' },
      desc: {
        pt: 'Causa 3 de dano ar e aplica atordoamento leve por 1 turno.',
        en: 'Deals 3 air damage and applies a light stun for 1 turn.',
      },
      cost: 2,
      type: 'damage_stun',
      statusEffect: 'paralyze',
      duration: 1,
    },
    {
      id: 'aldanor_skill_2',
      name: { pt: 'Véu Nebuloso', en: 'Misty Veil' },
      desc: {
        pt: 'Ganha evasão aumentada por 2 turnos.',
        en: 'Gains increased evasion for 2 turns.',
      },
      cost: 1,
      type: 'evasion',
    },
  ],

  // Bênção padrão
  defaultBlessing: {
    id: 'aldanor_blessing',
    name: { pt: 'Bênção do Véu', en: 'Blessing of the Veil' },
    desc: {
      pt: 'Aliados ganham evasão aumentada por 1 turno ao entrar em campo; inimigos recebem -1 de precisão.',
      en: 'Allies gain increased evasion for 1 turn when summoned; enemies suffer -1 accuracy.',
    },
  },

  // Tabela de desbloqueios por nível (0-10)
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'MIST_REFLEXES',
      name: { pt: 'Reflexos da Névoa', en: 'Mist Reflexes' },
      desc: {
        pt: '20% de chance de esquivar de ataques recebidos.',
        en: '20% chance to dodge incoming attacks.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'aldanor_skill_investida_tempestuosa',
      name: { pt: 'Investida Tempestuosa', en: 'Tempest Charge' },
      desc: {
        pt: 'Causa 4 de dano ar e aplica atordoamento leve por 1 turno.',
        en: 'Deals 4 air damage and applies a light stun for 1 turn.',
      },
      cost: 2,
      effectType: 'damage_stun',
      statusEffect: 'paralyze',
      duration: 1,
    },
    {
      level: 4,
      type: 'perk',
      id: 'MISTED_HIDE',
      name: { pt: 'Pele Enevoada', en: 'Misted Hide' },
      desc: {
        pt: 'Reduz permanentemente o dano físico recebido em 1.',
        en: 'Permanently reduces physical damage taken by 1.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'aldanor_skill_vendaval_cortante',
      name: { pt: 'Vendaval Cortante', en: 'Cutting Gale' },
      desc: {
        pt: 'Causa 4 de dano em área.',
        en: 'Deals 4 area damage.',
      },
      cost: 2,
      effectType: 'aoe_damage',
    },
    {
      level: 6,
      type: 'perk',
      id: 'TEMPESTS_FURY',
      name: { pt: 'Fúria da Tempestade', en: "Tempest's Fury" },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 3 de vida.',
        en: 'When defeating an enemy, recover 3 HP.',
      },
    },
    {
      level: 7,
      type: 'skill',
      id: 'aldanor_skill_garra_da_tormenta',
      name: { pt: 'Garra da Tormenta', en: "Storm's Claw" },
      desc: {
        pt: 'Causa 5 de dano ar e reduz a defesa do alvo em 1 por 2 turnos.',
        en: 'Deals 5 air damage and lowers target defense by 1 for 2 turns.',
      },
      cost: 3,
      effectType: 'damage_debuff',
    },
    {
      level: 8,
      type: 'perk',
      id: 'SKY_DOMINION',
      name: { pt: 'Domínio do Céu', en: 'Sky Dominion' },
      desc: {
        pt: 'Enquanto Aldanor estiver em campo, aliados ganham +1 de defesa.',
        en: 'While Aldanor is on the field, allies gain +1 defense.',
      },
    },
    {
      level: 9,
      type: 'skill',
      id: 'aldanor_skill_fenda_celestial',
      name: { pt: 'Fenda Celestial', en: 'Celestial Rift' },
      desc: {
        pt: 'Causa 5 de dano em área.',
        en: 'Deals 5 area damage.',
      },
      cost: 3,
      effectType: 'aoe_damage',
    },
    {
      level: 10,
      type: 'skill',
      id: 'aldanor_skill_julgamento_da_tempestade',
      name: { pt: 'Julgamento da Tempestade', en: "Tempest's Judgment" },
      desc: {
        pt: 'Supremo: causa 6 de dano ao inimigo, aplica atordoamento por 2 turnos e ganha um escudo que absorve 3 de dano.',
        en: 'Ultimate: deals 6 damage to the enemy, applies stun for 2 turns, and gains a shield absorbing 3 damage.',
      },
      cost: 4,
      effectType: 'ultimate_shield',
      statusEffect: 'paralyze',
      duration: 2,
    },
  ],
};
