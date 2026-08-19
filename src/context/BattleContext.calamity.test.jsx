// Regressão pros bugs de Calamidade caçados/corrigidos em 2026-08-19: congelamento do Mawthorn
// disparando no ataque em vez de na invocação, cura da calamidade quando o jogador esvazia o
// campo de propósito, e criatura ressuscitada pelo Ignis não conseguindo ser invocada da mão.
//
// Usa renderHook sobre o BattleProvider real (não mocka o motor) - só o AppContext em volta é
// mínimo, já que resolveCreatureBuild já trata cardCollection/loadGuardianLoadout ausentes como
// "sem coleção, usa stats base" (ver resolveCreatureBuild em BattleContext.jsx).
//
// Math.random é fixado em 0 pra deixar o shuffle do baralho determinístico: com random()=0 fixo,
// o Fisher-Yates em shuffle() (BattleContext.jsx) sempre troca a[i] com a[0], o que equivale a
// rotacionar o array 1 posição pra esquerda (new[k] = original[k+1], new[N-1] = original[0]).
// Isso deixa a composição da mão inicial (4 primeiras cartas do baralho embaralhado) previsível
// sem precisar mockar o motor de sorteio inteiro.
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppContext } from './AppContext';
import { BattleProvider, useBattle } from './BattleContext';

const mockAppContextValue = {
  decks: [],
  cardCollection: {},
  effectsVolume: 0,
  musicVolume: 0,
  loadGuardianLoadout: () => null,
};

function wrapper({ children }) {
  return (
    <AppContext.Provider value={mockAppContextValue}>
      <BattleProvider>{children}</BattleProvider>
    </AppContext.Provider>
  );
}

function renderBattle() {
  return renderHook(() => useBattle(), { wrapper });
}

describe('Calamity mode regressions', () => {
  let randomSpy;

  beforeEach(() => {
    // jsdom não implementa HTMLMediaElement.play/pause - sem isso, os efeitos de som/música do
    // BattleContext derrubam o teste com "not implemented" (e, combinado a fake timers, chega a
    // travar em "Maximum call stack size exceeded").
    window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
    jest.useFakeTimers();
    // Ver comentário no topo do arquivo: random()=0 fixo => shuffle vira "rotate left by 1".
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.useRealTimers();
  });

  // startBattle deixa a partida em phase:'coinflip' (a UI mostra a animação de moeda antes de
  // liberar o primeiro turno) - startPlaying('player') é o que a UI chama ao terminar essa
  // animação. Sem isso toda ação fica travada (summonFromHand etc. checam phase==='playing').
  function start(battleSetup, result) {
    act(() => {
      result.current.startBattle(battleSetup);
    });
    act(() => {
      result.current.startPlaying('player');
    });
  }

  it("Mawthorn's Abyssal Freeze applies to the boss on summon, not on the next attack", () => {
    const { result } = renderBattle();

    start({
      mode: 'calamity',
      bossId: 'ekeranth',
      playerCount: 1,
      deck: Array(20).fill('mawthorn'),
    }, result);

    expect(result.current.state.player.hand[0]).toBe('mawthorn');

    act(() => {
      result.current.summonFromHand(0, 0);
    });

    const boss = result.current.state.ai.field.slots[0];
    expect(boss).toBeTruthy();
    expect(boss.statusEffects).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'freeze', duration: 3 })]),
    );
    // A bênção não deve deixar nenhuma escolha de alvo pendente - era isso que fazia o próximo
    // clique de ataque (isFreezeTargetable em BattleBoard.jsx) ser sequestrado pra aplicar o
    // freeze em vez de atacar.
    expect(result.current.state.freezePending).toBeFalsy();
  });

  it('marks calamityBossHealPending when the player summons, attacks, and sacrifices in the same turn', () => {
    const { result } = renderBattle();

    start({
      mode: 'calamity',
      bossId: 'ekeranth',
      playerCount: 1,
      deck: Array(20).fill('roenhell'),
    }, result);

    act(() => {
      result.current.summonFromHand(0, 0);
    });
    expect(result.current.state.player.field.slots[0]).toBeTruthy();

    act(() => {
      result.current.sacrificeCreature('player', 0);
    });
    expect(result.current.state.player.field.slots[0]).toBeNull();
    expect(result.current.state.player.graveyard).toHaveLength(1);

    act(() => {
      result.current.endTurn();
    });

    // Este é o bug corrigido: a flag exigia invokedThisTurnCount === 0, então
    // summon+ataque+sacrifício no mesmo turno (o caso mais claramente deliberado) nunca contava.
    expect(result.current.state.calamityBossHealPending).toBe(true);
  });

  it('does NOT mark calamityBossHealPending when the player genuinely has nothing to play', () => {
    const { result } = renderBattle();

    // Um baralho não-vazio, mas com só um id que não corresponde a nenhuma criatura real: passa
    // pelo check de "baralho vazio cai pra amostra aleatória" (deckOverride.length > 0) e depois
    // é filtrado pra fora pelo filtro "só criaturas" da Calamidade (ver startBattle), deixando a
    // mão genuinamente vazia - diferente de simplesmente passar [], que ativaria o fallback.
    start({
      mode: 'calamity',
      bossId: 'ekeranth',
      playerCount: 1,
      deck: ['not_a_real_creature_id'],
    }, result);

    expect(result.current.state.player.hand).toHaveLength(0);

    act(() => {
      result.current.endTurn();
    });

    expect(result.current.state.calamityBossHealPending).toBe(false);
  });

  it('lets a creature resurrected by Ignis (with no free slot) be summoned from hand afterwards', () => {
    const { result } = renderBattle();

    // Índice 1 = 'ignis' vira índice 0 pós-shuffle (rotate left by 1) - ver comentário no topo.
    const deck = Array(20).fill('roenhell');
    deck[1] = 'ignis';

    start({
      mode: 'calamity',
      bossId: 'ekeranth',
      playerCount: 1,
      deck,
    }, result);

    expect(result.current.state.player.hand).toEqual(
      expect.arrayContaining(['ignis', 'roenhell']),
    );

    const roenhellIndex = result.current.state.player.hand.indexOf('roenhell');
    act(() => {
      result.current.summonFromHand(roenhellIndex, 0);
    });
    act(() => {
      result.current.sacrificeCreature('player', 0);
    });
    expect(result.current.state.player.graveyard).toHaveLength(1);

    // Fecha o turno do jogador (esvaziou o campo de propósito) e deixa a cadeia de setTimeout
    // do turno da calamidade (windup -> resolve -> limpeza -> endTurn de volta) rodar inteira.
    act(() => {
      result.current.endTurn();
    });
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    expect(result.current.state.activePlayer).toBe('player');
    expect(result.current.state.player.field.slots.every((slot) => !slot)).toBe(true);

    const ignisIndex = result.current.state.player.hand.indexOf('ignis');
    expect(ignisIndex).toBeGreaterThanOrEqual(0);

    act(() => {
      result.current.summonFromHand(ignisIndex, 0);
    });

    // Ignis foi invocado normalmente (não é o alvo do teste), mas seu blessing dispara a
    // ressurreição - só há 1 slot no solo e ele acabou de ser ocupado, então cai no fallback
    // "vai para a mão" (ver resurrectCreature em BattleContext.jsx).
    expect(result.current.state.player.field.slots[0]?.baseId).toBe('ignis');
    expect(result.current.state.resurrectionPending).toBeTruthy();
    expect(result.current.state.player.graveyard).toHaveLength(1);

    act(() => {
      result.current.resurrectCreature(0, -1);
    });

    expect(result.current.state.player.graveyard).toHaveLength(0);
    expect(result.current.state.resurrectionPending).toBeNull();
    // O bug: isso costumava entrar na mão como um instanceId sintético nunca registrado em
    // nenhuma coleção, e summonFromHand não conseguia resolvê-lo de volta pro baseId - o summon
    // falhava em silêncio. Agora deve ser o baseId puro ('roenhell'), reconhecido direto.
    expect(result.current.state.player.hand).toContain('roenhell');

    const resurrectedIndex = result.current.state.player.hand.indexOf('roenhell');
    // O único slot ainda está ocupado pelo Ignis - sacrifica ele pra abrir espaço. Isso já usou a
    // única invocação do turno (o próprio Ignis), então precisa passar pro turno seguinte antes
    // de poder invocar de novo (mesma restrição de "1 invocação por turno" de summonFromHand).
    act(() => {
      result.current.sacrificeCreature('player', 0);
    });
    act(() => {
      result.current.endTurn();
    });
    act(() => {
      jest.advanceTimersByTime(6000);
    });
    expect(result.current.state.activePlayer).toBe('player');

    act(() => {
      result.current.summonFromHand(resurrectedIndex, 0);
    });

    expect(result.current.state.player.field.slots[0]?.baseId).toBe('roenhell');
  });
});
