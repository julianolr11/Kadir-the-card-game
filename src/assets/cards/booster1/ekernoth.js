// Card data for Ekernoth
module.exports = {
  id: 'ekernoth',
  title: { pt: 'A Tormenta dos Mares', en: 'Storm of the Seas' },
  num: 31,
  height: 18.5,
  weakness: 'terra',
  name: { pt: 'Ekernoth', en: 'Ekernoth' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'agua',
  img: require('../../img/creatures/ekernoth_bio.webp'),
  color: 'water',
  hp: 9,
  abilities: [
    {
      name: { pt: 'Garra Marinada', en: 'Brine Claw' },
      cost: 1,
      desc: {
        pt: 'Causa 4 de dano água e reduz defesa do alvo em 6% por 1 turno.',
        en: 'Deals 4 water damage and lowers target defense by 6% for 1 turn.',
      },
    },
    {
      name: { pt: 'Redemoinho Esmagador', en: 'Crushing Maelstrom' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano em área e aplica -10% velocidade por 2 turnos.',
        en: 'Deals 3 area damage and applies -10% speed for 2 turns.',
      },
    },
  ],
  field: { pt: 'Abismo Salino', en: 'Saline Abyss' },
  fielddesc: {
    pt: 'Ao invocar, cria um escudo de água: aliados ganham +8% defesa e redução de 15% do dano sofrido.',
    en: 'On invoke, creates a water shield: allies gain +8% defense and 15% damage reduction.',
  },
  storyTitle: { pt: 'Titã do Profundo', en: 'Titan of the Deep' },
  story: [
    {
      pt: 'Ekernoth reina nas fossas abissais onde a luz nunca toca e a pressão esmaga civilizações inteiras.',
      en: 'Ekernoth reigns in the abyssal trenches where light never touches and pressure crushes entire civilizations.',
    },
    {
      pt: 'Crustáceo colossal com pinças que abrem furos em navios de ferro como se fossem casca de ovo.',
      en: 'A colossal crustacean with claws that puncture iron ships as if they were eggshells.',
    },
    {
      pt: 'Cada passo provoca maremotos; cada berro forma correntes que rasgam o fundo do oceano.',
      en: 'Each step causes tsunamis; each roar forms currents that tear the ocean floor.',
    },
    {
      pt: 'Nenhuma nau conseguiu retornar das profundezas onde ele patrulha. Os marinheiros sussurram seu nome apenas sussurrado.',
      en: 'No ship has ever returned from the depths where he patrols. Sailors whisper his name only in trembling voices.',
    },
    {
      pt: 'Escudo de água salgada abraça seu corpo blindado, refletindo ataques como espelhos líquidos no vácuo.',
      en: 'A shield of salt water embraces his armored body, reflecting attacks like liquid mirrors in the void.',
    },
    {
      pt: 'Quando Ekernoth sobe às águas rasas, aldeias costeiras trancam as portas e rezam aos deuses esquecidos.',
      en: 'When Ekernoth rises to shallow waters, coastal villages lock their doors and pray to forgotten gods.',
    },
    {
      pt: 'Tormenta. Destruição. O fim silencioso daqueles que ousam desafiar o senhor do abismo.',
      en: 'Storm. Destruction. The silent end for those who dare defy the lord of the abyss.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'ekernoth_skill_1',
      name: { pt: 'Soco de Maré', en: 'Tidal Strike' },
      desc: {
        pt: 'Causa 4 de dano água e reduz defesa em 6%.',
        en: 'Deals 4 water damage and lowers defense by 6%.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'ekernoth_skill_2',
      name: { pt: 'Corrente Presa', en: 'Undertow' },
      desc: {
        pt: 'Causa 2 de dano em área e reduz velocidade dos inimigos em 8% por 1 turno.',
        en: 'Deals 2 area damage and lowers enemy speed by 8% for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'ekernoth_blessing',
    name: { pt: 'Benção dos Abismos', en: 'Blessing of the Abyss' },
    desc: {
      pt: 'Aliados ganham +6% defesa e reduzem dano sofrido em 10%; inimigos sofrem -4% precisão.',
      en: 'Allies gain +6% defense and reduce damage taken by 10%; enemies suffer -4% accuracy.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    // Nível 2 - Perk: Carapaça Abissal
    {
      level: 2,
      type: 'perk',
      id: 'ABYSSAL_CARAPACE',
      name: { pt: 'Carapaça Abissal', en: 'Abyssal Carapace' },
      desc: {
        pt: 'Recebe -2 de dano de ataques físicos por 2 turnos ao entrar em campo.',
        en: 'Takes -2 physical damage for 2 turns when summoned.',
      },
    },
    // Nível 3 - Habilidade: Pressão do Profundo
    {
      level: 3,
      type: 'skill',
      id: 'ekernoth_skill_pressao_profundo',
      name: { pt: 'Pressão do Profundo', en: 'Abyssal Pressure' },
      desc: {
        pt: 'Causa 3 de dano em área e reduz defesa dos inimigos em 10% por 2 turnos.',
        en: 'Deals 3 area damage and reduces enemy defense by 10% for 2 turns.',
      },
      cost: 2,
      type: 'aoe_defense_down',
    },
    // Nível 4 - Perk: Escudo Salino
    {
      level: 4,
      type: 'perk',
      id: 'SALINE_SHIELD',
      name: { pt: 'Escudo Salino', en: 'Saline Shield' },
      desc: {
        pt: 'No início do turno, ganha escudo que absorve 2 de dano.',
        en: 'At the start of the turn, gain a shield that absorbs 2 damage.',
      },
    },
    // Nível 5 - Habilidade: Tormenta Esmagadora
    {
      level: 5,
      type: 'skill',
      id: 'ekernoth_skill_tormenta_esmagadora',
      name: { pt: 'Tormenta Esmagadora', en: 'Crushing Storm' },
      desc: {
        pt: 'Causa 4 de dano em área e reduz velocidade dos inimigos em 12% por 2 turnos.',
        en: 'Deals 4 area damage and reduces enemy speed by 12% for 2 turns.',
      },
      cost: 2,
      type: 'aoe_slow',
    },
    // Nível 6 - Perk: Fúria do Abismo
    {
      level: 6,
      type: 'perk',
      id: 'ABYSSAL_FURY',
      name: { pt: 'Fúria do Abismo', en: 'Abyssal Fury' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 2 de vida.',
        en: 'When defeating an enemy, recover 2 HP.',
      },
    },
    // Nível 7 - Habilidade: Giro Destruidor
    {
      level: 7,
      type: 'skill',
      id: 'ekernoth_skill_giro_destruidor',
      name: { pt: 'Giro Destruidor', en: 'Destructive Spin' },
      desc: {
        pt: 'Causa 3 de dano a todos e bloqueia 1 ataque para aliados próximos por 1 turno.',
        en: 'Deals 3 damage to all and blocks 1 attack for nearby allies for 1 turn.',
      },
      cost: 2,
      type: 'aoe_block',
    },
    // Nível 8 - Perk: Pressão Constante
    {
      level: 8,
      type: 'perk',
      id: 'CONSTANT_PRESSURE',
      name: { pt: 'Pressão Constante', en: 'Constant Pressure' },
      desc: {
        pt: 'Inimigos recebem -1 de defesa enquanto Ekernoth estiver em campo.',
        en: 'Enemies have -1 defense while Ekernoth is on the field.',
      },
    },
    // Nível 9 - Habilidade: Redemoinho Abissal
    {
      level: 9,
      type: 'skill',
      id: 'ekernoth_skill_redemoinho_abissal',
      name: { pt: 'Redemoinho Abissal', en: 'Abyssal Whirlpool' },
      desc: {
        pt: 'Causa 4 de dano em área e puxa todos os inimigos para o centro (reduz evasão).',
        en: 'Deals 4 area damage and pulls all enemies to the center (reduces evasion).',
      },
      cost: 3,
      type: 'aoe_pull',
    },
    // Nível 10 - Habilidade: Maelstrom Abissal
    {
      level: 10,
      type: 'skill',
      id: 'ekernoth_skill_maelstrom_abissal',
      name: { pt: 'Maelstrom Abissal', en: 'Abyssal Maelstrom' },
      desc: {
        pt: 'Supremo: 5 de dano em todos, reduz velocidade em 15%, defesa em 10% por 3 turnos e ganha escudo que absorve 3 de dano.',
        en: 'Ultimate: 5 damage to all, reduces speed by 15%, defense by 10% for 3 turns, and gains a shield absorbing 3 damage.',
      },
      cost: 4,
      type: 'ultimate_aoe_shield',
    },
  ],
};
