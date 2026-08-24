// Card data for Draer
module.exports = {
  id: 'draer',
  title: { pt: 'Olhos de ametista', en: 'Amethyst Eyes' },
  num: 48,
  height: 3.2,
  weakness: 'terra',
  name: { pt: 'Draer', en: 'Draer' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'ar',
  img: require('../../img/creatures/draer_bio.webp'),
  color: 'air',
  hp: 9,
  abilities: [
    {
      name: { pt: 'Rugido dos Ventos', en: 'Windborne Roar' },
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
      name: { pt: 'Alcance Violeta', en: 'Violet Reach' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano e retira qualquer escudo ativo do alvo inimigo.',
        en: 'Deals 3 damage and removes any active shield from the enemy target.',
      },
      damage: 3,
      removeShield: true,
    },
  ],
  field: { pt: 'Cume Nublado', en: 'Cloudpeak Summit' },
  fielddesc: {
    pt: 'Criaturas de ar causam +1 dano no primeiro ataque enquanto Draer estiver em campo.',
    en: 'Air creatures deal +1 damage on their first attack while Draer is on the field.',
  },
  storyTitle: { pt: 'Origem de Draer', en: 'Origin of Draer' },
  story: [
    {
      pt: 'Draer repousa acima das nuvens, onde o ar é fino e o silêncio absoluto. Seus olhos de ametista enxergam correntes de vento invisíveis aos olhos comuns, e dizem que ele só desce aos vales quando o equilíbrio dos céus é perturbado.',
      en: 'Draer rests above the clouds, where the air is thin and the silence absolute. Its amethyst eyes see wind currents invisible to common eyes, and it is said to descend to the valleys only when the balance of the skies is disturbed.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'draer_skill_rugido_dos_ventos',
      name: { pt: 'Rugido dos Ventos', en: 'Windborne Roar' },
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
      id: 'draer_skill_alcance_violeta',
      name: { pt: 'Alcance Violeta', en: 'Violet Reach' },
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
    id: 'draer_blessing',
    name: { pt: 'Olhar Silencioso', en: 'Silent Gaze' },
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
      name: { pt: 'Instinto dos Céus', en: 'Skyborn Instinct' },
      desc: {
        pt: 'Ganha +1 de vida.',
        en: 'Gains +1 health.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'draer_skill_sopro_etereo',
      name: { pt: 'Sopro Etéreo', en: 'Ethereal Breath' },
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
      name: { pt: 'Escamas Etéreas', en: 'Ethereal Scales' },
      desc: {
        pt: 'O primeiro ataque que receber será sempre negado.',
        en: 'The first attack it receives is always negated.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'draer_skill_cauda_cortante',
      name: { pt: 'Cauda Cortante', en: 'Cutting Tail' },
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
      id: 'draer_skill_folego_violeta',
      name: { pt: 'Fôlego Violeta', en: 'Violet Breath' },
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
      id: 'draer_skill_golpe_ancestral',
      name: { pt: 'Golpe Ancestral', en: 'Ancestral Strike' },
      desc: {
        pt: 'Causa 2 de dano; graças ao olhar silencioso de Draer, esse dano aumenta permanentemente em +1 a cada ataque.',
        en: "Deals 2 damage; thanks to Draer's silent gaze, this damage permanently increases by +1 with each attack.",
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
      id: 'draer_skill_furia_violeta',
      name: { pt: 'Fúria Violeta', en: 'Violet Fury' },
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
