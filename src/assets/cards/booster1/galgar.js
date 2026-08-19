// Card data for Galgar
module.exports = {
  id: 'galgar',
  title: { pt: 'Vagante do Vazio', en: 'Wanderer of the Void' },
  num: 37,
  height: 2.4,
  weakness: 'agua',
  name: { pt: 'Galgar', en: 'Galgar' },
  type: { pt: 'Sombria', en: 'Shadow' },
  element: 'fogo',
  img: require('../../img/creatures/galgar_bio.webp'),
  color: 'shadow',
  hp: 10,

  // Habilidades base (exibidas no card preview)
  abilities: [
    {
      name: { pt: 'Galope Espectral', en: 'Spectral Gallop' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano fogo e ganha evasão aumentada neste turno.',
        en: 'Deals 2 fire damage and gains increased evasion this turn.',
      },
    },
    {
      name: { pt: 'Chama do Vazio', en: 'Flame of the Void' },
      cost: 2,
      desc: {
        pt: 'Causa 3 de dano fogo e aplica queimadura por 2 turnos.',
        en: 'Deals 3 fire damage and applies burn for 2 turns.',
      },
    },
  ],

  // Campo de efeito
  field: { pt: 'Trilha das Sombras', en: 'Trail of Shadows' },
  fielddesc: {
    pt: 'Um caminho que só existe sob a lua cheia. Quem o segue nunca encontra o mesmo horizonte duas vezes.',
    en: 'A path that only exists under the full moon. Those who follow it never find the same horizon twice.',
  },

  // História
  storyTitle: { pt: 'O Corcel das Sombras', en: 'The Steed of Shadows' },
  story: [
    {
      pt: 'Ninguém sabe de onde Galgar veio, nem para onde vai. Aparece nas margens de lagos esquecidos, sempre sozinho, sempre em silêncio.',
      en: 'No one knows where Galgar came from, nor where it is going. It appears at the edges of forgotten lakes, always alone, always silent.',
    },
    {
      pt: 'Seus cascos ardem em chama roxa que não queima a grama sob eles — apenas marca o solo com trilhas que desaparecem ao amanhecer.',
      en: 'Its hooves burn with a purple flame that does not scorch the grass beneath them — it only marks the ground with trails that vanish by dawn.',
    },
    {
      pt: 'Viajantes que cruzam seu caminho relatam a mesma sensação: a de terem sido observados por algo que já vagava antes de o mundo ter nome.',
      en: 'Travelers who cross its path report the same feeling: of having been watched by something that already wandered before the world had a name.',
    },
    {
      pt: 'Galgar não caça, não persegue, não ataca sem motivo. Mas quem o encara nos olhos entende, por um instante, o vazio de onde ele veio.',
      en: 'Galgar does not hunt, does not chase, does not attack without reason. But those who meet its gaze understand, for an instant, the void it came from.',
    },
  ],

  // ===== DADOS ESTENDIDOS (Guardião) =====
  isGuardian: true,

  // Habilidades padrão do guardião (sempre disponíveis)
  defaultSkills: [
    {
      id: 'galgar_skill_1',
      name: { pt: 'Galope Espectral', en: 'Spectral Gallop' },
      desc: {
        pt: 'Causa 2 de dano fogo e ganha evasão aumentada neste turno.',
        en: 'Deals 2 fire damage and gains increased evasion this turn.',
      },
      cost: 1,
      type: 'damage_evasion',
    },
    {
      id: 'galgar_skill_2',
      name: { pt: 'Chama do Vazio', en: 'Flame of the Void' },
      desc: {
        pt: 'Causa 3 de dano fogo e aplica queimadura por 2 turnos.',
        en: 'Deals 3 fire damage and applies burn for 2 turns.',
      },
      cost: 2,
      type: 'damage_burn',
      statusEffect: 'burn',
      duration: 2,
    },
  ],

  // Bênção padrão
  defaultBlessing: {
    id: 'galgar_blessing',
    name: { pt: 'Bênção do Vagante', en: "Wanderer's Blessing" },
    desc: {
      pt: 'Galgar é imune a dano causado por criaturas sombrias ou de fogo.',
      en: 'Galgar is immune to damage from shadow or fire creatures.',
    },
  },

  // Tabela de desbloqueios por nível (0-10)
  unlockTable: [
    { level: 0, type: 'none' },
    {
      level: 2,
      type: 'perk',
      id: 'GHOST_STEP',
      name: { pt: 'Passo Fantasma', en: 'Ghost Step' },
      desc: {
        pt: '15% de chance de esquivar de ataques recebidos.',
        en: '15% chance to dodge incoming attacks.',
      },
    },
    {
      level: 3,
      type: 'skill',
      id: 'galgar_skill_corrida_das_trevas',
      name: { pt: 'Corrida das Trevas', en: 'Dark Sprint' },
      desc: {
        pt: 'Causa 3 de dano fogo e aplica queimadura por 2 turnos.',
        en: 'Deals 3 fire damage and applies burn for 2 turns.',
      },
      cost: 2,
      effectType: 'damage_burn',
      statusEffect: 'burn',
      duration: 2,
    },
    {
      level: 4,
      type: 'perk',
      id: 'VEIL_OF_THE_VOID',
      name: { pt: 'Véu do Vazio', en: 'Veil of the Void' },
      desc: {
        pt: 'Reduz permanentemente o dano elemental recebido em 1.',
        en: 'Permanently reduces elemental damage taken by 1.',
      },
    },
    {
      level: 5,
      type: 'skill',
      id: 'galgar_skill_incendio_espectral',
      name: { pt: 'Incêndio Espectral', en: 'Spectral Blaze' },
      desc: {
        pt: 'Causa 4 de dano em área e aplica queimadura por 2 turnos.',
        en: 'Deals 4 area damage and applies burn for 2 turns.',
      },
      cost: 2,
      effectType: 'aoe_burn',
      statusEffect: 'burn',
      duration: 2,
    },
    {
      level: 6,
      type: 'perk',
      id: 'HUNGER_OF_SHADOWS',
      name: { pt: 'Fome das Sombras', en: 'Hunger of Shadows' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 2 de vida.',
        en: 'When defeating an enemy, recover 2 HP.',
      },
    },
    {
      level: 7,
      type: 'skill',
      id: 'galgar_skill_cavalgada_sombria',
      name: { pt: 'Cavalgada Sombria', en: 'Shadow Charge' },
      desc: {
        pt: 'Causa 4 de dano a todos os inimigos e aplica queimadura por 2 turnos.',
        en: 'Deals 4 damage to all enemies and applies burn for 2 turns.',
      },
      cost: 3,
      effectType: 'aoe_burn',
      statusEffect: 'burn',
      duration: 2,
    },
    {
      level: 8,
      type: 'perk',
      id: 'UNSETTLING_PRESENCE',
      name: { pt: 'Presença Inquietante', en: 'Unsettling Presence' },
      desc: {
        pt: 'Enquanto Galgar estiver em campo, inimigos recebem -1 de defesa.',
        en: 'While Galgar is on the field, enemies suffer -1 defense.',
      },
    },
    {
      level: 9,
      type: 'skill',
      id: 'galgar_skill_uivo_do_vazio',
      name: { pt: 'Uivo do Vazio', en: 'Howl of the Void' },
      desc: {
        pt: 'Causa 4 de dano em área e reduz a defesa dos inimigos em 1 por 2 turnos.',
        en: 'Deals 4 area damage and lowers enemy defense by 1 for 2 turns.',
      },
      cost: 3,
      effectType: 'aoe_defense_down',
    },
    {
      level: 10,
      type: 'skill',
      id: 'galgar_skill_cavalgada_final',
      name: { pt: 'Cavalgada Final', en: 'Final Ride' },
      desc: {
        pt: 'Supremo: causa 5 de dano a todos os inimigos, aplica queimadura por 3 turnos, e ganha um escudo que absorve 3 de dano.',
        en: 'Ultimate: deals 5 damage to all enemies, applies burn for 3 turns, and gains a shield absorbing 3 damage.',
      },
      cost: 4,
      effectType: 'ultimate_aoe_shield',
      statusEffect: 'burn',
      duration: 3,
    },
  ],
};
