import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════
// SUPABASE CLIENT CONFIGURATION
// Global database for event synchronization and tape unlocks
// ═══════════════════════════════════════════════════════════════

// IMPORTANT: Replace these with your actual Supabase project credentials
// Get these from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ═══════════════════════════════════════════════════════════════
// DATABASE SCHEMA REFERENCE
// ═══════════════════════════════════════════════════════════════
/*
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

CREATE TABLE tape_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tape_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  unlocked_by TEXT,
  unlock_method TEXT
);

CREATE TABLE event_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  time_taken INTEGER,
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE global_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tape_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_completions ENABLE ROW LEVEL SECURITY;

-- Public read access, restricted write
CREATE POLICY "Public can view events" ON global_events FOR SELECT USING (true);
CREATE POLICY "Public can view tape unlocks" ON tape_unlocks FOR SELECT USING (true);
CREATE POLICY "Users can record completions" ON event_completions FOR INSERT WITH CHECK (true);
*/

// ═══════════════════════════════════════════════════════════════
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get the current active global event
 */
export async function getCurrentEvent() {
  const { data, error } = await supabase
    .from('global_events')
    .select('*')
    .eq('is_active', true)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching current event:', error);
    return null;
  }

  return data;
}

/**
 * Complete a global event
 */
export async function completeGlobalEvent(eventId, userId, timeTaken, solution) {
  // First verify the solution is correct
  const { data: event } = await supabase
    .from('global_events')
    .select('solution, completed_at')
    .eq('event_id', eventId)
    .single();

  if (!event) return { success: false, error: 'Event not found' };
  if (event.completed_at) return { success: false, error: 'Event already completed', alreadyCompleted: true };
  if (event.solution !== solution) return { success: false, error: 'Incorrect solution' };

  // Mark event as completed
  const { error: updateError } = await supabase
    .from('global_events')
    .update({
      completed_at: new Date().toISOString(),
      completed_by: userId,
      is_active: false,
    })
    .eq('event_id', eventId);

  if (updateError) {
    console.error('Error completing event:', updateError);
    return { success: false, error: updateError.message };
  }

  // Record user completion
  const { error: completionError } = await supabase
    .from('event_completions')
    .insert({
      event_id: eventId,
      user_id: userId,
      time_taken: timeTaken,
    });

  if (completionError) {
    // Ignore duplicate key errors (23505) - user already recorded this completion
    if (completionError.code !== '23505') {
      console.warn('Error recording completion:', completionError);
    }
  }

  return { success: true };
}

/**
 * Get all unlocked tapes
 */
export async function getUnlockedTapes() {
  const { data, error } = await supabase
    .from('tape_unlocks')
    .select('tape_id, unlocked_at')
    .order('unlocked_at', { ascending: true });

  if (error) {
    console.error('Error fetching unlocked tapes:', error);
    return [];
  }

  return data || [];
}

/**
 * Unlock a tape globally
 */
export async function unlockTape(tapeId, userId, method) {
  const { data, error } = await supabase
    .from('tape_unlocks')
    .insert({
      tape_id: tapeId,
      unlocked_by: userId,
      unlock_method: method,
    })
    .select()
    .single();

  if (error) {
    console.error('Error unlocking tape:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Subscribe to global event changes
 */
export function subscribeToEvents(callback) {
  const channel = supabase
    .channel('global-events')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'global_events',
      },
      (payload) => callback(payload)
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('Realtime subscription error for global_events:', err);
        console.warn('Enable Realtime in Supabase Dashboard: Database → Replication → Enable for global_events');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to tape unlock changes
 */
export function subscribeToTapeUnlocks(callback) {
  const channel = supabase
    .channel('tape-unlocks')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tape_unlocks',
      },
      (payload) => callback(payload)
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('Realtime subscription error for tape_unlocks:', err);
        console.warn('Enable Realtime in Supabase Dashboard: Database → Replication → Enable for tape_unlocks');
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
