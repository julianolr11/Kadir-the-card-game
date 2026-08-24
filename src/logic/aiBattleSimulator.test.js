import { runSimulationBatch, seededRandom, simulateBattle } from './aiBattleSimulator';

const pool = Array.from({ length: 20 }, (_, index) => ({
  id: `c${index}`, name: `Carta ${index}`, hp: 3 + (index % 3), element: 'fogo',
  abilities: [{ name: 'Golpe', cost: 1, damage: 2 }],
}));

describe('AI battle simulator', () => {
  test('gerador aleatório é reproduzível', () => {
    const a = seededRandom(42); const b = seededRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  test('simula uma partida até um resultado ou limite', () => {
    const result = simulateBattle({ cardPool: pool, seed: 7, maxTurns: 40 });
    expect(['player', 'ai', 'draw']).toContain(result.winner);
    expect(result.turns).toBeLessThanOrEqual(40);
  });

  test('agrega métricas de várias partidas', () => {
    const result = runSimulationBatch({ cardPool: pool, matches: 4, maxTurns: 30 });
    expect(Object.values(result.wins).reduce((sum, value) => sum + value, 0)).toBe(4);
    expect(result.averageTurns).toBeGreaterThan(0);
  });
});
