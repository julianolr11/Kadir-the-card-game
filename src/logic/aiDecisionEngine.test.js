import { chooseActionFromState, evaluateState, generateValidActions } from './aiDecisionEngine';
import { getAiDifficultyProfile } from './aiDifficulty';

const creature = (id, hp, abilities = [{ name: 'Golpe', cost: 1, damage: 2 }]) => ({
  id, baseId: id, name: id, hp, maxHp: hp, element: 'fogo', abilities, statusEffects: [],
});

const state = () => ({
  activePlayer: 'ai',
  ai: { essence: 2, orbs: 3, hand: ['summon'], deck: [], graveyard: [], field: { slots: [creature('a', 5), null, null] } },
  player: { essence: 1, orbs: 2, hand: [], deck: [], graveyard: [], field: { slots: [creature('p', 2), null, null] } },
  creaturesWithUsedAbility: new Set(),
  creaturesInvokedThisTurn: { ai: 0, player: 0 },
});

describe('ai decision engine', () => {
  test('gera apenas ataques que a essência permite', () => {
    const s = state();
    s.ai.field.slots[0].abilities.push({ name: 'Caro', cost: 3, damage: 9 });
    const attacks = generateValidActions(s, { side: 'ai' }).filter(a => a.type === 'attack');
    expect(attacks).toHaveLength(1);
    expect(attacks[0].ability.name).toBe('Golpe');
  });

  test('inclui invocação e encerramento do turno', () => {
    const actions = generateValidActions(state(), { side: 'ai', cardPool: [{ id: 'summon', hp: 4, abilities: [] }] });
    expect(actions.some(a => a.type === 'summon')).toBe(true);
    expect(actions.some(a => a.type === 'endTurn')).toBe(true);
  });

  test('avalia vantagem de orbes e presença de campo', () => {
    const ahead = state();
    const behind = state();
    behind.ai.orbs = 1;
    behind.ai.field.slots[0] = null;
    expect(evaluateState(ahead, 'ai')).toBeGreaterThan(evaluateState(behind, 'ai'));
  });

  test('nível 10 escolhe o ataque letal', () => {
    const s = state();
    s.ai.field.slots[0].abilities.push({ name: 'Finalizador', cost: 2, damage: 3 });
    const action = chooseActionFromState(s, { side: 'ai', level: 10, allowedTypes: ['attack'], random: () => 0 });
    expect(action.ability.name).toBe('Finalizador');
  });

  test('normaliza dificuldade para a faixa 0 a 10', () => {
    expect(getAiDifficultyProfile(-4).level).toBe(0);
    expect(getAiDifficultyProfile(99).level).toBe(10);
  });
});
