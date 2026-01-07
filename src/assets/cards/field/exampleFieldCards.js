// Cartas de campo: exemplo inicial
const fieldCards = [
  {
    id: 'f001',
    name: 'Campo em Reuínas',
    type: 'field',
    description: 'Criaturas do elemento Puro ou do tipo Monstro recebem +1 Dano / +1 HP neste campo.\nCriaturas Puras e Monstros recebem +2 Dano / +2 HP.',
      description: 'Energias ancestrais despertam e fortalecem monstros e seres puros. Apenas os dignos sentirão o poder fluir sob seus pés.',
    elementBoosts: { puro: 1 },
    cardTypeBoosts: { monstro: 1 },
    specialBoosts: {
      puroAndMonstro: { damage: 2, hp: 2 }
    },
    image: 'img/scene-board/field.png',
  },
];

export default fieldCards;
