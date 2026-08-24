import React, { useContext, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AppContext } from '../context/AppContext';
import '../styles/battle-result.css';
import levelIcon from '../assets/img/icons/lvlicon.png';
import CreatureCardPreview from './CreatureCardPreview.jsx';
import { FullArtCard } from './KadirFullArtPreview.jsx';
import swordIcon from '../assets/img/icons/sword.png';
import coinIcon from '../assets/img/icons/head.png';
import calamityBoosterImg from '../assets/img/card/calamity_booster.png';
import creaturesPool from '../assets/cards';

// Calamidade dá mais XP de carta que uma partida normal (ver plano de design do modo).
const CALAMITY_XP_MULTIPLIER = 2;

export default function BattleResultModal({ gameResult, killFeed, playerDeck, onClose, battleStats, mode, calamityPlayerCount }) {
  const { cardCollection, updateCardInstanceXp, setBoosters, boosters, addCalamityBoosters, addCoins, loadGuardianLoadout, lang = 'ptbr' } = useContext(AppContext);
  const isEn = lang?.startsWith('en');

  const isPlayerWon = gameResult?.winner === 'player';
  const isCalamity = mode === 'calamity';
  const calamityBoostersEarned = Math.max(1, Number(calamityPlayerCount) || 1);
  const playerCards = Array.isArray(playerDeck) ? playerDeck : [];
  const [expandedCards, setExpandedCards] = useState({});

  // Partida cancelada por 3 timeouts seguidos de alguém (ver plano do cronômetro de turno):
  // no coop ninguém vence nem perde (gameResult.winner fica null) e ninguém recebe nada; no PvP
  // quem continuou jogando já é declarado vencedor e ganha só uma compensação fixa, sem o bônus
  // por abates - o adversário AFK não recebe nada.
  const isAfkAbandon = gameResult?.abandonReason === 'afk-timeout';
  const isMutualAbandon = isAfkAbandon && !gameResult?.winner;
  const isAbandonWinner = isAfkAbandon && !isMutualAbandon && isPlayerWon;
  const isAbandonLoser = isAfkAbandon && !isMutualAbandon && !isPlayerWon;

  // Valores de moedas por resultado (ajustados)
  const COINS_DEFEAT = 20;
  const COINS_VICTORY_BASE = 50;
  const COIN_PER_KILL = 5;
  const COINS_AFK_COMPENSATION = 30;

  // Conta quantos abates o jogador efetuou nesta batalha.
  const playerKills = (battleStats && battleStats.player && Array.isArray(battleStats.player.cardsKilled))
    ? battleStats.player.cardsKilled.length
    : (killFeed ? killFeed.filter(k => battleStats?.player?.cardsSummoned?.includes(k.attacker)).length : 0);

  const coinsEarned = isMutualAbandon || isAbandonLoser
    ? 0
    : isAbandonWinner
      ? COINS_AFK_COMPENSATION
      : (isPlayerWon ? (COINS_VICTORY_BASE + COIN_PER_KILL * playerKills) : COINS_DEFEAT);

  // Award moedas quando o modal monta (apenas uma vez)
  useEffect(() => {
    if (addCoins && coinsEarned > 0) {
      addCoins(coinsEarned);
    }
  }, []); // executa apenas ao montar

  // Função para calcular XP necessário por nível (mesma do AppContext)
  const getXpForLevel = (level) => {
    const baseXp = 100;
    const multiplier = 1.5;
    return Math.floor(baseXp * Math.pow(multiplier, level));
  };

  // Calcula XP total que será distribuído
  const calculateTotalXp = () => {
    if (isAfkAbandon) return 0; // partida cancelada não conta como jogada completa
    if (!battleStats?.player) return 0;

    const allParticipants = new Set([
      ...battleStats.player.cardsDrawn,
      ...battleStats.player.cardsSummoned,
      ...battleStats.player.cardsKilled,
      ...battleStats.player.cardsAssisted,
      ...(battleStats.player.cardsAttacked || []),
    ]);

    let total = 0;
    allParticipants.forEach(cardId => {
      let baseId = cardId;
      if (cardId.includes('-')) {
        for (const [base, instances] of Object.entries(cardCollection)) {
          if (instances.find(inst => inst.instanceId === cardId)) {
            baseId = base;
            break;
          }
        }
      }

      // Filtrar cartas de campo e efeito (não ganham XP)
      if (baseId.match(/^F\d+$/i) || baseId.toLowerCase().startsWith('field_') || baseId.toLowerCase().startsWith('effect_')) {
        return;
      }

      const instances = cardCollection[baseId] || [];
      const instance = instances.find(inst => inst.instanceId === cardId) || instances[0];

      if (instance) {
        total += calculateCardXp(cardId, instance.level, baseId);
      }
    });

    return total;
  };

  // Multiplicadores de XP
  const XP_BASE = 10; // XP base
  const XP_MULTIPLIERS = {
    kill: 1.0,      // 1x para abater
    killAdvantage: 0.2, // +0.2x adicional se abateu com vantagem de elemento
    assist: 0.5,    // 0.5x para assistência
    summon: 0.3,    // 0.3x para invocar
    attack: 0.15,   // 0.15x por ataque à calamidade (modo Calamity só - ver cardsAttacked)
    victory: 0.5,   // +0.5x adicional por vitória
    defeat: 0.1,    // +0.1x adicional por derrota
  };

  // Bônus percentual de XP por abate concedido por perks de guardião (GUARDIAN_KILL_XP_BONUS, KILL_XP_BONUS_10)
  const getGuardianKillXpBonus = (baseId) => {
    const cardData = creaturesPool.find(c => c.id === baseId);
    if (!cardData?.isGuardian) return 0;

    const loadout = loadGuardianLoadout ? loadGuardianLoadout(baseId) : null;
    let perkId = loadout?.selectedPerk || null;

    if (!perkId) {
      const instances = cardCollection?.[baseId] || [];
      const maxLevel = instances.length > 0 ? Math.max(...instances.map(i => i.level || 0)) : 0;
      const unlockedPerks = (cardData.unlockTable || []).filter(
        u => u.type === 'perk' && typeof u.level === 'number' && u.level <= maxLevel
      );
      perkId = unlockedPerks[0]?.id || null;
    }

    if (perkId === 'GUARDIAN_KILL_XP_BONUS') return 0.03;
    if (perkId === 'KILL_XP_BONUS_10') return 0.10;
    return 0;
  };

  // Calcula XP baseado nas ações da carta
  const calculateCardXp = (cardId, cardLevel = 0, baseId = cardId) => {
    if (!battleStats?.player) return 0;

    const stats = battleStats.player;
    let totalXp = 0;

    // Conta quantas vezes cada ação foi feita
    const kills = stats.cardsKilled.filter(id => id === cardId).length;
    const assists = stats.cardsAssisted.filter(id => id === cardId).length;
    const summons = stats.cardsSummoned.filter(id => id === cardId).length;
    const attacks = (stats.cardsAttacked || []).filter(id => id === cardId).length;

    // Conta kills com vantagem de elemento
    const killsWithAdvantage = (killFeed || []).filter(
      k => k.attackerId === cardId && k.hadAdvantage
    ).length;

    // Bônus de XP por abate concedido pelo perk ativo do guardião
    const killXpBonus = getGuardianKillXpBonus(baseId);

    // Calcula XP total
    totalXp += kills * XP_BASE * XP_MULTIPLIERS.kill * (1 + killXpBonus);
    totalXp += killsWithAdvantage * XP_BASE * XP_MULTIPLIERS.killAdvantage * (1 + killXpBonus); // Bônus por vantagem
    totalXp += assists * XP_BASE * XP_MULTIPLIERS.assist;
    totalXp += summons * XP_BASE * XP_MULTIPLIERS.summon;
    totalXp += attacks * XP_BASE * XP_MULTIPLIERS.attack;

    // Bônus por resultado da batalha (aplicado a todas as cartas que participaram)
    if (isPlayerWon) {
      totalXp += XP_BASE * XP_MULTIPLIERS.victory;
    } else {
      totalXp += XP_BASE * XP_MULTIPLIERS.defeat;
    }

    // Bônus de XP por nível: +10% por nível acima de 0
    // Nível 0: 100% XP
    // Nível 1: 110% XP
    // Nível 5: 150% XP
    // Nível 10: 200% XP
    const levelBonus = 1 + (cardLevel * 0.1);
    totalXp *= levelBonus;

    if (isCalamity) {
      totalXp *= CALAMITY_XP_MULTIPLIER;
    }

    return Math.floor(totalXp);
  };

  // Distribui XP entre cartas que participaram
  const awardXpToCards = () => {
    if (isAfkAbandon) return; // partida cancelada não distribui XP
    if (!battleStats?.player) return; // Só precisa checar se tem stats

    // Pega todas as cartas que participaram (união de todas as ações)
    const allParticipants = new Set([
      ...battleStats.player.cardsDrawn,
      ...battleStats.player.cardsSummoned,
      ...battleStats.player.cardsKilled,
      ...battleStats.player.cardsAssisted,
      ...(battleStats.player.cardsAttacked || []),
    ]);

    allParticipants.forEach(cardId => {
      // Extrai baseId se for instanceId
      let baseId = cardId;
      if (cardId.includes('-')) {
        for (const [base, instances] of Object.entries(cardCollection)) {
          if (instances.find(inst => inst.instanceId === cardId)) {
            baseId = base;
            break;
          }
        }
      }

      // Filtrar cartas de campo e efeito (não ganham XP)
      if (baseId.match(/^F\d+$/i) || baseId.toLowerCase().startsWith('field_') || baseId.toLowerCase().startsWith('effect_')) {
        return;
      }

      // Encontra a instância correta
      const instances = cardCollection[baseId] || [];
      const instance = instances.find(inst => inst.instanceId === cardId) || instances[0];

      if (instance) {
        const xp = calculateCardXp(cardId, instance.level, baseId);
        if (xp > 0) {
          updateCardInstanceXp(baseId, instance.instanceId, xp);
        }
      }
    });
  };

  // Pega informações das cartas antes de distribuir XP (para mostrar level up)
  const getCardProgressData = () => {
    if (!battleStats?.player) return [];

    // Todas as cartas que participaram de qualquer ação
    const allParticipants = new Set([
      ...battleStats.player.cardsDrawn,
      ...battleStats.player.cardsSummoned,
      ...battleStats.player.cardsKilled,
      ...battleStats.player.cardsAssisted,
      ...(battleStats.player.cardsAttacked || []),
    ]);

    const progressData = [];

    allParticipants.forEach(cardId => {
      let baseId = cardId;
      if (cardId.includes('-')) {
        for (const [base, instances] of Object.entries(cardCollection)) {
          if (instances.find(inst => inst.instanceId === cardId)) {
            baseId = base;
            break;
          }
        }
      }

      // Filtrar cartas de campo e efeito (não ganham XP)
      if (baseId.match(/^F\d+$/i) || baseId.toLowerCase().startsWith('field_') || baseId.toLowerCase().startsWith('effect_')) {
        return; // Pula cartas de campo e efeito
      }

      const instances = cardCollection[baseId] || [];
      const instance = instances.find(inst => inst.instanceId === cardId) || instances[0];

      if (instance) {
        const xpGain = calculateCardXp(cardId, instance.level, baseId);
        const oldLevel = instance.level;
        const oldXp = instance.xp;

        // Simula o level up para ver se vai subir de nível
        let newLevel = oldLevel;
        let newXp = oldXp + xpGain;

        while (newLevel < 10) {
          const xpNeeded = getXpForLevel(newLevel);
          if (newXp >= xpNeeded) {
            newLevel += 1;
            newXp -= xpNeeded;
          } else {
            break;
          }
        }

        if (newLevel >= 10) {
          newXp = 0;
        }

        const xpNeededForCurrentLevel = getXpForLevel(newLevel);
        const progressPercent = newLevel >= 10 ? 100 : (newXp / xpNeededForCurrentLevel) * 100;
        const didLevelUp = newLevel > oldLevel;

        // Busca dados da carta no creaturesPool
        const cardData = creaturesPool.find(c => c.id === baseId);

        // Monta breakdown de XP
        const stats = battleStats.player;
        const kills = stats.cardsKilled.filter(id => id === cardId).length;
        const assists = stats.cardsAssisted.filter(id => id === cardId).length;
        const summons = stats.cardsSummoned.filter(id => id === cardId).length;
        const attacks = (stats.cardsAttacked || []).filter(id => id === cardId).length;
        const killsWithAdvantage = (killFeed || []).filter(
          k => k.attackerId === cardId && k.hadAdvantage
        ).length;

        const breakdown = [];
        if (kills > 0) {
          breakdown.push({ label: isEn ? `${kills} kill${kills > 1 ? 's' : ''}` : `${kills} abate${kills > 1 ? 's' : ''}`, xp: kills * XP_BASE * XP_MULTIPLIERS.kill });
        }
        if (killsWithAdvantage > 0) {
          breakdown.push({
            label: isEn
              ? `${killsWithAdvantage} kill${killsWithAdvantage > 1 ? 's' : ''} with advantage`
              : `${killsWithAdvantage} abate${killsWithAdvantage > 1 ? 's' : ''} com vantagem`,
            xp: killsWithAdvantage * XP_BASE * XP_MULTIPLIERS.killAdvantage,
          });
        }
        if (assists > 0) {
          breakdown.push({ label: isEn ? `${assists} assist${assists > 1 ? 's' : ''}` : `${assists} assistência${assists > 1 ? 's' : ''}`, xp: assists * XP_BASE * XP_MULTIPLIERS.assist });
        }
        if (summons > 0) {
          breakdown.push({ label: isEn ? 'Summon' : 'Invocação', xp: summons * XP_BASE * XP_MULTIPLIERS.summon });
        }
        if (attacks > 0) {
          breakdown.push({ label: isEn ? `${attacks} attack${attacks > 1 ? 's' : ''} on the calamity` : `${attacks} ataque${attacks > 1 ? 's' : ''} à calamidade`, xp: attacks * XP_BASE * XP_MULTIPLIERS.attack });
        }
        if (isPlayerWon) {
          breakdown.push({ label: isEn ? 'Victory' : 'Vitória', xp: XP_BASE * XP_MULTIPLIERS.victory });
        } else {
          breakdown.push({ label: isEn ? 'Defeat' : 'Derrota', xp: XP_BASE * XP_MULTIPLIERS.defeat });
        }

        // Aplicar bônus de nível após somar tudo
        const baseXpTotal = breakdown.reduce((sum, item) => sum + item.xp, 0);
        const levelBonus = 1 + (oldLevel * 0.1);
        const finalXpGain = Math.floor(baseXpTotal * levelBonus * (isCalamity ? CALAMITY_XP_MULTIPLIER : 1));

        // Seleciona imagem com fallback
        let imagePath = '';
        if (cardData?.img) {
          imagePath = cardData.img;
        } else {
          try {
            imagePath = require(`../assets/img/creatures/${baseId}_bio.webp`);
          } catch (_) {
            try {
              imagePath = require(`../assets/img/card/${baseId}.png`);
            } catch (_) {
              imagePath = '';
            }
          }
        }

        progressData.push({
          cardId: baseId,
          instanceId: instance.instanceId,
          isHolo: Boolean(instance.isHolo),
          isFullArt: Boolean(instance.isFullArt),
          isAltArt: Boolean(instance.isAltArt),
          name: (cardData?.name && (isEn ? (cardData.name.en || cardData.name.pt) : (cardData.name.pt || cardData.name.en)) || cardData.name) || baseId,
          image: imagePath,
          xpGained: finalXpGain,
          oldLevel,
          newLevel,
          newXp,
          xpNeededForCurrentLevel,
          progressPercent,
          didLevelUp,
          breakdown,
        });
      }
    });

    return progressData;
  };

  const toggleCardExpanded = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const cardProgressData = getCardProgressData();

  const handleContinue = () => {
    awardXpToCards();

    if (isPlayerWon && !isAfkAbandon) {
      if (isCalamity) {
        // Calamidade dá Calamity Boosters em vez do booster padrão — 1 por jogador participante.
        addCalamityBoosters?.(calamityBoostersEarned);
      } else {
        // Adiciona 1 booster por vitória
        setBoosters(boosters + 1);
      }
    }

    onClose();
  };

  // Calcula o XP total ganho
  const totalXpGained = calculateTotalXp();

  return ReactDOM.createPortal(
    <div className="battle-result-overlay">
      <div className="battle-result-modal">
        <div className="battle-result-scroll-content">
        {/* Cabeçalho com resultado */}
        <div className={`battle-result-header ${isMutualAbandon ? 'neutral' : (isPlayerWon ? 'victory' : 'defeat')}`}>
          <div className="battle-result-emblem" aria-hidden="true">{isMutualAbandon ? '⏱' : (isPlayerWon ? '♛' : '⚔')}</div>
          <div className="battle-result-heading-copy">
            <span className="battle-result-eyebrow">{isEn ? 'Battle result' : 'Resultado da batalha'}</span>
            <h1 className="battle-result-title">
              {isMutualAbandon
                ? (isEn ? 'Match cancelled' : 'Partida cancelada')
                : (isPlayerWon ? (isEn ? 'Victory' : 'Vitória') : (isEn ? 'Defeat' : 'Derrota'))}
            </h1>
            <p className="battle-result-subtitle">
              {isMutualAbandon
                ? (isEn ? 'Someone was away too long, so the match was called off — no rewards, no penalties.' : 'Alguém ficou ausente por tempo demais e a partida foi encerrada — sem recompensas nem penalidades.')
                : isAbandonWinner
                  ? (isEn ? 'Your opponent didn\'t act in time. You win by forfeit and get a coin compensation.' : 'Seu oponente não agiu a tempo. Você venceu por desistência e recebeu uma compensação em moedas.')
                  : isAbandonLoser
                    ? (isEn ? 'You didn\'t act in time too many turns in a row, so the match was forfeited.' : 'Você não agiu a tempo em turnos demais seguidos, então a partida foi dada como perdida.')
                    : isPlayerWon
                      ? (isEn ? 'The field belongs to you.' : 'O campo pertence a você.')
                      : (isEn ? 'The battle is over, but the war goes on.' : 'A batalha terminou, mas a guerra continua.')}
            </p>
          </div>
        </div>

        <div className="battle-result-section-heading">
          <span>{isEn ? 'Summary' : 'Resumo'}</span><i />
        </div>

        {/* Estatísticas */}
        <div className="battle-result-stats-container">
          <div className="battle-result-stats">
            <div className="stat-block">
              <div className="stat-label">{isEn ? 'Enemies Defeated' : 'Inimigos Derrotados'}</div>
              <div className="stat-value">{killFeed?.length || 0}</div>
            </div>
            <div className="stat-block">
              <div className="stat-label">{isEn ? 'Total Experience' : 'Experiência total'}</div>
              <div className="stat-value">+{totalXpGained}<small> XP</small></div>
            </div>
          </div>

          {/* Painel de Recompensas */}
          <div className="battle-result-rewards">
            {/* Moedas */}
            <div className="battle-result-coins-panel">
              <img src={coinIcon} alt={isEn ? 'Coins' : 'Moedas'} className="battle-result-coin-img" />
              <span className="battle-result-coins-label">
                +{coinsEarned} {isEn ? 'coins' : 'moedas'}
              </span>
            </div>

            {/* Booster (apenas vitória) */}
            {isPlayerWon && !isAfkAbandon && isCalamity && (
              <div className="battle-result-booster-panel">
                <img src={calamityBoosterImg} alt={isEn ? 'Calamity Booster earned' : 'Booster de Calamidade adquirido'} className="battle-result-booster-img" />
                <span className="battle-result-booster-label">
                  <small>{isEn ? 'Calamity reward' : 'Recompensa de Calamidade'}</small>
                  {calamityBoostersEarned} {isEn ? 'Calamity Booster' : 'Booster de Calamidade'}{calamityBoostersEarned > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {isPlayerWon && !isAfkAbandon && !isCalamity && (
              <div className="battle-result-booster-panel">
                <img src={require('../assets/img/card/booster.png')} alt={isEn ? 'Booster earned' : 'Booster adquirido'} className="battle-result-booster-img" />
                <span className="battle-result-booster-label"><small>{isEn ? 'Special reward' : 'Recompensa especial'}</small>1 booster</span>
              </div>
            )}
          </div>
        </div>

        {/* Kill Feed */}
        {killFeed && killFeed.length > 0 && (
          <div className="battle-result-kills-feed-grid">
            <div className="battle-result-section-heading">
              <span>{isEn ? 'Eliminations' : 'Eliminações'}</span><i /><b>{killFeed.length}</b>
            </div>
            <div className="kills-grid">
              {killFeed.map((kill, idx) => {
                // kill.attacker/kill.target podem ser um id de criatura, um nome de exibição já
                // resolvido, ou (em alguns fluxos) um instanceId tipo "arigus-1700000000-42".
                // Tenta casar direto, depois pelo baseId (antes do primeiro "-"), e só then cai
                // pro texto cru - assim nunca mostra o instanceId inteiro na tela.
                const resolveCreatureData = (value) => {
                  if (!value) return null;
                  const lower = value.toLowerCase();
                  const baseId = lower.split('-')[0];
                  return creaturesPool.find(c => c.id === value || c.id === lower || c.id === baseId) || null;
                };
                const displayName = (data, rawValue) => {
                  if (data) return (isEn ? data.name?.en : data.name?.pt) || data.name?.pt || rawValue;
                  // Sem match no pool (ex: carta de efeito): usa o baseId, não o instanceId inteiro
                  const baseId = String(rawValue).toLowerCase().split('-')[0];
                  return baseId.charAt(0).toUpperCase() + baseId.slice(1);
                };
                const attackerData = resolveCreatureData(kill.attacker);
                const targetData = resolveCreatureData(kill.target);
                const isUserCard = battleStats?.player?.cardsSummoned?.includes(kill.attacker);
                return (
                  <div key={idx} className={`kills-grid-cell ${isUserCard ? 'user' : 'opponent'}`} style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="kills-grid-turn">{isEn ? 'Turn' : 'Turno'} {kill.turn}</div>
                    <div className="kills-grid-content">
                      <div className="kills-grid-attacker">
                        <span className="kills-grid-name">{displayName(attackerData, kill.attacker)}</span>
                        {attackerData?.element && <img alt={attackerData.element} src={require(`../assets/img/elements/${attackerData.element}.png`)} className="kills-grid-element" />}
                      </div>
                      <div className="kills-grid-vs">{isEn ? 'defeated' : 'eliminou'}</div>
                      <div className="kills-grid-target">
                        <span className="kills-grid-name">{displayName(targetData, kill.target)}</span>
                        {targetData?.element && <img alt={targetData.element} src={require(`../assets/img/elements/${targetData.element}.png`)} className="kills-grid-element" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* XP por Carta */}
        <div className="battle-result-xp-cards">
          <div className="battle-result-section-heading">
            <span>{isEn ? 'Squad progression' : 'Progressão do esquadrão'}</span><i /><b>+{totalXpGained} XP</b>
          </div>
          {cardProgressData.length > 0 ? (
            <div className="xp-cards-list">
              {cardProgressData.map((card, idx) => {
                const creatureData = creaturesPool.find(c => c.id === card.cardId);
                if (!creatureData) {
                  console.warn(`Carta não encontrada no pool: ${card.cardId}`);
                  return null;
                }
                return (
                  <div key={idx} className="xp-card-item xp-card-full" style={{ animationDelay: `${idx * 0.15}s` }}>
                    {(card.isFullArt || card.isHolo) && (
                      <div className={`xp-card-variant-badge ${card.isFullArt ? 'full-art' : 'holo'}`}>
                        {card.isFullArt ? (card.isAltArt ? 'Full Art Alternativa' : 'Full Art') : 'Holo'}
                      </div>
                    )}
                    <div className="xp-card-preview-full">
                      {card.isFullArt
                        ? <FullArtCard card={creatureData} level={card.newLevel} isAltArt={Boolean(card.isAltArt)} />
                        : <CreatureCardPreview creature={creatureData} level={card.newLevel} isHolo={card.isHolo} allowFlip={false} />}
                      <div className="xp-card-xp-panel">
                        <div className="xp-card-name-mini">{card.name}</div>
                        <div className="xp-gained-full">+{card.xpGained} XP</div>
                        <div className="xp-progress-bar-full">
                          <div className="xp-progress-fill-full" style={{ width: `${card.progressPercent}%` }} />
                          <span className="xp-progress-text-full">
                            {card.newLevel >= 10 ? 'MAX' : `${isEn ? 'Level' : 'Nível'} ${card.newLevel}`}
                          </span>
                        </div>
                        <div className="xp-breakdown-list">
                          {card.breakdown.map((item, i) => (
                            <div key={i} className="xp-breakdown-row">
                              <span className="xp-breakdown-label">{item.label}</span>
                              <span className="xp-breakdown-xp">+{Math.floor(item.xp)}</span>
                            </div>
                          ))}
                          <div className="xp-breakdown-row xp-breakdown-total">
                            <span className="xp-breakdown-label">Total</span>
                            <span className="xp-breakdown-xp">+{card.xpGained} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{color:'#ffe6b0',textAlign:'center',margin:'32px 0',fontSize:'1.1rem'}}>
              {isEn ? (
                <>No cards gained experience in this battle.<br/>Check that the cards involved belong to your collection.</>
              ) : (
                <>Nenhuma carta ganhou experiência nesta batalha.<br/>Verifique se as cartas participantes pertencem à sua coleção.</>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Botão de Continuar */}
        <div className="battle-result-footer">
          <span>{isEn ? 'Rewards will be added to your collection' : 'Recompensas serão adicionadas à sua coleção'}</span>
          <button className="battle-result-continue-btn" onClick={handleContinue}>
            {isEn ? 'Continue' : 'Continuar'} <b aria-hidden="true">→</b>
          </button>
        </div>
      </div>
    </div>
  , document.body);
}
