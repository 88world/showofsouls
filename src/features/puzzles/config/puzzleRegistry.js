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
  SPECTRAL_ANALYSIS: 'spectralAnalysis',
  ECHO_RESONANCE: 'echoResonance',
  PHASE_ALIGNMENT: 'phaseAlignment',
  HARMONIC_DECOMPOSITION: 'harmonicDecomposition',
  // ── Document puzzles ──
  REDACTION_REVEAL: 'redactionReveal',
  FILE_DECRYPTOR: 'fileDecryptor',
  KEYPAD_LOCK: 'keypadLock',
  PATTERN_GRID: 'patternGrid',
  JIGSAW_FRAGMENT: 'jigsawFragment',
  CRYPTIC_CODEX: 'crypticCodex',
  BINARY_DECODE: 'binaryDecode',
  SYMBOL_MATRIX: 'symbolMatrix',
  LAYERED_ARCHIVE: 'layeredArchive',
  CORRUPTION_PURGE: 'corruptionPurge',
  // New global event puzzles
  POWER_CURRENT: 'powerCurrent',
  QUANTUM_CIPHER: 'quantumCipher',
  RELAY_CALIBRATION: 'relayCalibration',
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
    icon: 'Lock',
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
    icon: 'Brain',
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
    icon: 'Settings',
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
    icon: 'Radio',
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
    icon: 'Code',
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
    icon: 'Eye',
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
    icon: 'Signal',
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
    icon: 'Radio',
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
    icon: 'Music',
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
    icon: 'Grid3x3',
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
    icon: 'Zap',
    tags: ['logic', 'wiring'],
    enabled: true,
    category: 'recording',
  },

  // Additional recording puzzles for total of 10
  [PUZZLE_IDS.SPECTRAL_ANALYSIS]: {
    id: PUZZLE_IDS.SPECTRAL_ANALYSIS,
    name: 'Spectral Analysis',
    description: 'Analyze the anomalous frequency patterns in the transmission',
    difficulty: DIFFICULTY_LEVELS.HARD,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 240,
    icon: 'Activity',
    tags: ['analysis', 'frequency', 'global_event'],
    enabled: true,
    category: 'recording',
  },

  [PUZZLE_IDS.ECHO_RESONANCE]: {
    id: PUZZLE_IDS.ECHO_RESONANCE,
    name: 'Echo Resonance',
    description: 'Match the echo patterns to unlock the hidden message',
    difficulty: DIFFICULTY_LEVELS.HARD,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 200,
    icon: 'Music',
    tags: ['audio', 'pattern', 'resonance'],
    enabled: true,
    category: 'recording',
  },

  [PUZZLE_IDS.PHASE_ALIGNMENT]: {
    id: PUZZLE_IDS.PHASE_ALIGNMENT,
    name: 'Phase Alignment',
    description: 'Synchronize overlapping audio layers to reveal the signal',
    difficulty: DIFFICULTY_LEVELS.HARD,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 210,
    icon: 'Loader',
    tags: ['audio', 'sync', 'complex'],
    enabled: true,
    category: 'recording',
  },

  [PUZZLE_IDS.HARMONIC_DECOMPOSITION]: {
    id: PUZZLE_IDS.HARMONIC_DECOMPOSITION,
    name: 'Harmonic Decomposition',
    description: 'Break down complex audio harmonics to find the core frequency',
    difficulty: DIFFICULTY_LEVELS.NIGHTMARE,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 300,
    icon: 'Music',
    tags: ['audio', 'analysis', 'expert'],
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
    icon: 'Book',
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
    icon: 'Unlock',
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
    icon: 'Code',
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
    icon: 'Grid3x3',
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
    icon: 'Puzzle',
    tags: ['spatial', 'drag'],
    enabled: true,
    category: 'document',
  },

  // Additional document puzzles for total of 10
  [PUZZLE_IDS.CRYPTIC_CODEX]: {
    id: PUZZLE_IDS.CRYPTIC_CODEX,
    name: 'Cryptic Codex',
    description: 'Decipher the ancient cipher system binding the documents',
    difficulty: DIFFICULTY_LEVELS.NIGHTMARE,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 300,
    icon: 'Book',
    tags: ['cipher', 'expert', 'text'],
    enabled: true,
    category: 'document',
  },

  [PUZZLE_IDS.BINARY_DECODE]: {
    id: PUZZLE_IDS.BINARY_DECODE,
    name: 'Binary Decode',
    description: 'Convert binary sequences to reveal encrypted document contents',
    difficulty: DIFFICULTY_LEVELS.HARD,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 240,
    icon: 'Code',
    tags: ['code', 'binary', 'complex'],
    enabled: true,
    category: 'document',
  },

  [PUZZLE_IDS.SYMBOL_MATRIX]: {
    id: PUZZLE_IDS.SYMBOL_MATRIX,
    name: 'Symbol Matrix',
    description: 'Solve a multi-layered grid of symbolic relationships',
    difficulty: DIFFICULTY_LEVELS.HARD,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 280,
    icon: 'Grid3x3',
    tags: ['logic', 'matrix', 'spatial'],
    enabled: true,
    category: 'document',
  },

  [PUZZLE_IDS.LAYERED_ARCHIVE]: {
    id: PUZZLE_IDS.LAYERED_ARCHIVE,
    name: 'Layered Archive',
    description: 'Navigate through stacked document layers to find the truth',
    difficulty: DIFFICULTY_LEVELS.NIGHTMARE,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 320,
    icon: 'Book',
    tags: ['logic', 'sequential', 'expert'],
    enabled: true,
    category: 'document',
  },

  [PUZZLE_IDS.CORRUPTION_PURGE]: {
    id: PUZZLE_IDS.CORRUPTION_PURGE,
    name: 'Corruption Purge',
    description: 'Identify and remove corrupted data blocks from the file',
    difficulty: DIFFICULTY_LEVELS.HARD,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 200,
    icon: 'Settings',
    tags: ['pattern', 'analysis', 'cleanup'],
    enabled: true,
    category: 'document',
  },

  // Custom global-event-only puzzles
  [PUZZLE_IDS.POWER_CURRENT]: {
    id: PUZZLE_IDS.POWER_CURRENT,
    name: 'Power Current',
    description: 'Rotate tiles to route power from source to target. High-quality tiles amplify current and provide shortcuts.',
    difficulty: DIFFICULTY_LEVELS.NIGHTMARE,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 300,
    icon: 'Zap',
    tags: ['logic','routing','expert'],
    enabled: true,
    category: 'global',
  },

  [PUZZLE_IDS.QUANTUM_CIPHER]: {
    id: PUZZLE_IDS.QUANTUM_CIPHER,
    name: 'Quantum Cipher',
    description: 'Decode a multi-layer symbol cipher using combined hint streams.',
    difficulty: DIFFICULTY_LEVELS.NIGHTMARE,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 300,
    icon: 'Lock',
    tags: ['cipher', 'multi-stage', 'expert'],
    enabled: true,
    category: 'global',
  },

  [PUZZLE_IDS.RELAY_CALIBRATION]: {
    id: PUZZLE_IDS.RELAY_CALIBRATION,
    name: 'Relay Calibration',
    description: 'Cycle relay nodes to match the hidden target signature.',
    difficulty: DIFFICULTY_LEVELS.NIGHTMARE,
    storyPhase: 0,
    unlockConditions: [],
    rewards: [],
    baseTime: 240,
    icon: 'Signal',
    tags: ['logic', 'matrix', 'global_event'],
    enabled: true,
    category: 'global',
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
