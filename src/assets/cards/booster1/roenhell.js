// Card data for Roenhell
module.exports = {
  id: 'roenhell',
  title: { pt: 'Rugido da Montanha', en: 'Mountain Roar' },
  num: 33,
  height: 2.2,
  weakness: 'agua',
  name: { pt: 'Roenhell', en: 'Roenhell' },
  type: { pt: 'Fera', en: 'Beast' },
  element: 'terra',
  img: require('../../img/creatures/roenhell_bio.webp'),
  color: 'earth',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Investida Rochosa', en: 'Rock Charge' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e aplica atordoamento leve por 1 turno.',
        en: 'Deals 3 damage and applies a light stun for 1 turn.',
      },
    },
    {
      name: { pt: 'Pele de Pedra', en: 'Stone Hide' },
      cost: 1,
      desc: {
        pt: 'Reduz dano recebido em 5% por 2 turnos.',
        en: 'Reduces damage taken by 5% for 2 turns.',
      },
    },
  ],
  field: { pt: 'Terras de Chifre', en: 'Hornlands' },
  fielddesc: {
    pt: 'Aliados de terra ganham +3% de defesa enquanto Roenhell estiver em campo.',
    en: 'Earth allies gain +3% defense while Roenhell is on the field.',
  },
  storyTitle: { pt: 'O Rugido do Solo', en: 'Roar of the Ground' },
  story: [
    {
      pt: 'Roenhell guarda planicies antigas, seus chifres abrindo trilhas na rocha viva.',
      en: 'Roenhell guards ancient plains, its horns carving paths through living rock.',
    },
    {
      pt: 'Quando ruge, a terra responde em ecos profundos, fortalecendo seus aliados.',
      en: 'When it roars, the ground answers in deep echoes, strengthening its allies.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardiao) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'roenhell_skill_investida_rochosa',
      name: { pt: 'Investida Rochosa', en: 'Rock Charge' },
      desc: {
        pt: 'Causa 3 de dano e aplica atordoamento por 1 turno.',
        en: 'Deals 3 damage and applies stun for 1 turn.',
      },
      cost: 1,
      type: 'damage_stun',
      damage: 3,
      statusEffect: 'stun',
      duration: 1,
    },
    {
      id: 'roenhell_skill_pele_de_pedra',
      name: { pt: 'Pele de Pedra', en: 'Stone Hide' },
      desc: {
        pt: 'Ganha +2 de armadura por 2 turnos.',
        en: 'Gains +2 armor for 2 turns.',
      },
      cost: 1,
      type: 'armor_buff',
      armor: 2,
      duration: 2,
    },
  ],
  defaultBlessing: {
    id: 'roenhell_blessing',
    name: { pt: 'Chifres Ancestrais', en: 'Ancient Horns' },
    desc: {
      pt: 'Ao ser invocado, pode atacar 2 vezes no mesmo turno sem consumir mana.',
      en: 'When summoned, it can attack twice in the same turn without consuming mana.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'HARDENED_HIDE',
      name: { pt: 'Couro Endurecido', en: 'Hardened Hide' },
      desc: {
        pt: 'Recebe -1 de dano de ataques fisicos.',
        en: 'Takes -1 damage from physical attacks.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'roenhell_skill_impacto_terrestre',
      name: { pt: 'Impacto Terrestre', en: 'Earth Impact' },
      desc: {
        pt: 'Causa 2 de dano a todos os inimigos e reduz ataque em 1 turno.',
        en: 'Deals 2 damage to all enemies and reduces attack for 1 turn.',
      },
      cost: 2,
      type: 'aoe_damage_debuff',
      damage: 2,
      statusEffect: 'weaken',
      duration: 1,
    },
    {
      level: 5,
      type: 'perk',
      id: 'GROUNDING_FORCE',
      name: { pt: 'Forca Telurica', en: 'Telluric Force' },
      desc: {
        pt: 'Ganha +1 de armadura ao fim do turno se estiver acima de 50% de HP.',
        en: 'Gains +1 armor at end of turn if above 50% HP.',
      },
    },
  ],
};
