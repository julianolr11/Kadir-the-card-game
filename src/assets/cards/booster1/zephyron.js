// Card data for Zephyron
module.exports = {
  id: 'zephyron',
  title: { pt: 'Devorador de Tempestades', en: 'Storm Devourer' },
  num: 27,
  height: 3.0,
  weakness: 'terra',
  name: { pt: 'Zephyron', en: 'Zephyron' },
  type: { pt: 'Fera', en: 'Beast' },
  element: 'ar',
  img: require('../../img/creatures/zephyron_bio.webp'),
  color: 'air',
  hp: 7,
  abilities: [
    {
      name: { pt: 'Golpe de Ciclone', en: 'Cyclone Strike' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano e empurra o alvo, reduzindo sua próxima ação.',
        en: 'Deals 3 damage and pushes the target, reducing its next action.',
      },
    },
    {
      name: { pt: 'Asas Vorpais', en: 'Vorpine Wings' },
      cost: 1,
      desc: {
        pt: 'Ganha +1 esquiva por 2 turnos e o próximo ataque recebe +1 dano se a moeda der cara.',
        en: 'Grants +1 evasion for 2 turns and next hit gains +1 damage on heads.',
      },
    },
  ],
  field: { pt: 'Olho da Tempestade', en: 'Eye of the Storm' },
  fielddesc: {
    pt: 'Aliados de ar ganham +1 velocidade; inimigos têm o primeiro ataque leve inimigo custa +1 essência.',
    en: 'Air allies gain +1 speed; enemies have the first enemy light attack costs +1 essence.',
  },
  storyTitle: { pt: 'Fera que Bebe Ventos', en: 'Beast that Drinks Winds' },
  story: [
    {
      pt: 'Zephyron caça no coração das tempestades, onde trovões viram presas.',
      en: 'Zephyron hunts in storm hearts, where thunder becomes prey.',
    },
    {
      pt: 'Seu rugido suga o ar ao redor, abafando gritos e apagando fogueiras.',
      en: 'Its roar drinks the surrounding air, smothering cries and extinguishing fires.',
    },
    {
      pt: 'Dizem que já devorou um ciclone inteiro e desde então vaga com fome eterna.',
      en: 'They say it once devoured a whole cyclone and now roams with eternal hunger.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'zephyron_skill_1',
      name: { pt: 'Lâmina de Ventania', en: 'Gale Blade' },
      desc: {
        pt: 'Causa 3 de dano e jogue a moeda 1 vez; se der cara, paralisa 1 turno.',
        en: 'Deals 3 damage. Flip a coin once; on heads, paralyzes for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'zephyron_skill_2',
      name: { pt: 'Eco Tempestuoso', en: 'Storm Echo' },
      desc: {
        pt: 'Causa 2 de dano em área e reduz precisão inimiga em 1 por 2 turnos.',
        en: 'Deals 2 area damage and applies imprecision for 2 turns.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'zephyron_blessing',
    name: { pt: 'Tempestade Paralisante', en: 'Paralyzing Storm' },
    desc: {
      pt: 'Ao ser invocado paralisa todas as criaturas adversárias por 2 turnos.',
      en: 'When summoned, paralyzes all enemy creatures for 2 turns.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'zephyron_skill_3',
      name: { pt: 'Garras do Tufão', en: 'Typhoon Claws' },
      desc: {
        pt: 'Causa 3 de dano e puxa 1 ponto de energia do alvo.',
        en: 'Deals 3 damage and pulls 1 energy from the target.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'zephyron_skill_4',
      name: { pt: 'Redemoinho Cortante', en: 'Rending Maelstrom' },
      desc: {
        pt: 'Causa 3 de dano em área e aplica sangramento 1.',
        en: 'Deals 3 area damage and applies bleed 1.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'zephyron_skill_5',
      name: { pt: 'Carapaça de Vento', en: 'Wind Carapace' },
      desc: {
        pt: 'Ganha 3 de escudo e +1 esquiva por 2 turnos.',
        en: 'Gains 3 shield and +1 evasion for 2 turns.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'DODGE_INCREASE' },
    { level: 7, type: 'perk', id: 'CRIT_CHANCE' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'zephyron_skill_6',
      name: { pt: 'Lamento das Nuvens', en: 'Cloud Lament' },
      desc: {
        pt: 'Causa 4 de dano e reduz velocidade inimiga em 1 por 2 turnos.',
        en: 'Deals 4 damage and applies slow for 2 turns.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'zephyron_skill_7',
      name: { pt: 'Supremo: Banquete de Tempestades', en: 'Ultimate: Storm Banquet' },
      desc: {
        pt: 'Supremo: 4 de dano em todos, aplica sangramento 2 e concede +1 velocidade aos aliados de ar por 2 turnos.',
        en: 'Ultimate: 4 damage to all, applies bleed 2, and grants air allies +1 speed for 2 turns.',
      },
      cost: 3,
    },
  ],
};
