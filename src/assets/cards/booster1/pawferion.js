// Card data for Pawferion
module.exports = {
  id: 'pawferion',
  title: { pt: 'O elemental corrompido', en: 'The Corrupted Elemental' },
  num: 21,
  height: 3.8,
  weakness: 'fogo',
  name: { pt: 'Pawferion', en: 'Pawferion' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'puro',
  img: require('../../img/creatures/pawferion_bio.webp'),
  color: 'pure',
  hp: 10,
  abilities: [
    {
      name: { pt: 'Corrupção Elemental', en: 'Elemental Corruption' },
      cost: 1,
      desc: {
        pt: 'Rouba 1 ponto de ataque de todos os inimigos por 2 turnos.',
        en: 'Steals 1 attack point from all enemies for 2 turns.',
      },
    },
    {
      name: { pt: 'Sombra Essencial', en: 'Essential Shadow' },
      cost: 1,
      desc: {
        pt: 'Recebe metade do dano de ataques elementais por 1 turno.',
        en: 'Takes half damage from elemental attacks for 1 turn.',
      },
    },
  ],
  field: { pt: 'Vazio Corrompido', en: 'Corrupted Void' },
  fielddesc: {
    pt: 'Reduz o ataque de todas as criaturas não puras em 3% enquanto Pawferion estiver em campo.',
    en: 'Reduces the attack of all non-pure creatures by 3% while Pawferion is on the field.',
  },
  storyTitle: { pt: 'Origem de Pawferion', en: 'Origin of Pawferion' },
  story: [
    {
      pt: 'Ele, sendo essência de todos os elementos, foi corrompido pelo poder.',
      en: 'Being the essence of all elements, he was corrupted by power.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'pawferion_skill_1',
      name: { pt: 'Garra Rápida', en: 'Quick Claw' },
      desc: {
        pt: 'Causa 3 de dano com ataques precisos.',
        en: 'Deals 3 damage with precise attacks.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'pawferion_skill_2',
      name: { pt: 'Salto Ágil', en: 'Agile Leap' },
      desc: {
        pt: 'Causa 2 de dano e aumenta velocidade.',
        en: 'Deals 2 damage and increases speed.',
      },
      cost: 1,
      type: 'damage_buff',
    },
  ],
  defaultBlessing: {
    id: 'pawferion_blessing',
    name: { pt: 'Proteção Sagrada', en: 'Sacred Protection' },
    desc: {
      pt: 'Ao ser invocado, todas as criaturas aliadas ficam imunes a debuffs por 3 turnos.',
      en: 'When summoned, all allied creatures become immune to debuffs for 3 turns.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Instinto Felino
    {
      level: 2,
      type: 'perk',
      id: 'FELINE_INSTINCT',
      name: { pt: 'Instinto Felino', en: 'Feline Instinct' },
      desc: {
        pt: 'Ganha +1 esquiva ao entrar em campo.',
        en: 'Gain +1 evasion when summoned.',
      },
    },
    // Nível 3 - Habilidade: Ataque Múltiplo
    {
      level: 3,
      type: 'skill',
      id: 'pawferion_skill_ataque_multiplo',
      name: { pt: 'Ataque Múltiplo', en: 'Multi-Strike' },
      desc: {
        pt: 'Causa 2 de dano duas vezes (total 4).',
        en: 'Deals 2 damage twice (total 4).',
      },
      cost: 1,
      type: 'multi_hit',
    },
    // Nível 4 - Perk: Reflexos Ágeis
    {
      level: 4,
      type: 'perk',
      id: 'AGILE_REFLEXES',
      name: { pt: 'Reflexos Ágeis', en: 'Agile Reflexes' },
      desc: {
        pt: 'Recebe -1 de dano de ataques físicos.',
        en: 'Takes -1 damage from physical attacks.',
      },
    },
    // Nível 5 - Habilidade: Dança Feroz
    {
      level: 5,
      type: 'skill',
      id: 'pawferion_skill_danca_feroz',
      name: { pt: 'Dança Feroz', en: 'Fierce Dance' },
      desc: {
        pt: 'Causa 3 de dano e aumenta esquiva por 2 turnos.',
        en: 'Deals 3 damage and increases dodge for 2 turns.',
      },
      cost: 2,
      type: 'damage_buff',
    },
    // Nível 6 - Perk: Fôlego Selvagem
    {
      level: 6,
      type: 'perk',
      id: 'WILD_BREATH',
      name: { pt: 'Fôlego Selvagem', en: 'Wild Breath' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 1 de vida.',
        en: 'When defeating an enemy, recover 1 HP.',
      },
    },
    // Nível 7 - Habilidade: Fúria do Felino
    {
      level: 7,
      type: 'skill',
      id: 'pawferion_skill_furia_felino',
      name: { pt: 'Fúria do Felino', en: 'Feline Fury' },
      desc: {
        pt: 'Causa 4 de dano e aumenta ataque e velocidade por 2 turnos.',
        en: 'Deals 4 damage and increases attack and speed for 2 turns.',
      },
      cost: 2,
      type: 'damage_buff',
    },
    // Nível 8 - Perk: Garras Protetoras
    {
      level: 8,
      type: 'perk',
      id: 'PROTECTIVE_CLAWS',
      name: { pt: 'Garras Protetoras', en: 'Protective Claws' },
      desc: {
        pt: 'No início do turno, ganha 1 de escudo se estiver com esquiva ativa.',
        en: 'At the start of the turn, gain 1 shield if evasion is active.',
      },
    },
    // Nível 9 - Habilidade: Tornado de Garras
    {
      level: 9,
      type: 'skill',
      id: 'pawferion_skill_tornado_garras',
      name: { pt: 'Tornado de Garras', en: 'Claw Tornado' },
      desc: {
        pt: 'Causa 4 de dano em ataque giratório e reduz defesa do alvo.',
        en: 'Deals 4 damage in spinning attack and reduces target defense.',
      },
      cost: 3,
      type: 'damage_defense_down',
    },
    // Nível 10 - Habilidade: Fúria Absoluta
    {
      level: 10,
      type: 'skill',
      id: 'pawferion_skill_furia_absoluta',
      name: { pt: 'Fúria Absoluta', en: 'Absolute Fury' },
      desc: {
        pt: 'Supremo: 4 de dano e aumenta todos os atributos aliados por 2 turnos.',
        en: 'Ultimate: 4 damage and increases all ally attributes for 2 turns.',
      },
      cost: 4,
      type: 'ultimate_team_buff',
    },
  ],
};
