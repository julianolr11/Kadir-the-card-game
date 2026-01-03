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
        pt: 'Causa 3 de dano e dá +10% velocidade a aliados de ar por 2 turnos.',
        en: 'Deals 3 damage and grants +10% speed to air allies for 2 turns.',
      },
    },
    {
      name: { pt: 'Asas do Zéfiro', en: 'Zephyr Wings' },
      cost: 1,
      desc: {
        pt: 'Evita o próximo ataque e 20% de chance de paralyze leve em quem errar.',
        en: 'Evades next hit and 20% chance to apply light paralysis to the attacker.',
      },
    },
  ],
  field: { pt: 'Brisa do Alvorecer', en: 'Dawn Breeze' },
  fielddesc: {
    pt: 'Criaturas de ar ganham +8% esquiva e 12% de chance de paralisar com ataques leves.',
    en: 'Air creatures gain +8% evasion and 12% chance to paralyze with light hits.',
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
        pt: 'Causa 3 de dano e aplica paralyze leve por 1 turno.',
        en: 'Deals 3 damage and applies light paralysis for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'faskel_skill_2',
      name: { pt: 'Choque Elétrico', en: 'Electric Shock' },
      desc: {
        pt: 'Causa 3 de dano, 35% de paralisar e 8% de stun 1 turno.',
        en: 'Deals 3 damage, 35% to paralyze and 8% to stun 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'faskel_blessing',
    name: { pt: 'Condutor Perfeito', en: 'Perfect Conductor' },
    desc: {
      pt: 'Aliados de ar ganham +6% dano elétrico e paralyze dura +1 turno (máx 2).',
      en: 'Air allies gain +6% electric damage and paralysis lasts +1 turn (max 2).',
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
        pt: 'Causa 3 em área e 25% de paralisar 1 alvo aleatório.',
        en: 'Deals 3 AoE and 25% to paralyze 1 random target.',
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
        pt: 'Causa 4 de dano e +15% velocidade por 2 turnos.',
        en: 'Deals 4 damage and +15% speed for 2 turns.',
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
        pt: 'Causa 4 de dano e 35% de paralisar todos por 1 turno.',
        en: 'Deals 4 damage and 35% to paralyze all for 1 turn.',
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
        pt: 'Supremo: 4 de dano, paralisar garantido 1 turno e 15% de stun 2 turnos.',
        en: 'Ultimate: 4 damage, guaranteed 1-turn paralysis and 15% 2-turn stun.',
      },
      cost: 3,
    },
  ],
};
