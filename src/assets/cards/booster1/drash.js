// Card data for Drash
module.exports = {
  id: 'drash',
  title: { pt: 'Olhos de rubi', en: 'Ruby Eyes' },
  num: 47,
  height: 3.3,
  weakness: 'agua',
  name: { pt: 'Drash', en: 'Drash' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'fogo',
  img: require('../../img/creatures/drash_bio.webp'),
  // Retrato quadrado (1254x1254) com a cabeça bem no topo - desloca o corte pra cima pra
  // não cortar os chifres.
  imgPosition: 'center 15%',
  color: 'fire',
  hp: 9,
  abilities: [
    {
      name: { pt: 'Rugido Incandescente', en: 'Incandescent Roar' },
      cost: 2,
      desc: {
        pt: 'Causa 2 de dano e queima o inimigo por 1 rodada.',
        en: 'Deals 2 damage and burns the enemy for 1 round.',
      },
      damage: 2,
      statusEffect: 'burn',
      duration: 1,
    },
    {
      name: { pt: 'Alcance Flamejante', en: 'Blazing Reach' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano e retira qualquer escudo ativo do alvo inimigo.',
        en: 'Deals 3 damage and removes any active shield from the enemy target.',
      },
      damage: 3,
      removeShield: true,
    },
  ],
  field: { pt: 'Cume em Brasa', en: 'Ember Peak' },
  fielddesc: {
    pt: 'Criaturas de fogo causam +1 dano no primeiro ataque enquanto Drash estiver em campo.',
    en: 'Fire creatures deal +1 damage on their first attack while Drash is on the field.',
  },
  storyTitle: { pt: 'Origem de Drash', en: 'Origin of Drash' },
  story: [
    {
      pt: 'Drash nasceu no coração de um vulcão adormecido, no exato instante em que o sol se pôs sobre os picos mais altos do mundo. Seus olhos de rubi ardem como brasa e enxergam através da fumaça e da escuridão. Guerreiros dizem que avistar Drash ao entardecer é um sinal de que uma grande batalha está por vir - e que a vitória sorri para os corajosos.',
      en: 'Drash was born in the heart of a dormant volcano, at the exact moment the sun set over the highest peaks of the world. Its ruby eyes burn like embers and see through smoke and darkness. Warriors say that sighting Drash at dusk is a sign that a great battle is coming - and that victory smiles upon the brave.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'drash_skill_rugido_incandescente',
      name: { pt: 'Rugido Incandescente', en: 'Incandescent Roar' },
      desc: {
        pt: 'Causa 2 de dano e queima o inimigo por 1 rodada.',
        en: 'Deals 2 damage and burns the enemy for 1 round.',
      },
      cost: 2,
      type: 'damage_burn',
      damage: 2,
      statusEffect: 'burn',
      duration: 1,
    },
    {
      id: 'drash_skill_alcance_flamejante',
      name: { pt: 'Alcance Flamejante', en: 'Blazing Reach' },
      desc: {
        pt: 'Causa 3 de dano e retira qualquer escudo ativo do alvo inimigo.',
        en: 'Deals 3 damage and removes any active shield from the enemy target.',
      },
      cost: 2,
      type: 'damage_remove_shield',
      damage: 3,
      removeShield: true,
    },
  ],
  defaultBlessing: {
    id: 'drash_blessing',
    name: { pt: 'Fúria Crescente', en: 'Growing Fury' },
    desc: {
      pt: 'Seu dano aumenta em +1 cada vez que esta carta ataca.',
      en: 'Its damage increases by +1 each time this card attacks.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'HP_PLUS_1',
      name: { pt: 'Instinto Flamejante', en: 'Blazing Instinct' },
      desc: {
        pt: 'Ganha +1 de vida.',
        en: 'Gains +1 health.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'drash_skill_sopro_ardente',
      name: { pt: 'Sopro Ardente', en: 'Ardent Breath' },
      desc: {
        pt: 'Causa 2 de dano e deixa o alvo dormindo por 2 turnos.',
        en: 'Deals 2 damage and puts the target to sleep for 2 turns.',
      },
      cost: 1,
      damage: 2,
      statusEffect: 'sleep',
      duration: 2,
    },
    {
      level: 4,
      type: 'perk',
      id: 'PROTECTIVE_SCALES',
      name: { pt: 'Escamas Vulcânicas', en: 'Volcanic Scales' },
      desc: {
        pt: 'O primeiro ataque que receber será sempre negado.',
        en: 'The first attack it receives is always negated.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'drash_skill_cauda_flamejante',
      name: { pt: 'Cauda Flamejante', en: 'Blazing Tail' },
      desc: {
        pt: 'Causa 2 de dano e joga 1 moeda; se der cara, causa queimadura por 2 turnos.',
        en: 'Deals 2 damage and flips 1 coin; on heads, causes burn for 2 turns.',
      },
      cost: 1,
      damage: 2,
      coinStatusEffect: 'burn',
      coinStatusDuration: 2,
      coinStatusValue: 1,
    },
    {
      level: 7,
      type: 'skill',
      id: 'drash_skill_folego_de_rubi',
      name: { pt: 'Fôlego de Rubi', en: 'Ruby Breath' },
      desc: {
        pt: 'Causa 3 de dano; se derrotar o inimigo, recupera 2 de vida.',
        en: 'Deals 3 damage; if it defeats the enemy, recovers 2 health.',
      },
      cost: 2,
      damage: 3,
      healOnKill: 2,
    },
    {
      level: 8,
      type: 'skill',
      id: 'drash_skill_golpe_vulcanico',
      name: { pt: 'Golpe Vulcânico', en: 'Volcanic Strike' },
      desc: {
        pt: 'Causa 2 de dano; graças à fúria crescente de Drash, esse dano aumenta permanentemente em +1 a cada ataque.',
        en: "Deals 2 damage; thanks to Drash's growing fury, this damage permanently increases by +1 with each attack.",
      },
      cost: 1,
      damage: 2,
    },
    {
      level: 9,
      type: 'perk',
      id: 'EXTRA_STAMINA',
      name: { pt: 'Estâmina Extra', en: 'Extra Stamina' },
      desc: {
        pt: 'Ao ser invocado, se houver outro dragão em campo, ganha +1 de ataque.',
        en: 'When summoned, if another dragon is on the field, gains +1 attack.',
      },
    },
    {
      level: 10,
      type: 'skill',
      id: 'drash_skill_furia_de_rubi',
      name: { pt: 'Fúria de Rubi', en: 'Ruby Fury' },
      desc: {
        pt: 'Causa 4 de dano e joga 1 moeda; se der cara, causa +2 de dano; se der coroa, recebe 2 de dano.',
        en: 'Deals 4 damage and flips 1 coin; on heads, deals +2 damage; on tails, takes 2 damage.',
      },
      cost: 2,
      damage: 4,
      coinExtraDamage: 2,
      coinSelfDamage: 2,
    },
  ],
};
