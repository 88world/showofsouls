-- ═══════════════════════════════════════════════════════════════
-- SHOW OF SOULS V2 - SUPABASE DATABASE SETUP
-- Run this entire script in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════
-- GLOBAL EVENTS TABLE
-- Stores 12-hour collaborative puzzle events
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS global_events (
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
-- TAPES TABLE
-- Master registry of all investigation tapes
-- is_visible = false  →  shows as unknown "?" cassette
-- is_visible = true   →  shows tape metadata
-- Tapes get unlocked via global events (tape_unlocks table)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tape_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date TEXT,
  length TEXT,
  video_url TEXT,
  status TEXT DEFAULT 'SEALED',
  is_corrupt BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  puzzle_trigger TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add video_url column if table already exists
ALTER TABLE tapes ADD COLUMN IF NOT EXISTS video_url TEXT;

-- ═══════════════════════════════════════════════════════════════
-- TAPE UNLOCKS TABLE
-- Tracks globally unlocked investigation tapes
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS tape_unlocks (
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

CREATE TABLE IF NOT EXISTS event_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  time_taken INTEGER,
  UNIQUE(event_id, user_id)
);

-- ═══════════════════════════════════════════════════════════════
-- FORUM POSTS TABLE
-- Stores news, renders, devlogs for the public forum page
-- Managed via /admin dashboard
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'news',
  author TEXT NOT NULL DEFAULT 'ADMIN',
  is_pinned BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  span_class TEXT DEFAULT 'col-span-1 row-span-1',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- VOICE RECORDINGS TABLE
-- Audio transmissions displayed on /tapes page
-- Managed via /admin dashboard
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  audio_url TEXT,
  duration TEXT,
  date TEXT,
  status TEXT DEFAULT 'CLASSIFIED',
  is_visible BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- DOCUMENTS TABLE
-- Declassified park records & correspondence on /tapes page
-- Managed via /admin dashboard
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  file_url TEXT,
  doc_type TEXT DEFAULT 'report',
  date TEXT,
  status TEXT DEFAULT 'CLASSIFIED',
  is_visible BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- DISABLE ROW LEVEL SECURITY (RLS)
-- All tables are public — no auth required
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE global_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE tapes DISABLE ROW LEVEL SECURITY;
ALTER TABLE tape_unlocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_completions DISABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies so re-runs don't error
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('global_events','tapes','tape_unlocks','event_completions','forum_posts','voice_recordings','documents')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- INDEXES FOR PERFORMANCE
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_events_active ON global_events(is_active, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_id ON global_events(event_id);
CREATE INDEX IF NOT EXISTS idx_tapes_tape_id ON tapes(tape_id);
CREATE INDEX IF NOT EXISTS idx_tapes_visible ON tapes(is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_tape_unlocks_tape_id ON tape_unlocks(tape_id);
CREATE INDEX IF NOT EXISTS idx_completions_event ON event_completions(event_id);
CREATE INDEX IF NOT EXISTS idx_completions_user ON event_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_published ON forum_posts(is_published, is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_category ON forum_posts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recordings_visible ON voice_recordings(is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_documents_visible ON documents(is_visible, sort_order);

-- ═══════════════════════════════════════════════════════════════
-- SAMPLE TEST EVENT — Multi-fragment format
-- Each fragment is a mini-puzzle on a different page
-- Users collect all fragments, then submit the final answer
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
  'A fragmented signal has been detected across the park''s monitoring grid. Decode each fragment to reconstruct the final transmission.',
  '{
    "type": "multi_fragment",
    "fragments": [
      {
        "id": "FRAG-HOME",
        "page": "home",
        "type": "cipher",
        "prompt": "TEMPLATE: Replace with puzzle content for Home page",
        "solution": "TEMPLATE",
        "hint": "Placeholder hint",
        "revealData": "HOME-DATA",
        "channel": "CH.47",
        "label": "CIPHER"
      },
      {
        "id": "FRAG-INCIDENT",
        "page": "incident",
        "type": "cipher",
        "prompt": "TEMPLATE: Replace with puzzle content for Incident page",
        "solution": "TEMPLATE",
        "hint": "Placeholder hint",
        "revealData": "INCIDENT-DATA",
        "channel": "CH.19",
        "label": "REPORT"
      },
      {
        "id": "FRAG-CHARACTERS",
        "page": "characters",
        "type": "riddle",
        "prompt": "TEMPLATE: Replace with puzzle content for Characters page",
        "solution": "TEMPLATE",
        "hint": "Placeholder hint",
        "revealData": "CHARACTERS-DATA",
        "channel": "CH.33",
        "label": "DOSSIER"
      },
      {
        "id": "FRAG-TAPES",
        "page": "tapes",
        "type": "cipher",
        "prompt": "TEMPLATE: Replace with puzzle content for Tapes page",
        "solution": "TEMPLATE",
        "hint": "Placeholder hint",
        "revealData": "TAPES-DATA",
        "channel": "CH.04",
        "label": "TAPE LOG"
      },
      {
        "id": "FRAG-MEDIA",
        "page": "media",
        "type": "sequence",
        "prompt": "TEMPLATE: Replace with puzzle content for Media page",
        "solution": "TEMPLATE",
        "hint": "Placeholder hint",
        "revealData": "MEDIA-DATA",
        "channel": "FREQ.7",
        "label": "AUDIO LOG"
      }
    ],
    "finalHint": "Combine all fragment data to form the final answer"
  }',
  'TEMPLATE FINAL ANSWER',
  now(),
  true,
  '{
    "tapes": ["TAPE-001"],
    "lore": true,
    "news": false
  }'
) ON CONFLICT (event_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — 6 INVESTIGATION TAPES
-- All hidden by default (is_visible = false → shows as "?" cassette)
-- Toggle is_visible to true from the DB to reveal them
-- All start locked — unlocked via global events
-- ═══════════════════════════════════════════════════════════════

INSERT INTO tapes (tape_id, title, date, length, status, is_corrupt, is_visible, sort_order, puzzle_trigger) VALUES
  ('TAPE-001', 'Initial_Interview',   NULL,           '47:23',   'CORRUPT', true,  false, 1, 'passwordTerminal'),
  ('TAPE-002', 'Forest_Expedition',   'OCT-19-1947',  '1:12:45', 'SAFE',    false, false, 2, NULL),
  ('TAPE-003', 'Final_Transmission',  'NOV-02-1947',  'UNKNOWN', 'SEALED',  false, false, 3, NULL),
  ('TAPE-004', '???',                 NULL,           '???',     'SEALED',  false, false, 4, NULL),
  ('TAPE-005', '???',                 NULL,           '???',     'SEALED',  false, false, 5, NULL),
  ('TAPE-006', '???',                 NULL,           '???',     'SEALED',  false, false, 6, NULL)
ON CONFLICT (tape_id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA — SAMPLE FORUM POSTS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO forum_posts (title, content, image_url, category, author, is_pinned, is_published, span_class) VALUES
  (
    'WELCOME TO SHOW OF SOULS',
    'The park gates are opening soon. Stay tuned for updates, renders, and development logs. Something is stirring in Flora''s Park...',
    'https://images.unsplash.com/photo-1597847323857-86379a330887?w=800&h=600&fit=crop&q=80',
    'news',
    'ADMIN',
    true,
    true,
    'col-span-2 row-span-2'
  ),
  (
    'FLORA — CONCEPT RENDER #001',
    'First official look at Flora, the park''s beloved mascot. But something is wrong with the eyes...',
    'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&h=600&fit=crop&q=80',
    'render',
    'ADMIN',
    false,
    true,
    'col-span-1 row-span-1'
  ),
  (
    'DEVELOPMENT UPDATE — WEEK 1',
    'Website launched. Puzzle system online. Tape archive under construction. The investigation begins.',
    NULL,
    'devlog',
    'ADMIN',
    false,
    true,
    'col-span-1 row-span-1'
  )
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- SETUP COMPLETE!
-- 
-- Next steps:
-- 1. Enable Realtime on global_events, tapes, and tape_unlocks tables
-- 2. Copy your Project URL and anon key to .env file
-- 3. Restart your dev server: npm run dev
-- ═══════════════════════════════════════════════════════════════
