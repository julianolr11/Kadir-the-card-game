// Testes do sistema de reações de batalha (ver spec em .claude/tasks/battle-reactions.md).
// Reaproveita o mesmo padrão de mock de P2P em memória usado em BattleContext.calamity.test.jsx
// (window.electron.ipcRenderer.sendP2PMessage/onP2PMessage), sem precisar de dois processos
// Electron de verdade.
import React from 'react';
import { renderHook, act, render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppContext } from './AppContext';
import { BattleProvider, useBattle } from './BattleContext';
import { isValidBattleReactionId, BATTLE_REACTIONS } from '../constants/battleReactions';
import BattleReactionPicker from '../components/BattleReactionPicker';

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

describe('battleReactions registry', () => {
  it('accepts exactly the seven registered ids and rejects anything else', () => {
    expect(BATTLE_REACTIONS).toHaveLength(7);
    BATTLE_REACTIONS.forEach((reaction) => {
      expect(isValidBattleReactionId(reaction.id)).toBe(true);
    });
    expect(isValidBattleReactionId('not-a-reaction')).toBe(false);
    expect(isValidBattleReactionId('../../etc/passwd')).toBe(false);
    expect(isValidBattleReactionId('')).toBe(false);
    expect(isValidBattleReactionId(undefined)).toBe(false);
    expect(isValidBattleReactionId(null)).toBe(false);
    expect(isValidBattleReactionId(42)).toBe(false);
  });
});

describe('Battle reactions', () => {
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

  it('choosing a reaction never touches combat state (phase/activePlayer/field/log unchanged)', () => {
    const { result } = renderBattle();
    act(() => {
      result.current.startBattle({ mode: 'pvp', isHost: true, peerSteamId64: 'OPPONENT_ID', deck: Array(20).fill('roenhell') });
    });
    act(() => { result.current.startPlaying('player'); });

    const before = result.current.state;
    act(() => { result.current.sendBattleReaction('love'); });
    const after = result.current.state;

    expect(after).toBe(before); // state reference didn't change at all
    expect(result.current.battleReactions).toEqual({ 0: expect.objectContaining({ reactionId: 'love' }) });
  });

  it('campaign/training (no human opponent): reaction shows locally but nothing is sent over P2P', () => {
    const { result } = renderBattle();
    act(() => {
      result.current.startBattle({ mode: 'campaign', deck: Array(20).fill('roenhell') });
    });
    act(() => { result.current.startPlaying('player'); });

    act(() => { result.current.sendBattleReaction('surprised'); });

    expect(result.current.battleReactions['1'].reactionId).toBe('surprised'); // isHost falsy -> slot 1
    expect(p2p.sent).toEqual([]);
  });

  it('applies a 1.5s cooldown on local sends', () => {
    const { result } = renderBattle();
    act(() => {
      result.current.startBattle({ mode: 'pvp', isHost: true, peerSteamId64: 'OPPONENT_ID', deck: Array(20).fill('roenhell') });
    });
    act(() => { result.current.startPlaying('player'); });

    // Host also broadcasts a full 'state' message on every state change (unrelated to reactions,
    // see the useEffect below sendBattleReaction) - filter those out to isolate reaction sends.
    const reactionMessages = () => p2p.sent.filter((s) => s.message.type === 'reaction');

    act(() => { result.current.sendBattleReaction('love'); });
    act(() => { result.current.sendBattleReaction('wink'); }); // too soon, ignored
    expect(reactionMessages()).toHaveLength(1);
    expect(reactionMessages()[0].message.reactionId).toBe('love');

    act(() => { jest.advanceTimersByTime(1500); });
    act(() => { result.current.sendBattleReaction('wink'); });
    expect(reactionMessages()).toHaveLength(2);
    expect(reactionMessages()[1].message.reactionId).toBe('wink');
  });

  it('ignores spammy incoming reactions (max ~1 per 750ms per sender)', () => {
    const { result } = renderBattle();
    act(() => {
      result.current.startBattle({ mode: 'pvp', isHost: true, peerSteamId64: 'OPPONENT_ID', deck: Array(20).fill('roenhell') });
    });
    act(() => { result.current.startPlaying('player'); });

    act(() => { p2p.deliver('OPPONENT_ID', { type: 'reaction', reactionId: 'sad', senderSlot: 1, sentAt: Date.now() }); });
    expect(result.current.battleReactions['1'].reactionId).toBe('sad');

    act(() => { p2p.deliver('OPPONENT_ID', { type: 'reaction', reactionId: 'wink', senderSlot: 1, sentAt: Date.now() }); });
    expect(result.current.battleReactions['1'].reactionId).toBe('sad'); // still the first one, second was too soon

    act(() => { jest.advanceTimersByTime(750); });
    act(() => { p2p.deliver('OPPONENT_ID', { type: 'reaction', reactionId: 'wink', senderSlot: 1, sentAt: Date.now() }); });
    expect(result.current.battleReactions['1'].reactionId).toBe('wink');
  });

  it('rejects invalid reaction payloads without rendering or throwing', () => {
    const { result } = renderBattle();
    act(() => {
      result.current.startBattle({ mode: 'pvp', isHost: true, peerSteamId64: 'OPPONENT_ID', deck: Array(20).fill('roenhell') });
    });
    act(() => { result.current.startPlaying('player'); });

    act(() => { p2p.deliver('OPPONENT_ID', { type: 'reaction', reactionId: 'not-real', senderSlot: 1 }); });
    expect(result.current.battleReactions).toEqual({});

    // Unknown sender (not the expected opponent) - ignored even with a valid id.
    act(() => { p2p.deliver('SOME_STRANGER', { type: 'reaction', reactionId: 'love', senderSlot: 1 }); });
    expect(result.current.battleReactions).toEqual({});
  });

  it('PvP: sends only to the correct opponent, using the direct P2P channel', () => {
    const { result } = renderBattle();
    act(() => {
      result.current.startBattle({ mode: 'pvp', isHost: false, peerSteamId64: 'HOST_ID', deck: Array(20).fill('roenhell') });
    });

    act(() => { result.current.sendBattleReaction('crowned'); });

    expect(p2p.sent).toEqual([
      { targetSteamId64: 'HOST_ID', message: { type: 'reaction', reactionId: 'crowned', senderSlot: 1, sentAt: expect.any(Number) } },
    ]);
  });

  it('Calamity guest: sends its reaction directly to the host', () => {
    const { result } = renderBattle();
    act(() => {
      result.current.startBattle({
        mode: 'calamity', bossId: 'ekeranth', isHost: false, hostSteamId64: 'HOST_ID', mySlotIndex: 1, playerCount: 2,
      });
    });

    act(() => { result.current.sendBattleReaction('surprised'); });

    expect(p2p.sent).toEqual([
      { targetSteamId64: 'HOST_ID', message: { type: 'reaction', reactionId: 'surprised', senderSlot: 1, sentAt: expect.any(Number) } },
    ]);
  });

  it('Calamity host: relays a guest reaction to the other guests without echoing it back to the sender', () => {
    const { result } = renderBattle();
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
    act(() => { result.current.startPlaying('player'); });

    act(() => { p2p.deliver('GUEST_A', { type: 'reaction', reactionId: 'laughing', senderSlot: 1, sentAt: Date.now() }); });

    // Host displays it locally too.
    expect(result.current.battleReactions['1'].reactionId).toBe('laughing');
    // Relayed to GUEST_B only - never echoed back to GUEST_A. (Ignore the unrelated full-state
    // broadcasts the host also fires on every state change - only look at 'reaction' messages.)
    const reactionMessages = () => p2p.sent.filter((s) => s.message.type === 'reaction');
    expect(reactionMessages()).toEqual([
      { targetSteamId64: 'GUEST_B', message: { type: 'reaction', reactionId: 'laughing', senderSlot: 1, sentAt: expect.any(Number) } },
    ]);

    // Unknown peer (not in calamityPeers) is ignored entirely - no display, no relay.
    act(() => { p2p.deliver('RANDOM_STRANGER', { type: 'reaction', reactionId: 'sad', senderSlot: 0, sentAt: Date.now() }); });
    expect(result.current.battleReactions['0']).toBeUndefined();
    expect(reactionMessages()).toHaveLength(1); // no new reaction message was sent
  });

  it('a new reaction from the same sender replaces the previous one, and it clears after the display timeout', () => {
    const { result } = renderBattle();
    act(() => {
      result.current.startBattle({ mode: 'pvp', isHost: true, peerSteamId64: 'OPPONENT_ID', deck: Array(20).fill('roenhell') });
    });
    act(() => { result.current.startPlaying('player'); });

    act(() => { result.current.sendBattleReaction('love'); });
    expect(result.current.battleReactions['0'].reactionId).toBe('love');

    act(() => { jest.advanceTimersByTime(1500); }); // clears the send cooldown
    act(() => { result.current.sendBattleReaction('wink'); });
    expect(Object.keys(result.current.battleReactions)).toHaveLength(1); // still a single entry for slot 0
    expect(result.current.battleReactions['0'].reactionId).toBe('wink');

    // The first reaction's own removal timer (scheduled at t=0, 2500ms later) must NOT wipe out
    // the second one that replaced it at t=1500 - only 1000ms have passed for the replacement.
    act(() => { jest.advanceTimersByTime(1000); });
    expect(result.current.battleReactions['0']).toBeDefined();

    act(() => { jest.advanceTimersByTime(1500); }); // 2500ms since the replacement fired
    expect(result.current.battleReactions['0']).toBeUndefined();
  });
});

describe('BattleReactionPicker', () => {
  it('renders accessible labels for all seven reactions, in any battle mode (campaign included)', () => {
    function StartAndRender({ battleSetup }) {
      const battle = useBattle();
      React.useEffect(() => {
        battle.startBattle(battleSetup);
      }, []); // eslint-disable-line react-hooks/exhaustive-deps
      return <BattleReactionPicker isEn={false} />;
    }

    // Campaign (no human opponent) still shows the trigger - the reaction just stays local
    // (see the "campaign/training: local-only" test above), matching the request that the
    // reaction button/card show in every battle mode, not only PvP/Calamity with a peer.
    render(<StartAndRender battleSetup={{ mode: 'campaign', deck: Array(20).fill('roenhell') }} />, { wrapper });
    expect(screen.getByRole('button', { name: 'Enviar reação' })).toBeInTheDocument();

    render(<StartAndRender battleSetup={{ mode: 'pvp', isHost: true, peerSteamId64: 'OPPONENT_ID', deck: Array(20).fill('roenhell') }} />, { wrapper });
    const triggers = screen.getAllByRole('button', { name: 'Enviar reação' });
    fireEvent.click(triggers[triggers.length - 1]);

    const menu = screen.getByRole('menu', { name: 'Reações' });
    BATTLE_REACTIONS.forEach((reaction) => {
      expect(within(menu).getByRole('menuitem', { name: reaction.label.pt })).toBeInTheDocument();
    });
  });
});
