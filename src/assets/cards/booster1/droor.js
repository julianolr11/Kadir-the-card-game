// Card data for Droor
module.exports = {
  id: 'droor',
  title: { pt: 'Olhos de opala', en: 'Opal Eyes' },
  num: 46,
  height: 2.8,
  weakness: 'fogo',
  name: { pt: 'Droor', en: 'Droor' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'terra',
  img: require('../../img/creatures/droor_bio.webp'),
  // Arte é um retrato bem mais alto que o quadro do card (1122x1402), mesma proporção da
  // Igrazar - desloca o corte pra cima pra não cortar a cabeça/chifres.
  imgPosition: 'center 18%',
  color: 'earth',
  hp: 7,
  abilities: [
    {
      name: { pt: 'Chicote de Vinhas', en: 'Vine Whip' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano ao inimigo.',
        en: 'Deals 2 damage to the enemy.',
      },
      damage: 2,
    },
    {
      name: { pt: 'Fôlego de Musgo', en: 'Moss Breath' },
      cost: 2,
      desc: {
        pt: 'Causa 2 de dano e causa sangramento por 2 turnos.',
        en: 'Deals 2 damage and causes bleed for 2 turns.',
      },
      damage: 2,
      statusEffect: 'bleed',
      duration: 2,
    },
  ],
  field: { pt: 'Bosque Enraizado', en: 'Rooted Grove' },
  fielddesc: {
    pt: 'Criaturas de terra ganham +1 defesa enquanto Droor estiver em campo.',
    en: 'Earth creatures gain +1 defense while Droor is on the field.',
  },
  storyTitle: { pt: 'Origem de Droor', en: 'Origin of Droor' },
  story: [
    {
      pt: 'Droor nasceu nas raízes mais profundas da mata mais antiga do mundo, onde a floresta e a pedra se fundem com o tempo.',
      en: 'Droor was born from the deepest roots of the world\'s oldest forest, where woodland and stone merge with time.',
    },
    {
      pt: 'Suas escamas são folhas vivas, e por onde passa, vinhas e brotos cobrem o solo cicatrizado.',
      en: 'Its scales are living leaves, and wherever it walks, vines and sprouts cover the scarred ground.',
    },
    {
      pt: 'Guardiões da floresta dizem que Droor só desperta quando as raízes da terra são ameaçadas.',
      en: "Forest guardians say Droor only awakens when the earth's roots are threatened.",
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'droor_skill_chicote_de_vinhas',
      name: { pt: 'Chicote de Vinhas', en: 'Vine Whip' },
      desc: {
        pt: 'Causa 2 de dano ao inimigo.',
        en: 'Deals 2 damage to the enemy.',
      },
      cost: 1,
      type: 'damage',
      damage: 2,
    },
    {
      id: 'droor_skill_folego_de_musgo',
      name: { pt: 'Fôlego de Musgo', en: 'Moss Breath' },
      desc: {
        pt: 'Causa 2 de dano e causa sangramento por 2 turnos.',
        en: 'Deals 2 damage and causes bleed for 2 turns.',
      },
      cost: 2,
      type: 'damage_bleed',
      damage: 2,
      statusEffect: 'bleed',
      duration: 2,
    },
  ],
  defaultBlessing: {
    id: 'droor_blessing',
    name: { pt: 'Raízes Antigas', en: 'Ancient Roots' },
    desc: {
      pt: 'Ao ser invocado, ganha +1 de armadura.',
      en: 'When summoned, gains +1 armor.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'ROOTED_HIDE',
      name: { pt: 'Pele Enraizada', en: 'Rooted Hide' },
      desc: {
        pt: 'Ganha +1 de armadura.',
        en: 'Gains +1 armor.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'droor_skill_espinhos_vivos',
      name: { pt: 'Espinhos Vivos', en: 'Living Thorns' },
      desc: {
        pt: 'Causa 3 de dano e retira 1 de armadura do inimigo.',
        en: "Deals 3 damage and removes 1 of the enemy's armor.",
      },
      cost: 1,
      damage: 3,
      removeArmor: 1,
    },
    {
      level: 4,
      type: 'perk',
      id: 'FOREST_RESILIENCE',
      name: { pt: 'Resiliência da Floresta', en: 'Forest Resilience' },
      desc: {
        pt: 'Reduz em 1 o dano recebido de habilidades de fogo.',
        en: 'Reduces damage taken from fire abilities by 1.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'droor_skill_avanco_das_raizes',
      name: { pt: 'Avanço das Raízes', en: 'Advance of the Roots' },
      desc: {
        pt: 'Causa 3 de dano e joga 1 moeda; se der cara, paralisa o inimigo por 1 rodada.',
        en: 'Deals 3 damage and flips 1 coin; on heads, paralyzes the enemy for 1 round.',
      },
      cost: 2,
      damage: 3,
      coinStatusEffect: 'paralyze',
      coinStatusDuration: 1,
    },
    {
      level: 6,
      type: 'perk',
      id: 'GROVE_INSTINCT',
      name: { pt: 'Instinto do Bosque', en: 'Grove Instinct' },
      desc: {
        pt: 'Aliados de terra recebem +1 defesa quando Droor está em campo.',
        en: 'Earth allies gain +1 defense while Droor is on the field.',
      },
    },
    {
      level: 7,
      type: 'skill',
      id: 'droor_skill_furia_da_mata',
      name: { pt: 'Fúria da Mata', en: 'Fury of the Grove' },
      desc: {
        pt: 'Causa 4 de dano e causa sangramento por 2 turnos.',
        en: 'Deals 4 damage and causes bleed for 2 turns.',
      },
      cost: 2,
      damage: 4,
      statusEffect: 'bleed',
      duration: 2,
    },
    {
      level: 8,
      type: 'perk',
      id: 'BARK_ARMOR',
      name: { pt: 'Casca Endurecida', en: 'Hardened Bark' },
      desc: {
        pt: 'Ao ser atingido, tem 20% de chance de ganhar 1 de armadura.',
        en: 'When hit, has a 20% chance to gain 1 armor.',
      },
    },
    {
      level: 9,
      type: 'skill',
      id: 'droor_skill_despertar_ancestral',
      name: { pt: 'Despertar Ancestral', en: 'Ancestral Awakening' },
      desc: {
        pt: 'Causa 3 de dano e recupera 3 de vida.',
        en: 'Deals 3 damage and recovers 3 HP.',
      },
      cost: 3,
      damage: 3,
      healOnHit: 3,
    },
    {
      level: 10,
      type: 'skill',
      id: 'droor_skill_colapso_da_mata_eterna',
      name: { pt: 'Colapso da Mata Eterna', en: 'Collapse of the Eternal Grove' },
      desc: {
        pt: 'Supremo: 4 de dano e aumenta a armadura de todos os aliados em 1 ponto.',
        en: 'Ultimate: 4 damage and increases all allies\' armor by 1.',
      },
      cost: 4,
      damage: 4,
    },
  ],
};
