// Card data for Draak
module.exports = {
  id: 'draak',
  title: { pt: 'Olhos de esmeralda', en: 'Emerald Eyes' },
  num: 1,
  height: 3.1,
  weakness: 'puro',
  name: { pt: 'Draak', en: 'Draak' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'puro',
  img: require('../../img/creatures/draak_bio.webp'),
  color: 'pure',
  hp: 9,
  abilities: [
    {
      name: { pt: 'Sopro Etéreo', en: 'Ethereal Breath' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Escamas Celestes', en: 'Sky Scales' },
      cost: 1,
      desc: {
        pt: 'Reduz dano recebido em 3%.',
        en: 'Reduces damage taken by 3%.',
      },
    },
  ],
  field: { pt: 'Céu Cristalino', en: 'Crystal Sky' },
  fielddesc: {
    pt: 'Aumenta dano de ar em 3% enquanto Draak estiver em campo.',
    en: 'Increases air damage by 3% while Draak is on the field.',
  },
  storyTitle: { pt: 'Origem de Draak', en: 'Origin of Draak' },
  story: [
    {
      pt: 'Draak é um draconídeo puro, nascido da essência dos lugares mais pacíficos do mundo, destinado desde sua criação a ser um guardião da harmonia. Seus olhos de esmeralda, profundos e penetrantes, refletem não apenas sua majestade, mas também a sabedoria ancestral que observa todas as criaturas. Raro e quase mítico, Draak é considerado um presságio de boa sorte - viajantes que têm o privilégio de avistá-lo acreditam estar sob proteção divina.',
      en: 'Draak is a pure draconid, born from the essence of the most peaceful places in the world, destined since its creation to be a guardian of harmony. Its emerald eyes, deep and piercing, reflect not only its majesty but also the ancestral wisdom that watches over all creatures. Rare and almost mythical, Draak is considered a sign of good fortune - travelers who are privileged to see it believe they are under divine protection.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'draak_skill_grito_draconico',
      name: { pt: 'Grito Dracônico', en: 'Draconic Roar' },
      desc: {
        pt: 'Causa 3 de dano e atordoa o inimigo.',
        en: 'Deals 3 damage and stuns the enemy.',
      },
      cost: 1,
      type: 'damage_stun',
      damage: 3,
      statusEffect: 'stun',
      duration: 1,
    },
    {
      id: 'draak_skill_escama_destruidora',
      name: { pt: 'Escama Destruidora', en: 'Destroyer Scale' },
      desc: {
        pt: 'Causa 2 de dano e ignora 5% da defesa inimiga.',
        en: 'Deals 2 damage and ignores 5% of enemy defense.',
      },
      cost: 1,
      type: 'damage_shieldpierce',
      damage: 2,
    },
  ],
  defaultBlessing: {
    id: 'draak_blessing',
    name: { pt: 'Força Dracônica', en: 'Draconic Strength' },
    desc: {
      pt: 'Ataque aumenta em 3% enquanto Draak estiver em campo.',
      en: 'Attack increased by 3% while Draak is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Instinto Dracônico
    {
      level: 2,
      type: 'perk',
      id: 'DRACONIC_INSTINCT',
      name: { pt: 'Instinto Dracônico', en: 'Draconic Instinct' },
      desc: {
        pt: 'Ganha +1 esquiva ao entrar em campo.',
        en: 'Gain +1 evasion when summoned.',
      },
    },
    // Nível 3 - Habilidade: Sopro Etéreo
    {
      level: 3,
      type: 'skill',
      id: 'draak_skill_sopro_etereo',
      name: { pt: 'Sopro Etéreo', en: 'Ethereal Breath' },
      desc: {
        pt: 'Causa 2 de dano e reduz ataque do alvo por 1 turno.',
        en: 'Deals 2 damage and reduces target attack for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    // Nível 4 - Perk: Escamas Protetoras
    {
      level: 4,
      type: 'perk',
      id: 'PROTECTIVE_SCALES',
      name: { pt: 'Escamas Protetoras', en: 'Protective Scales' },
      desc: {
        pt: 'Recebe -1 de dano de ataques mágicos.',
        en: 'Takes -1 damage from magic attacks.',
      },
    },
    // Nível 5 - Habilidade: Cauda Cortante
    {
      level: 5,
      type: 'skill',
      id: 'draak_skill_cauda_cortante',
      name: { pt: 'Cauda Cortante', en: 'Cutting Tail' },
      desc: {
        pt: 'Causa 2 de dano e 50% de chance de sangrar por 2 turnos.',
        en: 'Deals 2 damage and 50% chance to bleed for 2 turns.',
      },
      cost: 1,
      type: 'damage_bleed',
    },
    // Nível 6 - Perk: Fôlego dos Céus
    {
      level: 6,
      type: 'perk',
      id: 'SKY_BREATH',
      name: { pt: 'Fôlego dos Céus', en: 'Sky Breath' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 1 de vida.',
        en: 'When defeating an enemy, recover 1 HP.',
      },
    },
    // Nível 7 - Habilidade: Rajada Ascendente
    {
      level: 7,
      type: 'skill',
      id: 'draak_skill_rajada_ascendente',
      name: { pt: 'Rajada Ascendente', en: 'Ascending Gust' },
      desc: {
        pt: 'Causa 3 de dano e empurra o alvo para trás.',
        en: 'Deals 3 damage and pushes the target back.',
      },
      cost: 2,
      type: 'damage_push',
    },
    // Nível 8 - Perk: Olhos Vigilantes
    {
      level: 8,
      type: 'perk',
      id: 'WATCHFUL_EYES',
      name: { pt: 'Olhos Vigilantes', en: 'Watchful Eyes' },
      desc: {
        pt: 'No início do turno, ganha 1 de escudo se estiver com esquiva ativa.',
        en: 'At the start of the turn, gain 1 shield if evasion is active.',
      },
    },
    // Nível 9 - Habilidade: Grito Dracônico
    {
      level: 9,
      type: 'skill',
      id: 'draak_skill_grito_draconico',
      name: { pt: 'Grito Dracônico', en: 'Draconic Roar' },
      desc: {
        pt: 'Causa 4 de dano e atordoa o inimigo.',
        en: 'Deals 4 damage and stuns the enemy.',
      },
      cost: 3,
      type: 'damage_stun',
    },
    // Nível 10 - Habilidade: Fúria Celeste
    {
      level: 10,
      type: 'skill',
      id: 'draak_skill_furia_celeste',
      name: { pt: 'Fúria Celeste', en: 'Celestial Fury' },
      desc: {
        pt: 'Supremo: 5 de dano e reduz defesa de todos os inimigos.',
        en: 'Ultimate: 5 damage and reduces all enemies defense.',
      },
      cost: 4,
      type: 'ultimate_aoe_def_down',
    },
  ],
};
