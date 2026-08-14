// Card data for Nihil
module.exports = {
  id: 'nihil',
  title: { pt: 'Devoradora de Essência', en: 'Essence Devourer' },
  num: 30,
  height: 2.3,
  weakness: 'fogo',
  name: { pt: 'Nihil', en: 'Nihil' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'puro',
  img: require('../../img/creatures/nihil_bio.webp'),
  color: 'pure',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Dreno Etéreo', en: 'Ethereal Drain' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano puro e rouba 1 de essência, curando 1 de HP.',
        en: 'Deals 3 pure damage and steals 1 essence, healing 1 HP.',
      },
    },
    {
      name: { pt: 'Rasgadura do Vácuo', en: 'Void Rend' },
      cost: 2,
      desc: {
        pt: 'Causa 2 de dano em área e aplica -1 resistência por 2 turnos.',
        en: 'Deals 2 area damage and applies -1 resistance for 2 turns.',
      },
    },
  ],
  field: { pt: 'Eco do Nada', en: 'Echo of Nothingness' },
  fielddesc: {
    pt: 'Ao entrar, inimigos perdem 1 essência e -1 precisão por 1 turno; aliados puros ganham +1 esquiva.',
    en: 'On entry, enemies lose 1 essence and imprecision for 1 turn; pure allies gain +1 evasion.',
  },
  storyTitle: { pt: 'Vazio Faminto', en: 'Ravenous Void' },
  story: [
    {
      pt: 'Nihil despertou no intervalo entre os elementos, onde a essência perde forma e retorna ao vazio.',
      en: 'Nihil awakened in the space between elements, where essence loses form and returns to the void.',
    },
    {
      pt: 'Seu corpo não é carne nem sombra: é uma fenda faminta que imita a forma das criaturas que devora.',
      en: 'Its body is neither flesh nor shadow, but a hungry rift that mimics the creatures it devours.',
    },
    {
      pt: 'As marcas azuladas em sua pele são correntes de energia roubada, ainda tentando escapar.',
      en: 'The blue marks across its hide are streams of stolen energy still trying to escape.',
    },
    {
      pt: 'Nihil enfraquece suas presas antes do ataque, drenando resistência, essência e vontade.',
      en: 'Nihil weakens its prey before striking, draining resistance, essence, and will.',
    },
    {
      pt: 'Quanto mais energia consome, mais sólido se torna — e mais difícil é lembrar o que existia antes dele.',
      en: 'The more energy it consumes, the more solid it becomes, and the harder it is to remember what existed before it.',
    },
    {
      pt: 'Quando o silêncio toma o campo, Nihil já começou a se alimentar.',
      en: 'When silence overtakes the battlefield, Nihil has already begun to feed.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'nihil_skill_1',
      name: { pt: 'Mordida Vazia', en: 'Void Bite' },
      desc: {
        pt: 'Causa 3 de dano puro e rouba 1 de essência.',
        en: 'Deals 3 pure damage and steals 1 essence.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'nihil_skill_2',
      name: { pt: 'Silêncio da Alma', en: 'Soul Silence' },
      desc: {
        pt: 'Causa 2 de dano em área e reduz precisão dos inimigos em 1 por 1 turno.',
        en: 'Deals 2 area damage and applies imprecision for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'nihil_blessing',
    name: { pt: 'Veneno do Vazio', en: 'Poison of the Void' },
    desc: {
      pt: 'Ao ser invocada o usuário escolhe uma criatura do campo do oponente para receber envenenamento por 2 turnos.',
      en: 'When summoned, you choose 1 enemy creature on the field to receive poison for 2 turns.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Essência Vazia
    {
      level: 2,
      type: 'perk',
      id: 'VOID_ESSENCE',
      name: { pt: 'Essência Vazia', en: 'Void Essence' },
      desc: {
        pt: 'Ganha +1 resistência ao entrar em campo.',
        en: 'Gain +1 resistance when summoned.',
      },
    },
    // Nível 3 - Habilidade: Espiral Devoradora
    {
      level: 3,
      type: 'skill',
      id: 'nihil_skill_espiral_devoradora',
      name: { pt: 'Espiral Devoradora', en: 'Devouring Spiral' },
      desc: {
        pt: 'Causa 2 de dano puro e aplica -1 resistência por 2 turnos.',
        en: 'Deals 2 pure damage and applies -1 resistance for 2 turns.',
      },
      cost: 1,
      effectType: 'damage_resist_down',
    },
    // Nível 4 - Perk: Vazio Protetor
    {
      level: 4,
      type: 'perk',
      id: 'PROTECTIVE_VOID',
      name: { pt: 'Vazio Protetor', en: 'Protective Void' },
      desc: {
        pt: 'Recebe -1 de dano de ataques puros.',
        en: 'Takes -1 damage from pure attacks.',
      },
    },
    // Nível 5 - Habilidade: Cicatriz Etérea
    {
      level: 5,
      type: 'skill',
      id: 'nihil_skill_cicatriz_eterea',
      name: { pt: 'Cicatriz Etérea', en: 'Ethereal Scar' },
      desc: {
        pt: 'Causa 3 de dano e deixa vulnerável: recebe +1 dano por 2 turnos.',
        en: 'Deals 3 damage and leaves target vulnerable: takes +1 damage for 2 turns.',
      },
      cost: 2,
      effectType: 'damage_vulnerable',
    },
    // Nível 6 - Perk: Fôlego do Nada
    {
      level: 6,
      type: 'perk',
      id: 'VOID_BREATH',
      name: { pt: 'Fôlego do Nada', en: 'Void Breath' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 1 de vida.',
        en: 'When defeating an enemy, recover 1 HP.',
      },
    },
    // Nível 7 - Habilidade: Vazio Sanguessuga
    {
      level: 7,
      type: 'skill',
      id: 'nihil_skill_vazio_sanguessuga',
      name: { pt: 'Vazio Sanguessuga', en: 'Leeching Void' },
      desc: {
        pt: 'Causa 2 de dano em área, drena 1 essência de cada inimigo e cura 2 de HP.',
        en: 'Deals 2 area damage, drains 1 essence from each enemy, and heals 2 HP.',
      },
      cost: 2,
      effectType: 'aoe_drain_heal',
    },
    // Nível 8 - Perk: Essência Protetora
    {
      level: 8,
      type: 'perk',
      id: 'PROTECTIVE_ESSENCE',
      name: { pt: 'Essência Protetora', en: 'Protective Essence' },
      desc: {
        pt: 'No início do turno, ganha 1 de escudo se estiver com resistência ativa.',
        en: 'At the start of the turn, gain 1 shield if resistance is active.',
      },
    },
    // Nível 9 - Habilidade: Fenda Absoluta
    {
      level: 9,
      type: 'skill',
      id: 'nihil_skill_fenda_absoluta',
      name: { pt: 'Fenda Absoluta', en: 'Absolute Rift' },
      desc: {
        pt: 'Causa 4 de dano puro e remove 1 efeito positivo do alvo.',
        en: 'Deals 4 pure damage and removes 1 positive effect from the target.',
      },
      cost: 3,
      effectType: 'damage_dispel',
    },
    // Nível 10 - Habilidade: Abismo Faminto
    {
      level: 10,
      type: 'skill',
      id: 'nihil_skill_abismo_faminto',
      name: { pt: 'Abismo Faminto', en: 'Ravenous Abyss' },
      desc: {
        pt: 'Supremo: 5 de dano puro em todos, drena 1 essência de cada e concede escudo que nega 1 ataque.',
        en: 'Ultimate: 5 pure damage to all, drains 1 essence each, and grants a shield that negates 1 attack.',
      },
      cost: 4,
      effectType: 'ultimate_aoe_drain_shield',
    },
  ],
};
