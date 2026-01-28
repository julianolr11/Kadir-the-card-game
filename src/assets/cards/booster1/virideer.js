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
      damage: 3,
      shield: 4,
    },
    {
      name: { pt: 'Orvalho Revigorante', en: 'Revitalizing Dew' },
      cost: 2,
      desc: {
        pt: 'Cura 2 de vida e remove 1 debuff de um aliado.',
        en: 'Heals 2 HP and removes 1 debuff from an ally.',
      },
      heal: 2,
      cleanse: 1,
    },
  ],
  field: { pt: 'Campo de Orvalho', en: 'Dew Field' },
  fielddesc: {
    pt: 'Aliados recuperam 1 de vida ao final do turno enquanto Virideer estiver em campo.',
    en: 'Allies recover 1 HP at the end of the turn while Virideer is on the field.',
  },
  storyTitle: { pt: 'Canção do Orvalho', en: 'Dew Song' },
  story: [
    {
      pt: 'Virideer dança ao amanhecer, espalhando gotas de cura por onde passa.',
      en: 'Virideer dances at dawn, spreading healing drops wherever it goes.',
    },
    {
      pt: 'Seu chifre brilha com a luz da esperança, guiando aliados perdidos.',
      en: 'Its horn shines with the light of hope, guiding lost allies.',
    },
    {
      pt: 'Dizem que uma lágrima de Virideer pode curar até as feridas mais profundas.',
      en: 'It is said that a Virideer tear can heal even the deepest wounds.',
    }
  ],
  isGuardian: true,
  defaultSkills: [
    {
      id: 'virideer_skill_orvalho_curativo',
      name: { pt: 'Orvalho Curativo', en: 'Healing Dew' },
      desc: {
        pt: 'Cura 2 de vida.',
        en: 'Heals 2 HP.',
      },
      cost: 1,
      type: 'heal',
      heal: 2,
    },
    {
      id: 'virideer_skill_chifre_luminescente',
      name: { pt: 'Chifre Luminescente', en: 'Luminous Horn' },
      desc: {
        pt: 'Causa 2 de dano e 50% de chance de aplicar <span class="debuff-blind">cegueira</span> por 1 turno.',
        en: 'Deals 2 damage and 50% chance to apply <span class="debuff-blind">blind</span> for 1 turn.',
      },
      cost: 2,
      type: 'damage_blind',
      damage: 2,
      chance: 0.5,
      statusEffect: 'blind',
      duration: 1,
    },
  ],
  defaultBlessing: {
    id: 'virideer_blessing',
    name: { pt: 'Luz do Orvalho', en: 'Dewlight' },
    desc: {
      pt: 'Aliados curam +1 de vida ao receber cura.',
      en: 'Allies heal +1 HP when healed.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Passos Graciosos
    {
      level: 2,
      type: 'perk',
      id: 'GRACEFUL_STEPS',
      name: { pt: 'Passos Graciosos', en: 'Graceful Steps' },
      desc: {
        pt: 'Ao esquivar, recupera 1 de vida.',
        en: 'When evading, recovers 1 HP.',
      },
    },
    // Nível 3 - Habilidade: Névoa Calmante
    {
      level: 3,
      type: 'skill',
      id: 'virideer_skill_nevoa_calmante',
      name: { pt: 'Névoa Calmante', en: 'Calming Mist' },
      desc: {
        pt: 'Remove 1 debuff de todos os aliados.',
        en: 'Removes 1 debuff from all allies.',
      },
      cost: 1,
      type: 'aoe_cleanse',
    },
    // Nível 4 - Perk: Chifre Reluzente
    {
      level: 4,
      type: 'perk',
      id: 'SHINING_HORN',
      name: { pt: 'Chifre Reluzente', en: 'Shining Horn' },
      desc: {
        pt: 'Aumenta chance de cegueira em +15%.',
        en: 'Increases blind chance by +15%.',
      },
    },
    // Nível 5 - Habilidade: Investida Serena
    {
      level: 5,
      type: 'skill',
      id: 'virideer_skill_investida_serena',
      name: { pt: 'Investida Serena', en: 'Serene Charge' },
      desc: {
        pt: 'Causa 2 de dano e cura 1 de vida para si.',
        en: 'Deals 2 damage and heals 1 HP to self.',
      },
      cost: 1,
      type: 'damage_selfheal',
      damage: 2,
      heal: 1,
    },
    // Nível 6 - Perk: Cura Refrescante
    {
      level: 6,
      type: 'perk',
      id: 'REFRESHING_HEAL',
      name: { pt: 'Cura Refrescante', en: 'Refreshing Heal' },
      desc: {
        pt: 'Ao curar um aliado, concede +1 de escudo.',
        en: 'When healing an ally, grants +1 shield.',
      },
    },
    // Nível 7 - Habilidade: Orvalho Purificador
    {
      level: 7,
      type: 'skill',
      id: 'virideer_skill_orvalho_purificador',
      name: { pt: 'Orvalho Purificador', en: 'Purifying Dew' },
      desc: {
        pt: 'Cura 2 de vida e remove todos os debuffs de um aliado.',
        en: 'Heals 2 HP and removes all debuffs from an ally.',
      },
      cost: 2,
      type: 'heal_fullcleanse',
      heal: 2,
    },
    // Nível 8 - Perk: Aurora Matinal
    {
      level: 8,
      type: 'perk',
      id: 'MORNING_AURORA',
      name: { pt: 'Aurora Matinal', en: 'Morning Aurora' },
      desc: {
        pt: 'Aliados recebem +1 de cura no início do turno.',
        en: 'Allies receive +1 healing at the start of the turn.',
      },
    },
    // Nível 9 - Habilidade: Chifre Solar
    {
      level: 9,
      type: 'skill',
      id: 'virideer_skill_chifre_solar',
      name: { pt: 'Chifre Solar', en: 'Solar Horn' },
      desc: {
        pt: 'Causa 3 de dano e 50% de chance de silenciar por 1 turno.',
        en: 'Deals 3 damage and 50% chance to silence for 1 turn.',
      },
      cost: 2,
      type: 'damage_silence',
      damage: 3,
      chance: 0.5,
      statusEffect: 'silence',
      duration: 1,
    },
    // Nível 10 - Habilidade: Benção do Orvalho
    {
      level: 10,
      type: 'skill',
      id: 'virideer_skill_bencao_orvalho',
      name: { pt: 'Benção do Orvalho', en: 'Dew Blessing' },
      desc: {
        pt: 'Cura todos os aliados em 3 de vida e remove todos os debuffs.',
        en: 'Heals all allies for 3 HP and removes all debuffs.',
      },
      cost: 3,
      type: 'aoe_heal_fullcleanse',
      heal: 3,
    },
  ],
};
