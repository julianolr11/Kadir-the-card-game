// IA mínima: tenta invocar a primeira carta disponível em um slot livre; senão, termina turno
export function chooseAction(state) {
  if (!state || state.activePlayer !== 'ai') return { type: 'endTurn' };
  const hand = state.ai?.hand || [];
  const slots = state.ai?.field?.slots || [];
  const handIndex = hand.findIndex(Boolean);
  const slotIndex = slots.findIndex((slot) => !slot);

  if (handIndex >= 0 && slotIndex >= 0) {
    return { type: 'summon', handIndex, slotIndex };
  }

  return { type: 'endTurn' };
}
