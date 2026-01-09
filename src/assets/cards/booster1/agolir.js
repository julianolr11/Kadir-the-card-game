// Card data for Agolir
module.exports = {
  id: 'agolir',
  title: { pt: 'Eclipse Ancestral', en: 'Ancient Eclipse' },
  num: 25,
  height: 0.1,
  weakness: 'puro',
  name: { pt: 'Agolir', en: 'Agolir' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'puro',
  img: require('../../img/creatures/agolir_bio.webp'),
  color: 'pure',
  hp: 7,
  abilities: [
    {
      name: { pt: 'Manto Crepuscular', en: 'Duskmantle' },
      cost: 1,
      desc: {
        pt: 'Fica furtivo à noite: +12% esquiva e o próximo ataque causa +1 de dano puro.',
        en: 'Turns stealthy at night: +12% evasion and next strike deals +1 pure damage.',
      },
    },
    {
      name: { pt: 'Absorção Elemental', en: 'Elemental Siphon' },
      cost: 1,
      desc: {
        pt: 'Rouba 2% de ataque e 2% de defesa de inimigos ao redor por 2 turnos.',
        en: 'Steals 2% attack and 2% defense from nearby foes for 2 turns.',
      },
    },
  ],
  field: { pt: 'Véu Noctilucente', en: 'Noctilucent Veil' },
  fielddesc: {
    pt: 'Enquanto Agolir estiver em campo, aliados puros ganham +4% resistência e +6% esquiva à noite.',
    en: 'While Agolir is on the field, pure allies gain +4% resistance and +6% dodge at night.',
  },
  storyTitle: { pt: 'Sobrevivente da Sombra', en: 'Shadow Survivor' },
  story: [
    {
      pt: 'Agolir é uma criatura ancestral que atravessou eras escondida entre penumbras cambiantes.',
      en: 'Agolir is an ancient creature that endured eras while hiding in shifting penumbra.',
    },
    {
      pt: 'Sua pele muda de tonalidade sob o luar, tornando-se quase invisível aos olhos mortais.',
      en: 'Its skin shifts under moonlight, rendering it nearly invisible to mortal eyes.',
    },
    {
      pt: 'Alimenta-se poucas vezes ao ano, absorvendo energia dos elementos que o cercam para permanecer desperto.',
      en: 'It feeds only a few times a year, drawing elemental energy around it to stay awake.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'agolir_skill_1',
      name: { pt: 'Lâmina Oculta', en: 'Hidden Blade' },
      desc: {
        pt: 'Causa 3 de dano; à noite ganha +10% crit nesse ataque.',
        en: 'Deals 3 damage; at night gains +10% crit on this attack.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'agolir_skill_2',
      name: { pt: 'Sangria de Éter', en: 'Aether Drain' },
      desc: {
        pt: 'Causa 2 de dano e rouba 1 de energia elemental do alvo, curando 1 de HP.',
        en: 'Deals 2 damage and steals 1 elemental energy from the target, healing 1 HP.',
      },
      cost: 1,
      type: 'damage_heal',
    },
  ],
  defaultBlessing: {
    id: 'agolir_blessing',
    name: { pt: 'Fome Rara', en: 'Rare Hunger' },
    desc: {
      pt: 'Aliados puros recuperam 1 de HP ao iniciar a noite e ganham +3% resistência.',
      en: 'Pure allies recover 1 HP when night begins and gain +3% resistance.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'agolir_skill_3',
      name: { pt: 'Olho Inquisidor', en: 'Inquisitive Eye' },
      desc: {
        pt: 'Revela inimigos furtivos e causa 3 de dano leve.',
        en: 'Reveals stealth enemies and deals 3 light damage.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'agolir_skill_4',
      name: { pt: 'Sopro dos Antigos', en: 'Ancients Breath' },
      desc: {
        pt: 'Causa 3 de dano puro e reduz defesa do alvo em 5% por 2 turnos.',
        en: 'Deals 3 pure damage and lowers target defense by 5% for 2 turns.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'agolir_skill_5',
      name: { pt: 'Sombras Absorventes', en: 'Absorbing Shadows' },
      desc: {
        pt: 'Ganha um escudo que nega o próximo ataque recebido por 2 rodadas.',
        en: 'Gains a shield that negates the next attack taken for 2 rounds.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'DEFENSE_REDUCTION' },
    { level: 7, type: 'perk', id: 'CRIT_CHANCE' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'agolir_skill_6',
      name: { pt: 'Eco Nocturno', en: 'Nocturnal Echo' },
      desc: {
        pt: 'Causa 4 de dano; à noite, ganha +15% esquiva por 1 turno.',
        en: 'Deals 4 damage; at night, gains +15% dodge for 1 turn.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'agolir_skill_7',
      name: { pt: 'Supremo: Eclipse Vivo', en: 'Ultimate: Living Eclipse' },
      desc: {
        pt: 'Supremo: 4 de dano puro em todos, drena 1 de energia de cada inimigo e concede +12% esquiva e +6% resistência aos aliados por 2 turnos.',
        en: 'Ultimate: 4 pure damage to all, drains 1 energy from each enemy and grants allies +12% dodge and +6% resistance for 2 turns.',
      },
      cost: 3,
    },
  ],
};
