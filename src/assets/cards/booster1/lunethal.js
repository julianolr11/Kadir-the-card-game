// Card data for Lunethal
module.exports = {
  id: 'lunethal',
  title: { pt: 'O Dragão do Lago Lunar', en: 'Dragon of the Lunar Lake' },
  num: 19,
  height: 3.4,
  weakness: 'terra',
  name: { pt: 'Lunethal', en: 'Lunethal' },
  type: { pt: 'Draconídeo', en: 'Draconic' },
  element: 'agua',
  img: require('../../img/creatures/lunethal_bio.webp'),
  color: 'water',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Maré Crescente', en: 'Rising Tide' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo e aumenta a defesa de Lunethal em 1 ponto.',
        en: 'Deals 3 damage to the enemy and increases Lunethal’s defense by 1.',
      },
    },
    {
      name: { pt: 'Sopro Lunar', en: 'Lunar Breath' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano e tem chance de reduzir o ataque do inimigo.',
        en: 'Deals 2 damage and has a chance to reduce the enemy’s attack.',
      },
    },
  ],
  field: { pt: 'Reflexo do Lago', en: 'Lake Reflection' },
  fielddesc: {
    pt: 'Criaturas de água recebem 3% a mais de defesa enquanto Lunethal estiver em campo.',
    en: 'Water creatures gain 3% more defense while Lunethal is on the field.',
  },
  storyTitle: { pt: 'Lenda de Lunethal', en: 'Legend of Lunethal' },
  story: [
    {
      pt: 'Lunethal habita lagos ancestrais iluminados pela lua, emergindo apenas quando o equilíbrio das águas é ameaçado.',
      en: 'Lunethal dwells in ancient moonlit lakes, emerging only when the balance of waters is threatened.',
    },
    {
      pt: 'Diz-se que suas escamas refletem a lua cheia, tornando-o quase invisível nas noites silenciosas.',
      en: 'It is said that its scales reflect the full moon, making it nearly invisible on silent nights.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'lunethal_skill_1',
      name: { pt: 'Raio Lunar', en: 'Lunar Ray' },
      desc: {
        pt: 'Causa 3 de dano com poder celestial.',
        en: 'Deals 3 damage with celestial power.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'lunethal_skill_2',
      name: { pt: 'Cura Noturna', en: 'Night Heal' },
      desc: {
        pt: 'Causa 2 de dano e recupera 3 de vida.',
        en: 'Deals 2 damage and recovers 3 HP.',
      },
      cost: 1,
      type: 'damage_heal',
    },
  ],
  defaultBlessing: {
    id: 'lunethal_blessing',
    name: { pt: 'Bênção da Lua', en: "Moon's Blessing" },
    desc: {
      pt: 'Criaturas sagradas ganham +3% de velocidade enquanto Lunethal estiver em campo.',
      en: 'Holy creatures gain +3% speed while Lunethal is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'lunethal_skill_3',
      name: { pt: 'Pulso Celestial', en: 'Celestial Pulse' },
      desc: {
        pt: 'Causa 3 de dano e cura 2 de vida.',
        en: 'Deals 3 damage and heals 2 HP.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'lunethal_skill_4',
      name: { pt: 'Manto Protetor', en: 'Protective Mantle' },
      desc: {
        pt: 'Aumenta defesa e cura 3 de vida.',
        en: 'Increases defense and heals 3 HP.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'lunethal_skill_5',
      name: { pt: 'Graça Divina', en: 'Divine Grace' },
      desc: {
        pt: 'Causa 4 de dano e cura todos os aliados em 3 de vida.',
        en: 'Deals 4 damage and heals all allies for 3 HP.',
      },
      cost: 2,
    },
    { level: 6, type: 'none' },
    { level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'lunethal_skill_6',
      name: { pt: 'Ressurreição Lunar', en: 'Lunar Resurrection' },
      desc: {
        pt: 'Cura 4 de vida em todos os aliados.',
        en: 'Heals 4 HP to all allies.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'lunethal_skill_7',
      name: { pt: 'Era da Luz Eterna', en: 'Eternal Light Era' },
      desc: {
        pt: 'Supremo: 4 de dano e cura 4 de vida para todos os aliados.',
        en: 'Ultimate: 4 damage and heals 4 HP to all allies.',
      },
      cost: 3,
    },
  ],
};
