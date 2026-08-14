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
        pt: 'reduz o dano recebido em 1.',
        en: 'reduces damage taken by 1.',
      },
    },
  ],
  field: { pt: 'Solo Sagrado', en: 'Sacred Ground' },
  fielddesc: {
    pt: 'Aliados recebem -1 de dano enquanto Leoracal estiver em campo.',
    en: 'Allies take -1 damage while Leoracal is on the field.',
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
      name: { pt: 'Rugido Sísmico', en: 'Seismic Roar' },
      desc: {
        pt: 'Causa 3 de dano com uma onda sísmica.',
        en: 'Deals 3 damage with a seismic wave.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'leoracal_skill_2',
      name: { pt: 'Garra de Arenito', en: 'Sandstone Claw' },
      desc: {
        pt: 'Causa 2 de dano e aplica sangramento por 2 turnos.',
        en: 'Deals 2 damage and applies bleed for 2 turns.',
      },
      cost: 1,
      damage: 2,
      statusEffect: 'bleed',
      duration: 2,
      type: 'damage_bleed',
    },
  ],
  defaultBlessing: {
    id: 'leoracal_blessing_vision',
    name: { pt: 'Visão além do alcance', en: 'Vision Beyond Reach' },
    desc: {
      pt: 'Ao ser invocado, revela uma carta aleatória da mão do oponente.',
      en: 'When summoned, reveals a random card from the opponent\'s hand.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'leoracal_skill_3',
      name: { pt: 'Presas de Arenito', en: 'Sandstone Fangs' },
      desc: {
        pt: 'Causa 3 de dano e aplica sangramento por 1 turno.',
        en: 'Deals 3 damage and applies bleed for 1 turn.',
      },
      cost: 1,
      damage: 3,
      statusEffect: 'bleed',
      duration: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'leoracal_skill_4',
      name: { pt: 'Tempestade de Areia', en: 'Sandstorm' },
      desc: {
        pt: 'Causa 3 de dano e reduz a precisão do alvo por 2 turnos.',
        en: 'Deals 3 damage and reduces target accuracy for 2 turns.',
      },
      cost: 2,
      damage: 3,
      statusEffect: 'accuracy_down',
      duration: 2,
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
      name: { pt: 'Ruptura Sísmica', en: 'Seismic Rupture' },
      desc: {
        pt: 'Causa 4 de dano e paralisa o alvo por 1 turno.',
        en: 'Deals 4 damage and paralyzes the target for 1 turn.',
      },
      cost: 2,
      damage: 4,
      statusEffect: 'paralyze',
      duration: 1,
    },
    {
      level: 10,
      type: 'skill',
      id: 'leoracal_skill_7',
      name: { pt: 'Domínio das Dunas', en: 'Dominion of the Dunes' },
      desc: {
        pt: 'Supremo: causa 4 de dano a todos os inimigos e aplica lentidão por 2 turnos.',
        en: 'Ultimate: deals 4 damage to all enemies and applies slow for 2 turns.',
      },
      cost: 3,
      damage: 4,
      statusEffect: 'slow',
      duration: 2,
    },
  ],
};
