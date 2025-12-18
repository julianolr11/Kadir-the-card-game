// Card data for Elderox
module.exports = {
  id: 20,
  title: { pt: 'Rugido da montanha', en: 'Roar of the Mountain' },
  num: 20,
  height: 4.2,
  weakness: 'água',
  name: { pt: 'Elderox', en: 'Elderox' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'terra',
  img: require('../../img/creatures/elderox_bio.png'),
  color: 'earth',
  hp: 12,
  abilities: [
    {
      name: { pt: 'Rugido Sísmico', en: 'Seismic Roar' },
      desc: {
        pt: 'Causa dano em área e reduz a velocidade dos inimigos por 1 turno.',
        en: 'Deals area damage and reduces enemies\' speed for 1 turn.'
      }
    },
    {
      name: { pt: 'Pele Rochosa', en: 'Rocky Hide' },
      desc: {
        pt: 'Recebe menos dano de ataques físicos por 2 turnos.',
        en: 'Takes less damage from physical attacks for 2 turns.'
      }
    }
  ],
  field: { pt: 'Montanha Ancestral', en: 'Ancient Mountain' },
  fielddesc: {
    pt: 'Aumenta defesa de criaturas de terra em 15% enquanto Elderox estiver em campo.',
    en: 'Increases earth creatures\' defense by 15% while Elderox is on the field.'
  },
  storyTitle: { pt: 'Lenda de Elderox', en: 'Legend of Elderox' },
  story: [
    {
      pt: 'Elderox é uma criatura ancestral, símbolo da força e resistência das montanhas.',
      en: 'Elderox is an ancient creature, symbol of the strength and endurance of the mountains.'
    },
    {
      pt: 'Seu rugido ecoa por vales e desfiladeiros, inspirando aliados e aterrorizando inimigos.',
      en: 'Its roar echoes through valleys and gorges, inspiring allies and terrifying enemies.'
    }
  ],
  blessing: {
    pt: 'Abençoado pela rocha eterna, Elderox recebe +2 de defesa ao entrar em campo.',
    en: 'Blessed by the eternal rock, Elderox gains +2 defense when entering the field.'
  }
};
