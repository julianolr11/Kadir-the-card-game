import React, { useContext, useEffect, useMemo, useState } from 'react';
import '../styles/achievements-room.css';
import { AppContext } from '../context/AppContext';
import { ACHIEVEMENTS } from '../assets/achievementsData';

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
  { key: 'reptiloide', label: { pt: 'Reptiloide', en: 'Reptiloid' }, img: reptiloideBadge, towerIndex: 0 },
  { key: 'ave', label: { pt: 'Ave', en: 'Bird' }, img: aveBadge, towerIndex: 1 },
  { key: 'monstro', label: { pt: 'Monstro', en: 'Monster' }, img: monstroBadge, towerIndex: 2 },
  { key: 'fera', label: { pt: 'Fera', en: 'Beast' }, img: feraBadge, towerIndex: 3 },
  { key: 'mistica', label: { pt: 'Mistica', en: 'Mystic' }, img: misticaBadge, towerIndex: 4 },
  { key: 'sombria', label: { pt: 'Sombria', en: 'Shadow' }, img: sombriaBadge, towerIndex: 5 },
  { key: 'draconideo', label: { pt: 'Draconideo', en: 'Draconid' }, img: draconideoBadge, towerIndex: 6 },
];

function readCampaignProgress() {
  const raw = Number(localStorage.getItem(CAMPAIGN_PROGRESS_KEY) || 0);
  return Number.isFinite(raw) ? Math.max(0, raw) : 0;
}

export default function AchievementsRoom({ onBack }) {
  const { unlockedAchievements = [], lang = 'ptbr' } = useContext(AppContext) || {};
  const langKey = lang?.startsWith('en') ? 'en' : 'pt';
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

  const milestones = useMemo(() => (
    ACHIEVEMENTS.map((achievement) => ({
      ...achievement,
      unlocked: unlockedAchievements.includes(achievement.id),
    }))
  ), [unlockedAchievements]);
  const unlockedMilestoneCount = milestones.filter((m) => m.unlocked).length;

  return (
    <section className="achievements-room" style={{ backgroundImage: `url(${trophyRoomBg})` }}>
      <div className="achievements-room-vignette" />
      <header className="achievements-room-header">
        <div />
        <div>
          <p>{langKey === 'en' ? 'Player gallery' : 'Galeria do jogador'}</p>
          <h1>{langKey === 'en' ? 'Achievements' : 'Conquistas'}</h1>
        </div>
        <div className="achievements-progress">
          <img src={trophyIcon} alt="" />
          <span>
            <small>{langKey === 'en' ? 'Badges' : 'Insígnias'}</small>
            <strong>{unlockedCount}/{badges.length}</strong>
          </span>
        </div>
      </header>

      <main className="achievements-showcase">
        <section className={`achievements-trophy-focus${unlockedCount === badges.length ? ' unlocked' : ' locked'}`}>
          <img src={trophyIcon} alt="" />
          <span>{langKey === 'en' ? 'Campaign' : 'Campanha'}</span>
          <strong>{langKey === 'en' ? 'Guardian Towers' : 'Torres dos Guardiões'}</strong>
          <small>{unlockedCount === badges.length ? (langKey === 'en' ? 'All towers defeated' : 'Todas as torres vencidas') : (langKey === 'en' ? 'Defeat each tower to reveal its badge' : 'Vença cada torre para revelar suas insígnias')}</small>
          <div className="achievements-trophy-progress" aria-label={langKey === 'en' ? `${unlockedCount} of ${badges.length} badges` : `${unlockedCount} de ${badges.length} insígnias`}>
            <i style={{ width: `${(unlockedCount / badges.length) * 100}%` }} />
          </div>
        </section>

        <div className="achievements-right-column">
          <h2 className="achievements-section-title">
            {langKey === 'en' ? 'Tower badges' : 'Insígnias das torres'}
            <span>{unlockedCount}/{badges.length}</span>
          </h2>
          <section className="achievements-badge-grid" aria-label={langKey === 'en' ? 'Campaign badges' : 'Insignias da campanha'}>
            {badges.map((badge) => (
              <article
                key={badge.key}
                className={`achievement-badge-card${badge.unlocked ? ' unlocked' : ' locked'}`}
              >
                <div className="achievement-badge-orb">
                  <img src={badge.img} alt={`${langKey === 'en' ? 'Badge' : 'Insignia'} ${badge.label[langKey]}`} />
                </div>
                <div className="achievement-badge-copy">
                  <span>{badge.unlocked ? (langKey === 'en' ? 'Unlocked' : 'Conquistada') : `${badge.progress}/${LEVELS_PER_TOWER}`}</span>
                  <strong>{badge.label[langKey]}</strong>
                  <small>{badge.unlocked ? (langKey === 'en' ? 'Tower defeated' : 'Torre vencida') : (langKey === 'en' ? 'Locked' : 'Bloqueada')}</small>
                  <div className="achievement-badge-meter" aria-hidden>
                    <i style={{ width: `${(badge.progress / LEVELS_PER_TOWER) * 100}%` }} />
                  </div>
                </div>
              </article>
            ))}
          </section>

          <h2 className="achievements-section-title">
            {langKey === 'en' ? 'Player milestones' : 'Marcos do jogador'}
            <span>{unlockedMilestoneCount}/{milestones.length}</span>
          </h2>
          <section className="achievements-badge-grid" aria-label={langKey === 'en' ? 'Player milestones' : 'Marcos do jogador'}>
            {milestones.map((achievement) => (
              <article
                key={achievement.id}
                className={`achievement-badge-card${achievement.unlocked ? ' unlocked' : ' locked'}`}
              >
                <div className="achievement-badge-orb">
                  <img src={achievement.img} alt={achievement.name[langKey] || achievement.name.pt} />
                </div>
                <div className="achievement-badge-copy">
                  <span>{achievement.unlocked ? (langKey === 'en' ? 'Unlocked' : 'Conquistada') : (langKey === 'en' ? 'Locked' : 'Bloqueada')}</span>
                  <strong>{achievement.name[langKey] || achievement.name.pt}</strong>
                  <small>{achievement.desc[langKey] || achievement.desc.pt}</small>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>

      <button className="achievements-bottom-back-btn" type="button" onClick={onBack}>
        <span aria-hidden>←</span> {langKey === 'en' ? 'Back to main menu' : 'Voltar ao menu principal'}
      </button>
    </section>
  );
}
