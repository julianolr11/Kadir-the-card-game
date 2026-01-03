// Card data for Pawferion
module.exports = {
  id: 21,
  title: { pt: 'O elemental corrompido', en: 'The Corrupted Elemental' },
  num: 21,
  height: 3.8,
  weakness: 'fogo',
  name: { pt: 'Pawferion', en: 'Pawferion' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'pura',
  img: require('../../img/creatures/pawferion_bio.webp'),
  color: 'pure',
  hp: 10,
  abilities: [
    {
      name: { pt: 'Corrupção Elemental', en: 'Elemental Corruption' },
      cost: 1,
      desc: {
        pt: 'Rouba 2 pontos de ataque de todos os inimigos por 2 turnos.',
        en: 'Steals 2 attack points from all enemies for 2 turns.'
      }
    },
    {
      name: { pt: 'Sombra Essencial', en: 'Essential Shadow' },
      cost: 1,
      desc: {
        pt: 'Recebe metade do dano de ataques elementais por 1 turno.',
        en: 'Takes half damage from elemental attacks for 1 turn.'
      }
    }
  ],
  field: { pt: 'Vazio Corrompido', en: 'Corrupted Void' },
  fielddesc: {
    pt: 'Reduz o ataque de todas as criaturas não puras em 10% enquanto Pawferion estiver em campo.',
    en: 'Reduces the attack of all non-pure creatures by 10% while Pawferion is on the field.'
  },
  storyTitle: { pt: 'Origem de Pawferion', en: 'Origin of Pawferion' },
  story: [
    {
      pt: 'Ele, sendo essência de todos os elementos, foi corrompido pelo poder.',
      en: 'Being the essence of all elements, he was corrupted by power.'
    }
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'pawferion_skill_1',
      name: { pt: 'Garra Rápida', en: 'Quick Claw' },
      desc: { pt: 'Causa 21 de dano com ataques precisos.', en: 'Deals 21 damage with precise attacks.' },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'pawferion_skill_2',
      name: { pt: 'Salto Ágil', en: 'Agile Leap' },
      desc: { pt: 'Causa 15 de dano e aumenta velocidade.', en: 'Deals 15 damage and increases speed.' },
      cost: 1,
      type: 'damage_buff',
    },
  ],
  defaultBlessing: {
    id: 'pawferion_blessing',
    name: { pt: 'Agilidade Felina', en: 'Feline Agility' },
    desc: { pt: 'Criaturas rápidas ganham +9% de velocidade enquanto Pawferion estiver em campo.', en: 'Fast creatures gain +9% speed while Pawferion is on the field.' },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    { level: 1, type: 'skill', id: 'pawferion_skill_3', name: { pt: 'Ataque Múltiplo', en: 'Multi-Strike' }, desc: { pt: 'Causa 18 de dano em múltiplos golpes rápidos.', en: 'Deals 18 damage in multiple quick strikes.' }, cost: 1 },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    { level: 4, type: 'skill', id: 'pawferion_skill_4', name: { pt: 'Dança Feroz', en: 'Fierce Dance' }, desc: { pt: 'Causa 25 de dano e aumenta esquiva.', en: 'Deals 25 damage and increases dodge.' }, cost: 2 },
    { level: 5, type: 'skill', id: 'pawferion_skill_5', name: { pt: 'Fúria do Felino', en: 'Feline Fury' }, desc: { pt: 'Causa 30 de dano e aumenta ataque e velocidade.', en: 'Deals 30 damage and increases attack and speed.' }, cost: 2 },
    { level: 6, type: 'none' },
    { level: 7, type: 'perk', id: 'FIRST_ROUND_SHIELD' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    { level: 9, type: 'skill', id: 'pawferion_skill_6', name: { pt: 'Tornado de Garras', en: 'Claw Tornado' }, desc: { pt: 'Causa 33 de dano em ataque giratório.', en: 'Deals 33 damage in spinning attack.' }, cost: 2 },
    { level: 10, type: 'skill', id: 'pawferion_skill_7', name: { pt: 'Fúria Absoluta', en: 'Absolute Fury' }, desc: { pt: 'Supremo: 44 de dano e aumenta todos os atributos aliados por 2 turnos.', en: 'Ultimate: 44 damage and increases all ally attributes for 2 turns.' }, cost: 3 },
  ],
};
