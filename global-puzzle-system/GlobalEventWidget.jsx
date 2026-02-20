import { useState, useEffect } from 'react';
import { useGlobalEvent } from '../GlobalEventProvider';
import { motion, AnimatePresence } from 'framer-motion';
import './GlobalEventWidget.css';

// ═══════════════════════════════════════════════════════════════
// GLOBAL EVENT WIDGET
// Shows current 12-hour event status and countdown
// ═══════════════════════════════════════════════════════════════

export default function GlobalEventWidget({ onOpenEvent }) {
  const { currentEvent, loading, getTimeRemaining } = useGlobalEvent();
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update countdown every second
  useEffect(() => {
    if (!currentEvent) return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentEvent, getTimeRemaining]);

  if (loading) {
    return (
      <div className="global-event-widget widget-loading">
        <div className="widget-status">LOADING EVENT DATA...</div>
      </div>
    );
  }

  if (!currentEvent) {
    return (
      <div className="global-event-widget widget-inactive">
        <div className="widget-status">NO ACTIVE GLOBAL EVENT</div>
        <div className="widget-subtitle">Next event scheduled soon</div>
      </div>
    );
  }

  const isCompleted = !!currentEvent.completed_at;
  const isExpired = timeRemaining?.expired;

  return (
    <motion.div
      className={`global-event-widget ${isCompleted ? 'widget-completed' : 'widget-active'} ${isExpanded ? 'widget-expanded' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => !isCompleted && !isExpired && setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="widget-header">
        <div className="widget-indicator">
          {isCompleted ? (
            <span className="indicator-completed">COMPLETED</span>
          ) : isExpired ? (
            <span className="indicator-expired">EXPIRED</span>
          ) : (
            <span className="indicator-active">ACTIVE</span>
          )}
        </div>
        
        {!isCompleted && !isExpired && timeRemaining && (
          <div className="widget-countdown">
            {String(timeRemaining.hours).padStart(2, '0')}:
            {String(timeRemaining.minutes).padStart(2, '0')}:
            {String(timeRemaining.seconds).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="widget-title">{currentEvent.title}</div>

      {/* Description (when expanded) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="widget-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <p className="widget-description">{currentEvent.description}</p>
            
            {!isCompleted && !isExpired && (
              <button
                className="widget-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEvent?.(currentEvent);
                }}
              >
                START INVESTIGATION
              </button>
            )}

            {isCompleted && (
              <div className="widget-completion-info">
                <div className="completion-line">
                  Solved by: <strong>{currentEvent.completed_by || 'ANONYMOUS'}</strong>
                </div>
                <div className="completion-line">
                  Time: {new Date(currentEvent.completed_at).toLocaleString()}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer status */}
      {!isExpanded && (
        <div className="widget-footer">
          {isCompleted ? (
            <span>Rewards unlocked globally</span>
          ) : isExpired ? (
            <span>Event window closed</span>
          ) : (
            <span>Click to view details</span>
          )}
        </div>
      )}
    </motion.div>
  );
}
