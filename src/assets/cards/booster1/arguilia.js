// Card data for Arguilia
module.exports = {
  id: 'arguilia',
  title: { pt: 'Espírito Ancestral do Rio', en: 'Ancestral River Spirit' },
  num: 17,
  height: 2.4,
  weakness: 'terra',
  name: { pt: 'Arguilia', en: 'Arguilia' },
  type: { pt: 'Ave', en: 'Bird' },
  element: 'agua',
  img: require('../../img/creatures/arguilia_bio.webp'),
  color: 'water',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Asas do Fluxo', en: 'Wings of Flow' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e concede esquiva aumentada neste turno.',
        en: 'Deals 3 damage and grants increased evasion this turn.',
      },
    },
    {
      name: { pt: 'Véu das Águas', en: 'Veil of Waters' },
      cost: 1,
      desc: {
        pt: 'Aliados recebem redução de dano por 1 turno.',
        en: 'Allies receive damage reduction for 1 turn.',
      },
    },
  ],
  field: { pt: 'Rio Sagrado', en: 'Sacred River' },
  fielddesc: {
    pt: 'Criaturas de água recebem 3% menos dano enquanto Arguilia estiver em campo.',
    en: 'Water creatures take 3% less damage while Arguilia is on the field.',
  },
  storyTitle: {
    pt: 'A Voz dos Rios Eternos',
    en: 'The Voice of Eternal Rivers',
  },
  story: [
    {
      pt: 'Arguilia é um espírito antigo que nasce onde rios sagrados cruzam terras intocadas.',
      en: 'Arguilia is an ancient spirit born where sacred rivers cross untouched lands.',
    },
    {
      pt: 'Seu canto guia viajantes, purifica águas corrompidas e mantém o equilíbrio do mundo.',
      en: 'Its song guides travelers, purifies corrupted waters, and preserves the balance of the world.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'arguilia_skill_1',
      name: { pt: 'Picada Envenenada', en: 'Poisoned Bite' },
      desc: {
        pt: 'Causa 3 de dano e envenena o inimigo.',
        en: 'Deals 3 damage and poisons the enemy.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'arguilia_skill_2',
      name: { pt: 'Teia Venenosa', en: 'Venomous Web' },
      desc: {
        pt: 'Causa 2 de dano e reduz velocidade do inimigo.',
        en: 'Deals 2 damage and reduces enemy speed.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'arguilia_blessing',
    name: { pt: 'Vitalidade das Águas', en: 'Waters Vitality' },
    desc: {
      pt: 'Ao ser invocada, todas as criaturas de água em campo ganham +1 de vida.',
      en: 'When summoned, all water creatures on the field gain +1 HP.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Fluidez Ancestral
    {
      level: 2,
      type: 'perk',
      id: 'ANCIENT_FLUIDITY',
      name: { pt: 'Fluidez Ancestral', en: 'Ancient Fluidity' },
      desc: {
        pt: 'Ao entrar em campo, ganha +1 esquiva por 2 turnos.',
        en: 'When summoned, gain +1 evasion for 2 turns.',
      },
    },
    // Nível 3 - Habilidade: Neurotoxina
    {
      level: 3,
      type: 'skill',
      id: 'arguilia_skill_neurotoxina',
      name: { pt: 'Neurotoxina', en: 'Neurotoxin' },
      desc: {
        pt: 'Causa 2 de dano e paralisa o inimigo por 1 turno.',
        en: 'Deals 2 damage and paralyzes the enemy for 1 turn.',
      },
      cost: 1,
      type: 'damage_paralyze',
    },
    // Nível 4 - Perk: Imunidade Tóxica
    {
      level: 4,
      type: 'perk',
      id: 'TOXIC_IMMUNITY',
      name: { pt: 'Imunidade Tóxica', en: 'Toxic Immunity' },
      desc: {
        pt: 'Recebe -50% de dano de veneno.',
        en: 'Takes -50% poison damage.',
      },
    },
    // Nível 5 - Habilidade: Enxame Tóxico
    {
      level: 5,
      type: 'skill',
      id: 'arguilia_skill_enxame_toxico',
      name: { pt: 'Enxame Tóxico', en: 'Toxic Swarm' },
      desc: {
        pt: 'Causa 2 de dano a todos os inimigos e aplica veneno por 2 turnos.',
        en: 'Deals 2 damage to all enemies and applies poison for 2 turns.',
      },
      cost: 2,
      type: 'aoe_poison',
    },
    // Nível 6 - Perk: Rio Curativo
    {
      level: 6,
      type: 'perk',
      id: 'HEALING_RIVER',
      name: { pt: 'Rio Curativo', en: 'Healing River' },
      desc: {
        pt: 'Ao derrotar um inimigo, cura 1 de vida.',
        en: 'When defeating an enemy, heal 1 HP.',
      },
    },
    // Nível 7 - Habilidade: Véu das Águas
    {
      level: 7,
      type: 'skill',
      id: 'arguilia_skill_veu_aguas',
      name: { pt: 'Véu das Águas', en: 'Veil of Waters' },
      desc: {
        pt: 'Concede escudo de água (absorve 2 de dano) a todos aliados por 2 turnos.',
        en: 'Grants water shield (absorbs 2 damage) to all allies for 2 turns.',
      },
      cost: 2,
      type: 'team_shield',
    },
    // Nível 8 - Perk: Veneno Persistente
    {
      level: 8,
      type: 'perk',
      id: 'PERSISTENT_POISON',
      name: { pt: 'Veneno Persistente', en: 'Persistent Poison' },
      desc: {
        pt: 'Veneno causado por Arguilia dura +1 turno.',
        en: 'Poison caused by Arguilia lasts +1 turn.',
      },
    },
    // Nível 9 - Habilidade: Praga do Rio
    {
      level: 9,
      type: 'skill',
      id: 'arguilia_skill_praga_rio',
      name: { pt: 'Praga do Rio', en: 'River Plague' },
      desc: {
        pt: 'Causa 3 de dano. Se o alvo estiver envenenado, causa +1 de dano.',
        en: 'Deals 3 damage. If the target is poisoned, deal +1 damage.',
      },
      cost: 2,
      type: 'damage_poison_bonus',
    },
    // Nível 10 - Habilidade: Praga Apocalíptica
    {
      level: 10,
      type: 'skill',
      id: 'arguilia_skill_praga_apocaliptica',
      name: { pt: 'Praga Apocalíptica', en: 'Apocalyptic Plague' },
      desc: {
        pt: 'Causa 4 de dano e aplica veneno permanente até o fim do combate.',
        en: 'Deals 4 damage and applies permanent poison until combat ends.',
      },
      cost: 3,
      type: 'ultimate_poison',
    },
  ],
};
