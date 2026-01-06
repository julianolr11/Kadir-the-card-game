// IA mínima: por enquanto apenas termina turno
export function chooseAction(state) {
  // Futuros comportamentos: invocar se tiver slot livre, usar efeito, etc.
  return { type: 'endTurn' };
}
