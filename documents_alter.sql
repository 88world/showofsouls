-- ═══════════════════════════════════════════════════════════════
-- SHOW OF SOULS V2 - ALTER DOCUMENTS TABLE FOR FULL INSERT SUPPORT
-- Run this before documents_insert.sql if you get missing column errors
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS author TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Optionally, add file_url if not present (for future use)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_url TEXT;

-- Optionally, add created_at if not present
ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Optionally, add sort_order if not present
ALTER TABLE documents ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Optionally, add is_visible if not present
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT false;

-- Optionally, add status if not present
ALTER TABLE documents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'CLASSIFIED';

-- Optionally, add doc_type if not present
ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_type TEXT DEFAULT 'report';

-- Optionally, add date if not present
ALTER TABLE documents ADD COLUMN IF NOT EXISTS date TEXT;

-- ═══════════════════════════════════════════════════════════════
-- Now you can safely run documents_insert.sql
-- ═══════════════════════════════════════════════════════════════
