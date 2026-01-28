// Card data for Sunburst
module.exports = {
  id: 'sunburst',
  num: 14,
  height: 1.4,
  weakness: 'terra',
  name: { pt: 'Sunburst', en: 'Sunburst' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'agua',
  img: require('../../img/creatures/sunburst_bio.webp'),
  color: 'water',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Explosão Solar', en: 'Solar Burst' },
      cost: 1,
      desc: {
        pt: 'Libera energia acumulada causando 3 de dano.',
        en: 'Releases stored energy dealing 3 damage.',
      },
    },
    {
      name: { pt: 'Luz Drenante', en: 'Draining Light' },
      cost: 1,
      desc: {
        pt: 'Drena 2 de vida do inimigo à noite.',
        en: 'Drains 2 HP from the enemy at night.',
      },
    },
  ],
  field: { pt: 'Pântano Luminescente', en: 'Luminescent Swamp' },
  fielddesc: {
    pt: 'Criaturas sombrias causam +1 de dano por turno enquanto Sunburst estiver em campo.',
    en: 'Shadow creatures deal +1 damage per turn while Sunburst is on the field.',
  },
  storyTitle: { pt: 'O Predador Solar', en: 'The Solar Predator' },
  story: [
    {
      pt: 'Sunburst absorve luz solar durante o dia para armazenar energia.',
      en: 'Sunburst absorbs sunlight during the day to store energy.',
    },
    {
      pt: 'À noite, usa seu brilho fosforescente para confundir e capturar presas.',
      en: 'At night, it uses its phosphorescent glow to confuse and capture prey.',
    },
    {
      pt: 'Seu brilho pode ser visto à distância, muitas vezes confundido com luzes guias.',
      en: 'Its glow can be seen from afar, often mistaken for guiding lights.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'sunburst_skill_1',
      name: { pt: 'Raio Solar', en: 'Solar Ray' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo com raios de luz.',
        en: 'Deals 3 damage to the enemy with light rays.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'sunburst_skill_2',
      name: { pt: 'Explosão Luminosa', en: 'Light Burst' },
      desc: {
        pt: 'Causa 2 de dano e cega o inimigo por 1 turno.',
        en: 'Deals 2 damage and blinds the enemy for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'sunburst_blessing',
    name: { pt: 'Radiância Solar', en: 'Solar Radiance' },
    desc: {
      pt: 'Criaturas de luz ganham +3% de ataque enquanto Sunburst estiver em campo.',
      en: 'Light creatures gain +3% attack while Sunburst is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Brilho Noturno
    {
      level: 2,
      type: 'perk',
      id: 'NIGHT_GLEAM',
      name: { pt: 'Brilho Noturno', en: 'Night Gleam' },
      desc: {
        pt: 'À noite, ganha +1 ataque e +1 esquiva.',
        en: 'At night, gain +1 attack and +1 evasion.',
      },
    },
    // Nível 3 - Habilidade: Purificação
    {
      level: 3,
      type: 'skill',
      id: 'sunburst_skill_purificacao',
      name: { pt: 'Purificação', en: 'Purification' },
      desc: {
        pt: 'Causa 2 de dano e remove buffs inimigos.',
        en: 'Deals 2 damage and removes enemy buffs.',
      },
      cost: 1,
      type: 'damage_dispel',
    },
    // Nível 4 - Perk: Radiação Solar
    {
      level: 4,
      type: 'perk',
      id: 'SOLAR_RADIANCE',
      name: { pt: 'Radiação Solar', en: 'Solar Radiance' },
      desc: {
        pt: 'Durante o dia, aliados ganham +1 ataque.',
        en: 'During the day, allies gain +1 attack.',
      },
    },
    // Nível 5 - Habilidade: Labareda Solar
    {
      level: 5,
      type: 'skill',
      id: 'sunburst_skill_labareda_solar',
      name: { pt: 'Labareda Solar', en: 'Solar Flare' },
      desc: {
        pt: 'Causa 3 de dano e causa dano extra por 2 turnos.',
        en: 'Deals 3 damage and deals extra damage for 2 turns.',
      },
      cost: 2,
      type: 'damage_dot',
    },
    // Nível 6 - Perk: Luz Protetora
    {
      level: 6,
      type: 'perk',
      id: 'PROTECTIVE_LIGHT',
      name: { pt: 'Luz Protetora', en: 'Protective Light' },
      desc: {
        pt: 'Aliados recebem -1 de dano de habilidades de sombra.',
        en: 'Allies take -1 damage from shadow abilities.',
      },
    },
    // Nível 7 - Habilidade: Fúria do Sol
    {
      level: 7,
      type: 'skill',
      id: 'sunburst_skill_furia_sol',
      name: { pt: 'Fúria do Sol', en: "Sun's Fury" },
      desc: {
        pt: 'Causa 4 de dano e aumenta ataque temporariamente.',
        en: 'Deals 4 damage and temporarily increases attack.',
      },
      cost: 2,
      type: 'damage_buff',
    },
    // Nível 8 - Perk: Luz Persistente
    {
      level: 8,
      type: 'perk',
      id: 'PERSISTENT_LIGHT',
      name: { pt: 'Luz Persistente', en: 'Persistent Light' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 1 de vida.',
        en: 'When defeating an enemy, recover 1 HP.',
      },
    },
    // Nível 9 - Habilidade: Aura Solar
    {
      level: 9,
      type: 'skill',
      id: 'sunburst_skill_aura_solar',
      name: { pt: 'Aura Solar', en: 'Solar Aura' },
      desc: {
        pt: 'Cria uma aura que aumenta defesa de todos aliados por 3 turnos.',
        en: 'Creates an aura that increases defense of all allies for 3 turns.',
      },
      cost: 3,
      type: 'team_defense_buff',
    },
    // Nível 10 - Habilidade: Apoteose Solar
    {
      level: 10,
      type: 'skill',
      id: 'sunburst_skill_apoteose_solar',
      name: { pt: 'Apoteose Solar', en: 'Solar Apotheosis' },
      desc: {
        pt: 'Supremo: 4 de dano e purifica o campo de batalha.',
        en: 'Ultimate: 4 damage and purifies the battlefield.',
      },
      cost: 4,
      type: 'ultimate_dispel',
    },
  ],
};
