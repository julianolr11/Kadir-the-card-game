import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/pvp-lobby.css';

export default function PvpLobby({ onBack }) {
  const { lang = 'ptbr' } = useContext(AppContext) || {};
  const isEn = lang?.startsWith('en');

  const [steamConnected, setSteamConnected] = useState(null); // null = ainda verificando
  const [lobby, setLobby] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | creating | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const steamStatus = await window.electron?.ipcRenderer?.getSteamStatus?.();
      if (cancelled) return;
      setSteamConnected(Boolean(steamStatus?.connected));
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

  const handleLeave = async () => {
    await window.electron?.ipcRenderer?.leaveSteamLobby?.();
    setLobby(null);
    onBack?.();
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
            <div className="pvp-lobby-actions">
              <button type="button" className="pvp-lobby-primary-btn" onClick={handleInvite}>
                {isEn ? 'Invite friend' : 'Convidar amigo'}
              </button>
              <button
                type="button"
                className="pvp-lobby-primary-btn pvp-lobby-start-btn"
                disabled
                title={isEn ? 'Battle sync coming soon' : 'Sincronização de batalha ainda não implementada'}
              >
                {isEn ? 'Start battle (soon)' : 'Iniciar partida (em breve)'}
              </button>
            </div>
          </div>
        )}
      </main>

      <button className="pvp-lobby-back-btn" type="button" onClick={handleLeave}>
        <span aria-hidden>←</span> {isEn ? 'Back to main menu' : 'Voltar ao menu principal'}
      </button>
    </section>
  );
}
