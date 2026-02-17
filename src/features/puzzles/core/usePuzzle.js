import { usePuzzleContext } from './PuzzleContext';

// ═══════════════════════════════════════════════════════════════
// USE PUZZLE HOOK
// Convenient hook to access puzzle context
// ═══════════════════════════════════════════════════════════════

export const usePuzzle = () => {
  const context = usePuzzleContext();

  // Format time remaining as MM:SS
  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if puzzle can be completed
  const canComplete = () => {
    return context.isActive && !context.completed && !context.failed;
  };

  // Get time percentage (for progress bars)
  const getTimePercentage = () => {
    if (!context.puzzleConfig || context.timeRemaining === null) return 100;
    const total = context.puzzleConfig.baseTime;
    return (context.timeRemaining / total) * 100;
  };

  // Get danger level based on time remaining
  const getDangerLevel = () => {
    const percentage = getTimePercentage();
    if (percentage > 50) return 'safe';
    if (percentage > 25) return 'warning';
    return 'danger';
  };

  return {
    ...context,
    formatTime,
    formattedTime: formatTime(context.timeRemaining),
    canComplete: canComplete(),
    timePercentage: getTimePercentage(),
    dangerLevel: getDangerLevel(),
  };
};

export default usePuzzle;
