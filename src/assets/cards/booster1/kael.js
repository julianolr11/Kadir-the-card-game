// Card data for Kael
module.exports = {
  id: 'kael',
  title: { pt: 'Do abismo', en: 'from the abyss' },
  num: 3,
  height: 1.8,
  weakness: 'terra',
  name: { pt: 'Kael', en: 'Kael' },
  type: { pt: 'Fera', en: 'Beast' },
  element: 'agua',
  img: require('../../img/creatures/kael_bio.webp'),
  color: 'water',
  hp: 7,
  abilities: [
    {
      name: { pt: 'Mordida Gélida', en: 'Frost Bite' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Pele Escorregadia', en: 'Slippery Hide' },
      cost: 1,
      desc: {
        pt: 'reduz o dano recebido em 1.',
        en: 'reduces damage taken by 1.',
      },
    },
  ],
  field: { pt: 'Lago Sagrado', en: 'Sacred Lake' },
  fielddesc: {
    pt: 'Aliados recebem -1 de dano enquanto Kael estiver em campo.',
    en: 'Allies take -1 damage while Kael is on the field.',
  },
  storyTitle: { pt: 'Origem de Kael', en: 'Origin of Kael' },
  story: [
    {
      pt: 'Kael é uma fera selvagem que habita rios, pântanos e lagos de águas turbulentas. Extremamente astuto, aprendeu a usar o próprio ambiente como arma, movendo-se entre as correntes com velocidade e precisão.',
      en: 'Kael is a wild beast that inhabits rivers, swamps, and lakes of turbulent waters. Extremely cunning, it learned to use the environment itself as a weapon, moving through the currents with speed and precision.',
    },
    {
      pt: 'Seu corpo é forte e flexível, coberto por uma pelagem constantemente encharcada, e seus olhos aténtos nunca perdem um alvo. Kael não ataca de forma direta: ele cerca, confunde e espera o momento exato para avançar.',
      en: 'Its body is strong and flexible, covered in a constantly soaked coat, and its watchful eyes never lose a target. Kael does not attack directly: it circles, confuses, and waits for the exact moment to strike.',
    },
    {
      pt: 'Caçadores afirmam que enfrentar Kael é como lutar contra a própria maré — quando se percebe o perigo, já é tarde demais.',
      en: 'Hunters claim that facing Kael is like fighting the tide itself — when you realize the danger, it is already too late.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'kael_skill_1',
      name: { pt: 'Cone de Gelo', en: 'Cone of Ice' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo com frio intenso.',
        en: 'Deals 3 damage to the enemy with intense cold.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'kael_skill_2',
      name: { pt: 'Cristal Refrigerador', en: 'Chilling Crystal' },
      desc: {
        pt: 'Causa 2 de dano e aplica lentidão.',
        en: 'Deals 2 damage and applies slow.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'kael_blessing',
    name: { pt: 'Ataque Perfurante', en: 'Piercing Strike' },
    desc: {
      pt: 'Ao ser invocado, concede 1 de dano 3 vezes a criaturas aleatórias. Se houver só 1 criatura, ela toma 3 de dano direto.',
      en: 'When summoned, deals 1 damage 3 times to random creatures. If there is only 1, it takes 3 direct damage.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Pele Gélida
    {
      level: 2,
      type: 'perk',
      id: 'FROST_SKIN',
      name: { pt: 'Pele Gélida', en: 'Frost Skin' },
      desc: {
        pt: 'Recebe -1 de dano de ataques físicos por 2 turnos ao entrar em campo.',
        en: 'Takes -1 physical damage for 2 turns when summoned.',
      },
    },
    // Nível 3 - Habilidade: Blizzard Cortante
    {
      level: 3,
      type: 'skill',
      id: 'kael_skill_blizzard_cortante',
      name: { pt: 'Blizzard Cortante', en: 'Cutting Blizzard' },
      desc: {
        pt: 'Causa 2 de dano em área e congela por 1 turno.',
        en: 'Deals 2 area damage and freezes for 1 turn.',
      },
      cost: 1,
      effectType: 'aoe_freeze',
    },
    // Nível 4 - Perk: Reflexo Gélido
    {
      level: 4,
      type: 'perk',
      id: 'FROST_REFLECT',
      name: { pt: 'Reflexo Gélido', en: 'Frost Reflect' },
      desc: {
        pt: 'Reflete 1 de dano de gelo recebido por turno.',
        en: 'Reflects 1 ice damage received per turn.',
      },
    },
    // Nível 5 - Habilidade: Prisma Gelado
    {
      level: 5,
      type: 'skill',
      id: 'kael_skill_prisma_gelado',
      name: { pt: 'Prisma Gelado', en: 'Icy Prism' },
      desc: {
        pt: 'Causa 3 de dano e reflete 1 de dano recebido.',
        en: 'Deals 3 damage and reflects 1 damage taken.',
      },
      cost: 2,
      effectType: 'damage_reflect',
    },
    // Nível 6 - Perk: Resistência Profunda
    {
      level: 6,
      type: 'perk',
      id: 'DEEP_RESISTANCE',
      name: { pt: 'Resistência Profunda', en: 'Deep Resistance' },
      desc: {
        pt: 'recebe -1 de dano de gelo.',
        en: 'takes -1 ice damage.',
      },
    },
    // Nível 7 - Habilidade: Inverno Eterno
    {
      level: 7,
      type: 'skill',
      id: 'kael_skill_inverno_eterno',
      name: { pt: 'Inverno Eterno', en: 'Eternal Winter' },
      desc: {
        pt: 'Causa 4 de dano e congela o campo por 2 turnos.',
        en: 'Deals 4 damage and freezes the field for 2 turns.',
      },
      cost: 2,
      effectType: 'field_freeze',
    },
    // Nível 8 - Perk: Fôlego Ártico
    {
      level: 8,
      type: 'perk',
      id: 'ARCTIC_BREATH',
      name: { pt: 'Fôlego Ártico', en: 'Arctic Breath' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 1 de vida.',
        en: 'When defeating an enemy, recover 1 HP.',
      },
    },
    // Nível 9 - Habilidade: Avalanche Misteriosa
    {
      level: 9,
      type: 'skill',
      id: 'kael_skill_avalanche_misteriosa',
      name: { pt: 'Avalanche Misteriosa', en: 'Mysterious Avalanche' },
      desc: {
        pt: 'Causa 4 de dano e paralisa todos os inimigos.',
        en: 'Deals 4 damage and paralyzes all enemies.',
      },
      cost: 3,
      effectType: 'aoe_paralyze',
    },
    // Nível 10 - Habilidade: Era do Gelo
    {
      level: 10,
      type: 'skill',
      id: 'kael_skill_era_do_gelo',
      name: { pt: 'Era do Gelo', en: 'Ice Age' },
      desc: {
        pt: 'Supremo: 4 de dano e congela o campo por 3 turnos.',
        en: 'Ultimate: 4 damage and freezes the field for 3 turns.',
      },
      cost: 4,
      effectType: 'ultimate_field_freeze',
    },
  ],
};
