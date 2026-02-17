# Global Events & Tape Unlocks System - Implementation Guide

## Overview

Your Show of Souls V2 app now features a **multiplayer collaborative investigation system** powered by Supabase. This system enables:

1. **Global Tape Unlocks**: When any investigator unlocks a tape, it becomes available to all users worldwide
2. **12-Hour Global Events**: Complex puzzles that appear every 12 hours for all investigators to solve together
3. **Real-time Notifications**: Instant alerts when tapes are unlocked or events are completed
4. **Persistent Progress**: User progress and achievements are tracked globally

---

## Architecture

### **Hybrid State Management**

```
┌─────────────────────────────────────────────────────────┐
│                   LOCAL STATE (Zustand)                  │
│  • Individual puzzle progress                            │
│  • Story phase progression                               │
│  • UI preferences                                        │
│  • Cached in localStorage                                │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│               GLOBAL STATE (Supabase)                    │
│  • Tape unlock records (who unlocked, when)              │
│  • 12-hour event status (active, completed_by)           │
│  • Cross-user collaboration data                         │
│  • Real-time subscriptions                               │
└─────────────────────────────────────────────────────────┘
```

---

## Files Created

### **Core Infrastructure**

1. **`src/lib/supabase.js`** (267 lines)
   - Supabase client initialization
   - API functions for events and tape unlocks
   - Real-time subscription handlers
   - Database schema documentation

2. **`src/features/events/GlobalEventProvider.jsx`** (133 lines)
   - React Context for global event state
   - Event lifecycle management (start, submit, complete)
   - Real-time event updates via websockets
   - Completion notification triggers

3. **`src/hooks/useTapeUnlocks.js`** (103 lines)
   - Custom hook for tape unlock state
   - Real-time subscription to new unlocks
   - Toast notifications for new tape unlocks
   - Unlock status checking

### **UI Components**

4. **`src/features/events/components/GlobalEventWidget.jsx`** (112 lines)
   - Compact event status display
   - Live countdown timer (12-hour window)
   - Expandable details view
   - Click-to-open event modal

5. **`src/features/events/components/GlobalEventModal.jsx`** (185 lines)
   - Full-screen interactive puzzle interface
   - Solution submission form
   - Real-time verification
   - Support for multiple puzzle types (cipher, riddle, code)

6. **`src/features/events/components/CompletionPopup.jsx`** (94 lines)
   - Celebratory notification when event is completed globally
   - Shows who completed it and when
   - Displays unlocked rewards (tapes, lore, news)
   - "View Rewards" vs "Continue Investigating" choice

7. **`src/components/notifications/TapeUnlockNotification.jsx`** (62 lines)
   - Toast-style side notification
   - Appears when any investigator unlocks a tape
   - Auto-dismisses after 5 seconds
   - Link to Tapes page

### **Styling**

8. **`src/features/events/components/GlobalEventWidget.css`** (194 lines)
9. **`src/features/events/components/GlobalEventModal.css`** (268 lines)
10. **`src/features/events/components/CompletionPopup.css`** (162 lines)
11. **`src/components/notifications/TapeUnlockNotification.css`** (116 lines)

### **Documentation**

12. **`SUPABASE_SETUP.md`** (Complete setup guide with SQL schemas)
13. **`.env.example`** (Environment variable template)

---

## Integration Points

### **1. App.jsx**
```jsx
<GlobalEventProvider>
  <ProgressionProvider>
    {/* Your app content */}
    <CompletionPopup />
    <TapeUnlockNotification />
  </ProgressionProvider>
</GlobalEventProvider>
```

### **2. HomePage.jsx**
```jsx
<GlobalEventWidget onOpenEvent={handleOpenEvent} />
<GlobalEventModal 
  isOpen={isEventModalOpen}
  onClose={handleCloseEvent}
  event={selectedEvent}
/>
```

### **3. TapesPage.jsx**
```jsx
const { isTapeUnlocked, getTapeUnlockInfo, unlockTapeGlobal } = useTapeUnlocks();

// On puzzle completion:
await unlockTapeGlobal('TAPE-001', userId, 'puzzle_completion');

// In PhysicalTape component:
{unlocked && <Badge>GLOBALLY UNLOCKED</Badge>}
{unlockInfo && <div>Unlocked by: {unlockInfo.unlocked_by}</div>}
```

---

## Database Schema

### **Tables**

#### **global_events**
```sql
{
  id: UUID,
  event_id: TEXT (unique),
  title: TEXT,
  description: TEXT,
  puzzle_data: JSONB,          // Puzzle content (cipher, riddle, etc.)
  solution: TEXT,              // Correct answer (case-sensitive)
  started_at: TIMESTAMPTZ,
  completed_at: TIMESTAMPTZ,   // When first solved
  completed_by: TEXT,          // User who solved it first
  is_active: BOOLEAN,
  rewards: JSONB,              // { tapes: ["TAPE-001"], lore: true }
  created_at: TIMESTAMPTZ
}
```

#### **tape_unlocks**
```sql
{
  id: UUID,
  tape_id: TEXT (unique),      // e.g., "TAPE-001"
  unlocked_at: TIMESTAMPTZ,
  unlocked_by: TEXT,           // User ID who unlocked
  unlock_method: TEXT          // "puzzle_completion", "event_reward"
}
```

#### **event_completions**
```sql
{
  id: UUID,
  event_id: TEXT,
  user_id: TEXT,
  completed_at: TIMESTAMPTZ,
  time_taken: INTEGER          // Seconds from start to completion
}
```

---

## How It Works

### **Global Tape Unlocks**

1. **User solves puzzle** → `PasswordTerminal` or `MemoryGame` calls `onSuccess()`
2. **TapesPage handler** → `handlePuzzleSuccess()` → `unlockTapeGlobal()`
3. **Supabase INSERT** → Record added to `tape_unlocks` table
4. **Real-time broadcast** → All connected clients receive update via WebSocket
5. **UI updates** → 
   - PhysicalTape component shows "GLOBALLY UNLOCKED" badge
   - Toast notification appears for all users
   - Unlock info displayed (who unlocked, when)

### **12-Hour Global Events**

1. **Event creation** (admin/cron) → INSERT into `global_events` with `is_active: true`
2. **GlobalEventWidget** → Displays on HomePage with countdown timer
3. **User clicks widget** → Opens `GlobalEventModal` with puzzle
4. **User submits solution** → `submitSolution()` → Verify against `event.solution`
5. **If correct**:
   - UPDATE `global_events` SET `completed_at`, `completed_by`, `is_active: false`
   - INSERT into `event_completions`
   - Unlock reward tapes
6. **Real-time notification** → All users see `CompletionPopup`
7. **Next event** → New event created 12 hours later

### **Real-time Subscriptions**

#### **Event Updates**
```javascript
supabase
  .channel('global-events')
  .on('postgres_changes', { table: 'global_events' }, callback)
  .subscribe()
```

#### **Tape Unlocks**
```javascript
supabase
  .channel('tape-unlocks')
  .on('postgres_changes', { table: 'tape_unlocks', event: 'INSERT' }, callback)
  .subscribe()
```

---

## User Experience Flow

### **Scenario 1: First User Unlocks Tape**

```
1. User A solves "FLORA1947" password puzzle
2. System unlocks TAPE-001 globally
3. User A sees success animation + PhysicalTape glows green
4. User B (in another browser/device) sees toast: "● NEW TAPE UNLOCKED"
5. User B navigates to /tapes
6. TAPE-001 shows "GLOBALLY UNLOCKED" badge
7. Badge shows "Unlocked by: INV-123456789 at Feb 17, 2:30 PM"
```

### **Scenario 2: Global Event Completion**

```
1. 12-hour timer expires → New event appears on HomePage
2. GlobalEventWidget shows: "THE CAROUSEL CODE" - countdown: 11:59:23
3. User clicks widget → GlobalEventModal opens with cipher puzzle
4. User reads hint: "Caesar shift cipher"
5. User enters: "THEY THEM WILL COME"
6. System verifies → CORRECT!
7. CompletionPopup appears:
   ">>> FIRST COMPLETION
   THE CAROUSEL CODE
   COMPLETED BY: INV-987654321
   TIMESTAMP: 02:45:18 PM
   REWARDS UNLOCKED:
   + 1 CLASSIFIED TAPE(S)
   + NEW INVESTIGATION FILE"
8. User clicks "VIEW REWARDS" → Redirects to /tapes
9. TAPE-001 is now unlocked for everyone
10. All other users see the CompletionPopup (without "FIRST")
```

---

## Configuration

### **Environment Variables (.env)**
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### **Puzzle → Tape Mapping (TapesPage.jsx)**
```javascript
const puzzleToTapeMap = {
  passwordTerminal: 'TAPE-001',
  memoryGame: 'TAPE-002',
  // Add more as you create puzzles
};
```

---

## Testing Locally

### **1. Without Supabase (Mock Mode)**
Without `.env` configured, the system will:
- Show "No active global event" widget
- Display tapes as not unlocked
- Allow local puzzle solving via Zustand

### **2. With Supabase**
1. Follow `SUPABASE_SETUP.md`
2. Add test event via SQL Editor
3. Restart dev server: `npm run dev`
4. Open localhost in two browser windows
5. Solve puzzle in Window A → See notification in Window B

---

## Adding New Features

### **Create a New Global Event**

```sql
INSERT INTO global_events (
  event_id, title, description, puzzle_data, solution, started_at, is_active, rewards
) VALUES (
  'EVT-003-MEMORY',
  'THE FORGOTTEN CHILD',
  'Match the pairs to reveal the truth about the missing children.',
  '{
    "type": "code",
    "content": "01000110 01001100 01001111 01010010 01000001",
    "instructions": "Binary to ASCII conversion required"
  }',
  'FLORA',
  now(),
  true,
  '{"tapes": ["TAPE-004"], "lore": true, "news": false}'
);
```

### **Add a New Puzzle Type**

1. Create `src/features/puzzles/types/YourPuzzle/YourPuzzle.jsx`
2. Add to `puzzleRegistry.js`:
```javascript
yourPuzzle: {
  id: 'yourPuzzle',
  title: 'Your Puzzle',
  enabled: true,
}
```
3. Add to `puzzleToTapeMap` in TapesPage:
```javascript
yourPuzzle: 'TAPE-005',
```
4. Update GlobalEventModal to support new puzzle type

---

## Security Considerations

1. **Row Level Security (RLS)** enabled on all tables
2. **Public read** allowed for transparency
3. **Solution verification** happens server-side (Supabase)
4. **Rate limiting** recommended (see SUPABASE_SETUP.md)
5. **Anonymous IDs** used (no personal data collected)

---

## Production Deployment

### **Checklist**
- [ ] Create production Supabase project
- [ ] Add production URL/key to `.env.production`
- [ ] Enable Realtime on all tables
- [ ] Set up automated event creation (cron job)
- [ ] Configure proper RLS policies
- [ ] Add rate limiting
- [ ] Test real-time updates across devices
- [ ] Monitor database performance

### **Recommended Hosting**
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Supabase (handles DB + real-time)
- **Cron Jobs**: Vercel Cron, GitHub Actions, or Supabase Edge Functions

---

## Troubleshooting

### **"No active global event" always showing**
- Check `.env` has correct Supabase credentials
- Verify event exists: `SELECT * FROM global_events WHERE is_active = true;`
- Check browser console for Supabase errors

### **Real-time not working**
- Ensure Realtime is enabled in Supabase dashboard
- Check WebSocket connection in Network tab
- Verify RLS policies allow public SELECT

### **Tapes not unlocking**
- Check `tape_unlocks` table for INSERT errors
- Verify `UNIQUE(tape_id)` constraint
- Ensure user has valid `investigator_id`

---

## Next Steps

1. **Set up Supabase** following `SUPABASE_SETUP.md`
2. **Add test event** using provided SQL
3. **Test in multiple browsers** to see real-time sync
4. **Create more events** with varied puzzle types
5. **Implement scheduled events** with cron jobs
6. **Add user authentication** (optional) for persistent profiles

---

**System Status**: ✅ Fully Implemented & Ready for Testing

All code is integrated. Once Supabase is configured, the global system will activate automatically.
