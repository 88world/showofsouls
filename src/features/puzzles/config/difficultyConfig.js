// ═══════════════════════════════════════════════════════════════
// DIFFICULTY CONFIGURATION
// Defines difficulty levels and their effects on gameplay
// ═══════════════════════════════════════════════════════════════

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  NIGHTMARE: 'nightmare',
};

export const DIFFICULTY_CONFIG = {
  [DIFFICULTY_LEVELS.EASY]: {
    name: 'Easy',
    label: 'Easy',
    description: 'Relaxed experience with hints',
    color: '#00ff66',
    timeMultiplier: 1.5,
    hintsAvailable: 3,
    attemptsAllowed: 5,
    skipAfterAttempts: 3,
    rewardMultiplier: 1,
  },
  [DIFFICULTY_LEVELS.MEDIUM]: {
    name: 'Medium',
    label: 'Medium',
    description: 'Balanced challenge',
    color: '#d4a017',
    timeMultiplier: 1,
    hintsAvailable: 2,
    attemptsAllowed: 3,
    skipAfterAttempts: 5,
    rewardMultiplier: 1.5,
  },
  [DIFFICULTY_LEVELS.HARD]: {
    name: 'Hard',
    label: 'Hard',
    description: 'Intense pressure',
    color: '#ff4500',
    timeMultiplier: 0.75,
    hintsAvailable: 1,
    attemptsAllowed: 3,
    skipAfterAttempts: 10,
    rewardMultiplier: 2,
  },
  [DIFFICULTY_LEVELS.NIGHTMARE]: {
    name: 'Nightmare',
    label: 'Nightmare',
    description: 'For the brave',
    color: '#c41e1e',
    timeMultiplier: 0.5,
    hintsAvailable: 0,
    attemptsAllowed: 1,
    skipAfterAttempts: null, // Cannot skip
    rewardMultiplier: 3,
  },
};

export const getAdjustedTime = (baseTime, difficulty) => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DIFFICULTY_LEVELS.MEDIUM];
  return Math.floor(baseTime * config.timeMultiplier);
};

export const getHintsAvailable = (difficulty) => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DIFFICULTY_LEVELS.MEDIUM];
  return config.hintsAvailable;
};

export const getAttemptsAllowed = (difficulty) => {
  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DIFFICULTY_LEVELS.MEDIUM];
  return config.attemptsAllowed;
};
