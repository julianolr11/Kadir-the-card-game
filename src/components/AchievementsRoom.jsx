import React, { useEffect, useMemo, useState } from 'react';
import '../styles/achievements-room.css';

import trophyRoomBg from '../assets/img/wallpaper/trophy-room.png';
import trophyIcon from '../assets/img/badge/trophy.png';
import reptiloideBadge from '../assets/img/badge/reptiloide.png';
import aveBadge from '../assets/img/badge/ave.png';
import monstroBadge from '../assets/img/badge/monstro.png';
import feraBadge from '../assets/img/badge/fera.png';
import misticaBadge from '../assets/img/badge/criatura_mistica.png';
import sombriaBadge from '../assets/img/badge/criatura_sombria.png';
import draconideoBadge from '../assets/img/badge/draconideo.png';

const CAMPAIGN_PROGRESS_KEY = 'kadirCampaignTowerProgress';
const LEVELS_PER_TOWER = 11;

const BADGES = [
  { key: 'reptiloide', label: 'Reptiloide', img: reptiloideBadge, towerIndex: 0 },
  { key: 'ave', label: 'Ave', img: aveBadge, towerIndex: 1 },
  { key: 'monstro', label: 'Monstro', img: monstroBadge, towerIndex: 2 },
  { key: 'fera', label: 'Fera', img: feraBadge, towerIndex: 3 },
  { key: 'mistica', label: 'Mistica', img: misticaBadge, towerIndex: 4 },
  { key: 'sombria', label: 'Sombria', img: sombriaBadge, towerIndex: 5 },
  { key: 'draconideo', label: 'Draconideo', img: draconideoBadge, towerIndex: 6 },
];

function readCampaignProgress() {
  const raw = Number(localStorage.getItem(CAMPAIGN_PROGRESS_KEY) || 0);
  return Number.isFinite(raw) ? Math.max(0, raw) : 0;
}

export default function AchievementsRoom({ onBack }) {
  const [campaignProgress, setCampaignProgress] = useState(readCampaignProgress);

  useEffect(() => {
    const update = () => setCampaignProgress(readCampaignProgress());
    window.addEventListener('storage', update);
    window.addEventListener('focus', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('focus', update);
    };
  }, []);

  const badges = useMemo(() => (
    BADGES.map((badge) => {
      const requiredProgress = (badge.towerIndex + 1) * LEVELS_PER_TOWER;
      return {
        ...badge,
        unlocked: campaignProgress >= requiredProgress,
        progress: Math.min(LEVELS_PER_TOWER, Math.max(0, campaignProgress - badge.towerIndex * LEVELS_PER_TOWER)),
      };
    })
  ), [campaignProgress]);

  const unlockedCount = badges.filter(badge => badge.unlocked).length;

  return (
    <section className="achievements-room" style={{ backgroundImage: `url(${trophyRoomBg})` }}>
      <div className="achievements-room-vignette" />
      <header className="achievements-room-header">
        <div />
        <div>
          <p>Galeria do jogador</p>
          <h1>Conquistas</h1>
        </div>
        <div className="achievements-progress">
          <img src={trophyIcon} alt="" />
          <span>
            <small>Insígnias</small>
            <strong>{unlockedCount}/{badges.length}</strong>
          </span>
        </div>
      </header>

      <main className="achievements-showcase">
        <section className={`achievements-trophy-focus${unlockedCount === badges.length ? ' unlocked' : ' locked'}`}>
          <img src={trophyIcon} alt="" />
          <span>Campanha</span>
          <strong>Torres dos Guardiões</strong>
          <small>{unlockedCount === badges.length ? 'Todas as torres vencidas' : 'Vença cada torre para revelar suas insígnias'}</small>
          <div className="achievements-trophy-progress" aria-label={`${unlockedCount} de ${badges.length} insígnias`}>
            <i style={{ width: `${(unlockedCount / badges.length) * 100}%` }} />
          </div>
        </section>

        <section className="achievements-badge-grid" aria-label="Insignias da campanha">
          {badges.map((badge) => (
            <article
              key={badge.key}
              className={`achievement-badge-card${badge.unlocked ? ' unlocked' : ' locked'}`}
            >
              <div className="achievement-badge-orb">
                <img src={badge.img} alt={`Insignia ${badge.label}`} />
              </div>
              <div className="achievement-badge-copy">
                <span>{badge.unlocked ? 'Conquistada' : `${badge.progress}/${LEVELS_PER_TOWER}`}</span>
                <strong>{badge.label}</strong>
                <small>{badge.unlocked ? 'Torre vencida' : 'Bloqueada'}</small>
                <div className="achievement-badge-meter" aria-hidden>
                  <i style={{ width: `${(badge.progress / LEVELS_PER_TOWER) * 100}%` }} />
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <button className="achievements-bottom-back-btn" type="button" onClick={onBack}>
        <span aria-hidden>←</span> Voltar ao menu principal
      </button>
    </section>
  );
}
