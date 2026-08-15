import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/pvp-lobby.css';

const pickFirstDeckCards = (decks) => {
  const ids = Object.keys(decks || {});
  if (ids.length === 0) return null;
  const first = decks[ids[0]];
  if (!first || !Array.isArray(first.cards) || first.cards.length === 0) return null;
  return first.cards;
};

export default function PvpLobby({ onBack, onStartBattle }) {
  const { lang = 'ptbr', decks } = useContext(AppContext) || {};
  const isEn = lang?.startsWith('en');

  const [steamConnected, setSteamConnected] = useState(null); // null = ainda verificando
  const [mySteamId64, setMySteamId64] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | creating | error
  const [error, setError] = useState(null);
  const [starting, setStarting] = useState(false); // aguardando o handshake de início de partida
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const startTimeoutRef = useRef(null);

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

  // Handshake de início de partida: anfitrião pede o baralho do convidado, o convidado
  // responde, e então o anfitrião avisa o convidado que pode entrar na tela de batalha.
  useEffect(() => {
    const unsubscribe = window.electron?.ipcRenderer?.onP2PMessage?.(({ fromSteamId64, message }) => {
      if (!message) return;

      if (message.type === 'deck-request') {
        const myDeck = pickFirstDeckCards(decks);
        window.electron?.ipcRenderer?.sendP2PMessage?.(fromSteamId64, {
          type: 'deck-response',
          deck: myDeck || [],
        });
        return;
      }

      if (message.type === 'deck-response') {
        if (startTimeoutRef.current) {
          clearTimeout(startTimeoutRef.current);
          startTimeoutRef.current = null;
        }
        window.electron?.ipcRenderer?.sendP2PMessage?.(fromSteamId64, { type: 'battle-start' });
        onStartBattle?.({ isHost: true, peerSteamId64: fromSteamId64, opponentDeck: message.deck });
        return;
      }

      if (message.type === 'battle-start') {
        onStartBattle?.({ isHost: false, peerSteamId64: fromSteamId64 });
      }
    });

    return () => unsubscribe?.();
  }, [decks, onStartBattle]);

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

  const isHostOfLobby = Boolean(lobby && mySteamId64 && lobby.ownerSteamId64 === mySteamId64);
  const opponent = lobby?.members?.find((m) => m.steamId64 !== mySteamId64) || null;

  const handleStartBattle = () => {
    if (!opponent || starting) return;
    setStarting(true);
    window.electron?.ipcRenderer?.sendP2PMessage?.(opponent.steamId64, { type: 'deck-request' });
    startTimeoutRef.current = setTimeout(() => {
      setStarting(false);
      setError(isEn ? 'Opponent did not respond. Try again.' : 'O adversário não respondeu. Tente novamente.');
    }, 10000);
  };

  return (
    <section className="pvp-lobby">
      <div className="pvp-lobby-vignette" />
      <header className="pvp-lobby-header">
        <p>{isEn ? 'Casual PvP' : 'PvP Casual'}</p>
        <h1>{isEn ? 'Challenge Room' : 'Sala de Desafio'}</h1>
      </header>

      <main className="pvp-lobby-panel">
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
            <ul className="pvp-lobby-members">
              {lobby.members.map((member) => (
                <li key={member.steamId64} className="pvp-lobby-member">
                  <span className="pvp-lobby-member-dot" aria-hidden />
                  {member.name || `Steam ID ${member.steamId64}`}
                </li>
              ))}
              {lobby.members.length < 2 && (
                <li className="pvp-lobby-member pvp-lobby-member-waiting">
                  {isEn ? 'Waiting for opponent…' : 'Esperando adversário…'}
                </li>
              )}
            </ul>
            <p className="pvp-lobby-message" style={{ fontSize: '0.82rem', fontWeight: 500 }}>
              {isEn
                ? "Room code: share this with your friend so they can join with the code above — the Steam invite button below won't correctly launch the game yet, since it isn't published."
                : 'Código da sala: passe pro seu amigo pra ele entrar pelo código acima — o botão de convite da Steam abaixo ainda não abre o jogo certo do lado dele, porque ele não está publicado.'}
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
                  disabled={!opponent || starting}
                  title={!opponent ? (isEn ? 'Waiting for an opponent to join' : 'Esperando um adversário entrar') : undefined}
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
    </section>
  );
}
