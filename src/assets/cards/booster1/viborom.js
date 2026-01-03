// Card data for Viborom
module.exports = {
  id: 'viborom',
  num: 13,
  height: 9.3,
  weakness: 'terra',
  name: { pt: 'Viborom', en: 'Viborom' },
  type: { pt: 'Reptiloide', en: 'Reptiloid' },
  element: 'agua',
  img: require('../../img/creatures/viborom_bio.webp'),
  color: 'water',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Espreita Abissal', en: 'Abyssal Lurk' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo ao emergir das águas.',
        en: 'Deals 3 damage to the enemy by emerging from the water.',
      },
    },
    {
      name: { pt: 'Veneno Líquido', en: 'Liquid Venom' },
      cost: 1,
      desc: {
        pt: 'Aplica veneno que causa 1 de dano por turno durante 3 turnos.',
        en: 'Applies poison that deals 1 damage per turn for 3 turns.',
      },
    },
  ],
  field: { pt: 'Pântano Esquecido', en: 'Forgotten Swamp' },
  fielddesc: {
    pt: 'Inimigos têm sua velocidade reduzida em 6% enquanto Viborom estiver em campo.',
    en: 'Enemies have their speed reduced by 6% while Viborom is on the field.',
  },
  storyTitle: { pt: 'Sussurros do Pântano', en: 'Whispers of the Swamp' },
  story: [
    {
      pt: 'Viborom habita pântanos ancestrais onde a água nunca está completamente parada.',
      en: 'Viborom dwells in ancestral swamps where the water is never completely still.',
    },
    {
      pt: 'Criatura serpentina e silenciosa, seu veneno líquido é temido até mesmo pelos mais poderosos aventureiros.',
      en: 'A serpentine and silent creature, its liquid venom is feared even by the most powerful adventurers.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'viborom_skill_1',
      name: { pt: 'Veneno Letal', en: 'Lethal Poison' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo e o envenena.',
        en: 'Deals 3 damage to the enemy and poisons it.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'viborom_skill_2',
      name: { pt: 'Espécie Tóxica', en: 'Toxic Cloud' },
      desc: {
        pt: 'Envenena o inimigo causando 1 de dano por 3 turnos.',
        en: 'Poisons the enemy dealing 1 damage for 3 turns.',
      },
      cost: 1,
      type: 'poison_dot',
    },
  ],
  defaultBlessing: {
    id: 'viborom_blessing',
    name: { pt: 'Miasma Tóxico', en: 'Toxic Miasma' },
    desc: {
      pt: 'Criaturas venenosas ganham +3% de resistência enquanto Viborom estiver em campo.',
      en: 'Poison creatures gain +3% resistance while Viborom is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'viborom_skill_3',
      name: { pt: 'Presas Venenosas', en: 'Venom Fangs' },
      desc: {
        pt: 'Causa 3 de dano com múltiplas feridas envenenadas.',
        en: 'Deals 3 damage with multiple poison wounds.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'viborom_skill_4',
      name: { pt: 'Nuvem Tóxica', en: 'Poison Cloud' },
      desc: {
        pt: 'Causa 3 de dano e envenena por 4 turnos.',
        en: 'Deals 3 damage and poisons for 4 turns.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'viborom_skill_5',
      name: { pt: 'Epidemia', en: 'Epidemic' },
      desc: {
        pt: 'Causa 4 de dano e espalha veneno para aliados inimigos.',
        en: 'Deals 4 damage and spreads poison to enemy allies.',
      },
      cost: 2,
    },
    { level: 6, type: 'none' },
    { level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'viborom_skill_6',
      name: { pt: 'Corrosão Ácida', en: 'Acid Corrosion' },
      desc: {
        pt: 'Causa 4 de dano e reduz defesa inimiga por 3 turnos.',
        en: 'Deals 4 damage and reduces enemy defense for 3 turns.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'viborom_skill_7',
      name: { pt: 'Morte Tóxica', en: 'Toxic Death' },
      desc: {
        pt: 'Supremo: 4 de dano e aplica veneno por 5 turnos.',
        en: 'Ultimate: 4 damage and applies poison for 5 turns.',
      },
      cost: 3,
    },
  ],
};
