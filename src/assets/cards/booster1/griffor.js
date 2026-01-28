// Card data for Griffor
module.exports = {
  id: 'griffor',
  num: 5,
  height: 2.2,
  weakness: 'puro',
  name: { pt: 'Griffor', en: 'Griffor' },
  type: { pt: 'Ave', en: 'Bird' },
  element: 'puro',
  img: require('../../img/creatures/griffor_bio.webp'),
  color: 'pure',
  hp: 4,
  abilities: [
    {
      name: { pt: 'Voo Sagrado', en: 'Sacred Flight' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Proteção Celestial', en: 'Celestial Protection' },
      cost: 1,
      desc: {
        pt: 'Aliados recebem escudo de luz.',
        en: 'Allies receive a light shield.',
      },
    },
  ],
  field: { pt: 'Céu Imaculado', en: 'Immaculate Sky' },
  fielddesc: {
    pt: 'Aliados recebem 3% menos dano enquanto Griffor estiver em campo.',
    en: 'Allies take 3% less damage while Griffor is on the field.',
  },
  storyTitle: { pt: 'Origem de Griffor', en: 'Origin of Griffor' },
  story: [
    {
      pt: 'Griffor é uma ave lendária, símbolo de pureza e proteção.',
      en: 'Griffor is a legendary bird, symbol of purity and protection.',
    },
    {
      pt: 'Seu voo inspira coragem e esperança.',
      en: 'Its flight inspires courage and hope.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'griffor_skill_1',
      name: { pt: 'Garra Dilaceradora', en: 'Rending Claw' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo com garras afiadas.',
        en: 'Deals 3 damage to the enemy with sharp claws.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'griffor_skill_2',
      name: { pt: 'Salto Acrobático', en: 'Acrobatic Leap' },
      desc: {
        pt: 'Causa 2 de dano e aumenta esquiva em 6% por 1 turno.',
        en: 'Deals 2 damage and increases evasion by 6% for 1 turn.',
      },
      cost: 1,
      type: 'damage_buff',
    },
  ],
  defaultBlessing: {
    id: 'griffor_blessing',
    name: { pt: 'Ferocidade Selvagem', en: 'Wild Ferocity' },
    desc: {
      pt: 'Criaturas de fogo ganham +4% de ataque enquanto Griffor estiver em campo.',
      en: 'Fire creatures gain +4% attack while Griffor is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Instinto Selvagem
    {
      level: 2,
      type: 'perk',
      id: 'WILD_INSTINCT',
      name: { pt: 'Instinto Selvagem', en: 'Wild Instinct' },
      desc: {
        pt: 'Ganha +1 ataque ao entrar em campo.',
        en: 'Gain +1 attack when summoned.',
      },
    },
    // Nível 3 - Habilidade: Ataques Rápidos
    {
      level: 3,
      type: 'skill',
      id: 'griffor_skill_ataques_rapidos',
      name: { pt: 'Ataques Rápidos', en: 'Quick Strikes' },
      desc: {
        pt: 'Causa 2 de dano duas vezes consecutivas.',
        en: 'Deals 2 damage twice consecutively.',
      },
      cost: 1,
      type: 'multi_hit',
    },
    // Nível 4 - Perk: Garras Protetoras
    {
      level: 4,
      type: 'perk',
      id: 'PROTECTIVE_CLAWS',
      name: { pt: 'Garras Protetoras', en: 'Protective Claws' },
      desc: {
        pt: 'Recebe -1 de dano de ataques físicos.',
        en: 'Takes -1 damage from physical attacks.',
      },
    },
    // Nível 5 - Habilidade: Ataque Feral
    {
      level: 5,
      type: 'skill',
      id: 'griffor_skill_ataque_feral',
      name: { pt: 'Ataque Feral', en: 'Feral Attack' },
      desc: {
        pt: 'Causa 4 de dano e ignora 5% da defesa inimiga.',
        en: 'Deals 4 damage and ignores 5% of enemy defense.',
      },
      cost: 2,
      type: 'damage_shieldpierce',
    },
    // Nível 6 - Perk: Fôlego Selvagem
    {
      level: 6,
      type: 'perk',
      id: 'WILD_BREATH',
      name: { pt: 'Fôlego Selvagem', en: 'Wild Breath' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 1 de vida.',
        en: 'When defeating an enemy, recover 1 HP.',
      },
    },
    // Nível 7 - Habilidade: Velocidade Lendária
    {
      level: 7,
      type: 'skill',
      id: 'griffor_skill_velocidade_lendaria',
      name: { pt: 'Velocidade Lendária', en: 'Legendary Speed' },
      desc: {
        pt: 'Causa 3 de dano e age 2 vezes por turno.',
        en: 'Deals 3 damage and acts twice per turn.',
      },
      cost: 2,
      type: 'multi_turn',
    },
    // Nível 8 - Perk: Garras Protetoras
    {
      level: 8,
      type: 'perk',
      id: 'PROTECTIVE_CLAWS',
      name: { pt: 'Garras Protetoras', en: 'Protective Claws' },
      desc: {
        pt: 'No início do turno, ganha 1 de escudo se estiver com ataque ativo.',
        en: 'At the start of the turn, gain 1 shield if attack is active.',
      },
    },
    // Nível 9 - Habilidade: Fúria Selvagem
    {
      level: 9,
      type: 'skill',
      id: 'griffor_skill_furia_selvagem',
      name: { pt: 'Fúria Selvagem', en: 'Wild Fury' },
      desc: {
        pt: 'Causa 4 de dano e reduz defesa do inimigo.',
        en: 'Deals 4 damage and reduces enemy defense.',
      },
      cost: 3,
      type: 'damage_defense_down',
    },
    // Nível 10 - Habilidade: Grito do Predador
    {
      level: 10,
      type: 'skill',
      id: 'griffor_skill_grito_predador',
      name: { pt: 'Grito do Predador', en: "Predator's Roar" },
      desc: {
        pt: 'Supremo: 4 de dano, atordoa o inimigo e recupera 2 de vida.',
        en: 'Ultimate: 4 damage, stuns the enemy, and recovers 2 HP.',
      },
      cost: 4,
      type: 'ultimate_stun_heal',
    },
  ],
};
