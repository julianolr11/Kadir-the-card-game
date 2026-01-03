// Card data for Raptauros
module.exports = {
  id: 'raptauros',
  title: { pt: 'O Predador das Dunas', en: 'The Dune Predator' },
  num: 16,
  height: 2.6,
  weakness: 'agua',
  name: { pt: 'Raptauros', en: 'Raptauros' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'terra',
  img: require('../../img/creatures/raptauros_bio.webp'),
  color: 'earth',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Investida das Dunas', en: 'Dune Charge' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo. Causa dano adicional se Raptauros agir primeiro.',
        en: 'Deals 3 damage. Deals bonus damage if Raptauros acts first.',
      },
    },
    {
      name: { pt: 'Ruptura do Solo', en: 'Ground Rupture' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano e reduz a defesa do inimigo.',
        en: 'Deals 2 damage and reduces the enemy defense.',
      },
    },
  ],
  field: { pt: 'Domínio das Areias', en: 'Sand Dominion' },
  fielddesc: {
    pt: 'Criaturas de terra recebem +3% de defesa enquanto Raptauros estiver em campo.',
    en: 'Earth creatures gain +3% defense while Raptauros is on the field.',
  },
  storyTitle: { pt: 'O Caçador do Deserto', en: 'The Desert Hunter' },
  story: [
    {
      pt: 'Raptauros é um draconídeo ancestral que habita mares de areia e ruínas soterradas.',
      en: 'Raptauros is an ancient draconid that inhabits seas of sand and buried ruins.',
    },
    {
      pt: 'Seu corpo blindado e suas garras afiadas fazem dele um predador implacável das dunas.',
      en: 'Its armored body and razor-sharp claws make it a relentless dune predator.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'raptauros_skill_1',
      name: { pt: 'Investida das Dunas', en: 'Dune Charge' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo. Causa dano adicional se Raptauros agir primeiro.',
        en: 'Deals 3 damage. Deals bonus damage if Raptauros acts first.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'raptauros_skill_2',
      name: { pt: 'Ruptura do Solo', en: 'Ground Rupture' },
      desc: {
        pt: 'Causa 2 de dano e reduz a defesa do inimigo.',
        en: 'Deals 2 damage and reduces the enemy defense.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'raptauros_blessing',
    name: { pt: 'Domínio das Areias', en: 'Sand Dominion' },
    desc: {
      pt: 'Criaturas de terra recebem +3% de defesa enquanto Raptauros estiver em campo.',
      en: 'Earth creatures gain +3% defense while Raptauros is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'raptauros_skill_3',
      name: { pt: 'Golpe Sísmico', en: 'Seismic Strike' },
      desc: {
        pt: 'Causa 3 de dano e tem chance de atordoar por 1 turno.',
        en: 'Deals 3 damage with a chance to stun for 1 turn.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'raptauros_skill_4',
      name: { pt: 'Terremoto', en: 'Earthquake' },
      desc: {
        pt: 'Causa 3 de dano e reduz velocidade inimiga por 2 turnos.',
        en: 'Deals 3 damage and reduces enemy speed for 2 turns.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'raptauros_skill_5',
      name: { pt: 'Fúria Ancestral', en: 'Ancestral Fury' },
      desc: {
        pt: 'Causa 4 de dano. Aumenta o próprio ataque a cada uso.',
        en: 'Deals 4 damage. Increases own attack with each use.',
      },
      cost: 2,
    },
    { level: 6, type: 'none' },
    { level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'raptauros_skill_6',
      name: { pt: 'Avalanche', en: 'Avalanche' },
      desc: {
        pt: 'Ataque devastador de 4 de dano que ignora escudos.',
        en: 'Devastating 4 damage attack that ignores shields.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'raptauros_skill_7',
      name: { pt: 'Domínio Draconiano', en: 'Draconic Dominion' },
      desc: {
        pt: 'Supremo: 4 de dano e aumenta defesa de todos os aliados por 3 turnos.',
        en: 'Ultimate: 4 damage and increases defense of all allies for 3 turns.',
      },
      cost: 3,
    },
  ],
};
