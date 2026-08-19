import holoIcon from './img/help/card-holo.png';
import fullArtIcon from './img/help/card-fullart.png';
import trophyIcon from './img/badge/trophy.png';
import ekeranthTrophy from './img/badge/ekeranth_trophy.png';
import ekerionTrophy from './img/badge/ekerion_trophy.png';
import ekernothTrophy from './img/badge/ekernoth_trophy.png';
import ekerathTrophy from './img/badge/ekerath_trophy.png';

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
  {
    id: 'CALAMITY_EKERANTH_DEFEATED',
    img: ekeranthTrophy,
    name: { pt: 'Fúria Extinta', en: 'Fury Extinguished' },
    desc: {
      pt: 'Derrote Ekeranth no modo Calamidade.',
      en: 'Defeat Ekeranth in Calamity mode.',
    },
  },
  {
    id: 'CALAMITY_EKERION_DEFEATED',
    img: ekerionTrophy,
    name: { pt: 'Tempestade Silenciada', en: 'Storm Silenced' },
    desc: {
      pt: 'Derrote Ekerion no modo Calamidade.',
      en: 'Defeat Ekerion in Calamity mode.',
    },
  },
  {
    id: 'CALAMITY_EKERNOTH_DEFEATED',
    img: ekernothTrophy,
    name: { pt: 'Abismo Domado', en: 'Abyss Tamed' },
    desc: {
      pt: 'Derrote Ekernoth no modo Calamidade.',
      en: 'Defeat Ekernoth in Calamity mode.',
    },
  },
  {
    id: 'CALAMITY_EKERATH_DEFEATED',
    img: ekerathTrophy,
    name: { pt: 'Terra Pacificada', en: 'Earth Pacified' },
    desc: {
      pt: 'Derrote Ekerath no modo Calamidade.',
      en: 'Defeat Ekerath in Calamity mode.',
    },
  },
];

export default ACHIEVEMENTS;
