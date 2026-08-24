import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { getCalamityCreatures } from '../assets/cards';
import DeckSelectModal from './DeckSelectModal';
import { resolveBaseCardId, getCreatureCardData } from '../utils/calamityCards';
import '../styles/calamity.css';
const GUARDIANS_DATA = require('../assets/guardiansData');

// Resolve os dados (e a arte) do guardião do deck escolhido — mesma lógica do DeckSelectModal.
const getGuardianCardData = (guardianId) => {
  if (!guardianId) return null;
  try {
    const card = require(`../assets/cards/booster1/${guardianId}.js`);
    if (card && card.img) return card;
  } catch (e) {
    // ignore
  }
  try {
    const fallback = GUARDIANS_DATA?.[guardianId];
    if (fallback && fallback.img) return fallback;
  } catch (e) {}
  return null;
};

// Tempo de espera antes de poder enfrentar a mesma calamidade de novo.
const CALAMITY_COOLDOWN_MS = 60 * 60 * 1000;
// Nº de slots de convite ao lado do jogador — sala Steam de até 4 (1 anfitrião + 3 convidados).
const INVITE_SLOT_COUNT = 3;
const CALAMITY_LOBBY_MAX_MEMBERS = INVITE_SLOT_COUNT + 1;

const ELEMENT_LABELS = {
  fogo: { ptbr: 'Fogo', en: 'Fire' },
  agua: { ptbr: 'Água', en: 'Water' },
  terra: { ptbr: 'Terra', en: 'Earth' },
  ar: { ptbr: 'Ar', en: 'Air' },
  puro: { ptbr: 'Puro', en: 'Pure' },
};

const formatCooldown = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

// Decide a calamidade vencedora a partir dos votos de cada jogador na sala.
// Empate = sorteio entre as calamidades mais votadas. Hoje só há 1 votante (Fase 1: solo),
// mas a função já aceita N votos para quando o lobby multiplayer estiver ligado.
const resolveWinningBoss = (votes) => {
  const counts = {};
  Object.values(votes).forEach((bossId) => {
    if (!bossId) return;
    counts[bossId] = (counts[bossId] || 0) + 1;
  });
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  const maxVotes = Math.max(...entries.map(([, c]) => c));
  const tied = entries.filter(([, c]) => c === maxVotes).map(([bossId]) => bossId);
  return tied[Math.floor(Math.random() * tied.length)];
};

// Lobby do modo Calamidade (Fase 1: solo). Escolha de deck + voto na calamidade a enfrentar;
// os 3 slots de convite ficam visíveis para o co-op futuro. Fluxo: escolher deck -> votar em
// uma calamidade -> Pronto (com 1 jogador, o voto já vence sozinho, sem chance de empate).
function CalamityLobby({ onBack, onNavigate, onStartBattle }) {
  const { lang = 'ptbr', calamityCooldowns = {}, setCalamityCooldown, cardCollection = {} } = useContext(AppContext);
  const isEn = lang === 'en';
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null); // { cards, deckId, guardianId, guardianData }
  const [deckError, setDeckError] = useState(null);
  const [myVote, setMyVote] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [steamConnected, setSteamConnected] = useState(null); // null = ainda verificando
  const [mySteamId64, setMySteamId64] = useState(null);
  const [myUsername, setMyUsername] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [avatars, setAvatars] = useState({});
  const [inviteBusy, setInviteBusy] = useState(false);
  const [lobbyError, setLobbyError] = useState(null);

  // Atualiza a contagem regressiva dos chefes em cooldown a cada segundo.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Sala social da Steam (até 4 membros) — mostra nome/avatar reais de quem entrar via convite.
  // A partida em si continua solo (ver plano do modo): isso só reúne o grupo, não sincroniza a luta.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const steamStatus = await window.electron?.ipcRenderer?.getSteamStatus?.();
      if (cancelled) return;
      setSteamConnected(Boolean(steamStatus?.connected));
      setMySteamId64(steamStatus?.steamId64 || null);
      setMyUsername(steamStatus?.username || null);
      if (!steamStatus?.connected) return;
      const existing = await window.electron?.ipcRenderer?.getSteamLobby?.();
      if (!cancelled && existing?.ok) setLobby(existing.lobby);
    })();

    const unsubscribe = window.electron?.ipcRenderer?.onSteamLobbyUpdated?.((updatedLobby) => {
      setLobby(updatedLobby);
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  // Busca as fotos de perfil (a minha e as dos membros da sala — steamworks.js não expõe
  // avatar, só a Web API dá isso).
  useEffect(() => {
    const ids = [...(lobby?.members || []).map((m) => m.steamId64), mySteamId64]
      .filter(Boolean)
      .filter((id) => !avatars[id]);
    if (ids.length === 0) return;
    let cancelled = false;
    window.electron?.ipcRenderer?.getSteamPlayerAvatars?.(ids).then((result) => {
      if (cancelled || !result?.ok) return;
      setAvatars((prev) => ({ ...prev, ...result.avatars }));
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobby?.members, mySteamId64]);

  const otherMembers = (lobby?.members || []).filter((m) => m.steamId64 !== mySteamId64);

  const bosses = getCalamityCreatures();
  const votedBoss = useMemo(() => bosses.find((b) => b.id === myVote) || null, [bosses, myVote]);

  const getRemainingCooldown = (bossId) => {
    const lastAttempt = calamityCooldowns[bossId];
    if (!lastAttempt) return 0;
    return Math.max(0, lastAttempt + CALAMITY_COOLDOWN_MS - now);
  };

  const handleVote = (boss) => {
    if (getRemainingCooldown(boss.id) > 0) return;
    setMyVote((prev) => (prev === boss.id ? null : boss.id));
  };

  const handleDeckSelected = (cards, deckId, guardianId) => {
    setShowDeckModal(false);
    // A Calamidade só aceita decks 100% de criaturas — cartas de campo/efeito ficam de fora
    // do modo (o próprio chefe já entra com a vantagem de campo dele, ver plano de design).
    const hasNonCreatureCard = (cards || []).some((cardId) => {
      const baseId = resolveBaseCardId(cardId, cardCollection);
      const cardData = getCreatureCardData(baseId);
      return !cardData || typeof cardData.type === 'string';
    });
    if (hasNonCreatureCard) {
      setSelectedDeck(null);
      setDeckError(isEn
        ? 'This deck has field/effect cards. Calamity only allows creature-only decks.'
        : 'Esse deck tem cartas de campo ou de efeito. A Calamidade só aceita decks só com criaturas.');
      return;
    }
    setDeckError(null);
    const guardianData = getGuardianCardData(guardianId);
    setSelectedDeck({ cards, deckId, guardianId, guardianImg: guardianData?.img || null });
  };

  const handleInvite = async () => {
    if (!steamConnected || inviteBusy) return;
    setInviteBusy(true);
    setLobbyError(null);
    try {
      let activeLobby = lobby;
      if (!activeLobby) {
        const result = await window.electron?.ipcRenderer?.createSteamLobby?.(CALAMITY_LOBBY_MAX_MEMBERS);
        if (!result?.ok) {
          setLobbyError(result?.error || (isEn ? 'Could not create the room.' : 'Não foi possível criar a sala.'));
          return;
        }
        activeLobby = result.lobby;
        setLobby(activeLobby);
      }
      await window.electron?.ipcRenderer?.inviteToSteamLobby?.();
    } finally {
      setInviteBusy(false);
    }
  };

  const handleBack = async () => {
    if (lobby) await window.electron?.ipcRenderer?.leaveSteamLobby?.();
    onBack?.();
  };

  const handleReady = () => {
    if (!selectedDeck || !myVote) return;
    // Fase 1 (solo): só existe o meu voto — mas já resolve via a mesma função de desempate
    // que vai valer quando o lobby aceitar até 4 jogadores.
    const winningBossId = resolveWinningBoss({ me: myVote });
    if (!winningBossId) return;
    setCalamityCooldown?.(winningBossId);
    onStartBattle({
      bossId: winningBossId,
      deckCards: selectedDeck.cards,
      deckId: selectedDeck.deckId,
      guardianId: selectedDeck.guardianId,
      playerCount: 1,
    });
  };

  return (
    <div className="calamity-lobby" data-element={votedBoss?.element || undefined}>
      <div className="calamity-lobby-header">
        <button className="calamity-back-btn" onClick={handleBack}>
          {isEn ? '← Back' : '← Voltar'}
        </button>
        <div className="calamity-lobby-crest" aria-hidden>✦</div>
        <p className="calamity-lobby-kicker">{isEn ? 'Calamity Mode • Expedition' : 'Modo Calamidade • Expedição'}</p>
        <h1 className="calamity-lobby-title">{isEn ? 'Calamity lobby' : 'Lobby da Calamidade'}</h1>
        <p className="calamity-lobby-sub">
          {isEn
            ? 'Vote for a calamity, pick your deck and hit Ready. Solo today — invite slots are ready for co-op.'
            : 'Vote em uma calamidade, escolha seu deck e clique em Pronto. Solo por enquanto — os slots de convite já estão prontos pro co-op.'}
        </p>
      </div>

      <div className="calamity-preparation-rail" aria-label={isEn ? 'Expedition preparation' : 'Preparação da expedição'}>
        <div className={`calamity-preparation-step${myVote ? ' is-complete' : ' is-active'}`}>
          <span>01</span><strong>{isEn ? 'Choose the threat' : 'Escolha a ameaça'}</strong>
        </div>
        <i aria-hidden />
        <div className={`calamity-preparation-step${selectedDeck ? ' is-complete' : (myVote ? ' is-active' : '')}`}>
          <span>02</span><strong>{isEn ? 'Assemble squad' : 'Monte o esquadrão'}</strong>
        </div>
        <i aria-hidden />
        <div className={`calamity-preparation-step${selectedDeck && myVote ? ' is-active' : ''}`}>
          <span>03</span><strong>{isEn ? 'Begin hunt' : 'Inicie a caçada'}</strong>
        </div>
      </div>

      <div className="calamity-section calamity-section-primary">
        <div className="calamity-section-heading">
          <span className="calamity-section-number">I</span>
          <span className="calamity-section-eyebrow">{isEn ? 'Choose your calamity' : 'Escolha sua calamidade'}</span>
        </div>
        <div className="calamity-boss-grid">
          {bosses.map((boss) => {
            const remaining = getRemainingCooldown(boss.id);
            const onCooldown = remaining > 0;
            const isVoted = myVote === boss.id;
            return (
              <button
                key={boss.id}
                className={`calamity-boss-card calamity-boss-${boss.element}${onCooldown ? ' calamity-boss-card-cooldown' : ''}${isVoted ? ' calamity-boss-card-voted' : ''}`}
                onClick={() => handleVote(boss)}
                disabled={onCooldown}
              >
                {isVoted && <span className="calamity-vote-badge">{isEn ? '✓ Your vote' : '✓ Seu voto'}</span>}
                <img className="calamity-boss-img" src={boss.img} alt={boss.name?.[lang] || boss.name?.pt} />
                <div className="calamity-boss-info">
                  <span className="calamity-boss-element">
                    {ELEMENT_LABELS[boss.element]?.[isEn ? 'en' : 'ptbr'] || boss.element}
                  </span>
                  <strong className="calamity-boss-name">{boss.name?.[lang] || boss.name?.pt}</strong>
                  {onCooldown ? (
                    <span className="calamity-boss-cooldown">
                      {isEn ? 'Ready in' : 'Disponível em'} {formatCooldown(remaining)}
                    </span>
                  ) : (
                    <span className="calamity-boss-hp">
                      {isEn ? 'Boss HP' : 'Vida do chefe'}: {boss.calamity.baseHp}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="calamity-section calamity-section-secondary">
        <div className="calamity-section-heading">
          <span className="calamity-section-number">II</span>
          <span className="calamity-section-eyebrow">{isEn ? 'Your squad' : 'Seu esquadrão'}</span>
        </div>
        <div className="calamity-party-row">
          <div className="calamity-party-slot-me-wrap">
            <button
              className={`calamity-party-slot calamity-party-slot-me${selectedDeck ? ' calamity-party-slot-filled' : ''}`}
              onClick={() => setShowDeckModal(true)}
              style={selectedDeck?.guardianImg ? { backgroundImage: `url(${selectedDeck.guardianImg})` } : undefined}
            >
              {selectedDeck ? (
                <div className="calamity-party-slot-deck-overlay">
                  <strong>{isEn ? 'Your deck' : 'Seu deck'}</strong>
                  <span>{selectedDeck.deckId}</span>
                </div>
              ) : (
                <div className="calamity-party-slot-empty">
                  <span className="calamity-seal" aria-hidden>+</span>
                  <span>{isEn ? 'Choose deck' : 'Escolher deck'}</span>
                </div>
              )}
            </button>
            {steamConnected && mySteamId64 && (
              <div className="calamity-party-slot-steam-caption">
                {avatars[mySteamId64] ? (
                  <img className="calamity-steam-caption-avatar" src={avatars[mySteamId64]} alt="" />
                ) : (
                  <span className="calamity-seal calamity-steam-caption-avatar-fallback" aria-hidden>👤</span>
                )}
                <span className="calamity-steam-caption-name">{myUsername || (isEn ? 'You' : 'Você')}</span>
              </div>
            )}
          </div>
          {Array.from({ length: INVITE_SLOT_COUNT }).map((_, i) => {
            const member = otherMembers[i];
            if (member) {
              return (
                <div
                  key={member.steamId64}
                  className="calamity-party-slot calamity-party-slot-member"
                  style={avatars[member.steamId64] ? { backgroundImage: `url(${avatars[member.steamId64]})` } : undefined}
                >
                  <div className="calamity-party-slot-deck-overlay">
                    {!avatars[member.steamId64] && <span className="calamity-seal" aria-hidden>👤</span>}
                    <strong>{member.name || (isEn ? 'Steam player' : 'Jogador Steam')}</strong>
                  </div>
                </div>
              );
            }
            const disabled = steamConnected === false || inviteBusy;
            const label = steamConnected === false
              ? (isEn ? 'Open Steam to invite' : 'Abra a Steam pra convidar')
              : (isEn ? 'Invite a Steam friend' : 'Convidar amigo pela Steam');
            return (
              <button
                key={`invite-${i}`}
                type="button"
                className="calamity-party-slot calamity-party-slot-invite"
                title={label}
                disabled={disabled}
                onClick={handleInvite}
              >
                <span className="calamity-seal" aria-hidden>+</span>
                <span>{isEn ? 'Invite' : 'Convidar'}</span>
                {steamConnected === false && (
                  <span className="calamity-party-slot-soon">{isEn ? 'Steam offline' : 'Steam offline'}</span>
                )}
              </button>
            );
          })}
        </div>
        {lobbyError && <p className="calamity-deck-error">{lobbyError}</p>}
        {deckError && <p className="calamity-deck-error">{deckError}</p>}
      </div>

      <button
        className="calamity-btn calamity-btn-primary calamity-ready-btn"
        disabled={!selectedDeck || !myVote}
        onClick={handleReady}
      >
        <span className="calamity-ready-icon" aria-hidden>⚔</span>
        {isEn ? 'Ready for the hunt' : 'Pronto para a caçada'}
        {votedBoss ? ` — ${votedBoss.name?.[lang] || votedBoss.name?.pt}` : ''}
      </button>

      <DeckSelectModal
        visible={showDeckModal}
        deckType="calamity"
        onClose={() => setShowDeckModal(false)}
        onSelect={handleDeckSelected}
        onCreateDeck={onNavigate ? () => {
          setShowDeckModal(false);
          onNavigate('deck');
        } : undefined}
      />
    </div>
  );
}

export default CalamityLobby;
