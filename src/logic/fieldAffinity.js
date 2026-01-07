// Função para calcular bônus de campo para criaturas
// Recebe: campo (field), criatura (creature)
// Retorna: { bonusDano, bonusHP }

export function getFieldAffinityBonus(field, creature) {
  let bonusDano = 0;
  let bonusHP = 0;

  const hasElement = creature.element === field.element;
  const hasType = creature.type === field.type;

  if (hasElement && hasType) {
    bonusDano = 2;
    bonusHP = 2;
  } else if (hasElement || hasType) {
    bonusDano = 1;
    bonusHP = 1;
  }

  return { bonusDano, bonusHP };
}
