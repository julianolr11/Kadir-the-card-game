// Cartas de campo: todas as 12 variações

const fieldCards = [
  {
    id: 'field_field',
    name: 'Field',
    type: 'field',
    description: 'Criaturas do elemento Puro ou do tipo Monstro recebem +1 Dano / +1 HP neste campo. Criaturas Puras e Monstros recebem +2 Dano / +2 HP.',
    elementBoosts: { puro: 1 },
    cardTypeBoosts: { monstro: 1 },
    specialBoosts: {
      puroAndMonstro: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/field_resultado.webp'),
  },
  {
    id: 'field_aerial',
    name: 'Aerial',
    type: 'field',
    description: 'Criaturas de Ar ou do tipo Ave recebem +1 Dano / +1 HP neste campo. Criaturas de Ar e Ave recebem +2 Dano / +2 HP.',
    elementBoosts: { ar: 1 },
    cardTypeBoosts: { ave: 1 },
    specialBoosts: {
      arAndAve: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/aerial_resultado.webp'),
  },
  {
    id: 'field_beach',
    name: 'Beach',
    type: 'field',
    description: 'Criaturas de Água ou do tipo Fera recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Fera recebem +2 Dano / +2 HP.',
    elementBoosts: { agua: 1 },
    cardTypeBoosts: { fera: 1 },
    specialBoosts: {
      aguaAndFera: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/beach_resultado.webp'),
  },
  {
    id: 'field_desert',
    name: 'Desert',
    type: 'field',
    description: 'Criaturas de Terra ou do tipo Reptiloide recebem +1 Dano / +1 HP neste campo. Criaturas de Terra e Reptiloide recebem +2 Dano / +2 HP.',
    elementBoosts: { terra: 1 },
    cardTypeBoosts: { reptiloide: 1 },
    specialBoosts: {
      terraAndReptiloide: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/desert_resultado.webp'),
  },
  {
    id: 'field_draconic',
    name: 'Draconic',
    type: 'field',
    description: 'Criaturas do elemento Puro ou do tipo Draconídeo recebem +1 Dano / +1 HP neste campo. Criaturas Puras e Draconídeas recebem +2 Dano / +2 HP.',
    elementBoosts: { puro: 1 },
    cardTypeBoosts: { draconideo: 1 },
    specialBoosts: {
      puroAndDraconideo: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/draconic_resultado.webp'),
  },
  {
    id: 'field_mistic_forest',
    name: 'Mistic Forest',
    type: 'field',
    description: 'Criaturas de Ar ou do tipo Criatura Mística recebem +1 Dano / +1 HP neste campo. Criaturas de Ar e Criatura Mística recebem +2 Dano / +2 HP.',
    elementBoosts: { ar: 1 },
    cardTypeBoosts: { mistica: 1 },
    specialBoosts: {
      arAndMistica: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/mystic-forest_resultado.webp'),
  },
  {
    id: 'field_mountain',
    name: 'Mountain',
    type: 'field',
    description: 'Criaturas de Terra ou do tipo Fera recebem +1 Dano / +1 HP neste campo. Criaturas de Terra e Fera recebem +2 Dano / +2 HP.',
    elementBoosts: { terra: 1 },
    cardTypeBoosts: { fera: 1 },
    specialBoosts: {
      terraAndFera: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/mountain_resultado.webp'),
  },
  {
    id: 'field_ocean',
    name: 'Ocean',
    type: 'field',
    description: 'Criaturas de Água ou do tipo Criatura Mística recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Criatura Mística recebem +2 Dano / +2 HP.',
    elementBoosts: { agua: 1 },
    cardTypeBoosts: { mistica: 1 },
    specialBoosts: {
      aguaAndMistica: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/ocean_resultado.webp'),
  },
  {
    id: 'field_shadow_mountain',
    name: 'Shadow Mountain',
    type: 'field',
    description: 'Criaturas de Terra ou do tipo Criatura Sombria recebem +1 Dano / +1 HP neste campo. Criaturas de Terra e Criatura Sombria recebem +2 Dano / +2 HP.',
    elementBoosts: { terra: 1 },
    cardTypeBoosts: { sombria: 1 },
    specialBoosts: {
      terraAndSombria: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/shadow_resultado.webp'),
  },
  {
    id: 'field_snow',
    name: 'Snow',
    type: 'field',
    description: 'Criaturas de Água ou do tipo Ave recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Ave recebem +2 Dano / +2 HP.',
    elementBoosts: { agua: 1 },
    cardTypeBoosts: { ave: 1 },
    specialBoosts: {
      aguaAndAve: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/snow_resultado.webp'),
  },
  {
    id: 'field_swamp',
    name: 'Swamp',
    type: 'field',
    description: 'Criaturas de Água ou do tipo Reptiloide recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Reptiloide recebem +2 Dano / +2 HP.',
    elementBoosts: { agua: 1 },
    cardTypeBoosts: { reptiloide: 1 },
    specialBoosts: {
      aguaAndReptiloide: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/swamp_resultado.webp'),
  },
  {
    id: 'field_vulcanus',
    name: 'Vulcanus',
    type: 'field',
    description: 'Criaturas de Fogo ou do tipo Monstro recebem +1 Dano / +1 HP neste campo. Criaturas de Fogo e Monstro recebem +2 Dano / +2 HP.',
    elementBoosts: { fogo: 1 },
    cardTypeBoosts: { monstro: 1 },
    specialBoosts: {
      fogoAndMonstro: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/vulcanus_resultado.webp'),
  },
];

module.exports = fieldCards;
module.exports.default = fieldCards;
