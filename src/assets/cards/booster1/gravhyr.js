// Card data for Gravhyr
module.exports = {
  id: 'gravhyr',
  title: { pt: 'Sentinela do Silêncio', en: 'Sentinel of Silence' },
  num: 31,
  height: 2.8,
  weakness: 'agua',
  name: { pt: 'Gravhyr', en: 'Gravhyr' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'terra',
  img: require('../../img/creatures/gravhyr_bio.webp'),
  color: 'earth',
  hp: 7,
  abilities: [
    {
      name: { pt: 'Golpe Petrificado', en: 'Petrified Strike' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano. Se não atacou no turno anterior, causa +1 de dano.',
        en: 'Deals 2 damage. If it did not attack last turn, deals +1 extra damage.',
      },
    },
    {
      name: { pt: 'Imobilidade Vigilante', en: 'Vigilant Stillness' },
      cost: 1,
      desc: {
        pt: 'Se ficar um turno sem atacar, recebe +20% defesa e fica imune a empurrões/deslocamentos até o próximo turno.',
        en: 'If it skips attacking for a turn, gains +20% defense and becomes immune to pushes/displacement until next turn.',
      },
    },
  ],
  field: { pt: 'Claustro Silencioso', en: 'Silent Cloister' },
  fielddesc: {
    pt: 'Ao entrar em combate após ficar imóvel, o primeiro inimigo atingido sofre Lentidão por 2 turnos.',
    en: 'When entering combat after staying still, the first enemy hit suffers Slow for 2 turns.',
  },
  storyTitle: { pt: 'Sentinela das Eras', en: 'Sentinel of Ages' },
  story: [
    {
      pt: 'Gravhyr não nasceu viva — despertou.',
      en: 'Gravhyr was not born alive — it awoke.',
    },
    {
      pt: 'Esculpida nas eras antigas como vigia de templos esquecidos, permaneceu imóvel por séculos, observando a passagem do mundo sem interferir.',
      en: 'Carved in ancient eras as a temple warden, it remained still for centuries, watching the world pass without interference.',
    },
    {
      pt: 'Seu corpo de rocha absorve luz e som, tornando-se indistinguível da arquitetura ao redor. Gravhyr espera.',
      en: 'Its rocky body absorbs light and sound, blending with surrounding stone. Gravhyr waits.',
    },
    {
      pt: 'Quando o inimigo acredita estar seguro, o peso da pedra cai sem aviso. O ataque nunca é visto, apenas sentido.',
      en: 'When the foe believes itself safe, the weight of stone falls without warning. The strike is never seen, only felt.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'gravhyr_skill_1',
      name: { pt: 'Golpe Petrificado', en: 'Petrified Strike' },
      desc: {
        pt: 'Causa 3 de dano; se não atacou no turno anterior, causa +1 de dano.',
        en: 'Deals 3 damage; if it did not attack last turn, deals +1 extra damage.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'gravhyr_skill_2',
      name: { pt: 'Despertar da Estátua', en: 'Statue Awakening' },
      desc: {
        pt: 'Ao agir após ficar imóvel, causa 2 de dano e aplica Lentidão por 2 turnos.',
        en: 'When acting after staying still, deals 2 damage and applies Slow for 2 turns.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'gravhyr_blessing',
    name: { pt: 'Vigia Imóvel', en: 'Motionless Warden' },
    desc: {
      pt: 'Se não atacar em um turno, ganha +20% defesa e imunidade a deslocamentos até o próximo turno; aliados de terra recebem +4% resistência.',
      en: 'If it skips attacking for a turn, gains +20% defense and immunity to displacement until next turn; earth allies gain +4% resistance.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'gravhyr_skill_3',
      name: { pt: 'Queda Súbita', en: 'Sudden Drop' },
      desc: {
        pt: 'Causa 3 de dano em área pequena; se estava imóvel, aplica Lentidão 1 turno.',
        en: 'Deals 3 small-area damage; if it was still, applies Slow for 1 turn.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    {
      level: 3,
      type: 'skill',
      id: 'gravhyr_skill_4',
      name: { pt: 'Muralha Silente', en: 'Silent Bulwark' },
      desc: {
        pt: 'Ganha +12% defesa e imune a empurrões por 2 turnos.',
        en: 'Gains +12% defense and immunity to pushes for 2 turns.',
      },
      cost: 2,
    },
    { level: 4, type: 'perk', id: 'CRIT_CHANCE' },
    {
      level: 5,
      type: 'skill',
      id: 'gravhyr_skill_5',
      name: { pt: 'Golpe de Pedra Viva', en: 'Living Stone Blow' },
      desc: {
        pt: 'Causa 4 de dano; se não atacou no turno anterior, +1 de dano e Lentidão 1 turno.',
        en: 'Deals 4 damage; if it did not attack last turn, +1 damage and Slow for 1 turn.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'DODGE_INCREASE' },
    { level: 7, type: 'perk', id: 'DEFENSE_REDUCTION' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'gravhyr_skill_6',
      name: { pt: 'Eco de Pedra', en: 'Stone Echo' },
      desc: {
        pt: 'Causa 3 de dano em área e reduz ataque dos inimigos em 8% por 2 turnos.',
        en: 'Deals 3 area damage and reduces enemies attack by 8% for 2 turns.',
      },
      cost: 3,
    },
    {
      level: 10,
      type: 'skill',
      id: 'gravhyr_skill_7',
      name: { pt: 'Colapso do Santuário', en: 'Sanctum Collapse' },
      desc: {
        pt: 'Supremo: 5 de dano em linha, aplica Lentidão por 2 turnos e torna-se imune a deslocamentos no próximo turno.',
        en: 'Ultimate: 5 line damage, applies Slow for 2 turns, and becomes immune to displacement next turn.',
      },
      cost: 3,
    },
  ],
};
