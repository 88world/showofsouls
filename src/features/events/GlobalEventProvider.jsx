import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  getCurrentEvent,
  completeGlobalEvent,
  subscribeToEvents,
  unlockTape,
  getAllTapes,
  getUnlockedTapes,
} from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../utils/constants';
import BroadcastToast from './components/BroadcastToast';

const GlobalEventContext = createContext();

// Only these 5 puzzles count towards global event completion
// Puzzles from recordings/documents are LOCAL only
const GLOBAL_EVENT_PUZZLE_IDS = [
  'powerCurrent',
  'memoryGame',
  'relayCalibration',
  'frequencyTuner',
  'quantumCipher',
];

export function useGlobalEvent() {
  const context = useContext(GlobalEventContext);
  if (!context) {
    // Return a safe fallback to avoid runtime crashes when the provider
    // is not present (e.g., during SSR or mis-wired trees).
    return {
      currentEvent: null,
      loading: true,
      completedPuzzles: [],
      markPuzzleComplete: () => {},
      isPuzzleEventComplete: () => false,
      getTotalPuzzles: () => 5,
      getCompletedCount: () => 0,
      allPuzzlesComplete: () => false,
      submitSolution: async () => ({ success: false, error: 'no-event' }),
      getTimeRemaining: () => ({ expired: true }),
      syncEventCompletion: async () => ({ success: false, completed: false }),
      stopEvent: async () => ({ success: false }),
      refreshEvent: async () => {},
      resetProgress: () => {},
    };
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
  const pollingIntervalRef = useRef(null);
  const syncAttemptedRef = useRef(false);

  // Puzzle completion state — persisted per user in localStorage
  const [completedPuzzles, setCompletedPuzzles] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sos_event_puzzles') || '[]');
    } catch { return []; }
  });

  // Toast notification state
  const [progressToast, setProgressToast] = useState(null);
  const toastTimerRef = useRef(null);
  // Broadcast (global) toast state
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState(null);
  const dismissBroadcast = useCallback(() => {
    setShowBroadcast(false);
    setBroadcastMessage(null);
  }, []);

  // Load current event on mount
  useEffect(() => {
    loadCurrentEvent();
  }, []);

  // Persist puzzle completions
  useEffect(() => {
    localStorage.setItem('sos_event_puzzles', JSON.stringify(completedPuzzles));
  }, [completedPuzzles]);

  // Subscribe to event changes + polling fallback
  useEffect(() => {
    const unsubscribe = subscribeToEvents((payload) => {
      if (payload.eventType === 'UPDATE') {
        setCurrentEvent(payload.new);
        eventRef.current = payload.new;
        // If event was deactivated, clear progress
        if (!payload.new?.is_active && eventRef.current?.is_active) {
          setCompletedPuzzles([]);
          // Show global broadcast that event completed
          setBroadcastMessage({
            type: 'event_completed',
            title: payload.new?.title || 'Global Event',
            firstComplete: true,
            completedBy: payload.new?.completed_by || 'unknown',
            rewards: payload.new?.rewards || null,
          });
          setShowBroadcast(true);
        }
      } else if (payload.eventType === 'INSERT') {
        // New event — reset local puzzle completions
        setCurrentEvent(payload.new);
        eventRef.current = payload.new;
        setCompletedPuzzles([]);
      } else if (payload.eventType === 'DELETE') {
        // Event deleted — clear everything
        setCurrentEvent(null);
        eventRef.current = null;
        setCompletedPuzzles([]);
      }
    });

    // Polling fallback (check every 10 seconds) for real-time subscription failures
    pollingIntervalRef.current = setInterval(() => {
      loadCurrentEvent();
    }, 10000);

    return () => {
      unsubscribe();
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // Debug helpers were moved later to avoid temporal-dead-zone reference errors

  async function loadCurrentEvent() {
    setLoading(true);
    const event = await getCurrentEvent();
    setCurrentEvent(event);
    eventRef.current = event;
    // Reset sync attempt flag when a new event loads
    syncAttemptedRef.current = false;
    
    // If no active event, reset progress
    if (!event) {
      setCompletedPuzzles([]);
    }
    
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
   * Only GLOBAL_EVENT_PUZZLE_IDS count towards event completion
   */
  const markPuzzleComplete = useCallback((puzzleId) => {
    // Only global event puzzles count towards completion
    if (!GLOBAL_EVENT_PUZZLE_IDS.includes(puzzleId)) {
      return; // Local puzzle (recordings/documents), no global event tracking
    }
    
    // Verify event is still active
    if (!eventRef.current?.is_active) return;
    
    setCompletedPuzzles(prev => {
      // Don't re-add if already completed
      if (prev.includes(puzzleId)) return prev;
      
      const updated = [...prev, puzzleId];
      const total = getTotalPuzzles();
      const count = updated.length;
      
      // Safety check: prevent going over total
      if (count > total) return prev;
      
      // Show progress toast
      const allDone = count >= total;
      setProgressToast({ count, total, allDone });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setProgressToast(null), 4000);
      
      // If all puzzles completed locally (exactly or over), sync to global
      // Only sync once when threshold is first reached
      if (allDone && prev.length < total) {
        setTimeout(() => {
          syncEventCompletion();
        }, 500);
      }
      
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
   * Get time remaining for current event
   * Events have a 12-hour duration window from when they start
   */
  function getTimeRemaining() {
    if (!currentEvent?.is_active || !currentEvent?.started_at) {
      return { expired: true };
    }

    const startTime = new Date(currentEvent.started_at);
    const endTime = new Date(startTime.getTime() + 12 * 60 * 60 * 1000); // 12 hours
    const now = new Date();
    const remaining = endTime - now;

    if (remaining <= 0) {
      return { expired: true };
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return { 
      hours, 
      minutes, 
      seconds, 
      expired: false, 
      active: true,
      timeString: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  }

  /**
   * Check if all local event puzzles are complete and sync to global
   */
  async function syncEventCompletion() {
    if (!currentEvent?.is_active) return { success: false, completed: false };
    
    const totalRequired = getTotalPuzzles();
    const completedCount = getCompletedCount();

    // Only sync if we have met or exceeded the requirement
    if (completedCount >= totalRequired) {
      try {
        // Mark event record as completed (no solution required for auto-complete)
        const { error: updateError } = await supabase
          .from('global_events')
          .update({ completed_at: new Date().toISOString(), completed_by: 'global_completion', is_active: false })
          .eq('event_id', currentEvent.event_id);

        if (updateError) {
          console.error('Error marking event complete:', updateError);
          return { success: false, completed: false };
        }

        // Unlock the next tape globally (sequential per event)
        try {
          const rewards = typeof currentEvent.rewards === 'string' ? JSON.parse(currentEvent.rewards) : (currentEvent.rewards || {});
          const [tapes, unlocked] = await Promise.all([getAllTapes(), getUnlockedTapes()]);
          const unlockedSet = new Set((unlocked || []).map((t) => t.tape_id));

          let nextTapeId = null;
          if (rewards && Array.isArray(rewards.tapes) && rewards.tapes.length) {
            nextTapeId = rewards.tapes.find((tapeId) => !unlockedSet.has(tapeId)) || null;
          }

          if (!nextTapeId) {
            const sorted = (tapes || []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            const nextTape = sorted.find((t) => !unlockedSet.has(t.tape_id));
            nextTapeId = nextTape?.tape_id || null;
          }

          if (nextTapeId) {
            await unlockTape(nextTapeId, 'global_completion', 'event_auto_unlock');
          }
        } catch (e) {
          // Non-fatal parsing/unlock error
          console.warn('Could not parse or unlock event rewards:', e);
        }

        // Trigger broadcast locally so first-completing user sees immediate feedback
        setBroadcastMessage({
          type: 'event_completed',
          title: currentEvent?.title || 'Global Event',
          firstComplete: true,
          completedBy: 'you',
          rewards: currentEvent?.rewards || null,
        });
        setShowBroadcast(true);

        await loadCurrentEvent();
        return { success: true, completed: true };
      } catch (err) {
        console.error('Error syncing event completion:', err);
        return { success: false, completed: false };
      }
    }

    return { success: false, completed: false };
  }

  // Whenever completedPuzzles changes, check if we've reached the required total and attempt sync once per event
  useEffect(() => {
    if (!currentEvent?.is_active) return;
    const totalRequired = getTotalPuzzles();
    const completedCount = getCompletedCount();
    if (completedCount >= totalRequired && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      // try syncing; if it fails, allow retry later
      syncEventCompletion().then(res => {
        if (!res.success) syncAttemptedRef.current = false;
      });
    }
  }, [completedPuzzles, currentEvent?.event_id]);

  /**
   * Notify provider that a puzzle activity occurred (opened/completed).
   * Pages can call this when they open a puzzle so provider re-checks completion state.
   */
  const notifyPuzzleActivity = useCallback((puzzleId) => {
    if (!GLOBAL_EVENT_PUZZLE_IDS.includes(puzzleId)) return;
    // If we already meet requirement, attempt immediate sync
    const totalRequired = getTotalPuzzles();
    const completedCount = getCompletedCount();
    if (completedCount >= totalRequired) {
      // attempt sync but don't block
      syncEventCompletion();
    }
  }, [getTotalPuzzles, getCompletedCount]);

  // Debug helpers exposed to `window` for quick testing in browser console
  useEffect(() => {
    // Trigger a broadcast message. Pass an object matching BroadcastToast's shape.
    window.triggerEventBroadcast = (msg = {}) => {
      try {
        setBroadcastMessage(msg);
        setShowBroadcast(true);
        return true;
      } catch (e) { return false; }
    };

    // Mark a puzzle complete (calls provider logic)
    window.triggerMarkPuzzleComplete = (puzzleId) => {
      try {
        markPuzzleComplete(puzzleId);
        // Also notify activity which may cause an immediate sync check
        if (notifyPuzzleActivity) notifyPuzzleActivity(puzzleId);
        return true;
      } catch (e) { return false; }
    };

    return () => {
      try { delete window.triggerEventBroadcast; } catch (e) {}
      try { delete window.triggerMarkPuzzleComplete; } catch (e) {}
    };
  }, [markPuzzleComplete, notifyPuzzleActivity]);

  /**
   * Deactivate current event (admin only)
   */
  async function stopEvent() {
    if (!currentEvent) return { success: false, error: 'No active event' };
    
    const { error } = await supabase
      .from('global_events')
      .update({ is_active: false })
      .eq('event_id', currentEvent.event_id);

    if (error) {
      console.error('Error stopping event:', error);
      return { success: false, error: error.message };
    }

    // Clear progress immediately when stopping event
    setCompletedPuzzles([]);
    await loadCurrentEvent();
    return { success: true };
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
    
    // Solution & sync
    submitSolution,
    getTimeRemaining,
    syncEventCompletion,
    stopEvent: () => stopEvent(),
    
    // Refresh
    refreshEvent: loadCurrentEvent,
    resetProgress: () => setCompletedPuzzles([]),
    // Broadcast controls (for global announcements)
    showBroadcast,
    broadcastMessage,
    dismissBroadcast,
    // Notify when a puzzle is opened/completed (pages can call this)
    notifyPuzzleActivity,
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

      {/* Global broadcast toast (event completed / new event) */}
      <BroadcastToast />

      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(-50%) translateY(30px); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
      `}</style>
    </GlobalEventContext.Provider>
  );
}
