// Card data for Elythra
module.exports = {
  id: 'elythra',
  title: { pt: 'Tridente das Correntes Brancas', en: 'Trident of White Currents' },
  num: 24,
  height: 4.6,
  weakness: 'terra',
  name: { pt: 'Elythra', en: 'Elythra' },
  type: { pt: 'Reptiloide', en: 'Reptiloid' },
  element: 'ar',
  img: require('../../img/creatures/elythra_bio.webp'),
  color: 'air',
  hp: 6,
  abilities: [
    {
      name: { pt: 'Cauda Tridente', en: 'Trident Tail' },
      cost: 1,
      desc: {
        pt: 'Causa 3 de dano e marca o alvo para receber +1 de dano de ar no próximo golpe.',
        en: 'Deals 3 damage and marks the target to take +1 air damage on the next hit.',
      },
    },
    {
      name: { pt: 'Asas de Cimeira', en: 'Crest Wings' },
      cost: 1,
      desc: {
        pt: 'Ganha +10% esquiva por 2 turnos e remove 1 efeito negativo.',
        en: 'Grants +10% evasion for 2 turns and cleanses 1 negative effect.',
      },
    },
  ],
  field: { pt: 'Trono dos Altos Ventos', en: 'Highwinds Throne' },
  fielddesc: {
    pt: 'Aliados de ar ganham +6% de velocidade e +5% de chance de crítico enquanto Elythra estiver em campo.',
    en: 'Air allies gain +6% speed and +5% crit chance while Elythra is on the field.',
  },
  storyTitle: { pt: 'Lenda de Elythra', en: 'Legend of Elythra' },
  story: [
    {
      pt: 'Elythra desliza entre as correntes mais altas, guiada por asas que brotam de sua cabeça.',
      en: 'Elythra glides through the highest drafts, guided by wings that crown its head.',
    },
    {
      pt: 'Sua pele branca reflete a luz das nuvens, tornando-a um presságio prateado para quem olha do solo.',
      en: 'Its white skin mirrors cloudlight, becoming a silver omen for those watching from the ground.',
    },
    {
      pt: 'O rabo de tridente canaliza rajadas que partem rochas e silenciam qualquer ameaça às alturas.',
      en: 'The trident tail channels gusts that split stone and silence any threat to the heights.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,
  defaultSkills: [
    {
      id: 'elythra_skill_1',
      name: { pt: 'Lâmina Aérea', en: 'Aerial Blade' },
      desc: {
        pt: 'Causa 3 de dano e reduz o ataque do alvo em 3% por 1 turno.',
        en: 'Deals 3 damage and reduces target attack by 3% for 1 turn.',
      },
      cost: 1,
      type: 'damage_debuff',
    },
    {
      id: 'elythra_skill_2',
      name: { pt: 'Chicote Tridente', en: 'Trident Whip' },
      desc: {
        pt: 'Causa 2 de dano duas vezes, ignorando 1 ponto de defesa.',
        en: 'Deals 2 damage twice, ignoring 1 defense point.',
      },
      cost: 1,
      type: 'damage',
    },
  ],
  defaultBlessing: {
    id: 'elythra_blessing',
    name: { pt: 'Juramento dos Ventos Gêmeos', en: 'Twin Winds Oath' },
    desc: {
      pt: 'Aliados de ar ganham +4% velocidade e +10% esquiva no primeiro turno em campo.',
      en: 'Air allies gain +4% speed and +10% dodge on their first turn on the field.',
    },
  },
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 1,
      type: 'skill',
      id: 'elythra_skill_3',
      name: { pt: 'Rastro Serrilhado', en: 'Serrated Wake' },
      desc: {
        pt: 'Causa 3 de dano e aplica sangramento de 1 por 2 turnos.',
        en: 'Deals 3 damage and applies 1 bleed for 2 turns.',
      },
      cost: 1,
    },
    { level: 2, type: 'perk', id: 'HP_PLUS_1' },
    { level: 3, type: 'none' },
    {
      level: 4,
      type: 'skill',
      id: 'elythra_skill_4',
      name: { pt: 'Sopro Ascendente', en: 'Ascending Gust' },
      desc: {
        pt: 'Causa 3 de dano e empurra o alvo, reduzindo sua próxima ação.',
        en: 'Deals 3 damage and pushes the target, reducing its next action.',
      },
      cost: 2,
    },
    {
      level: 5,
      type: 'skill',
      id: 'elythra_skill_5',
      name: { pt: 'Véu das Nuvens', en: 'Cloud Veil' },
      desc: {
        pt: 'Garante 15% de redução de dano por 2 turnos e devolve 1 de dano a quem atingir Elythra.',
        en: 'Grants 15% damage reduction for 2 turns and reflects 1 damage to attackers.',
      },
      cost: 2,
    },
    { level: 6, type: 'perk', id: 'DODGE_INCREASE' },
    { level: 7, type: 'perk', id: 'CRIT_CHANCE' },
    { level: 8, type: 'perk', id: 'HP_PLUS_2' },
    {
      level: 9,
      type: 'skill',
      id: 'elythra_skill_6',
      name: { pt: 'Rajada Espectral', en: 'Spectral Burst' },
      desc: {
        pt: 'Causa 4 de dano, ignora 10% da defesa e tem 20% de chance de atordoar.',
        en: 'Deals 4 damage, ignores 10% defense, and has a 20% chance to stun.',
      },
      cost: 2,
    },
    {
      level: 10,
      type: 'skill',
      id: 'elythra_skill_7',
      name: { pt: 'Supremo: Vórtice Triplo', en: 'Ultimate: Triple Vortex' },
      desc: {
        pt: 'Supremo: 4 de dano, aplica sangramento 2 por 2 turnos e concede +15% velocidade aos aliados de ar por 2 turnos.',
        en: 'Ultimate: 4 damage, applies bleed 2 for 2 turns, and grants +15% speed to air allies for 2 turns.',
      },
      cost: 3,
    },
  ],
};
