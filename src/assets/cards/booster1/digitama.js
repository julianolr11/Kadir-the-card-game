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
      type: 'damage_chance_burn',
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
      type: 'damage_chance_sleep',
      desc: {
        pt: 'Causa 1 de dano e tem 50% de chance de aplicar <span class="debuff-sleep">dormir</span> por 2 turnos (não pode agir).',
        en: 'Deals 1 damage and has a 50% chance to apply <span class="debuff-sleep">sleep</span> for 2 turns (cannot act).',
      },
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
      id: 'digitama_skill_chama_mistica',
      name: { pt: 'Chama Mística', en: 'Mystic Flame' },
      desc: {
        pt: 'Causa 2 de dano e 50% de chance de aplicar <span class="debuff-burn">queimadura</span> por 2 turnos.',
        en: 'Deals 2 damage and 50% chance to apply <span class="debuff-burn">burn</span> for 2 turns.',
      },
      cost: 1,
      type: 'damage_chance_burn',
      damage: 2,
      chance: 0.5,
      statusEffect: 'burn',
      duration: 2,
    },
    {
      id: 'digitama_skill_fumaca_sonolenta',
      name: { pt: 'Fumaça Sonolenta', en: 'Sleepy Smoke' },
      desc: {
        pt: 'Causa 1 de dano e 50% de chance de aplicar <span class="debuff-sleep">dormir</span> por 2 turnos.',
        en: 'Deals 1 damage and 50% chance to apply <span class="debuff-sleep">sleep</span> for 2 turns.',
      },
      cost: 2,
      type: 'damage_chance_sleep',
      damage: 1,
      chance: 0.5,
      statusEffect: 'sleep',
      duration: 2,
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
    // Nível 2 - Perk: Espírito Ágil
    {
      level: 2,
      type: 'perk',
      id: 'AGILE_SPIRIT',
      name: { pt: 'Espírito Ágil', en: 'Agile Spirit' },
      desc: {
        pt: 'Ganha +1 de esquiva por 2 turnos ao entrar em campo.',
        en: 'Gain +1 evasion for 2 turns when summoned.',
      },
    },
    // Nível 3 - Habilidade: Véu Incandescente
    {
      level: 3,
      type: 'skill',
      id: 'digitama_skill_veu_incandescente',
      name: { pt: 'Véu Incandescente', en: 'Incandescent Veil' },
      desc: {
        pt: 'Ganha evasão por 2 turnos e reflete 1 de dano de fogo.',
        en: 'Gain evasion for 2 turns and reflect 1 fire damage.',
      },
      cost: 1,
      type: 'buff_reflect',
    },
    // Nível 4 - Perk: Chama Persistente
    {
      level: 4,
      type: 'perk',
      id: 'PERSISTENT_FLAME',
      name: { pt: 'Chama Persistente', en: 'Persistent Flame' },
      desc: {
        pt: 'Queimadura causada por Digitama dura +1 turno.',
        en: 'Burn caused by Digitama lasts +1 turn.',
      },
    },
    // Nível 5 - Habilidade: Brasa Giratória
    {
      level: 5,
      type: 'skill',
      id: 'digitama_skill_brasa_giratoria',
      name: { pt: 'Brasa Giratória', en: 'Spinning Ember' },
      desc: {
        pt: 'Causa 2 de dano, aplica queimadura e 50% de chance de cegar por 1 turno.',
        en: 'Deals 2 damage, applies burn and 50% chance to blind for 1 turn.',
      },
      cost: 1,
      type: 'damage_burn_blind',
    },
    // Nível 6 - Perk: Fôlego Místico
    {
      level: 6,
      type: 'perk',
      id: 'MYSTIC_BREATH',
      name: { pt: 'Fôlego Místico', en: 'Mystic Breath' },
      desc: {
        pt: 'Ao derrotar um inimigo, recupera 1 de vida.',
        en: 'When defeating an enemy, recover 1 HP.',
      },
    },
    // Nível 7 - Habilidade: Lança Incandescente
    {
      level: 7,
      type: 'skill',
      id: 'digitama_skill_lanca_incandescente',
      name: { pt: 'Lança Incandescente', en: 'Incandescent Spear' },
      desc: {
        pt: 'Causa 3 de dano, ignora escudo e aplica sangramento de fogo por 2 turnos.',
        en: 'Deals 3 damage, ignores shield and applies fire bleed for 2 turns.',
      },
      cost: 2,
      type: 'damage_bleed_shieldpierce',
    },
    // Nível 8 - Perk: Fogo Protetor
    {
      level: 8,
      type: 'perk',
      id: 'PROTECTIVE_FIRE',
      name: { pt: 'Fogo Protetor', en: 'Protective Fire' },
      desc: {
        pt: 'No início do turno, ganha 1 de escudo se estiver com queimadura ativa.',
        en: 'At the start of the turn, gain 1 shield if burn is active.',
      },
    },
    // Nível 9 - Habilidade: Chamas Crescentes
    {
      level: 9,
      type: 'skill',
      id: 'digitama_skill_chamas_crescentes',
      name: { pt: 'Chamas Crescentes', en: 'Rising Flames' },
      desc: {
        pt: 'Causa 3 de dano. Se o alvo estiver queimando, causa +1 de dano.',
        en: 'Deals 3 damage. If the target is burning, deal +1 damage.',
      },
      cost: 2,
      type: 'damage_burn_bonus',
    },
    // Nível 10 - Habilidade: Chama Final
    {
      level: 10,
      type: 'skill',
      id: 'digitama_skill_chama_final',
      name: { pt: 'Chama Final', en: 'Final Flame' },
      desc: {
        pt: 'Causa 4 de dano, aplica queimadura extrema (2 de dano por turno) e silencia por 1 turno.',
        en: 'Deals 4 damage, applies extreme burn (2 damage/turn) and silences for 1 turn.',
      },
      cost: 3,
      type: 'damage_extreme_burn_silence',
    },
  ],
  };

