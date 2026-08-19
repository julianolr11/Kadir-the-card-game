// Card data for Igrazar
module.exports = {
  id: 'igrazar',
  num: 45,
  height: 1.4,
  weakness: 'agua',
  name: { pt: 'Igrazar', en: 'Igrazar' },
  type: { pt: 'Reptiloide', en: 'Reptiloid' },
  element: 'fogo',
  img: require('../../img/creatures/igrazar_bio.webp'),
  // Arte é um retrato bem mais alto que o quadro do card (1122x1402) com a cabeça já perto do
  // topo da imagem — o corte central padrão cortava a cabeça/chifres. Desloca o corte pra cima.
  imgPosition: 'center 18%',
  color: 'fire',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Chama Rastejante', en: 'Crawling Flame' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano ao inimigo.',
        en: 'Deals 2 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Escamas Incandescentes', en: 'Incandescent Scales' },
      cost: 1,
      desc: {
        pt: 'Causa 1 de dano contínuo por 2 turnos.',
        en: 'Deals 1 damage over time for 2 turns.',
      },
    },
  ],
  field: { pt: 'Fenda Vulcânica', en: 'Volcanic Fissure' },
  fielddesc: {
    pt: 'Criaturas de fogo ganham +1 ataque enquanto Igrazar estiver em campo.',
    en: 'Fire creatures gain +1 attack while Igrazar is on the field.',
  },
  storyTitle: { pt: 'O Lagarto das Fendas Vulcânicas', en: 'The Lizard of the Volcanic Fissures' },
  story: [
    {
      pt: 'Igrazar rasteja entre rochas incandescentes, imune ao calor que consome tudo ao redor.',
      en: 'Igrazar crawls among glowing rocks, immune to the heat that consumes everything around it.',
    },
    {
      pt: 'Suas escamas armazenam calor e o liberam em rajadas repentinas contra intrusos.',
      en: 'Its scales store heat and release it in sudden bursts against intruders.',
    },
    {
      pt: 'Vive nas fendas mais profundas dos vulcões, onde poucos ousam se aventurar.',
      en: 'It lives in the deepest fissures of volcanoes, where few dare to venture.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'igrazar_skill_1',
      name: { pt: 'Chama Rastejante', en: 'Crawling Flame' },
      desc: {
        pt: 'Causa 2 de dano ao inimigo.',
        en: 'Deals 2 damage to the enemy.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'igrazar_skill_2',
      name: { pt: 'Escamas Incandescentes', en: 'Incandescent Scales' },
      desc: {
        pt: 'Causa 1 de dano contínuo por 2 turnos.',
        en: 'Deals 1 damage over time for 2 turns.',
      },
      cost: 1,
      type: 'damage_dot',
    },
  ],
  defaultBlessing: {
    id: 'igrazar_blessing',
    name: { pt: 'Fagulha Vulcânica', en: 'Volcanic Spark' },
    desc: {
      pt: 'Ao ser invocado, causa 1 de dano a uma criatura aleatória no campo adversário.',
      en: "When summoned, deals 1 damage to a random creature on the opponent's field.",
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Escamas de Brasa
    {
      level: 2,
      type: 'perk',
      id: 'EMBER_SCALES',
      name: { pt: 'Escamas de Brasa', en: 'Ember Scales' },
      desc: {
        pt: 'Ganha +1 ataque no primeiro turno de batalha.',
        en: 'Gains +1 attack on the first turn of battle.',
      },
    },
    // Nível 3 - Habilidade: Lambida de Fogo
    {
      level: 3,
      type: 'skill',
      id: 'igrazar_skill_3',
      name: { pt: 'Lambida de Fogo', en: 'Flame Lick' },
      desc: {
        pt: 'Causa 2 de dano e queima o inimigo por 1 turno.',
        en: 'Deals 2 damage and burns the enemy for 1 turn.',
      },
      cost: 1,
      effectType: 'damage_dot',
    },
    // Nível 4 - Perk: Pele de Magma
    {
      level: 4,
      type: 'perk',
      id: 'MAGMA_HIDE',
      name: { pt: 'Pele de Magma', en: 'Magma Hide' },
      desc: {
        pt: 'Reduz em 1 o dano recebido de habilidades de água.',
        en: 'Reduces damage taken from water abilities by 1.',
      },
    },
    // Nível 5 - Habilidade: Investida Incandescente
    {
      level: 5,
      type: 'skill',
      id: 'igrazar_skill_4',
      name: { pt: 'Investida Incandescente', en: 'Incandescent Charge' },
      desc: {
        pt: 'Causa 3 de dano e aumenta o ataque por 2 turnos.',
        en: 'Deals 3 damage and increases attack for 2 turns.',
      },
      cost: 2,
      effectType: 'damage_buff',
    },
    // Nível 6 - Perk: Instinto Vulcânico
    {
      level: 6,
      type: 'perk',
      id: 'VOLCANIC_INSTINCT',
      name: { pt: 'Instinto Vulcânico', en: 'Volcanic Instinct' },
      desc: {
        pt: 'Aliados de fogo recebem +1 ataque quando Igrazar está em campo.',
        en: 'Fire allies gain +1 attack while Igrazar is on the field.',
      },
    },
    // Nível 7 - Habilidade: Rugido em Chamas
    {
      level: 7,
      type: 'skill',
      id: 'igrazar_skill_5',
      name: { pt: 'Rugido em Chamas', en: 'Blazing Roar' },
      desc: {
        pt: 'Causa 4 de dano e reduz a defesa inimiga por 2 turnos.',
        en: "Deals 4 damage and reduces the enemy's defense for 2 turns.",
      },
      cost: 2,
      effectType: 'damage_debuff',
    },
    // Nível 8 - Perk: Resiliência Escaldante
    {
      level: 8,
      type: 'perk',
      id: 'SCALDING_RESILIENCE',
      name: { pt: 'Resiliência Escaldante', en: 'Scalding Resilience' },
      desc: {
        pt: 'Ao ser atingido, tem 20% de chance de queimar o atacante.',
        en: 'When hit, has a 20% chance to burn the attacker.',
      },
    },
    // Nível 9 - Habilidade: Erupção Rastejante
    {
      level: 9,
      type: 'skill',
      id: 'igrazar_skill_6',
      name: { pt: 'Erupção Rastejante', en: 'Crawling Eruption' },
      desc: {
        pt: 'Causa 3 de dano e queima todos os inimigos por 2 turnos.',
        en: 'Deals 3 damage and burns all enemies for 2 turns.',
      },
      cost: 3,
      effectType: 'damage_dot',
    },
    // Nível 10 - Habilidade: Fúria das Fendas Vulcânicas
    {
      level: 10,
      type: 'skill',
      id: 'igrazar_skill_7',
      name: { pt: 'Fúria das Fendas Vulcânicas', en: 'Fury of the Volcanic Fissures' },
      desc: {
        pt: 'Supremo: 4 de dano e aumenta o ataque de todos os aliados por 2 turnos.',
        en: 'Ultimate: 4 damage and increases the attack of all allies for 2 turns.',
      },
      cost: 4,
      effectType: 'ultimate_buff',
    },
  ],
};
