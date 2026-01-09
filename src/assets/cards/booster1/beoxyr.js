// Card data for Beoxyr
module.exports = {
  id: 'beoxyr',
  title: { pt: 'Fornalha Oculta', en: 'Hidden Forge' },
  num: 26,
  height: 2.5,
  weakness: 'agua',
  name: { pt: 'Beoxyr', en: 'Beoxyr' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'fogo',
  img: require('../../img/creatures/beoxyr_bio.webp'),
  color: 'fire',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Chicote Incandescente', en: 'Incandescent Lash' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e queima o alvo (1 de dano por 2 turnos).',
        en: 'Deals 3 damage and burns the target (1 damage for 2 turns).',
      },
    },
    {
      name: { pt: 'Escamas de Brasa', en: 'Ember Scales' },
      cost: 1,
      desc: {
        pt: 'Ganha um escudo que nega o próximo ataque recebido por 1 rodada.',
        en: 'Gains a shield that negates the next attack taken for 1 round.',
      },
    },
  ],
  field: { pt: 'Caldeirão Vulcânico', en: 'Volcanic Cauldron' },
  fielddesc: {
    pt: 'Aliados de fogo ganham +6% ataque; primeiro golpe de cada inimigo recebe 1 de queimadura.',
    en: 'Fire allies gain +6% attack; each enemy takes 1 burn on their first strike.',
  },
  storyTitle: { pt: 'Brasas que Não Dormem', en: 'Embers That Never Sleep' },
  story: [
    {
      pt: 'Beoxyr ronda crateras antigas, onde o calor jamais cessou.',
      en: 'Beoxyr prowls ancient craters where the heat never died.',
    },
    {
      pt: 'Seu corpo exala fumaça brilhante, confundindo caçadores nas noites sem lua.',
      en: 'Its body exhales glowing smoke, confusing hunters on moonless nights.',
    },
    {
      pt: 'Dizem que forjou sua própria carapaça após devorar metais esquecidos.',
      en: 'They say it forged its own shell after devouring forgotten metals.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'beoxyr_skill_1',
      name: { pt: 'Mordida Brasífera', en: 'Brasiferous Bite' },
      desc: {
        pt: 'Causa 3 de dano e aplica queimadura 1 por 2 turnos.',
        en: 'Deals 3 damage and applies burn 1 for 2 turns.',
      },
      cost: 1,
      type: 'damage_dot',
    },
    {
      id: 'beoxyr_skill_2',
      name: { pt: 'Fôlego Vulcânico', en: 'Volcanic Breath' },
      desc: {
        pt: 'Causa 2 de dano em área e reduz defesa dos inimigos em 2% por 1 turno.',
        en: 'Deals 2 area damage and reduces enemy defense by 2% for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'beoxyr_blessing',
    name: { pt: 'Fogo que Persiste', en: 'Lingering Flame' },
    desc: {
      pt: 'Aliados de fogo ganham +3% ataque e queimadura causada dura +1 turno.',
      en: 'Fire allies gain +3% attack and applied burns last +1 turn.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'beoxyr_skill_3',
      name: { pt: 'Garras de Escória', en: 'Slag Claws' },
      desc: {
        pt: 'Causa 3 de dano e ignora 1 ponto de defesa.',
        en: 'Deals 3 damage and ignores 1 defense point.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'beoxyr_skill_4',
      name: { pt: 'Jato de Magma', en: 'Magma Jet' },
      desc: {
        pt: 'Causa 3 de dano em linha e aplica queimadura 1.',
        en: 'Deals 3 line damage and applies burn 1.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'beoxyr_skill_5',
      name: { pt: 'Casco Forjado', en: 'Forged Carapace' },
      desc: {
        pt: 'Ganha um escudo que nega os ataques recebidos por 2 rodadas.',
        en: 'Gains a shield that negates attacks taken for 2 rounds.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
    { level: 7, type: 'perk', id: 'CRIT_CHANCE' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'beoxyr_skill_6',
      name: { pt: 'Erupção Carmesim', en: 'Crimson Eruption' },
      desc: {
        pt: 'Causa 4 de dano e aumenta ataque de fogo aliado em 6% por 2 turnos.',
        en: 'Deals 4 damage and boosts fire ally attack by 6% for 2 turns.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'beoxyr_skill_7',
      name: { pt: 'Supremo: Forja Viva', en: 'Ultimate: Living Forge' },
      desc: {
        pt: 'Supremo: 4 de dano em área, aplica queimadura 2 e concede +10% ataque de fogo por 2 turnos aos aliados.',
        en: 'Ultimate: 4 area damage, applies burn 2, and grants allies +10% fire attack for 2 turns.',
      },
      cost: 3,
    },
  ],
};
