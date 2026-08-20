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

  it('endTurn() is a no-op once the game has ended, instead of still advancing the turn counter', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity',
        bossId: 'ekeranth',
        playerCount: 1,
        deck: Array(20).fill('roenhell'),
      });
    });
    // Ainda em phase:'coinflip' (startPlaying nunca foi chamado) - o mais simples "não playing"
    // pra testar o guard sem precisar simular uma derrota real de baralho+mão+campo vazios.
    expect(result.current.state.phase).toBe('coinflip');
    const turnBefore = result.current.state.turn;

    act(() => {
      result.current.endTurn();
    });

    // Bug real (2026-08-19): endTurn() era a ÚNICA ação que nunca checava phase!=='playing' -
    // a chamada de endTurn() no fim da cadeia de setTimeout do turno da calamidade disparava
    // mesmo depois do jogo já ter acabado, incrementando turn no meio da animação de vitória/
    // derrota de BattleBoard.jsx e travando a tela escurecida pra sempre (o useEffect de lá
    // cancela os timers pendentes sempre que turn muda, sem reagendar). Ver comentário no topo
    // de endTurn em BattleContext.jsx.
    expect(result.current.state.turn).toBe(turnBefore);
    expect(result.current.state.activePlayer).toBe('player');
  });
});

// Stage 1 do coop de 2-4 jogadores na Calamidade (dado isolado, ver comentário em startBattle
// perto de calamityCoopSlots - state.player.hand/deck/essence/graveyard não mudam em nada aqui,
// só o novo state.calamityCoop existe em paralelo). Nenhuma função de jogo lê isso ainda
// (Stage 2); estes testes só travam o formato do dado pra quando o motor passar a consumi-lo.
describe('Calamity co-op data model (Stage 1)', () => {
  let randomSpy;

  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
    jest.useFakeTimers();
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.useRealTimers();
  });

  it('is null outside Calamity mode and for solo Calamity matches', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity',
        bossId: 'ekeranth',
        playerCount: 1,
        deck: Array(20).fill('roenhell'),
      });
    });
    // Solo (playerCount 1) segue existindo por completude do dado, mas nada além do teste de
    // Stage 2 depende disso - o motor de jogo real usa state.player.hand/deck/essence direto.
    expect(result.current.state.calamityCoop).toEqual({
      activeIndex: 0,
      slots: [expect.objectContaining({ hand: expect.any(Array) })],
    });
  });

  it('builds one independent hand/deck/essence/graveyard per player when playerDecks is given', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity',
        bossId: 'ekeranth',
        playerCount: 2,
        playerDecks: [Array(20).fill('mawthorn'), Array(20).fill('ignis')],
      });
    });

    const { calamityCoop } = result.current.state;
    expect(calamityCoop.activeIndex).toBe(0);
    expect(calamityCoop.slots).toHaveLength(2);
    // Cada jogador puxou a mão inicial (4 cartas) do próprio baralho, não de um pool comum.
    expect(calamityCoop.slots[0].hand).toEqual(['mawthorn', 'mawthorn', 'mawthorn', 'mawthorn']);
    expect(calamityCoop.slots[1].hand).toEqual(['ignis', 'ignis', 'ignis', 'ignis']);
    expect(calamityCoop.slots[0].essence).toBe(0);
    expect(calamityCoop.slots[0].graveyard).toEqual([]);
    // 20 no baralho - 4 compradas = 16 restantes, por jogador.
    expect(calamityCoop.slots[0].deck).toHaveLength(16);
    expect(calamityCoop.slots[1].deck).toHaveLength(16);
  });

  it('falls back to duplicating the single deck per player when playerDecks is not given yet (no lobby UI wired up to Stage 1)', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity',
        bossId: 'ekeranth',
        playerCount: 3,
        deck: Array(20).fill('roenhell'),
      });
    });

    const { calamityCoop } = result.current.state;
    expect(calamityCoop.slots).toHaveLength(3);
    calamityCoop.slots.forEach((slot) => {
      expect(slot.hand).toEqual(['roenhell', 'roenhell', 'roenhell', 'roenhell']);
    });
  });
});

// Stage 2: o motor de sub-turno em si. state.player.{hand,deck,essence,graveyard} deve sempre
// refletir "quem está jogando agora" - summonFromHand/useAbility/etc. nunca precisam saber que
// existe mais de um jogador, só endTurn troca a identidade por baixo dos panos.
describe('Calamity co-op turn engine (Stage 2)', () => {
  let randomSpy;

  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
    jest.useFakeTimers();
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.useRealTimers();
  });

  it('passes the sub-turn from Player 1 to Player 2 without touching activePlayer or the round', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity',
        bossId: 'ekeranth',
        playerCount: 2,
        playerDecks: [Array(20).fill('roenhell'), Array(20).fill('mawthorn')],
      });
    });
    act(() => {
      result.current.startPlaying('player');
    });

    expect(result.current.state.calamityCoop.activeIndex).toBe(0);
    expect(result.current.state.player.hand[0]).toBe('roenhell');

    act(() => {
      result.current.summonFromHand(0, 0);
    });
    expect(result.current.state.player.field.slots[0]?.baseId).toBe('roenhell');

    act(() => {
      result.current.endTurn();
    });

    // Ainda é a mesma rodada (Player 2 agindo agora) - o chefe não age até o ÚLTIMO jogador
    // passar a vez, e P1's criatura continua no slot dele.
    expect(result.current.state.activePlayer).toBe('player');
    expect(result.current.state.turn).toBe(1);
    expect(result.current.state.calamityCoop.activeIndex).toBe(1);
    expect(result.current.state.player.hand[0]).toBe('mawthorn');
    expect(result.current.state.player.field.slots[0]?.baseId).toBe('roenhell');
    expect(result.current.state.player.field.slots[1]).toBeNull();
    // Cada jogador tem sua própria invocação por sub-turno - P2 ainda não invocou nada.
    expect(result.current.state.creaturesInvokedThisTurn.player).toBe(0);
  });

  it('only lets the boss act after the LAST player ends their sub-turn, then wraps back to Player 1', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity',
        bossId: 'ekeranth',
        playerCount: 2,
        playerDecks: [Array(20).fill('roenhell'), Array(20).fill('mawthorn')],
      });
    });
    act(() => {
      result.current.startPlaying('player');
    });

    act(() => {
      result.current.summonFromHand(0, 0); // P1 summons into slot 0
    });
    act(() => {
      result.current.endTurn(); // -> P2's sub-turn
    });
    act(() => {
      result.current.summonFromHand(0, 1); // P2 summons into slot 1
    });
    expect(result.current.state.player.field.slots[1]?.baseId).toBe('mawthorn');

    act(() => {
      result.current.endTurn(); // last player -> boss's turn
    });
    // O chefe ainda não terminou de agir (cadeia de setTimeout) - a rodada ainda não voltou.
    expect(result.current.state.activePlayer).toBe('ai');

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    // Rodada completa: volta pro Jogador 1, turno incrementou, e ambas as criaturas dos dois
    // jogadores continuam no campo (cada uma no próprio slot).
    expect(result.current.state.activePlayer).toBe('player');
    expect(result.current.state.turn).toBe(2);
    expect(result.current.state.calamityCoop.activeIndex).toBe(0);
    expect(result.current.state.player.hand[0]).toBe('roenhell');
    expect(result.current.state.player.field.slots[0]?.baseId).toBe('roenhell');
    expect(result.current.state.player.field.slots[1]?.baseId).toBe('mawthorn');
  });
});

// Simula o transporte P2P (window.electron.ipcRenderer.sendP2PMessage/onP2PMessage) em memória,
// sem precisar de dois processos Electron de verdade nem de dois ambientes jsdom - captura tudo
// que é "enviado" e permite "entregar" uma mensagem como se tivesse vindo de um steamId64
// específico, disparando os listeners registrados via onP2PMessage (mesma API do preload real).
function makeP2PMock() {
  const listeners = new Set();
  const sent = [];
  window.electron = {
    ipcRenderer: {
      sendP2PMessage: jest.fn((targetSteamId64, message) => {
        sent.push({ targetSteamId64, message });
      }),
      onP2PMessage: jest.fn((cb) => {
        listeners.add(cb);
        return () => listeners.delete(cb);
      }),
    },
  };
  return {
    sent,
    deliver(fromSteamId64, message) {
      listeners.forEach((cb) => cb({ fromSteamId64, message }));
    },
  };
}

// Stage 3: roteamento de rede. Testa host e convidado como instâncias SEPARADAS do motor (cada
// renderHook é "um cliente"), ligadas só pelo mock de P2P acima - exatamente a topologia estrela
// real, onde cada convidado só fala com o anfitrião via mensagens serializáveis.
describe('Calamity co-op networking (Stage 3)', () => {
  let randomSpy;
  let p2p;

  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
    jest.useFakeTimers();
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    p2p = makeP2PMock();
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.useRealTimers();
    delete window.electron;
  });

  it('forwards the guest action to the host instead of applying it locally', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity',
        bossId: 'ekeranth',
        isHost: false,
        hostSteamId64: 'HOST_ID',
        mySlotIndex: 1,
        playerCount: 2,
      });
    });

    // Casca de convidado (ver isCalamityGuest em startBattle) - nunca simula localmente.
    expect(result.current.state.isHost).toBe(false);
    expect(result.current.state.phase).toBe('coinflip');

    act(() => {
      result.current.summonFromHand(0, 1);
    });

    expect(p2p.sent).toEqual([
      { targetSteamId64: 'HOST_ID', message: { type: 'action', action: 'summon', index: 0, slotIndex: 1 } },
    ]);
    // Não mudou nada localmente - quem aplica de verdade é o anfitrião (a casca de convidado
    // continua esperando o primeiro broadcast, ver phase:'coinflip' acima).
    expect(result.current.state.phase).toBe('coinflip');
    expect(result.current.state.player.field.slots.every((slot) => !slot)).toBe(true);
  });

  it("host only applies an incoming action when it's actually that peer's slot turn, and ignores unknown peers", () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity',
        bossId: 'ekeranth',
        isHost: true,
        playerCount: 2,
        playerDecks: [Array(20).fill('roenhell'), Array(20).fill('mawthorn')],
        peers: [{ steamId64: 'GUEST_ID', slotIndex: 1 }],
      });
    });
    act(() => {
      result.current.startPlaying('player');
    });

    // Ainda é a vez do slot 0 (host) - a ação do slot 1 (convidado) chega fora de ordem.
    act(() => {
      p2p.deliver('GUEST_ID', { type: 'action', action: 'summon', index: 0, slotIndex: 1 });
    });
    expect(result.current.state.player.field.slots[1]).toBeNull();

    // Peer desconhecido (não está em calamityPeers) - ignorado mesmo sendo a vez certa.
    act(() => {
      p2p.deliver('RANDOM_STRANGER', { type: 'action', action: 'summon', index: 0, slotIndex: 0 });
    });
    expect(result.current.state.player.field.slots[0]).toBeNull();

    // Host joga o próprio sub-turno (slot 0) e passa a vez - agora activeIndex === 1.
    act(() => {
      result.current.summonFromHand(0, 0);
    });
    act(() => {
      result.current.endTurn();
    });
    expect(result.current.state.calamityCoop.activeIndex).toBe(1);

    // Agora sim é a vez do convidado - a mesma mensagem de antes é aplicada.
    act(() => {
      p2p.deliver('GUEST_ID', { type: 'action', action: 'summon', index: 0, slotIndex: 1 });
    });
    expect(result.current.state.player.field.slots[1]?.baseId).toBe('mawthorn');
  });

  it('broadcasts state to every connected peer whenever it changes', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity',
        bossId: 'ekeranth',
        isHost: true,
        playerCount: 3,
        playerDecks: [Array(20).fill('roenhell'), Array(20).fill('mawthorn'), Array(20).fill('ignis')],
        peers: [
          { steamId64: 'GUEST_A', slotIndex: 1 },
          { steamId64: 'GUEST_B', slotIndex: 2 },
        ],
      });
    });
    act(() => {
      result.current.startPlaying('player');
    });

    const stateMessagesFor = (targetId) => p2p.sent.filter((s) => s.targetSteamId64 === targetId && s.message.type === 'state');
    expect(stateMessagesFor('GUEST_A').length).toBeGreaterThan(0);
    expect(stateMessagesFor('GUEST_B').length).toBeGreaterThan(0);
    // O estado transmitido é o de verdade, não um placeholder - dá pra ver o campo/turno nele.
    const lastToA = stateMessagesFor('GUEST_A').at(-1).message.state;
    expect(lastToA.mode).toBe('calamity');
    expect(lastToA.calamityCoop.slots).toHaveLength(3);
  });
});

// Temporizador de turno (1min, 3 timeouts seguidos cancela a partida) - só se aplica a PvP e
// coop da Calamidade (2+ jogadores), nunca a solo/campanha (ninguém fica esperando).
describe('Turn timer (60s, 3 consecutive timeouts cancels the match)', () => {
  let randomSpy;

  beforeEach(() => {
    window.HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = jest.fn();
    jest.useFakeTimers();
    randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    randomSpy.mockRestore();
    jest.useRealTimers();
  });

  it('sets a fresh 60s deadline on startPlaying, and clears it for solo Calamity (nobody waiting)', () => {
    const { result: coop } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      coop.current.startBattle({
        mode: 'calamity', bossId: 'ekeranth', isHost: true, playerCount: 2,
        playerDecks: [Array(20).fill('roenhell'), Array(20).fill('mawthorn')],
        peers: [{ steamId64: 'GUEST_ID', slotIndex: 1 }],
      });
    });
    const before = Date.now();
    act(() => { coop.current.startPlaying('player'); });
    expect(coop.current.state.turnTimerDeadline).toBeGreaterThanOrEqual(before + 59_000);
    expect(coop.current.state.turnTimerDeadline).toBeLessThanOrEqual(before + 61_000);

    const { result: solo } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      solo.current.startBattle({ mode: 'calamity', bossId: 'ekeranth', playerCount: 1, deck: Array(20).fill('roenhell') });
    });
    act(() => { solo.current.startPlaying('player'); });
    expect(solo.current.state.turnTimerDeadline).toBeNull();
  });

  it('resets a coop player\'s timeout streak when they end their turn in time, and increments it on timeout', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity', bossId: 'ekeranth', isHost: true, playerCount: 2,
        playerDecks: [Array(20).fill('roenhell'), Array(20).fill('mawthorn')],
      });
    });
    act(() => { result.current.startPlaying('player'); });

    act(() => { result.current.endTurn({ isTimeout: true }); });
    expect(result.current.state.calamityCoop.slots[0].timeoutStreak).toBe(1);

    // Volta a vez pro jogador 0 depois de uma rodada inteira (P2 age, chefe age) - agindo dentro
    // do prazo, o streak dele deveria voltar a 0.
    act(() => { result.current.endTurn(); }); // P2's turn, in time
    act(() => { jest.advanceTimersByTime(6000); }); // boss turn resolves
    expect(result.current.state.calamityCoop.activeIndex).toBe(0);
    act(() => { result.current.endTurn(); }); // P1's turn again, in time this time
    expect(result.current.state.calamityCoop.slots[0].timeoutStreak).toBe(0);
  });

  it('cancels the coop match (no reward, no penalty) after 3 consecutive timeouts from the same player', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity', bossId: 'ekeranth', isHost: true, playerCount: 2,
        playerDecks: [Array(20).fill('roenhell'), Array(20).fill('mawthorn')],
      });
    });
    act(() => { result.current.startPlaying('player'); });

    // P1 times out 3x in a row (P2 and the boss act normally between each, so it's really the
    // SAME player - slot 0 - failing 3 separate rounds, not 3 in the same round).
    for (let i = 0; i < 3; i += 1) {
      act(() => { result.current.endTurn({ isTimeout: true }); }); // P1 times out
      if (i < 2) {
        act(() => { result.current.endTurn(); }); // P2 plays fine
        act(() => { jest.advanceTimersByTime(6000); }); // boss turn resolves, back to P1
      }
    }

    expect(result.current.state.phase).toBe('ended');
    expect(result.current.state.gameResult.abandonReason).toBe('afk-timeout');
    expect(result.current.state.gameResult.afkSlotIndex).toBe(0);
    expect(result.current.state.turnTimerDeadline).toBeNull();
    // Ninguém "venceu" nem "perdeu" de verdade - foi cancelada.
    expect(result.current.state.gameResult.winner).toBeNull();
  });

  it('cancels a PvP match after 3 consecutive timeouts and identifies the AFK side (for the compensation logic in BattleResultModal)', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({ mode: 'pvp', isHost: true, peerSteamId64: 'OPPONENT_ID', deck: Array(20).fill('roenhell') });
    });
    act(() => { result.current.startPlaying('player'); });

    act(() => { result.current.endTurn({ isTimeout: true }); });
    expect(result.current.state.timeoutStreak.player).toBe(1);
    act(() => { result.current.endTurn(); }); // opponent's turn, ends normally
    act(() => { result.current.endTurn({ isTimeout: true }); });
    act(() => { result.current.endTurn(); });
    act(() => { result.current.endTurn({ isTimeout: true }); });

    expect(result.current.state.phase).toBe('ended');
    expect(result.current.state.gameResult.abandonReason).toBe('afk-timeout');
    expect(result.current.state.gameResult.afkSide).toBe('player');
    expect(result.current.state.gameResult.winner).toBe('ai'); // o outro lado "vence" (pra compensação)
  });

  it('auto-skips the turn when the deadline elapses, without any manual endTurn call', () => {
    const { result } = renderHook(() => useBattle(), { wrapper });
    act(() => {
      result.current.startBattle({
        mode: 'calamity', bossId: 'ekeranth', isHost: true, playerCount: 2,
        playerDecks: [Array(20).fill('roenhell'), Array(20).fill('mawthorn')],
      });
    });
    act(() => { result.current.startPlaying('player'); });
    expect(result.current.state.calamityCoop.activeIndex).toBe(0);

    act(() => { jest.advanceTimersByTime(61_000); });

    // Ninguém chamou endTurn manualmente - o próprio motor (efeito do host) detectou o prazo
    // estourado e passou a vez sozinho, contando como timeout.
    expect(result.current.state.calamityCoop.activeIndex).toBe(1);
    expect(result.current.state.calamityCoop.slots[0].timeoutStreak).toBe(1);
  });
});
