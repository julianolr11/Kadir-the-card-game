// Card data for Elderox
module.exports = {
  id: 'elderox',
  title: { pt: 'Rugido da montanha', en: 'Roar of the Mountain' },
  num: 20,
  height: 4.2,
  weakness: 'agua',
  name: { pt: 'Elderox', en: 'Elderox' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'terra',
  img: require('../../img/creatures/elderox_bio.webp'),
  color: 'earth',
  hp: 12,
  abilities: [
    {
      name: { pt: 'Rugido Sísmico', en: 'Seismic Roar' },
      cost: 1,
      desc: {
        pt: 'Causa dano em área e reduz a velocidade dos inimigos por 1 turno.',
        en: "Deals area damage and reduces enemies' speed for 1 turn.",
      },
    },
    {
      name: { pt: 'Pele Rochosa', en: 'Rocky Hide' },
      cost: 1,
      desc: {
        pt: 'Recebe menos dano de ataques físicos por 2 turnos.',
        en: 'Takes less damage from physical attacks for 2 turns.',
      },
    },
  ],
  field: { pt: 'Montanha Ancestral', en: 'Ancient Mountain' },
  fielddesc: {
    pt: 'Aumenta defesa de criaturas de terra em 4% enquanto Elderox estiver em campo.',
    en: "Increases earth creatures' defense by 4% while Elderox is on the field.",
  },
  storyTitle: { pt: 'Lenda de Elderox', en: 'Legend of Elderox' },
  story: [
    {
      pt: 'Elderox é uma criatura ancestral, símbolo da força e resistência das montanhas.',
      en: 'Elderox is an ancient creature, symbol of the strength and endurance of the mountains.',
    },
    {
      pt: 'Seu rugido ecoa por vales e desfiladeiros, inspirando aliados e aterrorizando inimigos.',
      en: 'Its roar echoes through valleys and gorges, inspiring allies and terrifying enemies.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'elderox_skill_1',
      name: { pt: 'Sabedoria Ancestral', en: 'Ancestral Wisdom' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo com conhecimento antigo.',
        en: 'Deals 3 damage to the enemy with ancient knowledge.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'elderox_skill_2',
      name: { pt: 'Defesa Milenial', en: 'Millennial Defense' },
      desc: {
        pt: 'Aumenta a defesa própria e reduz dano recebido em 5% por 2 turnos.',
        en: 'Increases own defense and reduces damage taken by 5% for 2 turns.',
      },
      cost: 1,
      type: 'buff',
    },
  ],
  defaultBlessing: {
    id: 'elderox_blessing',
    name: { pt: 'Aura de Antiguidade', en: 'Aura of Antiquity' },
    desc: {
      pt: 'Aliados ganham +3% de defesa enquanto Elderox estiver em campo.',
      en: 'Allies gain +3% defense while Elderox is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'elderox_skill_3',
      name: { pt: 'Lição do Passado', en: 'Lesson of the Past' },
      desc: {
        pt: 'Causa 3 de dano e paralisa o inimigo por 1 turno.',
        en: 'Deals 3 damage and paralyzes the enemy for 1 turn.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'elderox_skill_4',
      name: { pt: 'Escudo Eterno', en: 'Eternal Shield' },
      desc: {
        pt: 'Cria um escudo que nega os ataques recebidos por 2 rodadas.',
        en: 'Creates a shield that negates attacks taken for 2 rounds.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'elderox_skill_5',
      name: { pt: 'Castigo Justo', en: 'Just Punishment' },
      desc: {
        pt: 'Causa 4 de dano e reduz todos os atributos do inimigo por 1 turno.',
        en: 'Deals 4 damage and reduces all enemy attributes for 1 turn.',
      },
      cost: 2,
    },
    { level: 6, type: 'none' },
    { level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'elderox_skill_6',
      name: { pt: 'Poder Primordial', en: 'Primordial Power' },
      desc: {
        pt: 'Causa 4 de dano e restaura 3 de vida.',
        en: 'Deals 4 damage and restores 3 HP.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'elderox_skill_7',
      name: { pt: 'Verdade Eterna', en: 'Eternal Truth' },
      desc: {
        pt: 'Supremo: 4 de dano e aumenta defesa de todos os aliados por 3 turnos.',
        en: 'Ultimate: 4 damage and increases defense of all allies for 3 turns.',
      },
      cost: 3,
    },
  ],
};
