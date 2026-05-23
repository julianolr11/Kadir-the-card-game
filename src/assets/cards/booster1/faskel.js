// Card data for Faskel
module.exports = {
  id: 'faskel',
  title: { pt: 'Arauto dos Ventos Eternos', en: 'Herald of the Eternal Winds' },
  num: 18,
  height: 2.1,
  weakness: 'terra',
  name: { pt: 'Faskel', en: 'Faskel' },
  type: { pt: 'Mística', en: 'Mystic' },
  element: 'ar',
  img: require('../../img/creatures/faskel_bio.webp'),
  color: 'air',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Galope Celeste', en: 'Celestial Gallop' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e concede +1 velocidade a aliados de ar por 2 turnos.',
        en: 'Deals 3 damage and grants +1 speed to air allies for 2 turns.',
      },
    },
    {
      name: { pt: 'Asas do Zéfiro', en: 'Zephyr Wings' },
      cost: 1,
      desc: {
        pt: 'Evita o próximo ataque e jogue a moeda 1 vez; se der cara, paralisia leve em quem errar.',
        en: 'Evades the next hit. Flip a coin once; on heads, apply light paralysis to the attacker.',
      },
    },
  ],
  field: { pt: 'Brisa do Alvorecer', en: 'Dawn Breeze' },
  fielddesc: {
    pt: 'Criaturas de ar ganham +1 esquiva. Em ataques leves, jogue a moeda 1 vez; se der cara, paralisa o alvo.',
    en: 'Air creatures gain +1 evasion. Flip a coin once on light hits; on heads, paralyze the target.',
  },
  storyTitle: { pt: 'Lenda de Faskel', en: 'Legend of Faskel' },
  story: [
    {
      pt: 'Diz-se que Faskel nasce onde o primeiro vento da manhã toca as montanhas.',
      en: 'It is said Faskel is born where the first morning wind touches the mountains.',
    },
    {
      pt: 'Seu galope ecoa como um presságio de mudança e liberdade.',
      en: 'Its gallop echoes as an omen of change and freedom.',
    },
    {
      pt: 'Ele atravessa tempestades como se fossem véus finos, deixando para trás trovões que confundem inimigos.',
      en: 'It crosses storms as thin veils, leaving thunder behind to disorient foes.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'faskel_skill_1',
      name: { pt: 'Lâmina Fulminante', en: 'Lightning Blade' },
      desc: {
        pt: 'Causa 3 de dano e aplica paralisia leve por 1 turno.',
        en: 'Deals 3 damage and applies light paralysis for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'faskel_skill_2',
      name: { pt: 'Choque Elétrico', en: 'Electric Shock' },
      desc: {
        pt: 'Causa 3 de dano e paralisa por 1 turno. Jogue a moeda 1 vez; se der cara, também atordoa por 1 turno.',
        en: 'Deals 3 damage and paralyzes for 1 turn. Flip a coin once; on heads, also stuns for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'faskel_blessing',
    name: { pt: 'Condutor Perfeito', en: 'Perfect Conductor' },
    desc: {
      pt: 'Aliados de ar causam +1 dano elétrico e paralisia dura +1 turno (máximo 2).',
      en: 'Air allies deal +1 electric damage and paralysis lasts +1 turn (max 2).',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'faskel_skill_3',
      name: { pt: 'Raio Destrutivo', en: 'Destructive Lightning' },
      desc: {
        pt: 'Causa 3 em área e jogue a moeda 1 vez; se der cara, paralisa 1 alvo aleatório.',
        en: 'Deals 3 AoE damage and paralyzes 1 random target.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    {
      level: 3,
      type: 'skill',
      id: 'faskel_skill_4',
      name: { pt: 'Descarga Elétrica', en: 'Electric Discharge' },
      desc: {
        pt: 'Causa 4 de dano e +1 velocidade por 2 turnos.',
        en: 'Deals 4 damage and +1 speed for 2 turns.',
      },
      cost: 2,
    },
    { level: 4, type: 'perk', id: 'PARALYZE_CHANCE_10' },
    {
      level: 5,
      type: 'skill',
      id: 'faskel_skill_5',
      name: { pt: 'Tempestade Elétrica', en: 'Electric Storm' },
      desc: {
        pt: 'Causa 4 de dano. Jogue a moeda 1 vez; se der cara, paralisa todos os inimigos por 1 turno.',
        en: 'Deals 4 damage and paralyzes all enemies for 1 turn.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'EVASION_PLUS_8' },
    { level: 7, type: 'perk', id: 'GUARDIAN_KILL_XP_BONUS' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'faskel_skill_6',
      name: { pt: 'Fulgor Supremo', en: 'Supreme Radiance' },
      desc: {
        pt: 'Causa 4 de dano e limpa 1 debuff do aliado mais ferido.',
        en: 'Deals 4 damage and cleanses 1 debuff from the most injured ally.',
      },
      cost: 3,
    },
    {
      level: 10,
      type: 'skill',
      id: 'faskel_skill_7',
      name: { pt: 'Apocalipse Elétrico', en: 'Electric Apocalypse' },
      desc: {
        pt: 'Supremo: causa 4 de dano e aplica paralisia garantida por 1 turno. Jogue a moeda 1 vez; se der cara, atordoa por 2 turnos.',
        en: 'Ultimate: deals 4 damage and applies guaranteed paralysis for 1 turn. Flip a coin once; on heads, stuns for 2 turns.',
      },
      cost: 3,
    },
  ],
};
