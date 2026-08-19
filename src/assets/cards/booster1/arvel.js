// Card data for Arvel
module.exports = {
  id: 'arvel',
  num: 43,
  height: 4.5,
  weakness: 'terra',
  name: { pt: 'Arvel', en: 'Arvel' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'ar',
  img: require('../../img/creatures/arvel_bio.webp'),
  color: 'air',
  hp: 9,
  abilities: [
    {
      name: { pt: 'Investida do Vendaval', en: 'Gale Charge' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Escamas do Vento', en: 'Wind Scales' },
      cost: 1,
      desc: {
        pt: 'Enrijece as escamas contra o vento, concedendo 2 de escudo imediato.',
        en: 'Hardens its scales against the wind, granting 2 shield instantly.',
      },
    },
  ],
  field: { pt: 'Pico Celestial', en: 'Celestial Peak' },
  fielddesc: {
    pt: 'Criaturas de ar recebem +1 de defesa enquanto Arvel estiver em campo.',
    en: 'Air creatures gain +1 defense while Arvel is on the field.',
  },
  storyTitle: { pt: 'O Bastião dos Ares', en: 'The Bastion of the Skies' },
  story: [
    {
      pt: 'Arvel vigia os picos mais altos, onde nenhuma criatura ousa desafiar seus domínios.',
      en: 'Arvel watches over the highest peaks, where no creature dares challenge its domain.',
    },
    {
      pt: 'Suas escamas resistem a tempestades que despedaçariam qualquer outra criatura.',
      en: 'Its scales withstand storms that would tear any other creature apart.',
    },
    {
      pt: 'Diz-se que seu rugido ecoa como um aviso a todos que ameaçam os céus.',
      en: 'It is said that its roar echoes as a warning to all who threaten the skies.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'arvel_skill_1',
      name: { pt: 'Investida do Vendaval', en: 'Gale Charge' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'arvel_skill_2',
      name: { pt: 'Escamas do Vento', en: 'Wind Scales' },
      desc: {
        pt: 'Concede 2 de escudo a si mesmo.',
        en: 'Grants itself 2 shield.',
      },
      cost: 1,
      type: 'shield',
    },
  ],
  defaultBlessing: {
    id: 'arvel_blessing',
    name: { pt: 'Vento Repulsor', en: 'Repelling Wind' },
    desc: {
      pt: 'Ao ser invocado, devolve 1 carta do adversário em campo para a mão dele.',
      en: "When summoned, returns 1 of the opponent's cards on the field to their hand.",
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Vigília Alada
    {
      level: 2,
      type: 'perk',
      id: 'SKYBORN_VIGIL',
      name: { pt: 'Vigília Alada', en: 'Skyborn Vigil' },
      desc: {
        pt: 'Ganha +1 defesa no primeiro turno de batalha.',
        en: 'Gains +1 defense on the first turn of battle.',
      },
    },
    // Nível 3 - Habilidade: Rajada Cortante
    {
      level: 3,
      type: 'skill',
      id: 'arvel_skill_3',
      name: { pt: 'Rajada Cortante', en: 'Cutting Gust' },
      desc: {
        pt: 'Causa 2 de dano e reduz a velocidade inimiga por 1 turno.',
        en: "Deals 2 damage and reduces the enemy's speed for 1 turn.",
      },
      cost: 1,
      effectType: 'damage_debuff',
    },
    // Nível 4 - Perk: Escamas de Pedra
    {
      level: 4,
      type: 'perk',
      id: 'STONE_SCALES',
      name: { pt: 'Escamas de Pedra', en: 'Stone Scales' },
      desc: {
        pt: 'Reduz em 1 o dano recebido de ataques físicos.',
        en: 'Reduces damage taken from physical attacks by 1.',
      },
    },
    // Nível 5 - Habilidade: Fúria da Tempestade
    {
      level: 5,
      type: 'skill',
      id: 'arvel_skill_4',
      name: { pt: 'Fúria da Tempestade', en: 'Storm Fury' },
      desc: {
        pt: 'Causa 3 de dano e concede 2 de escudo.',
        en: 'Deals 3 damage and grants 2 shield.',
      },
      cost: 2,
      effectType: 'damage_shield',
    },
    // Nível 6 - Perk: Instinto de Guardião
    {
      level: 6,
      type: 'perk',
      id: 'GUARDIAN_INSTINCT',
      name: { pt: 'Instinto de Guardião', en: 'Guardian Instinct' },
      desc: {
        pt: 'Aliados recebem +1 defesa quando Arvel está em campo.',
        en: 'Allies gain +1 defense while Arvel is on the field.',
      },
    },
    // Nível 7 - Habilidade: Grito do Bastião
    {
      level: 7,
      type: 'skill',
      id: 'arvel_skill_5',
      name: { pt: 'Grito do Bastião', en: "Bastion's Roar" },
      desc: {
        pt: 'Causa 4 de dano e atordoa o inimigo por 1 turno.',
        en: 'Deals 4 damage and stuns the enemy for 1 turn.',
      },
      cost: 2,
      effectType: 'damage_stun',
    },
    // Nível 8 - Perk: Muralha Inabalável
    {
      level: 8,
      type: 'perk',
      id: 'UNYIELDING_WALL',
      name: { pt: 'Muralha Inabalável', en: 'Unyielding Wall' },
      desc: {
        pt: 'Ao receber dano crítico, ganha 1 de escudo.',
        en: 'When taking critical damage, gain 1 shield.',
      },
    },
    // Nível 9 - Habilidade: Vórtice Ancestral
    {
      level: 9,
      type: 'skill',
      id: 'arvel_skill_6',
      name: { pt: 'Vórtice Ancestral', en: 'Ancestral Vortex' },
      desc: {
        pt: 'Causa 3 de dano e concede escudo a todos os aliados por 2 turnos.',
        en: 'Deals 3 damage and grants shield to all allies for 2 turns.',
      },
      cost: 3,
      effectType: 'team_shield',
    },
    // Nível 10 - Habilidade: Fúria do Bastião Eterno
    {
      level: 10,
      type: 'skill',
      id: 'arvel_skill_7',
      name: { pt: 'Fúria do Bastião Eterno', en: "Eternal Bastion's Fury" },
      desc: {
        pt: 'Supremo: 4 de dano e concede escudo massivo por 3 turnos.',
        en: 'Ultimate: 4 damage and grants massive shield for 3 turns.',
      },
      cost: 4,
      effectType: 'ultimate_shield',
    },
  ],
};
