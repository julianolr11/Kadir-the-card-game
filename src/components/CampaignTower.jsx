import React, { useEffect, useMemo, useState } from 'react';
import cardsPool from '../assets/cards';
import '../styles/campaign-tower.css';
import reptiloideBadge from '../assets/img/badge/reptiloide.png';
import aveBadge from '../assets/img/badge/ave.png';
import monstroBadge from '../assets/img/badge/monstro.png';
import feraBadge from '../assets/img/badge/fera.png';
import misticaBadge from '../assets/img/badge/criatura_mistica.png';
import sombriaBadge from '../assets/img/badge/criatura_sombria.png';
import draconideoBadge from '../assets/img/badge/draconideo.png';

const CAMPAIGN_PROGRESS_KEY = 'kadirCampaignTowerProgress';
const CAMPAIGN_BADGE_CELEBRATION_KEY = 'kadirCampaignLastBadgeCelebrated';

export const CAMPAIGN_TOWER_TYPES = [
  { key: 'reptiloide', label: 'Reptiloide', guardianFallback: 'viborom', rank: 'I', badge: reptiloideBadge },
  { key: 'ave', label: 'Ave', guardianFallback: 'griffor', rank: 'II', badge: aveBadge },
  { key: 'monstro', label: 'Monstro', guardianFallback: 'gravhyr', rank: 'III', badge: monstroBadge },
  { key: 'fera', label: 'Fera', guardianFallback: 'roenhell', rank: 'IV', badge: feraBadge },
  { key: 'mistica', label: 'Mistica', guardianFallback: 'faskel', rank: 'V', badge: misticaBadge },
  { key: 'sombria', label: 'Sombria', guardianFallback: 'noctyra', rank: 'VI', badge: sombriaBadge },
  { key: 'draconideo', label: 'Draconideo', guardianFallback: 'draak', rank: 'VII', badge: draconideoBadge },
];

const CAMPAIGN_LEVELS_PER_TOWER = 11;
export const CAMPAIGN_TOTAL_LEVELS = CAMPAIGN_TOWER_TYPES.length * CAMPAIGN_LEVELS_PER_TOWER;

const DIFFICULTY_LABELS = [
  'Iniciante',
  'Iniciante',
  'Aprendiz',
  'Aprendiz',
  'Adepto',
  'Ameaca',
  'Guardiao',
  'Guardiao',
  'Campeao',
  'Campeao',
  'Lenda',
];

const getGuardianCardData = (guardianId) => {
  try {
    return require(`../assets/cards/booster1/${guardianId}.js`);
  } catch (error) {
    return null;
  }
};

function getCardName(card, fallback) {
  if (!card) return fallback;
  if (typeof card.name === 'string') return card.name;
  return card.name?.pt || card.name?.en || fallback;
}

function getCardSubtitle(card, fallback) {
  if (!card) return fallback;
  if (typeof card.subtitle === 'string') return card.subtitle;
  return card.subtitle?.pt || card.subtitle?.en || fallback;
}

function normalizeType(value) {
  const text = typeof value === 'string' ? value : (value?.pt || value?.en || '');
  return String(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

function getCreatureCardsByType(typeKey) {
  const pool = Array.isArray(cardsPool) ? cardsPool : [];
  return pool.filter(card => (
    card?.id
    && card.type !== 'field'
    && card.type !== 'effect'
    && normalizeType(card.type) === typeKey
  ));
}

function buildTowerLevels(tower, towerIndex) {
  const typeCards = getCreatureCardsByType(tower.key);
  const cards = typeCards.length > 0
    ? typeCards
    : [getGuardianCardData(tower.guardianFallback)].filter(Boolean);

  return Array.from({ length: CAMPAIGN_LEVELS_PER_TOWER }, (_, levelIndex) => {
    const guardianCard = cards[levelIndex % cards.length] || getGuardianCardData(tower.guardianFallback);
    const index = towerIndex * CAMPAIGN_LEVELS_PER_TOWER + levelIndex;

    return {
      id: `${tower.key}-${levelIndex + 1}`,
      index,
      towerIndex,
      levelIndex,
      typeKey: tower.key,
      typeLabel: tower.label,
      guardianId: guardianCard?.id || tower.guardianFallback,
      card: guardianCard,
      name: getCardName(guardianCard, tower.label),
      subtitle: getCardSubtitle(guardianCard, tower.label),
      img: guardianCard?.img,
      difficulty: DIFFICULTY_LABELS[levelIndex] || 'Guardiao',
    };
  });
}

export function getCampaignProgress() {
  const raw = Number(localStorage.getItem(CAMPAIGN_PROGRESS_KEY) || 0);
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(CAMPAIGN_TOTAL_LEVELS, raw));
}

export function unlockNextCampaignEnemy(enemyIndex) {
  const current = getCampaignProgress();
  const next = Math.max(current, Math.min(CAMPAIGN_TOTAL_LEVELS, enemyIndex + 1));
  localStorage.setItem(CAMPAIGN_PROGRESS_KEY, String(next));
  return next;
}

export default function CampaignTower({ onBack, onStartBattle }) {
  const [progress, setProgress] = useState(getCampaignProgress);
  const [badgeCelebration, setBadgeCelebration] = useState(null);
  const currentTowerIndex = Math.min(
    CAMPAIGN_TOWER_TYPES.length - 1,
    Math.floor(progress / CAMPAIGN_LEVELS_PER_TOWER)
  );
  const [selectedTowerKey, setSelectedTowerKey] = useState(
    CAMPAIGN_TOWER_TYPES[currentTowerIndex]?.key || CAMPAIGN_TOWER_TYPES[0].key
  );

  const towers = useMemo(() => (
    CAMPAIGN_TOWER_TYPES.map((tower, towerIndex) => {
      const levels = buildTowerLevels(tower, towerIndex).map(level => ({
        ...level,
        unlocked: level.index <= progress,
        completed: level.index < progress,
      }));
      const completedCount = levels.filter(level => level.completed).length;
      const towerUnlocked = towerIndex === 0 || progress >= towerIndex * CAMPAIGN_LEVELS_PER_TOWER;
      const currentLevel = levels.find(level => level.unlocked && !level.completed) || levels[levels.length - 1];

      return {
        ...tower,
        index: towerIndex,
        levels,
        completedCount,
        unlocked: towerUnlocked,
        completed: completedCount >= CAMPAIGN_LEVELS_PER_TOWER,
        currentLevel,
      };
    })
  ), [progress]);

  useEffect(() => {
    const handleStorage = () => setProgress(getCampaignProgress());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const currentTower = CAMPAIGN_TOWER_TYPES[currentTowerIndex];
    if (currentTower) setSelectedTowerKey(currentTower.key);
  }, [currentTowerIndex]);

  useEffect(() => {
    const completedTowerIndex = Math.min(
      CAMPAIGN_TOWER_TYPES.length - 1,
      Math.floor(progress / CAMPAIGN_LEVELS_PER_TOWER) - 1
    );
    if (completedTowerIndex < 0) return;

    const lastCelebrated = Number(localStorage.getItem(CAMPAIGN_BADGE_CELEBRATION_KEY) || -1);
    if (Number.isFinite(lastCelebrated) && lastCelebrated >= completedTowerIndex) return;

    const completedTower = towers[completedTowerIndex];
    if (!completedTower?.completed) return;

    setBadgeCelebration(completedTower);
  }, [progress, towers]);

  function closeBadgeCelebration() {
    if (badgeCelebration) {
      localStorage.setItem(CAMPAIGN_BADGE_CELEBRATION_KEY, String(badgeCelebration.index));
    }
    setBadgeCelebration(null);
  }

  const selectedTower = towers.find(tower => tower.key === selectedTowerKey) || towers[currentTowerIndex] || towers[0];
  const activeEnemy = selectedTower?.levels.find(level => level.unlocked && !level.completed) || selectedTower?.currentLevel;
  const progressPercent = activeEnemy
    ? Math.round((activeEnemy.levelIndex / Math.max(1, CAMPAIGN_LEVELS_PER_TOWER - 1)) * 100)
    : 0;

  return (
    <div
      className="campaign-tower-screen"
      style={{
        '--tower-progress': `${progressPercent}%`,
        '--tower-offset': `${Math.round(progressPercent * 0.55)}%`,
        '--tower-card-offset': `${Math.round(progressPercent * 0.10)}%`,
      }}
    >
      <div className="campaign-tower-bg" />
      <header className="campaign-tower-header">
        <button className="campaign-back-btn" onClick={onBack}>
          <span aria-hidden>←</span> Voltar
        </button>
        <div>
          <p className="campaign-kicker">Campanha</p>
          <h1>Torres dos Guardiões</h1>
          <div className="campaign-title-rule" aria-hidden><span /></div>
        </div>
        <div className="campaign-progress-pill">
          <span>Progresso</span>
          <strong>{Math.min(progress + 1, CAMPAIGN_TOTAL_LEVELS)}/{CAMPAIGN_TOTAL_LEVELS}</strong>
        </div>
      </header>

      <main className="campaign-tower-layout">
        <nav className="campaign-type-rail" aria-label="Torres da campanha">
          {towers.map((tower) => (
            <button
              key={tower.key}
              className={`campaign-type-card${tower.unlocked ? ' unlocked' : ' locked'}${tower.completed ? ' completed' : ''}${selectedTower?.key === tower.key ? ' active' : ''}`}
              disabled={!tower.unlocked}
              onClick={() => setSelectedTowerKey(tower.key)}
            >
              <img className="campaign-type-badge" src={tower.badge} alt="" aria-hidden />
              <span className="campaign-type-rank">{tower.rank}</span>
              <span className="campaign-type-name">{tower.label}</span>
              <span className="campaign-type-progress">{tower.completedCount}/{CAMPAIGN_LEVELS_PER_TOWER}</span>
            </button>
          ))}
        </nav>

        <section className="campaign-tower-ladder">
          <div className="campaign-tower-title">
            <div>
              <span>Torre {selectedTower?.rank}</span>
              <small>{selectedTower?.completedCount} de {CAMPAIGN_LEVELS_PER_TOWER} combates vencidos</small>
            </div>
            <strong>{selectedTower?.label}</strong>
          </div>
          {selectedTower?.levels.map((enemy) => (
            <button
              key={enemy.id}
              className={`campaign-floor${enemy.unlocked ? ' unlocked' : ' locked'}${enemy.completed ? ' completed' : ''}${activeEnemy?.id === enemy.id ? ' active' : ''}`}
              disabled={!enemy.unlocked}
              onClick={() => onStartBattle(enemy)}
            >
              <span className="campaign-floor-number">{String(enemy.levelIndex + 1).padStart(2, '0')}</span>
              <span className="campaign-floor-line" />
              <span className="campaign-floor-name">{enemy.name}</span>
              <span className="campaign-floor-difficulty">{enemy.completed ? 'Vencido' : enemy.difficulty}</span>
            </button>
          ))}
        </section>

        <aside className="campaign-enemy-preview">
          <div className="campaign-preview-card">
            {activeEnemy?.img && <img src={activeEnemy.img} alt={activeEnemy.name} />}
            <div className="campaign-preview-shade" />
            <div className="campaign-preview-text">
              <span>Próximo combate</span>
              <strong>{activeEnemy?.name}</strong>
              <small>{activeEnemy?.subtitle}</small>
              <em>{selectedTower?.label} · Nível {(activeEnemy?.levelIndex || 0) + 1}</em>
            </div>
          </div>
          <button className="campaign-start-btn" onClick={() => activeEnemy && onStartBattle(activeEnemy)}>
            <span>Enfrentar Guardião</span><b aria-hidden>→</b>
          </button>
        </aside>
      </main>

      {badgeCelebration && (
        <div className="campaign-badge-celebration" onClick={closeBadgeCelebration}>
          <div className="campaign-badge-panel" onClick={(event) => event.stopPropagation()}>
            <div className="campaign-badge-rays" aria-hidden />
            <p>Insignia adquirida</p>
            <img src={badgeCelebration.badge} alt={`Insignia ${badgeCelebration.label}`} />
            <h2>{badgeCelebration.label}</h2>
            <span>Torre {badgeCelebration.rank} concluida</span>
            <button type="button" onClick={closeBadgeCelebration}>
              Guardar conquista
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
