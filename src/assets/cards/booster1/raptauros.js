// Card data for Raptauros
module.exports = {
  id: 'raptauros',
  title: { pt: 'O Predador das Dunas', en: 'The Dune Predator' },
  num: 16,
  height: 2.6,
  weakness: 'agua',
  name: { pt: 'Raptauros', en: 'Raptauros' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'terra',
  img: require('../../img/creatures/raptauros_bio.webp'),
  color: 'earth',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Investida das Dunas', en: 'Dune Charge' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo. Causa dano adicional se Raptauros agir primeiro.',
        en: 'Deals 3 damage. Deals bonus damage if Raptauros acts first.',
      },
      damage: 3,
      bonusCondition: 'first',
    },
    {
      name: { pt: 'Chifre de Areia', en: 'Sand Horn' },
      cost: 2,
      desc: {
        pt: 'Causa 2 de dano e reduz defesa do alvo por 1 turno.',
        en: 'Deals 2 damage and reduces target defense for 1 turn.',
      },
      damage: 2,
      statusEffect: 'defense_down',
      duration: 1,
    },
  ],
  field: { pt: 'Dunas Infinitas', en: 'Endless Dunes' },
  fielddesc: {
    pt: 'Aliados de terra ganham +1 de ataque enquanto Raptauros estiver em campo.',
    en: 'Earth allies gain +1 attack while Raptauros is on the field.',
  },
  storyTitle: { pt: 'Fúria das Dunas', en: 'Dune Fury' },
  story: [
    {
      pt: 'Raptauros domina as tempestades de areia, caçando com precisão implacável.',
      en: 'Raptauros masters sandstorms, hunting with relentless precision.',
    },
    {
      pt: 'Seu rugido ecoa pelas dunas, espalhando medo entre os invasores.',
      en: 'Its roar echoes through the dunes, spreading fear among invaders.',
    },
    {
      pt: 'Dizem que pode atravessar desertos inteiros sem descansar.',
      en: 'It is said to cross entire deserts without rest.',
    }
  ],
  isGuardian: true,
  defaultSkills: [
    {
      id: 'raptauros_skill_investida_dunas',
      name: { pt: 'Investida das Dunas', en: 'Dune Charge' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo. Causa dano adicional se agir primeiro.',
        en: 'Deals 3 damage to the enemy. Deals bonus damage if acts first.',
      },
      cost: 1,
      type: 'damage_bonus_first',
      damage: 3,
      bonusCondition: 'first',
    },
    {
      id: 'raptauros_skill_chifre_areia',
      name: { pt: 'Chifre de Areia', en: 'Sand Horn' },
      desc: {
        pt: 'Causa 2 de dano e reduz defesa do alvo por 1 turno.',
        en: 'Deals 2 damage and reduces target defense for 1 turn.',
      },
      cost: 2,
      type: 'damage_defense_down',
      damage: 2,
      statusEffect: 'defense_down',
      duration: 1,
    },
  ],
  defaultBlessing: {
    id: 'raptauros_blessing',
    name: { pt: 'Fúria das Dunas', en: 'Dune Fury' },
    desc: {
      pt: 'Aliados de terra ganham +10% de chance de crítico.',
      en: 'Earth allies gain +10% crit chance.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Impulso Veloz
    {
      level: 2,
      type: 'perk',
      id: 'QUICK_IMPULSE',
      name: { pt: 'Impulso Veloz', en: 'Quick Impulse' },
      desc: {
        pt: 'Ganha +1 de velocidade por 2 turnos ao atacar.',
        en: 'Gains +1 speed for 2 turns when attacking.',
      },
    },
    // Nível 3 - Habilidade: Chifre Trovejante
    {
      level: 3,
      type: 'skill',
      id: 'raptauros_skill_chifre_trovejante',
      name: { pt: 'Chifre Trovejante', en: 'Thunder Horn' },
      desc: {
        pt: 'Causa 3 de dano e 50% de chance de atordoar por 1 turno.',
        en: 'Deals 3 damage and 50% chance to stun for 1 turn.',
      },
      cost: 1,
      type: 'damage_stun',
      damage: 3,
      chance: 0.5,
      statusEffect: 'stun',
      duration: 1,
    },
    // Nível 4 - Perk: Pele Resistente
    {
      level: 4,
      type: 'perk',
      id: 'TOUGH_HIDE',
      name: { pt: 'Pele Resistente', en: 'Tough Hide' },
      desc: {
        pt: 'Recebe -1 de dano de ataques físicos.',
        en: 'Takes -1 damage from physical attacks.',
      },
    },
    // Nível 5 - Habilidade: Impacto das Dunas
    {
      level: 5,
      type: 'skill',
      id: 'raptauros_skill_impacto_dunas',
      name: { pt: 'Impacto das Dunas', en: 'Dune Impact' },
      desc: {
        pt: 'Causa 2 de dano e aplica <span class="debuff-lento">lento</span> por 2 turnos.',
        en: 'Deals 2 damage and applies <span class="debuff-slow">slow</span> for 2 turns.',
      },
      cost: 1,
      type: 'damage_slow',
      damage: 2,
      statusEffect: 'slow',
      duration: 2,
    },
    // Nível 6 - Perk: Fúria Crescente
    {
      level: 6,
      type: 'perk',
      id: 'RISING_FURY',
      name: { pt: 'Fúria Crescente', en: 'Rising Fury' },
      desc: {
        pt: 'A cada ataque, aumenta o dano em +1 até o final do turno.',
        en: 'Each attack increases damage by +1 until end of turn.',
      },
    },
    // Nível 7 - Habilidade: Rugido Devastador
    {
      level: 7,
      type: 'skill',
      id: 'raptauros_skill_rugido_devastador',
      name: { pt: 'Rugido Devastador', en: 'Devastating Roar' },
      desc: {
        pt: 'Causa 4 de dano e ignora escudo.',
        en: 'Deals 4 damage and ignores shield.',
      },
      cost: 2,
      type: 'damage_shieldpierce',
      damage: 4,
    },
    // Nível 8 - Perk: Instinto Selvagem
    {
      level: 8,
      type: 'perk',
      id: 'WILD_INSTINCT',
      name: { pt: 'Instinto Selvagem', en: 'Wild Instinct' },
      desc: {
        pt: 'Ganha +1 de esquiva ao receber dano.',
        en: 'Gains +1 evasion when taking damage.',
      },
    },
    // Nível 9 - Habilidade: Tempestade de Areia
    {
      level: 9,
      type: 'skill',
      id: 'raptauros_skill_tempestade_areia',
      name: { pt: 'Tempestade de Areia', en: 'Sandstorm' },
      desc: {
        pt: 'Causa 2 de dano a todos os inimigos e reduz precisão por 1 turno.',
        en: 'Deals 2 damage to all enemies and reduces accuracy for 1 turn.',
      },
      cost: 3,
      type: 'aoe_damage_accuracy_down',
      damage: 2,
      statusEffect: 'accuracy_down',
      duration: 1,
    },
    // Nível 10 - Habilidade: Domínio das Dunas
    {
      level: 10,
      type: 'skill',
      id: 'raptauros_skill_dominio_dunas',
      name: { pt: 'Domínio das Dunas', en: 'Dune Dominion' },
      desc: {
        pt: 'Supremo: 4 de dano e aumenta defesa de todos os aliados por 3 turnos.',
        en: 'Ultimate: 4 damage and increases defense of all allies for 3 turns.',
      },
      cost: 3,
      type: 'damage_team_defense_buff',
      damage: 4,
      teamBuff: { stat: 'defense', value: 1, duration: 3 },
    },
  ],
};
