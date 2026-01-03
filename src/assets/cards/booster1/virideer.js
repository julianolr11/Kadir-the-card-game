// Card data for Virideer
module.exports = {
  id: 'virideer',
  num: 11,
  height: 2.0,
  weakness: 'fogo',
  name: { pt: 'Virideer', en: 'Virideer' },
  type: { pt: 'Mística', en: 'Mystic' },
  element: 'terra',
  img: require('../../img/creatures/virideer_bio.webp'),
  color: 'earth',
  hp: 4,
  abilities: [
    {
      name: { pt: 'Chifre Protetor', en: 'Protective Horn' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e concede escudo de 4 de vida ao aliado mais frágil.',
        en: 'Deals 3 damage and grants a 4 HP shield to the weakest ally.',
      },
    },
    {
      name: { pt: 'Crescimento Rápido', en: 'Rapid Growth' },
      cost: 1,
      desc: {
        pt: 'Recupera 3 de vida e aplica regen de 2/turno por 2 turnos.',
        en: 'Restores 3 HP and applies 2 regen per turn for 2 turns.',
      },
    },
  ],
  field: { pt: 'Floresta Ancestral', en: 'Ancestral Forest' },
  fielddesc: {
    pt: 'Aliados ganham 2 de regen e raízes têm 20% de chance de imobilizar inimigos ao entrar.',
    en: 'Allies gain 2 regen and roots have 20% chance to immobilize new enemies.',
  },
  storyTitle: { pt: 'Origem de Virideer', en: 'Origin of Virideer' },
  story: [
    {
      pt: 'Virideer percorre clareiras que só existem ao amanhecer, onde o orvalho forma runas de proteção.',
      en: 'Virideer roams clearings that only exist at dawn, where dew forms runes of protection.',
    },
    {
      pt: 'Suas raízes respondem a sussurros dos anciãos, erguendo muralhas vivas em torno dos aliados.',
      en: 'Its roots answer elder whispers, raising living walls around allies.',
    },
    {
      pt: 'Quando enfurecido, o chão se fecha como uma armadilha, prendendo invasores com espinhos curativos e doloridos.',
      en: 'When angered, the ground seals like a trap, holding intruders with thorns that heal and hurt.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'virideer_skill_1',
      name: { pt: 'Raiz Guardiã', en: 'Guardian Root' },
      desc: {
        pt: 'Causa 3 de dano, gera escudo de 4 e 30% de imobilizar por 1 turno.',
        en: 'Deals 3 damage, grants 4 shield and 30% to immobilize 1 turn.',
      },
      cost: 1,
      type: 'damage_shield',
    },
    {
      id: 'virideer_skill_2',
      name: { pt: 'Seiva Renovadora', en: 'Renewing Sap' },
      desc: {
        pt: 'Cura 4, aplica regen 2/turno por 2 turnos e remove 1 debuff.',
        en: 'Heals 4, applies 2 regen/turn for 2 turns and cleanses 1 debuff.',
      },
      cost: 1,
      type: 'heal_regen',
    },
  ],
  defaultBlessing: {
    id: 'virideer_blessing',
    name: { pt: 'Aliança Verdejante', en: 'Verdant Alliance' },
    desc: {
      pt: 'Aliados de terra ganham +6% defesa e curas aplicam 1 de escudo extra.',
      en: 'Earth allies gain +6% defense and heals grant +1 extra shield.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'virideer_skill_3',
      name: { pt: 'Raízes Curativas', en: 'Healing Roots' },
      desc: {
        pt: 'Cura 4 e dá escudo de 3 ao aliado mais ferido.',
        en: 'Heals 4 and grants 3 shield to the most injured ally.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HEALING_BOOST_8' },
    {
      level: 3,
      type: 'skill',
      id: 'virideer_skill_4',
      name: { pt: 'Espinhos Venenosos', en: 'Poison Thorns' },
      desc: {
        pt: 'Causa 3 de dano e aplica poison leve por 2 turnos.',
        en: 'Deals 3 damage and applies light poison for 2 turns.',
      },
      cost: 2,
    },
    { level: 4, type: 'perk', id: 'SHIELD_PLUS_10' },
    {
      level: 5,
      type: 'skill',
      id: 'virideer_skill_5',
      name: { pt: 'Chamado da Natureza', en: "Nature's Call" },
      desc: {
        pt: 'Causa 3 de dano e 35% de chance de imobilizar 1 turno.',
        en: 'Deals 3 damage and 35% chance to immobilize 1 turn.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'REGEN_PLUS_4' },
    { level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'virideer_skill_6',
      name: { pt: 'Floresta Sagrada', en: 'Sacred Forest' },
      desc: {
        pt: 'Zona cura 3/turno por 3 turnos e reduz dano recebido em 6%.',
        en: 'Zone heals 3/turn for 3 turns and reduces damage taken by 6%.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'virideer_skill_7',
      name: { pt: 'Renascimento Verdejante', en: 'Verdant Rebirth' },
      desc: {
        pt: 'Supremo: Cura 6, dá escudo 6 e buffa ataque/defesa levemente.',
        en: 'Ultimate: Heals 6, grants 6 shield and slightly buffs attack/defense.',
      },
      cost: 3,
    },
  ],
};
