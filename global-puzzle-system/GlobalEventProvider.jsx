import { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentEvent,
  completeGlobalEvent,
  subscribeToEvents,
} from '../../lib/supabase';

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
// Manages 12-hour collaborative puzzle events
// ═══════════════════════════════════════════════════════════════

export function GlobalEventProvider({ children }) {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localStartTime, setLocalStartTime] = useState(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [completionData, setCompletionData] = useState(null);

  // Load current event on mount
  useEffect(() => {
    loadCurrentEvent();
  }, []);

  // Subscribe to event changes
  useEffect(() => {
    const unsubscribe = subscribeToEvents((payload) => {
      if (payload.eventType === 'UPDATE') {
        const updatedEvent = payload.new;
        
        // If event was just completed by someone, show notification
        if (updatedEvent.completed_at && !currentEvent?.completed_at) {
          setCompletionData({
            title: updatedEvent.title,
            completedBy: updatedEvent.completed_by,
            completedAt: updatedEvent.completed_at,
            rewards: updatedEvent.rewards,
          });
          setShowCompletionPopup(true);
        }
        
        setCurrentEvent(updatedEvent);
      } else if (payload.eventType === 'INSERT') {
        // New event created
        setCurrentEvent(payload.new);
        setLocalStartTime(null);
      }
    });

    return unsubscribe;
  }, [currentEvent]);

  async function loadCurrentEvent() {
    setLoading(true);
    const event = await getCurrentEvent();
    setCurrentEvent(event);
    setLoading(false);
  }

  /**
   * Start working on the current event (tracks local time)
   */
  function startEvent() {
    if (!currentEvent) return;
    setLocalStartTime(Date.now());
  }

  /**
   * Submit a solution to the current event
   */
  async function submitSolution(solution, userId) {
    if (!currentEvent || !localStartTime) {
      return { success: false, error: 'No active event or not started' };
    }

    const timeTaken = Math.floor((Date.now() - localStartTime) / 1000); // seconds

    const result = await completeGlobalEvent(
      currentEvent.event_id,
      userId,
      timeTaken,
      solution
    );

    if (result.success) {
      // User completed it first!
      setCompletionData({
        title: currentEvent.title,
        completedBy: userId,
        completedAt: new Date().toISOString(),
        rewards: currentEvent.rewards,
        firstComplete: true,
      });
      setShowCompletionPopup(true);
      
      // Reload event to get updated state
      await loadCurrentEvent();
    }

    return result;
  }

  /**
   * Dismiss the completion popup
   */
  function dismissPopup() {
    setShowCompletionPopup(false);
  }

  /**
   * Get time remaining for current event
   */
  function getTimeRemaining() {
    if (!currentEvent?.started_at) return null;

    const startTime = new Date(currentEvent.started_at);
    const endTime = new Date(startTime.getTime() + 12 * 60 * 60 * 1000); // 12 hours
    const now = new Date();
    const remaining = endTime - now;

    if (remaining <= 0) return { expired: true };

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, expired: false };
  }

  const value = {
    currentEvent,
    loading,
    localStartTime,
    startEvent,
    submitSolution,
    getTimeRemaining,
    showCompletionPopup,
    completionData,
    dismissPopup,
    refreshEvent: loadCurrentEvent,
  };

  return (
    <GlobalEventContext.Provider value={value}>
      {children}
    </GlobalEventContext.Provider>
  );
}
