import React, { useContext, useEffect, useRef, useState } from 'react';
import { AppContext } from '../context/AppContext';
import cardsPool from '../assets/cards';
import DeckSelectModal from './DeckSelectModal';
import { ACHIEVEMENTS } from '../assets/achievementsData';
import { CAMPAIGN_TOWER_TYPES, CAMPAIGN_TOTAL_LEVELS, getCampaignProgress } from './CampaignTower';
import '../styles/pvp-lobby.css';

const LEVELS_PER_TOWER = CAMPAIGN_TOTAL_LEVELS / CAMPAIGN_TOWER_TYPES.length;

const pickFirstDeckEntry = (decks) => {
  const ids = Object.keys(decks || {}).filter((id) => (decks[id]?.deckType || 'standard') === 'standard');
  if (ids.length === 0) return null;
  const id = ids[0];
  const deck = decks[id];
  if (!deck || !Array.isArray(deck.cards) || deck.cards.filter(Boolean).length === 0) return null;
  return { id, deck };
};

// Insígnias das torres do modo campanha desbloqueadas até um dado progresso (mesma fórmula
// usada em AchievementsRoom.jsx: progresso >= (índice_da_torre + 1) * níveis_por_torre).
const unlockedTowerBadges = (campaignProgress) => CAMPAIGN_TOWER_TYPES.filter(
  (tower, idx) => (campaignProgress || 0) >= (idx + 1) * LEVELS_PER_TOWER,
);

const SWIPE_TRACK_WIDTH = 156;
const SWIPE_KNOB_SIZE = 32;
const SWIPE_KNOB_INSET = 3;
const SWIPE_MAX_X = SWIPE_TRACK_WIDTH - SWIPE_KNOB_SIZE - SWIPE_KNOB_INSET * 2;
// Zona de texto: começa depois de onde o botão fica em repouso, pra nunca ficar por baixo dele.
const SWIPE_LABEL_START = SWIPE_KNOB_INSET * 2 + SWIPE_KNOB_SIZE;

const LockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <path
      d="M8 11V8a4 4 0 0 1 8 0v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <rect x="5" y="11" width="14" height="9.5" rx="2.5" fill="currentColor" />
    <circle cx="12" cy="15.3" r="1.3" fill="#2c1e0c" />
  </svg>
);

// Toggle "travar baralho": clica pra confirmar o baralho escolhido — o botão desliza até o
// fim da trilha com uma animação de mola e não pode mais ser destravado por aqui.
function DeckLockToggle({ locked, onLock, label }) {
  const [justLocked, setJustLocked] = useState(false);

  const handleClick = () => {
    if (locked) return;
    setJustLocked(true);
    onLock();
  };

  return (
    <button
      type="button"
      className={[
        'pvp-lobby-swipe-track',
        locked && 'pvp-lobby-swipe-track-locked',
        justLocked && 'pvp-lobby-swipe-track-pop',
      ].filter(Boolean).join(' ')}
      onClick={handleClick}
      onAnimationEnd={() => setJustLocked(false)}
      disabled={locked}
    >
      <div
        className="pvp-lobby-swipe-fill"
        style={{ width: locked ? '100%' : `${SWIPE_KNOB_INSET + SWIPE_KNOB_SIZE}px` }}
      />
      <span
        className="pvp-lobby-swipe-label"
        style={{ left: `${SWIPE_LABEL_START}px`, opacity: locked ? 0 : 1 }}
      >
        {label}
      </span>
      <div
        className="pvp-lobby-swipe-knob"
        style={{ transform: `translateX(${locked ? SWIPE_MAX_X : 0}px)` }}
      >
        <span className={`pvp-lobby-swipe-knob-icon ${locked ? 'pvp-lobby-swipe-knob-icon-locked' : ''}`}>
          {locked ? <LockIcon /> : '›'}
        </span>
      </div>
    </button>
  );
}

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
  const [profiles, setProfiles] = useState({}); // steamId64 -> { achievements, guardianId, deckName, campaignProgress }
  const [campaignProgress, setCampaignProgress] = useState(getCampaignProgress);
  const startTimeoutRef = useRef(null);

  const selectedDeck = selectedDeckId ? decks?.[selectedDeckId] : null;

  // Progresso da campanha (insígnias das torres) fica só no localStorage, não no AppContext —
  // mesmo esquema de leitura usado em AchievementsRoom.jsx.
  useEffect(() => {
    const refresh = () => setCampaignProgress(getCampaignProgress());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

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
      campaignProgress,
      guardianId: selectedDeck?.guardianId || null,
      deckName: selectedDeck?.name || null,
    });
  }, [lobby, mySteamId64, selectedDeck, unlockedAchievements, campaignProgress]);

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
            campaignProgress: message.campaignProgress || 0,
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
    setDeckPickerOpen(false);
  };

  const handleLockDeck = () => setDeckLocked(true);

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
      ? {
        achievements: unlockedAchievements,
        campaignProgress,
        guardianId: selectedDeck?.guardianId || null,
        deckName: selectedDeck?.name || null,
      }
      : (profiles[member.steamId64] || {});
    const guardianCard = profile.guardianId ? cardsPool.find((c) => c.id === profile.guardianId) : null;
    const milestoneBadges = ACHIEVEMENTS.filter((a) => (profile.achievements || []).includes(a.id))
      .map((a) => ({ id: a.id, img: a.img, label: a.name?.[isEn ? 'en' : 'pt'] || a.name?.pt }));
    const towerBadges = unlockedTowerBadges(profile.campaignProgress).map((t) => ({
      id: `tower-${t.key}`, img: t.badge, label: t.label,
    }));
    const badges = [...towerBadges, ...milestoneBadges];

    return (
      <div className={`pvp-lobby-player-card${isMe ? ' pvp-lobby-player-card-me' : ' pvp-lobby-player-card-rival'}`} key={member.steamId64}>
        <span className="pvp-lobby-player-role">{isMe ? (isEn ? 'Your champion' : 'Seu campeão') : (isEn ? 'Challenger' : 'Desafiante')}</span>
        <div className="pvp-lobby-player-header">
          {avatars[member.steamId64] ? (
            <img className="pvp-lobby-player-avatar" src={avatars[member.steamId64]} alt="" />
          ) : (
            <span className="pvp-lobby-member-dot" aria-hidden />
          )}
          <div className="pvp-lobby-player-name-col">
            <p className="pvp-lobby-player-name">{member.name || `Steam ID ${member.steamId64}`}</p>
            {badges.length > 0 && (
              <div className="pvp-lobby-player-badges">
                {badges.map((b) => (
                  <img key={b.id} src={b.img} alt={b.label} title={b.label} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="pvp-lobby-player-guardian"
          onClick={isMe && !deckLocked ? handleOpenDeckPicker : undefined}
          style={isMe && !deckLocked ? { cursor: 'pointer' } : undefined}
        >
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
          guardianCard ? (
            <div className="pvp-lobby-deck-lock-row">
              <span className="pvp-lobby-deck-name-label">{selectedDeck?.name}</span>
              <DeckLockToggle
                locked={deckLocked}
                onLock={handleLockDeck}
                label={isEn ? 'Lock deck' : 'Travar baralho'}
              />
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
        <div className="pvp-lobby-header-crest" aria-hidden>⚔</div>
        <p>{isEn ? 'Casual PvP • Steam' : 'PvP Casual • Steam'}</p>
        <h1>{isEn ? 'Challenge Room' : 'Sala de Desafio'}</h1>
        <span>{isEn ? 'Choose your guardian. Face another Kadir.' : 'Escolha seu guardião. Enfrente outro Kadir.'}</span>
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
            <div className="pvp-lobby-empty-seal" aria-hidden>◆</div>
            <h2>{isEn ? 'Open a challenge' : 'Abra um desafio'}</h2>
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
              <span className="pvp-lobby-live-dot" aria-hidden />
              {isEn ? 'Room' : 'Sala'} #{lobby.lobbyId}
            </p>

            <div className="pvp-lobby-players">
              {myMember && renderPlayerCard(myMember, true)}
              <div className="pvp-lobby-versus" aria-hidden><span>VS</span></div>
              {opponent ? (
                renderPlayerCard(opponent, false)
              ) : (
                <div className="pvp-lobby-player-card pvp-lobby-player-card-waiting">
                  <span className="pvp-lobby-player-role">{isEn ? 'Open seat' : 'Vaga aberta'}</span>
                  <div className="pvp-lobby-waiting-sigil" aria-hidden>◇</div>
                  <p className="pvp-lobby-message pvp-lobby-member-waiting">
                    {isEn ? 'Waiting for opponent…' : 'Esperando adversário…'}
                  </p>
                </div>
              )}
            </div>

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
            <p className="pvp-lobby-room-hint">
              {opponent
                ? (deckLocked
                  ? (isEn ? 'Your deck is sealed. The duel may begin.' : 'Seu baralho está selado. O duelo pode começar.')
                  : (isEn ? 'Seal your deck to become battle-ready.' : 'Sele seu baralho para ficar pronto para a batalha.'))
                : (isEn ? 'Share the room code or invite a friend through Steam.' : 'Compartilhe o código da sala ou convide um amigo pela Steam.')}
            </p>
            {error && <p className="pvp-lobby-message pvp-lobby-message-warning">{error}</p>}
          </div>
        )}
      </main>

      <button className="pvp-lobby-back-btn" type="button" onClick={handleLeave}>
        <span aria-hidden>←</span> {isEn ? 'Back to main menu' : 'Voltar ao menu principal'}
      </button>

      <DeckSelectModal visible={deckPickerOpen} deckType="standard" onClose={() => setDeckPickerOpen(false)} onSelect={handleDeckPicked} />
    </section>
  );
}
