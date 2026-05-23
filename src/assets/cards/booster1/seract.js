// Card data for Seract
module.exports = {
  id: 'seract',
  title: { pt: 'Calamidade Gelida', en: 'Frozen Calamity' },
  num: 31,
  height: 2.1,
  weakness: 'puro',
  name: { pt: 'Seract', en: 'Seract' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'agua',
  img: require('../../img/creatures/seract_bio.webp'),
  color: 'water',
  hp: 8,
  abilities: [
    {
      name: { pt: 'Toque Congelante', en: 'Freezing Touch' },
      cost: 2,
      desc: {
        pt: 'Congela o alvo por 1 turno e causa +2 de dano gélido.',
        en: 'Freezes the target for 1 turn and deals +2 ice damage.',
      },
    },
    {
      name: { pt: 'Cristal de Sombra', en: 'Shadow Crystal' },
      cost: 3,
      desc: {
        pt: 'Cria escudo de gelo sombrio: absorve até 3 de dano e reflete 1 de dano ao atacante.',
        en: 'Creates a shadow ice shield: absorbs up to 3 damage and reflects 1 damage to the attacker.',
      },
    },
  ],
  field: { pt: 'Reinado Glacial', en: 'Glacial Reign' },
  fielddesc: {
    pt: 'Enquanto Seract estiver em campo, inimigos recuperam 1 HP a menos e habilidades de água custam -1 essência.',
    en: 'While Seract is on the field, enemies recover 1 less HP and water abilities cost -1 essence.',
  },
  storyTitle: { pt: 'O Sussurro do Abismo Gelado', en: 'Whisper of the Frozen Abyss' },
  story: [
    {
      pt: 'Seract nasceu nas profundezas geladas onde a luz nunca chega e o frio é absoluto.',
      en: 'Seract was born in frozen depths where light never reaches and cold is absolute.',
    },
    {
      pt: 'Sua essência combina a frieza da água com a escuridao da sombra.',
      en: 'Its essence combines the chill of water with the darkness of shadow.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardiao) =====
  isGuardian: true,
  defaultBlessing: {
    id: 'seract_blessing',
    name: { pt: 'Troca de Essencia', en: 'Essence Swap' },
    desc: {
      pt: 'Ao ser invocado, escolha uma criatura em campo para trocar por uma criatura do cemitério.',
      en: 'When summoned, choose a creature on the field to swap with a creature from the graveyard.',
    },
  },
  defaultSkills: [
    {
      id: 'seract_skill_toque_congelante',
      name: { pt: 'Toque Congelante', en: 'Freezing Touch' },
      cost: 2,
      desc: {
        pt: 'Congela o alvo por 1 turno e causa +2 de dano gélido.',
        en: 'Freezes the target for 1 turn and deals +2 ice damage.',
      },
      type: 'damage_freeze',
      damage: 2,
      statusEffect: 'freeze',
      duration: 1,
    },
    {
      id: 'seract_skill_cristal_sombra',
      name: { pt: 'Cristal de Sombra', en: 'Shadow Crystal' },
      cost: 3,
      desc: {
        pt: 'Cria escudo de gelo sombrio: absorve até 3 de dano e reflete 1 de dano ao atacante.',
        en: 'Creates a shadow ice shield: absorbs up to 3 damage and reflects 1 damage to the attacker.',
      },
      type: 'shield_reflect',
      shield: 3,
      reflect: 1,
    },
  ],
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'FROZEN_ABYSS',
      name: { pt: 'Abismo Congelado', en: 'Frozen Abyss' },
      desc: {
        pt: 'Inimigos congelados recebem +1 dano de ataques de água.',
        en: 'Frozen enemies take +1 damage from water attacks.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'seract_skill_lamina_abissal',
      name: { pt: 'Lâmina Abissal', en: 'Abyssal Blade' },
      desc: {
        pt: 'Causa 3 de dano. Se o alvo estiver congelado, causa +1 dano.',
        en: 'Deals 3 damage. If the target is frozen, deals +1 damage.',
      },
      cost: 2,
      effectType: 'damage_bonus_frozen',
      damage: 3,
      bonusDamage: 1,
    },
    {
      level: 4,
      type: 'perk',
      id: 'SHADOW_ICE_CORE',
      name: { pt: 'Núcleo de Gelo Sombrio', en: 'Shadow Ice Core' },
      desc: {
        pt: 'Ao receber dano, jogue a moeda 1 vez; se der cara, ganha 1 de escudo.',
        en: 'When damaged, flip a coin once; on heads, gains 1 shield.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'seract_skill_prisao_glacial',
      name: { pt: 'Prisão Glacial', en: 'Glacial Prison' },
      desc: {
        pt: 'Congela 1 inimigo por 1 turno e reduz sua precisão em 1.',
        en: 'Freezes 1 enemy for 1 turn and lowers its accuracy by 1.',
      },
      cost: 2,
      effectType: 'freeze_accuracy_down',
      statusEffect: 'freeze',
      duration: 1,
      debuff: { stat: 'accuracy', value: -1, duration: 1 },
    },
    {
      level: 6,
      type: 'perk',
      id: 'COLD_GRAVE',
      name: { pt: 'Túmulo Frio', en: 'Cold Grave' },
      desc: {
        pt: 'Ao eliminar uma criatura, recupera 1 de essência.',
        en: 'When eliminating a creature, recovers 1 essence.',
      },
    },
    {
      level: 7,
      type: 'skill',
      id: 'seract_skill_estilhaco_sombrio',
      name: { pt: 'Estilhaço Sombrio', en: 'Shadow Shard' },
      desc: {
        pt: 'Causa 4 de dano e aplica lentidão por 2 turnos.',
        en: 'Deals 4 damage and applies slow for 2 turns.',
      },
      cost: 3,
      effectType: 'damage_slow',
      damage: 4,
      statusEffect: 'slow',
      duration: 2,
    },
  ],
};
