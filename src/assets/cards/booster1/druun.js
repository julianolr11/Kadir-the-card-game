// Card data for Druun
module.exports = {
  id: 'druun',
  title: { pt: 'Olhos de safira', en: 'Sapphire Eyes' },
  num: 49,
  height: 3.0,
  weakness: 'terra',
  name: { pt: 'Druun', en: 'Druun' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'agua',
  img: require('../../img/creatures/druun_bio.webp'),
  // Arte é um retrato bem mais alto que o quadro do card (1122x1402), mesma proporção da
  // Igrazar/Droor - desloca o corte pra cima pra não cortar a cabeça/chifres.
  imgPosition: 'center 18%',
  color: 'water',
  hp: 9,
  abilities: [
    {
      name: { pt: 'Rugido da Cachoeira', en: 'Waterfall Roar' },
      cost: 2,
      desc: {
        pt: 'Causa 2 de dano e paralisa o inimigo por 1 rodada.',
        en: 'Deals 2 damage and paralyzes the enemy for 1 round.',
      },
      damage: 2,
      statusEffect: 'paralyze',
      duration: 1,
    },
    {
      name: { pt: 'Alcance Cristalino', en: 'Crystalline Reach' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano e retira qualquer escudo ativo do alvo inimigo.',
        en: 'Deals 3 damage and removes any active shield from the enemy target.',
      },
      damage: 3,
      removeShield: true,
    },
  ],
  field: { pt: 'Rio Sagrado', en: 'Sacred River' },
  fielddesc: {
    pt: 'Criaturas de água causam +1 dano no primeiro ataque enquanto Druun estiver em campo.',
    en: 'Water creatures deal +1 damage on their first attack while Druun is on the field.',
  },
  storyTitle: { pt: 'Origem de Druun', en: 'Origin of Druun' },
  story: [
    {
      pt: 'Druun vive nas nascentes mais puras do mundo, onde os rios nascem da própria montanha. Seus olhos de safira refletem a correnteza como se enxergassem o futuro escoando junto com a água. Diz-se que suas escamas nunca secam, mesmo sob o sol mais forte.',
      en: 'Druun lives in the purest springs of the world, where rivers are born from the mountain itself. Its sapphire eyes reflect the current as if seeing the future flowing along with the water. It is said its scales never dry, even under the harshest sun.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'druun_skill_rugido_da_cachoeira',
      name: { pt: 'Rugido da Cachoeira', en: 'Waterfall Roar' },
      desc: {
        pt: 'Causa 2 de dano e paralisa o inimigo por 1 rodada.',
        en: 'Deals 2 damage and paralyzes the enemy for 1 round.',
      },
      cost: 2,
      type: 'damage_paralyze',
      damage: 2,
      statusEffect: 'paralyze',
      duration: 1,
    },
    {
      id: 'druun_skill_alcance_cristalino',
      name: { pt: 'Alcance Cristalino', en: 'Crystalline Reach' },
      desc: {
        pt: 'Causa 3 de dano e retira qualquer escudo ativo do alvo inimigo.',
        en: 'Deals 3 damage and removes any active shield from the enemy target.',
      },
      cost: 2,
      type: 'damage_remove_shield',
      damage: 3,
      removeShield: true,
    },
  ],
  defaultBlessing: {
    id: 'druun_blessing',
    name: { pt: 'Olhar Cristalino', en: 'Crystalline Gaze' },
    desc: {
      pt: 'Seu dano aumenta em +1 cada vez que esta carta ataca.',
      en: 'Its damage increases by +1 each time this card attacks.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'HP_PLUS_1',
      name: { pt: 'Instinto Aquático', en: 'Aquatic Instinct' },
      desc: {
        pt: 'Ganha +1 de vida.',
        en: 'Gains +1 health.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'druun_skill_sopro_gelido',
      name: { pt: 'Sopro Gélido', en: 'Frigid Breath' },
      desc: {
        pt: 'Causa 2 de dano e deixa o alvo dormindo por 2 turnos.',
        en: 'Deals 2 damage and puts the target to sleep for 2 turns.',
      },
      cost: 1,
      damage: 2,
      statusEffect: 'sleep',
      duration: 2,
    },
    {
      level: 4,
      type: 'perk',
      id: 'PROTECTIVE_SCALES',
      name: { pt: 'Escamas Cristalinas', en: 'Crystalline Scales' },
      desc: {
        pt: 'O primeiro ataque que receber será sempre negado.',
        en: 'The first attack it receives is always negated.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'druun_skill_cauda_da_correnteza',
      name: { pt: 'Cauda da Correnteza', en: 'Current Tail' },
      desc: {
        pt: 'Causa 2 de dano e joga 1 moeda; se der cara, causa sangramento por 2 turnos.',
        en: 'Deals 2 damage and flips 1 coin; on heads, causes bleed for 2 turns.',
      },
      cost: 1,
      damage: 2,
      coinStatusEffect: 'bleed',
      coinStatusDuration: 2,
      coinStatusValue: 1,
    },
    {
      level: 7,
      type: 'skill',
      id: 'druun_skill_folego_de_safira',
      name: { pt: 'Fôlego de Safira', en: 'Sapphire Breath' },
      desc: {
        pt: 'Causa 3 de dano; se derrotar o inimigo, recupera 2 de vida.',
        en: 'Deals 3 damage; if it defeats the enemy, recovers 2 health.',
      },
      cost: 2,
      damage: 3,
      healOnKill: 2,
    },
    {
      level: 8,
      type: 'skill',
      id: 'druun_skill_golpe_ancestral',
      name: { pt: 'Golpe Ancestral', en: 'Ancestral Strike' },
      desc: {
        pt: 'Causa 2 de dano; graças ao olhar cristalino de Druun, esse dano aumenta permanentemente em +1 a cada ataque.',
        en: "Deals 2 damage; thanks to Druun's crystalline gaze, this damage permanently increases by +1 with each attack.",
      },
      cost: 1,
      damage: 2,
    },
    {
      level: 9,
      type: 'perk',
      id: 'EXTRA_STAMINA',
      name: { pt: 'Estâmina Extra', en: 'Extra Stamina' },
      desc: {
        pt: 'Ao ser invocado, se houver outro dragão em campo, ganha +1 de ataque.',
        en: 'When summoned, if another dragon is on the field, gains +1 attack.',
      },
    },
    {
      level: 10,
      type: 'skill',
      id: 'druun_skill_furia_de_safira',
      name: { pt: 'Fúria de Safira', en: 'Sapphire Fury' },
      desc: {
        pt: 'Causa 4 de dano e joga 1 moeda; se der cara, causa +2 de dano; se der coroa, recebe 2 de dano.',
        en: 'Deals 4 damage and flips 1 coin; on heads, deals +2 damage; on tails, takes 2 damage.',
      },
      cost: 2,
      damage: 4,
      coinExtraDamage: 2,
      coinSelfDamage: 2,
    },
  ],
};
