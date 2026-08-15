import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import cardsPool from '../assets/cards';
import DeckSelectModal from './DeckSelectModal';
import { ACHIEVEMENTS } from '../assets/achievementsData';
import '../styles/pvp-lobby.css';

const pickFirstDeckEntry = (decks) => {
  const ids = Object.keys(decks || {});
  if (ids.length === 0) return null;
  const id = ids[0];
  const deck = decks[id];
  if (!deck || !Array.isArray(deck.cards) || deck.cards.length === 0) return null;
  return { id, deck };
};

export default function PvpLobby({ onBack, onStartBattle }) {
  const { lang = 'ptbr', decks, unlockedAchievements = [] } = useContext(AppContext) || {};
  const isEn = lang?.startsWith('en');

  const [steamConnected, setSteamConnected] = useState(null); // null = ainda verificando
  const [mySteamId64, setMySteamId64] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | creating | error
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false); // aguardando o handshake de início de partida
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [avatars, setAvatars] = useState({});
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [deckLocked, setDeckLocked] = useState(false);
  const [deckPickerOpen, setDeckPickerOpen] = useState(false);
  const [profiles, setProfiles] = useState({}); // steamId64 -> { achievements, guardianId, deckName }
  const startTimeoutRef = useRef(null);

  const selectedDeck = selectedDeckId ? decks?.[selectedDeckId] : null;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const steamStatus = await window.electron?.ipcRenderer?.getSteamStatus?.();
      if (cancelled) return;
      setSteamConnected(Boolean(steamStatus?.connected));
      setMySteamId64(steamStatus?.steamId64 || null);
      if (!steamStatus?.connected) return;

      // Já pode existir uma sala (ex: entrou via convite antes de abrir esta tela)
      const existing = await window.electron?.ipcRenderer?.getSteamLobby?.();
      if (!cancelled && existing?.ok) {
        setLobby(existing.lobby);
      }
    })();

    const unsubscribeUpdate = window.electron?.ipcRenderer?.onSteamLobbyUpdated?.((updatedLobby) => {
      setLobby(updatedLobby);
    });

    return () => {
      cancelled = true;
      unsubscribeUpdate?.();
    };
  }, []);

  // Pré-seleciona o primeiro baralho salvo (ainda destravado) só pra sempre ter algo pronto
  // pra mostrar/enviar caso o jogador nunca abra o seletor manualmente.
  useEffect(() => {
    if (selectedDeckId || deckLocked) return;
    const first = pickFirstDeckEntry(decks);
    if (first) setSelectedDeckId(first.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decks]);

  // Busca as fotos de perfil dos membros da sala (steamworks.js não expõe isso, só a Web API)
  useEffect(() => {
    const ids = (lobby?.members || []).map((m) => m.steamId64).filter((id) => !avatars[id]);
    if (ids.length === 0) return;
    let cancelled = false;
    window.electron?.ipcRenderer?.getSteamPlayerAvatars?.(ids).then((result) => {
      if (cancelled || !result?.ok) return;
      setAvatars((prev) => ({ ...prev, ...result.avatars }));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobby?.members]);

  // Avisa o adversário (se já entrou na sala) sempre que meu perfil (conquistas/baralho) muda.
  useEffect(() => {
    if (!lobby || (lobby.members?.length || 0) < 2 || !mySteamId64) return;
    const peer = lobby.members.find((m) => m.steamId64 !== mySteamId64);
    if (!peer) return;
    window.electron?.ipcRenderer?.sendP2PMessage?.(peer.steamId64, {
      type: 'profile',
      achievements: unlockedAchievements,
      guardianId: selectedDeck?.guardianId || null,
      deckName: selectedDeck?.name || null,
    });
  }, [lobby, mySteamId64, selectedDeck, unlockedAchievements]);

  // Handshake de início de partida: anfitrião pede o baralho do convidado, o convidado
  // responde, e então o anfitrião avisa o convidado que pode entrar na tela de batalha.
  // Também recebe o "profile" (conquistas/baralho selecionado) do adversário pra exibir na sala.
  useEffect(() => {
    const unsubscribe = window.electron?.ipcRenderer?.onP2PMessage?.(({ fromSteamId64, message }) => {
      if (!message) return;

      if (message.type === 'profile') {
        setProfiles((prev) => ({
          ...prev,
          [fromSteamId64]: {
            achievements: message.achievements || [],
            guardianId: message.guardianId || null,
            deckName: message.deckName || null,
          },
        }));
        return;
      }

      if (message.type === 'deck-request') {
        const myDeckCards = selectedDeck?.cards || null;
        window.electron?.ipcRenderer?.sendP2PMessage?.(fromSteamId64, {
          type: 'deck-response',
          deck: myDeckCards || [],
        });
        return;
      }

      if (message.type === 'deck-response') {
        if (startTimeoutRef.current) {
          clearTimeout(startTimeoutRef.current);
          startTimeoutRef.current = null;
        }
        window.electron?.ipcRenderer?.sendP2PMessage?.(fromSteamId64, { type: 'battle-start' });
        onStartBattle?.({
          isHost: true,
          peerSteamId64: fromSteamId64,
          opponentDeck: message.deck,
          deck: selectedDeck?.cards,
        });
        return;
      }

      if (message.type === 'battle-start') {
        onStartBattle?.({ isHost: false, peerSteamId64: fromSteamId64 });
      }
    });

    return () => unsubscribe?.();
  }, [selectedDeck, onStartBattle]);

  useEffect(() => () => {
    if (startTimeoutRef.current) clearTimeout(startTimeoutRef.current);
  }, []);

  const handleCreateLobby = async () => {
    setStatus('creating');
    setError(null);
    const result = await window.electron?.ipcRenderer?.createSteamLobby?.();
    if (result?.ok) {
      setLobby(result.lobby);
      setStatus('idle');
    } else {
      setStatus('error');
      setError(result?.error || (isEn ? 'Could not create room.' : 'Não foi possível criar a sala.'));
    }
  };

  const handleInvite = async () => {
    await window.electron?.ipcRenderer?.inviteToSteamLobby?.();
  };

  const handleJoinByCode = async () => {
    const trimmed = joinCode.trim();
    if (!trimmed) return;
    setJoining(true);
    setError(null);
    const result = await window.electron?.ipcRenderer?.joinSteamLobby?.(trimmed);
    setJoining(false);
    if (result?.ok) {
      setLobby(result.lobby);
      setJoinCode('');
    } else {
      setError(result?.error || (isEn ? 'Could not join that room.' : 'Não foi possível entrar nessa sala.'));
    }
  };

  const handleLeave = async () => {
    await window.electron?.ipcRenderer?.leaveSteamLobby?.();
    setLobby(null);
    onBack?.();
  };

  const handleOpenDeckPicker = () => {
    if (deckLocked) return;
    setDeckPickerOpen(true);
  };

  const handleDeckPicked = (_cards, deckId) => {
    setSelectedDeckId(deckId);
    setDeckLocked(true);
    setDeckPickerOpen(false);
  };

  const isHostOfLobby = Boolean(lobby && mySteamId64 && lobby.ownerSteamId64 === mySteamId64);
  const myMember = lobby?.members?.find((m) => m.steamId64 === mySteamId64) || null;
  const opponent = lobby?.members?.find((m) => m.steamId64 !== mySteamId64) || null;

  const handleStartBattle = () => {
    if (!opponent || starting || !deckLocked) return;
    setStarting(true);
    window.electron?.ipcRenderer?.sendP2PMessage?.(opponent.steamId64, { type: 'deck-request' });
    startTimeoutRef.current = setTimeout(() => {
      setStarting(false);
      setError(isEn ? 'Opponent did not respond. Try again.' : 'O adversário não respondeu. Tente novamente.');
    }, 10000);
  };

  const renderPlayerCard = (member, isMe) => {
    const profile = isMe
      ? { achievements: unlockedAchievements, guardianId: selectedDeck?.guardianId || null, deckName: selectedDeck?.name || null }
      : (profiles[member.steamId64] || {});
    const guardianCard = profile.guardianId ? cardsPool.find((c) => c.id === profile.guardianId) : null;
    const unlockedBadges = ACHIEVEMENTS.filter((a) => (profile.achievements || []).includes(a.id));

    return (
      <div className="pvp-lobby-player-card" key={member.steamId64}>
        <div className="pvp-lobby-player-header">
          {avatars[member.steamId64] ? (
            <img className="pvp-lobby-player-avatar" src={avatars[member.steamId64]} alt="" />
          ) : (
            <span className="pvp-lobby-member-dot" aria-hidden />
          )}
          <div className="pvp-lobby-player-name-col">
            <p className="pvp-lobby-player-name">{member.name || `Steam ID ${member.steamId64}`}</p>
            {unlockedBadges.length > 0 && (
              <div className="pvp-lobby-player-badges">
                {unlockedBadges.map((a) => (
                  <img
                    key={a.id}
                    src={a.img}
                    alt={a.name?.[isEn ? 'en' : 'pt'] || a.name?.pt}
                    title={a.name?.[isEn ? 'en' : 'pt'] || a.name?.pt}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pvp-lobby-player-guardian">
          {guardianCard ? (
            <div className="pvp-lobby-guardian-art">
              <img
                src={guardianCard.img}
                alt={typeof guardianCard.name === 'object' ? guardianCard.name[isEn ? 'en' : 'pt'] : guardianCard.name}
              />
            </div>
          ) : (
            <p className="pvp-lobby-message" style={{ fontSize: '0.78rem' }}>
              {isMe
                ? (isEn ? 'No deck selected yet' : 'Nenhum baralho selecionado ainda')
                : (isEn ? 'Waiting for opponent’s deck…' : 'Aguardando baralho do adversário…')}
            </p>
          )}
        </div>

        {isMe && (
          deckLocked ? (
            <div className="pvp-lobby-deck-lock-row">
              <span className="pvp-lobby-deck-name-label">{selectedDeck?.name}</span>
              <span className="pvp-lobby-deck-lock-toggle pvp-lobby-deck-lock-toggle-on" aria-hidden>
                <span className="pvp-lobby-deck-lock-knob" />
              </span>
            </div>
          ) : (
            <button type="button" className="pvp-lobby-choose-deck-btn" onClick={handleOpenDeckPicker}>
              {isEn ? 'Choose deck' : 'Escolher baralho'}
            </button>
          )
        )}
      </div>
    );
  };

  return (
    <section className="pvp-lobby">
      <div className="pvp-lobby-vignette" />
      <header className="pvp-lobby-header">
        <p>{isEn ? 'Casual PvP' : 'PvP Casual'}</p>
        <h1>{isEn ? 'Challenge Room' : 'Sala de Desafio'}</h1>
      </header>

      <main className={`pvp-lobby-panel ${lobby ? 'pvp-lobby-panel-room' : ''}`}>
        {steamConnected === null && (
          <p className="pvp-lobby-message">{isEn ? 'Checking Steam connection…' : 'Verificando conexão com a Steam…'}</p>
        )}

        {steamConnected === false && (
          <p className="pvp-lobby-message pvp-lobby-message-warning">
            {isEn
              ? 'Open Steam and sign in to challenge a friend.'
              : 'Abra a Steam e faça login pra desafiar um amigo.'}
          </p>
        )}

        {steamConnected && !lobby && (
          <div className="pvp-lobby-empty">
            <p>
              {isEn
                ? 'Create a room and invite a friend through Steam.'
                : 'Crie uma sala e convide um amigo pela Steam.'}
            </p>
            <button type="button" className="pvp-lobby-primary-btn" onClick={handleCreateLobby} disabled={status === 'creating'}>
              {status === 'creating' ? (isEn ? 'Creating…' : 'Criando…') : (isEn ? 'Create room' : 'Criar sala')}
            </button>
            {status === 'error' && <p className="pvp-lobby-message pvp-lobby-message-warning">{error}</p>}

            <p className="pvp-lobby-message" style={{ marginTop: 18 }}>
              {isEn ? 'Or enter a room code a friend shared with you:' : 'Ou entre com o código de uma sala que um amigo te passou:'}
            </p>
            <div className="pvp-lobby-actions">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder={isEn ? 'Room code' : 'Código da sala'}
                className="pvp-lobby-join-input"
              />
              <button type="button" className="pvp-lobby-primary-btn" onClick={handleJoinByCode} disabled={!joinCode.trim() || joining}>
                {joining ? (isEn ? 'Joining…' : 'Entrando…') : (isEn ? 'Join' : 'Entrar')}
              </button>
            </div>
          </div>
        )}

        {steamConnected && lobby && (
          <div className="pvp-lobby-room">
            <p className="pvp-lobby-room-id">
              {isEn ? 'Room' : 'Sala'} #{lobby.lobbyId}
            </p>

            <div className="pvp-lobby-players">
              {myMember && renderPlayerCard(myMember, true)}
              {opponent ? (
                renderPlayerCard(opponent, false)
              ) : (
                <div className="pvp-lobby-player-card pvp-lobby-player-card-waiting">
                  <p className="pvp-lobby-message pvp-lobby-member-waiting">
                    {isEn ? 'Waiting for opponent…' : 'Esperando adversário…'}
                  </p>
                </div>
              )}
            </div>

            <p className="pvp-lobby-message" style={{ fontSize: '0.82rem', fontWeight: 500 }}>
              {isEn
                ? "The Steam invite below works, but since the game isn't published yet, Steam can't auto-launch it for your friend — they need to already have it open (any screen). If they don't, share the room code above instead."
                : 'O convite da Steam abaixo funciona, mas como o jogo ainda não está publicado, a Steam não consegue abrir ele sozinha do lado do seu amigo — ele precisa já estar com o jogo aberto (qualquer tela). Se não estiver, use o código da sala acima.'}
            </p>
            <div className="pvp-lobby-actions">
              <button type="button" className="pvp-lobby-primary-btn" onClick={handleInvite}>
                {isEn ? 'Invite friend' : 'Convidar amigo'}
              </button>
              {isHostOfLobby ? (
                <button
                  type="button"
                  className="pvp-lobby-primary-btn pvp-lobby-start-btn"
                  onClick={handleStartBattle}
                  disabled={!opponent || starting || !deckLocked}
                  title={
                    !opponent
                      ? (isEn ? 'Waiting for an opponent to join' : 'Esperando um adversário entrar')
                      : !deckLocked
                        ? (isEn ? 'Choose your deck first' : 'Escolha seu baralho primeiro')
                        : undefined
                  }
                >
                  {starting
                    ? (isEn ? 'Starting…' : 'Iniciando…')
                    : (isEn ? 'Start battle' : 'Iniciar partida')}
                </button>
              ) : (
                opponent && (
                  <p className="pvp-lobby-message">
                    {isEn ? 'Waiting for the host to start the battle…' : 'Esperando o anfitrião iniciar a partida…'}
                  </p>
                )
              )}
            </div>
            {error && <p className="pvp-lobby-message pvp-lobby-message-warning">{error}</p>}
          </div>
        )}
      </main>

      <button className="pvp-lobby-back-btn" type="button" onClick={handleLeave}>
        <span aria-hidden>←</span> {isEn ? 'Back to main menu' : 'Voltar ao menu principal'}
      </button>

      <DeckSelectModal visible={deckPickerOpen} onClose={() => setDeckPickerOpen(false)} onSelect={handleDeckPicked} />
    </section>
  );
}
