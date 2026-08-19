// Helpers compartilhados pelo modo Calamidade (CalamityLobby / CalamityBattle).

// Resolve o baseId (id do arquivo da carta) a partir de um id de deck, que pode ser
// um instanceId (ex.: "ekeranth-172641...-abc") ou já o baseId puro.
// Mesma lógica usada em BattleContext.jsx ao consumir a mão do jogador.
export const resolveBaseCardId = (cardId, cardCollection = {}) => {
  if (!cardId) return cardId;
  if (String(cardId).includes('-')) {
    const baseId = Object.keys(cardCollection).find((key) => {
      const instances = cardCollection[key];
      return Array.isArray(instances) && instances.some((inst) => inst.instanceId === cardId);
    });
    if (baseId) return baseId;
  }
  return cardId;
};

// Carrega os dados da carta (arquivo em assets/cards/booster1/<id>.js) por baseId.
export const getCreatureCardData = (baseId) => {
  if (!baseId) return null;
  try {
    return require(`../assets/cards/booster1/${baseId}.js`);
  } catch (error) {
    return null;
  }
};
