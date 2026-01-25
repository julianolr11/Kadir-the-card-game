import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import '../styles/battle-result.css';
import levelIcon from '../assets/img/icons/lvlicon.png';
import CreatureCardPreview from './CreatureCardPreview.jsx';
import swordIcon from '../assets/img/icons/sword.png';
import creaturesPool from '../assets/cards';

export default function BattleResultModal({ gameResult, killFeed, playerDeck, onClose, battleStats }) {
  const { cardCollection, updateCardInstanceXp, setBoosters, boosters } = useContext(AppContext);

  const isPlayerWon = gameResult?.winner === 'player';
  const playerCards = Array.isArray(playerDeck) ? playerDeck : [];
  const [expandedCards, setExpandedCards] = useState({});

  // Função para calcular XP necessário por nível (mesma do AppContext)
  const getXpForLevel = (level) => {
    const baseXp = 100;
    const multiplier = 1.5;
    return Math.floor(baseXp * Math.pow(multiplier, level));
  };

  // Calcula XP total que será distribuído
  const calculateTotalXp = () => {
    if (!battleStats?.player) return 0;

    const allParticipants = new Set([
      ...battleStats.player.cardsDrawn,
      ...battleStats.player.cardsSummoned,
      ...battleStats.player.cardsKilled,
      ...battleStats.player.cardsAssisted,
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

      const instances = cardCollection[baseId] || [];
      const instance = instances.find(inst => inst.instanceId === cardId) || instances[0];

      if (instance) {
        total += calculateCardXp(cardId, instance.level);
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
    victory: 0.5,   // +0.5x adicional por vitória
    defeat: 0.1,    // +0.1x adicional por derrota
  };

  // Calcula XP baseado nas ações da carta
  const calculateCardXp = (cardId, cardLevel = 0) => {
    if (!battleStats?.player) return 0;

    const stats = battleStats.player;
    let totalXp = 0;

    // Conta quantas vezes cada ação foi feita
    const kills = stats.cardsKilled.filter(id => id === cardId).length;
    const assists = stats.cardsAssisted.filter(id => id === cardId).length;
    const summons = stats.cardsSummoned.filter(id => id === cardId).length;

    // Conta kills com vantagem de elemento
    const killsWithAdvantage = (killFeed || []).filter(
      k => k.attackerId === cardId && k.hadAdvantage
    ).length;

    // Calcula XP total
    totalXp += kills * XP_BASE * XP_MULTIPLIERS.kill;
    totalXp += killsWithAdvantage * XP_BASE * XP_MULTIPLIERS.killAdvantage; // Bônus por vantagem
    totalXp += assists * XP_BASE * XP_MULTIPLIERS.assist;
    totalXp += summons * XP_BASE * XP_MULTIPLIERS.summon;

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

    return Math.floor(totalXp);
  };

  // Distribui XP entre cartas que participaram
  const awardXpToCards = () => {
    if (!battleStats?.player) return; // Só precisa checar se tem stats

    // Pega todas as cartas que participaram (união de todas as ações)
    const allParticipants = new Set([
      ...battleStats.player.cardsDrawn,
      ...battleStats.player.cardsSummoned,
      ...battleStats.player.cardsKilled,
      ...battleStats.player.cardsAssisted,
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

      // Encontra a instância correta
      const instances = cardCollection[baseId] || [];
      const instance = instances.find(inst => inst.instanceId === cardId) || instances[0];

      if (instance) {
        const xp = calculateCardXp(cardId, instance.level);
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

      // Filtrar cartas de campo (começam com F maiúsculo ou field_)
      if (baseId.match(/^F\d+$/i) || baseId.toLowerCase().startsWith('field_')) {
        return; // Pula cartas de campo
      }

      const instances = cardCollection[baseId] || [];
      const instance = instances.find(inst => inst.instanceId === cardId) || instances[0];

      if (instance) {
        const xpGain = calculateCardXp(cardId, instance.level);
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
        const killsWithAdvantage = (killFeed || []).filter(
          k => k.attackerId === cardId && k.hadAdvantage
        ).length;

        const breakdown = [];
        if (kills > 0) {
          breakdown.push({ label: `${kills} abate${kills > 1 ? 's' : ''}`, xp: kills * XP_BASE * XP_MULTIPLIERS.kill });
        }
        if (killsWithAdvantage > 0) {
          breakdown.push({ label: `${killsWithAdvantage} abate${killsWithAdvantage > 1 ? 's' : ''} com vantagem`, xp: killsWithAdvantage * XP_BASE * XP_MULTIPLIERS.killAdvantage });
        }
        if (assists > 0) {
          breakdown.push({ label: `${assists} assistência${assists > 1 ? 's' : ''}`, xp: assists * XP_BASE * XP_MULTIPLIERS.assist });
        }
        if (summons > 0) {
          breakdown.push({ label: 'Invocação', xp: summons * XP_BASE * XP_MULTIPLIERS.summon });
        }
        if (isPlayerWon) {
          breakdown.push({ label: 'Vitória', xp: XP_BASE * XP_MULTIPLIERS.victory });
        } else {
          breakdown.push({ label: 'Derrota', xp: XP_BASE * XP_MULTIPLIERS.defeat });
        }

        // Aplicar bônus de nível após somar tudo
        const baseXpTotal = breakdown.reduce((sum, item) => sum + item.xp, 0);
        const levelBonus = 1 + (oldLevel * 0.1);
        const finalXpGain = Math.floor(baseXpTotal * levelBonus);

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
          name: (cardData?.name && (cardData.name.pt || cardData.name.en || cardData.name)) || baseId,
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

    if (isPlayerWon) {
      // Adiciona 1 booster por vitória
      setBoosters(boosters + 1);
    }

    onClose();
  };

  // Calcula o XP total ganho
  const totalXpGained = calculateTotalXp();

  return (
    <div className="battle-result-overlay">
      <div className="battle-result-modal">
        {/* Cabeçalho com resultado */}
        <div className={`battle-result-header ${isPlayerWon ? 'victory' : 'defeat'}`}>
          <h1 className="battle-result-title">
            {isPlayerWon ? '🎉 VITÓRIA!' : '💀 DERROTA!'}
          </h1>
          <p className="battle-result-subtitle">
            {isPlayerWon ? 'Você venceu a batalha!' : 'Você foi derrotado...'}
          </p>
        </div>

        {/* Estatísticas */}
        <div className="battle-result-stats-container">
          <div className="battle-result-stats">
            <div className="stat-block">
              <div className="stat-label">Inimigos Derrotados</div>
              <div className="stat-value">{killFeed?.length || 0}</div>
            </div>
          </div>
          {isPlayerWon && (
            <div className="battle-result-booster-panel">
              <img src={require('../assets/img/card/booster.png')} alt="Booster adquirido" className="battle-result-booster-img" />
              <span className="battle-result-booster-label">Booster adquirido!</span>
            </div>
          )}
        </div>

        {/* Kill Feed */}
        {killFeed && killFeed.length > 0 && (
          <div className="battle-result-kills-feed-grid">
            <h3 className="kills-title">Eliminações</h3>
            <div className="kills-grid">
              {killFeed.map((kill, idx) => {
                const attackerData = creaturesPool.find(c => c.id === kill.attacker || c.id === kill.attacker.toLowerCase());
                const targetData = creaturesPool.find(c => c.id === kill.target || c.id === kill.target.toLowerCase());
                const isUserCard = battleStats?.player?.cardsSummoned?.includes(kill.attacker);
                return (
                  <div key={idx} className={`kills-grid-cell ${isUserCard ? 'user' : 'opponent'}`} style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="kills-grid-turn">Turno {kill.turn}</div>
                    <div className="kills-grid-content">
                      <div className="kills-grid-attacker">
                        <span className="kills-grid-name">{attackerData?.name?.pt || kill.attacker}</span>
                        {attackerData?.element && <img alt={attackerData.element} src={require(`../assets/img/elements/${attackerData.element}.png`)} className="kills-grid-element" />}
                      </div>
                      <div className="kills-grid-vs">eliminou</div>
                      <div className="kills-grid-target">
                        <span className="kills-grid-name">{targetData?.name?.pt || kill.target}</span>
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
          <h3 className="xp-cards-title">Experiência Ganha</h3>
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
                    <div className="xp-card-preview-full">
                      <CreatureCardPreview creature={creatureData} allowFlip={false} />
                      <div className="xp-card-xp-panel">
                        <div className="xp-card-name-mini">{card.name}</div>
                        <div className="xp-gained-full">+{card.xpGained} XP</div>
                        <div className="xp-progress-bar-full">
                          <div className="xp-progress-fill-full" style={{ width: `${card.progressPercent}%` }} />
                          <span className="xp-progress-text-full">
                            {card.newLevel >= 10 ? 'MAX' : `Nível ${card.newLevel}`}
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
            <div style={{color:'#ffe6b0',textAlign:'center',margin:'32px 0',fontSize:'1.1rem'}}>Nenhuma carta ganhou experiência nesta batalha.<br/>Verifique se as cartas participantes pertencem à sua coleção.</div>
          )}
        </div>

        {/* Botão de Continuar */}
        <button className="battle-result-continue-btn" onClick={handleContinue}>
          Continuar
        </button>
      </div>
    </div>
  );
}
