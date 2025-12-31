// Card data for Whalar
module.exports = {
  id: 23,
  title: { pt: 'O Predador Noturno das Marés', en: 'The Nocturnal Tide Predator' },
  num: 23,
  height: 4.5,
  weakness: 'ar',
  name: { pt: 'Whalar', en: 'Whalar' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'água',
  img: require('../../img/creatures/whalar_bio.webp'),
  color: 'shadow',
  hp: 12,
  abilities: [
    {
      name: { pt: 'Caçada Silenciosa', en: 'Silent Hunt' },
      cost: 1,
      desc: {
        pt: 'Ataca primeiro se estiver à noite ou em campo sombrio.',
        en: 'Attacks first if it is night or on a shadow field.'
      }
    },
    {
      name: { pt: 'Mordida Abissal', en: 'Abyssal Bite' },
      cost: 1,
      desc: {
        pt: 'Ignora 2 pontos de defesa do alvo ao atacar.',
        en: 'Ignores 2 defense points of the target when attacking.'
      }
    }
  ],
  field: { pt: 'Maré Sombria', en: 'Shadow Tide' },
  fielddesc: {
    pt: 'Enquanto Whalar estiver em campo, criaturas sombrias de água recebem +1 ataque.',
    en: 'While Whalar is on the field, shadow water creatures gain +1 attack.'
  },
  storyTitle: { pt: 'Lenda do Caçador das Ondas', en: 'Legend of the Wave Hunter' },
  story: [
    {
      pt: 'Whalar patrulha as marés escuras, caçando silenciosamente sob o véu da noite.',
      en: 'Whalar patrols the dark tides, hunting silently under the cover of night.'
    }
  ]
};
