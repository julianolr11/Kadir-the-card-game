// Card data for Draak
module.exports = {
  id: 'draak',
  title: { pt: 'Olhos de esmeralda', en: 'Emerald Eyes' },
  num: 1,
  height: 3.1,
  weakness: 'puro',
  name: { pt: 'Draak', en: 'Draak' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'puro',
  img: require('../../img/creatures/draak_bio.webp'),
  color: 'pure',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Sopro Etéreo', en: 'Ethereal Breath' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Escamas Celestes', en: 'Sky Scales' },
      cost: 1,
      desc: {
        pt: 'Reduz dano recebido em 3%.',
        en: 'Reduces damage taken by 3%.',
      },
    },
  ],
  field: { pt: 'Céu Cristalino', en: 'Crystal Sky' },
  fielddesc: {
    pt: 'Aumenta dano de ar em 3% enquanto Draak estiver em campo.',
    en: 'Increases air damage by 3% while Draak is on the field.',
  },
  storyTitle: { pt: 'Origem de Draak', en: 'Origin of Draak' },
  story: [
    {
      pt: 'Draak é um jovem draconídeo nascido nas nuvens eternas.',
      en: 'Draak is a young draconid born in the eternal clouds.',
    },
    {
      pt: 'Sua energia leve e instável o torna imprevisível e poderoso.',
      en: 'Its light and unstable energy makes it unpredictable and powerful.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'draak_skill_1',
      name: { pt: 'Grito Dracônico', en: 'Draconic Roar' },
      desc: {
        pt: 'Causa 3 de dano e atordoa o inimigo.',
        en: 'Deals 3 damage and stuns the enemy.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'draak_skill_2',
      name: { pt: 'Escama Destruidora', en: 'Destroyer Scale' },
      desc: {
        pt: 'Causa 2 de dano e ignora 5% da defesa inimiga.',
        en: 'Deals 2 damage and ignores 5% of enemy defense.',
      },
      cost: 1,
      type: 'damage',
    },
  ],
  defaultBlessing: {
    id: 'draak_blessing',
    name: { pt: 'Força Dracônica', en: 'Draconic Strength' },
    desc: {
      pt: 'Ataque aumenta em 3% enquanto Draak estiver em campo.',
      en: 'Attack increased by 3% while Draak is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'draak_skill_3',
      name: { pt: 'Investida Dracônica', en: 'Draconic Charge' },
      desc: {
        pt: 'Causa 3 de dano e aumenta a próxima ação.',
        en: 'Deals 3 damage and increases next action.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'ATTACK_PLUS_1' },
    {
      level: 3,
      type: 'skill',
      id: 'draak_skill_4',
      name: { pt: 'Bafo Ardente', en: 'Burning Breath' },
      desc: {
        pt: 'Causa 3 de dano em linha e causa incêndio.',
        en: 'Deals 3 damage in a line and causes fire.',
      },
      cost: 2,
    },
    { level: 4, type: 'perk', id: 'HP_PLUS_1' },
    {
      level: 5,
      type: 'skill',
      id: 'draak_skill_5',
      name: { pt: 'Tornado Destrutivo', en: 'Destructive Tornado' },
      desc: {
        pt: 'Causa 4 de dano e reduz velocidade do inimigo.',
        en: 'Deals 4 damage and reduces enemy speed.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'DEFENSE_REDUCTION' },
    {
      level: 7,
      type: 'skill',
      id: 'draak_skill_6',
      name: { pt: 'Escudo Dragônico', en: 'Dragon Shield' },
      desc: {
        pt: 'Aumenta defesa e reflete 5% do dano recebido.',
        en: 'Increases defense and reflects 5% of damage taken.',
      },
      cost: 2,
    },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    { level: 9, type: 'perk', id: 'CRIT_CHANCE' },
    {
      level: 10,
      type: 'skill',
      id: 'draak_skill_7',
      name: { pt: 'Fúria Primordial', en: 'Primordial Fury' },
      desc: {
        pt: 'Supremo: 4 de dano ignorando totalmente a defesa.',
        en: 'Ultimate: 4 damage completely ignores defense.',
      },
      cost: 3,
    },
  ],
};
