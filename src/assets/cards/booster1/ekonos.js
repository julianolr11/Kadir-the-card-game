// Card data for Ekonos
module.exports = {
  id: 'ekonos',
  title: { pt: 'O Vigia do Infinito', en: 'Watcher of Infinity' },
  num: 28,
  height: 2.7,
  weakness: 'puro',
  name: { pt: 'Ekonos', en: 'Ekonos' },
  type: { pt: 'Ave', en: 'Bird' },
  element: 'puro',
  img: require('../../img/creatures/Ekonos_bio.webp'),
  color: 'pure',
  hp: 5,
  abilities: [
    {
      name: { pt: 'Olho Imutável', en: 'Immutable Eye' },
      cost: 1,
      desc: {
        pt: 'Revela inimigos furtivos e causa 3 de dano puro.',
        en: 'Reveals stealth enemies and deals 3 pure damage.',
      },
    },
    {
      name: { pt: 'Asa Prismática', en: 'Prismatic Wing' },
      cost: 1,
      desc: {
        pt: 'Ganha um escudo que nega o próximo ataque recebido por 1 rodada.',
        en: 'Gains a shield that negates the next attack taken for 1 round.',
      },
    },
  ],
  field: { pt: 'Horizonte Eterno', en: 'Eternal Horizon' },
  fielddesc: {
    pt: 'Aliados puros ganham +4% resistência e +5% chance de crítico; furtividade inimiga é enfraquecida.',
    en: 'Pure allies gain +4% resistance and +5% crit chance; enemy stealth is weakened.',
  },
  storyTitle: { pt: 'Círculo que Nunca Fecha', en: 'Circle That Never Ends' },
  story: [
    {
      pt: 'Ekonos patrulha o limiar entre o céu e o vazio, onde o tempo não faz sombra.',
      en: 'Ekonos patrols the threshold between sky and void, where time casts no shadow.',
    },
    {
      pt: 'Suas penas refletem constelações esquecidas, guiando viajantes perdidos.',
      en: 'Its feathers mirror forgotten constellations, guiding lost wanderers.',
    },
    {
      pt: 'Dizem que ele já contou cada nascer do sol e nunca piscou diante do infinito.',
      en: 'They say it has counted every sunrise and never blinked before infinity.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'ekonos_skill_1',
      name: { pt: 'Raio Contínuo', en: 'Continuous Ray' },
      desc: {
        pt: 'Causa 3 de dano puro e reduz precisão do alvo em 4% por 1 turno.',
        en: 'Deals 3 pure damage and lowers target accuracy by 4% for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'ekonos_skill_2',
      name: { pt: 'Vigília Perpétua', en: 'Perpetual Vigil' },
      desc: {
        pt: 'Ganha um escudo que nega ataques, revela furtivos e dá +8% esquiva por 1 rodada.',
        en: 'Gains a shield that negates attacks, reveals stealth, and grants +8% dodge for 1 round.',
      },
      cost: 1,
      type: 'buff',
    },
  ],
  defaultBlessing: {
    id: 'ekonos_blessing',
    name: { pt: 'Olhar Sem Fim', en: 'Endless Gaze' },
    desc: {
      pt: 'Aliados puros ganham +4% crítico e detectam furtivos no primeiro turno em campo.',
      en: 'Pure allies gain +4% crit and detect stealth on their first turn on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'ekonos_skill_3',
      name: { pt: 'Orbe Suspenso', en: 'Suspended Orb' },
      desc: {
        pt: 'Causa 3 de dano puro e reduz defesa em 3% por 2 turnos.',
        en: 'Deals 3 pure damage and lowers defense by 3% for 2 turns.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'ekonos_skill_4',
      name: { pt: 'Fratura Luminosa', en: 'Luminous Fracture' },
      desc: {
        pt: 'Causa 3 de dano em área e remove 1 efeito positivo de cada alvo.',
        en: 'Deals 3 area damage and removes 1 positive effect from each target.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'ekonos_skill_5',
      name: { pt: 'Círculo Vigia', en: 'Watcher Circle' },
      desc: {
        pt: 'Garante um escudo que nega todos os ataques por 2 rodadas e +10% resistência.',
        en: 'Grants a shield that negates all attacks for 2 rounds and +10% resistance.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'CRIT_CHANCE' },
    { level: 7, type: 'perk', id: 'DODGE_INCREASE' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'ekonos_skill_6',
      name: { pt: 'Silêncio Estelar', en: 'Stellar Silence' },
      desc: {
        pt: 'Causa 4 de dano puro e silencia o alvo por 1 turno.',
        en: 'Deals 4 pure damage and silences the target for 1 turn.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'ekonos_skill_7',
      name: { pt: 'Supremo: Horizonte Imóvel', en: 'Ultimate: Motionless Horizon' },
      desc: {
        pt: 'Supremo: 4 de dano em todos, revela furtivos e concede +12% crítico a aliados puros por 2 turnos.',
        en: 'Ultimate: 4 damage to all, reveals stealth, and grants pure allies +12% crit for 2 turns.',
      },
      cost: 3,
    },
  ],
};
