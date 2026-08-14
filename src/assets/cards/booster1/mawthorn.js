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
  hp: 8,
  abilities: [
    {
      name: { pt: 'Garras Abissais', en: 'Abyssal Claws' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano e aplica sangramento por 2 turnos.',
        en: 'Deals 3 damage and applies bleed for 2 turns.',
      },
    },
    {
      name: { pt: 'Regeneração', en: 'Regeneration' },
      cost: 3,
      desc: {
        pt: 'Recupera 3 de vida e concede +1 resistência a veneno por 2 turnos.',
        en: 'Restores 3 HP and reduces poison damage by 1 for 2 turns.',
      },
    },
  ],
  field: { pt: 'Abismo Profundo', en: 'Deep Abyss' },
  fielddesc: {
    pt: 'Aliados recuperam 2 de vida/turno; inimigos recebem 2 de veneno leve ao entrarem.',
    en: 'Allies recover 2 HP/turn; enemies take 2 light poison on entry.',
  },
  storyTitle: { pt: 'Origem de Mawthorn', en: 'Origin of Mawthorn' },
  story: [
    {
      pt: 'Mawthorn é uma criatura ancestral que habita as cavernas mais profundas e geladas do mundo, onde a luz jamais alcança. Seu corpo colossal, semelhante ao de um urso, é coberto por pelos brancos endurecidos como gelo eterno, e suas garras cristalinas são capazes de rasgar pedra como se fosse carne.',
      en: 'Mawthorn is an ancient creature that dwells in the deepest, coldest caves of the world, where light never reaches. Its colossal bear-like body is covered in white fur hardened like eternal ice, and its crystalline claws can tear through stone as if it were flesh.',
    },
    {
      pt: 'Dizem que Mawthorn nasceu de uma tempestade congelada que aprisionou uma montanha inteira, e que desde então se tornou o guardião involuntário de túneis esquecidos e reinos soterrados pelo tempo.',
      en: 'They say Mawthorn was born from a frozen storm that imprisoned an entire mountain, and that it has since become the unwilling guardian of forgotten tunnels and kingdoms buried by time.',
    },
    {
      pt: 'Não caça por fome, mas por instinto territorial: qualquer criatura que invada seu domínio é marcada como intrusa. Sobreviver a um encontro com Mawthorn é considerado impossível - e aqueles que afirmam tê-lo visto descrevem seus olhos como abismos azulados, frios como a própria morte.',
      en: 'It does not hunt from hunger, but from territorial instinct: any creature that invades its domain is marked as an intruder. Surviving an encounter with Mawthorn is considered impossible - and those who claim to have seen it describe its eyes as bluish abysses, cold as death itself.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'mawthorn_skill_1',
      name: { pt: 'Espinho Penetrante', en: 'Piercing Thorn' },
      desc: {
        pt: 'Causa 3 de dano, ignora +1 defesa e aplica sangramento.',
        en: 'Deals 3 damage, ignores +1 defense and applies bleed.',
      },
      cost: 1,
      type: 'damage_bleed',
      damage: 3,
      statusEffect: 'bleed',
      duration: 2,
      value: 1,
    },
    {
      id: 'mawthorn_skill_2',
      name: { pt: 'Mordida Glacial', en: 'Glacial Bite' },
      desc: {
        pt: 'Causa 3 de dano e aplica congelamento por 1 turno.',
        en: 'Deals 3 damage and freezes for 1 turn.',
      },
      cost: 1,
      type: 'damage_freeze',
      damage: 3,
      statusEffect: 'freeze',
      duration: 1,
    },
  ],
  defaultBlessing: {
    id: 'mawthorn_blessing',
    name: { pt: 'Gélido Abissal', en: 'Abyssal Freeze' },
    desc: {
      pt: 'Ao ser invocado, escolhe uma criatura do campo adversário e aplica congelamento por 3 turnos.',
      en: 'When summoned, chooses an enemy creature and applies freeze for 3 turns.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Espinhos Abissais
    {
      level: 2,
      type: 'perk',
      id: 'ABYSSAL_THORNS',
      name: { pt: 'Espinhos Abissais', en: 'Abyssal Thorns' },
      desc: {
        pt: 'Ao entrar em campo, aplica sangramento leve em todos os inimigos.',
        en: 'When summoned, applies light bleed to all enemies.',
      },
    },
    // Nível 3 - Habilidade: Nuvem Tóxica
    {
      level: 3,
      type: 'skill',
      id: 'mawthorn_skill_estilhaco_glacial',
      name: { pt: 'Estilhaço Glacial', en: 'Glacial Shard' },
      desc: {
        pt: 'Causa 2 de dano e aplica congelamento por 1 turno.',
        en: 'Deals 2 damage and freezes for 1 turn.',
      },
      cost: 1,
      damage: 2,
      statusEffect: 'freeze',
      duration: 1,
      effectType: 'damage_freeze',
    },
    // Nível 4 - Perk: Regeneração Profunda
    {
      level: 4,
      type: 'perk',
      id: 'DEEP_REGEN',
      name: { pt: 'Regeneração Profunda', en: 'Deep Regeneration' },
      desc: {
        pt: 'Recupera 1 de vida por turno enquanto estiver com sangramento ativo.',
        en: 'Recovers 1 HP per turn while bleed is active.',
      },
    },
    // Nível 5 - Habilidade: Picada Mortal
    {
      level: 5,
      type: 'skill',
      id: 'mawthorn_skill_picada_mortal',
      name: { pt: 'Garras Dilacerantes', en: 'Rending Claws' },
      desc: {
        pt: 'Causa 3 de dano e aplica sangramento forte por 2 turnos.',
        en: 'Deals 3 damage and applies strong bleed for 2 turns.',
      },
      cost: 2,
      damage: 3,
      statusEffect: 'bleed',
      duration: 2,
      value: 2,
      effectType: 'damage_bleed',
    },
    // Nível 6 - Perk: Pele Tóxica
    {
      level: 6,
      type: 'perk',
      id: 'TOXIC_SKIN',
      name: { pt: 'Pele Tóxica', en: 'Toxic Skin' },
      desc: {
        pt: 'Recebe -1 de dano de veneno e sangramento.',
        en: 'Takes -1 damage from poison and bleed.',
      },
    },
    // Nível 7 - Habilidade: Fúria da Natureza
    {
      level: 7,
      type: 'skill',
      id: 'mawthorn_skill_furia_natureza',
      name: { pt: 'Fúria da Geleira', en: "Glacier's Fury" },
      desc: {
        pt: 'Causa 4 de dano e aplica sangramento por 2 turnos.',
        en: 'Deals 4 damage and applies bleed for 2 turns.',
      },
      cost: 2,
      damage: 4,
      statusEffect: 'bleed',
      duration: 2,
      value: 1,
      effectType: 'damage_bleed',
    },
    // Nível 8 - Perk: Esporos Curativos
    {
      level: 8,
      type: 'perk',
      id: 'HEALING_SPORES',
      name: { pt: 'Esporos Curativos', en: 'Healing Spores' },
      desc: {
        pt: 'Ao aplicar um DoT, cura 1 de vida.',
        en: 'When applying a DoT, heal 1 HP.',
      },
    },
    // Nível 9 - Habilidade: Toxina Suprema
    {
      level: 9,
      type: 'skill',
      id: 'mawthorn_skill_toxina_suprema',
      name: { pt: 'Avalanche Carmesim', en: 'Crimson Avalanche' },
      desc: {
        pt: 'Causa 4 de dano, aplica sangramento forte por 3 turnos e jogue a moeda 1 vez; se der cara, congela por 1 turno.',
        en: 'Deals 4 damage, applies strong bleed for 3 turns and flips a coin once; on heads, freezes for 1 turn.',
      },
      cost: 3,
      damage: 4,
      statusEffect: 'bleed',
      duration: 3,
      value: 2,
      coinStatusEffect: 'freeze',
      coinStatusDuration: 1,
      effectType: 'damage_bleed_freeze',
    },
    // Nível 10 - Habilidade: Apocalipse Tóxico
    {
      level: 10,
      type: 'skill',
      id: 'mawthorn_skill_apocalipse_toxico',
      name: { pt: 'Inverno Dilacerante', en: 'Rending Winter' },
      desc: {
        pt: 'Supremo: causa 4 de dano, sangramento extremo por 4 turnos e congelamento por 1 turno.',
        en: 'Ultimate: deals 4 damage, extreme bleed for 4 turns and freezes for 1 turn.',
      },
      cost: 4,
      damage: 4,
      statusEffects: [
        { type: 'bleed', duration: 4, value: 2 },
        { type: 'freeze', duration: 1 },
      ],
      effectType: 'ultimate_bleed_freeze',
    },
  ],
};
