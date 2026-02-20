import { motion, AnimatePresence } from 'framer-motion';
import { useTapeUnlocks } from '../../hooks/useTapeUnlocks';
import './TapeUnlockNotification.css';

// ═══════════════════════════════════════════════════════════════
// TAPE UNLOCK NOTIFICATION
// Shows when a tape is unlocked globally by any investigator
// ═══════════════════════════════════════════════════════════════

export default function TapeUnlockNotification() {
  const { newUnlockNotification, dismissNotification } = useTapeUnlocks();

  if (!newUnlockNotification) return null;

  const { tapeId, unlockedBy, timestamp } = newUnlockNotification;

  const unlockTime = new Date(timestamp);
  const formattedTime = unlockTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <AnimatePresence>
      <motion.div
        className="tape-unlock-notification"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="notification-header">
          <div className="notification-indicator">NEW TAPE UNLOCKED</div>
          <button
            className="notification-close"
            onClick={dismissNotification}
            aria-label="Close notification"
          >
            Close
          </button>
        </div>

        <div className="notification-body">
          <div className="notification-tape-id">{tapeId}</div>
          
          <div className="notification-meta">
            <div className="meta-line">
              <span className="meta-label">Unlocked by:</span>
              <span className="meta-value">{unlockedBy || 'ANONYMOUS'}</span>
            </div>
            <div className="meta-line">
              <span className="meta-label">Time:</span>
              <span className="meta-value">{formattedTime}</span>
            </div>
          </div>
        </div>

        <div className="notification-footer">
          <a href="/tapes" className="notification-link">
            {'View in Archive →'}
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
