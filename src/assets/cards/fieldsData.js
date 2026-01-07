// Dados das cartas de campo do jogo
// Cada campo tem: nome, elemento, tipo favorecido, imagem, efeito

const fieldsData = [
  {
    id: 'aerial',
    name: 'Aerial',
    emoji: '🌤️',
    element: 'Ar',
    type: 'Ave',
    image: '/assets/img/scene-board/aerial_resultado.webp',
    effect: 'Criaturas de Ar ou do tipo Ave recebem +1 Dano / +1 HP neste campo. Criaturas de Ar e Ave recebem +2 Dano / +2 HP.'
  },
  {
    id: 'beach',
    name: 'Beach',
    emoji: '🏖️',
    element: 'Água',
    type: 'Fera',
    image: '/assets/img/scene-board/beach_resultado.webp',
    effect: 'Criaturas de Água ou do tipo Fera recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Fera recebem +2 Dano / +2 HP.'
  },
  {
    id: 'desert',
    name: 'Desert',
    emoji: '🏜️',
    element: 'Terra',
    type: 'Reptiloide',
    image: '/assets/img/scene-board/desert_resultado.webp',
    effect: 'Criaturas de Terra ou do tipo Reptiloide recebem +1 Dano / +1 HP neste campo. Criaturas de Terra e Reptiloide recebem +2 Dano / +2 HP.'
  },
  {
    id: 'draconic',
    name: 'Draconic',
    emoji: '🐉',
    element: 'Puro',
    type: 'Draconídeo',
    image: '/assets/img/scene-board/draconic_resultado.webp',
    effect: 'Criaturas do elemento Puro ou do tipo Draconídeo recebem +1 Dano / +1 HP neste campo. Criaturas Puras e Draconídeas recebem +2 Dano / +2 HP.'
  },
  {
    id: 'field',
    name: 'Field',
    emoji: '🌾',
    element: 'Puro',
    type: 'Monstro',
    image: '/assets/img/scene-board/field_resultado.webp',
    effect: 'Criaturas do elemento Puro ou do tipo Monstro recebem +1 Dano / +1 HP neste campo. Criaturas Puras e Monstros recebem +2 Dano / +2 HP.'
  },
  {
    id: 'mountain',
    name: 'Mountain',
    emoji: '⛰️',
    element: 'Terra',
    type: 'Fera',
    image: '/assets/img/scene-board/mountain_resultado.webp',
    effect: 'Criaturas de Terra ou do tipo Fera recebem +1 Dano / +1 HP neste campo. Criaturas de Terra e Fera recebem +2 Dano / +2 HP.'
  },
  {
    id: 'shadow_mountain',
    name: 'Shadow Mountain',
    emoji: '🌑',
    element: 'Terra',
    type: 'Criatura Sombria',
    image: '/assets/img/scene-board/shadow_mountain_resultado.webp',
    effect: 'Criaturas de Terra ou do tipo Criatura Sombria recebem +1 Dano / +1 HP neste campo. Criaturas de Terra e Criatura Sombria recebem +2 Dano / +2 HP.'
  },
  {
    id: 'snow',
    name: 'Snow',
    emoji: '❄️',
    element: 'Água',
    type: 'Ave',
    image: '/assets/img/scene-board/snow_resultado.webp',
    effect: 'Criaturas de Água ou do tipo Ave recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Ave recebem +2 Dano / +2 HP.'
  },
  {
    id: 'swamp',
    name: 'Swamp',
    emoji: '🐊',
    element: 'Água',
    type: 'Reptiloide',
    image: '/assets/img/scene-board/swamp_resultado.webp',
    effect: 'Criaturas de Água ou do tipo Reptiloide recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Reptiloide recebem +2 Dano / +2 HP.'
  },
  {
    id: 'vulcanus',
    name: 'Vulcanus',
    emoji: '🌋',
    element: 'Fogo',
    type: 'Monstro',
    image: '/assets/img/scene-board/vulcanus_resultado.webp',
    effect: 'Criaturas de Fogo ou do tipo Monstro recebem +1 Dano / +1 HP neste campo. Criaturas de Fogo e Monstro recebem +2 Dano / +2 HP.'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    element: 'Água',
    type: 'Criatura Mística',
    image: '/assets/img/scene-board/ocean_resultado.webp',
    effect: 'Criaturas de Água ou do tipo Criatura Mística recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Criatura Mística recebem +2 Dano / +2 HP.'
  },
  {
    id: 'mistic_forest',
    name: 'Mistic Forest',
    emoji: '🌲',
    element: 'Ar',
    type: 'Criatura Mística',
    image: '/assets/img/scene-board/mistic_forest_resultado.webp',
    effect: 'Criaturas de Ar ou do tipo Criatura Mística recebem +1 Dano / +1 HP neste campo. Criaturas de Ar e Criatura Mística recebem +2 Dano / +2 HP.'
  }
];

export default fieldsData;
