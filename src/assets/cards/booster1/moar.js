// Card data for Moar
module.exports = {
  id: 'moar',
  title: { pt: 'Vagante Branco', en: 'White Wanderer' },
  num: 34,
  height: 2.4,
  weakness: 'fogo',
  name: { pt: 'Moar', en: 'Moar' },
  type: { pt: 'Mística', en: 'Mystic' },
  element: 'puro',
  img: require('../../img/creatures/moar_bio.webp'),
  color: 'pure',
  hp: 11,
  abilities: [
    {
      name: { pt: 'Lâmina de Neve', en: 'Snow Blade' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano puro e remove 1 debuff de si.',
        en: 'Deals 3 pure damage and removes 1 debuff from self.',
      },
    },
    {
      name: { pt: 'Manto Cristalino', en: 'Crystal Mantle' },
      cost: 2,
      desc: {
        pt: 'Concede 2 de escudo e +1 resistência por 2 turnos.',
        en: 'Grants 2 shield and +1 resistance for 2 turns.',
      },
    },
  ],
  field: { pt: 'Alvorada Branca', en: 'White Dawn' },
  fielddesc: {
    pt: 'Aliados puros recebem +1 cura enquanto Moar estiver em campo.',
    en: 'Pure allies receive +1 healing while Moar is on the field.',
  },
  storyTitle: { pt: 'Chifres da Aurora', en: 'Horns of the Aurora' },
  story: [
    {
      pt: 'Moar desliza entre neves eternas, seus chifres refletindo a luz mais pura.',
      en: 'Moar glides through eternal snow, its horns reflecting the purest light.',
    },
    {
      pt: 'Sua presenca silencia tempestades e inspira criaturas misticas a resistir.',
      en: 'Its presence stills storms and inspires mystic creatures to endure.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardiao) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'moar_skill_lamina_neve',
      name: { pt: 'Lâmina de Neve', en: 'Snow Blade' },
      desc: {
        pt: 'Causa 3 de dano puro e remove 1 debuff de si.',
        en: 'Deals 3 pure damage and removes 1 debuff from self.',
      },
      cost: 1,
      type: 'damage_cleanse',
      damage: 3,
      cleanse: 1,
    },
    {
      id: 'moar_skill_manto_cristalino',
      name: { pt: 'Manto Cristalino', en: 'Crystal Mantle' },
      desc: {
        pt: 'Concede 2 de escudo e +1 resistência por 2 turnos.',
        en: 'Grants 2 shield and +1 resistance for 2 turns.',
      },
      cost: 2,
      type: 'shield_resist',
      shield: 2,
      buff: { stat: 'resistance', value: 1, duration: 2 },
    },
  ],
  defaultBlessing: {
    id: 'moar_blessing',
    name: { pt: 'Luz do Gelo', en: 'Frostlight' },
    desc: {
      pt: 'Ao ser invocado, todos os oponentes ficam congelados por 2 turnos.',
      en: 'When summoned, all opponents are frozen for 2 turns.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'AURORA_WARD',
      name: { pt: 'Guarda Aurora', en: 'Aurora Ward' },
      desc: {
        pt: 'Recebe +1 de resistencia quando estiver acima de metade do HP.',
        en: 'Gains +1 resistance when above half HP.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'moar_skill_luz_nevada',
      name: { pt: 'Luz Nevada', en: 'Snowlight' },
      desc: {
        pt: 'Causa 2 de dano puro em todos os inimigos e cura 1 de HP dos aliados.',
        en: 'Deals 2 pure damage to all enemies and heals allies for 1 HP.',
      },
      cost: 2,
      effectType: 'aoe_damage_heal',
      damage: 2,
      heal: 1,
    },
    {
      level: 5,
      type: 'perk',
      id: 'PURE_HORIZON',
      name: { pt: 'Horizonte Puro', en: 'Pure Horizon' },
      desc: {
        pt: 'Ao entrar em campo, remove 1 debuff de todos os aliados.',
        en: 'When summoned, removes 1 debuff from all allies.',
      },
    },
    {
      level: 6,
      type: 'skill',
      id: 'moar_skill_neve_purificadora',
      name: { pt: 'Neve Purificadora', en: 'Purifying Snow' },
      desc: {
        pt: 'Cura 2 de HP de um aliado e concede 1 de escudo por 1 turno.',
        en: 'Heals 2 HP from an ally and grants 1 shield for 1 turn.',
      },
      cost: 2,
      effectType: 'heal_shield',
      heal: 2,
      shield: 1,
      duration: 1,
    },
    {
      level: 7,
      type: 'perk',
      id: 'WHITE_VIGIL',
      name: { pt: 'Vigilia Branca', en: 'White Vigil' },
      desc: {
        pt: 'No início do turno, se tiver 3 HP ou menos, remove 1 debuff e ganha 1 de escudo.',
        en: 'At the start of the turn, if it has 3 HP or less, removes 1 debuff and gains 1 shield.',
      },
    },
  ],
};
