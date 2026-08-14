// Card data for Terrakhal
module.exports = {
  id: 'terrakhal',
  title: { pt: 'Nômade do Deserto', en: 'Desert Nomad' },
  num: 29,
  height: 2.2,
  weakness: 'agua',
  name: { pt: 'Terrakhal', en: 'Terrakhal' },
  type: { pt: 'Ave', en: 'Bird' },
  element: 'terra',
  img: require('../../img/creatures/terrakhal_bio.webp'),
  color: 'earth',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Garras de Areia', en: 'Sand Claws' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano e aplica lentidão por 1 turno.',
        en: 'Deals 3 damage and applies slow for 1 turn.',
      },
    },
    {
      name: { pt: 'Tempestade de Pó', en: 'Dust Storm' },
      cost: 2,
      desc: {
        pt: 'Causa 2 de dano em área e reduz precisão de todos os inimigos em 1.',
        en: 'Deals 2 area damage and applies imprecision.',
      },
    },
  ],
  field: { pt: 'Areias Séculas', en: 'Ancient Sands' },
  fielddesc: {
    pt: 'Aliados de terra ganham +1 defesa e inimigos sofrem -1 velocidade enquanto Terrakhal estiver em campo.',
    en: 'Earth allies gain +1 defense and enemies suffer -1 speed while Terrakhal is on the field.',
  },
  storyTitle: { pt: 'Viajante das Dunas Eternas', en: 'Traveler of Eternal Dunes' },
  story: [
    {
      pt: 'Terrakhal voa sobre desertos sem fim, carregando segredos de oásis perdidos.',
      en: 'Terrakhal soars over endless deserts, carrying secrets of lost oases.',
    },
    {
      pt: 'Sua jornada não tem destino; apenas o vento quente e a poeira dourada.',
      en: 'Its journey has no destination; only hot wind and golden dust.',
    },
    {
      pt: 'Diz-se que se segui-lo, encontrará água em qualquer seca.',
      en: 'They say if you follow it, you will find water in any drought.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'terrakhal_skill_1',
      name: { pt: 'Bico Rochoso', en: 'Rocky Beak' },
      desc: {
        pt: 'Causa 3 de dano e ignora 1 ponto de defesa.',
        en: 'Deals 3 damage and ignores 1 defense point.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'terrakhal_skill_2',
      name: { pt: 'Abraço da Terra', en: 'Earth Embrace' },
      desc: {
        pt: 'Ganha 2 de escudo, reduz o dano recebido em 1 e ganha +1 defesa.',
        en: 'Gains 2 shield, reduces damage taken by 1, and gains +1 defense.',
      },
      cost: 1,
      type: 'buff',
    },
  ],
  defaultBlessing: {
    id: 'terrakhal_blessing',
    name: { pt: 'Rota Antiga', en: 'Ancient Route' },
    desc: {
      pt: 'Aliados de terra ganham +1 defesa e +1 precisão enquanto Terrakhal estiver em campo.',
      en: 'Earth allies gain +1 defense and +1 accuracy while Terrakhal is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'terrakhal_skill_3',
      name: { pt: 'Tremor Terrestre', en: 'Earth Tremor' },
      desc: {
        pt: 'Causa 3 de dano e reduz velocidade de todos em 1 por 1 turno.',
        en: 'Deals 3 damage and applies slow for 1 turn.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'terrakhal_skill_4',
      name: { pt: 'Arenito Impiedoso', en: 'Merciless Sandstone' },
      desc: {
        pt: 'Causa 3 de dano e reduz precisão do alvo em 1 por 2 turnos.',
        en: 'Deals 3 damage and applies imprecision for 2 turns.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'terrakhal_skill_5',
      name: { pt: 'Crosta Protetora', en: 'Protective Crust' },
      desc: {
        pt: 'Ganha 3 de escudo e +1 resistência por 2 turnos.',
        en: 'Gains 3 shield and +1 resistance for 2 turns.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'DEFENSE_REDUCTION' },
    { level: 7, type: 'perk', id: 'CRIT_CHANCE' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'terrakhal_skill_6',
      name: { pt: 'Duna Enfurecida', en: 'Raging Dune' },
      desc: {
        pt: 'Causa 4 de dano em área e ganha +1 defesa por 2 turnos.',
        en: 'Deals 4 area damage and gains +1 defense for 2 turns.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'terrakhal_skill_7',
      name: { pt: 'Supremo: Miragem Eterna', en: 'Ultimate: Eternal Mirage' },
      desc: {
        pt: 'Supremo: 4 de dano em todos, reduz velocidade dos inimigos em 1 e concede +1 defesa a aliados de terra por 2 turnos.',
        en: 'Ultimate: 4 damage to all, applies slow, and grants earth allies +1 defense for 2 turns.',
      },
      cost: 3,
    },
  ],
};
