// Card data for Drazaq
module.exports = {
  id: 'drazaq',
  num: 8,
  height: 1.3,
  weakness: 'puro',
  name: { pt: 'Drazraq', en: 'Drazraq' },
  type: { pt: 'Draconídeo', en: 'Draconid' },
  element: 'puro',
  img: require('../../img/creatures/drazraq_bio.webp'),
  color: 'pure',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Impacto Bestial', en: 'Beast Strike' },
      cost: 1,
      desc: {
        pt: 'Causa 4 de dano, aplica bleed leve e derruba (knockdown) 1 turno.',
        en: 'Deals 4 damage, applies light bleed and knocks down 1 turn.',
      },
    },
    {
      name: { pt: 'Fúria Vulcânica', en: 'Volcanic Rage' },
      cost: 1,
      desc: {
        pt: 'Ganha +8% ataque por 2 turnos e 20% de chance de paralisar ao atacar.',
        en: 'Gain +8% attack for 2 turns and 20% chance to paralyze on hit.',
      },
    },
  ],
  field: { pt: 'Fenda Vulcânica', en: 'Volcanic Rift' },
  fielddesc: {
    pt: 'Aliados ganham +5% ataque e ataques corpo a corpo aplicam queimadura leve.',
    en: 'Allies gain +5% attack and melee hits apply light burn.',
  },
  storyTitle: { pt: 'Origem de Drazraq', en: 'Origin of Drazraq' },
  story: [
    {
      pt: 'Drazraq nasceu quando lava encontrou raízes antigas, fundindo chamas e fúria primeva.',
      en: 'Drazraq was born when lava met ancient roots, fusing flame and primal wrath.',
    },
    {
      pt: 'Ele carrega cicatrizes incandescentes que brilham ao ritmo de sua respiração.',
      en: 'He bears incandescent scars that glow with every breath.',
    },
    {
      pt: 'Onde ele pisa, o solo racha e libera vapores que cegam e sufocam invasores.',
      en: 'Where he treads, the ground cracks, releasing vapors that blind and choke intruders.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'drazaq_skill_1',
      name: { pt: 'Golpe Vulcânico', en: 'Volcanic Slash' },
      desc: {
        pt: 'Causa 4 de dano, aplica queimadura e 30% de chance de bleed.',
        en: 'Deals 4 damage, applies burn and 30% chance to bleed.',
      },
      cost: 1,
      type: 'damage_dot',
    },
    {
      id: 'drazaq_skill_2',
      name: { pt: 'Maldição Obscura', en: 'Dark Curse' },
      desc: {
        pt: 'Causa 3 de dano e reduz ataque em 10% por 2 turnos.',
        en: 'Deals 3 damage and reduces attack by 10% for 2 turns.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'drazaq_blessing',
    name: { pt: 'Roubo de Conhecimento', en: 'Knowledge Theft' },
    desc: {
      pt: 'Ao ser invocado permite ao usuário escolher uma carta da mão do adversário e puxar para a sua mão.',
      en: 'When summoned, you choose 1 card from opponent\'s hand and steal it to your hand.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'drazaq_skill_3',
      name: { pt: 'Sucção de Lava', en: 'Lava Drain' },
      desc: {
        pt: 'Causa 3 de dano, cura 50% e aplica burn leve.',
        en: 'Deals 3 damage, heals 50% and applies light burn.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'LIFESTEAL_INCREASE' },
    {
      level: 3,
      type: 'skill',
      id: 'drazaq_skill_4',
      name: { pt: 'Garras Vulcânicas', en: 'Volcanic Claws' },
      desc: {
        pt: 'Causa 4 de dano, bleed 2 turnos e -8% armadura.',
        en: 'Deals 4 damage, bleed 2 turns and -8% armor.',
      },
      cost: 2,
    },
    { level: 4, type: 'perk', id: 'HP_PLUS_1' },
    {
      level: 5,
      type: 'skill',
      id: 'drazaq_skill_5',
      name: { pt: 'Noite Eterna', en: 'Eternal Night' },
      desc: {
        pt: 'Causa 4 de dano e aplica escuridão (dano reduzido) por 2 turnos.',
        en: 'Deals 4 damage and applies darkness (reduced damage) 2 turns.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'MAGIC_RESISTANCE' },
    {
      level: 7,
      type: 'skill',
      id: 'drazaq_skill_6',
      name: { pt: 'Portal da Perdição', en: 'Portal of Perdition' },
      desc: {
        pt: 'Causa 4 de dano, -8% em todos stats do alvo e 20% de paralisar.',
        en: 'Deals 4 damage, -8% all stats to target, 20% paralyze.',
      },
      cost: 2,
    },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    { level: 9, type: 'perk', id: 'EVASION_BONUS' },
    {
      level: 10,
      type: 'skill',
      id: 'drazaq_skill_7',
      name: { pt: 'Consumidor de Almas', en: 'Soul Devourer' },
      desc: {
        pt: 'Supremo: 4 de dano, remove buffs e aplica bleed extremo 3 turnos.',
        en: 'Ultimate: 4 damage, removes buffs and applies extreme bleed 3 turns.',
      },
      cost: 3,
    },
  ],
};
