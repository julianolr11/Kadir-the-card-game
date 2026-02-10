// Card data for Moar
module.exports = {
  id: 'moar',
  title: { pt: 'Vagante Branco', en: 'White Wanderer' },
  num: 34,
  height: 2.4,
  weakness: 'fogo',
  name: { pt: 'Moar', en: 'Moar' },
  type: { pt: 'Mistica', en: 'Mystic' },
  element: 'puro',
  img: require('../../img/creatures/moar_bio.webp'),
  color: 'pure',
  hp: 11,
  abilities: [
    {
      name: { pt: 'Lamina de Neve', en: 'Snow Blade' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano puro e remove 1 debuff de si.',
        en: 'Deals 3 pure damage and removes 1 debuff from self.',
      },
    },
    {
      name: { pt: 'Manto Cristalino', en: 'Crystal Mantle' },
      cost: 1,
      desc: {
        pt: 'Concede 2 de escudo e +4% de resistencia por 2 turnos.',
        en: 'Grants 2 shield and +4% resistance for 2 turns.',
      },
    },
  ],
  field: { pt: 'Alvorada Branca', en: 'White Dawn' },
  fielddesc: {
    pt: 'Aliados puros recebem +3% de cura enquanto Moar estiver em campo.',
    en: 'Pure allies receive +3% healing while Moar is on the field.',
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
      name: { pt: 'Lamina de Neve', en: 'Snow Blade' },
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
        pt: 'Concede 2 de escudo e +4% resistencia por 2 turnos.',
        en: 'Grants 2 shield and +4% resistance for 2 turns.',
      },
      cost: 1,
      type: 'shield_resist',
      shield: 2,
      buff: { stat: 'resistance', value: 4, duration: 2 },
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
        pt: 'Recebe +1 de resistencia quando estiver acima de 50% de HP.',
        en: 'Gains +1 resistance when above 50% HP.',
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
      type: 'aoe_damage_heal',
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
  ],
};
