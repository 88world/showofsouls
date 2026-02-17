import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalEvent } from '../GlobalEventProvider';
import './CompletionPopup.css';

// ═══════════════════════════════════════════════════════════════
// GLOBAL EVENT COMPLETION NOTIFICATION
// Shows when a collaborative puzzle is solved globally
// ═══════════════════════════════════════════════════════════════

export default function CompletionPopup() {
  const { showCompletionPopup, completionData, dismissPopup } = useGlobalEvent();

  if (!completionData) return null;

  const { title, completedBy, completedAt, rewards, firstComplete } = completionData;

  const completedDate = new Date(completedAt);
  const formattedTime = completedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <AnimatePresence>
      {showCompletionPopup && (
        <motion.div
          className="completion-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="completion-popup"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
          >
            {/* Header */}
            <div className="completion-header">
              <div className="completion-indicator">
                {firstComplete ? '\u003E\u003E\u003E FIRST COMPLETION' : '\u003E\u003E\u003E GLOBAL EVENT COMPLETED'}
              </div>
              <div className="completion-line" />
            </div>

            {/* Body */}
            <div className="completion-body">
              <h2 className="completion-title">{title}</h2>
              
              <div className="completion-meta">
                <div className="meta-row">
                  <span className="meta-label">COMPLETED BY:</span>
                  <span className="meta-value">{completedBy || 'ANONYMOUS'}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">TIMESTAMP:</span>
                  <span className="meta-value">{formattedTime}</span>
                </div>
              </div>

              {/* Rewards */}
              {rewards && (
                <div className="completion-rewards">
                  <div className="rewards-header">REWARDS UNLOCKED:</div>
                  {rewards.tapes && rewards.tapes.length > 0 && (
                    <div className="reward-item">
                      + {rewards.tapes.length} CLASSIFIED TAPE(S)
                    </div>
                  )}
                  {rewards.lore && (
                    <div className="reward-item">
                      + NEW INVESTIGATION FILE
                    </div>
                  )}
                  {rewards.news && (
                    <div className="reward-item">
                      + BREAKING NEWS ARTICLE
                    </div>
                  )}
                </div>
              )}

              {/* Message */}
              <div className="completion-message">
                {firstComplete ? (
                  <>
                    You solved this global event first!<br />
                    All investigators now have access to the rewards.
                  </>
                ) : (
                  <>
                    Another investigator solved this event.<br />
                    The rewards are now available to all.
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="completion-actions">
              <button
                className="completion-btn completion-btn-primary"
                onClick={() => {
                  dismissPopup();
                  // Navigate to rewards (implement navigation logic)
                  if (rewards?.tapes?.length > 0) {
                    window.location.href = '/tapes';
                  }
                }}
              >
                VIEW REWARDS
              </button>
              <button
                className="completion-btn completion-btn-secondary"
                onClick={dismissPopup}
              >
                CONTINUE INVESTIGATING
              </button>
            </div>

            {/* Footer */}
            <div className="completion-footer">
              NEXT EVENT IN: 12:00:00
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
