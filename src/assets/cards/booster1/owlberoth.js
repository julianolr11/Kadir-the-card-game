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
  hp: 4,
  abilities: [
    {
      name: { pt: 'Olhar Místico', en: 'Mystic Gaze' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Voo Noturno', en: 'Night Flight' },
      cost: 1,
      desc: {
        pt: 'Aliados recebem bônus de esquiva.',
        en: 'Allies gain an evasion bonus.',
      },
    },
  ],
  field: { pt: 'Noite Sagrada', en: 'Sacred Night' },
  fielddesc: {
    pt: 'Aliados têm 3% mais chance de esquiva enquanto Owlberoth estiver em campo.',
    en: 'Allies have 3% increased evasion while Owlberoth is on the field.',
  },
  storyTitle: { pt: 'Origem de Owlberoth', en: 'Origin of Owlberoth' },
  story: [
    {
      pt: 'Owlberoth é uma criatura mística, guardiã dos segredos da noite.',
      en: 'Owlberoth is a mystical creature, guardian of the secrets of the night.',
    },
    {
      pt: 'Seu olhar penetra as trevas e revela verdades ocultas.',
      en: 'Its gaze pierces the darkness and reveals hidden truths.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      unlockTable: [
        { level: 0, type: 'none' },
        // Nível 2 - Perk: Olhar Penetrante
        {
          level: 2,
          type: 'perk',
          id: 'PIERCING_GAZE',
          name: { pt: 'Olhar Penetrante', en: 'Piercing Gaze' },
          desc: {
            pt: 'Ganha +1 precisão ao entrar em campo.',
            en: 'Gain +1 accuracy when summoned.',
          },
        },
        // Nível 3 - Habilidade: Reflexo Rápido
        {
          level: 3,
          type: 'skill',
          id: 'owlberoth_skill_reflexo_rapido',
          name: { pt: 'Reflexo Rápido', en: 'Quick Reflexes' },
          desc: {
            pt: 'Causa 2 de dano e aumenta velocidade por 2 turnos.',
            en: 'Deals 2 damage and increases speed for 2 turns.',
          },
          cost: 1,
          type: 'damage_buff',
        },
        // Nível 4 - Perk: Sabedoria Protetora
        {
          level: 4,
          type: 'perk',
          id: 'PROTECTIVE_WISDOM',
          name: { pt: 'Sabedoria Protetora', en: 'Protective Wisdom' },
          desc: {
            pt: 'Recebe -1 de dano de ataques mágicos.',
            en: 'Takes -1 damage from magic attacks.',
          },
        },
        // Nível 5 - Habilidade: Escudo Sábio
        {
          level: 5,
          type: 'skill',
          id: 'owlberoth_skill_escudo_sabio',
          name: { pt: 'Escudo Sábio', en: 'Wise Shield' },
          desc: {
            pt: 'Causa 3 de dano e fornece escudo para o próximo turno.',
            en: 'Deals 3 damage and provides shield for the next turn.',
          },
          cost: 2,
          type: 'damage_shield',
        },
        // Nível 6 - Perk: Fôlego Noturno
        {
          level: 6,
          type: 'perk',
          id: 'NIGHT_BREATH',
          name: { pt: 'Fôlego Noturno', en: 'Night Breath' },
          desc: {
            pt: 'Ao derrotar um inimigo, recupera 1 de vida.',
            en: 'When defeating an enemy, recover 1 HP.',
          },
        },
        // Nível 7 - Habilidade: Fúria Encapuzada
        {
          level: 7,
          type: 'skill',
          id: 'owlberoth_skill_furia_encapuzada',
          name: { pt: 'Fúria Encapuzada', en: 'Hooded Fury' },
          desc: {
            pt: 'Causa 4 de dano e cria escudo permanente.',
            en: 'Deals 4 damage and creates a permanent shield.',
          },
          cost: 2,
          type: 'damage_permanent_shield',
        },
        // Nível 8 - Perk: Olhos Vigilantes
        {
          level: 8,
          type: 'perk',
          id: 'WATCHFUL_EYES',
          name: { pt: 'Olhos Vigilantes', en: 'Watchful Eyes' },
          desc: {
            pt: 'No início do turno, ganha 1 de escudo se estiver com precisão ativa.',
            en: 'At the start of the turn, gain 1 shield if accuracy is active.',
          },
        },
        // Nível 9 - Habilidade: Vigilância Eterna
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
          type: 'damage_team_protect',
        },
        // Nível 10 - Habilidade: Sentença do Sábio
        {
          level: 10,
          type: 'skill',
          id: 'owlberoth_skill_sentenca_sabio',
          name: { pt: 'Sentença do Sábio', en: "Sage's Sentence" },
          desc: {
            pt: 'Supremo: 4 de dano e cria escudo absoluto para todos os aliados.',
            en: 'Ultimate: 4 damage and creates absolute shield for all allies.',
          },
          cost: 4,
          type: 'ultimate_team_abs_shield',
        },
      ],
      cost: 2,
    },
    { level: 6, type: 'none' },
    { level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'owlberoth_skill_6',
      name: { pt: 'Vigiância Eterna', en: 'Eternal Vigilance' },
      desc: {
        pt: 'Causa 4 de dano e protege todos os aliados.',
        en: 'Deals 4 damage and protects all allies.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'owlberoth_skill_7',
      name: { pt: 'Sentença do Sábio', en: "Sage's Sentence" },
      desc: {
        pt: 'Supremo: 4 de dano e cria escudo absoluto para todos os aliados.',
        en: 'Ultimate: 4 damage and creates absolute shield for all allies.',
      },
      cost: 3,
    },
  ],
};
