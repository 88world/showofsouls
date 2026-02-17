import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ═══════════════════════════════════════════════════════
      // PUZZLE STATE
      // ═══════════════════════════════════════════════════════
      puzzles: {
        passwordTerminal: {
          completed: false,
          attempts: 0,
          bestTime: null,
          lastAttempt: null,
        },
        memoryGame: {
          completed: false,
          highestLevel: 0,
          attempts: 0,
          bestTime: null,
        },
        cipherWheel: {
          completed: false,
          attempts: 0,
          hintsUsed: 0,
          bestTime: null,
        },
        signalTracker: {
          completed: false,
          attempts: 0,
          bestFrequency: null,
          bestTime: null,
        },
        biologicalAnalyzer: {
          completed: false,
          attempts: 0,
          highestStage: 0,
          bestTime: null,
        },
        sequenceDecoder: {
          completed: false,
          attempts: 0,
          highestStage: 0,
          checkpointsReached: [],
          bestTime: null,
        },
        entityMatcher: {
          completed: false,
          attempts: 0,
          correctFrames: 0,
          bestTime: null,
        },
      },

      // ═══════════════════════════════════════════════════════
      // PROGRESSION & STORY
      // ═══════════════════════════════════════════════════════
      unlockedContent: [],
      currentStoryPhase: 0,
      achievementsEarned: [],
      
      // Legacy unlocked secrets (for backward compatibility)
      unlockedSecrets: {
        password: false,
        memoryGame: false,
      },

      // ═══════════════════════════════════════════════════════
      // UI STATE
      // ═══════════════════════════════════════════════════════
      vhsEffectsEnabled: true,
      gameStarted: false,

      // ═══════════════════════════════════════════════════════
      // ACTIONS
      // ═══════════════════════════════════════════════════════
      
      // Complete a puzzle
      completePuzzle: (puzzleId, metadata = {}) => {
        set((state) => {
          const puzzle = state.puzzles[puzzleId];
          if (!puzzle) return state;

          const now = Date.now();
          const updatedPuzzle = {
            ...puzzle,
            completed: true,
            lastAttempt: now,
            ...metadata,
          };

          // Update best time if provided and better than previous
          if (metadata.time && (!puzzle.bestTime || metadata.time < puzzle.bestTime)) {
            updatedPuzzle.bestTime = metadata.time;
          }

          return {
            puzzles: {
              ...state.puzzles,
              [puzzleId]: updatedPuzzle,
            },
          };
        });

        // Check for achievements
        get().checkAchievements();
        
        // Update story phase if needed
        get().updateStoryPhase();
      },

      // Increment puzzle attempts
      incrementAttempts: (puzzleId) => {
        set((state) => ({
          puzzles: {
            ...state.puzzles,
            [puzzleId]: {
              ...state.puzzles[puzzleId],
              attempts: (state.puzzles[puzzleId]?.attempts || 0) + 1,
            },
          },
        }));
      },

      // Unlock content (audio logs, documents, etc.)
      unlockContent: (contentId) => {
        set((state) => {
          if (state.unlockedContent.includes(contentId)) {
            return state;
          }
          return {
            unlockedContent: [...state.unlockedContent, contentId],
          };
        });
      },

      // Earn achievement
      earnAchievement: (achievementId) => {
        set((state) => {
          if (state.achievementsEarned.includes(achievementId)) {
            return state;
          }
          return {
            achievementsEarned: [...state.achievementsEarned, achievementId],
          };
        });
      },

      // Check for new achievements
      checkAchievements: () => {
        const state = get();
        const completedPuzzles = Object.values(state.puzzles).filter(
          (p) => p.completed
        ).length;

        // First puzzle completed
        if (completedPuzzles === 1 && !state.achievementsEarned.includes('first_solve')) {
          state.earnAchievement('first_solve');
        }

        // All puzzles completed
        if (completedPuzzles === 7 && !state.achievementsEarned.includes('master_solver')) {
          state.earnAchievement('master_solver');
        }

        // Speed achievements
        const passwordPuzzle = state.puzzles.passwordTerminal;
        if (passwordPuzzle.bestTime && passwordPuzzle.bestTime < 60000) {
          state.earnAchievement('speed_demon');
        }
      },

      // Update story phase based on completed puzzles
      updateStoryPhase: () => {
        const state = get();
        const completedCount = Object.values(state.puzzles).filter(
          (p) => p.completed
        ).length;

        let newPhase = 0;
        if (completedCount >= 1) newPhase = 1;
        if (completedCount >= 3) newPhase = 2;
        if (completedCount >= 6) newPhase = 3;

        if (newPhase > state.currentStoryPhase) {
          set({ currentStoryPhase: newPhase });
        }
      },

      // Toggle VHS effects
      toggleVHSEffects: () => {
        set((state) => ({
          vhsEffectsEnabled: !state.vhsEffectsEnabled,
        }));
      },

      // Start game (for first-time experience)
      startGame: () => {
        set({ gameStarted: true });
      },

      // Legacy action for backward compatibility
      unlockSecret: (secretKey) => {
        set((state) => ({
          unlockedSecrets: {
            ...state.unlockedSecrets,
            [secretKey]: true,
          },
        }));
      },

      // Reset all progress (for testing or user request)
      resetProgress: () => {
        set({
          puzzles: Object.fromEntries(
            Object.keys(get().puzzles).map((key) => [
              key,
              {
                completed: false,
                attempts: 0,
                bestTime: null,
              },
            ])
          ),
          unlockedContent: [],
          currentStoryPhase: 0,
          achievementsEarned: [],
          unlockedSecrets: {
            password: false,
            memoryGame: false,
          },
          gameStarted: false,
        });
      },

      // Get puzzle statistics
      getPuzzleStats: () => {
        const state = get();
        const puzzles = Object.values(state.puzzles);
        const completed = puzzles.filter((p) => p.completed).length;
        const total = puzzles.length;
        const totalAttempts = puzzles.reduce((sum, p) => sum + (p.attempts || 0), 0);

        return {
          completed,
          total,
          percentage: Math.round((completed / total) * 100),
          totalAttempts,
        };
      },
    }),
    {
      name: 'sos-game-storage',
      version: 1,
    }
  )
);
