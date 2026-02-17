-- ═══════════════════════════════════════════════════════════════
-- SHOW OF SOULS V2 - SUPABASE DATABASE SETUP
-- Run this entire script in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════
-- SAMPLE TEST EVENT (Optional - comment out if not needed)
-- ═══════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════
-- SETUP COMPLETE!
-- 
-- Next steps:
-- 1. Enable Realtime on global_events and tape_unlocks tables
-- 2. Copy your Project URL and anon key to .env file
-- 3. Restart your dev server: npm run dev
-- ═══════════════════════════════════════════════════════════════
