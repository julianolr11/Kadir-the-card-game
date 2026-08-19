// Card data for Crogal
module.exports = {
  id: 'crogal',
  num: 44,
  height: 1.0,
  weakness: 'puro',
  name: { pt: 'Crogal', en: 'Crogal' },
  type: { pt: 'Reptiloide', en: 'Reptiloid' },
  element: 'puro',
  img: require('../../img/creatures/crogal_bio.webp'),
  color: 'pure',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Mordida Cristalina', en: 'Crystalline Bite' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano ao inimigo.',
        en: 'Deals 2 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Camuflagem Luminosa', en: 'Luminous Camouflage' },
      cost: 1,
      desc: {
        pt: 'Ganha 1 de esquiva por 2 turnos.',
        en: 'Gains 1 evasion for 2 turns.',
      },
    },
  ],
  field: { pt: 'Duna de Cristal', en: 'Crystal Dune' },
  fielddesc: {
    pt: 'Criaturas puras ganham +1 velocidade enquanto Crogal estiver em campo.',
    en: 'Pure creatures gain +1 speed while Crogal is on the field.',
  },
  storyTitle: { pt: 'O Lagarto das Dunas de Cristal', en: 'The Lizard of the Crystal Dunes' },
  story: [
    {
      pt: 'Crogal desliza por dunas que brilham como vidro sob o sol do meio-dia.',
      en: 'Crogal glides across dunes that shine like glass under the midday sun.',
    },
    {
      pt: 'Sua pele reflete a luz, confundindo predadores e presas por igual.',
      en: 'Its skin reflects light, confusing predators and prey alike.',
    },
    {
      pt: 'Poucos conseguem alcançá-lo antes que desapareça entre os cristais de areia.',
      en: 'Few manage to catch it before it vanishes among the sand crystals.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'crogal_skill_1',
      name: { pt: 'Mordida Cristalina', en: 'Crystalline Bite' },
      desc: {
        pt: 'Causa 2 de dano ao inimigo.',
        en: 'Deals 2 damage to the enemy.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'crogal_skill_2',
      name: { pt: 'Camuflagem Luminosa', en: 'Luminous Camouflage' },
      desc: {
        pt: 'Ganha 1 de esquiva por 1 turno.',
        en: 'Gains 1 evasion for 1 turn.',
      },
      cost: 1,
      type: 'evasion',
    },
  ],
  defaultBlessing: {
    id: 'crogal_blessing',
    name: { pt: 'Sintonia Reptiliana', en: 'Reptilian Attunement' },
    desc: {
      pt: 'Ao ser invocado, ganha 1 essência para cada réptil em campo (seu ou do adversário).',
      en: "When summoned, gain 1 essence per Reptiloid creature on the field (yours or the opponent's).",
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Escamas Ágeis
    {
      level: 2,
      type: 'perk',
      id: 'SWIFT_SCALES',
      name: { pt: 'Escamas Ágeis', en: 'Swift Scales' },
      desc: {
        pt: 'Ganha +1 velocidade no primeiro turno de batalha.',
        en: 'Gains +1 speed on the first turn of battle.',
      },
    },
    // Nível 3 - Habilidade: Chicote de Cauda
    {
      level: 3,
      type: 'skill',
      id: 'crogal_skill_3',
      name: { pt: 'Chicote de Cauda', en: 'Tail Whip' },
      desc: {
        pt: 'Causa 2 de dano e reduz a defesa inimiga por 1 turno.',
        en: "Deals 2 damage and reduces the enemy's defense for 1 turn.",
      },
      cost: 1,
      effectType: 'damage_debuff',
    },
    // Nível 4 - Perk: Escamas Solares
    {
      level: 4,
      type: 'perk',
      id: 'SUN_SCALES',
      name: { pt: 'Escamas Solares', en: 'Sun Scales' },
      desc: {
        pt: 'Durante o dia, recupera 1 de vida por turno.',
        en: 'During the day, recovers 1 HP per turn.',
      },
    },
    // Nível 5 - Habilidade: Investida das Dunas
    {
      level: 5,
      type: 'skill',
      id: 'crogal_skill_4',
      name: { pt: 'Investida das Dunas', en: 'Dune Charge' },
      desc: {
        pt: 'Causa 3 de dano e ganha 1 de esquiva.',
        en: 'Deals 3 damage and gains 1 evasion.',
      },
      cost: 2,
      effectType: 'damage_buff',
    },
    // Nível 6 - Perk: Instinto do Deserto
    {
      level: 6,
      type: 'perk',
      id: 'DESERT_INSTINCT',
      name: { pt: 'Instinto do Deserto', en: 'Desert Instinct' },
      desc: {
        pt: 'Aliados puros recebem +1 velocidade quando Crogal está em campo.',
        en: 'Pure allies gain +1 speed while Crogal is on the field.',
      },
    },
    // Nível 7 - Habilidade: Fenda Cristalina
    {
      level: 7,
      type: 'skill',
      id: 'crogal_skill_5',
      name: { pt: 'Fenda Cristalina', en: 'Crystal Rift' },
      desc: {
        pt: 'Causa 3 de dano e ignora 1 de escudo inimigo.',
        en: "Deals 3 damage and ignores 1 of the enemy's shield.",
      },
      cost: 2,
      effectType: 'damage_pierce',
    },
    // Nível 8 - Perk: Escamas Resilientes
    {
      level: 8,
      type: 'perk',
      id: 'RESILIENT_SCALES',
      name: { pt: 'Escamas Resilientes', en: 'Resilient Scales' },
      desc: {
        pt: 'Reduz em 1 o dano recebido de habilidades de fogo.',
        en: 'Reduces damage taken from fire abilities by 1.',
      },
    },
    // Nível 9 - Habilidade: Tempestade de Areia
    {
      level: 9,
      type: 'skill',
      id: 'crogal_skill_6',
      name: { pt: 'Tempestade de Areia', en: 'Sandstorm' },
      desc: {
        pt: 'Causa 2 de dano e cega o inimigo por 2 turnos.',
        en: 'Deals 2 damage and blinds the enemy for 2 turns.',
      },
      cost: 3,
      effectType: 'damage_debuff',
    },
    // Nível 10 - Habilidade: Fúria das Dunas Eternas
    {
      level: 10,
      type: 'skill',
      id: 'crogal_skill_7',
      name: { pt: 'Fúria das Dunas Eternas', en: 'Fury of the Eternal Dunes' },
      desc: {
        pt: 'Supremo: 3 de dano e aumenta a velocidade de todos os aliados por 2 turnos.',
        en: 'Ultimate: 3 damage and increases the speed of all allies for 2 turns.',
      },
      cost: 4,
      effectType: 'ultimate_buff',
    },
  ],
};
