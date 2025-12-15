// Dados das criaturas para os cards
export const creatures = [
  // num: 1
  {
    id: 'draak',
    title: { pt: 'Olhos de esmeralda', en: 'Emerald Eyes' },
    num: 1,
    height: 3.1,
    weakness: 'puro',
    name: { pt: 'Draak', en: 'Draak' },
    type: { pt: 'Draconídeo', en: 'Draconid' },
    element: 'puro',
    img: require('../assets/img/creatures/draak_bio.png'),
    color: 'pure',
    hp: 5,
    abilities: [
      {
        name: { pt: 'Sopro Etéreo', en: 'Ethereal Breath' },
        desc: { pt: 'Causa 24 de dano ao inimigo.', en: 'Deals 24 damage to the enemy.' }
      },
      {
        name: { pt: 'Escamas Celestes', en: 'Sky Scales' },
        desc: { pt: 'Reduz dano recebido em 8%.', en: 'Reduces damage taken by 8%.' }
      }
    ],
    field: { pt: 'Céu Cristalino', en: 'Crystal Sky' },
    fielddesc: {
      pt: 'Aumenta dano de ar em 10% enquanto Draak estiver em campo.',
      en: 'Increases air damage by 10% while Draak is on the field.'
    },
    storyTitle: { pt: 'Origem de Draak', en: 'Origin of Draak' },
    story: [
      { pt: 'Draak é um jovem draconídeo nascido nas nuvens eternas.', en: 'Draak is a young draconid born in the eternal clouds.' },
      { pt: 'Sua energia leve e instável o torna imprevisível e poderoso.', en: 'Its light and unstable energy makes it unpredictable and powerful.' }
    ]
  },
  // num: 2
  {
    id: 'mawthorn',
    num: 2,
    height: 4.2,
    weakness: 'terra',
    name: { pt: 'Mawthorn', en: 'Mawthorn' },
    type: { pt: 'Monstro', en: 'Monster' },
    element: 'agua',
    img: require('../assets/img/creatures/mawthorn_bio.png'),
    color: 'water',
    hp: 3,
    abilities: [
      {
        name: { pt: 'Garras Abissais', en: 'Abyssal Claws' },
        desc: { pt: 'Causa 18 de dano ao inimigo.', en: 'Deals 18 damage to the enemy.' }
      },
      {
        name: { pt: 'Regeneração', en: 'Regeneration' },
        desc: { pt: 'Recupera 10 de vida por turno.', en: 'Restores 10 HP per turn.' }
      }
    ],
    field: { pt: 'Abismo Profundo', en: 'Deep Abyss' },
    fielddesc: { pt: 'Aliados recuperam 3 de vida por turno enquanto Mawthorn estiver em campo.', en: 'Allies recover 3 HP per turn while Mawthorn is on the field.' },
    storyTitle: { pt: 'Origem de Mawthorn', en: 'Origin of Mawthorn' },
    story: [
      { pt: 'Mawthorn é um monstro das profundezas, temido por sua voracidade.', en: 'Mawthorn is a deep-sea monster feared for its voracity.' },
      { pt: 'Sua regeneração é lendária entre as criaturas aquáticas.', en: 'Its regeneration is legendary among aquatic creatures.' }
    ]
  },
  // num: 3
  {
    id: 'kael',
    title: { pt: 'Do abismo', en: 'from the abyss' },
    num: 3,
    height: 1.8,
    weakness: 'terra',
    name: { pt: 'Kael', en: 'Kael' },
    type: { pt: 'Fera', en: 'Beast' },
    element: 'agua',
    img: require('../assets/img/creatures/kael_bio.png'),
    color: 'water',
    hp: 4,
    abilities: [
      {
        name: { pt: 'Mordida Gélida', en: 'Frost Bite' },
        desc: { pt: 'Causa 24 de dano ao inimigo.', en: 'Deals 24 damage to the enemy.' }
      },
      {
        name: { pt: 'Pele Escorregadia', en: 'Slippery Hide' },
        desc: { pt: 'Reduz dano recebido em 8%.', en: 'Reduces damage taken by 8%.' }
      }
    ],
    field: { pt: 'Lago Sagrado', en: 'Sacred Lake' },
    fielddesc: { pt: 'Aliados recebem 5% menos dano enquanto Kael estiver em campo.', en: 'Allies take 5% less damage while Kael is on the field.' },
    storyTitle: { pt: 'Origem de Kael', en: 'Origin of Kael' },
    story: [
      { pt: 'Kael é uma fera das águas profundas, astuta e resistente.', en: 'Kael is a beast of the deep waters, cunning and resilient.' },
      { pt: 'Sua presença acalma aliados e confunde inimigos.', en: 'Its presence calms allies and confuses enemies.' }
    ]
  },
  // num: 4
  {
    id: 'leoracal',
    num: 4,
    height: 1.5,
    weakness: 'ar',
    name: { pt: 'Leoracal', en: 'Leoracal' },
    type: { pt: 'Fera', en: 'Beast' },
    element: 'terra',
    img: require('../assets/img/creatures/leoracal_bio.png'),
    color: 'earth',
    hp: 5,
    abilities: [
      {
        name: { pt: 'Rugido Sísmico', en: 'Seismic Roar' },
        desc: { pt: 'Causa 26 de dano ao inimigo.', en: 'Deals 26 damage to the enemy.' }
      },
      {
        name: { pt: 'Pele Rochosa', en: 'Rocky Hide' },
        desc: { pt: 'Reduz dano recebido em 10%.', en: 'Reduces damage taken by 10%.' }
      }
    ],
    field: { pt: 'Solo Sagrado', en: 'Sacred Ground' },
    fielddesc: { pt: 'Aliados recebem 7% menos dano enquanto Leoracal estiver em campo.', en: 'Allies take 7% less damage while Leoracal is on the field.' },
    storyTitle: { pt: 'Origem de Leoracal', en: 'Origin of Leoracal' },
    story: [
      { pt: 'Leoracal é uma fera de força incomparável, guardiã das terras ancestrais.', en: 'Leoracal is a beast of unmatched strength, guardian of ancient lands.' },
      { pt: 'Seu rugido ecoa por todo o campo de batalha.', en: 'Its roar echoes across the battlefield.' }
    ]
  },
  // num: 5
  {
    id: 'griffor',
    num: 5,
    height: 2.2,
    weakness: 'puro',
    name: { pt: 'Griffor', en: 'Griffor' },
    type: { pt: 'Ave', en: 'Bird' },
    element: 'puro',
    img: require('../assets/img/creatures/griffor_bio.png'),
    color: 'pure',
    hp: 4,
    abilities: [
      { name: { pt: 'Voo Sagrado', en: 'Sacred Flight' }, desc: { pt: 'Causa 22 de dano ao inimigo.', en: 'Deals 22 damage to the enemy.' } },
      { name: { pt: 'Proteção Celestial', en: 'Celestial Protection' }, desc: { pt: 'Aliados recebem escudo de luz.', en: 'Allies receive a light shield.' } }
    ],
    field: { pt: 'Céu Imaculado', en: 'Immaculate Sky' },
    fielddesc: { pt: 'Aliados recebem 6% menos dano enquanto Griffor estiver em campo.', en: 'Allies take 6% less damage while Griffor is on the field.' },
    storyTitle: { pt: 'Origem de Griffor', en: 'Origin of Griffor' },
    story: [
      { pt: 'Griffor é uma ave lendária, símbolo de pureza e proteção.', en: 'Griffor is a legendary bird, symbol of purity and protection.' },
      { pt: 'Seu voo inspira coragem e esperança.', en: 'Its flight inspires courage and hope.' }
    ]
  },
  // num: 6
  {
    id: 'ekeranth',
    title: { pt: 'Tirano do fogo', en: 'Fire Tyrant' },
    num: 6,
    height: 6.4,
    weakness: 'agua',
    name: { pt: 'Ekeranth', en: 'Ekeranth' },
    type: { pt: 'Draconídeo', en: 'Draconid' },
    element: 'fogo',
    img: require('../assets/img/creatures/ekeranth_bio.jpg'),
    color: 'fire',
    hp: 4,
    abilities: [
      { name: { pt: 'Fúria Flamejante', en: 'Flaming Fury' }, desc: { pt: 'Causa 30 de dano ao inimigo.', en: 'Deals 30 damage to the enemy.' } },
      { name: { pt: 'Chamas Vivas', en: 'Living Flames' }, desc: { pt: 'Causa 10 de dano extra por 2 turnos.', en: 'Deals 10 extra damage for 2 turns.' } }
    ],
    field: { pt: 'Solo Vulcânico', en: 'Volcanic Soil' },
    fielddesc: { pt: 'Aumenta dano de fogo em 12% enquanto Ekeranth estiver em campo.', en: 'Increases fire damage by 12% while Ekeranth is on the field.' },
    storyTitle: { pt: 'Origem de Ekeranth', en: 'Origin of Ekeranth' },
    story: [
      { pt: 'Ekeranth é um draconídeo forjado nas profundezas vulcânicas.', en: 'Ekeranth is a draconid forged in volcanic depths.' },
      { pt: 'Seu poder flamejante é devastador e imprevisível.', en: 'Its flaming power is devastating and unpredictable.' }
    ]
  },
  // num: 7
  {
    id: 'ignis',
    num: 7,
    height: 1.2,
    weakness: 'agua',
    name: { pt: 'Ignis', en: 'Ignis' },
    type: { pt: 'Ave', en: 'Bird' },
    element: 'fogo',
    img: require('../assets/img/creatures/ignis_bio.png'),
    color: 'fire',
    hp: 3,
    abilities: [
      { name: { pt: 'Chama Alada', en: 'Winged Flame' }, desc: { pt: 'Causa 20 de dano ao inimigo.', en: 'Deals 20 damage to the enemy.' } },
      { name: { pt: 'Voo Flamejante', en: 'Flaming Flight' }, desc: { pt: 'Causa 10 de dano extra ao atacar.', en: 'Deals 10 extra damage when attacking.' } }
    ],
    field: { pt: 'Céu Flamejante', en: 'Flaming Sky' },
    fielddesc: { pt: 'Aumenta dano de fogo em 6% enquanto Ignis estiver em campo.', en: 'Increases fire damage by 6% while Ignis is on the field.' },
    storyTitle: { pt: 'Origem de Ignis', en: 'Origin of Ignis' },
    story: [
      { pt: 'Ignis é uma ave de fogo, ágil e feroz.', en: 'Ignis is a fire bird, agile and fierce.' },
      { pt: 'Seu voo deixa rastros de brasas pelo campo.', en: 'Its flight leaves trails of embers across the field.' }
    ]
  },
  // num: 8
  {
    id: 'drazaq',
    num: 8,
    height: 1.3,
    weakness: 'puro',
    name: { pt: 'Drazraq', en: 'Drazraq' },
    type: { pt: 'Draconídeo', en: 'Draconid' },
    element: 'puro',
    img: require('../assets/img/creatures/drazraq_bio.png'),
    color: 'pure',
    hp: 5,
    abilities: [
      {
        name: { pt: 'Impacto Bestial', en: 'Beast Strike' },
        desc: { pt: 'Causa 30 de dano ao inimigo.', en: 'Deals 30 damage to the enemy.' }
      },
      {
        name: { pt: 'Fúria Vulcânica', en: 'Volcanic Rage' },
        desc: { pt: 'Aumenta seu ataque em 10% por 3 turnos.', en: 'Increases its attack by 10% for 3 turns.' }
      }
    ],
    field: { pt: 'Fenda Vulcânica', en: 'Volcanic Rift' },
    fielddesc: {
      pt: 'Aliados recebem 5% de ataque adicional enquanto Drazraq estiver em campo.',
      en: 'Allies gain 5% attack while Drazraq is on the field.'
    },
    storyTitle: { pt: 'Origem de Drazraq', en: 'Origin of Drazraq' },
    story: [
      { pt: 'Drazraq habita fissuras vulcânicas onde a vida e a chama se misturam.', en: 'Drazraq dwells in volcanic fissures where life and flame merge.' },
      { pt: 'Sua força bruta é temida até entre outras feras.', en: 'Its brute strength is feared even among other beasts.' }
    ]
  },
  // num: 9
  {
    id: 'owlberoth',
    num: 9,
    height: 3.7,
    weakness: 'puro',
    name: { pt: 'Owlberoth', en: 'Owlberoth' },
    type: { pt: 'Criatura Mística', en: 'Mystic Creature' },
    element: 'puro',
    img: require('../assets/img/creatures/owlberoth_bio.png'),
    color: 'pure',
    hp: 4,
    abilities: [
      {
        name: { pt: 'Olhar Místico', en: 'Mystic Gaze' },
        desc: { pt: 'Causa 20 de dano ao inimigo.', en: 'Deals 20 damage to the enemy.' }
      },
      {
        name: { pt: 'Voo Noturno', en: 'Night Flight' },
        desc: { pt: 'Aliados recebem bônus de esquiva.', en: 'Allies gain an evasion bonus.' }
      }
    ],
    field: { pt: 'Noite Sagrada', en: 'Sacred Night' },
    fielddesc: { pt: 'Aliados têm 8% mais chance de esquiva enquanto Owlberoth estiver em campo.', en: 'Allies have 8% increased evasion while Owlberoth is on the field.' },
    storyTitle: { pt: 'Origem de Owlberoth', en: 'Origin of Owlberoth' },
    story: [
      { pt: 'Owlberoth é uma criatura mística, guardiã dos segredos da noite.', en: 'Owlberoth is a mystical creature, guardian of the secrets of the night.' },
      { pt: 'Seu olhar penetra as trevas e revela verdades ocultas.', en: 'Its gaze pierces the darkness and reveals hidden truths.' }
    ]
  },
  // num: 10
  {
    id: 'digitama',
    title: { pt: 'Fogo silencioso', en: 'Silent fire' },
    num: 10,
    height: 0.6,
    weakness: 'agua',
    name: { pt: 'Digitama', en: 'Digitama' },
    type: { pt: 'Criatura Mística', en: 'Mystic Creature' },
    element: 'fogo',
    img: require('../assets/img/creatures/digitama_bio.png'),
    color: 'fire',
    hp: 4,
    height: 1.23,
    abilities: [
      { name: { pt: 'Chama Mística', en: 'Mystic Flame' }, desc: { pt: 'Causa 25 de dano ao inimigo.', en: 'Deals 25 damage to the enemy.' } },
      { name: { pt: 'Explosão Arcana', en: 'Arcane Explosion' }, desc: { pt: 'Causa 15 de dano em todos os inimigos.', en: 'Deals 15 damage to all enemies.' } }
    ],
    field: { pt: 'Aura Flamejante', en: 'Flaming Aura' },
    fielddesc: { pt: 'Aumenta o dano de fogo em 8% enquanto Digitama estiver em campo.', en: 'Increases fire damage by 8% while Digitama is on the field.' },
    storyTitle: { pt: 'Origem de Digitama', en: 'Origin of Digitama' },
    story: [
      { pt: 'Digitama é uma criatura mística nascida do fogo primordial, capaz de manipular chamas mágicas.', en: 'Digitama is a mystical creature born from primordial fire, able to manipulate magical flames.' },
      { pt: 'Sua presença aquece o campo e inspira aliados com energia flamejante.', en: 'Its presence warms the field and inspires allies with fiery energy.' }
    ]
  },
  // num: 11
  {
    id: 'virideer',
    num: 11,
    height: 2.0,
    weakness: 'fogo',
    name: { pt: 'Virideer', en: 'Virideer' },
    type: { pt: 'Criatura Mística', en: 'Mystic Creature' },
    element: 'terra',
    img: require('../assets/img/creatures/virideer_bio.png'),
    color: 'earth',
    hp: 4,
    abilities: [
      {
        name: { pt: 'Chifre Protetor', en: 'Protective Horn' },
        desc: { pt: 'Causa 22 de dano ao inimigo.', en: 'Deals 22 damage to the enemy.' }
      },
      {
        name: { pt: 'Crescimento Rápido', en: 'Rapid Growth' },
        desc: { pt: 'Recupera 8 de vida por turno.', en: 'Recovers 8 HP per turn.' }
      }
    ],
    field: { pt: 'Floresta Ancestral', en: 'Ancestral Forest' },
    fielddesc: {
      pt: 'Aliados recuperam 2 de vida por turno enquanto Virideer estiver em campo.',
      en: 'Allies recover 2 HP per turn while Virideer is on the field.'
    },
    storyTitle: { pt: 'Origem de Virideer', en: 'Origin of Virideer' },
    story: [
      {
        pt: 'Virideer é uma criatura mística das florestas ancestrais, símbolo de renovação.',
        en: 'Virideer is a mystic creature of the ancestral forests, a symbol of renewal.'
      },
      {
        pt: 'Sua energia vital fortalece todo o campo.',
        en: 'Its vital energy strengthens the entire field.'
      }
    ]
  },
  // num: 12
  {
    id: 'ashfang',
    title: { pt: 'Presas vulcânicas', en: 'Volcanic Fangs' },
    num: 12,
    height: 2.1,
    weakness: 'agua',
    name: { pt: 'Ashfang', en: 'Ashfang' },
    type: { pt: 'Fera', en: 'Beast' },
    element: 'fogo',
    img: require('../assets/img/creatures/ashfang_bio.png'),
    color: 'fire',
    hp: 4,
    abilities: [
      {
        name: { pt: 'Garras de Cinzas', en: 'Ash Claws' },
        desc: { pt: 'Causa 28 de dano ao inimigo.', en: 'Deals 28 damage to the enemy.' }
      },
      {
        name: { pt: 'Chama Sombria', en: 'Shadowflame' },
        desc: { pt: 'Causa 12 de dano extra por 2 turnos.', en: 'Deals 12 extra damage for 2 turns.' }
      }
    ],
    field: { pt: 'Pântano Ardente', en: 'Burning Mire' },
    fielddesc: {
      pt: 'Aumenta dano de fogo em 10% enquanto Ashfang estiver em campo.',
      en: 'Increases fire damage by 10% while Ashfang is on the field.'
    },
    storyTitle: { pt: 'Origem de Ashfang', en: 'Origin of Ashfang' },
    story: [
      { pt: 'Ashfang nasceu das sombras de um vulcão adormecido.', en: 'Ashfang was born from the shadows of a dormant volcano.' },
      { pt: 'Sua fúria incandescente carboniza qualquer inimigo que o enfrente.', en: 'Its burning rage scorches any opponent that faces it.' }
    ]
  },
  // num: 13
  {
    id: 'viborom',
    num: 13,
    height: 9.3,
    weakness: 'terra',
    name: { pt: 'Viborom', en: 'Viborom' },
    type: { pt: 'Reptiloide', en: 'Reptiloid' },
    element: 'agua',
    img: require('../assets/img/creatures/viborom_bio.png'),
    color: 'water',
    hp: 5,
    abilities: [
      {
        name: { pt: 'Espreita Abissal', en: 'Abyssal Lurk' },
        desc: { pt: 'Causa 26 de dano ao inimigo ao emergir das águas.', en: 'Deals 26 damage to the enemy by emerging from the water.' }
      },
      {
        name: { pt: 'Veneno Líquido', en: 'Liquid Venom' },
        desc: { pt: 'Aplica veneno que causa 6 de dano por turno durante 3 turnos.', en: 'Applies poison that deals 6 damage per turn for 3 turns.' }
      }
    ],
    field: { pt: 'Pântano Esquecido', en: 'Forgotten Swamp' },
    fielddesc: {
      pt: 'Inimigos têm sua velocidade reduzida em 25% enquanto Viborom estiver em campo.',
      en: 'Enemies have their speed reduced by 25% while Viborom is on the field.'
    },
    storyTitle: { pt: 'Sussurros do Pântano', en: 'Whispers of the Swamp' },
    story: [
      { pt: 'Viborom habita pântanos ancestrais onde a água nunca está completamente parada.', en: 'Viborom dwells in ancestral swamps where the water is never completely still.' },
      { pt: 'Criatura serpentina e silenciosa, seu veneno líquido é temido até mesmo pelos mais poderosos aventureiros.', en: 'A serpentine and silent creature, its liquid venom is feared even by the most powerful adventurers.' }
    ]
  },
  // num: 14
  {
    id: 'sunburst',
    num: 14,
    height: 1.4,
    weakness: 'terra',
    name: { pt: 'Sunburst', en: 'Sunburst' },
    type: { pt: 'Criatura Sombria', en: 'Shadow Creature' },
    element: 'agua',
    img: require('../assets/img/creatures/sunburst_bio.jpeg'),
    color: 'water',
    hp: 5,
    abilities: [
      {
        name: { pt: 'Explosão Solar', en: 'Solar Burst' },
        desc: { pt: 'Libera energia acumulada causando 28 de dano.', en: 'Releases stored energy dealing 28 damage.' }
      },
      {
        name: { pt: 'Luz Drenante', en: 'Draining Light' },
        desc: { pt: 'Drena 10 de vida do inimigo à noite.', en: 'Drains 10 HP from the enemy at night.' }
      },
    ],
    field: { pt: 'Pântano Luminescente', en: 'Luminescent Swamp' },
    fielddesc: {
      pt: 'Criaturas sombrias causam +1 de dano por turno enquanto Sunburst estiver em campo.',
      en: 'Shadow creatures deal +1 damage per turn while Sunburst is on the field.'
    },
    storyTitle: { pt: 'O Predador Solar', en: 'The Solar Predator' },
    story: [
      {
        pt: 'Sunburst absorve luz solar durante o dia para armazenar energia.',
        en: 'Sunburst absorbs sunlight during the day to store energy.'
      },
      {
        pt: 'À noite, usa seu brilho fosforescente para confundir e capturar presas.',
        en: 'At night, it uses its phosphorescent glow to confuse and capture prey.'
      },
      {
        pt: 'Seu brilho pode ser visto à distância, muitas vezes confundido com luzes guias.',
        en: 'Its glow can be seen from afar, often mistaken for guiding lights.'
      }
    ]
  },
  // num: 15
  {
    id: 'landor',
    title: { pt: 'Vento do Norte', en: 'Northern Wind' },
    num: 15,
    height: 1.8,
    weakness: 'terra',
    name: { pt: 'Landor', en: 'Landor' },
    type: { pt: 'Ave', en: 'Bird' },
    element: 'ar',
    img: require('../assets/img/creatures/landor_bio.png'),
    color: 'air',
    hp: 4,
    abilities: [
      {
        name: { pt: 'Lâmina do Norte', en: 'Northern Blade' },
        desc: {
          pt: 'Causa 22 de dano ao inimigo com ventos cortantes.',
          en: 'Deals 22 damage to the enemy with cutting winds.'
        }
      },
      {
        name: { pt: 'Rajada Ascendente', en: 'Updraft Gust' },
        desc: {
          pt: 'Causa 14 de dano e empurra o inimigo, reduzindo sua eficácia no próximo turno.',
          en: 'Deals 14 damage and disrupts the enemy, reducing its effectiveness next turn.'
        }
      }
    ],
    field: { pt: 'Correntes Boreais', en: 'Boreal Currents' },
    fielddesc: {
      pt: 'Aumenta a velocidade das criaturas de ar em 8% enquanto Landor estiver em campo.',
      en: 'Increases air creatures speed by 8% while Landor is on the field.'
    },
    storyTitle: { pt: 'O Guardião dos Ventos', en: 'Guardian of the Winds' },
    story: [
      {
        pt: 'Landor vaga pelos céus do norte, guiando correntes invisíveis com precisão ancestral.',
        en: 'Landor roams the northern skies, guiding invisible currents with ancient precision.'
      },
      {
        pt: 'Seu voo silencioso é sentido antes de ser visto, anunciando mudança e movimento.',
        en: 'Its silent flight is felt before it is seen, heralding change and motion.'
      }
    ]
  },
  // num: 16
  {
    id: 'raptauros',
    title: { pt: 'O Predador das Dunas', en: 'The Dune Predator' },
    num: 16,
    height: 2.6,
    weakness: 'agua',
    name: { pt: 'Raptauros', en: 'Raptauros' },
    type: { pt: 'Draconídeo', en: 'Draconid' },
    element: 'terra',
    img: require('../assets/img/creatures/raptauros_bio.png'),
    color: 'earth',
    hp: 5,
    abilities: [
      {
        name: { pt: 'Investida das Dunas', en: 'Dune Charge' },
        desc: {
          pt: 'Causa 24 de dano ao inimigo. Causa dano adicional se Raptauros agir primeiro.',
          en: 'Deals 24 damage. Deals bonus damage if Raptauros acts first.'
        }
      },
      {
        name: { pt: 'Ruptura do Solo', en: 'Ground Rupture' },
        desc: {
          pt: 'Causa 16 de dano e reduz a defesa do inimigo.',
          en: 'Deals 16 damage and reduces the enemy defense.'
        }
      }
    ],
    field: { pt: 'Domínio das Areias', en: 'Sand Dominion' },
    fielddesc: {
      pt: 'Criaturas de terra recebem +8% de defesa enquanto Raptauros estiver em campo.',
      en: 'Earth creatures gain +8% defense while Raptauros is on the field.'
    },
    storyTitle: { pt: 'O Caçador do Deserto', en: 'The Desert Hunter' },
    story: [
      {
        pt: 'Raptauros é um draconídeo ancestral que habita mares de areia e ruínas soterradas.',
        en: 'Raptauros is an ancient draconid that inhabits seas of sand and buried ruins.'
      },
      {
        pt: 'Seu corpo blindado e suas garras afiadas fazem dele um predador implacável das dunas.',
        en: 'Its armored body and razor-sharp claws make it a relentless dune predator.'
      }
    ]
  },
  {
  id: 'arguilia',
  title: { pt: 'Espírito Ancestral do Rio', en: 'Ancestral River Spirit' },
  num: 17,
  height: 2.4,
  weakness: 'terra',
  name: { pt: 'Arguilia', en: 'Arguilia' },
  type: { pt: 'Ave', en: 'Bird' },
  element: 'agua',
  img: require('../assets/img/creatures/arguilia_bio.png'),
  color: 'water',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Asas do Fluxo', en: 'Wings of Flow' },
      desc: {
        pt: 'Causa 20 de dano e concede esquiva aumentada neste turno.',
        en: 'Deals 20 damage and grants increased evasion this turn.'
      }
    },
    {
      name: { pt: 'Véu das Águas', en: 'Veil of Waters' },
      desc: {
        pt: 'Aliados recebem redução de dano por 1 turno.',
        en: 'Allies receive damage reduction for 1 turn.'
      }
    }
  ],
  field: { pt: 'Rio Sagrado', en: 'Sacred River' },
  fielddesc: {
    pt: 'Criaturas de água recebem 7% menos dano enquanto Arguilia estiver em campo.',
    en: 'Water creatures take 7% less damage while Arguilia is on the field.'
  },
  storyTitle: { pt: 'A Voz dos Rios Eternos', en: 'The Voice of Eternal Rivers' },
  story: [
    {
      pt: 'Arguilia é um espírito antigo que nasce onde rios sagrados cruzam terras intocadas.',
      en: 'Arguilia is an ancient spirit born where sacred rivers cross untouched lands.'
    },
    {
      pt: 'Seu canto guia viajantes, purifica águas corrompidas e mantém o equilíbrio do mundo.',
      en: 'Its song guides travelers, purifies corrupted waters, and preserves the balance of the world.'
    }
  ]
},
{
  id: 'faskel',
  title: { pt: 'Arauto dos Ventos Eternos', en: 'Herald of the Eternal Winds' },
  num: 18,
  height: 2.1,
  weakness: 'terra',
  name: { pt: 'Faskel', en: 'Faskel' },
  type: { pt: 'Criatura Mística', en: 'Mystic Creature' },
  element: 'ar',
  img: require('../assets/img/creatures/faskel_bio.png'),
  color: 'air',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Galope Celeste', en: 'Celestial Gallop' },
      desc: {
        pt: 'Causa 20 de dano e aumenta a velocidade das criaturas de ar aliadas.',
        en: 'Deals 20 damage and increases the speed of allied air creatures.'
      }
    },
    {
      name: { pt: 'Asas do Zéfiro', en: 'Zephyr Wings' },
      desc: {
        pt: 'Evita o próximo ataque recebido ao se envolver em correntes de vento.',
        en: 'Evades the next incoming attack by wrapping itself in wind currents.'
      }
    }
  ],
  field: { pt: 'Brisa do Alvorecer', en: 'Dawn Breeze' },
  fielddesc: {
    pt: 'Criaturas do elemento ar recebem +8% de esquiva enquanto Faskel estiver em campo.',
    en: 'Air element creatures gain +8% evasion while Faskel is on the field.'
  },
  storyTitle: { pt: 'Lenda de Faskel', en: 'Legend of Faskel' },
  story: [
    {
      pt: 'Diz-se que Faskel nasce onde o primeiro vento da manhã toca as montanhas.',
      en: 'It is said Faskel is born where the first morning wind touches the mountains.'
    },
    {
      pt: 'Seu galope ecoa como um presságio de mudança e liberdade.',
      en: 'Its gallop echoes as an omen of change and freedom.'
    }
  ]
},{
  id: 'lunethal',
  title: { pt: 'O Dragão do Lago Lunar', en: 'Dragon of the Lunar Lake' },
  num: 19,
  height: 3.4,
  weakness: 'terra',
  name: { pt: 'Lunethal', en: 'Lunethal' },
  type: { pt: 'Draconídeo', en: 'Draconic' },
  element: 'agua',
  img: require('../assets/img/creatures/lunethal_bio.png'),
  color: 'water',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Maré Crescente', en: 'Rising Tide' },
      desc: {
        pt: 'Causa 22 de dano ao inimigo e aumenta a defesa de Lunethal em 1 ponto.',
        en: 'Deals 22 damage to the enemy and increases Lunethal’s defense by 1.'
      }
    },
    {
      name: { pt: 'Sopro Lunar', en: 'Lunar Breath' },
      desc: {
        pt: 'Causa 18 de dano e tem chance de reduzir o ataque do inimigo.',
        en: 'Deals 18 damage and has a chance to reduce the enemy’s attack.'
      }
    }
  ],
  field: { pt: 'Reflexo do Lago', en: 'Lake Reflection' },
  fielddesc: {
    pt: 'Criaturas de água recebem 8% a mais de defesa enquanto Lunethal estiver em campo.',
    en: 'Water creatures gain 8% more defense while Lunethal is on the field.'
  },
  storyTitle: { pt: 'Lenda de Lunethal', en: 'Legend of Lunethal' },
  story: [
    {
      pt: 'Lunethal habita lagos ancestrais iluminados pela lua, emergindo apenas quando o equilíbrio das águas é ameaçado.',
      en: 'Lunethal dwells in ancient moonlit lakes, emerging only when the balance of waters is threatened.'
    },
    {
      pt: 'Diz-se que suas escamas refletem a lua cheia, tornando-o quase invisível nas noites silenciosas.',
      en: 'It is said that its scales reflect the full moon, making it nearly invisible on silent nights.'
    }
  ]
}

];
