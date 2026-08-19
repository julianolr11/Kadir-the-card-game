// Card data for Ekerath
module.exports = {
  id: 'ekerath',
  title: { pt: 'Coração da Terra', en: 'Heart of the Earth' },
  num: 35,
  height: 45,
  weakness: 'ar',
  name: { pt: 'Ekerath', en: 'Ekerath' },
  type: { pt: 'Reptiloide', en: 'Reptiloid' },
  element: 'terra',
  img: require('../../img/creatures/ekerath_bio.webp'),
  color: 'earth',
  hp: 14,

  // ===== MODO CALAMIDADE =====
  // Forma de chefe usada apenas no modo Calamidade (1-4 jogadores). Não afeta a carta
  // colecionável/Guardiã normal fora desse modo — hp/abilities acima continuam os mesmos.
  calamity: {
    isCalamity: true,
    baseHp: 100, // vida do chefe em partida solo (100% de poder); ajustado após playtest (era 350, depois 90, 60, 80)
    powerScale: { 1: 1, 2: 1.75, 3: 2.4, 4: 3 }, // multiplicador de HP e dano por nº de jogadores
    attacks: {
      single: {
        name: { pt: 'Colapso de Pedra', en: 'Stone Collapse' },
        desc: {
          pt: 'Causa dano de terra pesado à criatura de um jogador.',
          en: 'Deals heavy earth damage to one player\'s creature.',
        },
        baseDamage: 5, // dano em partida solo (100% de poder); ajustado após playtest (era 15, depois 6)
      },
      area: {
        name: { pt: 'Tremor do Mundo', en: 'World Tremor' },
        desc: {
          pt: 'Causa dano de terra à criatura de todos os jogadores.',
          en: 'Deals earth damage to every player\'s creature.',
        },
        baseDamage: 3, // ajustado após playtest (era 8, depois 4)
      },
    },
  },

  // Habilidades base (exibidas no card preview)
  abilities: [
    {
      name: { pt: 'Passo Sísmico', en: 'Seismic Step' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano terra e reduz a velocidade do alvo em 1 por 1 turno.',
        en: 'Deals 2 earth damage and lowers target speed by 1 for 1 turn.',
      },
    },
    {
      name: { pt: 'Colapso de Pedra', en: 'Stone Collapse' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano terra e reduz a defesa do alvo em 1 por 2 turnos.',
        en: 'Deals 3 earth damage and lowers target defense by 1 for 2 turns.',
      },
    },
  ],

  // Campo de efeito
  field: { pt: 'Dorso do Mundo', en: 'World\'s Back' },
  fielddesc: {
    pt: 'Uma cordilheira inteira cresce sobre uma concha que nunca parou de andar. Rios nascem e morrem nas rachaduras da sua pedra.',
    en: 'An entire mountain range grows atop a shell that never stopped walking. Rivers are born and die in the cracks of its stone.',
  },

  // História
  storyTitle: { pt: 'A Calamidade Ancestral', en: 'The Ancestral Calamity' },
  story: [
    {
      pt: 'Antes dos primeiros reinos, Ekerath já caminhava. Ninguém viu seu nascimento; apenas o rastro de montanhas que deixou para trás.',
      en: 'Before the first kingdoms, Ekerath already walked. No one saw its birth; only the trail of mountains it left behind.',
    },
    {
      pt: 'Carrega o peso do firmamento nas costas — florestas inteiras, cachoeiras, picos nevados — sem nunca demonstrar cansaço.',
      en: 'It carries the weight of the firmament on its back — entire forests, waterfalls, snow-capped peaks — never once showing fatigue.',
    },
    {
      pt: 'Cada passo é um terremoto distante. Sábios dizem que o mundo só continua de pé porque Ekerath ainda não parou de andar.',
      en: 'Every step is a distant earthquake. Sages say the world remains standing only because Ekerath has not yet stopped walking.',
    },
    {
      pt: 'É lento, é paciente, é inevitável. Uma calamidade que não odeia nem ama — apenas segue, indiferente ao que esmaga sob si.',
      en: 'It is slow, it is patient, it is inevitable. A calamity that neither hates nor loves — it simply moves on, indifferent to what it crushes beneath.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,

  // Habilidades padrão do guardião (sempre disponíveis)
  defaultSkills: [
    {
      id: 'ekerath_skill_1',
      name: { pt: 'Passo Sísmico', en: 'Seismic Step' },
      desc: {
        pt: 'Causa 2 de dano terra e reduz a velocidade do alvo em 1 por 1 turno.',
        en: 'Deals 2 earth damage and lowers target speed by 1 for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'ekerath_skill_2',
      name: { pt: 'Colapso de Pedra', en: 'Stone Collapse' },
      desc: {
        pt: 'Causa 3 de dano terra e reduz a defesa do alvo em 1 por 2 turnos.',
        en: 'Deals 3 earth damage and lowers target defense by 1 for 2 turns.',
      },
      cost: 2,
      type: 'damage_debuff',
    },
  ],

  // Bênção padrão
  defaultBlessing: {
    id: 'ekerath_blessing',
    name: { pt: 'Bênção do Firmamento', en: 'Blessing of the Firmament' },
    desc: {
      pt: 'Ao entrar em campo, todos os aliados ganham +1 de escudo e +1 de vida.',
      en: 'When summoned, all allies gain +1 shield and +1 HP.',
    },
  },

  // Tabela de desbloqueios por nível (0-10)
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'MILLENNIAL_SHELL',
      name: { pt: 'Casca Milenar', en: 'Millennial Shell' },
      desc: {
        pt: 'Inicia a batalha com um escudo que absorve 2 de dano.',
        en: 'Starts the battle with a shield that absorbs 2 damage.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'ekerath_skill_terremoto_ancestral',
      name: { pt: 'Terremoto Ancestral', en: 'Ancestral Earthquake' },
      desc: {
        pt: 'Causa 3 de dano em área e aplica -1 de velocidade por 2 turnos.',
        en: 'Deals 3 area damage and applies -1 speed for 2 turns.',
      },
      cost: 2,
      effectType: 'aoe_slow',
    },
    {
      level: 4,
      type: 'perk',
      id: 'FIRMAMENT_WEIGHT',
      name: { pt: 'Peso do Firmamento', en: 'Weight of the Firmament' },
      desc: {
        pt: 'Reduz permanentemente o dano físico recebido em 1.',
        en: 'Permanently reduces physical damage taken by 1.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'ekerath_skill_avalanche',
      name: { pt: 'Avalanche', en: 'Avalanche' },
      desc: {
        pt: 'Causa 4 de dano em área e reduz a defesa dos inimigos em 1 por 2 turnos.',
        en: 'Deals 4 area damage and lowers enemy defense by 1 for 2 turns.',
      },
      cost: 2,
      effectType: 'aoe_defense_down',
    },
    {
      level: 6,
      type: 'perk',
      id: 'STONE_REGENERATION',
      name: { pt: 'Regeneração Pétrea', en: 'Stone Regeneration' },
      desc: {
        pt: 'Recupera 2 de vida no início de cada turno.',
        en: 'Recovers 2 HP at the start of each turn.',
      },
    },
    {
      level: 7,
      type: 'skill',
      id: 'ekerath_skill_fenda_colossal',
      name: { pt: 'Fenda Colossal', en: 'Colossal Rift' },
      desc: {
        pt: 'Causa 4 de dano a todos os inimigos e aplica -1 de velocidade por 2 turnos.',
        en: 'Deals 4 damage to all enemies and applies -1 speed for 2 turns.',
      },
      cost: 3,
      effectType: 'aoe_slow',
    },
    {
      level: 8,
      type: 'perk',
      id: 'IMMOVABLE_GUARDIAN',
      name: { pt: 'Guardião Imóvel', en: 'Immovable Guardian' },
      desc: {
        pt: 'Enquanto Ekerath estiver em campo, aliados recebem +1 de defesa.',
        en: 'While Ekerath is on the field, allies gain +1 defense.',
      },
    },
    {
      level: 9,
      type: 'skill',
      id: 'ekerath_skill_colapso_do_firmamento',
      name: { pt: 'Colapso do Firmamento', en: 'Firmament Collapse' },
      desc: {
        pt: 'Causa 4 de dano em área e reduz a defesa dos inimigos em 2 por 2 turnos.',
        en: 'Deals 4 area damage and lowers enemy defense by 2 for 2 turns.',
      },
      cost: 3,
      effectType: 'aoe_defense_down',
    },
    {
      level: 10,
      type: 'skill',
      id: 'ekerath_skill_juizo_da_montanha',
      name: { pt: 'Juízo da Montanha', en: "Mountain's Judgment" },
      desc: {
        pt: 'Supremo: causa 5 de dano a todos os inimigos, reduz sua velocidade e defesa por 3 turnos, e ganha um escudo que absorve 3 de dano.',
        en: 'Ultimate: deals 5 damage to all enemies, lowers their speed and defense for 3 turns, and gains a shield absorbing 3 damage.',
      },
      cost: 4,
      effectType: 'ultimate_aoe_shield',
    },
  ],
};
