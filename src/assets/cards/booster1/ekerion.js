// Card data for Ekerion
module.exports = {
  id: 'ekerion',
  title: { pt: 'Tormenta dos Céus', en: 'Storm of the Skies' },
  num: 36,
  height: 60,
  weakness: 'fogo',
  name: { pt: 'Ekerion', en: 'Ekerion' },
  type: { pt: 'Reptiloide', en: 'Reptiloid' },
  element: 'ar',
  img: require('../../img/creatures/ekerion_bio.webp'),
  color: 'air',
  hp: 13,

  // Habilidades base (exibidas no card preview)
  abilities: [
    {
      name: { pt: 'Fenda Relâmpago', en: 'Lightning Rift' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano ar e reduz a velocidade do alvo em 1 por 1 turno.',
        en: 'Deals 2 air damage and lowers target speed by 1 for 1 turn.',
      },
    },
    {
      name: { pt: 'Fúria da Tormenta', en: "Storm's Fury" },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano em área e reduz a defesa dos inimigos em 1 por 2 turnos.',
        en: 'Deals 3 area damage and lowers enemy defense by 1 for 2 turns.',
      },
    },
  ],

  // Campo de efeito
  field: { pt: 'Olho da Tormenta', en: 'Eye of the Storm' },
  fielddesc: {
    pt: 'Nuvens negras giram sem fim ao seu redor. Todo som se apaga sob o rugido distante do trovão.',
    en: 'Black clouds spin endlessly around it. Every sound fades beneath the distant roar of thunder.',
  },

  // História
  storyTitle: { pt: 'O Dragão da Tempestade', en: 'The Storm Dragon' },
  story: [
    {
      pt: 'Antes de existir vento, existia Ekerion. Diz-se que cada tempestade do mundo é apenas um eco de sua respiração.',
      en: 'Before there was wind, there was Ekerion. It is said every storm in the world is merely an echo of its breath.',
    },
    {
      pt: 'Serpenteia entre as nuvens sem nunca tocar o solo, e relâmpagos nascem onde suas escamas se roçam contra o céu.',
      en: 'It coils through the clouds without ever touching the ground, and lightning is born where its scales brush against the sky.',
    },
    {
      pt: 'Os antigos o chamavam de irmão de Ekerath e Ekernoth — três calamidades que dividem entre si terra, mar e firmamento.',
      en: 'The ancients called it sibling to Ekerath and Ekernoth — three calamities that share the earth, the sea, and the firmament between them.',
    },
    {
      pt: 'Quando ruge, o céu se abre. Quando pousa — e poucos vivos viram isso — reinos inteiros silenciam por medo.',
      en: 'When it roars, the sky splits open. When it lands — and few living souls have witnessed it — entire kingdoms fall silent in fear.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,

  // Habilidades padrão do guardião (sempre disponíveis)
  defaultSkills: [
    {
      id: 'ekerion_skill_1',
      name: { pt: 'Fenda Relâmpago', en: 'Lightning Rift' },
      desc: {
        pt: 'Causa 2 de dano ar e reduz a velocidade do alvo em 1 por 1 turno.',
        en: 'Deals 2 air damage and lowers target speed by 1 for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'ekerion_skill_2',
      name: { pt: 'Fúria da Tormenta', en: "Storm's Fury" },
      desc: {
        pt: 'Causa 3 de dano em área e reduz a defesa dos inimigos em 1 por 2 turnos.',
        en: 'Deals 3 area damage and lowers enemy defense by 1 for 2 turns.',
      },
      cost: 2,
      type: 'damage_debuff',
    },
  ],

  // Bênção padrão
  defaultBlessing: {
    id: 'ekerion_blessing',
    name: { pt: 'Bênção da Tormenta', en: "Storm's Blessing" },
    desc: {
      pt: 'Aliados ganham +1 de defesa; inimigos recebem -1 de velocidade enquanto Ekerion estiver em campo.',
      en: "Allies gain +1 defense; enemies suffer -1 speed while Ekerion is on the field.",
    },
  },

  // Tabela de desbloqueios por nível (0-10)
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'STORM_REFLEXES',
      name: { pt: 'Reflexos da Tormenta', en: 'Storm Reflexes' },
      desc: {
        pt: '15% de chance de esquivar de ataques recebidos.',
        en: '15% chance to dodge incoming attacks.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'ekerion_skill_lanca_de_raio',
      name: { pt: 'Lança de Raio', en: 'Lightning Spear' },
      desc: {
        pt: 'Causa 3 de dano em área e reduz a velocidade dos inimigos em 1 por 2 turnos.',
        en: 'Deals 3 area damage and lowers enemy speed by 1 for 2 turns.',
      },
      cost: 2,
      effectType: 'aoe_slow',
    },
    {
      level: 4,
      type: 'perk',
      id: 'ELECTRIFIED_HIDE',
      name: { pt: 'Pele Eletrizada', en: 'Electrified Hide' },
      desc: {
        pt: 'Reduz permanentemente o dano físico recebido em 1.',
        en: 'Permanently reduces physical damage taken by 1.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'ekerion_skill_vortice_ascendente',
      name: { pt: 'Vórtice Ascendente', en: 'Ascending Vortex' },
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
      id: 'ELECTRIC_FURY',
      name: { pt: 'Fúria Elétrica', en: 'Electric Fury' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 2 de vida.',
        en: 'When defeating an enemy, recover 2 HP.',
      },
    },
    {
      level: 7,
      type: 'skill',
      id: 'ekerion_skill_trovao_rasgante',
      name: { pt: 'Trovão Rasgante', en: 'Rending Thunder' },
      desc: {
        pt: 'Causa 4 de dano a todos os inimigos e reduz sua velocidade em 1 por 2 turnos.',
        en: 'Deals 4 damage to all enemies and lowers their speed by 1 for 2 turns.',
      },
      cost: 3,
      effectType: 'aoe_slow',
    },
    {
      level: 8,
      type: 'perk',
      id: 'MASTERY_OF_WINDS',
      name: { pt: 'Domínio dos Ventos', en: 'Mastery of the Winds' },
      desc: {
        pt: 'Enquanto Ekerion estiver em campo, aliados ganham +1 de velocidade.',
        en: 'While Ekerion is on the field, allies gain +1 speed.',
      },
    },
    {
      level: 9,
      type: 'skill',
      id: 'ekerion_skill_colapso_da_tormenta',
      name: { pt: 'Colapso da Tormenta', en: 'Storm Collapse' },
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
      id: 'ekerion_skill_juizo_da_tempestade',
      name: { pt: 'Juízo da Tempestade', en: "Tempest's Judgment" },
      desc: {
        pt: 'Supremo: causa 5 de dano a todos os inimigos, aplica paralisia e -2 de velocidade por 3 turnos, e ganha um escudo que absorve 3 de dano.',
        en: 'Ultimate: deals 5 damage to all enemies, applies paralyze and -2 speed for 3 turns, and gains a shield absorbing 3 damage.',
      },
      cost: 4,
      effectType: 'ultimate_aoe_shield',
      statusEffect: 'paralyze',
      duration: 3,
    },
  ],
};
