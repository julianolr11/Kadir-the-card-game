// Card data for Whalar
module.exports = {
  id: 'whalar',
  title: {
    pt: 'O Predador Noturno das Marés',
    en: 'The Nocturnal Tide Predator',
  },
  num: 23,
  height: 4.5,
  weakness: 'ar',
  name: { pt: 'Whalar', en: 'Whalar' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'agua',
  img: require('../../img/creatures/whalar_bio.webp'),
  color: 'water',
  hp: 12,
  abilities: [
    {
      name: { pt: 'Caçada Silenciosa', en: 'Silent Hunt' },
      cost: 1,
      desc: {
        pt: 'Ataca primeiro se estiver à noite ou em campo sombrio.',
        en: 'Attacks first if it is night or on a shadow field.',
      },
    },
    {
      name: { pt: 'Mordida Abissal', en: 'Abyssal Bite' },
      cost: 2,
      desc: {
        pt: 'Ignora 1 ponto de defesa do alvo ao atacar e causa <span class="debuff-sangramento">sangramento</span> por 2 turnos.',
        en: 'Ignores 1 defense point of the target when attacking and causes <span class="debuff-bleed">bleed</span> for 2 turns.',
      },
    },
  ],
  field: { pt: 'Maré Sombria', en: 'Shadow Tide' },
  fielddesc: {
    pt: 'Enquanto Whalar estiver em campo, criaturas sombrias de água recebem +1 ataque.',
    en: 'While Whalar is on the field, shadow water creatures gain +1 attack.',
  },
  storyTitle: {
    pt: 'Lenda do Caçador das Ondas',
    en: 'Legend of the Wave Hunter',
  },
  story: [
    {
      pt: 'Whalar patrulha as marés escuras, caçando silenciosamente sob o véu da noite.',
      en: 'Whalar patrols the dark tides, hunting silently under the cover of night.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'whalar_skill_1',
      name: { pt: 'Onda Gelada', en: 'Frozen Wave' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo com água congelada.',
        en: 'Deals 3 damage to the enemy with frozen water.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'whalar_skill_2',
      name: { pt: 'Prisão de Gelo', en: 'Ice Prison' },
      desc: {
        pt: 'Causa 2 de dano e congela o inimigo por 1 turno.',
        en: 'Deals 2 damage and freezes the enemy for 1 turn.',
      },
      cost: 1,
      type: 'damage_stun',
    },
  ],
  defaultBlessing: {
    id: 'whalar_blessing',
    name: { pt: 'Onda Abissal', en: 'Abyssal Wave' },
    desc: {
      pt: 'Ao ser invocado, cria uma onda que causa 1 de dano a todas as criaturas adversárias.',
      en: 'When summoned, creates a wave that deals 1 damage to all enemy creatures.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Caçador Noturno
    {
      level: 2,
      type: 'perk',
      id: 'NIGHT_HUNTER',
      name: { pt: 'Caçador Noturno', en: 'Night Hunter' },
      desc: {
        pt: 'À noite, ganha +1 ataque e +1 esquiva.',
        en: 'At night, gain +1 attack and +1 evasion.',
      },
    },
    // Nível 3 - Habilidade: Espículo de Gelo
    {
      level: 3,
      type: 'skill',
      id: 'whalar_skill_espiculo_gelo',
      name: { pt: 'Espículo de Gelo', en: 'Ice Spike' },
      desc: {
        pt: 'Causa 2 de dano com espículos congelados.',
        en: 'Deals 2 damage with frozen spikes.',
      },
      cost: 1,
      effectType: 'damage',
    },
    // Nível 4 - Perk: Resistência Abissal
    {
      level: 4,
      type: 'perk',
      id: 'ABYSSAL_RESISTANCE',
      name: { pt: 'Resistência Abissal', en: 'Abyssal Resistance' },
      desc: {
        pt: 'Recebe -1 de dano de gelo por 2 turnos ao entrar em campo.',
        en: 'Takes -1 ice damage for 2 turns when summoned.',
      },
    },
    // Nível 5 - Habilidade: Blizzard
    {
      level: 5,
      type: 'skill',
      id: 'whalar_skill_blizzard',
      name: { pt: 'Blizzard', en: 'Blizzard' },
      desc: {
        pt: 'Causa 3 de dano e reduz velocidade inimiga por 2 turnos.',
        en: 'Deals 3 damage and reduces enemy speed for 2 turns.',
      },
      cost: 2,
      effectType: 'damage_slow',
    },
    // Nível 6 - Perk: Fôlego das Profundezas
    {
      level: 6,
      type: 'perk',
      id: 'DEEP_BREATH',
      name: { pt: 'Fôlego das Profundezas', en: 'Deep Breath' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 1 de vida.',
        en: 'When defeating an enemy, recover 1 HP.',
      },
    },
    // Nível 7 - Habilidade: Fúria do Abismo
    {
      level: 7,
      type: 'skill',
      id: 'whalar_skill_furia_abismo',
      name: { pt: 'Fúria do Abismo', en: 'Abyss Fury' },
      desc: {
        pt: 'Causa 4 de dano com a força das profundezas.',
        en: 'Deals 4 damage with the force of the depths.',
      },
      cost: 2,
      effectType: 'damage',
    },
    // Nível 8 - Perk: Maré Protetora
    {
      level: 8,
      type: 'perk',
      id: 'PROTECTIVE_TIDE',
      name: { pt: 'Maré Protetora', en: 'Protective Tide' },
      desc: {
        pt: 'Aliados ganham +1 defesa enquanto Whalar estiver em campo.',
        en: 'Allies gain +1 defense while Whalar is on the field.',
      },
    },
    // Nível 9 - Habilidade: Âncora Gelada
    {
      level: 9,
      type: 'skill',
      id: 'whalar_skill_ancora_gelada',
      name: { pt: 'Âncora Gelada', en: 'Frozen Anchor' },
      desc: {
        pt: 'Causa 4 de dano e prende o inimigo por 2 turnos.',
        en: 'Deals 4 damage and binds the enemy for 2 turns.',
      },
      cost: 3,
      effectType: 'damage_bind',
    },
    // Nível 10 - Habilidade: Cataclisma Aquático
    {
      level: 10,
      type: 'skill',
      id: 'whalar_skill_cataclisma_aquatico',
      name: { pt: 'Cataclisma Aquático', en: 'Aquatic Cataclysm' },
      desc: {
        pt: 'Supremo: 4 de dano e congela inimigos por 2 turnos.',
        en: 'Ultimate: 4 damage and freezes enemies for 2 turns.',
      },
      cost: 4,
      effectType: 'ultimate_freeze',
    },
  ],
};
