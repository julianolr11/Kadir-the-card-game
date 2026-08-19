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
      // Era "Impacto Bestial" - genérico, não remetia a nada do tema vulcânico/draconídeo do
      // Drazraq. Renomeado pra encaixar no resto do kit dele (garras em brasa, lava). Custo 3
      // com dano+sangramento+derrubada era desproporcional pra uma habilidade básica -
      // simplificado pra um efeito mais barato e direto.
      name: { pt: 'Investida Incandescente', en: 'Incandescent Charge' },
      cost: 1,
      desc: {
        pt: 'Investe com garras em brasa: causa 1 de dano e aplica sangramento leve por 2 turnos.',
        en: 'Charges with ember-hot claws: deals 1 damage and applies light bleed for 2 turns.',
      },
    },
    {
      name: { pt: 'Fúria Vulcânica', en: 'Volcanic Rage' },
      cost: 1,
      desc: {
        pt: 'Causa 1 de dano ao adversário e elimina 1 de essência do oponente, caso ele tenha.',
        en: 'Deals 1 damage to the opponent and removes 1 essence from the opponent, if they have any.',
      },
    },
  ],
  field: { pt: 'Fenda Vulcânica', en: 'Volcanic Rift' },
  fielddesc: {
    pt: 'Aliados ganham +1 ataque e ataques corpo a corpo aplicam queimadura leve.',
    en: 'Allies gain +1 attack and melee hits apply light burn.',
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
        pt: 'Causa 4 de dano, aplica queimadura e jogue a moeda 1 vez; se der cara, sangramento.',
        en: 'Deals 4 damage, applies burn and flips a coin once; on heads, bleed.',
      },
      cost: 1,
      type: 'damage_dot',
    },
    {
      id: 'drazaq_skill_2',
      name: { pt: 'Maldição Obscura', en: 'Dark Curse' },
      desc: {
        pt: 'Causa 3 de dano e reduz ataque em 1 por 2 turnos.',
        en: 'Deals 3 damage and reduces attack by 1 for 2 turns.',
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
        pt: 'Causa 3 de dano, cura 2 de HP e aplica queimadura leve.',
        en: 'Deals 3 damage, heals 2 HP and applies light burn.',
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
        pt: 'Causa 4 de dano, sangramento 2 turnos e -1 defesa.',
        en: 'Deals 4 damage, bleed 2 turns and -1 defense.',
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
        pt: 'Causa 4 de dano, -1 em ataque e defesa do alvo e jogue a moeda 1 vez; se der cara, paralisa.',
        en: 'Deals 4 damage, -1 attack and defense to target, flip a coin once; on heads, paralyzes.',
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
        pt: 'Supremo: 4 de dano, remove buffs e aplica sangramento extremo 3 turnos.',
        en: 'Ultimate: 4 damage, removes buffs and applies extreme bleed 3 turns.',
      },
      cost: 3,
    },
  ],
};
