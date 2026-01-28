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
    // Nível 2 - Perk: Pele Venenosa
    {
      level: 2,
      type: 'perk',
      id: 'VENOM_SKIN',
      name: { pt: 'Pele Venenosa', en: 'Venom Skin' },
      desc: {
        pt: 'Recebe -1 de dano de poison por 2 turnos ao entrar em campo.',
        en: 'Takes -1 poison damage for 2 turns when summoned.',
      },
    },
    // Nível 3 - Habilidade: Presas Venenosas
    {
      level: 3,
      type: 'skill',
      id: 'viborom_skill_presas_venenosas',
      name: { pt: 'Presas Venenosas', en: 'Venom Fangs' },
      desc: {
        pt: 'Causa 2 de dano com múltiplas feridas envenenadas.',
        en: 'Deals 2 damage with multiple poison wounds.',
      },
      cost: 1,
      type: 'damage_poison',
    },
    // Nível 4 - Perk: Resistência Tóxica
    {
      level: 4,
      type: 'perk',
      id: 'TOXIC_RESISTANCE',
      name: { pt: 'Resistência Tóxica', en: 'Toxic Resistance' },
      desc: {
        pt: 'Recebe -20% de dano de poison.',
        en: 'Takes -20% poison damage.',
      },
    },
    // Nível 5 - Habilidade: Nuvem Tóxica
    {
      level: 5,
      type: 'skill',
      id: 'viborom_skill_nuvem_toxica',
      name: { pt: 'Nuvem Tóxica', en: 'Poison Cloud' },
      desc: {
        pt: 'Causa 3 de dano e envenena por 3 turnos.',
        en: 'Deals 3 damage and poisons for 3 turns.',
      },
      cost: 2,
      type: 'damage_poison_dot',
    },
    // Nível 6 - Perk: Veneno Persistente
    {
      level: 6,
      type: 'perk',
      id: 'PERSISTENT_VENOM',
      name: { pt: 'Veneno Persistente', en: 'Persistent Venom' },
      desc: {
        pt: 'Poison causado por Viborom dura +1 turno.',
        en: 'Poison caused by Viborom lasts +1 turn.',
      },
    },
    // Nível 7 - Habilidade: Epidemia
    {
      level: 7,
      type: 'skill',
      id: 'viborom_skill_epidemia',
      name: { pt: 'Epidemia', en: 'Epidemic' },
      desc: {
        pt: 'Causa 4 de dano e espalha veneno para inimigos adjacentes.',
        en: 'Deals 4 damage and spreads poison to adjacent enemies.',
      },
      cost: 2,
      type: 'aoe_poison_spread',
    },
    // Nível 8 - Perk: Cura Tóxica
    {
      level: 8,
      type: 'perk',
      id: 'TOXIC_HEAL',
      name: { pt: 'Cura Tóxica', en: 'Toxic Heal' },
      desc: {
        pt: 'Ao derrotar um inimigo envenenado, cura 2 de vida.',
        en: 'When defeating a poisoned enemy, heal 2 HP.',
      },
    },
    // Nível 9 - Habilidade: Corrosão Ácida
    {
      level: 9,
      type: 'skill',
      id: 'viborom_skill_corrosao_acida',
      name: { pt: 'Corrosão Ácida', en: 'Acid Corrosion' },
      desc: {
        pt: 'Causa 4 de dano e reduz defesa inimiga por 3 turnos.',
        en: 'Deals 4 damage and reduces enemy defense for 3 turns.',
      },
      cost: 3,
      type: 'damage_defense_down',
    },
    // Nível 10 - Habilidade: Morte Tóxica
    {
      level: 10,
      type: 'skill',
      id: 'viborom_skill_morte_toxica',
      name: { pt: 'Morte Tóxica', en: 'Toxic Death' },
      desc: {
        pt: 'Supremo: 4 de dano e aplica veneno por 5 turnos.',
        en: 'Ultimate: 4 damage and applies poison for 5 turns.',
      },
      cost: 4,
      type: 'ultimate_poison',
    },
  ],
};
