// Card data for Alatoy
module.exports = {
  id: 22,
  title: { pt: 'A Enguia das Profundezas Sombrias', en: 'The Eel of Shadow Depths' },
  num: 22,
  height: 2.1,
  weakness: 'ar',
  name: { pt: 'Alatoy', en: 'Alatoy' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'água',
  img: require('../../img/creatures/alatoy_bio.webp'),
  color: 'shadow',
  hp: 8,
  abilities: [
    {
      name: { pt: 'Luz Abissal', en: 'Abyssal Light' },
      cost: 1,
      desc: {
        pt: 'Emite uma luz verde-escura que reduz a precisão dos inimigos por 2 turnos.',
        en: 'Emits a dark green light that reduces enemies’ accuracy for 2 turns.'
      }
    },
    {
      name: { pt: 'Descarga Sombria', en: 'Shadow Discharge' },
      cost: 1,
      desc: {
        pt: 'Causa dano extra se o alvo estiver sob efeito de redução de precisão.',
        en: 'Deals extra damage if the target is under accuracy reduction.'
      }
    }
  ],
  field: { pt: 'Fosso Luminescente', en: 'Luminous Trench' },
  fielddesc: {
    pt: 'Enquanto Alatoy estiver em campo, criaturas de água recebem +1 de defesa.',
    en: 'While Alatoy is on the field, water creatures gain +1 defense.'
  },
  storyTitle: { pt: 'Mistérios do Abismo', en: 'Mysteries of the Abyss' },
  story: [
    {
      pt: 'Alatoy desliza silenciosamente pelas águas profundas, suas barbatanas iluminando o caminho para o desconhecido.',
      en: 'Alatoy glides silently through the deep waters, its fins lighting the way to the unknown.'
    }
  ]
};
