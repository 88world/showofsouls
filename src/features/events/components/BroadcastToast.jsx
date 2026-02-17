import { useState, useEffect } from 'react';
import { useGlobalEvent } from '../GlobalEventProvider';
import './BroadcastBar.css'; // Shares toast styles from BroadcastBar.css

// ═══════════════════════════════════════════════════════════════
// BROADCAST TOAST - Retro TV notification toast
// 
// Shows when:
//  - A puzzle fragment is collected
//  - A new event starts
//  - An event is completed globally
// 
// Styled as a small retro TV screen in the bottom-right corner
// Auto-dismisses after 6 seconds
// ═══════════════════════════════════════════════════════════════

const TOAST_MESSAGES = {
  fragment_collected: {
    icon: '📡',
    getTitle: (msg) => 'SIGNAL RECOVERED',
    getBody: (msg) => `Fragment "${msg.fragmentId}" decoded. Data secured: ${msg.fragmentData}`,
    getSubtitle: () => 'Check your progress in the broadcast bar',
  },
  new_event: {
    icon: '📺',
    getTitle: (msg) => 'INCOMING TRANSMISSION',
    getBody: (msg) => `New event detected: "${msg.title}". Puzzle fragments are now scattered across the site.`,
    getSubtitle: () => 'Tune in to decode the signal',
  },
  event_completed: {
    icon: '🏆',
    getTitle: (msg) => msg.firstComplete ? 'YOU DID IT' : 'EVENT CONCLUDED',
    getBody: (msg) => msg.firstComplete 
      ? `You were the first to complete "${msg.title}"!`
      : `"${msg.title}" has been completed by ${msg.completedBy}.`,
    getSubtitle: (msg) => msg.rewards ? 'Rewards unlocked' : '',
  },
};

export default function BroadcastToast() {
  const { showBroadcast, broadcastMessage, dismissBroadcast } = useGlobalEvent();
  const [isExiting, setIsExiting] = useState(false);

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    if (!showBroadcast) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, 6000);

    return () => clearTimeout(timer);
  }, [showBroadcast, broadcastMessage]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      dismissBroadcast();
    }, 400);
  };

  if (!showBroadcast || !broadcastMessage) return null;

  const config = TOAST_MESSAGES[broadcastMessage.type];
  if (!config) return null;

  return (
    <div className={`broadcast-toast ${isExiting ? 'exiting' : ''}`}>
      <div className="broadcast-frame">
        <div className="broadcast-screen">
          <div className="broadcast-scanlines" />

          <div className="broadcast-header">
            <div className="broadcast-channel">
              <div className="broadcast-live-dot" />
              <span>ALERT</span>
            </div>
            <button className="broadcast-dismiss" onClick={handleDismiss}>
              ×
            </button>
          </div>

          <div className="broadcast-content" style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span className="toast-icon">{config.icon}</span>
              <div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 14,
                  letterSpacing: 2,
                  color: broadcastMessage.type === 'event_completed' ? '#00ff66' : '#c41e1e',
                  marginBottom: 4,
                }}>
                  {config.getTitle(broadcastMessage)}
                </div>
                <div className="toast-message">
                  {config.getBody(broadcastMessage)}
                </div>
                {config.getSubtitle(broadcastMessage) && (
                  <div className="toast-subtitle">
                    {config.getSubtitle(broadcastMessage)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
