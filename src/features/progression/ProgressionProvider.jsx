import { createContext, useContext, useMemo } from 'react';
import { useGameStore } from '../../store';
import { getAvailablePuzzles, getPuzzlesByPhase, getPuzzleById } from '../puzzles/config/puzzleRegistry';

// ═══════════════════════════════════════════════════════════════
// PROGRESSION PROVIDER
// Manages story phase progression and content unlocking
// ═══════════════════════════════════════════════════════════════

const ProgressionContext = createContext(null);

export const useProgression = () => {
  const context = useContext(ProgressionContext);
  if (!context) {
    throw new Error('useProgression must be used within ProgressionProvider');
  }
  return context;
};

export const ProgressionProvider = ({ children }) => {
  const { 
    puzzles, 
    currentStoryPhase, 
    unlockedContent, 
    achievementsEarned,
    getPuzzleStats 
  } = useGameStore();

  // Get completed puzzle IDs
  const completedPuzzleIds = useMemo(() => {
    return Object.entries(puzzles)
      .filter(([_, puzzle]) => puzzle.completed)
      .map(([id]) => id);
  }, [puzzles]);

  // Get available puzzles based on completion
  const availablePuzzles = useMemo(() => {
    return getAvailablePuzzles(completedPuzzleIds);
  }, [completedPuzzleIds]);

  // Get puzzles by current phase
  const currentPhasePuzzles = useMemo(() => {
    return getPuzzlesByPhase(currentStoryPhase);
  }, [currentStoryPhase]);

  // Check if content is unlocked
  const isContentUnlocked = (contentId) => {
    return unlockedContent.includes(contentId);
  };

  // Check if achievement is earned
  const hasAchievement = (achievementId) => {
    return achievementsEarned.includes(achievementId);
  };

  // Check if puzzle is available
  const isPuzzleAvailable = (puzzleId) => {
    return availablePuzzles.some(p => p.id === puzzleId);
  };

  // Check if puzzle is completed
  const isPuzzleCompleted = (puzzleId) => {
    return puzzles[puzzleId]?.completed || false;
  };

  // Get puzzle progress
  const getPuzzleProgress = (puzzleId) => {
    return puzzles[puzzleId] || null;
  };

  // Get story phase info
  const getStoryPhaseInfo = () => {
    const phases = [
      {
        phase: 0,
        name: 'Initial Investigation',
        description: 'Uncover the first clues',
      },
      {
        phase: 1,
        name: 'Deep Dive',
        description: 'Follow Flora\'s trail',
      },
      {
        phase: 2,
        name: 'Critical Discovery',
        description: 'Reveal the truth',
      },
      {
        phase: 3,
        name: 'Final Confrontation',
        description: 'Face the Entity',
      },
    ];
    return phases[currentStoryPhase] || phases[0];
  };

  const value = {
    // State
    currentStoryPhase,
    completedPuzzleIds,
    availablePuzzles,
    currentPhasePuzzles,
    unlockedContent,
    achievementsEarned,

    // Checkers
    isContentUnlocked,
    hasAchievement,
    isPuzzleAvailable,
    isPuzzleCompleted,

    // Getters
    getPuzzleProgress,
    getPuzzleStats,
    getStoryPhaseInfo,
  };

  return (
    <ProgressionContext.Provider value={value}>
      {children}
    </ProgressionContext.Provider>
  );
};

export default ProgressionProvider;
