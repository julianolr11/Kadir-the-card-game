// Card data for Albot
module.exports = {
  id: 'albot',
  num: 42,
  height: 1.5,
  weakness: 'puro',
  name: { pt: 'Albot', en: 'Albot' },
  type: { pt: 'Fera', en: 'Beast' },
  element: 'puro',
  img: require('../../img/creatures/albot_bio.webp'),
  // Arte quadrada (1254x1254) num quadro mais largo que alto - o corte central padrão cortava
  // as orelhas. Desloca o corte pra cima, igual ao ajuste do Igrazar.
  imgPosition: 'center 18%',
  color: 'pure',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Investida Radiante', en: 'Radiant Charge' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Uivo Purificador', en: 'Purifying Howl' },
      cost: 1,
      desc: {
        pt: 'Remove 1 debuff aliado e cura 1 de vida.',
        en: 'Removes 1 ally debuff and heals 1 HP.',
      },
    },
  ],
  field: { pt: 'Clareira Alva', en: 'Pale Clearing' },
  fielddesc: {
    pt: 'Criaturas puras ganham +1 ataque enquanto Albot estiver em campo.',
    en: 'Pure creatures gain +1 attack while Albot is on the field.',
  },
  storyTitle: { pt: 'O Uivo Alvo', en: 'The Pale Howl' },
  story: [
    {
      pt: 'Albot vaga por clareiras intocadas, onde a neve nunca se mistura com a terra.',
      en: 'Albot wanders untouched clearings, where snow never mixes with soil.',
    },
    {
      pt: 'Seu pelo branco brilha sob a lua, guiando viajantes perdidos até a segurança.',
      en: 'Its white fur glows under the moon, guiding lost travelers to safety.',
    },
    {
      pt: 'Diz-se que seu uivo purifica qualquer maldição que ronde as redondezas.',
      en: 'It is said that its howl purifies any curse lurking nearby.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'albot_skill_1',
      name: { pt: 'Investida Radiante', en: 'Radiant Charge' },
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'albot_skill_2',
      name: { pt: 'Uivo Purificador', en: 'Purifying Howl' },
      desc: {
        pt: 'Remove 1 debuff aliado e cura 1 de vida.',
        en: 'Removes 1 ally debuff and heals 1 HP.',
      },
      cost: 1,
      type: 'cleanse_heal',
    },
  ],
  defaultBlessing: {
    id: 'albot_blessing',
    name: { pt: 'Fúria da Alcateia', en: 'Pack Fury' },
    desc: {
      pt: 'Todas as feras em campo recebem +1 de dano enquanto Albot estiver em campo.',
      en: 'All Beast creatures on the field deal +1 damage while Albot is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Instinto Alvo
    {
      level: 2,
      type: 'perk',
      id: 'PALE_INSTINCT',
      name: { pt: 'Instinto Alvo', en: 'Pale Instinct' },
      desc: {
        pt: 'Ganha +1 esquiva quando está com vida cheia.',
        en: 'Gains +1 evasion when at full health.',
      },
    },
    // Nível 3 - Habilidade: Garra Cristalina
    {
      level: 3,
      type: 'skill',
      id: 'albot_skill_3',
      name: { pt: 'Garra Cristalina', en: 'Crystal Claw' },
      desc: {
        pt: 'Causa 2 de dano e ignora 1 de escudo inimigo.',
        en: "Deals 2 damage and ignores 1 of the enemy's shield.",
      },
      cost: 1,
      effectType: 'damage_pierce',
    },
    // Nível 4 - Perk: Pelagem Radiante
    {
      level: 4,
      type: 'perk',
      id: 'RADIANT_FUR',
      name: { pt: 'Pelagem Radiante', en: 'Radiant Fur' },
      desc: {
        pt: 'Durante o dia, recebe -1 de dano de ataques.',
        en: 'During the day, takes -1 damage from attacks.',
      },
    },
    // Nível 5 - Habilidade: Investida Selvagem
    {
      level: 5,
      type: 'skill',
      id: 'albot_skill_4',
      name: { pt: 'Investida Selvagem', en: 'Wild Charge' },
      desc: {
        pt: 'Causa 3 de dano e aumenta a velocidade por 2 turnos.',
        en: 'Deals 3 damage and increases speed for 2 turns.',
      },
      cost: 2,
      effectType: 'damage_buff',
    },
    // Nível 6 - Perk: Instinto de Alcateia
    {
      level: 6,
      type: 'perk',
      id: 'PACK_INSTINCT',
      name: { pt: 'Instinto de Alcateia', en: 'Pack Instinct' },
      desc: {
        pt: 'Aliados recebem +1 ataque quando Albot está com vida cheia.',
        en: 'Allies gain +1 attack when Albot is at full health.',
      },
    },
    // Nível 7 - Habilidade: Uivo da Lua Branca
    {
      level: 7,
      type: 'skill',
      id: 'albot_skill_5',
      name: { pt: 'Uivo da Lua Branca', en: 'White Moon Howl' },
      desc: {
        pt: 'Causa 4 de dano e cega o inimigo por 1 turno.',
        en: 'Deals 4 damage and blinds the enemy for 1 turn.',
      },
      cost: 2,
      effectType: 'damage_debuff',
    },
    // Nível 8 - Perk: Coração Resiliente
    {
      level: 8,
      type: 'perk',
      id: 'RESILIENT_HEART',
      name: { pt: 'Coração Resiliente', en: 'Resilient Heart' },
      desc: {
        pt: 'Ao cair abaixo de 50% de vida, recupera 1 de vida.',
        en: 'When dropping below 50% HP, recover 1 HP.',
      },
    },
    // Nível 9 - Habilidade: Matilha Espectral
    {
      level: 9,
      type: 'skill',
      id: 'albot_skill_6',
      name: { pt: 'Matilha Espectral', en: 'Spectral Pack' },
      desc: {
        pt: 'Invoca uma matilha que causa 3 de dano por 2 turnos.',
        en: 'Summons a pack that deals 3 damage for 2 turns.',
      },
      cost: 3,
      effectType: 'damage_dot',
    },
    // Nível 10 - Habilidade: Fúria Alva Suprema
    {
      level: 10,
      type: 'skill',
      id: 'albot_skill_7',
      name: { pt: 'Fúria Alva Suprema', en: 'Supreme Pale Fury' },
      desc: {
        pt: 'Supremo: 4 de dano e aumenta todos os atributos por 2 turnos.',
        en: 'Ultimate: 4 damage and increases all attributes for 2 turns.',
      },
      cost: 4,
      effectType: 'ultimate_buff',
    },
  ],
};
