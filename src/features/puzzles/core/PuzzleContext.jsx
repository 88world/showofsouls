import { createContext, useContext, useState, useEffect } from 'react';
import { useGameStore } from '../../../store';
import { getPuzzleById, getAdjustedTime } from '../config/puzzleRegistry';
import { DIFFICULTY_LEVELS } from '../config/difficultyConfig';

// ═══════════════════════════════════════════════════════════════
// PUZZLE CONTEXT
// Provides puzzle state and actions to puzzle components
// ═══════════════════════════════════════════════════════════════

const PuzzleContext = createContext(null);

export const usePuzzleContext = () => {
  const context = useContext(PuzzleContext);
  if (!context) {
    throw new Error('usePuzzleContext must be used within PuzzleProvider');
  }
  return context;
};

export const PuzzleProvider = ({ 
  puzzleId, 
  children,
  difficulty = DIFFICULTY_LEVELS.MEDIUM,
  onComplete,
  onClose,
}) => {
  const puzzleConfig = getPuzzleById(puzzleId);
  const { completePuzzle, incrementAttempts, unlockContent } = useGameStore();
  
  // Puzzle state
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);

  // Initialize puzzle
  useEffect(() => {
    if (!puzzleConfig) return;
    
    const adjustedTime = getAdjustedTime(puzzleConfig.baseTime, difficulty);
    setTimeRemaining(adjustedTime);
  }, [puzzleConfig, difficulty]);

  // Timer logic
  useEffect(() => {
    if (!isActive || timeRemaining === null || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeRemaining]);

  // Actions
  const startPuzzle = () => {
    setIsActive(true);
    setStartTime(Date.now());
  };

  const pausePuzzle = () => {
    setIsActive(false);
  };

  const resumePuzzle = () => {
    setIsActive(true);
  };

  const handleAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    incrementAttempts(puzzleId);
    return newAttempts;
  };

  const handleHint = () => {
    setHintsUsed((prev) => prev + 1);
  };

  const handleTimeout = () => {
    setIsActive(false);
    setFailed(true);
    handleAttempt();
  };

  const handleSuccess = (metadata = {}) => {
    if (completed) return;

    setIsActive(false);
    setCompleted(true);

    const endTime = Date.now();
    const timeTaken = startTime ? Math.floor((endTime - startTime) / 1000) : 0;

    // Save to store
    completePuzzle(puzzleId, {
      time: timeTaken,
      difficulty,
      hintsUsed,
      attempts: attempts + 1,
      ...metadata,
    });

    // Unlock rewards
    if (puzzleConfig?.rewards) {
      puzzleConfig.rewards.forEach((rewardId) => {
        unlockContent(rewardId);
      });
    }

    // Callback
    if (onComplete) {
      onComplete({
        puzzleId,
        timeTaken,
        difficulty,
        hintsUsed,
        attempts: attempts + 1,
      });
    }
  };

  const handleFailure = () => {
    setIsActive(false);
    setFailed(true);
    handleAttempt();
  };

  const resetPuzzle = () => {
    setIsActive(false);
    setCompleted(false);
    setFailed(false);
    setAttempts(0);
    setHintsUsed(0);
    setStartTime(null);
    
    const adjustedTime = getAdjustedTime(puzzleConfig.baseTime, difficulty);
    setTimeRemaining(adjustedTime);
  };

  const closePuzzle = () => {
    if (onClose) {
      onClose();
    }
  };

  const value = {
    // Config
    puzzleId,
    puzzleConfig,
    difficulty,

    // State
    isActive,
    timeRemaining,
    attempts,
    hintsUsed,
    startTime,
    completed,
    failed,

    // Actions
    startPuzzle,
    pausePuzzle,
    resumePuzzle,
    handleAttempt,
    handleHint,
    handleSuccess,
    handleFailure,
    resetPuzzle,
    closePuzzle,
  };

  return (
    <PuzzleContext.Provider value={value}>
      {children}
    </PuzzleContext.Provider>
  );
};

export default PuzzleContext;
