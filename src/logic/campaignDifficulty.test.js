import { CAMPAIGN_FLOOR_CURVE, getCampaignFloorDifficulty } from './campaignDifficulty';

describe('campaign difficulty curve', () => {
  test('cresce sem reduzir inteligência ou força do deck', () => {
    CAMPAIGN_FLOOR_CURVE.slice(1).forEach((floor, index) => {
      expect(floor.aiLevel).toBeGreaterThanOrEqual(CAMPAIGN_FLOOR_CURVE[index].aiLevel);
      expect(floor.deckTier).toBeGreaterThanOrEqual(CAMPAIGN_FLOOR_CURVE[index].deckTier);
    });
  });

  test('primeiro andar ensina e chefe usa perfil máximo', () => {
    expect(getCampaignFloorDifficulty(0).aiLevel).toBe(1);
    expect(getCampaignFloorDifficulty(10).aiLevel).toBe(10);
    expect(getCampaignFloorDifficulty(10).profile.label).toBe('Lenda');
  });

  test('limita índices fora da torre', () => {
    expect(getCampaignFloorDifficulty(-1).floorIndex).toBe(0);
    expect(getCampaignFloorDifficulty(99).floorIndex).toBe(10);
  });
});
