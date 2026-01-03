// Card data for Whalar
module.exports = {
  id: 23,
  title: { pt: 'O Predador Noturno das Marés', en: 'The Nocturnal Tide Predator' },
  num: 23,
  height: 4.5,
  weakness: 'ar',
  name: { pt: 'Whalar', en: 'Whalar' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'água',
  img: require('../../img/creatures/whalar_bio.webp'),
  color: 'shadow',
  hp: 12,
  abilities: [
    {
      name: { pt: 'Caçada Silenciosa', en: 'Silent Hunt' },
      cost: 1,
      desc: {
        pt: 'Ataca primeiro se estiver à noite ou em campo sombrio.',
        en: 'Attacks first if it is night or on a shadow field.'
      }
    },
    {
      name: { pt: 'Mordida Abissal', en: 'Abyssal Bite' },
      cost: 1,
      desc: {
        pt: 'Ignora 2 pontos de defesa do alvo ao atacar.',
        en: 'Ignores 2 defense points of the target when attacking.'
      }
    }
  ],
  field: { pt: 'Maré Sombria', en: 'Shadow Tide' },
  fielddesc: {
    pt: 'Enquanto Whalar estiver em campo, criaturas sombrias de água recebem +1 ataque.',
    en: 'While Whalar is on the field, shadow water creatures gain +1 attack.'
  },
  storyTitle: { pt: 'Lenda do Caçador das Ondas', en: 'Legend of the Wave Hunter' },
  story: [
    {
      pt: 'Whalar patrulha as marés escuras, caçando silenciosamente sob o véu da noite.',
      en: 'Whalar patrols the dark tides, hunting silently under the cover of night.'
    }
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'whalar_skill_1',
      name: { pt: 'Onda Gelada', en: 'Frozen Wave' },
      desc: { pt: 'Causa 22 de dano ao inimigo com água congelada.', en: 'Deals 22 damage to the enemy with frozen water.' },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'whalar_skill_2',
      name: { pt: 'Prisão de Gelo', en: 'Ice Prison' },
      desc: { pt: 'Causa 14 de dano e congela o inimigo por 1 turno.', en: 'Deals 14 damage and freezes the enemy for 1 turn.' },
      cost: 1,
      type: 'damage_stun',
    },
  ],
  defaultBlessing: {
    id: 'whalar_blessing',
    name: { pt: 'Friagem Abissal', en: 'Abyssal Cold' },
    desc: { pt: 'Criaturas de água ganham +8% de velocidade enquanto Whalar estiver em campo.', en: 'Water creatures gain +8% speed while Whalar is on the field.' },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    { level: 1, type: 'skill', id: 'whalar_skill_3', name: { pt: 'Espículo de Gelo', en: 'Ice Spike' }, desc: { pt: 'Causa 18 de dano com espículos congelados.', en: 'Deals 18 damage with frozen spikes.' }, cost: 1 },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    { level: 4, type: 'skill', id: 'whalar_skill_4', name: { pt: 'Blizzard', en: 'Blizzard' }, desc: { pt: 'Causa 26 de dano e reduz velocidade inimiga por 2 turnos.', en: 'Deals 26 damage and reduces enemy speed for 2 turns.' }, cost: 2 },
    { level: 5, type: 'skill', id: 'whalar_skill_5', name: { pt: 'Fúria do Abismo', en: 'Abyss Fury' }, desc: { pt: 'Causa 33 de dano com a força das profundezas.', en: 'Deals 33 damage with the force of the depths.' }, cost: 2 },
    { level: 6, type: 'none' },
    { level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    { level: 9, type: 'skill', id: 'whalar_skill_6', name: { pt: 'Âncora Gelada', en: 'Frozen Anchor' }, desc: { pt: 'Causa 29 de dano e prende o inimigo por 2 turnos.', en: 'Deals 29 damage and binds the enemy for 2 turns.' }, cost: 2 },
    { level: 10, type: 'skill', id: 'whalar_skill_7', name: { pt: 'Cataclisma Aquático', en: 'Aquatic Cataclysm' }, desc: { pt: 'Supremo: 43 de dano e congela inimigos por 2 turnos.', en: 'Ultimate: 43 damage and freezes enemies for 2 turns.' }, cost: 3 },
  ],
};
