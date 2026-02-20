import React from 'react';
import { useGlobalEvent } from '../../features/events/GlobalEventProvider';

/**
 * GlitchTextWord — A single word that becomes red/glitchy/clickable during global events
 * Off by default, only shows interactivity when currentEvent.is_active === true
 * 
 * Props:
 * - word (string): The word to display
 * - puzzleId (string): Which puzzle this triggers (e.g., 'frequencyTuner', 'memoryGame')
 * - onActivate (function): Callback when clicked during event (receives puzzleId)
 */
export function GlitchTextWord({ word, puzzleId, onActivate }) {
  const { currentEvent } = useGlobalEvent();
  const isEventActive = currentEvent?.is_active;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEventActive && onActivate) {
      onActivate(puzzleId);
    }
  };

  const baseStyle = {
    display: 'inline',
    fontFamily: "'Space Mono', monospace",
    letterSpacing: '1px',
    transition: 'all 0.2s ease-in-out',
  };

  const inactiveStyle = {
    ...baseStyle,
    color: 'inherit',
    textShadow: 'none',
    cursor: 'default',
  };

  const activeStyle = {
    ...baseStyle,
    color: '#e53e3e', // crimson red
    cursor: 'pointer',
    textShadow: '0 0 8px rgba(229, 62, 62, 0.6)',
    fontWeight: '600',
  };

  const activeHoverStyle = {
    ...activeStyle,
    color: '#c53030',
    textShadow: '0 0 12px rgba(229, 62, 62, 0.9), 0 0 20px rgba(229, 62, 62, 0.5)',
    transform: 'scaleX(1.05)',
  };

  const [isHovering, setIsHovering] = React.useState(false);

  const currentStyle = isEventActive
    ? isHovering
      ? activeHoverStyle
      : activeStyle
    : inactiveStyle;

  return (
    <span
      onClick={handleClick}
      onMouseEnter={() => isEventActive && setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={currentStyle}
      title={isEventActive ? `Unlock ${puzzleId}` : ''}
    >
      {word}
    </span>
  );
}

export default GlitchTextWord;
