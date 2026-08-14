// Card data for Arguilia
module.exports = {
  id: 'arguilia',
  title: { pt: 'Espírito Ancestral do Rio', en: 'Ancestral River Spirit' },
  num: 17,
  height: 2.4,
  weakness: 'terra',
  name: { pt: 'Arguilia', en: 'Arguilia' },
  type: { pt: 'Ave', en: 'Bird' },
  element: 'agua',
  img: require('../../img/creatures/arguilia_bio.webp'),
  color: 'water',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Asas do Fluxo', en: 'Wings of Flow' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano e concede esquiva aumentada neste turno.',
        en: 'Deals 3 damage and grants increased evasion this turn.',
      },
    },
    {
      name: { pt: 'Véu das Águas', en: 'Veil of Waters' },
      cost: 2,
      desc: {
        pt: 'Aliados recebem redução de dano por 1 turno.',
        en: 'Allies receive damage reduction for 1 turn.',
      },
    },
  ],
  field: { pt: 'Rio Sagrado', en: 'Sacred River' },
  fielddesc: {
    pt: 'Criaturas de água recebem -1 de dano enquanto Arguilia estiver em campo.',
    en: 'Water creatures take -1 damage while Arguilia is on the field.',
  },
  storyTitle: {
    pt: 'A Voz dos Rios Eternos',
    en: 'The Voice of Eternal Rivers',
  },
  story: [
    {
      pt: 'Arguilia é um espírito antigo que nasce onde rios sagrados cruzam terras intocadas.',
      en: 'Arguilia is an ancient spirit born where sacred rivers cross untouched lands.',
    },
    {
      pt: 'Seu canto guia viajantes, purifica águas corrompidas e mantém o equilíbrio do mundo.',
      en: 'Its song guides travelers, purifies corrupted waters, and preserves the balance of the world.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'arguilia_skill_1',
      name: { pt: 'Canto Purificador', en: 'Purifying Song' },
      desc: {
        pt: 'Causa 3 de dano e recupera 1 de vida.',
        en: 'Deals 3 damage and restores 1 HP.',
      },
      cost: 1,
      damage: 3,
      heal: 1,
      type: 'damage_heal',
    },
    {
      id: 'arguilia_skill_2',
      name: { pt: 'Corrente Sagrada', en: 'Sacred Current' },
      desc: {
        pt: 'Causa 2 de dano e reduz velocidade do inimigo.',
        en: 'Deals 2 damage and reduces enemy speed.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'arguilia_blessing',
    name: { pt: 'Vitalidade das Águas', en: 'Waters Vitality' },
    desc: {
      pt: 'Ao ser invocada, todas as criaturas de água em campo ganham +1 de vida.',
      en: 'When summoned, all water creatures on the field gain +1 HP.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Fluidez Ancestral
    {
      level: 2,
      type: 'perk',
      id: 'ANCIENT_FLUIDITY',
      name: { pt: 'Fluidez Ancestral', en: 'Ancient Fluidity' },
      desc: {
        pt: 'Ao entrar em campo, ganha +1 esquiva por 2 turnos.',
        en: 'When summoned, gain +1 evasion for 2 turns.',
      },
    },
    // Nível 3 - Habilidade: Neurotoxina
    {
      level: 3,
      type: 'skill',
      id: 'arguilia_skill_neurotoxina',
      name: { pt: 'Canto Hipnótico', en: 'Hypnotic Song' },
      desc: {
        pt: 'Causa 2 de dano e paralisa o inimigo por 1 turno.',
        en: 'Deals 2 damage and paralyzes the enemy for 1 turn.',
      },
      cost: 1,
      effectType: 'damage_paralyze',
    },
    // Nível 4 - Perk: Imunidade Tóxica
    {
      level: 4,
      type: 'perk',
      id: 'TOXIC_IMMUNITY',
      name: { pt: 'Pureza das Águas', en: 'Water Purity' },
      desc: {
        pt: 'Recebe -1 de dano de efeitos contínuos.',
        en: 'Takes 1 less damage from damage-over-time effects.',
      },
    },
    // Nível 5 - Habilidade: Enxame Tóxico
    {
      level: 5,
      type: 'skill',
      id: 'arguilia_skill_enxame_toxico',
      name: { pt: 'Dilúvio Sagrado', en: 'Sacred Deluge' },
      desc: {
        pt: 'Causa 2 de dano a todos os inimigos e reduz a velocidade por 2 turnos.',
        en: 'Deals 2 damage to all enemies and reduces speed for 2 turns.',
      },
      cost: 2,
      damage: 2,
      statusEffect: 'slow',
      duration: 2,
      effectType: 'aoe_slow',
    },
    // Nível 6 - Perk: Rio Curativo
    {
      level: 6,
      type: 'perk',
      id: 'HEALING_RIVER',
      name: { pt: 'Rio Curativo', en: 'Healing River' },
      desc: {
        pt: 'Ao derrotar um inimigo, cura 1 de vida.',
        en: 'When defeating an enemy, heal 1 HP.',
      },
    },
    // Nível 7 - Habilidade: Véu das Águas
    {
      level: 7,
      type: 'skill',
      id: 'arguilia_skill_veu_aguas',
      name: { pt: 'Véu das Águas', en: 'Veil of Waters' },
      desc: {
        pt: 'Concede escudo de água (absorve 2 de dano) a todos aliados por 2 turnos.',
        en: 'Grants water shield (absorbs 2 damage) to all allies for 2 turns.',
      },
      cost: 2,
      effectType: 'team_shield',
    },
    // Nível 8 - Perk: Veneno Persistente
    {
      level: 8,
      type: 'perk',
      id: 'PERSISTENT_POISON',
      name: { pt: 'Corrente Persistente', en: 'Persistent Current' },
      desc: {
        pt: 'Reduções de velocidade causadas por Arguilia duram +1 turno.',
        en: 'Speed reductions caused by Arguilia last 1 extra turn.',
      },
    },
    // Nível 9 - Habilidade: Praga do Rio
    {
      level: 9,
      type: 'skill',
      id: 'arguilia_skill_praga_rio',
      name: { pt: 'Maré Crescente', en: 'Rising Tide' },
      desc: {
        pt: 'Causa 3 de dano. Se o alvo estiver lento, causa +1 de dano.',
        en: 'Deals 3 damage. If the target is slowed, deal +1 damage.',
      },
      cost: 2,
      damage: 3,
      effectType: 'damage_slow_bonus',
    },
    // Nível 10 - Habilidade: Praga Apocalíptica
    {
      level: 10,
      type: 'skill',
      id: 'arguilia_skill_praga_apocaliptica',
      name: { pt: 'Rio Eterno', en: 'Eternal River' },
      desc: {
        pt: 'Causa 4 de dano e congela o alvo por 2 turnos.',
        en: 'Deals 4 damage and freezes the target for 2 turns.',
      },
      cost: 3,
      damage: 4,
      statusEffect: 'freeze',
      duration: 2,
      effectType: 'ultimate_freeze',
    },
  ],
};
