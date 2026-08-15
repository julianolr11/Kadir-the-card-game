// Card data for Grombi
module.exports = {
  id: 'grombi',
  title: { pt: 'Portador da Pedra-Alma', en: 'Bearer of the Soulstone' },
  num: 38,
  height: 1.1,
  weakness: 'ar',
  name: { pt: 'Grombi', en: 'Grombi' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'terra',
  img: require('../../img/creatures/grombi_bio.webp'),
  color: 'earth',
  hp: 6,

  // Habilidades base (exibidas no card preview)
  abilities: [
    {
      name: { pt: 'Investida do Casco', en: 'Shell Ram' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano terra ao inimigo.',
        en: 'Deals 2 earth damage to the enemy.',
      },
    },
    {
      name: { pt: 'Concha em Expansão', en: 'Expanding Shell' },
      cost: 1,
      desc: {
        pt: 'Ganha um escudo que absorve 2 de dano por 2 turnos.',
        en: 'Gains a shield that absorbs 2 damage for 2 turns.',
      },
    },
  ],

  // Campo de efeito
  field: { pt: 'Trilha da Concha Rolante', en: 'Rolling Shell Trail' },
  fielddesc: {
    pt: 'Um sulco na terra, cavado por algo que nunca parou de rolar. A cada volta, a pedra fica um pouco maior.',
    en: 'A groove in the earth, carved by something that never stopped rolling. With every turn, the stone grows a little larger.',
  },

  // História
  storyTitle: { pt: 'A Pedra que Nunca Para', en: 'The Stone That Never Stops' },
  story: [
    {
      pt: 'Ninguém sabe ao certo o que Grombi é por baixo — só que sua alma vive presa dentro da esfera de pedra que ele empurra sem descanso.',
      en: 'No one truly knows what Grombi is underneath — only that its soul lives trapped inside the stone sphere it pushes without rest.',
    },
    {
      pt: 'Quanto mais rola, mais a pedra cresce, camada sobre camada, como se o próprio mundo se dobrasse para protegê-lo.',
      en: 'The more it rolls, the more the stone grows, layer upon layer, as if the world itself folded to protect it.',
    },
    {
      pt: 'Dizem que a única forma de acabar com Grombi é quebrar essa concha — mas ninguém que tentou viveu para contar se é verdade.',
      en: 'They say the only way to end Grombi is to shatter that shell — but no one who has tried has lived to confirm it.',
    },
    {
      pt: 'Ele não persegue, não foge. Apenas rola, devagar, eterno, engordando sua prisão de pedra sob a lua.',
      en: 'It does not chase, does not flee. It only rolls, slow, eternal, fattening its stone prison beneath the moon.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,

  // Habilidades padrão do guardião (sempre disponíveis)
  defaultSkills: [
    {
      id: 'grombi_skill_1',
      name: { pt: 'Investida do Casco', en: 'Shell Ram' },
      desc: {
        pt: 'Causa 2 de dano terra ao inimigo.',
        en: 'Deals 2 earth damage to the enemy.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'grombi_skill_2',
      name: { pt: 'Concha em Expansão', en: 'Expanding Shell' },
      desc: {
        pt: 'Ganha um escudo que absorve 2 de dano por 2 turnos.',
        en: 'Gains a shield that absorbs 2 damage for 2 turns.',
      },
      cost: 1,
      type: 'shield',
    },
  ],

  // Bênção padrão
  defaultBlessing: {
    id: 'grombi_blessing',
    name: { pt: 'Bênção da Pedra-Alma', en: 'Blessing of the Soulstone' },
    desc: {
      pt: 'Aliados ganham um escudo que absorve 1 de dano ao entrar em campo.',
      en: 'Allies gain a shield absorbing 1 damage when summoned.',
    },
  },

  // Tabela de desbloqueios por nível (0-10)
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'HARDENED_SHELL',
      name: { pt: 'Casca Endurecida', en: 'Hardened Shell' },
      desc: {
        pt: 'Reduz permanentemente o dano físico recebido em 1.',
        en: 'Permanently reduces physical damage taken by 1.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'grombi_skill_rolar_implacavel',
      name: { pt: 'Rolar Implacável', en: 'Relentless Roll' },
      desc: {
        pt: 'Causa 3 de dano terra ao inimigo.',
        en: 'Deals 3 earth damage to the enemy.',
      },
      cost: 2,
      effectType: 'damage',
    },
    {
      level: 4,
      type: 'perk',
      id: 'GROWING_WEIGHT',
      name: { pt: 'Peso Crescente', en: 'Growing Weight' },
      desc: {
        pt: 'Inicia a batalha com um escudo que absorve 2 de dano.',
        en: 'Starts the battle with a shield that absorbs 2 damage.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'grombi_skill_esmagar',
      name: { pt: 'Esmagar', en: 'Crush' },
      desc: {
        pt: 'Causa 3 de dano em área.',
        en: 'Deals 3 area damage.',
      },
      cost: 2,
      effectType: 'aoe_damage',
    },
    {
      level: 6,
      type: 'perk',
      id: 'SHIELDED_SOUL',
      name: { pt: 'Alma Protegida', en: 'Shielded Soul' },
      desc: {
        pt: 'Enquanto estiver com escudo ativo, recebe -1 de dano adicional.',
        en: 'While shielded, takes -1 additional damage.',
      },
    },
    {
      level: 7,
      type: 'skill',
      id: 'grombi_skill_avanco_da_pedra',
      name: { pt: 'Avanço da Pedra', en: 'Stone Advance' },
      desc: {
        pt: 'Causa 4 de dano terra e reduz a defesa do alvo em 1 por 2 turnos.',
        en: 'Deals 4 earth damage and lowers target defense by 1 for 2 turns.',
      },
      cost: 2,
      effectType: 'damage_debuff',
    },
    {
      level: 8,
      type: 'perk',
      id: 'IMPENETRABLE_COCOON',
      name: { pt: 'Casulo Impenetrável', en: 'Impenetrable Cocoon' },
      desc: {
        pt: 'Enquanto Grombi estiver em campo, aliados ganham +1 de defesa.',
        en: 'While Grombi is on the field, allies gain +1 defense.',
      },
    },
    {
      level: 9,
      type: 'skill',
      id: 'grombi_skill_colapso_da_concha',
      name: { pt: 'Colapso da Concha', en: 'Shell Collapse' },
      desc: {
        pt: 'Causa 4 de dano em área.',
        en: 'Deals 4 area damage.',
      },
      cost: 3,
      effectType: 'aoe_damage',
    },
    {
      level: 10,
      type: 'skill',
      id: 'grombi_skill_nucleo_exposto',
      name: { pt: 'Núcleo Exposto', en: 'Exposed Core' },
      desc: {
        pt: 'Supremo: causa 5 de dano ao inimigo e ganha um escudo que absorve 3 de dano.',
        en: 'Ultimate: deals 5 damage to the enemy and gains a shield absorbing 3 damage.',
      },
      cost: 3,
      effectType: 'ultimate_shield',
    },
  ],
};
