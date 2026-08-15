import holoIcon from './img/help/card-holo.png';
import fullArtIcon from './img/help/card-fullart.png';
import trophyIcon from './img/badge/trophy.png';

// Conquistas com progresso real (independentes dos troféus de torre já existentes
// na sala de Conquistas). O `id` é usado como API Name da conquista correspondente
// na Steam quando o jogo tiver um App ID próprio — precisam bater exatamente com
// os nomes cadastrados no painel do Steamworks.
export const ACHIEVEMENTS = [
  {
    id: 'FIRST_HOLO',
    img: holoIcon,
    name: { pt: 'Brilho Raro', en: 'Rare Shine' },
    desc: {
      pt: 'Obtenha sua primeira carta holográfica.',
      en: 'Obtain your first holographic card.',
    },
  },
  {
    id: 'FIRST_FULL_ART',
    img: fullArtIcon,
    name: { pt: 'Arte Completa', en: 'Complete Art' },
    desc: {
      pt: 'Obtenha sua primeira carta full art.',
      en: 'Obtain your first full-art card.',
    },
  },
  {
    id: 'TOWER_COMPLETE',
    img: trophyIcon,
    name: { pt: 'Mestre das Torres', en: 'Master of Towers' },
    desc: {
      pt: 'Complete todas as Torres dos Guardiões.',
      en: 'Complete every Guardian Tower.',
    },
  },
];

export default ACHIEVEMENTS;
