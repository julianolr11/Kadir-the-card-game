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
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e reduz velocidade do alvo em 5% por 1 turno.',
        en: 'Deals 3 damage and reduces target speed by 5% for 1 turn.',
      },
    },
    {
      name: { pt: 'Tempestade de Pó', en: 'Dust Storm' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano em área e reduz precisão de todos os inimigos em 6%.',
        en: 'Deals 2 area damage and lowers all enemy accuracy by 6%.',
      },
    },
  ],
  field: { pt: 'Areias Séculas', en: 'Ancient Sands' },
  fielddesc: {
    pt: 'Aliados de terra ganham +5% defesa e velocidade reduzida de inimigos em +3% enquanto Terrakhal estiver em campo.',
    en: 'Earth allies gain +5% defense and enemy speed reduction is +3% higher while Terrakhal is on the field.',
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
        pt: 'Ganha escudo 2, reduz dano recebido em 3% e aumenta defesa em 2%.',
        en: 'Gains 2 shield, reduces damage taken by 3%, and increases defense by 2%.',
      },
      cost: 1,
      type: 'buff',
    },
  ],
  defaultBlessing: {
    id: 'terrakhal_blessing',
    name: { pt: 'Rota Antiga', en: 'Ancient Route' },
    desc: {
      pt: 'Aliados de terra ganham +3% defesa e +6% precisão enquanto Terrakhal estiver em campo.',
      en: 'Earth allies gain +3% defense and +6% accuracy while Terrakhal is on the field.',
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
        pt: 'Causa 3 de dano e reduz velocidade de todos por 4% por 1 turno.',
        en: 'Deals 3 damage and reduces all speed by 4% for 1 turn.',
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
        pt: 'Causa 3 de dano e reduz precisão do alvo em 8% por 2 turnos.',
        en: 'Deals 3 damage and lowers target accuracy by 8% for 2 turns.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'terrakhal_skill_5',
      name: { pt: 'Crosta Protetora', en: 'Protective Crust' },
      desc: {
        pt: 'Ganha 3 de escudo e +12% resistência por 2 turnos.',
        en: 'Gains 3 shield and +12% resistance for 2 turns.',
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
        pt: 'Causa 4 de dano em área e aumenta defesa pessoal em 5% por 2 turnos.',
        en: 'Deals 4 area damage and increases own defense by 5% for 2 turns.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'terrakhal_skill_7',
      name: { pt: 'Supremo: Miragem Eterna', en: 'Ultimate: Eternal Mirage' },
      desc: {
        pt: 'Supremo: 4 de dano em todos, reduz velocidade de inimigos em 15% e concede +8% defesa a aliados de terra por 2 turnos.',
        en: 'Ultimate: 4 damage to all, reduces enemy speed by 15%, and grants earth allies +8% defense for 2 turns.',
      },
      cost: 3,
    },
  ],
};
