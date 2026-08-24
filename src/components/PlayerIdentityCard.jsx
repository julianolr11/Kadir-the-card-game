import React from 'react';
import { ACHIEVEMENTS } from '../assets/achievementsData';
import { CAMPAIGN_TOWER_TYPES, CAMPAIGN_TOTAL_LEVELS, getCampaignProgress } from './CampaignTower.jsx';

const LEVELS_PER_TOWER = CAMPAIGN_TOTAL_LEVELS / CAMPAIGN_TOWER_TYPES.length;

// Mesma fórmula de insígnias de torre usada em PvpLobby.jsx/AchievementsRoom.jsx:
// progresso >= (índice_da_torre + 1) * níveis_por_torre.
export function unlockedTowerBadges(campaignProgress, isEn) {
  return CAMPAIGN_TOWER_TYPES
    .filter((tower, idx) => (campaignProgress || 0) >= (idx + 1) * LEVELS_PER_TOWER)
    .map((t) => ({ id: `tower-${t.key}`, img: t.badge, label: isEn ? t.label.en : t.label.pt }));
}

export function usePlayerBadges(unlockedAchievements, isEn) {
  const campaignProgress = getCampaignProgress();
  // unlockAchievement() só faz append no array (ver AppContext.jsx), então a posição em
  // unlockedAchievements É a ordem cronológica real de conquista - ordenamos por ela em vez da
  // ordem estática de ACHIEVEMENTS pra "últimas conquistadas" (ver maxBadges em
  // PlayerIdentityCard) refletir a conquista mais recente de verdade, não a definição da lista.
  const unlockOrder = unlockedAchievements || [];
  const milestoneBadges = ACHIEVEMENTS
    .filter((a) => unlockOrder.includes(a.id))
    .map((a) => ({ id: a.id, img: a.img, label: a.name?.[isEn ? 'en' : 'pt'] || a.name?.pt }))
    .sort((a, b) => unlockOrder.indexOf(a.id) - unlockOrder.indexOf(b.id));
  return [...unlockedTowerBadges(campaignProgress, isEn), ...milestoneBadges];
}

// Bloco compartilhado de identidade do jogador: foto da Steam + nome + insígnias conquistadas
// (torres da campanha + achievements). Usado tanto no HUD de batalha (BattleOwnPlayerHud,
// BattleOpponentPlayerHud) quanto no menu principal (HomeScreen) - evita duplicar a fórmula de
// insígnias e a marcação de avatar/nome/badges em cada lugar.
export default function PlayerIdentityCard({ isEn, avatarUrl, name, fallbackName, unlockedAchievements, maxBadges = 5, children }) {
  const badges = usePlayerBadges(unlockedAchievements, isEn);
  // slice(-maxBadges) em vez de slice(0, maxBadges): badges já vem em ordem cronológica de
  // conquista (ver usePlayerBadges acima), então pegar do fim mostra as últimas conquistadas em
  // vez das primeiras da lista.
  const recentBadges = badges.slice(-maxBadges);

  return (
    <>
      <div className="battle-player-hud-avatar">
        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span className="battle-player-hud-avatar-fallback">?</span>}
      </div>
      <div className="battle-player-hud-info">
        <span className="battle-player-hud-name">{name || fallbackName}</span>
        {recentBadges.length > 0 && (
          <div className="battle-player-hud-badges">
            {recentBadges.map((b) => (
              <img key={b.id} src={b.img} alt={b.label} title={b.label} />
            ))}
          </div>
        )}
      </div>
      {children}
    </>
  );
}
