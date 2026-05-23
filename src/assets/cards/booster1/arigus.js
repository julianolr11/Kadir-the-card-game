// Card data for Arigus
module.exports = {
  id: 'arigus',
  title: { pt: 'Carneiro das Neves', en: 'Snow Ram' },
  num: 32,
  height: 1.6,
  weakness: 'fogo',
  name: { pt: 'Arigus', en: 'Arigus' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'agua',
  img: require('../../img/creatures/arigus_bio.webp'),
  color: 'water',
  hp: 8,
  abilities: [
    {
      name: { pt: 'Investida Glacial', en: 'Glacial Charge' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e aplica lentidão por 1 turno.',
        en: 'Deals 3 damage and applies slow for 1 turn.',
      },
    },
    {
      name: { pt: 'Bruma Alpina', en: 'Alpine Mist' },
      cost: 1,
      desc: {
        pt: 'Concede 1 de escudo e ganha +1 esquiva por 2 turnos.',
        en: 'Grants 1 shield and gains +1 evasion for 2 turns.',
      },
    },
  ],
  field: { pt: 'Pasto Invernal', en: 'Winter Pasture' },
  fielddesc: {
    pt: 'Aliados de água ganham +1 resistência enquanto Arigus estiver em campo.',
    en: 'Water allies gain +1 resistance while Arigus is on the field.',
  },
  storyTitle: { pt: 'O Carneiro da Neve', en: 'Ram of the Snow' },
  story: [
    {
      pt: 'Arigus percorre os picos gelados, guiando rebanhos sob nevascas silenciosas.',
      en: 'Arigus roams the icy peaks, guiding herds under silent blizzards.',
    },
    {
      pt: 'Dizem que seus chifres guardam um frio antigo, capaz de acalmar a fúria das montanhas.',
      en: 'Its horns are said to hold an ancient chill, calming the mountains wrath.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardiao) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'arigus_skill_investida_glacial',
      name: { pt: 'Investida Glacial', en: 'Glacial Charge' },
      desc: {
        pt: 'Causa 3 de dano e aplica lentidão por 1 turno.',
        en: 'Deals 3 damage and applies slow for 1 turn.',
      },
      cost: 1,
      type: 'damage_slow',
      damage: 3,
      statusEffect: 'slow',
      duration: 1,
    },
    {
      id: 'arigus_skill_bruma_alpina',
      name: { pt: 'Bruma Alpina', en: 'Alpine Mist' },
      desc: {
        pt: 'Concede 2 de escudo e +1 esquiva por 2 turnos.',
        en: 'Grants 2 shield and +1 evasion for 2 turns.',
      },
      cost: 1,
      type: 'shield_evasion',
      shield: 2,
      buff: { stat: 'evasion', value: 1, duration: 2 },
    },
  ],
  defaultBlessing: {
    id: 'arigus_blessing',
    name: { pt: 'Neve Serena', en: 'Serene Snow' },
    desc: {
      pt: 'Ao ser invocado, uma carta aleatoria do oponente em campo retorna para a mão.',
      en: 'When summoned, a random enemy card on the field returns to their hand.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'FROST_RESOLVE',
      name: { pt: 'Resolucao Gelida', en: 'Frost Resolve' },
      desc: {
        pt: 'Recebe -1 de dano de ataques fisicos.',
        en: 'Takes -1 damage from physical attacks.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'arigus_skill_tormenta_neve',
      name: { pt: 'Tormenta de Neve', en: 'Snowstorm' },
      desc: {
        pt: 'Causa 2 de dano a todos os inimigos e aplica lentidão por 1 turno.',
        en: 'Deals 2 damage to all enemies and applies slow for 1 turn.',
      },
      cost: 2,
      effectType: 'aoe_damage_slow',
      damage: 2,
      statusEffect: 'slow',
      duration: 1,
    },
    {
      level: 5,
      type: 'perk',
      id: 'ICEHORN_GUARD',
      name: { pt: 'Guarda de Gelo', en: 'Icehorn Guard' },
      desc: {
        pt: 'Ganha +1 de escudo ao entrar em campo.',
        en: 'Gains +1 shield when summoned.',
      },
    },
    {
      level: 6,
      type: 'skill',
      id: 'arigus_skill_ariete_nevasca',
      name: { pt: 'Ariete de Nevasca', en: 'Blizzard Ram' },
      desc: {
        pt: 'Causa 3 de dano e aplica congelamento por 1 turno.',
        en: 'Deals 3 damage and applies freeze for 1 turn.',
      },
      cost: 2,
      effectType: 'damage_freeze',
      damage: 3,
      statusEffect: 'freeze',
      duration: 1,
    },
    {
      level: 7,
      type: 'perk',
      id: 'SNOWBOUND_HIDE',
      name: { pt: 'Pele Nevada', en: 'Snowbound Hide' },
      desc: {
        pt: 'Quando recebe dano, ganha 1 de escudo se nao tiver escudo.',
        en: 'When damaged, gains 1 shield if it has no shield.',
      },
    },
  ],
};
