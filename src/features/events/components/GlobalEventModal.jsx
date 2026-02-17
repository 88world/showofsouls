import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalEvent } from '../GlobalEventProvider';
import './GlobalEventModal.css';

// ═══════════════════════════════════════════════════════════════
// GLOBAL EVENT MODAL
// Interactive puzzle interface for 12-hour events
// ═══════════════════════════════════════════════════════════════

export default function GlobalEventModal({ isOpen, onClose, event }) {
  const { startEvent, submitSolution, localStartTime } = useGlobalEvent();
  const [solution, setSolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Auto-start if not started
  useEffect(() => {
    if (isOpen && !localStartTime && !hasStarted) {
      startEvent();
      setHasStarted(true);
    }
  }, [isOpen, localStartTime, hasStarted, startEvent]);

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!solution.trim()) return;

    setIsSubmitting(true);
    setError(null);

    // Generate a unique user ID (in production, use proper auth)
    const userId = localStorage.getItem('investigator_id') || `INV-${Date.now()}`;
    localStorage.setItem('investigator_id', userId);

    const result = await submitSolution(solution.trim(), userId);

    setIsSubmitting(false);

    if (result.success) {
      // Success! Modal will be closed by the GlobalEventProvider
      // which will show the completion popup instead
      onClose();
    } else if (result.alreadyCompleted) {
      setError('This event has already been completed by another investigator.');
    } else {
      setError(result.error || 'Incorrect solution. Try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="event-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="event-modal"
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="event-modal-header">
              <div className="event-modal-indicator">
                {'>>> GLOBAL EVENT: ACTIVE'}
              </div>
              <button className="event-modal-close" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* Title */}
            <h2 className="event-modal-title">{event.title}</h2>

            {/* Description */}
            {event.description && (
              <p className="event-modal-description">{event.description}</p>
            )}

            {/* Puzzle Content */}
            <div className="event-puzzle-container">
              <div className="puzzle-label">PUZZLE DATA:</div>
              
              {/* Render puzzle based on type */}
              {event.puzzle_data?.type === 'cipher' && (
                <div className="puzzle-cipher">
                  <pre className="cipher-text">{event.puzzle_data.content}</pre>
                  {event.puzzle_data.hint && (
                    <div className="puzzle-hint">
                      HINT: {event.puzzle_data.hint}
                    </div>
                  )}
                </div>
              )}

              {event.puzzle_data?.type === 'riddle' && (
                <div className="puzzle-riddle">
                  <div className="riddle-text">{event.puzzle_data.content}</div>
                  {event.puzzle_data.clues && (
                    <div className="puzzle-clues">
                      <div className="clues-label">CLUES:</div>
                      {event.puzzle_data.clues.map((clue, i) => (
                        <div key={i} className="clue-item">
                          [{i + 1}] {clue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {event.puzzle_data?.type === 'code' && (
                <div className="puzzle-code">
                  <pre className="code-block">{event.puzzle_data.content}</pre>
                  {event.puzzle_data.instructions && (
                    <div className="puzzle-instructions">
                      {event.puzzle_data.instructions}
                    </div>
                  )}
                </div>
              )}

              {/* Generic fallback */}
              {!['cipher', 'riddle', 'code'].includes(event.puzzle_data?.type) && (
                <div className="puzzle-generic">
                  <pre className="generic-content">
                    {JSON.stringify(event.puzzle_data, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Solution Form */}
            <form onSubmit={handleSubmit} className="event-solution-form">
              <label className="solution-label">
                ENTER SOLUTION:
              </label>
              <input
                type="text"
                className="solution-input"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Type your answer..."
                disabled={isSubmitting}
                autoFocus
              />
              
              {error && (
                <div className="solution-error">
                  ⚠ {error}
                </div>
              )}

              <button
                type="submit"
                className="solution-submit-btn"
                disabled={isSubmitting || !solution.trim()}
              >
                {isSubmitting ? 'VERIFYING...' : 'SUBMIT SOLUTION'}
              </button>
            </form>

            {/* Footer */}
            <div className="event-modal-footer">
              <div className="footer-warning">
                ⚠ This is a global event. Once solved by any investigator,
                rewards will be unlocked for everyone.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
