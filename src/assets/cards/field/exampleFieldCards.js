// Cartas de campo: todas as 12 variações

const fieldCards = [
  {
    id: 'F001',
    legacyId: 'field_field',
    name: 'Field',
    type: 'field',
    element: 'Puro',
    fieldType: 'Monstro',
    lore: 'Um campo fértil e exuberante, cheio de vida selvagem. Local perfeito para criaturas que prosperam na natureza primitiva.',
    description: 'Criaturas do elemento Puro ou do tipo Monstro recebem +1 Dano / +1 HP neste campo. Criaturas Puras e Monstros recebem +2 Dano / +2 HP.',
    elementBoosts: { puro: 1 },
    cardTypeBoosts: { monstro: 1 },
    specialBoosts: {
      puroAndMonstro: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/field_resultado.webp'),
  },
  {
    id: 'F002',
    legacyId: 'field_aerial',
    name: 'Aerial',
    type: 'field',
    element: 'Ar',
    fieldType: 'Ave',
    lore: 'Céus cristalinos e tempestades etéreas. As correntes de ar dançam livremente, energizando todo ser que voa.',
    description: 'Criaturas de Ar ou do tipo Ave recebem +1 Dano / +1 HP neste campo. Criaturas de Ar e Ave recebem +2 Dano / +2 HP.',
    elementBoosts: { ar: 1 },
    cardTypeBoosts: { ave: 1 },
    specialBoosts: {
      arAndAve: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/aerial_resultado.webp'),
  },
  {
    id: 'F003',
    legacyId: 'field_beach',
    name: 'Beach',
    type: 'field',
    element: 'Água',
    fieldType: 'Fera',
    lore: 'Uma praia tranquila banhada pelo mar. As ondas suaves trazem poder e vitalidade às criaturas aquáticas.',
    description: 'Criaturas de Água ou do tipo Fera recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Fera recebem +2 Dano / +2 HP.',
    elementBoosts: { agua: 1 },
    cardTypeBoosts: { fera: 1 },
    specialBoosts: {
      aguaAndFera: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/beach_resultado.webp'),
  },
  {
    id: 'F004',
    legacyId: 'field_desert',
    name: 'Desert',
    type: 'field',
    element: 'Terra',
    fieldType: 'Reptiloide',
    lore: 'Um deserto árido e desolado, sob um sol implacável. As criaturas que sobrevivem aqui são fortes e resilientes.',
    description: 'Criaturas de Terra ou do tipo Reptiloide recebem +1 Dano / +1 HP neste campo. Criaturas de Terra e Reptiloide recebem +2 Dano / +2 HP.',
    elementBoosts: { terra: 1 },
    cardTypeBoosts: { reptiloide: 1 },
    specialBoosts: {
      terraAndReptiloide: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/desert_resultado.webp'),
  },
  {
    id: 'F005',
    legacyId: 'field_draconic',
    name: 'Draconic',
    type: 'field',
    element: 'Puro',
    fieldType: 'Draconídeo',
    lore: 'Um reino sagrado onde os dragões reinam supremos. A magia ancestral permeia cada sopro de vento.',
    description: 'Criaturas do elemento Puro ou do tipo Draconídeo recebem +1 Dano / +1 HP neste campo. Criaturas Puras e Draconídeas recebem +2 Dano / +2 HP.',
    elementBoosts: { puro: 1 },
    cardTypeBoosts: { draconideo: 1 },
    specialBoosts: {
      puroAndDraconideo: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/draconic_resultado.webp'),
  },
  {
    id: 'F006',
    legacyId: 'field_mistic_forest',
    name: 'Mistic Forest',
    type: 'field',
    element: 'Ar',
    fieldType: 'Criatura Mística',
    lore: 'Uma floresta enevoada e mágica, onde a realidade se dobra às vontades sobrenaturais. Mistério flutua no ar.',
    description: 'Criaturas de Ar ou do tipo Criatura Mística recebem +1 Dano / +1 HP neste campo. Criaturas de Ar e Criatura Mística recebem +2 Dano / +2 HP.',
    elementBoosts: { ar: 1 },
    cardTypeBoosts: { mistica: 1 },
    specialBoosts: {
      arAndMistica: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/mystic-forest_resultado.webp'),
  },
  {
    id: 'F007',
    legacyId: 'field_mountain',
    name: 'Mountain',
    type: 'field',
    element: 'Terra',
    fieldType: 'Fera',
    lore: 'Montanhas colossos que tocam as nuvens. Um terreno brutal onde apenas os mais fortes sobrevivem.',
    description: 'Criaturas de Terra ou do tipo Fera recebem +1 Dano / +1 HP neste campo. Criaturas de Terra e Fera recebem +2 Dano / +2 HP.',
    elementBoosts: { terra: 1 },
    cardTypeBoosts: { fera: 1 },
    specialBoosts: {
      terraAndFera: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/mountain_resultado.webp'),
  },
  {
    id: 'F008',
    legacyId: 'field_ocean',
    name: 'Ocean',
    type: 'field',
    element: 'Água',
    fieldType: 'Criatura Mística',
    lore: 'Um oceano profundo e infinito, repleto de segredos antigos. As águas sussurram histórias esquecidas.',
    description: 'Criaturas de Água ou do tipo Criatura Mística recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Criatura Mística recebem +2 Dano / +2 HP.',
    elementBoosts: { agua: 1 },
    cardTypeBoosts: { mistica: 1 },
    specialBoosts: {
      aguaAndMistica: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/ocean_resultado.webp'),
  },
  {
    id: 'F009',
    legacyId: 'field_shadow_mountain',
    name: 'Shadow Mountain',
    type: 'field',
    element: 'Terra',
    fieldType: 'Criatura Sombria',
    lore: 'Uma montanha envolta em escuridão eterna. O próprio ar é carregado com malevolência antiga e poder sombrio.',
    description: 'Criaturas de Terra ou do tipo Criatura Sombria recebem +1 Dano / +1 HP neste campo. Criaturas de Terra e Criatura Sombria recebem +2 Dano / +2 HP.',
    elementBoosts: { terra: 1 },
    cardTypeBoosts: { sombria: 1 },
    specialBoosts: {
      terraAndSombria: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/shadow_resultado.webp'),
  },
  {
    id: 'F010',
    legacyId: 'field_snow',
    name: 'Snow',
    type: 'field',
    element: 'Água',
    fieldType: 'Ave',
    lore: 'Um reino gelado onde a neve cai eternamente. Apenas os mais adaptados conseguem prosperar neste frio extremo.',
    description: 'Criaturas de Água ou do tipo Ave recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Ave recebem +2 Dano / +2 HP.',
    elementBoosts: { agua: 1 },
    cardTypeBoosts: { ave: 1 },
    specialBoosts: {
      aguaAndAve: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/snow_resultado.webp'),
  },
  {
    id: 'F011',
    legacyId: 'field_swamp',
    name: 'Swamp',
    type: 'field',
    element: 'Água',
    fieldType: 'Reptiloide',
    lore: 'Um pântano primordial, selvagem e perigoso. Vida estranha prospera neste ecossistema tóxico e vivo.',
    description: 'Criaturas de Água ou do tipo Reptiloide recebem +1 Dano / +1 HP neste campo. Criaturas de Água e Reptiloide recebem +2 Dano / +2 HP.',
    elementBoosts: { agua: 1 },
    cardTypeBoosts: { reptiloide: 1 },
    specialBoosts: {
      aguaAndReptiloide: { damage: 2, hp: 2 }
    },
    img: require('../../img/scene-board/swamp_resultado.webp'),
  },
  {
    id: 'F012',
    legacyId: 'field_vulcanus',
    name: 'Vulcanus',
    type: 'field',
    element: 'Fogo',
    fieldType: 'Monstro',
    lore: 'Um vulcão ativo que queima eternamente. O poder destrutivo da lava alimenta criaturas nascidas do fogo.',
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
