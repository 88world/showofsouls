import { DIFFICULTY_LEVELS } from './difficultyConfig';

// ═══════════════════════════════════════════════════════════════
// PUZZLE REGISTRY
// Central configuration for all puzzles in the game
// ═══════════════════════════════════════════════════════════════

export const PUZZLE_IDS = {
  PASSWORD_TERMINAL: 'passwordTerminal',
  MEMORY_GAME: 'memoryGame',
  CIPHER_WHEEL: 'cipherWheel',
  SIGNAL_TRACKER: 'signalTracker',
  BIOLOGICAL_ANALYZER: 'biologicalAnalyzer',
  SEQUENCE_DECODER: 'sequenceDecoder',
  ENTITY_MATCHER: 'entityMatcher',
  // ── Recording puzzles ──
  MORSE_DECODER: 'morseDecoder',
  FREQUENCY_TUNER: 'frequencyTuner',
  WAVEFORM_MATCH: 'waveformMatch',
  SIGNAL_SCRAMBLE: 'signalScramble',
  WIRE_SPLICE: 'wireSplice',
  // ── Document puzzles ──
  REDACTION_REVEAL: 'redactionReveal',
  FILE_DECRYPTOR: 'fileDecryptor',
  KEYPAD_LOCK: 'keypadLock',
  PATTERN_GRID: 'patternGrid',
  JIGSAW_FRAGMENT: 'jigsawFragment',
};

export const PUZZLE_REGISTRY = {
  [PUZZLE_IDS.PASSWORD_TERMINAL]: {
    id: PUZZLE_IDS.PASSWORD_TERMINAL,
    name: 'Encrypted Terminal',
    description: 'Decrypt the access code to unlock classified files',
    difficulty: DIFFICULTY_LEVELS.EASY,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 180,
    icon: '🔐',
    tags: ['logic', 'investigation'],
    enabled: true,
  },
  
  [PUZZLE_IDS.MEMORY_GAME]: {
    id: PUZZLE_IDS.MEMORY_GAME,
    name: 'Neural Pattern Sync',
    description: 'Match Flora\'s neural patterns to unlock memories',
    difficulty: DIFFICULTY_LEVELS.EASY,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 120,
    icon: '🧠',
    tags: ['memory', 'pattern'],
    enabled: true,
  },

  [PUZZLE_IDS.CIPHER_WHEEL]: {
    id: PUZZLE_IDS.CIPHER_WHEEL,
    name: 'Cipher Wheel',
    description: 'Rotate triple rings to decrypt Flora\'s research notes',
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    storyPhase: 1,
    unlockConditions: [PUZZLE_IDS.PASSWORD_TERMINAL],
    rewards: ['document_flora_origin', 'audioLog_research'],
    baseTime: 180, // 3 minutes
    icon: '⚙️',
    tags: ['cipher', 'botanical'],
    enabled: false, // Phase 4
  },

  [PUZZLE_IDS.SIGNAL_TRACKER]: {
    id: PUZZLE_IDS.SIGNAL_TRACKER,
    name: 'Signal Tracker',
    description: 'Use audio cues to triangulate distress signals',
    difficulty: DIFFICULTY_LEVELS.HARD,
    storyPhase: 1,
    unlockConditions: [PUZZLE_IDS.PASSWORD_TERMINAL, PUZZLE_IDS.MEMORY_GAME],
    rewards: ['audioLog_survivors', 'map_locations'],
    baseTime: 300, // 5 minutes
    icon: '📡',
    tags: ['audio', 'tracking'],
    enabled: false, // Phase 4
  },

  [PUZZLE_IDS.BIOLOGICAL_ANALYZER]: {
    id: PUZZLE_IDS.BIOLOGICAL_ANALYZER,
    name: 'Biological Analyzer',
    description: 'Identify Flora patterns before Pyro spreads',
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    storyPhase: 2,
    unlockConditions: [PUZZLE_IDS.CIPHER_WHEEL],
    rewards: ['document_mutation_study', 'achievement_biologist'],
    baseTime: 240, // 4 minutes
    icon: '🔬',
    tags: ['pattern', 'biology', 'timed'],
    enabled: false, // Phase 4
  },

  [PUZZLE_IDS.SEQUENCE_DECODER]: {
    id: PUZZLE_IDS.SEQUENCE_DECODER,
    name: 'Sequence Decoder',
    description: 'Multi-stage logic puzzle with visual, audio, and binary',
    difficulty: DIFFICULTY_LEVELS.HARD,
    storyPhase: 2,
    unlockConditions: [PUZZLE_IDS.SIGNAL_TRACKER],
    rewards: ['document_true_cause', 'achievement_decoder'],
    baseTime: 420, // 7 minutes
    icon: '🔢',
    tags: ['logic', 'sequence', 'multi-stage'],
    enabled: false, // Phase 4
  },

  [PUZZLE_IDS.ENTITY_MATCHER]: {
    id: PUZZLE_IDS.ENTITY_MATCHER,
    name: 'Entity Matcher',
    description: 'Track the Entity through surveillance footage',
    difficulty: DIFFICULTY_LEVELS.NIGHTMARE,
    storyPhase: 3,
    unlockConditions: [
      PUZZLE_IDS.BIOLOGICAL_ANALYZER,
      PUZZLE_IDS.SEQUENCE_DECODER,
    ],
    rewards: ['document_entity_prediction', 'achievement_master_solver'],
    baseTime: 240, // 4 minutes
    icon: '👁️',
    tags: ['horror', 'observation', 'precision'],
    enabled: false, // Phase 4
  },

  // ═══════════════════════════════════════════════════════════
  // RECORDING PUZZLES (local unlock)
  // ═══════════════════════════════════════════════════════════

  [PUZZLE_IDS.MORSE_DECODER]: {
    id: PUZZLE_IDS.MORSE_DECODER,
    name: 'Morse Decoder',
    description: 'Decode the morse code transmission',
    difficulty: DIFFICULTY_LEVELS.EASY,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 120,
    icon: '📻',
    tags: ['audio', 'morse'],
    enabled: true,
    category: 'recording',
  },

  [PUZZLE_IDS.FREQUENCY_TUNER]: {
    id: PUZZLE_IDS.FREQUENCY_TUNER,
    name: 'Frequency Tuner',
    description: 'Tune into the correct radio frequency',
    difficulty: DIFFICULTY_LEVELS.EASY,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 90,
    icon: '📡',
    tags: ['audio', 'tuning'],
    enabled: true,
    category: 'recording',
  },

  [PUZZLE_IDS.WAVEFORM_MATCH]: {
    id: PUZZLE_IDS.WAVEFORM_MATCH,
    name: 'Waveform Match',
    description: 'Recreate the target audio waveform',
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 150,
    icon: '〰️',
    tags: ['pattern', 'audio'],
    enabled: true,
    category: 'recording',
  },

  [PUZZLE_IDS.SIGNAL_SCRAMBLE]: {
    id: PUZZLE_IDS.SIGNAL_SCRAMBLE,
    name: 'Signal Scramble',
    description: 'Unscramble the corrupted transmission',
    difficulty: DIFFICULTY_LEVELS.EASY,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 120,
    icon: '🔀',
    tags: ['word', 'anagram'],
    enabled: true,
    category: 'recording',
  },

  [PUZZLE_IDS.WIRE_SPLICE]: {
    id: PUZZLE_IDS.WIRE_SPLICE,
    name: 'Wire Splice',
    description: 'Reconnect the severed wires',
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 120,
    icon: '🔌',
    tags: ['logic', 'wiring'],
    enabled: true,
    category: 'recording',
  },

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT PUZZLES (local unlock)
  // ═══════════════════════════════════════════════════════════

  [PUZZLE_IDS.REDACTION_REVEAL]: {
    id: PUZZLE_IDS.REDACTION_REVEAL,
    name: 'Redaction Reveal',
    description: 'Uncover the classified document',
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 120,
    icon: '📄',
    tags: ['logic', 'text'],
    enabled: true,
    category: 'document',
  },

  [PUZZLE_IDS.FILE_DECRYPTOR]: {
    id: PUZZLE_IDS.FILE_DECRYPTOR,
    name: 'File Decryptor',
    description: 'Collect hex fragments to decrypt the file',
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 180,
    icon: '🔑',
    tags: ['code', 'hex'],
    enabled: true,
    category: 'document',
  },

  [PUZZLE_IDS.KEYPAD_LOCK]: {
    id: PUZZLE_IDS.KEYPAD_LOCK,
    name: 'Keypad Lock',
    description: 'Enter the access code to unlock the file',
    difficulty: DIFFICULTY_LEVELS.EASY,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 120,
    icon: '🔢',
    tags: ['logic', 'code'],
    enabled: true,
    category: 'document',
  },

  [PUZZLE_IDS.PATTERN_GRID]: {
    id: PUZZLE_IDS.PATTERN_GRID,
    name: 'Pattern Grid',
    description: 'Calibrate the neural network pattern',
    difficulty: DIFFICULTY_LEVELS.HARD,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 240,
    icon: '⬛',
    tags: ['logic', 'grid'],
    enabled: true,
    category: 'document',
  },

  [PUZZLE_IDS.JIGSAW_FRAGMENT]: {
    id: PUZZLE_IDS.JIGSAW_FRAGMENT,
    name: 'Jigsaw Fragment',
    description: 'Reconstruct the torn document',
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 120,
    icon: '🧩',
    tags: ['spatial', 'drag'],
    enabled: true,
    category: 'document',
  },
};

// Helper functions
export const getPuzzleById = (puzzleId) => {
  return PUZZLE_REGISTRY[puzzleId] || null;
};

export const getAvailablePuzzles = (completedPuzzleIds = []) => {
  return Object.values(PUZZLE_REGISTRY).filter((puzzle) => {
    if (!puzzle.enabled) return false;
    
    // Check if all unlock conditions are met
    return puzzle.unlockConditions.every((conditionId) =>
      completedPuzzleIds.includes(conditionId)
    );
  });
};

export const getPuzzlesByPhase = (phase) => {
  return Object.values(PUZZLE_REGISTRY).filter(
    (puzzle) => puzzle.storyPhase === phase
  );
};

export const getTotalPuzzles = () => {
  return Object.keys(PUZZLE_REGISTRY).length;
};

export const getCompletionPercentage = (completedPuzzleIds = []) => {
  const total = getTotalPuzzles();
  const completed = completedPuzzleIds.length;
  return Math.round((completed / total) * 100);
};
