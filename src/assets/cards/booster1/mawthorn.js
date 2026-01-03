// Card data for Mawthorn
module.exports = {
  id: 'mawthorn',
  num: 2,
  height: 4.2,
  weakness: 'terra',
  name: { pt: 'Mawthorn', en: 'Mawthorn' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'agua',
  img: require('../../img/creatures/mawthorn_bio.webp'),
  color: 'water',
  hp: 4,
  abilities: [
    {
      name: { pt: 'Garras Abissais', en: 'Abyssal Claws' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e aplica bleed por 2 turnos.',
        en: 'Deals 3 damage and applies bleed for 2 turns.',
      },
    },
    {
      name: { pt: 'Regeneração', en: 'Regeneration' },
      cost: 1,
      desc: {
        pt: 'Recupera 3 de vida e concede 10% de resistência a veneno por 2 turnos.',
        en: 'Restores 3 HP and grants 10% poison resist for 2 turns.',
      },
    },
  ],
  field: { pt: 'Abismo Profundo', en: 'Deep Abyss' },
  fielddesc: {
    pt: 'Aliados recuperam 2 de vida/turno; inimigos recebem 2 de poison leve ao entrarem.',
    en: 'Allies recover 2 HP/turn; enemies take 2 light poison on entry.',
  },
  storyTitle: { pt: 'Origem de Mawthorn', en: 'Origin of Mawthorn' },
  story: [
    {
      pt: 'Mawthorn ronda trincheiras abissais onde a luz não alcança e o veneno se torna alimento.',
      en: 'Mawthorn prowls abyssal trenches where light never reaches and poison becomes sustenance.',
    },
    {
      pt: 'Seu corpo exsuda toxinas que curam sua própria carne enquanto corroem armaduras inimigas.',
      en: 'Its body leaks toxins that heal its flesh while corroding enemy armor.',
    },
    {
      pt: 'Dizem que cada espinho que perde brota como uma âncora viva, prendendo presas nas profundezas.',
      en: 'It is said each thorn it sheds sprouts like a living anchor, trapping prey in the depths.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'mawthorn_skill_1',
      name: { pt: 'Espinho Penetrante', en: 'Piercing Thorn' },
      desc: {
        pt: 'Causa 3 de dano, ignora 10% defesa e aplica bleed.',
        en: 'Deals 3 damage, ignores 10% defense and applies bleed.',
      },
      cost: 1,
      type: 'damage_bleed',
    },
    {
      id: 'mawthorn_skill_2',
      name: { pt: 'Veneno Corredor', en: 'Coursing Poison' },
      desc: {
        pt: 'Causa 3 de dano, aplica poison por 3 turnos e reduz cura recebida em 10%.',
        en: 'Deals 3 damage, poisons 3 turns, reduces healing received by 10%.',
      },
      cost: 1,
      type: 'damage_poison',
    },
  ],
  defaultBlessing: {
    id: 'mawthorn_blessing',
    name: { pt: 'Esporos Abissais', en: 'Abyssal Spores' },
    desc: {
      pt: 'Aliados aplicam +1 tick de poison/bleed e curam 1 ao aplicar um DoT.',
      en: 'Allies apply +1 tick of poison/bleed and heal 1 when applying a DoT.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'mawthorn_skill_3',
      name: { pt: 'Nuvem Tóxica', en: 'Toxic Cloud' },
      desc: {
        pt: 'Causa 3 de dano, aplica poison e -5% de acerto no alvo.',
        en: 'Deals 3 damage, applies poison and -5% accuracy.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'POISON_CHANCE_PLUS_10' },
    {
      level: 3,
      type: 'skill',
      id: 'mawthorn_skill_4',
      name: { pt: 'Picada Mortal', en: 'Deadly Sting' },
      desc: {
        pt: 'Causa 4 de dano, bleed + poison por 3 turnos.',
        en: 'Deals 4 damage, bleed + poison for 3 turns.',
      },
      cost: 2,
    },
    { level: 4, type: 'perk', id: 'ARMOR_PEN_PLUS_10' },
    {
      level: 5,
      type: 'skill',
      id: 'mawthorn_skill_5',
      name: { pt: 'Fúria da Natureza', en: "Nature's Fury" },
      desc: {
        pt: 'Causa 4 de dano e cria campo que aplica bleed leve em inimigos novos.',
        en: 'Deals 4 damage and creates a field applying light bleed to new enemies.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'REGEN_PLUS_5' },
    { level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'mawthorn_skill_6',
      name: { pt: 'Toxina Suprema', en: 'Supreme Toxin' },
      desc: {
        pt: 'Causa 4 em área, poison forte 3 turnos e 25% de paralisar.',
        en: 'Deals 4 AoE, strong poison 3 turns and 25% paralyze.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'mawthorn_skill_7',
      name: { pt: 'Apocalipse Tóxico', en: 'Toxic Apocalypse' },
      desc: {
        pt: 'Supremo: 4 de dano, bleed + poison extremo por 4 turnos.',
        en: 'Ultimate: 4 damage, extreme bleed + poison for 4 turns.',
      },
      cost: 3,
    },
  ],
};
