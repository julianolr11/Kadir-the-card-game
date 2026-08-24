// Card data for Hipoderion
module.exports = {
  id: 'hipoderion',
  num: 41,
  height: 1.9,
  weakness: 'terra',
  name: { pt: 'Hipoderion', en: 'Hipoderion' },
  type: { pt: 'Mística', en: 'Mystic' },
  element: 'agua',
  img: require('../../img/creatures/hipoderion_bio.webp'),
  altImg: require('../../img/creatures/alternative/hipoderion_alternative.png'),
  color: 'water',
  hp: 8,
  abilities: [
    {
      name: { pt: 'Onda Purificante', en: 'Purifying Wave' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e remove 1 buff do inimigo.',
        en: 'Deals 3 damage and removes 1 enemy buff.',
      },
    },
    {
      name: { pt: 'Abraço da Lagoa', en: "Lagoon's Embrace" },
      cost: 1,
      desc: {
        pt: 'Cura 2 de vida e concede 1 de escudo.',
        en: 'Heals 2 HP and grants 1 shield.',
      },
    },
  ],
  field: { pt: 'Lagoa Sagrada', en: 'Sacred Lagoon' },
  fielddesc: {
    pt: 'Criaturas de água recebem +1 de cura por turno enquanto Hipoderion estiver em campo.',
    en: 'Water creatures gain +1 healing per turn while Hipoderion is on the field.',
  },
  storyTitle: { pt: 'O Guardião da Lagoa Sagrada', en: 'The Guardian of the Sacred Lagoon' },
  story: [
    {
      pt: 'Hipoderion emerge das águas calmas de lagoas esquecidas, onde a neblina nunca se dissipa.',
      en: 'Hipoderion emerges from the calm waters of forgotten lagoons, where the mist never fades.',
    },
    {
      pt: 'Diz-se que sua pele reflete visões para quem ousa encará-lo nos olhos.',
      en: "It is said that its hide reflects visions to those who dare look into its eyes.",
    },
    {
      pt: 'Protege as águas sagradas, purificando qualquer corrupção que ouse tocar sua lagoa.',
      en: 'It protects the sacred waters, purifying any corruption that dares touch its lagoon.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'hipoderion_skill_1',
      name: { pt: 'Onda Purificante', en: 'Purifying Wave' },
      desc: {
        pt: 'Causa 3 de dano e remove 1 buff do inimigo.',
        en: 'Deals 3 damage and removes 1 enemy buff.',
      },
      cost: 1,
      type: 'damage_dispel',
    },
    {
      id: 'hipoderion_skill_2',
      name: { pt: 'Abraço da Lagoa', en: "Lagoon's Embrace" },
      desc: {
        pt: 'Cura 2 de vida e concede 1 de escudo.',
        en: 'Heals 2 HP and grants 1 shield.',
      },
      cost: 1,
      type: 'heal_shield',
    },
  ],
  defaultBlessing: {
    id: 'hipoderion_blessing',
    name: { pt: 'Onda da Lagoa', en: 'Lagoon Wave' },
    desc: {
      pt: 'Ao ser invocado, uma onda avança sobre o campo adversário, causando 1 de dano a cada carta do lado inimigo.',
      en: "When summoned, a wave surges over the opponent's field, dealing 1 damage to every card on the enemy side.",
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Calma Mística
    {
      level: 2,
      type: 'perk',
      id: 'MYSTIC_CALM',
      name: { pt: 'Calma Mística', en: 'Mystic Calm' },
      desc: {
        pt: 'Recupera 1 de vida extra ao usar habilidades de cura.',
        en: 'Recovers 1 extra HP when using healing abilities.',
      },
    },
    // Nível 3 - Habilidade: Névoa Protetora
    {
      level: 3,
      type: 'skill',
      id: 'hipoderion_skill_3',
      name: { pt: 'Névoa Protetora', en: 'Protective Mist' },
      desc: {
        pt: 'Causa 2 de dano e concede 1 de escudo por 2 turnos.',
        en: 'Deals 2 damage and grants 1 shield for 2 turns.',
      },
      cost: 1,
      effectType: 'damage_shield',
    },
    // Nível 4 - Perk: Águas Sagradas
    {
      level: 4,
      type: 'perk',
      id: 'SACRED_WATERS',
      name: { pt: 'Águas Sagradas', en: 'Sacred Waters' },
      desc: {
        pt: 'Durante o dia, cura 1 de vida extra por turno.',
        en: 'During the day, heals 1 extra HP per turn.',
      },
    },
    // Nível 5 - Habilidade: Maré Ancestral
    {
      level: 5,
      type: 'skill',
      id: 'hipoderion_skill_4',
      name: { pt: 'Maré Ancestral', en: 'Ancestral Tide' },
      desc: {
        pt: 'Causa 3 de dano e reduz o ataque inimigo por 2 turnos.',
        en: "Deals 3 damage and reduces the enemy's attack for 2 turns.",
      },
      cost: 2,
      effectType: 'damage_debuff',
    },
    // Nível 6 - Perk: Proteção da Lagoa
    {
      level: 6,
      type: 'perk',
      id: 'LAGOON_WARD',
      name: { pt: 'Proteção da Lagoa', en: 'Lagoon Ward' },
      desc: {
        pt: 'Aliados recebem -1 de dano de habilidades sombrias.',
        en: 'Allies take -1 damage from shadow abilities.',
      },
    },
    // Nível 7 - Habilidade: Fúria da Lagoa
    {
      level: 7,
      type: 'skill',
      id: 'hipoderion_skill_5',
      name: { pt: 'Fúria da Lagoa', en: "Lagoon's Fury" },
      desc: {
        pt: 'Causa 4 de dano e aumenta a defesa temporariamente.',
        en: 'Deals 4 damage and temporarily increases defense.',
      },
      cost: 2,
      effectType: 'damage_buff',
    },
    // Nível 8 - Perk: Névoa Persistente
    {
      level: 8,
      type: 'perk',
      id: 'PERSISTENT_MIST',
      name: { pt: 'Névoa Persistente', en: 'Persistent Mist' },
      desc: {
        pt: 'Ao curar um aliado, recupera 1 de vida.',
        en: 'When healing an ally, recover 1 HP.',
      },
    },
    // Nível 9 - Habilidade: Aura da Lagoa Sagrada
    {
      level: 9,
      type: 'skill',
      id: 'hipoderion_skill_6',
      name: { pt: 'Aura da Lagoa Sagrada', en: 'Sacred Lagoon Aura' },
      desc: {
        pt: 'Cria uma aura que cura todos os aliados por 3 turnos.',
        en: 'Creates an aura that heals all allies for 3 turns.',
      },
      cost: 3,
      effectType: 'team_heal_buff',
    },
    // Nível 10 - Habilidade: Apoteose da Lagoa
    {
      level: 10,
      type: 'skill',
      id: 'hipoderion_skill_7',
      name: { pt: 'Apoteose da Lagoa', en: 'Lagoon Apotheosis' },
      desc: {
        pt: 'Supremo: 4 de dano e purifica o campo de batalha.',
        en: 'Ultimate: 4 damage and purifies the battlefield.',
      },
      cost: 4,
      effectType: 'ultimate_dispel',
    },
  ],
};
