import { useState, useEffect } from 'react';
import {
  getAllTapes,
  getUnlockedTapes,
  unlockTape,
  subscribeToTapeUnlocks,
} from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// TAPE UNLOCK HOOK
// Manages global tape unlock system with Supabase
// ═══════════════════════════════════════════════════════════════

export function useTapeUnlocks() {
  const [tapes, setTapes] = useState([]);
  const [unlockedTapes, setUnlockedTapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUnlockNotification, setNewUnlockNotification] = useState(null);

  // Load tapes and unlock status on mount
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    const [tapesData, unlocksData] = await Promise.all([
      getAllTapes(),
      getUnlockedTapes(),
    ]);
    setTapes(tapesData);
    setUnlockedTapes(unlocksData);
    setLoading(false);
  }

  // Subscribe to new tape unlocks
  useEffect(() => {
    const unsubscribe = subscribeToTapeUnlocks((payload) => {
      if (payload.eventType === 'INSERT') {
        const newTape = payload.new;
        
        // Add to local state
        setUnlockedTapes((prev) => {
          // Avoid duplicates
          if (prev.some((t) => t.tape_id === newTape.tape_id)) {
            return prev;
          }
          return [...prev, newTape];
        });

        // Show notification
        setNewUnlockNotification({
          tapeId: newTape.tape_id,
          unlockedBy: newTape.unlocked_by,
          timestamp: newTape.unlocked_at,
        });

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          setNewUnlockNotification(null);
        }, 5000);
      }
    });

    return unsubscribe;
  }, []);

  async function loadUnlockedTapes() {
    const data = await getUnlockedTapes();
    setUnlockedTapes(data);
  }

  /**
   * Check if a specific tape is unlocked
   */
  function isTapeUnlocked(tapeId) {
    return unlockedTapes.some((tape) => tape.tape_id === tapeId);
  }

  /**
   * Unlock a tape globally
   */
  async function unlockTapeGlobal(tapeId, userId, method = 'puzzle_completion') {
    // Check if already unlocked
    if (isTapeUnlocked(tapeId)) {
      return { success: false, error: 'Tape already unlocked', alreadyUnlocked: true };
    }

    const result = await unlockTape(tapeId, userId, method);

    if (result.success) {
      // Add to local state immediately (before real-time subscription fires)
      setUnlockedTapes((prev) => [...prev, result.data]);
    }

    return result;
  }

  /**
   * Get unlock info for a specific tape
   */
  function getTapeUnlockInfo(tapeId) {
    return unlockedTapes.find((tape) => tape.tape_id === tapeId) || null;
  }

  /**
   * Dismiss the new unlock notification
   */
  function dismissNotification() {
    setNewUnlockNotification(null);
  }

  return {
    tapes,
    unlockedTapes,
    loading,
    isTapeUnlocked,
    unlockTapeGlobal,
    getTapeUnlockInfo,
    refreshTapes: loadAllData,
    newUnlockNotification,
    dismissNotification,
  };
}
