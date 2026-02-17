import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getCurrentEvent,
  completeGlobalEvent,
  subscribeToEvents,
} from '../../lib/supabase';
import { COLORS } from '../../utils/constants';

const GlobalEventContext = createContext();

export function useGlobalEvent() {
  const context = useContext(GlobalEventContext);
  if (!context) {
    throw new Error('useGlobalEvent must be used within GlobalEventProvider');
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL EVENT PROVIDER
// Tracks puzzle completions as event progress (e.g. 2/5 puzzles)
// Puzzles are scattered as corrupted text triggers across pages
// ═══════════════════════════════════════════════════════════════

export function GlobalEventProvider({ children }) {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const eventRef = useRef(null);

  // Puzzle completion state — persisted per user in localStorage
  const [completedPuzzles, setCompletedPuzzles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sos_event_puzzles') || '[]');
    } catch { return []; }
  });

  // Toast notification state
  const [progressToast, setProgressToast] = useState(null);
  const toastTimerRef = useRef(null);

  // Load current event on mount
  useEffect(() => {
    loadCurrentEvent();
  }, []);

  // Persist puzzle completions
  useEffect(() => {
    localStorage.setItem('sos_event_puzzles', JSON.stringify(completedPuzzles));
  }, [completedPuzzles]);

  // Subscribe to event changes
  useEffect(() => {
    const unsubscribe = subscribeToEvents((payload) => {
      if (payload.eventType === 'UPDATE') {
        setCurrentEvent(payload.new);
        eventRef.current = payload.new;
      } else if (payload.eventType === 'INSERT') {
        // New event — reset local puzzle completions
        setCurrentEvent(payload.new);
        eventRef.current = payload.new;
        setCompletedPuzzles([]);
      }
    });

    return unsubscribe;
  }, []);

  async function loadCurrentEvent() {
    setLoading(true);
    const event = await getCurrentEvent();
    setCurrentEvent(event);
    eventRef.current = event;
    setLoading(false);
  }

  /**
   * Get total puzzles required for this event (from event data or fallback)
   */
  const getTotalPuzzles = useCallback(() => {
    if (currentEvent?.puzzle_data?.totalPuzzles) {
      return currentEvent.puzzle_data.totalPuzzles;
    }
    // Default: 5 puzzles needed
    return 5;
  }, [currentEvent]);

  /**
   * Mark a puzzle as completed for the current global event
   * Called when user solves PasswordTerminal, MemoryGame, etc.
   */
  const markPuzzleComplete = useCallback((puzzleId) => {
    setCompletedPuzzles(prev => {
      if (prev.includes(puzzleId)) return prev;
      const updated = [...prev, puzzleId];
      // Show progress toast
      const total = getTotalPuzzles();
      const count = updated.length;
      setProgressToast({ count, total, allDone: count >= total });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setProgressToast(null), 4000);
      return updated;
    });
  }, [getTotalPuzzles]);

  /**
   * Check if a specific puzzle is completed for this event
   */
  const isPuzzleEventComplete = useCallback((puzzleId) => {
    return completedPuzzles.includes(puzzleId);
  }, [completedPuzzles]);

  /**
   * Get number of completed puzzles
   */
  const getCompletedCount = useCallback(() => {
    return completedPuzzles.length;
  }, [completedPuzzles]);

  /**
   * Check if all puzzles are done  
   */
  const allPuzzlesComplete = useCallback(() => {
    return getCompletedCount() >= getTotalPuzzles();
  }, [getCompletedCount, getTotalPuzzles]);

  /**
   * Submit the final solution (after all puzzles completed)
   */
  async function submitSolution(solution, userId) {
    if (!currentEvent) {
      return { success: false, error: 'No active event' };
    }

    const result = await completeGlobalEvent(
      currentEvent.event_id,
      userId,
      0,
      solution
    );

    if (result.success) {
      await loadCurrentEvent();
    }

    return result;
  }

  /**
   * Get time remaining for current event (12-hour window)
   */
  function getTimeRemaining() {
    if (!currentEvent?.started_at) return null;

    const startTime = new Date(currentEvent.started_at);
    const endTime = new Date(startTime.getTime() + 12 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = endTime - now;

    if (remaining <= 0) return { expired: true };

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, expired: false, total: remaining };
  }

  const value = {
    // Event state
    currentEvent,
    loading,
    
    // Puzzle progress
    completedPuzzles,
    markPuzzleComplete,
    isPuzzleEventComplete,
    getTotalPuzzles,
    getCompletedCount,
    allPuzzlesComplete,
    
    // Solution
    submitSolution,
    getTimeRemaining,
    
    // Refresh
    refreshEvent: loadCurrentEvent,
  };

  return (
    <GlobalEventContext.Provider value={value}>
      {children}

      {/* Progress Toast Notification */}
      {progressToast && (
        <div style={{
          position: 'fixed',
          bottom: 30,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          background: '#0a0a0a',
          border: `2px solid ${progressToast.allDone ? COLORS.flora : COLORS.crimson}`,
          padding: '16px 32px',
          boxShadow: `0 0 30px ${progressToast.allDone ? COLORS.flora : COLORS.crimson}40`,
          animation: 'toastSlideIn 0.4s ease',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 22,
            letterSpacing: 3,
            color: progressToast.allDone ? COLORS.flora : COLORS.bone,
            marginBottom: 4,
          }}>
            {progressToast.allDone
              ? 'ALL PUZZLES COMPLETED'
              : `${progressToast.count}/${progressToast.total} PUZZLES COMPLETED`}
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            letterSpacing: 2,
            color: progressToast.allDone ? COLORS.flora : COLORS.crimson,
            opacity: 0.8,
          }}>
            {progressToast.allDone
              ? 'EVENT OBJECTIVE ACHIEVED'
              : 'GLOBAL EVENT PROGRESS SAVED'}
          </div>
          {/* Progress bar */}
          <div style={{
            marginTop: 10,
            height: 3,
            background: `${COLORS.ash}30`,
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(progressToast.count / progressToast.total) * 100}%`,
              background: progressToast.allDone ? COLORS.flora : COLORS.crimson,
              transition: 'width 0.6s ease',
              boxShadow: `0 0 8px ${progressToast.allDone ? COLORS.flora : COLORS.crimson}`,
            }} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(-50%) translateY(30px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </GlobalEventContext.Provider>
  );
}
