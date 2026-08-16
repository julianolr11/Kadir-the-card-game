// Card data for Zefri
module.exports = {
  id: 'zefri',
  title: { pt: 'O Astuto', en: 'The Cunning' },
  num: 39,
  height: 0.6,
  weakness: 'fogo',
  name: { pt: 'Zefri', en: 'Zefri' },
  type: { pt: 'Mística', en: 'Mystic' },
  element: 'ar',
  img: require('../../img/creatures/zefri_bio.webp'),
  color: 'air',
  hp: 6,

  // Habilidades base (exibidas no card preview)
  abilities: [
    {
      name: { pt: 'Rajada Ágil', en: 'Swift Gust' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano ar ao inimigo.',
        en: 'Deals 2 air damage to the enemy.',
      },
    },
    {
      name: { pt: 'Fuga do Vento', en: 'Wind Escape' },
      cost: 1,
      desc: {
        pt: 'Ganha evasão aumentada neste turno.',
        en: 'Gains increased evasion this turn.',
      },
    },
  ],

  // Campo de efeito
  field: { pt: 'Trilha das Orelhas do Vento', en: 'Trail of the Wind Ears' },
  fielddesc: {
    pt: 'Um rastro de folhas girando no ar, sem vento nenhum pra explicar. Ele já passou por aqui — e já foi embora.',
    en: 'A trail of leaves spinning in the air, with no wind to explain it. It has already passed through here — and already left.',
  },

  // História
  storyTitle: { pt: 'O Vento que Ri', en: 'The Wind That Laughs' },
  story: [
    {
      pt: 'Zefri nunca é visto duas vezes no mesmo lugar. Suas orelhas gigantes captam qualquer sussurro de perigo antes que ele exista de verdade.',
      en: 'Zefri is never seen twice in the same place. Its enormous ears catch any whisper of danger before it truly exists.',
    },
    {
      pt: 'Gosta de brincar com viajantes perdidos, guiando-os por caminhos que dão voltas só para ver a confusão em seus rostos.',
      en: 'It enjoys playing with lost travelers, leading them down winding paths just to watch the confusion on their faces.',
    },
    {
      pt: 'Mas por trás da travessura há algo mais afiado: Zefri nunca esquece um favor, e nunca perdoa uma armadilha.',
      en: 'But beneath the mischief lies something sharper: Zefri never forgets a favor, and never forgives a trap.',
    },
    {
      pt: 'Quando o vento muda de direção sem motivo aparente, os sábios dizem que é só Zefri, rindo baixinho, observando de longe.',
      en: 'When the wind changes direction for no apparent reason, the wise say it is only Zefri, laughing quietly, watching from afar.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,

  // Habilidades padrão do guardião (sempre disponíveis)
  defaultSkills: [
    {
      id: 'zefri_skill_1',
      name: { pt: 'Rajada Ágil', en: 'Swift Gust' },
      desc: {
        pt: 'Causa 2 de dano ar ao inimigo.',
        en: 'Deals 2 air damage to the enemy.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'zefri_skill_2',
      name: { pt: 'Fuga do Vento', en: 'Wind Escape' },
      desc: {
        pt: 'Ganha evasão aumentada neste turno.',
        en: 'Gains increased evasion this turn.',
      },
      cost: 1,
      type: 'evasion',
    },
  ],

  // Bênção padrão
  defaultBlessing: {
    id: 'zefri_blessing',
    name: { pt: 'Bênção do Vento Ágil', en: 'Blessing of the Swift Wind' },
    desc: {
      pt: 'Aliados ganham evasão aumentada por 1 turno ao entrar em campo.',
      en: 'Allies gain increased evasion for 1 turn when summoned.',
    },
  },

  // Tabela de desbloqueios por nível (0-10)
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'WIND_EARS',
      name: { pt: 'Orelhas do Vento', en: 'Wind Ears' },
      desc: {
        pt: '15% de chance de esquivar de ataques recebidos.',
        en: '15% chance to dodge incoming attacks.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'zefri_skill_investida_ventosa',
      name: { pt: 'Investida Ventosa', en: 'Windy Charge' },
      desc: {
        pt: 'Causa 3 de dano ar ao inimigo.',
        en: 'Deals 3 air damage to the enemy.',
      },
      cost: 2,
      effectType: 'damage',
    },
    {
      level: 4,
      type: 'perk',
      id: 'QUICK_REFLEXES',
      name: { pt: 'Reflexos Rápidos', en: 'Quick Reflexes' },
      desc: {
        pt: 'Reduz permanentemente o dano físico recebido em 1.',
        en: 'Permanently reduces physical damage taken by 1.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'zefri_skill_redemoinho_agil',
      name: { pt: 'Redemoinho Ágil', en: 'Nimble Whirl' },
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
      id: 'CUNNING_INSTINCT',
      name: { pt: 'Instinto Astuto', en: 'Cunning Instinct' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 2 de vida.',
        en: 'When defeating an enemy, recover 2 HP.',
      },
    },
    {
      level: 7,
      type: 'skill',
      id: 'zefri_skill_golpe_do_vendaval',
      name: { pt: 'Golpe do Vendaval', en: 'Gale Strike' },
      desc: {
        pt: 'Causa 4 de dano ar e reduz a defesa do alvo em 1 por 2 turnos.',
        en: 'Deals 4 air damage and lowers target defense by 1 for 2 turns.',
      },
      cost: 2,
      effectType: 'damage_debuff',
    },
    {
      level: 8,
      type: 'perk',
      id: 'ELUSIVE_PRESENCE',
      name: { pt: 'Presença Elusiva', en: 'Elusive Presence' },
      desc: {
        pt: 'Enquanto Zefri estiver em campo, aliados ganham chance extra de esquiva.',
        en: 'While Zefri is on the field, allies gain extra dodge chance.',
      },
    },
    {
      level: 9,
      type: 'skill',
      id: 'zefri_skill_tempestade_sussurrante',
      name: { pt: 'Tempestade Sussurrante', en: 'Whispering Storm' },
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
      id: 'zefri_skill_vendaval_final',
      name: { pt: 'Vendaval Final', en: 'Final Gale' },
      desc: {
        pt: 'Supremo: causa 5 de dano ao inimigo e ganha evasão aumentada por 2 turnos.',
        en: 'Ultimate: deals 5 damage to the enemy and gains increased evasion for 2 turns.',
      },
      cost: 3,
      effectType: 'ultimate_evasion',
    },
  ],
};
