// Card data for Noctyra
module.exports = {
  id: 'noctyra',
  title: { pt: 'Véu Azul da Noite', en: 'Azure Veil of Night' },
  num: 29,
  height: 1.8,
  weakness: 'puro',
  name: { pt: 'Noctyra', en: 'Noctyra' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'ar',
  img: require('../../img/creatures/noctyra_bio.webp'),
  color: 'air',
  hp: 4,
  abilities: [
    {
      name: { pt: 'Distorção Aérea', en: 'Air Distortion' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano e reduz precisão do inimigo em 6% por 1 turno.',
        en: 'Deals 2 damage and lowers enemy accuracy by 6% for 1 turn.',
      },
    },
    {
      name: { pt: 'Asas Furtivas', en: 'Stealthy Wings' },
      cost: 1,
      desc: {
        pt: 'Fica furtiva e ganha +12% esquiva até o próximo turno.',
        en: 'Becomes stealthy and gains +12% evasion until next turn.',
      },
    },
  ],
  field: { pt: 'Correntes do Vácuo', en: 'Vacuum Currents' },
  fielddesc: {
    pt: 'Aliados de ar começam furtivos no primeiro turno; ataques revelam posição por 1 turno.',
    en: 'Air allies start stealthy on the first turn; attacks reveal position for 1 turn.',
  },
  storyTitle: { pt: 'Filha do Silêncio', en: 'Daughter of Silence' },
  story: [
    {
      pt: 'Noctyra nasceu nas correntes silenciosas que atravessam o céu quando a luz se apaga.',
      en: 'Noctyra was born in the silent currents that traverse the sky when light fades.',
    },
    {
      pt: 'Criatura sombria de asas finas, move-se entre vibrações do ar que os olhos não alcançam.',
      en: 'A shadowy creature with delicate wings, it moves between air vibrations beyond sight.',
    },
    {
      pt: 'Os contornos azulados de suas asas não emitem calor — são fendas de energia aérea, marcando o espaço por onde ela já passou… ou ainda observa.',
      en: 'The azure outlines of her wings emit no heat — they are rifts of aerial energy, marking where she has passed... or still watches.',
    },
    {
      pt: 'Durante o voo, Noctyra distorce o ar ao redor, confundindo sentidos e antecipando movimentos.',
      en: 'In flight, Noctyra distorts the air around her, confusing senses and anticipating movements.',
    },
    {
      pt: 'Ela não enfrenta o inimigo de frente. Ela o cerca, enfraquece e desaparece antes do contra-ataque.',
      en: 'She does not face the enemy head-on. She circles them, weakens them, and vanishes before retaliation.',
    },
    {
      pt: 'Onde o vento hesita, ela já decidiu o desfecho. Corte de Corrente.',
      en: 'Where the wind hesitates, she has already decided the outcome. Currents Cut.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'noctyra_skill_1',
      name: { pt: 'Lâmina do Vácuo', en: 'Void Blade' },
      desc: {
        pt: 'Causa 3 de dano e fica furtiva até o próximo ataque.',
        en: 'Deals 3 damage and becomes stealthy until next attack.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'noctyra_skill_2',
      name: { pt: 'Sussurro Silencioso', en: 'Silent Whisper' },
      desc: {
        pt: 'Causa 2 de dano a todos os inimigos e reduz precisão em 8% por 1 turno.',
        en: 'Deals 2 damage to all enemies and reduces accuracy by 8% for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'noctyra_blessing',
    name: { pt: 'Drenar Vitalidade', en: 'Drain Vitality' },
    desc: {
      pt: 'Ao ser invocado, rouba 1 vida do adversário e acrescenta ao usuário (se não tiver 5 completas).',
      en: 'When summoned, steals 1 life from opponent and adds it to player (if not at full health).',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'noctyra_skill_3',
      name: { pt: 'Corte de Corrente', en: 'Current Cut' },
      desc: {
        pt: 'Causa 3 de dano e paralisa 35% de chance por 1 turno.',
        en: 'Deals 3 damage and 35% chance to paralyze for 1 turn.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    {
      level: 3,
      type: 'skill',
      id: 'noctyra_skill_4',
      name: { pt: 'Envoltório Etéreo', en: 'Ethereal Wrap' },
      desc: {
        pt: 'Fica furtiva, ganha +6% esquiva e reduz dano recebido em 3% por 2 turnos.',
        en: 'Becomes stealthy, gains +6% evasion and reduces damage taken by 3% for 2 turns.',
      },
      cost: 2,
    },
    { level: 4, type: 'perk', id: 'DODGE_INCREASE' },
    {
      level: 5,
      type: 'skill',
      id: 'noctyra_skill_5',
      name: { pt: 'Dança das Sombras', en: 'Shadow Dance' },
      desc: {
        pt: 'Causa 3 de dano em área, fica furtiva e +10% esquiva por 2 turnos.',
        en: 'Deals 3 area damage, becomes stealthy and +10% evasion for 2 turns.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'CRIT_CHANCE' },
    { level: 7, type: 'perk', id: 'DEFENSE_REDUCTION' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'noctyra_skill_6',
      name: { pt: 'Véu Impenetrável', en: 'Impenetrable Veil' },
      desc: {
        pt: 'Fica invisível por 1 turno completo e próximo ataque causa +2 de dano.',
        en: 'Becomes invisible for 1 full turn and next attack deals +2 damage.',
      },
      cost: 3,
    },
    {
      level: 10,
      type: 'skill',
      id: 'noctyra_skill_7',
      name: { pt: 'Sussurro do Abismo', en: 'Abyss Whisper' },
      desc: {
        pt: 'Supremo: Causa 4 de dano, paralisa garantido 1 turno e reduz defesa em 10% por 2 turnos.',
        en: 'Ultimate: Deals 4 damage, guaranteed 1-turn paralysis and reduces defense by 10% for 2 turns.',
      },
      cost: 3,
    },
  ],
};
