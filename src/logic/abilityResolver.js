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

  // Habilidades de "remove/limpa debuff(s)" (ex: "Remove 1 debuff aliado", "cleanses 1 debuff
  // from the most injured ally", "remove todos os debuffs"). O motor só remove buffs negativos
  // do próprio usuário (ver aplicação em BattleContext), então aqui só extraímos a quantidade.
  const writtenCleanseAll = /(?:remov\w*|cleanses?|limpa\w*)[^.]{0,40}(?:todos?\s+os?\s+debuffs?|all\s+debuffs?)/.test(text);
  const writtenCleanse = numberNear(text, [
    /(?:remov\w*|cleanses?|limpa\w*)\s+(\d+)[^.]{0,30}debuff/,
  ]);
  const cleanse = typeof ability.cleanse === 'number'
    ? ability.cleanse
    : (writtenCleanseAll ? Infinity : writtenCleanse);

  // Habilidades de evasão pura (ex: "Ganha evasão aumentada por 2 turnos") não causam dano -
  // concedem esquiva ao próprio usuário em vez de atacar o alvo.
  const isEvasion = /\b(evas(?:a|ã)o|esquiv|dodge)/.test(text);
  // Habilidades de redução de dano próprio (ex: "reduz o dano recebido em 1 por 2 turnos" ou
  // "recebe menos dano de ataques físicos por 2 turnos") também não causam dano - concedem
  // armadura (redução de dano recebido) ao próprio usuário. Sem essa detecção, essas
  // habilidades caiam na fórmula genérica de dano (custo*2+1) por não terem "causa X de dano".
  const isDamageReduction = /(reduz\w*\s+o?\s*dano\s+recebid\w*|receb\w*\s+menos\s+dano)/.test(text);
  const writtenDamageReduction = numberNear(text, [
    /reduz\w*\s+o?\s*dano\s+recebid\w*\s+em\s+(\d+)/,
    /recebe\s+(\d+)\s+a?\s*menos\s+de\s+dano/,
  ]);
  const hasExplicitDamage = typeof ability.damage === 'number' || writtenDamage !== null;
  const selfBuff = (isEvasion && !hasExplicitDamage)
    ? { stat: 'dodge', value: 0.5, duration: ability.duration || writtenDuration || 2 }
    : (isDamageReduction && !hasExplicitDamage)
      ? { stat: 'armor', value: ability.value ?? writtenDamageReduction ?? 1, duration: ability.duration || writtenDuration || 2 }
      : null;

  // Habilidades do tipo "causa X de dano a N inimigos aleatórios" atingem N alvos sorteados
  // no campo do adversário, em vez do único alvo selecionado pelo jogador.
  const writtenRandomTargets = numberNear(text, [
    /(\d+)\s+inimigos?\s+aleatorios?/,
    /(\d+)\s+random\s+enem(?:y|ies)/,
  ]);
  const randomTargets = typeof ability.randomTargets === 'number'
    ? ability.randomTargets
    : (writtenRandomTargets && writtenRandomTargets > 1 ? writtenRandomTargets : null);

  // Habilidades do tipo "elimina X de essência do oponente" drenam essência do lado alvo,
  // além do dano normal (limitado a 0 - só remove o que o oponente de fato tiver).
  const writtenDrainEssence = numberNear(text, [
    /(?:elimina|remove|drena)\s+(\d+)\s+(?:de\s+)?essencia/,
    /removes?\s+(\d+)\s+essence/,
  ]);
  const drainEssence = typeof ability.drainEssence === 'number' ? ability.drainEssence : writtenDrainEssence;

  const addStatus = (type, fallbackDuration = 1, fallbackValue) => {
    if (!statuses.some(status => status.type === type)) {
      statuses.push({
        type,
        duration: ability.duration || writtenDuration || fallbackDuration,
        value: ability.value ?? fallbackValue,
      });
    }
  };

  // Habilidades de "dano contínuo" genérico (ex: "Causa 1 de dano contínuo por 2 turnos") não
  // usam a palavra "queima", mas descrevem o mesmo mecanismo de status (dano por turno) que o
  // motor já implementa como 'burn'. Sem essa detecção, o número virava só um golpe único.
  const isContinuousDamage = /\b(dano\s+continuo|continuous\s+damage)\b/.test(text);

  if (Array.isArray(ability.statusEffects)) {
    ability.statusEffects.forEach(status => statuses.push({ ...status }));
  } else {
    if (ability.statusEffect) addStatus(ability.statusEffect === 'stun' ? 'paralyze' : ability.statusEffect);
    if (/\b(venen|poison|toxina)/.test(text)) addStatus('poison', 2, /forte|extrem|strong/.test(text) ? 2 : 1);
    if (/\b(queim|burn)/.test(text)) addStatus('burn', 2, /forte|extrem|strong/.test(text) ? 2 : 1);
    if (isContinuousDamage) addStatus('burn', 2, writtenDamage ?? 1);
    if (/\b(sangr|bleed)/.test(text)) addStatus('bleed', 2, /forte|extrem|strong/.test(text) ? 2 : 1);
    if (/\b(congel|freeze|frozen)/.test(text)) addStatus('freeze', 1);
    if (/\b(paralis|stun|atordoa|derruba|knockdown|knock\s*down)/.test(text)) addStatus('paralyze', 1);
    if (/\b(sono|dormir|sleep)/.test(text)) addStatus('sleep', 2);
  }

  return {
    damage: selfBuff
      ? 0
      : isContinuousDamage
        ? 0
        : (typeof ability.damage === 'number'
          ? ability.damage
          : (writtenDamage ?? ((ability.cost || 0) * 2 + 1))),
    heal: typeof ability.heal === 'number' ? ability.heal : heal,
    shield: typeof ability.shield === 'number' ? ability.shield : shield,
    cleanse,
    statuses,
    selfBuff,
    randomTargets,
    drainEssence,
  };
};

export default resolveAbility;
