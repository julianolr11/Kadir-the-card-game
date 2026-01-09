// Card data for Nihil
module.exports = {
  id: 'nihil',
  title: { pt: 'Devoradora de Essência', en: 'Essence Devourer' },
  num: 30,
  height: 2.3,
  weakness: 'fogo',
  name: { pt: 'Nihil', en: 'Nihil' },
  type: { pt: 'Monstro', en: 'Monster' },
  element: 'puro',
  img: require('../../img/creatures/nihil_bio.webp'),
  color: 'pure',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Dreno Etéreo', en: 'Ethereal Drain' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano puro e rouba 1 de essência, curando 1 de HP.',
        en: 'Deals 3 pure damage and steals 1 essence, healing 1 HP.',
      },
    },
    {
      name: { pt: 'Rasgadura do Vácuo', en: 'Void Rend' },
      cost: 2,
      desc: {
        pt: 'Causa 2 de dano em área e aplica -8% resistência por 2 turnos.',
        en: 'Deals 2 area damage and applies -8% resistance for 2 turns.',
      },
    },
  ],
  field: { pt: 'Eco do Nada', en: 'Echo of Nothingness' },
  fielddesc: {
    pt: 'Ao entrar, inimigos perdem 1 essência e -5% precisão por 1 turno; aliados puros ganham +5% esquiva.',
    en: 'On entry, enemies lose 1 essence and -5% accuracy for 1 turn; pure allies gain +5% evasion.',
  },
  storyTitle: { pt: 'Vazio Faminto', en: 'Ravenous Void' },
  story: [
    {
      pt: 'Noctyra nasceu nas correntes silenciosas que atravessam o céu quando a luz se apaga.',
      en: 'Noctyra was born in the silent currents that cross the sky when light vanishes.',
    },
    {
      pt: 'Criatura sombria de asas finas, move-se entre vibrações do ar que os olhos não alcançam.',
      en: 'A shadowy, thin-winged creature moving between air vibrations beyond sight.',
    },
    {
      pt: 'Contornos azulados das asas são fendas de energia aérea marcando onde já passou… ou ainda observa.',
      en: 'Bluish wing outlines are rifts of aerial energy, marking where it has passed—or still watches.',
    },
    {
      pt: 'Durante o voo distorce o ar, confundindo sentidos e antecipando movimentos.',
      en: 'In flight it warps the air, confusing senses and anticipating movements.',
    },
    {
      pt: 'Não enfrenta de frente: cerca, enfraquece e some antes do contra-ataque.',
      en: 'It never clashes head-on: it surrounds, weakens, then vanishes before counterattack.',
    },
    {
      pt: 'Onde o vento hesita, ela já decidiu o desfecho. Corte de Corrente.',
      en: 'Where the wind falters, it already chose the outcome. Current Cut.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'nihil_skill_1',
      name: { pt: 'Mordida Vazia', en: 'Void Bite' },
      desc: {
        pt: 'Causa 3 de dano puro e rouba 1 de essência.',
        en: 'Deals 3 pure damage and steals 1 essence.',
      },
      cost: 1,
      type: 'damage',
    },
    {
      id: 'nihil_skill_2',
      name: { pt: 'Silêncio da Alma', en: 'Soul Silence' },
      desc: {
        pt: 'Causa 2 de dano em área e reduz precisão dos inimigos em 6% por 1 turno.',
        en: 'Deals 2 area damage and lowers enemy accuracy by 6% for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
  ],
  defaultBlessing: {
    id: 'nihil_blessing',
    name: { pt: 'Fome do Nada', en: 'Hunger of Nothingness' },
    desc: {
      pt: 'Rouba 1 essência do adversário por rodada; aliados puros ganham +4% resistência.',
      en: 'Steals 1 essence from the opponent each round; pure allies gain +4% resistance.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'nihil_skill_3',
      name: { pt: 'Espiral Devoradora', en: 'Devouring Spiral' },
      desc: {
        pt: 'Causa 3 de dano puro e aplica -8% resistência por 2 turnos.',
        en: 'Deals 3 pure damage and applies -8% resistance for 2 turns.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    {
      level: 3,
      type: 'skill',
      id: 'nihil_skill_4',
      name: { pt: 'Cicatriz Etérea', en: 'Ethereal Scar' },
      desc: {
        pt: 'Causa 3 de dano e deixa vulnerável: +8% dano recebido por 2 turnos.',
        en: 'Deals 3 damage and leaves target vulnerable: +8% damage taken for 2 turns.',
      },
      cost: 2,
    },
    { level: 4, type: 'perk', id: 'CRIT_CHANCE' },
    {
      level: 5,
      type: 'skill',
      id: 'nihil_skill_5',
      name: { pt: 'Vazio Sanguessuga', en: 'Leeching Void' },
      desc: {
        pt: 'Causa 2 de dano em área, drena 1 essência de cada inimigo e cura 2 de HP.',
        en: 'Deals 2 area damage, drains 1 essence from each enemy, and heals 2 HP.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'DODGE_INCREASE' },
    { level: 7, type: 'perk', id: 'DEFENSE_REDUCTION' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'nihil_skill_6',
      name: { pt: 'Fenda Absoluta', en: 'Absolute Rift' },
      desc: {
        pt: 'Causa 4 de dano puro e remove 1 efeito positivo do alvo.',
        en: 'Deals 4 pure damage and removes 1 positive effect from the target.',
      },
      cost: 3,
    },
    {
      level: 10,
      type: 'skill',
      id: 'nihil_skill_7',
      name: { pt: 'Abismo Faminto', en: 'Ravenous Abyss' },
      desc: {
        pt: 'Supremo: 5 de dano puro em todos, drena 1 essência de cada e concede escudo que nega 1 ataque.',
        en: 'Ultimate: 5 pure damage to all, drains 1 essence each, and grants a shield that negates 1 attack.',
      },
      cost: 3,
    },
  ],
};
