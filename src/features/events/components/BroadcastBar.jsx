import { useState, useEffect, useCallback } from 'react';
import { useGlobalEvent } from '../GlobalEventProvider';
import './BroadcastBar.css';

// ═══════════════════════════════════════════════════════════════
// BROADCAST BAR - RETRO TV EMERGENCY BROADCAST
// 
// Fixed bar that shows active event status like a vintage TV
// broadcast interruption. Shows:
//  - Event title
//  - Fragment collection progress (pips)
//  - Countdown timer
//  - Retro TV frame with scanlines
//
// Does NOT overlay the VHS effect — sits below the nav bar
// ═══════════════════════════════════════════════════════════════

export default function BroadcastBar() {
  const { 
    currentEvent, 
    loading, 
    getTimeRemaining, 
    getCollectedCount, 
    getTotalFragments,
    hasFragment,
  } = useGlobalEvent();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Update countdown every second
  useEffect(() => {
    if (!currentEvent) return;

    const tick = () => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [currentEvent, getTimeRemaining]);

  // Reset dismiss state when event changes
  useEffect(() => {
    setIsDismissed(false);
  }, [currentEvent?.event_id]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsDismissed(true);
      setIsExiting(false);
    }, 400);
  }, []);

  // Don't render if no event, loading, dismissed, or expired
  if (loading || !currentEvent || currentEvent.completed_at || isDismissed) return null;
  if (timeRemaining?.expired) return null;

  const totalFragments = getTotalFragments();
  const collectedCount = getCollectedCount();
  const fragments = currentEvent.puzzle_data?.fragments || [];
  const isUrgent = timeRemaining && !timeRemaining.expired && timeRemaining.hours === 0 && timeRemaining.minutes < 30;

  const formatTime = (t) => {
    if (!t || t.expired) return '--:--:--';
    return `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}:${String(t.seconds).padStart(2, '0')}`;
  };

  return (
    <div className={`broadcast-bar ${isExiting ? 'dismissed' : ''}`}>
      <div className="broadcast-frame">
        <div className="broadcast-screen">
          {/* Scanlines & glow — contained to this component only */}
          <div className="broadcast-scanlines" />
          <div className="broadcast-glow" />

          {/* Header — channel info */}
          <div className="broadcast-header">
            <div className="broadcast-channel">
              <div className="broadcast-live-dot" />
              <span>EMERGENCY BROADCAST — CH.47</span>
            </div>
            <button className="broadcast-dismiss" onClick={handleDismiss} title="Dismiss">
              ×
            </button>
          </div>

          {/* Main content */}
          <div className="broadcast-content">
            <div className="broadcast-title-row">
              <span className="broadcast-alert-badge">EVENT</span>
              <h3 className="broadcast-event-title">
                {currentEvent.title || 'CLASSIFIED TRANSMISSION'}
              </h3>
            </div>

            <div className="broadcast-info-row">
              {/* Fragment pips */}
              <div className="broadcast-fragments">
                {fragments.map((frag) => (
                  <div
                    key={frag.id}
                    className={`broadcast-fragment-pip ${hasFragment(frag.id) ? 'collected' : 'missing'}`}
                    title={hasFragment(frag.id) ? `${frag.id}: Collected` : `${frag.id}: Hidden on ${frag.page || 'unknown'} page`}
                  />
                ))}
                {totalFragments > 0 && (
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9,
                    color: '#666',
                    marginLeft: 6,
                    letterSpacing: 1,
                  }}>
                    {collectedCount}/{totalFragments}
                  </span>
                )}
              </div>

              {/* Timer */}
              <div className={`broadcast-timer ${isUrgent ? 'urgent' : ''}`}>
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>

          {/* Bottom ticker */}
          <div className="broadcast-status-strip">
            <span className="broadcast-ticker-text">
              {currentEvent.description || 'STAND BY FOR FURTHER INSTRUCTIONS — DO NOT ADJUST YOUR RECEIVER'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
