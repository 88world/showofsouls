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
CREATE TABLE tapes (
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
 * Get all tapes from master registry
 */
export async function getAllTapes() {
  const { data, error } = await supabase
    .from('tapes')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching tapes:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all unlocked tapes
 */
export async function getUnlockedTapes() {
  const { data, error } = await supabase
    .from('tape_unlocks')
    .select('tape_id, unlocked_at, unlocked_by, unlock_method')
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
 * Create a new tape
 */
export async function createTape(tape) {
  const { data, error } = await supabase
    .from('tapes')
    .insert({
      tape_id: tape.tape_id,
      title: tape.title,
      date: tape.date || null,
      length: tape.length || null,
      video_url: tape.video_url || null,
      status: tape.status || 'SEALED',
      is_corrupt: tape.is_corrupt || false,
      is_visible: tape.is_visible || false,
      sort_order: tape.sort_order || 0,
      puzzle_trigger: tape.puzzle_trigger || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating tape:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Update an existing tape
 */
export async function updateTape(id, updates) {
  const { data, error } = await supabase
    .from('tapes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tape:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Delete a tape
 */
export async function deleteTape(id) {
  const { error } = await supabase
    .from('tapes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting tape:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
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

// ═══════════════════════════════════════════════════════════════
// FORUM / NEWS API
// ═══════════════════════════════════════════════════════════════

/**
 * Get all published forum posts
 */
export async function getForumPosts() {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching forum posts:', error);
    return [];
  }
  return data || [];
}

/**
 * Get ALL forum posts (including unpublished) — admin only
 */
export async function getAllForumPosts() {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all forum posts:', error);
    return [];
  }
  return data || [];
}

/**
 * Create a new forum post
 */
export async function createForumPost(post) {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      title: post.title,
      content: post.content,
      image_url: post.image_url || null,
      category: post.category || 'news',
      author: post.author || 'ADMIN',
      is_pinned: post.is_pinned || false,
      is_published: post.is_published !== false,
      span_class: post.span_class || 'col-span-1 row-span-1',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating forum post:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Update a forum post
 */
export async function updateForumPost(id, updates) {
  const { data, error } = await supabase
    .from('forum_posts')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating forum post:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

/**
 * Delete a forum post
 */
export async function deleteForumPost(id) {
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting forum post:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Upload an image to Supabase Storage (forum-images bucket)
 * Max 100MB. Returns the public URL on success.
 * 
 * SETUP: Create a public bucket called "forum-images" in Supabase Dashboard:
 *   Storage → New bucket → Name: forum-images → Public: ON
 */
export async function uploadForumImage(file) {
  const MAX_SIZE = 100 * 1024 * 1024; // 100MB
  if (file.size > MAX_SIZE) {
    return { success: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 100MB.` };
  }

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `uploads/${fileName}`;

  const { data, error } = await supabase.storage
    .from('forum-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('forum-images')
    .getPublicUrl(filePath);

  return { success: true, url: urlData.publicUrl };
}

/**
 * Upload any media file (video/audio/document) to Supabase Storage
 * Uses the 'forum-images' bucket (supports all file types despite the name)
 * Max 500MB. Returns the public URL on success.
 */
export async function uploadMediaFile(file, folder = 'media') {
  const MAX_SIZE = 500 * 1024 * 1024; // 500MB
  if (file.size > MAX_SIZE) {
    return { success: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max 500MB.` };
  }

  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('forum-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading media file:', error);
    return { success: false, error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from('forum-images')
    .getPublicUrl(filePath);

  return { success: true, url: urlData.publicUrl };
}

// ═══════════════════════════════════════════════════════════════
// VOICE RECORDINGS API
// ═══════════════════════════════════════════════════════════════

export async function getAllRecordings() {
  const { data, error } = await supabase
    .from('voice_recordings')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('Error fetching recordings:', error); return []; }
  return data || [];
}

export async function createRecording(rec) {
  const { data, error } = await supabase
    .from('voice_recordings')
    .insert({
      recording_id: rec.recording_id,
      title: rec.title,
      description: rec.description || '',
      audio_url: rec.audio_url || null,
      duration: rec.duration || null,
      date: rec.date || null,
      status: rec.status || 'CLASSIFIED',
      is_visible: rec.is_visible || false,
      sort_order: rec.sort_order || 0,
    })
    .select().single();
  if (error) { console.error('Error creating recording:', error); return { success: false, error: error.message }; }
  return { success: true, data };
}

export async function updateRecording(id, updates) {
  const { data, error } = await supabase
    .from('voice_recordings')
    .update(updates)
    .eq('id', id)
    .select().single();
  if (error) { console.error('Error updating recording:', error); return { success: false, error: error.message }; }
  return { success: true, data };
}

export async function deleteRecording(id) {
  const { error } = await supabase.from('voice_recordings').delete().eq('id', id);
  if (error) { console.error('Error deleting recording:', error); return { success: false, error: error.message }; }
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS API
// ═══════════════════════════════════════════════════════════════

export async function getAllDocuments() {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) { console.error('Error fetching documents:', error); return []; }
  return data || [];
}

export async function createDocument(doc) {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      document_id: doc.document_id,
      title: doc.title,
      content: doc.content || '',
      file_url: doc.file_url || null,
      doc_type: doc.doc_type || 'report',
      date: doc.date || null,
      status: doc.status || 'CLASSIFIED',
      is_visible: doc.is_visible || false,
      sort_order: doc.sort_order || 0,
    })
    .select().single();
  if (error) { console.error('Error creating document:', error); return { success: false, error: error.message }; }
  return { success: true, data };
}

export async function updateDocument(id, updates) {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select().single();
  if (error) { console.error('Error updating document:', error); return { success: false, error: error.message }; }
  return { success: true, data };
}

export async function deleteDocument(id) {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) { console.error('Error deleting document:', error); return { success: false, error: error.message }; }
  return { success: true };
}
