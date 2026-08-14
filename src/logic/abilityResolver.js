const normalize = (value = '') => String(value)
  .replace(/<[^>]+>/g, ' ')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const numberAfter = (text, pattern) => {
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
};

// Tenta cada padrão em ordem e retorna o primeiro número encontrado.
// Usado para textos onde a quantidade pode vir antes OU depois da palavra-chave
// (ex: "Concede 1 de escudo" vs "escudo que absorve até 3 de dano").
const numberNear = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
};

export const resolveAbility = (ability = {}) => {
  const text = normalize(ability.desc?.pt || ability.desc?.en || '');
  const writtenDamage = numberAfter(text, /(?:causa|deals?)\s+(\d+)\s+(?:de\s+)?dano/);
  const heal = numberAfter(text, /(?:recupera|restaura|cura|recovers?|restores?|heals?)\s+(\d+)/);
  const shield = numberNear(text, [
    /(\d+)\s*(?:de\s+)?escudo/,
    /escudo[^0-9]{0,40}?(?:absorve|\bde\b)[^0-9]{0,10}(\d+)/,
    /(\d+)\s*shield/,
    /shield[^0-9]{0,40}?(?:absorbs?|\bof\b)[^0-9]{0,10}(\d+)/,
  ]);
  const writtenDuration = numberAfter(text, /(?:por|for)\s+(\d+)\s+(?:turnos?|rodadas?|turns?|rounds?)/);
  const statuses = [];

  const addStatus = (type, fallbackDuration = 1, fallbackValue) => {
    if (!statuses.some(status => status.type === type)) {
      statuses.push({
        type,
        duration: ability.duration || writtenDuration || fallbackDuration,
        value: ability.value ?? fallbackValue,
      });
    }
  };

  if (Array.isArray(ability.statusEffects)) {
    ability.statusEffects.forEach(status => statuses.push({ ...status }));
  } else {
    if (ability.statusEffect) addStatus(ability.statusEffect === 'stun' ? 'paralyze' : ability.statusEffect);
    if (/\b(venen|poison|toxina)/.test(text)) addStatus('poison', 2, /forte|extrem|strong/.test(text) ? 2 : 1);
    if (/\b(queim|burn)/.test(text)) addStatus('burn', 2, /forte|extrem|strong/.test(text) ? 2 : 1);
    if (/\b(sangr|bleed)/.test(text)) addStatus('bleed', 2, /forte|extrem|strong/.test(text) ? 2 : 1);
    if (/\b(congel|freeze|frozen)/.test(text)) addStatus('freeze', 1);
    if (/\b(paralis|stun|atordoa)/.test(text)) addStatus('paralyze', 1);
    if (/\b(sono|dormir|sleep)/.test(text)) addStatus('sleep', 2);
  }

  return {
    damage: typeof ability.damage === 'number'
      ? ability.damage
      : (writtenDamage ?? ((ability.cost || 0) * 2 + 1)),
    heal: typeof ability.heal === 'number' ? ability.heal : heal,
    shield: typeof ability.shield === 'number' ? ability.shield : shield,
    statuses,
  };
};

export default resolveAbility;
