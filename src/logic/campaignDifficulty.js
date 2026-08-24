import { getAiDifficultyProfile } from './aiDifficulty';

// A inteligência cresce em todos os andares. A força do baralho sobe mais devagar para que
// o começo ensine o jogador sem combinar decisões melhores e cartas mais fortes no mesmo salto.
export const CAMPAIGN_FLOOR_CURVE = [
  { aiLevel: 1, deckTier: 0, targetPlayerWinRate: [0.75, 0.85] },
  { aiLevel: 1, deckTier: 0, targetPlayerWinRate: [0.72, 0.82] },
  { aiLevel: 2, deckTier: 1, targetPlayerWinRate: [0.68, 0.78] },
  { aiLevel: 3, deckTier: 2, targetPlayerWinRate: [0.64, 0.74] },
  { aiLevel: 4, deckTier: 3, targetPlayerWinRate: [0.60, 0.70] },
  { aiLevel: 5, deckTier: 4, targetPlayerWinRate: [0.56, 0.66] },
  { aiLevel: 6, deckTier: 5, targetPlayerWinRate: [0.52, 0.62] },
  { aiLevel: 7, deckTier: 6, targetPlayerWinRate: [0.48, 0.58] },
  { aiLevel: 8, deckTier: 7, targetPlayerWinRate: [0.44, 0.54] },
  { aiLevel: 9, deckTier: 8, targetPlayerWinRate: [0.38, 0.50] },
  { aiLevel: 10, deckTier: 10, targetPlayerWinRate: [0.30, 0.45] },
];

export function getCampaignFloorDifficulty(floorIndex = 0) {
  const normalized = Math.max(0, Math.min(CAMPAIGN_FLOOR_CURVE.length - 1, Math.floor(Number(floorIndex) || 0)));
  const config = CAMPAIGN_FLOOR_CURVE[normalized];
  return { ...config, floorIndex: normalized, profile: getAiDifficultyProfile(config.aiLevel) };
}

export default getCampaignFloorDifficulty;
