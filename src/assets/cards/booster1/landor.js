// Card data for Landor
module.exports = {
  id: 'landor',
  title: { pt: 'Vento do Norte', en: 'Northern Wind' },
  num: 15,
  height: 1.8,
  weakness: 'terra',
  name: { pt: 'Landor', en: 'Landor' },
  type: { pt: 'Ave', en: 'Bird' },
  element: 'ar',
  img: require('../../img/creatures/landor_bio.webp'),
  color: 'air',
  hp: 4,
  abilities: [
    {
      name: { pt: 'Lâmina do Norte', en: 'Northern Blade' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo com ventos cortantes.',
        en: 'Deals 3 damage to the enemy with cutting winds.',
      },
      damage: 3,
    },
    {
      name: { pt: 'Rajada Ascendente', en: 'Updraft Gust' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano e empurra o inimigo, reduzindo sua eficácia no próximo turno.',
        en: 'Deals 2 damage and disrupts the enemy, reducing its effectiveness next turn.',
      },
      damage: 2,
      statusEffect: 'disrupt',
      duration: 1,
    },
  ],
  field: { pt: 'Correntes Boreais', en: 'Boreal Currents' },
  fielddesc: {
    pt: 'Aumenta a velocidade das criaturas de ar em 3% enquanto Landor estiver em campo.',
    en: 'Increases air creatures speed by 3% while Landor is on the field.',
  },
  storyTitle: { pt: 'O Guardião dos Ventos', en: 'Guardian of the Winds' },
  story: [
    {
      pt: 'Landor vaga pelos céus do norte, guiando correntes invisíveis com precisão ancestral.',
      en: 'Landor roams the northern skies, guiding invisible currents with ancient precision.',
    },
    {
      pt: 'Seu voo silencioso é sentido antes de ser visto, anunciando mudança e movimento.',
      en: 'Its silent flight is felt before it is seen, heralding change and motion.',
    },
  ],
  isGuardian: true,
  defaultSkills: [
    {
      id: 'landor_skill_1',
      name: { pt: 'Lâmina do Norte', en: 'Northern Blade' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo com ventos cortantes.',
        en: 'Deals 3 damage to the enemy with cutting winds.',
      },
      cost: 1,
      type: 'damage',
      damage: 3,
    },
    {
      id: 'landor_skill_2',
      name: { pt: 'Rajada Ascendente', en: 'Updraft Gust' },
      desc: {
        pt: 'Causa 2 de dano e empurra o inimigo, reduzindo sua eficácia no próximo turno.',
        en: 'Deals 2 damage and disrupts the enemy, reducing its effectiveness next turn.',
      },
      cost: 1,
      type: 'damage_disrupt',
      damage: 2,
      statusEffect: 'disrupt',
      duration: 1,
    },
  ],
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Voo Ágil
    {
      level: 2,
      type: 'perk',
      id: 'AGILE_FLIGHT',
      name: { pt: 'Voo Ágil', en: 'Agile Flight' },
      desc: {
        pt: 'Ao ser invocado, ganha +1 de velocidade por 2 turnos.',
        en: 'When summoned, gains +1 speed for 2 turns.',
      },
    },
    // Nível 3 - Habilidade: Folha Cortante
    {
      level: 3,
      type: 'skill',
      id: 'landor_skill_folha_cortante',
      name: { pt: 'Folha Cortante', en: 'Cutting Leaf' },
      desc: {
        pt: 'Causa 2 de dano e 50% de chance de aplicar sangramento por 2 turnos.',
        en: 'Deals 2 damage and 50% chance to apply bleed for 2 turns.',
      },
      cost: 1,
      type: 'damage_bleed',
      damage: 2,
      chance: 0.5,
      statusEffect: 'bleed',
      duration: 2,
    },
    // Nível 4 - Perk: Cura Natural
    {
      level: 4,
      type: 'perk',
      id: 'NATURAL_HEAL',
      name: { pt: 'Cura Natural', en: 'Natural Heal' },
      desc: {
        pt: 'Recupera 1 de vida no início do turno se estiver com menos de metade do HP.',
        en: 'Recovers 1 HP at the start of the turn if below half HP.',
      },
    },
    // Nível 5 - Habilidade: Raízes Prendentes
    {
      level: 5,
      type: 'skill',
      id: 'landor_skill_raizes_prendentes',
      name: { pt: 'Raízes Prendentes', en: 'Binding Roots' },
      desc: {
        pt: 'Aplica <span class="debuff-root">enraizar</span> por 2 turnos (não pode trocar de lugar).',
        en: 'Applies <span class="debuff-root">root</span> for 2 turns (cannot swap position).',
      },
      cost: 1,
      type: 'apply_root',
      statusEffect: 'root',
      duration: 2,
    },
    // Nível 6 - Perk: Inspiração Verdejante
    {
      level: 6,
      type: 'perk',
      id: 'VERDANT_INSPIRATION',
      name: { pt: 'Inspiração Verdejante', en: 'Verdant Inspiration' },
      desc: {
        pt: 'Aliados de planta ganham +1 de ataque por 1 turno ao entrarem em campo.',
        en: 'Plant allies gain +1 attack for 1 turn when summoned.',
      },
    },
    // Nível 7 - Habilidade: Cura Profunda
    {
      level: 7,
      type: 'skill',
      id: 'landor_skill_cura_profunda',
      name: { pt: 'Cura Profunda', en: 'Deep Heal' },
      desc: {
        pt: 'Cura 3 de vida e remove todos os debuffs.',
        en: 'Heals 3 HP and removes all debuffs.',
      },
      cost: 2,
      type: 'heal_cleanse',
      heal: 3,
    },
    // Nível 8 - Perk: Casca Protetora
    {
      level: 8,
      type: 'perk',
      id: 'PROTECTIVE_BARK',
      name: { pt: 'Casca Protetora', en: 'Protective Bark' },
      desc: {
        pt: 'Recebe -1 de dano de ataques físicos.',
        en: 'Takes -1 damage from physical attacks.',
      },
    },
    // Nível 9 - Habilidade: Tempestade de Espinhos
    {
      level: 9,
      type: 'skill',
      id: 'landor_skill_tempestade_espinhos',
      name: { pt: 'Tempestade de Espinhos', en: 'Thornstorm' },
      desc: {
        pt: 'Causa 3 de dano a todos os inimigos.',
        en: 'Deals 3 damage to all enemies.',
      },
      cost: 3,
      type: 'aoe_damage',
      damage: 3,
    },
    // Nível 10 - Habilidade: Renascimento
    {
      level: 10,
      type: 'skill',
      id: 'landor_skill_renascimento',
      name: { pt: 'Renascimento', en: 'Rebirth' },
      desc: {
        pt: 'Revive com 3 de vida ao morrer (1 vez por partida).',
        en: 'Revives with 3 HP upon death (once per match).',
      },
      cost: 0,
      type: 'self_revive',
    },
  ],
};
