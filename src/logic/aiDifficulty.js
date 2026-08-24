export const AI_DIFFICULTY_PROFILES = [
  { level: 0, label: 'Iniciante', searchDepth: 1, accuracy: 0.45, knowledge: 0, actionNoise: 8 },
  { level: 1, label: 'Iniciante', searchDepth: 1, accuracy: 0.50, knowledge: 1, actionNoise: 7 },
  { level: 2, label: 'Aprendiz', searchDepth: 1, accuracy: 0.58, knowledge: 2, actionNoise: 6 },
  { level: 3, label: 'Aprendiz', searchDepth: 1, accuracy: 0.64, knowledge: 3, actionNoise: 5 },
  { level: 4, label: 'Adepto', searchDepth: 1, accuracy: 0.71, knowledge: 4, actionNoise: 4 },
  { level: 5, label: 'Ameaça', searchDepth: 1, accuracy: 0.77, knowledge: 5, actionNoise: 3.2 },
  { level: 6, label: 'Guardião', searchDepth: 2, accuracy: 0.83, knowledge: 6, actionNoise: 2.5 },
  { level: 7, label: 'Guardião', searchDepth: 2, accuracy: 0.88, knowledge: 7, actionNoise: 1.8 },
  { level: 8, label: 'Campeão', searchDepth: 2, accuracy: 0.92, knowledge: 8, actionNoise: 1.2 },
  { level: 9, label: 'Campeão', searchDepth: 3, accuracy: 0.96, knowledge: 9, actionNoise: 0.6 },
  { level: 10, label: 'Lenda', searchDepth: 3, accuracy: 0.99, knowledge: 10, actionNoise: 0.15 },
];

export const getAiDifficultyProfile = (level = 0) => {
  const normalized = Math.max(0, Math.min(10, Math.round(Number(level) || 0)));
  return AI_DIFFICULTY_PROFILES[normalized];
};

export default getAiDifficultyProfile;
