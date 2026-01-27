// Card data for Digitama
module.exports = {
  id: 'digitama',
  title: { pt: 'Fogo silencioso', en: 'Silent fire' },
  num: 10,
  height: 1.23,
  weakness: 'agua',
  name: { pt: 'Digitama', en: 'Digitama' },
  type: { pt: 'Mística', en: 'Mystic' },
  element: 'fogo',
  img: require('../../img/creatures/digitama_bio.webp'),
  color: 'fire',
  hp: 4,
  abilities: [
    {
      name: { pt: 'Chama Mística', en: 'Mystic Flame' },
      cost: 1,
      desc: {
        pt: 'Causa 2 de dano e tem 50% de chance de aplicar <span class="debuff-burn">queimadura</span> por 2 turnos.',
        en: 'Deals 2 damage and has a 50% chance to apply <span class="debuff-burn">burn</span> for 2 turns.',
      },
      damage: 2,
      chance: 0.5,
      statusEffect: 'burn',
      duration: 2,
    },
    {
      name: { pt: 'Fumaça Sonolenta', en: 'Sleepy Smoke' },
      cost: 2,
      desc: {
        pt: 'Causa 1 de dano e tem 50% de chance de aplicar <span class="debuff-sleep">dormir</span> por 2 turnos (não pode agir).',
        en: 'Deals 1 damage and has a 50% chance to apply <span class="debuff-sleep">sleep</span> for 2 turns (cannot act).',
      },
      type: 'damage_chance_sleep',
      damage: 1,
      chance: 0.5,
      statusEffect: 'sleep',
      duration: 2,
    },
  ],
  field: { pt: 'Aura Flamejante', en: 'Flaming Aura' },
  fielddesc: {
    pt: 'Aumenta dano de fogo em 4% e chance de queimadura em +8% enquanto Digitama estiver em campo.',
    en: 'Increases fire damage by 4% and burn chance by +8% while Digitama is on the field.',
  },
  storyTitle: { pt: 'Origem de Digitama', en: 'Origin of Digitama' },
  story: [
    {
      pt: 'Digitama nasceu quando um ritual de conjuração falhou e condensou fogo primordial em uma centelha consciente.',
      en: 'Digitama was born when a summoning ritual failed and condensed primordial fire into a sentient spark.',
    },
    {
      pt: 'Ele aprendeu a moldar brasas em runas vivas, deixando trilhas ardentes que sussurram segredos antigos.',
      en: 'It learned to shape embers into living runes, leaving burning trails that whisper ancient secrets.',
    },
    {
      pt: 'Onde Digitama passa, o ar vibra e os aliados sentem o ritmo das chamas guiando seus golpes.',
      en: 'Where Digitama passes, the air hums and allies feel the rhythm of the flames guiding their strikes.',
    }
  ],
  isGuardian: true,
  defaultSkills: [
    {
      id: 'digitama_skill_1',
      name: { pt: 'Brasas Rúnicas', en: 'Runic Embers' },
      desc: {
          pt: 'Causa 3 de dano, aplica queimadura e marca runa que adiciona +1 no próximo ataque.',
          en: 'Deals 3 damage, applies burn, and sets a rune adding +1 on next hit.',
        },
        cost: 1,
        type: 'damage_dot',
      },
      {
        id: 'digitama_skill_2',
        name: { pt: 'Véu Incandescente', en: 'Incandescent Veil' },
        desc: {
          pt: 'Ganha 12% de esquiva por 2 turnos e reflete 2 de dano de fogo.',
          en: 'Gain 12% evasion for 2 turns and reflect 2 fire damage.',
        },
        cost: 1,
        type: 'buff_reflect',
      },
    ],
  defaultBlessing: {
      id: 'digitama_blessing',
      name: { pt: 'Coroa Ardente', en: 'Burning Crown' },
      desc: {
        pt: 'Aliados de fogo ganham +6% crit e queimaduras causam +1 de dano por turno.',
        en: 'Fire allies gain +6% crit and burns deal +1 damage per turn.',
      },
    },
  unlockTable: [
      { level: 0, type: 'none' },
      {
        level: 1,
        type: 'skill',
        id: 'digitama_skill_3',
        name: { pt: 'Brasa Giratória', en: 'Spinning Ember' },
        desc: {
          pt: 'Causa 3 de dano, aplica queimadura e 20% de chance de cegar.',
          en: 'Deals 3 damage, applies burn, 20% chance to blind.',
        },
        cost: 1,
      },
      { level: 2, type: 'perk', id: 'BURN_CHANCE_PLUS_10' },
      {
        level: 3,
        type: 'skill',
        id: 'digitama_skill_4',
        name: { pt: 'Lança Incandescente', en: 'Incandescent Spear' },
        desc: {
          pt: 'Causa 4 de dano, ignora 15% da defesa e causa bleed de fogo.',
          en: 'Deals 4 damage, ignores 15% defense and inflicts fire bleed.',
        },
        cost: 2,
      },
      { level: 4, type: 'perk', id: 'CRIT_FIRE_PLUS_8' },
      {
        level: 5,
        type: 'skill',
        id: 'digitama_skill_5',
        name: { pt: 'Chamas Crescentes', en: 'Rising Flames' },
        desc: {
          pt: 'Causa 4 de dano, cada uso aumenta +1 e estende queimadura por 1 turno.',
          en: 'Deals 4 damage, each use +1 and extends burn by 1 turn.',
        },
        cost: 2,
      },
      {
        level: 6,
        type: 'skill',
        id: 'digitama_skill_6',
        name: { pt: 'Chama Final', en: 'Final Flame' },
        desc: {
          pt: 'Ultimate: 4 de dano, queimadura extrema e silencia por 1 turno.',
          en: 'Ultimate: 4 damage, extreme burn and silence 1 turn.',
        },
        cost: 3,
      },
    ]
  };

