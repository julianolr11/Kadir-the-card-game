// Card data for Leoracal
module.exports = {
  id: 'leoracal',
  title: { pt: 'Rastro do deserto', en: 'Trail of the Desert' },
  num: 4,
  height: 1.5,
  weakness: 'ar',
  name: { pt: 'Leoracal', en: 'Leoracal' },
  type: { pt: 'Fera', en: 'Beast' },
  element: 'terra',
  img: require('../../img/creatures/leoracal_bio.webp'),
  color: 'earth',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Rugido Sísmico', en: 'Seismic Roar' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano ao inimigo.',
        en: 'Deals 3 damage to the enemy.',
      },
    },
    {
      name: { pt: 'Pele Rochosa', en: 'Rocky Hide' },
      cost: 1,
      desc: {
        pt: 'Reduz dano recebido em 3%.',
        en: 'Reduces damage taken by 3%.',
      },
    },
  ],
  field: { pt: 'Solo Sagrado', en: 'Sacred Ground' },
  fielddesc: {
    pt: 'Aliados recebem 3% menos dano enquanto Leoracal estiver em campo.',
    en: 'Allies take 3% less damage while Leoracal is on the field.',
  },
  storyTitle: { pt: 'Rastro do deserto', en: 'Trail of the Desert' },
  story: [
    {
      pt: 'Leoracal é uma fera de força incomparável que habita desertos e planícies áridas. Seu corpo é musculoso, resistente ao calor extremo, e seus sentidos são apurados para localizar presas a grandes distâncias.',
      en: 'Leoracal is a beast of unmatched strength that inhabits deserts and arid plains. Its body is muscular, resistant to extreme heat, and its senses are keen enough to locate prey at great distances.',
    },
    {
      pt: 'Suas patas largas não afundam nas areias do deserto, permitindo que se mova com velocidade mesmo nos terrenos mais instáveis. Por conta disso, ao longo do tempo tornou-se indispensável para caçadas e locomoção através do deserto.',
      en: 'Its wide paws do not sink into desert sands, allowing it to move swiftly even on unstable ground. Because of this, over time it became indispensable for hunting and travel across the desert.',
    },
    {
      pt: 'Apesar de sua utilidade, Leoracal é extremamente territorial e difícil de domar, aceitando apenas mestres que consigam provar força, paciência e respeito.',
      en: 'Despite its usefulness, Leoracal is extremely territorial and difficult to tame, accepting only masters who can prove strength, patience, and respect.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'leoracal_skill_1',
      name: { pt: 'Rugido Flamejante', en: 'Flaming Roar' },
      desc: {
        pt: 'Causa 3 de dano com fogo ardente.',
        en: 'Deals 3 damage with blazing fire.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'leoracal_skill_2',
      name: { pt: 'Chama Queimadora', en: 'Burning Flame' },
      desc: {
        pt: 'Causa 2 de dano e queima o inimigo por 2 turnos.',
        en: 'Deals 2 damage and burns enemy for 2 turns.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'leoracal_blessing',
    name: { pt: 'Inferno Protetor', en: 'Protective Inferno' },
    desc: {
      pt: 'Criaturas de fogo ganham +3% de defesa enquanto Leoracal estiver em campo.',
      en: 'Fire creatures gain +3% defense while Leoracal is on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'leoracal_skill_3',
      name: { pt: 'Bola de Fogo', en: 'Fireball' },
      desc: {
        pt: 'Causa 3 de dano e queima por 1 turno.',
        en: 'Deals 3 damage and burns for 1 turn.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'leoracal_skill_4',
      name: { pt: 'Inferno Devastador', en: 'Devastating Inferno' },
      desc: {
        pt: 'Causa 3 de dano e queima o campo.',
        en: 'Deals 3 damage and burns the field.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'leoracal_skill_5',
      name: { pt: 'Fúria Leonina', en: 'Leonine Fury' },
      desc: {
        pt: 'Causa 4 de dano e aumenta ataque próprio.',
        en: 'Deals 4 damage and increases own attack.',
      },
      cost: 2,
    },
    { level: 6, type: 'none' },
    { level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'leoracal_skill_6',
      name: { pt: 'Chama Suprema', en: 'Supreme Flame' },
      desc: {
        pt: 'Causa 4 de dano e queima por 3 turnos.',
        en: 'Deals 4 damage and burns for 3 turns.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'leoracal_skill_7',
      name: { pt: 'Verdade do Leão', en: "Lion's Truth" },
      desc: {
        pt: 'Supremo: 4 de dano e queima todos os inimigos.',
        en: 'Ultimate: 4 damage and burns all enemies.',
      },
      cost: 3,
    },
  ],
};
