import { useState, useEffect } from 'react';
import { useGlobalEvent } from '../GlobalEventProvider';
import './EventDashboard.css';

// ═══════════════════════════════════════════════════════════════
// EVENT DASHBOARD - Retro TV Console
// 
// Full-width component that embeds on the HomePage showing:
//  - Event title, description, countdown timer
//  - Fragment collection grid (which pages have fragments)
//  - Final solution input (when all fragments collected)
//  - Completion state
//
// Styled as a vintage television set with phosphor glow,
// scanlines, and physical TV controls (knobs, dials)
// ═══════════════════════════════════════════════════════════════

export default function EventDashboard() {
  const {
    currentEvent,
    loading,
    getTimeRemaining,
    getCollectedFragments,
    getTotalFragments,
    getCollectedCount,
    hasFragment,
    submitSolution,
  } = useGlobalEvent();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [solutionInput, setSolutionInput] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Countdown ticker
  useEffect(() => {
    if (!currentEvent) return;
    const tick = () => setTimeRemaining(getTimeRemaining());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [currentEvent, getTimeRemaining]);

  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!solutionInput.trim() || submitting) return;

    setSubmitting(true);
    setSubmitError('');

    // Use anonymous user ID (stored in localStorage)
    let userId = localStorage.getItem('sos_user_id');
    if (!userId) {
      userId = 'AGENT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('sos_user_id', userId);
    }

    const result = await submitSolution(solutionInput.trim(), userId);
    
    if (!result.success) {
      setSubmitError(result.error === 'Incorrect solution' 
        ? 'INCORRECT — THE SIGNAL DOES NOT MATCH' 
        : result.error
      );
      setTimeout(() => setSubmitError(''), 4000);
    }
    
    setSubmitting(false);
  };

  const formatTime = (t) => {
    if (!t || t.expired) return { h: '00', m: '00', s: '00' };
    return {
      h: String(t.hours).padStart(2, '0'),
      m: String(t.minutes).padStart(2, '0'),
      s: String(t.seconds).padStart(2, '0'),
    };
  };

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="event-dashboard">
        <div className="dashboard-tv">
          <div className="dashboard-bezel">
            <div className="dashboard-screen">
              <div className="dashboard-scanlines" />
              <div className="dashboard-body">
                <div className="dashboard-no-event">
                  <div className="dashboard-no-event-title">TUNING...</div>
                  <div className="dashboard-no-event-msg">SEARCHING FOR BROADCAST SIGNAL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── No event state ───
  if (!currentEvent) {
    return (
      <div className="event-dashboard">
        <div className="dashboard-tv">
          <div className="dashboard-bezel">
            <div className="dashboard-screen">
              <div className="dashboard-scanlines" />
              <div className="dashboard-screen-glow" />

              <div className="dashboard-header">
                <div className="dashboard-channel-info">
                  <div className="dashboard-live">
                    <div className="dashboard-live-dot" style={{ background: '#444', boxShadow: 'none' }} />
                    <span style={{ color: '#444' }}>OFF AIR</span>
                  </div>
                </div>
              </div>

              <div className="dashboard-body">
                <div className="dashboard-no-event">
                  <div className="dashboard-no-event-title">NO ACTIVE BROADCAST</div>
                  <div className="dashboard-no-event-msg">
                    STAND BY — NEXT TRANSMISSION INCOMING
                  </div>
                </div>
              </div>

              <div className="dashboard-controls">
                <span className="dashboard-control-label">RECEIVER IDLE</span>
                <span className="dashboard-control-label">CH.47</span>
              </div>
            </div>
          </div>
          <div className="dashboard-tv-controls">
            <div className="dashboard-knob" />
            <div className="dashboard-knob" />
          </div>
        </div>
      </div>
    );
  }

  const fragments = currentEvent.puzzle_data?.fragments || [];
  const totalFragments = getTotalFragments();
  const collectedCount = getCollectedCount();
  const allCollected = totalFragments > 0 && collectedCount >= totalFragments;
  const isCompleted = !!currentEvent.completed_at;
  const time = formatTime(timeRemaining);

  // ─── Completed state ───
  if (isCompleted) {
    return (
      <div className="event-dashboard">
        <div className="dashboard-tv">
          <div className="dashboard-bezel">
            <div className="dashboard-screen">
              <div className="dashboard-scanlines" />
              <div className="dashboard-screen-glow" />

              <div className="dashboard-header">
                <div className="dashboard-channel-info">
                  <div className="dashboard-live">
                    <div className="dashboard-live-dot" style={{ background: '#00ff66', boxShadow: '0 0 8px #00ff66' }} />
                    <span style={{ color: '#00ff66' }}>RESOLVED</span>
                  </div>
                  <span className="dashboard-channel-number">CH.47</span>
                </div>
              </div>

              <div className="dashboard-body">
                <div className="dashboard-completed">
                  <div className="dashboard-completed-title">TRANSMISSION DECODED</div>
                  <div className="dashboard-completed-by">
                    Completed by {currentEvent.completed_by || 'UNKNOWN AGENT'}
                  </div>
                </div>
              </div>

              <div className="dashboard-controls">
                <span className="dashboard-control-label">EVENT: {currentEvent.event_id}</span>
                <span className="dashboard-control-label" style={{ color: '#00ff66' }}>COMPLETE</span>
              </div>
            </div>
          </div>
          <div className="dashboard-tv-controls">
            <div className="dashboard-knob" />
            <div className="dashboard-knob" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Active event state ───
  return (
    <div className="event-dashboard">
      <div className="dashboard-tv">
        <div className="dashboard-bezel">
          <div className="dashboard-screen">
            <div className="dashboard-scanlines" />
            <div className="dashboard-screen-glow" />

            {/* Header */}
            <div className="dashboard-header">
              <div className="dashboard-channel-info">
                <div className="dashboard-live">
                  <div className="dashboard-live-dot" />
                  <span>LIVE</span>
                </div>
                <span className="dashboard-channel-number">EMERGENCY CHANNEL 47</span>
              </div>
              <span className="dashboard-timestamp">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
              </span>
            </div>

            {/* Main body */}
            <div className="dashboard-body">
              <div className="dashboard-event-badge">ACTIVE EVENT</div>
              <h2 className="dashboard-event-title">{currentEvent.title}</h2>
              <p className="dashboard-event-description">{currentEvent.description}</p>

              {/* Countdown */}
              <div className="dashboard-countdown">
                <span className="dashboard-countdown-label">TIME REMAINING</span>
                <span className="dashboard-countdown-digit">{time.h}</span>
                <span className="dashboard-countdown-unit">HR</span>
                <span className="dashboard-countdown-separator">:</span>
                <span className="dashboard-countdown-digit">{time.m}</span>
                <span className="dashboard-countdown-unit">MIN</span>
                <span className="dashboard-countdown-separator">:</span>
                <span className="dashboard-countdown-digit">{time.s}</span>
                <span className="dashboard-countdown-unit">SEC</span>
              </div>

              {/* Fragment progress */}
              {totalFragments > 0 && (
                <div className="dashboard-fragments-section">
                  <div className="dashboard-fragments-label">
                    SIGNAL FRAGMENTS — {collectedCount} OF {totalFragments} RECOVERED
                    <div style={{ flex: 1, height: 1, borderBottom: '1px dashed #222' }} />
                  </div>

                  <div className="dashboard-fragments-grid">
                    {fragments.map((frag) => {
                      const collected = hasFragment(frag.id);
                      return (
                        <div key={frag.id} className={`dashboard-frag-card ${collected ? 'collected' : 'missing'}`}>
                          <div className="dashboard-frag-dot" />
                          <div className="dashboard-frag-info">
                            <div className="dashboard-frag-id">{frag.id}</div>
                            <div className="dashboard-frag-page">
                              {collected ? 'DECODED' : `HIDDEN ON: ${(frag.page || '???').toUpperCase()}`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Solution input (all fragments collected) */}
              {allCollected && (
                <div className="dashboard-solution">
                  <div className="dashboard-solution-label">
                    ALL FRAGMENTS DECODED — ENTER FINAL TRANSMISSION
                  </div>
                  <form className="dashboard-solution-form" onSubmit={handleSubmitSolution}>
                    <input
                      type="text"
                      className="dashboard-solution-input"
                      value={solutionInput}
                      onChange={(e) => setSolutionInput(e.target.value)}
                      placeholder="FINAL ANSWER..."
                      disabled={submitting}
                    />
                    <button 
                      type="submit" 
                      className="dashboard-solution-submit"
                      disabled={submitting}
                    >
                      {submitting ? 'TRANSMITTING...' : 'DECODE'}
                    </button>
                  </form>
                  {submitError && (
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      color: '#c41e1e',
                      marginTop: 8,
                      letterSpacing: 1,
                      textAlign: 'center',
                    }}>
                      {submitError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom controls */}
            <div className="dashboard-controls">
              <span className="dashboard-control-label">EVENT: {currentEvent.event_id}</span>
              <span className="dashboard-control-label">
                STATUS: {allCollected ? 'READY TO DECODE' : 'FRAGMENTS PENDING'}
              </span>
            </div>
          </div>
        </div>

        {/* Physical TV controls */}
        <div className="dashboard-tv-controls">
          <div className="dashboard-knob" />
          <div className="dashboard-knob" />
        </div>
      </div>
    </div>
  );
}
