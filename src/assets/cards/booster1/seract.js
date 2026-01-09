// Card data for Seract
module.exports = {
  id: 'seract',
  title: { pt: 'Calamidade Gélida', en: 'Frozen Calamity' },
  num: 31,
  height: 0.15,
  weakness: 'puro',
  name: { pt: 'Seract', en: 'Seract' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'agua',
  img: require('../../img/creatures/seract_bio.webp'),
  color: 'water',
  hp: 8,
  abilities: [
    {
      name: { pt: 'Toque Congelante', en: 'Freezing Touch' },
      cost: 2,
      desc: {
        pt: 'Congela o alvo por 1 turno: reduz velocidade em 30% e causa +2 de dano gélido.',
        en: 'Freezes target for 1 turn: reduces speed by 30% and deals +2 ice damage.',
      },
    },
    {
      name: { pt: 'Cristal de Sombra', en: 'Shadow Crystal' },
      cost: 3,
      desc: {
        pt: 'Cria escudo de gelo sombrio: absorve até 3 dano e reflete 50% ao atacante.',
        en: 'Creates a shadow ice shield: absorbs up to 3 damage and reflects 50% to attacker.',
      },
    },
  ],
  field: { pt: 'Reinado Glacial', en: 'Glacial Reign' },
  fielddesc: {
    pt: 'Enquanto Seract estiver em campo, inimigos sofrem -5% de regeneração e habilidades de água custam -1 essência.',
    en: 'While Seract is on the field, enemies suffer -5% regeneration and water abilities cost -1 essence.',
  },
  storyTitle: { pt: 'O Sussurro do Abismo Gelado', en: 'Whisper of the Frozen Abyss' },
  story: [
    {
      pt: 'Seract é uma criatura nascida nas profundezas geladas onde a luz nunca chega e o frio é absoluto.',
      en: 'Seract is a creature born in the frozen depths where light never reaches and cold is absolute.',
    },
    {
      pt: 'Sua essência combina a frieza da água com a escuridão da sombra, tornando-a uma força devastadora.',
      en: 'Its essence combines the chill of water with the darkness of shadow, making it a devastating force.',
    },
    {
      pt: 'Diz-se que onde Seract caminha, o calor abandona o mundo e apenas o silêncio permanece.',
      en: 'It is said that where Seract walks, warmth abandons the world and only silence remains.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: false,
};
