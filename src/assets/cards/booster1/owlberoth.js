// Card data for Owlberoth
module.exports = {
  id: 'owlberoth',
  num: 9,
  height: 3.7,
  weakness: 'puro',
  name: { pt: 'Owlberoth', en: 'Owlberoth' },
  type: { pt: 'Mística', en: 'Mystic' },
  element: 'puro',
  img: require('../../img/creatures/owlberoth_bio.webp'),
  color: 'pure',
  hp: 10,
  abilities: [
    {
      name: { pt: 'Olhar Místico', en: 'Mystic Gaze' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano e revela 1 carta da mão do oponente.',
        en: 'Deals 3 damage and reveals 1 card from the opponent hand.',
      },
    },
    {
      name: { pt: 'Voo Noturno', en: 'Night Flight' },
      cost: 2,
      desc: {
        pt: 'Concede 1 de escudo a todos os aliados por 1 turno.',
        en: 'Grants 1 shield to all allies for 1 turn.',
      },
    },
  ],
  field: { pt: 'Noite Sagrada', en: 'Sacred Night' },
  fielddesc: {
    pt: 'Aliados ganham +1 esquiva enquanto Owlberoth estiver em campo.',
    en: 'Allies gain +1 evasion while Owlberoth is on the field.',
  },
  storyTitle: { pt: 'Origem de Owlberoth', en: 'Origin of Owlberoth' },
  story: [
    {
      pt: 'Owlberoth é uma criatura mistica, guardiã dos segredos da noite.',
      en: 'Owlberoth is a mystical creature, guardian of the secrets of the night.',
    },
    {
      pt: 'Seu olhar penetra as trevas e revela verdades ocultas.',
      en: 'Its gaze pierces the darkness and reveals hidden truths.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardiao) =====
  isGuardian: true,
  defaultBlessing: {
    id: 'owlberoth_blessing',
    name: { pt: 'Expulsão Mística', en: 'Mystic Expulsion' },
    desc: {
      pt: 'Ao ser invocado, escolha 1 criatura inimiga em campo para retornar para a mão do oponente.',
      en: 'When summoned, choose 1 enemy creature on the field to return to the opponent hand.',
    },
  },
  defaultSkills: [
    {
      id: 'owlberoth_skill_olhar_mistico',
      name: { pt: 'Olhar Místico', en: 'Mystic Gaze' },
      desc: {
        pt: 'Causa 3 de dano e revela 1 carta da mão do oponente.',
        en: 'Deals 3 damage and reveals 1 card from the opponent hand.',
      },
      cost: 2,
      type: 'damage_reveal',
      damage: 3,
      reveal: 1,
    },
    {
      id: 'owlberoth_skill_voo_noturno',
      name: { pt: 'Voo Noturno', en: 'Night Flight' },
      desc: {
        pt: 'Concede 1 de escudo a todos os aliados por 1 turno.',
        en: 'Grants 1 shield to all allies for 1 turn.',
      },
      cost: 2,
      type: 'team_shield',
      shield: 1,
      duration: 1,
    },
  ],
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'PIERCING_GAZE',
      name: { pt: 'Olhar Penetrante', en: 'Piercing Gaze' },
      desc: {
        pt: 'Ao entrar em campo, reduz a precisão de 1 inimigo em 1 por 1 turno.',
        en: 'When summoned, lowers 1 enemy accuracy by 1 for 1 turn.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'owlberoth_skill_reflexo_rapido',
      name: { pt: 'Reflexo Rápido', en: 'Quick Reflexes' },
      desc: {
        pt: 'Causa 2 de dano e ganha +1 velocidade por 2 turnos.',
        en: 'Deals 2 damage and gains +1 speed for 2 turns.',
      },
      cost: 1,
      effectType: 'damage_buff',
      damage: 2,
      buff: { stat: 'speed', value: 1, duration: 2 },
    },
    {
      level: 4,
      type: 'perk',
      id: 'PROTECTIVE_WISDOM',
      name: { pt: 'Sabedoria Protetora', en: 'Protective Wisdom' },
      desc: {
        pt: 'Recebe -1 de dano do primeiro ataque recebido em cada turno.',
        en: 'Takes -1 damage from the first attack received each turn.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'owlberoth_skill_escudo_sabio',
      name: { pt: 'Escudo Sábio', en: 'Wise Shield' },
      desc: {
        pt: 'Causa 3 de dano e concede 1 de escudo ao aliado com menor HP.',
        en: 'Deals 3 damage and grants 1 shield to the ally with the lowest HP.',
      },
      cost: 2,
      effectType: 'damage_shield_ally',
      damage: 3,
      shield: 1,
    },
    {
      level: 6,
      type: 'perk',
      id: 'NIGHT_BREATH',
      name: { pt: 'Fôlego Noturno', en: 'Night Breath' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 1 de HP.',
        en: 'When defeating an enemy, recovers 1 HP.',
      },
    },
    {
      level: 7,
      type: 'skill',
      id: 'owlberoth_skill_furia_encapuzada',
      name: { pt: 'Fúria Encapuzada', en: 'Hooded Fury' },
      desc: {
        pt: 'Causa 4 de dano. Se a moeda der cara, concede 1 de escudo a todos os aliados.',
        en: 'Deals 4 damage. On heads, grants 1 shield to all allies.',
      },
      cost: 2,
      effectType: 'damage_coin_team_shield',
      damage: 4,
      shield: 1,
    },
    {
      level: 8,
      type: 'perk',
      id: 'WATCHFUL_EYES',
      name: { pt: 'Olhos Vigilantes', en: 'Watchful Eyes' },
      desc: {
        pt: 'No início do turno, se houver inimigo revelado, ganha 1 de escudo.',
        en: 'At the start of the turn, if an enemy is revealed, gains 1 shield.',
      },
    },
    {
      level: 9,
      type: 'skill',
      id: 'owlberoth_skill_vigilancia_eterna',
      name: { pt: 'Vigilância Eterna', en: 'Eternal Vigilance' },
      desc: {
        pt: 'Causa 4 de dano e protege todos os aliados por 1 turno.',
        en: 'Deals 4 damage and protects all allies for 1 turn.',
      },
      cost: 3,
      effectType: 'damage_team_protect',
      damage: 4,
      shield: 1,
      duration: 1,
    },
    {
      level: 10,
      type: 'skill',
      id: 'owlberoth_skill_sentenca_sabio',
      name: { pt: 'Sentença do Sábio', en: "Sage's Sentence" },
      desc: {
        pt: 'Supremo: causa 4 de dano e concede 2 de escudo para todos os aliados.',
        en: 'Ultimate: deals 4 damage and grants 2 shield to all allies.',
      },
      cost: 4,
      effectType: 'ultimate_team_shield',
      damage: 4,
      shield: 2,
    },
  ],
};
