import React, { useContext, useEffect, useMemo, useState } from 'react';
import cardsPool from '../assets/cards';
import { AppContext } from '../context/AppContext';
import '../styles/campaign-tower.css';
import { getCampaignFloorDifficulty } from '../logic/campaignDifficulty';
import reptiloideBadge from '../assets/img/badge/reptiloide.png';
import aveBadge from '../assets/img/badge/ave.png';
import monstroBadge from '../assets/img/badge/monstro.png';
import feraBadge from '../assets/img/badge/fera.png';
import misticaBadge from '../assets/img/badge/criatura_mistica.png';
import sombriaBadge from '../assets/img/badge/criatura_sombria.png';
import draconideoBadge from '../assets/img/badge/draconideo.png';

const CAMPAIGN_PROGRESS_KEY = 'kadirCampaignTowerProgress';
const CAMPAIGN_BADGE_CELEBRATION_KEY = 'kadirCampaignLastBadgeCelebrated';

// `finalBossId` é o guardião que sempre aparece no último andar (chefe final) de cada torre -
// o mais raro daquele tipo. Ele é fixado aqui (em vez de calculado por raridade) porque o desempate
// entre criaturas de mesma raridade é uma escolha de design, não uma regra derivável dos dados
// (ex: Ekeranth foi escolhido como chefe Draconídeo mesmo a Lunethal tendo `value` levemente maior).
export const CAMPAIGN_TOWER_TYPES = [
  { key: 'reptiloide', label: { pt: 'Reptiloide', en: 'Reptiloid' }, guardianFallback: 'viborom', finalBossId: 'ekerion', rank: 'I', badge: reptiloideBadge },
  { key: 'ave', label: { pt: 'Ave', en: 'Bird' }, guardianFallback: 'griffor', finalBossId: 'ekonos', rank: 'II', badge: aveBadge },
  { key: 'monstro', label: { pt: 'Monstro', en: 'Monster' }, guardianFallback: 'gravhyr', finalBossId: 'arigus', rank: 'III', badge: monstroBadge },
  { key: 'fera', label: { pt: 'Fera', en: 'Beast' }, guardianFallback: 'roenhell', finalBossId: 'zephyron', rank: 'IV', badge: feraBadge },
  { key: 'mistica', label: { pt: 'Mistica', en: 'Mystic' }, guardianFallback: 'faskel', finalBossId: 'moar', rank: 'V', badge: misticaBadge },
  { key: 'sombria', label: { pt: 'Sombria', en: 'Shadow' }, guardianFallback: 'noctyra', finalBossId: 'pawferion', rank: 'VI', badge: sombriaBadge },
  { key: 'draconideo', label: { pt: 'Draconideo', en: 'Draconid' }, guardianFallback: 'draak', finalBossId: 'ekeranth', rank: 'VII', badge: draconideoBadge },
];

const CAMPAIGN_LEVELS_PER_TOWER = 11;
export const CAMPAIGN_TOTAL_LEVELS = CAMPAIGN_TOWER_TYPES.length * CAMPAIGN_LEVELS_PER_TOWER;

const DIFFICULTY_LABELS = {
  Iniciante: { pt: 'Iniciante', en: 'Beginner' }, Aprendiz: { pt: 'Aprendiz', en: 'Apprentice' },
  Adepto: { pt: 'Adepto', en: 'Adept' }, Ameaça: { pt: 'Ameaça', en: 'Threat' },
  Guardião: { pt: 'Guardião', en: 'Guardian' }, Campeão: { pt: 'Campeão', en: 'Champion' },
  Lenda: { pt: 'Lenda', en: 'Legend' },
};

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

function buildTowerLevels(tower, towerIndex, isEn) {
  const key = isEn ? 'en' : 'pt';
  const typeCards = getCreatureCardsByType(tower.key);
  const cards = typeCards.length > 0
    ? typeCards
    : [getGuardianCardData(tower.guardianFallback)].filter(Boolean);
  const finalBossCard = tower.finalBossId
    ? (cards.find((c) => c?.id === tower.finalBossId) || getGuardianCardData(tower.finalBossId))
    : null;

  return Array.from({ length: CAMPAIGN_LEVELS_PER_TOWER }, (_, levelIndex) => {
    // Primeira volta: cada guardião único aparece uma vez, na ordem em que foi adicionado ao jogo.
    // Quando os slots restantes precisam repetir alguém, prioriza os guardiões mais recentes
    // (fim do array) em vez de repetir logo os mais antigos - assim as cartas novas aparecem
    // com mais frequência que as antigas nas torres com poucos guardiões daquele tipo.
    // O último andar é sempre o chefe final da torre (o guardião mais raro daquele tipo),
    // independente de onde a rotação normal cairia.
    const isFinalFloor = levelIndex === CAMPAIGN_LEVELS_PER_TOWER - 1;
    const guardianCard = (isFinalFloor && finalBossCard) ? finalBossCard : ((levelIndex < cards.length
      ? cards[levelIndex]
      : cards[cards.length - 1 - ((levelIndex - cards.length) % cards.length)]
    ) || getGuardianCardData(tower.guardianFallback));
    const index = towerIndex * CAMPAIGN_LEVELS_PER_TOWER + levelIndex;
    const floorDifficulty = getCampaignFloorDifficulty(levelIndex);

    return {
      id: `${tower.key}-${levelIndex + 1}`,
      index,
      towerIndex,
      levelIndex,
      typeKey: tower.key,
      typeLabel: tower.label[key],
      guardianId: guardianCard?.id || tower.guardianFallback,
      card: guardianCard,
      name: getCardName(guardianCard, tower.label[key]),
      subtitle: getCardSubtitle(guardianCard, tower.label[key]),
      img: guardianCard?.img,
      aiDifficulty: floorDifficulty.aiLevel,
      deckTier: floorDifficulty.deckTier,
      targetPlayerWinRate: floorDifficulty.targetPlayerWinRate,
      difficulty: (DIFFICULTY_LABELS[floorDifficulty.profile.label] || DIFFICULTY_LABELS.Lenda)[key],
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
  const { lang = 'ptbr' } = useContext(AppContext) || {};
  const isEn = lang?.startsWith('en');
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
      const levels = buildTowerLevels(tower, towerIndex, isEn).map(level => ({
        ...level,
        unlocked: level.index <= progress,
        completed: level.index < progress,
      }));
      const completedCount = levels.filter(level => level.completed).length;
      const towerUnlocked = towerIndex === 0 || progress >= towerIndex * CAMPAIGN_LEVELS_PER_TOWER;
      const currentLevel = levels.find(level => level.unlocked && !level.completed) || levels[levels.length - 1];

      return {
        ...tower,
        label: tower.label[isEn ? 'en' : 'pt'],
        index: towerIndex,
        levels,
        completedCount,
        unlocked: towerUnlocked,
        completed: completedCount >= CAMPAIGN_LEVELS_PER_TOWER,
        currentLevel,
      };
    })
  ), [progress, isEn]);

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
          <span aria-hidden>←</span> {isEn ? 'Back' : 'Voltar'}
        </button>
        <div>
          <p className="campaign-kicker">{isEn ? 'Campaign' : 'Campanha'}</p>
          <h1>{isEn ? 'Guardian Towers' : 'Torres dos Guardiões'}</h1>
          <div className="campaign-title-rule" aria-hidden><span /></div>
        </div>
        <div className="campaign-progress-pill">
          <span>{isEn ? 'Progress' : 'Progresso'}</span>
          <strong>{Math.min(progress + 1, CAMPAIGN_TOTAL_LEVELS)}/{CAMPAIGN_TOTAL_LEVELS}</strong>
        </div>
      </header>

      <main className="campaign-tower-layout">
        <nav className="campaign-type-rail" aria-label={isEn ? 'Campaign towers' : 'Torres da campanha'}>
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
              <span className="campaign-type-progress">
                <b>{tower.completedCount}/{CAMPAIGN_LEVELS_PER_TOWER}</b>
                <i aria-hidden><em style={{ width: `${(tower.completedCount / CAMPAIGN_LEVELS_PER_TOWER) * 100}%` }} /></i>
              </span>
            </button>
          ))}
        </nav>

        <section className="campaign-tower-ladder">
          <div className="campaign-tower-title">
            <div>
              <span>{isEn ? 'Tower' : 'Torre'} {selectedTower?.rank}</span>
              <small>
                {isEn
                  ? `${selectedTower?.completedCount} of ${CAMPAIGN_LEVELS_PER_TOWER} battles won`
                  : `${selectedTower?.completedCount} de ${CAMPAIGN_LEVELS_PER_TOWER} combates vencidos`}
              </small>
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
              <span className="campaign-floor-difficulty">{enemy.completed ? (isEn ? 'Won' : 'Vencido') : enemy.difficulty}</span>
              <span className="campaign-floor-state" aria-hidden>
                {enemy.completed ? '✓' : (activeEnemy?.id === enemy.id ? '◆' : (enemy.unlocked ? '·' : '×'))}
              </span>
            </button>
          ))}
        </section>

        <aside className="campaign-enemy-preview">
          <div className="campaign-preview-card">
            {activeEnemy?.img && <img src={activeEnemy.img} alt={activeEnemy.name} />}
            <div className="campaign-preview-shade" />
            <div className="campaign-preview-index">
              <span>{isEn ? 'Floor' : 'Andar'}</span>
              <strong>{String((activeEnemy?.levelIndex || 0) + 1).padStart(2, '0')}</strong>
            </div>
            <div className="campaign-preview-text">
              <span>{isEn ? 'Next battle' : 'Próximo combate'}</span>
              <strong>{activeEnemy?.name}</strong>
              <small>{activeEnemy?.subtitle}</small>
              <em>{selectedTower?.label} · {isEn ? 'Level' : 'Nível'} {(activeEnemy?.levelIndex || 0) + 1}</em>
            </div>
          </div>
          <button className="campaign-start-btn" onClick={() => activeEnemy && onStartBattle(activeEnemy)}>
            <span>{isEn ? 'Face the Guardian' : 'Enfrentar Guardião'}</span><b aria-hidden>→</b>
          </button>
        </aside>
      </main>

      {badgeCelebration && (
        <div className="campaign-badge-celebration" onClick={closeBadgeCelebration}>
          <div className="campaign-badge-panel" onClick={(event) => event.stopPropagation()}>
            <div className="campaign-badge-rays" aria-hidden />
            <p>{isEn ? 'Badge earned' : 'Insignia adquirida'}</p>
            <img src={badgeCelebration.badge} alt={isEn ? `Badge ${badgeCelebration.label}` : `Insignia ${badgeCelebration.label}`} />
            <h2>{badgeCelebration.label}</h2>
            <span>{isEn ? `Tower ${badgeCelebration.rank} completed` : `Torre ${badgeCelebration.rank} concluida`}</span>
            <button type="button" onClick={closeBadgeCelebration}>
              {isEn ? 'Save achievement' : 'Guardar conquista'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
