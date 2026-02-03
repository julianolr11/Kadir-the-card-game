// Cartas de Efeito - Habilidades especiais que podem ser jogadas durante o turno do player
// Imagens localizadas em: src/assets/img/effect-cards/

const effectCards = [
  {
    id: 'effect_buymeacard',
    num: 1,
    name: { pt: 'Compre uma Carta', en: 'Buy Me a Card' },
    type: 'effect',
    element: 'puro',
    cost: 0, // Cartas de efeito não custam essência
    img: 'assets/img/effect-cards/buymeacard_resultado.webp',
    description: {
      pt: 'Permite ao player comprar +1 carta do baralho',
      en: 'Allows the player to draw +1 card from the deck'
    },
    effectType: 'draw',
    effectValue: 1,
    targetType: 'self', // Não requer seleção de alvo
    duration: 0, // Efeito imediato
    color: 'pure'
  },

  {
    id: 'effect_change_critical',
    num: 2,
    name: { pt: 'Troca Crítica', en: 'Change Critical' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/change-critical_resultado.webp',
    description: {
      pt: 'Troca um monstro do seu lado do campo pelo monstro do lado do campo do adversário',
      en: 'Swap one of your field monsters with one of the opponent\'s field monsters'
    },
    effectType: 'swap',
    targetType: 'dual', // Requer seleção de alvo (seu monstro + monstro inimigo)
    duration: 0,
    color: 'pure'
  },

  {
    id: 'effect_essence_fluid',
    num: 3,
    name: { pt: 'Fluido de Essência', en: 'Essence Fluid' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/essence-fluid_resultado.webp',
    description: {
      pt: 'Dá +2 de essência ao usuário',
      en: 'Grants +2 essence to the user'
    },
    effectType: 'essence',
    effectValue: 2,
    targetType: 'self',
    duration: 0,
    color: 'pure'
  },

  {
    id: 'effect_final_meteor',
    num: 4,
    name: { pt: 'Meteoro Final', en: 'Final Meteor' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/final-meteor_resultado.webp',
    description: {
      pt: 'Inflige +2 de dano a todos os monstros no campo do adversário',
      en: 'Deals +2 damage to all monsters on the opponent\'s field'
    },
    effectType: 'damageAll',
    effectValue: 2,
    targetType: 'allEnemies',
    duration: 0,
    color: 'pure'
  },

  {
    id: 'effect_jewel_of_life',
    num: 5,
    name: { pt: 'Joia da Vida', en: 'Jewel of Life' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/jewel-of-life_resultado.webp',
    description: {
      pt: 'Dá +2 orbes de vida (HP) ao usuário',
      en: 'Grants +2 life orbs (HP) to the user'
    },
    effectType: 'heal',
    effectValue: 2,
    targetType: 'self',
    duration: 0,
    color: 'pure'
  },

  {
    id: 'effect_protect_shield',    num: 6,    name: { pt: 'Escudo Protetor', en: 'Protect Shield' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: require('../img/effect-cards/protect-shield_resultado.webp'),
    description: {
      pt: 'Dá +2 de escudo para uma criatura no seu campo',
      en: 'Grants +2 shield to one creature on your field'
    },
    effectType: 'shield',
    effectValue: 2,
    targetType: 'allyMonster', // Requer seleção de alvo (monstro aliado)
    duration: 0,
    color: 'pure'
  },

  {
    id: 'effect_reverse_buy',
    num: 7,
    name: { pt: 'Compra Reversa', en: 'Reverse Buy' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/reverse-buy_resultado.webp',
    description: {
      pt: 'O player compra uma carta do baralho do adversário',
      en: 'Draw one card from the opponent\'s deck'
    },
    effectType: 'drawOpponent',
    effectValue: 1,
    targetType: 'opponent',
    duration: 0,
    color: 'pure'
  },

  {
    id: 'effect_spectrum_graveyard',    num: 8,    name: { pt: 'Sepultura do Espectro', en: 'Spectrum Graveyard' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/spectrum-graveyard_resultado.webp',
    description: {
      pt: 'Permite ressuscitar uma criatura do cemitério por 1 turno para atacar, depois retorna ao cemitério',
      en: 'Resurrect one creature from the graveyard for 1 turn to attack, then return to graveyard'
    },
    effectType: 'resurrect',
    targetType: 'graveyardCreature', // Requer seleção de alvo (criatura no cemitério)
    duration: 1, // Dura 1 turno
    color: 'pure'
  },

  {
    id: 'effect_theatre_ilusion',    num: 9,    name: { pt: 'Ilusão de Teatro', en: 'Theatre Illusion' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/theatre-ilusion_resultado.webp',
    description: {
      pt: 'Permite controlar uma criatura do oponente por 1 turno',
      en: 'Control one opponent\'s creature for 1 turn'
    },
    effectType: 'control',
    targetType: 'enemyMonster', // Requer seleção de alvo (monstro inimigo)
    duration: 1, // Dura 1 turno
    color: 'pure'
  },

  {
    id: 'effect_the_great_wall',    num: 10,    name: { pt: 'O Grande Muro', en: 'The Great Wall' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/the-great-wall_resultado.webp',
    description: {
      pt: 'Concede +2 de escudo a todas as criaturas do seu lado por 2 turnos',
      en: 'Grant +2 shield to all your creatures for 2 turns'
    },
    effectType: 'shieldAll',
    effectValue: 2,
    targetType: 'allAllies',
    duration: 2, // Dura 2 turnos
    color: 'pure'
  },

  {
    id: 'effect_void_jar',
    num: 11,
    name: { pt: 'Frasco do Vazio', en: 'Void Jar' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/void-jar_resultado.webp',
    description: {
      pt: 'Manda todas as criaturas do campo do adversário para o cemitério',
      en: 'Send all opponent\'s field creatures to the graveyard'
    },
    effectType: 'destroyAll',
    targetType: 'allEnemies',
    duration: 0, // Efeito imediato
    color: 'pure'
  },

  {
    id: 'effect_wrath_of_judgement',
    num: 12,
    name: { pt: 'Ira do Julgamento', en: 'Wrath of Judgement' },
    type: 'effect',
    element: 'puro',
    cost: 0,
    img: 'assets/img/effect-cards/wrath-ofjudgement_resultado.webp',
    description: {
      pt: 'Dá +2 de dano a uma criatura no seu campo por 1 turno',
      en: 'Grant +2 damage to one of your creatures for 1 turn'
    },
    effectType: 'damageBuff',
    effectValue: 2,
    targetType: 'allyMonster', // Requer seleção de alvo (monstro aliado)
    duration: 1, // Dura 1 turno
    color: 'pure'
  }
];

module.exports = effectCards;
