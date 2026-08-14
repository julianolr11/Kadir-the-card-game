const normalize = (value = '') => String(value)
  .replace(/<[^>]+>/g, ' ')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const numberAfter = (text, pattern) => {
  const match = text.match(pattern);
  return match ? Number(match[1]) : null;
};

export const resolveAbility = (ability = {}) => {
  const text = normalize(ability.desc?.pt || ability.desc?.en || '');
  const writtenDamage = numberAfter(text, /(?:causa|deals?)\s+(\d+)\s+(?:de\s+)?dano/);
  const heal = numberAfter(text, /(?:recupera|restaura|cura|recovers?|restores?|heals?)\s+(\d+)/);
  const shield = numberAfter(text, /(?:escudo[^0-9]{0,24}(?:absorve|de)|shield[^0-9]{0,24}(?:absorbs?|of))\s+(\d+)/);
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
