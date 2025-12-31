// Card data for Pawferion
module.exports = {
  id: 21,
  title: { pt: 'O elemental corrompido', en: 'The Corrupted Elemental' },
  num: 21,
  height: 3.8,
  weakness: 'fogo',
  name: { pt: 'Pawferion', en: 'Pawferion' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'pura',
  img: require('../../img/creatures/pawferion_bio.webp'),
  color: 'pure',
  hp: 10,
  abilities: [
    {
      name: { pt: 'Corrupção Elemental', en: 'Elemental Corruption' },
      cost: 1,
      desc: {
        pt: 'Rouba 2 pontos de ataque de todos os inimigos por 2 turnos.',
        en: 'Steals 2 attack points from all enemies for 2 turns.'
      }
    },
    {
      name: { pt: 'Sombra Essencial', en: 'Essential Shadow' },
      cost: 1,
      desc: {
        pt: 'Recebe metade do dano de ataques elementais por 1 turno.',
        en: 'Takes half damage from elemental attacks for 1 turn.'
      }
    }
  ],
  field: { pt: 'Vazio Corrompido', en: 'Corrupted Void' },
  fielddesc: {
    pt: 'Reduz o ataque de todas as criaturas não puras em 10% enquanto Pawferion estiver em campo.',
    en: 'Reduces the attack of all non-pure creatures by 10% while Pawferion is on the field.'
  },
  storyTitle: { pt: 'Origem de Pawferion', en: 'Origin of Pawferion' },
  story: [
    {
      pt: 'Ele, sendo essência de todos os elementos, foi corrompido pelo poder.',
      en: 'Being the essence of all elements, he was corrupted by power.'
    }
  ],
  blessing: {
    pt: 'Pawferion ganha +1 de ataque para cada tipo de elemento diferente em campo.',
    en: 'Pawferion gains +1 attack for each different element type on the field.'
  }
};
