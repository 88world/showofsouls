# Supabase Setup Guide for Show of Souls V2

This guide will walk you through setting up the Supabase backend for the global event and tape unlock systems.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Fill in project details:
   - **Name**: Show of Souls V2
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project" and wait for setup to complete (~2 minutes)

## 2. Get Your API Credentials

1. In your project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

3. Create a `.env` file in your project root:
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 3. Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste the following SQL and click **Run**:

```sql
-- ═══════════════════════════════════════════════════════════════
-- GLOBAL EVENTS TABLE
-- Stores 12-hour collaborative puzzle events
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE global_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  puzzle_data JSONB NOT NULL,
  solution TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  is_active BOOLEAN DEFAULT true,
  rewards JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- TAPE UNLOCKS TABLE
-- Tracks globally unlocked investigation tapes
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE tape_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tape_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  unlocked_by TEXT,
  unlock_method TEXT,
  UNIQUE(tape_id)
);

-- ═══════════════════════════════════════════════════════════════
-- EVENT COMPLETIONS TABLE
-- Tracks which users completed which events
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE event_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  time_taken INTEGER,
  UNIQUE(event_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE global_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tape_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_completions ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- SECURITY POLICIES
-- Allow public read, authenticated write
-- ═══════════════════════════════════════════════════════════════

-- Global Events: Public read, service role write
CREATE POLICY "Public can view events" 
  ON global_events FOR SELECT 
  USING (true);

CREATE POLICY "Service can manage events" 
  ON global_events FOR ALL 
  USING (auth.role() = 'service_role');

-- Tape Unlocks: Public read, anyone can insert (first come first serve)
CREATE POLICY "Public can view tape unlocks" 
  ON tape_unlocks FOR SELECT 
  USING (true);

CREATE POLICY "Users can unlock tapes" 
  ON tape_unlocks FOR INSERT 
  WITH CHECK (true);

-- Event Completions: Users can record their own completions
CREATE POLICY "Users can record completions" 
  ON event_completions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Public can view completions" 
  ON event_completions FOR SELECT 
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX idx_events_active ON global_events(is_active, started_at DESC);
CREATE INDEX idx_events_event_id ON global_events(event_id);
CREATE INDEX idx_tapes_tape_id ON tape_unlocks(tape_id);
CREATE INDEX idx_completions_event ON event_completions(event_id);
CREATE INDEX idx_completions_user ON event_completions(user_id);
```

## 4. Add Sample Event (Optional)

To test the system, add a sample global event:

```sql
INSERT INTO global_events (
  event_id,
  title,
  description,
  puzzle_data,
  solution,
  started_at,
  is_active,
  rewards
) VALUES (
  'EVT-001-TEST',
  'THE CAROUSEL CODE',
  'A cipher has been recovered from the abandoned carousel at Mascot Park. Decode it to unlock classified footage from 1947.',
  '{
    "type": "cipher",
    "content": "GSVR GSVM DROO XLNV",
    "hint": "Caesar shift cipher - try shifting the alphabet"
  }',
  'THEY THEM WILL COME',
  now(),
  true,
  '{
    "tapes": ["TAPE-001"],
    "lore": true,
    "news": false
  }'
);
```

**Solution**: "THEY THEM WILL COME" (Caesar cipher, shift of 13)

## 5. Enable Realtime (Required for Live Updates)

1. In Supabase dashboard, go to **Database** → **Replication**
2. Find the tables:
   - `global_events`
   - `tape_unlocks`
3. Click the toggle to enable **Realtime** for both tables
4. Click **Save changes**

## 6. Test the Connection

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Check the browser console for any Supabase errors

3. Try viewing the HomePage - the global event widget should appear

## 7. Managing Events (Admin Tasks)

### Create a New Event

```sql
INSERT INTO global_events (
  event_id,
  title,
  description,
  puzzle_data,
  solution,
  started_at,
  is_active,
  rewards
) VALUES (
  'EVT-002-RIDDLE',
  'THE MISSING CHILD',
  'Solve this riddle to uncover the identity of the first missing person.',
  '{
    "type": "riddle",
    "content": "I am found in the darkness but never in light. I grow with silence but shrink with a fight. What am I?",
    "clues": [
      "Think about psychological concepts",
      "What increases when ignored?",
      "A four-letter word starting with F"
    ]
  }',
  'FEAR',
  now(),
  true,
  '{
    "tapes": ["TAPE-002", "TAPE-003"],
    "lore": true,
    "news": true
  }'
);
```

### Deactivate Expired Events

```sql
UPDATE global_events
SET is_active = false
WHERE started_at < (now() - INTERVAL '12 hours')
  AND is_active = true;
```

### View All Unlocked Tapes

```sql
SELECT 
  tape_id,
  unlocked_by,
  unlocked_at,
  unlock_method
FROM tape_unlocks
ORDER BY unlocked_at DESC;
```

### View Event Completion Stats

```sql
SELECT 
  e.event_id,
  e.title,
  e.completed_by,
  e.completed_at,
  COUNT(ec.user_id) as total_attempts
FROM global_events e
LEFT JOIN event_completions ec ON e.event_id = ec.event_id
GROUP BY e.id, e.event_id, e.title, e.completed_by, e.completed_at
ORDER BY e.started_at DESC;
```

## 8. Production Considerations

### Security

- **Never expose your service_role key** in client-side code
- Use environment variables for all credentials
- Consider implementing user authentication (Supabase Auth)

### Rate Limiting

Add rate limiting to prevent spam:

```sql
-- Create a function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(user_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  recent_attempts INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO recent_attempts
  FROM event_completions
  WHERE user_id = check_rate_limit.user_id
    AND completed_at > (now() - INTERVAL '1 minute');
  
  RETURN recent_attempts < 5; -- Max 5 attempts per minute
END;
$$ LANGUAGE plpgsql;
```

### Scheduled Events

To automatically create events every 12 hours, use a cron job service:

1. Use [GitHub Actions](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
2. Or use [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
3. Or use [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

Example cron endpoint (place in `/api/cron/create-event.js`):

```javascript
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Verify cron secret to prevent unauthorized access
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin tasks
  );

  // Your event generation logic here
  const newEvent = {
    event_id: `EVT-${Date.now()}`,
    title: 'Generated Event',
    // ... rest of event data
  };

  const { error } = await supabase
    .from('global_events')
    .insert(newEvent);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ success: true });
}
```

## 9. Troubleshooting

### "Failed to fetch" errors
- Check that your Supabase project URL is correct in `.env`
- Verify the project is not paused (free tier projects pause after 1 week of inactivity)

### Events not appearing
- Check that **Realtime** is enabled for `global_events` table
- Verify RLS policies are correctly configured
- Check browser console for Supabase errors

### Tape unlocks not working
- Ensure `tape_unlocks` table has **Realtime** enabled
- Check that the `tape_id` is unique (duplicate unlocks will fail)

### Can't submit solutions
- Verify the event's `solution` field matches exactly (case-sensitive)
- Check that the event is still active (`is_active = true`)

## 10. Next Steps

After setup is complete:

1. ✅ Test the sample event on your local dev server
2. ✅ Create your own custom events with puzzles
3. ✅ Integrate tape unlock rewards with your TapesPage
4. ✅ Set up automated event creation (cron jobs)
5. ✅ Add user authentication for persistent profiles
6. ✅ Deploy to production (Vercel, Netlify, etc.)

---

**Need help?** Check the Supabase documentation: https://supabase.com/docs
