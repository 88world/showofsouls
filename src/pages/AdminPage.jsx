import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../utils/constants';
import { getAllForumPosts, createForumPost, updateForumPost, deleteForumPost, uploadForumImage, uploadMediaFile, getAllTapes, createTape, updateTape, deleteTape, getAllRecordings, createRecording, updateRecording, deleteRecording, getAllDocuments, createDocument, updateDocument, deleteDocument, getCurrentEvent, createGlobalEvent, completeGlobalEvent, supabase } from '../lib/supabase';
import { Icons, IconComponent } from '../components/common/Icons';
import { SEED_TAPES, SEED_RECORDINGS, SEED_DOCUMENTS } from '../utils/seedTestData';

// ═══════════════════════════════════════════════════════════════
// ADMIN PAGE — LOGIN + FORUM DASHBOARD
// Accessible via /admin
// ═══════════════════════════════════════════════════════════════

const ADMIN_STORAGE_KEY = 'sos_admin_session';

// Admin password — change this or set VITE_ADMIN_PASSWORD env var
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'SHOWOFSOULS2026';

function isAdminLoggedIn() {
  const session = localStorage.getItem(ADMIN_STORAGE_KEY);
  return session === 'authenticated';
}

function adminLogin(password) {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_STORAGE_KEY, 'authenticated');
    return true;
  }
  return false;
}

function adminLogout() {
  localStorage.removeItem(ADMIN_STORAGE_KEY);
}

// ═══════════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════════

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (adminLogin(password)) {
        onLogin();
      } else {
        setError('ACCESS DENIED');
        setPassword('');
      }
      setLoading(false);
    }, 800); // Fake delay for effect
  };

  return (
    <div style={{
      minHeight: '100vh', background: COLORS.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40,
    }}>
      <div style={{
        background: COLORS.cardDark,
        border: `2px solid ${COLORS.crimson}`,
        padding: 48, maxWidth: 420, width: '100%',
        boxShadow: `0 0 60px ${COLORS.crimson}15`,
      }}>
        {/* Terminal header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginBottom: 32, paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.ash}40`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: COLORS.crimson,
            animation: 'pulse 1.5s infinite',
          }} />
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2, color: COLORS.ash,
          }}>
            ADMIN_TERMINAL_v2.0
          </span>
        </div>

        {/* Status text */}
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 10, color: COLORS.ash, lineHeight: 1.8,
          marginBottom: 24,
        }}>
          {'>'} RESTRICTED ACCESS ZONE<br />
          {'>'} AUTHENTICATION REQUIRED<br />
          {'>'} ENTER ADMIN PASSWORD TO PROCEED
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 9, letterSpacing: 2, color: COLORS.ash,
            display: 'block', marginBottom: 8,
          }}>
            PASSWORD
          </label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••"
            autoFocus
            style={{
              width: '100%', padding: '14px 16px',
              background: COLORS.bg,
              border: `1px solid ${error ? COLORS.crimson : COLORS.ash}40`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 14, letterSpacing: 3,
              color: COLORS.bone,
              outline: 'none', transition: 'all 0.3s',
            }}
          />

          {error && (
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10, color: COLORS.crimson,
              marginTop: 12, textAlign: 'center',
              animation: 'shake 0.5s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Icons.AlertTriangle size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', marginTop: 20,
              padding: '14px',
              background: loading ? COLORS.ash + '20' : COLORS.crimson + '15',
              border: `1px solid ${COLORS.crimson}`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, letterSpacing: 2,
              color: COLORS.crimson,
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.background = COLORS.crimson + '30';
                e.currentTarget.style.boxShadow = `0 0 20px ${COLORS.crimson}20`;
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = COLORS.crimson + '15';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// POST EDITOR MODAL
// ═══════════════════════════════════════════════════════════════

const PostEditor = ({ post, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: post?.title || '',
    content: post?.content || '',
    image_url: post?.image_url || '',
    category: post?.category || 'news',
    author: post?.author || 'ADMIN',
    is_pinned: post?.is_pinned || false,
    is_published: post?.is_published !== false,
    span_class: post?.span_class || 'col-span-1 row-span-1',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);

    const result = await uploadForumImage(file);
    if (result.success) {
      setForm(prev => ({ ...prev, image_url: result.url }));
    } else {
      setUploadError(result.error);
    }
    setUploading(false);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: COLORS.bg,
    border: `1px solid ${COLORS.ash}40`,
    fontFamily: "'Space Mono', monospace",
    fontSize: 12, color: COLORS.bone,
    outline: 'none', transition: 'border 0.3s',
  };

  const labelStyle = {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, letterSpacing: 2, color: COLORS.ash,
    display: 'block', marginBottom: 6, marginTop: 16,
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, overflow: 'auto', animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: COLORS.cardDark,
          border: `2px solid ${COLORS.flora}`,
          padding: 'clamp(16px, 4vw, 32px)', maxWidth: 600, width: 'calc(100% - 24px)',
          maxHeight: '90vh', overflow: 'auto',
          animation: 'scaleIn 0.3s ease',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.ash}40`,
        }}>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24, letterSpacing: 3, color: COLORS.bone, margin: 0,
          }}>
            {post ? 'EDIT POST' : 'NEW POST'}
          </h3>
          <button onClick={onCancel} style={{
            background: 'transparent', border: 'none',
            color: COLORS.ash, fontSize: 22, cursor: 'pointer',
          }}
          onMouseEnter={e => e.target.style.color = COLORS.crimson}
          onMouseLeave={e => e.target.style.color = COLORS.ash}
          >×</button>
        </div>

        {/* Title */}
        <label style={labelStyle}>TITLE</label>
        <input
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          placeholder="Post title..."
          style={inputStyle}
        />

        {/* Content */}
        <label style={labelStyle}>CONTENT</label>
        <textarea
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          placeholder="Write your post content..."
          rows={8}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
        />

        {/* Image Upload */}
        <label style={labelStyle}>IMAGE (OPTIONAL — MAX 100MB)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '10px 18px',
              background: uploading ? COLORS.ash + '15' : COLORS.flora + '10',
              border: `1px solid ${uploading ? COLORS.ash : COLORS.flora}40`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 10, letterSpacing: 2,
              color: uploading ? COLORS.ash : COLORS.flora,
              cursor: uploading ? 'wait' : 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = COLORS.flora + '20'; }}
            onMouseLeave={e => { if (!uploading) e.currentTarget.style.background = COLORS.flora + '10'; }}
          >
            {uploading ? 'UPLOADING...' : '↑ UPLOAD IMAGE'}
          </button>
          <input
            value={form.image_url}
            onChange={e => setForm({ ...form, image_url: e.target.value })}
            placeholder="...or paste URL"
            style={{ ...inputStyle, flex: 1 }}
          />
          {form.image_url && (
            <button
              type="button"
              onClick={() => setForm({ ...form, image_url: '' })}
              style={{
                padding: '10px 14px',
                background: 'transparent',
                border: `1px solid ${COLORS.ash}30`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, color: COLORS.crimson,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.crimson}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.ash + '30'}
            >
              <Icons.X size={14} />
            </button>
          )}
        </div>
        {uploadError && (
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10, color: COLORS.crimson,
            marginTop: 8, letterSpacing: 1,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Icons.AlertTriangle size={14} />
            {uploadError}
          </div>
        )}
        {uploading && (
          <div style={{
            marginTop: 8, height: 3,
            background: COLORS.ash + '20',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: '40%',
              background: COLORS.flora,
              animation: 'uploadSlide 1s ease-in-out infinite alternate',
            }} />
          </div>
        )}
        {form.image_url && (
          <div style={{
            marginTop: 8, height: 140, background: '#000',
            backgroundImage: `url('${form.image_url}')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: `1px solid ${COLORS.ash}20`,
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', bottom: 4, left: 6,
              fontFamily: "'Space Mono', monospace",
              fontSize: 8, color: COLORS.ash, letterSpacing: 1,
              background: COLORS.bg + 'cc', padding: '2px 6px',
            }}>
              PREVIEW
            </div>
          </div>
        )}

        {/* Category + Author row */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>CATEGORY</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="news">NEWS</option>
              <option value="render">RENDER</option>
              <option value="update">UPDATE</option>
              <option value="devlog">DEVLOG</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>AUTHOR</label>
            <input
              value={form.author}
              onChange={e => setForm({ ...form, author: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Grid span */}
        <label style={labelStyle}>GRID SIZE</label>
        <select
          value={form.span_class}
          onChange={e => setForm({ ...form, span_class: e.target.value })}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="col-span-1 row-span-1">1×1 (Small)</option>
          <option value="col-span-2 row-span-1">2×1 (Wide)</option>
          <option value="col-span-1 row-span-2">1×2 (Tall)</option>
          <option value="col-span-2 row-span-2">2×2 (Large)</option>
          <option value="col-span-3 row-span-1">3×1 (Full Width)</option>
        </select>

        {/* Toggles */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            color: form.is_pinned ? COLORS.gold : COLORS.ash,
            letterSpacing: 1,
          }}>
            <input
              type="checkbox"
              checked={form.is_pinned}
              onChange={e => setForm({ ...form, is_pinned: e.target.checked })}
              style={{ accentColor: COLORS.gold }}
            />
            PINNED
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            color: form.is_published ? COLORS.flora : COLORS.ash,
            letterSpacing: 1,
          }}>
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={e => setForm({ ...form, is_published: e.target.checked })}
              style={{ accentColor: COLORS.flora }}
            />
            PUBLISHED
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            style={{
              flex: 1, padding: '14px',
              background: COLORS.flora + '15',
              border: `1px solid ${COLORS.flora}`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, letterSpacing: 2,
              color: COLORS.flora, textTransform: 'uppercase',
              cursor: saving ? 'wait' : 'pointer',
              transition: 'all 0.3s',
              opacity: !form.title.trim() ? 0.4 : 1,
            }}
            onMouseEnter={e => {
              if (!saving && form.title.trim()) {
                e.currentTarget.style.background = COLORS.flora + '25';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = COLORS.flora + '15';
            }}
          >
            {saving ? 'SAVING...' : (post ? 'UPDATE POST' : 'CREATE POST')}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '14px',
              background: 'transparent',
              border: `1px solid ${COLORS.ash}40`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, letterSpacing: 2,
              color: COLORS.ash, textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.3s',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// TAPE EDITOR MODAL
// ═══════════════════════════════════════════════════════════════

const TapeEditor = ({ tape, onSave, onCancel }) => {
  const [form, setForm] = useState({
    tape_id: tape?.tape_id || '[AUTO-GENERATED]',
    title: tape?.title || '',
    date: tape?.date || '',
    length: tape?.length || '',
    video_url: tape?.video_url || '',
    status: tape?.status || 'SEALED',
    is_corrupt: tape?.is_corrupt || false,
    is_visible: tape?.is_visible || false,
    sort_order: tape?.sort_order || 0,
    puzzle_trigger: tape?.puzzle_trigger || '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const videoInputRef = useRef(null);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    const result = await uploadMediaFile(file, 'videos');
    if (result.success) {
      setForm(prev => ({ ...prev, video_url: result.url }));
    } else {
      setUploadError(result.error);
    }
    setUploading(false);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    // Only require tape_id for editing, not for new tapes (they're auto-generated)
    if (tape && !form.tape_id.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: COLORS.bg,
    border: `1px solid ${COLORS.ash}40`,
    fontFamily: "'Space Mono', monospace",
    fontSize: 12, color: COLORS.bone,
    outline: 'none', transition: 'border 0.3s',
  };

  const labelStyle = {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, letterSpacing: 2, color: COLORS.ash,
    display: 'block', marginBottom: 6, marginTop: 16,
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, overflow: 'auto', animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: COLORS.cardDark,
          border: `2px solid ${COLORS.gold}`,
          padding: 32, maxWidth: 550, width: '100%',
          maxHeight: '90vh', overflow: 'auto',
          animation: 'scaleIn 0.3s ease',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.ash}40`,
        }}>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24, letterSpacing: 3, color: COLORS.bone, margin: 0,
          }}>
            {tape ? 'EDIT TAPE' : 'NEW TAPE'}
          </h3>
          <button onClick={onCancel} style={{
            background: 'transparent', border: 'none',
            color: COLORS.ash, fontSize: 22, cursor: 'pointer',
          }}
          onMouseEnter={e => e.target.style.color = COLORS.crimson}
          onMouseLeave={e => e.target.style.color = COLORS.ash}
          >×</button>
        </div>

        {/* Tape ID + Title */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>TAPE ID</label>
            <input
              value={form.tape_id}
              onChange={e => setForm({ ...form, tape_id: e.target.value })}
              placeholder="Auto-generated as TAPE-###"
              disabled={!!tape}
              style={{ ...inputStyle, opacity: tape ? 0.5 : 1 }}
            />
          </div>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>TITLE</label>
            <input
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Tape title..."
              style={inputStyle}
            />
          </div>
        </div>

        {/* Date + Length */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DATE</label>
            <input
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              placeholder="OCT-19-1947"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>LENGTH</label>
            <input
              value={form.length}
              onChange={e => setForm({ ...form, length: e.target.value })}
              placeholder="47:23"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Status + Sort Order */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>STATUS</label>
            <select
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="SEALED">SEALED</option>
              <option value="SAFE">SAFE</option>
              <option value="CORRUPT">CORRUPT</option>
              <option value="REDACTED">REDACTED</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>SORT ORDER</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Puzzle Trigger */}
        <label style={labelStyle}>PUZZLE TRIGGER (OPTIONAL)</label>
        <input
          value={form.puzzle_trigger}
          onChange={e => setForm({ ...form, puzzle_trigger: e.target.value })}
          placeholder="e.g. passwordTerminal"
          style={inputStyle}
        />

        {/* Video Upload */}
        <label style={labelStyle}>VIDEO FILE (MAX 500MB)</label>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '10px 18px',
              background: uploading ? COLORS.ash + '15' : COLORS.gold + '10',
              border: `1px solid ${uploading ? COLORS.ash : COLORS.gold}40`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 10, letterSpacing: 2,
              color: uploading ? COLORS.ash : COLORS.gold,
              cursor: uploading ? 'wait' : 'pointer',
              textTransform: 'uppercase',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = COLORS.gold + '20'; }}
            onMouseLeave={e => { if (!uploading) e.currentTarget.style.background = COLORS.gold + '10'; }}
          >
            {uploading ? 'UPLOADING...' : <><Icons.Upload size={14} /> UPLOAD VIDEO</>}
          </button>
          <input
            value={form.video_url}
            onChange={e => setForm({ ...form, video_url: e.target.value })}
            placeholder="...or paste video URL"
            style={{ ...inputStyle, flex: 1 }}
          />
          {form.video_url && (
            <button
              type="button"
              onClick={() => setForm({ ...form, video_url: '' })}
              style={{
                padding: '10px 14px',
                background: 'transparent',
                border: `1px solid ${COLORS.ash}30`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, color: COLORS.crimson,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.crimson}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.ash + '30'}
            >
              <Icons.X size={14} />
            </button>
          )}
        </div>
        {uploadError && (
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10, color: COLORS.crimson,
            marginTop: 8, letterSpacing: 1,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Icons.AlertTriangle size={14} />
            {uploadError}
          </div>
        )}
        {uploading && (
          <div style={{
            marginTop: 8, height: 3,
            background: COLORS.ash + '20',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: '40%',
              background: COLORS.gold,
              animation: 'uploadSlide 1s ease-in-out infinite alternate',
            }} />
          </div>
        )}
        {form.video_url && (
          <div style={{
            marginTop: 8, padding: 10,
            background: '#000', border: `1px solid ${COLORS.ash}20`,
          }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 9, color: COLORS.gold, letterSpacing: 1,
              marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Icons.Video size={14} />
              VIDEO ATTACHED
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 8, color: COLORS.ash,
              wordBreak: 'break-all',
            }}>
              {form.video_url.length > 80 ? form.video_url.slice(0, 80) + '...' : form.video_url}
            </div>
          </div>
        )}

        {/* Toggles */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            color: form.is_visible ? COLORS.flora : COLORS.ash,
            letterSpacing: 1,
          }}>
            <input
              type="checkbox"
              checked={form.is_visible}
              onChange={e => setForm({ ...form, is_visible: e.target.checked })}
              style={{ accentColor: COLORS.flora }}
            />
            VISIBLE
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            color: form.is_corrupt ? COLORS.crimson : COLORS.ash,
            letterSpacing: 1,
          }}>
            <input
              type="checkbox"
              checked={form.is_corrupt}
              onChange={e => setForm({ ...form, is_corrupt: e.target.checked })}
              style={{ accentColor: COLORS.crimson }}
            />
            CORRUPT
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || (tape && !form.tape_id.trim())}
            style={{
              flex: 1, padding: '14px',
              background: COLORS.gold + '15',
              border: `1px solid ${COLORS.gold}`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, letterSpacing: 2,
              color: COLORS.gold, textTransform: 'uppercase',
              cursor: saving ? 'wait' : 'pointer',
              transition: 'all 0.3s',
              opacity: (!form.title.trim() || (tape && !form.tape_id.trim())) ? 0.4 : 1,
            }}
            onMouseEnter={e => {
              if (!saving && form.title.trim() && (!tape || form.tape_id.trim())) {
                e.currentTarget.style.background = COLORS.gold + '25';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = COLORS.gold + '15';
            }}
          >
            {saving ? 'SAVING...' : (tape ? 'UPDATE TAPE' : 'CREATE TAPE')}
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '14px',
              background: 'transparent',
              border: `1px solid ${COLORS.ash}40`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, letterSpacing: 2,
              color: COLORS.ash, textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.3s',
            }}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// RECORDING EDITOR MODAL
// ═══════════════════════════════════════════════════════════════

const RecordingEditor = ({ recording, onSave, onCancel }) => {
  const [form, setForm] = useState({
    recording_id: recording?.recording_id || '',
    title: recording?.title || '',
    description: recording?.description || '',
    audio_url: recording?.audio_url || '',
    duration: recording?.duration || '',
    date: recording?.date || '',
    status: recording?.status || 'CLASSIFIED',
    is_visible: recording?.is_visible || false,
    sort_order: recording?.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const audioInputRef = useRef(null);

  const handleAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    const result = await uploadMediaFile(file, 'audio');
    if (result.success) {
      setForm(prev => ({ ...prev, audio_url: result.url }));
    } else {
      setUploadError(result.error);
    }
    setUploading(false);
    if (audioInputRef.current) audioInputRef.current.value = '';
  };

  const handleSave = async () => {
    if (!form.recording_id.trim() || !form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: COLORS.bg,
    border: `1px solid ${COLORS.ash}40`,
    fontFamily: "'Space Mono', monospace",
    fontSize: 12, color: COLORS.bone,
    outline: 'none', transition: 'border 0.3s',
  };
  const labelStyle = {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, letterSpacing: 2, color: COLORS.ash,
    display: 'block', marginBottom: 6, marginTop: 16,
  };

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, overflow: 'auto', animation: 'fadeIn 0.3s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: COLORS.cardDark,
        border: `2px solid ${COLORS.ember}`,
        padding: 32, maxWidth: 550, width: '100%',
        maxHeight: '90vh', overflow: 'auto',
        animation: 'scaleIn 0.3s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.ash}40`,
        }}>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24, letterSpacing: 3, color: COLORS.bone, margin: 0,
          }}>
            {recording ? 'EDIT RECORDING' : 'NEW RECORDING'}
          </h3>
          <button onClick={onCancel} style={{
            background: 'transparent', border: 'none',
            color: COLORS.ash, fontSize: 22, cursor: 'pointer',
          }}
          onMouseEnter={e => e.target.style.color = COLORS.crimson}
          onMouseLeave={e => e.target.style.color = COLORS.ash}
          >×</button>
        </div>

        {/* ID + Title */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>RECORDING ID</label>
            <input value={form.recording_id}
              onChange={e => setForm({ ...form, recording_id: e.target.value })}
              placeholder="REC-001" disabled={!!recording}
              style={{ ...inputStyle, opacity: recording ? 0.5 : 1 }} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>TITLE</label>
            <input value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Recording title..." style={inputStyle} />
          </div>
        </div>

        {/* Description */}
        <label style={labelStyle}>DESCRIPTION</label>
        <textarea value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Transmission details..." rows={3}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />

        {/* Date + Duration + Status */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DATE</label>
            <input value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              placeholder="OCT-19-1947" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DURATION</label>
            <input value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
              placeholder="03:42" style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>STATUS</label>
            <select value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="CLASSIFIED">CLASSIFIED</option>
              <option value="DECLASSIFIED">DECLASSIFIED</option>
              <option value="CORRUPTED">CORRUPTED</option>
              <option value="INTERCEPTED">INTERCEPTED</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>SORT ORDER</label>
            <input type="number" value={form.sort_order}
              onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              style={inputStyle} />
          </div>
        </div>

        {/* Audio Upload */}
        <label style={labelStyle}>AUDIO FILE (MAX 500MB)</label>
        <input ref={audioInputRef} type="file" accept="audio/*"
          onChange={handleAudioUpload} style={{ display: 'none' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button"
            onClick={() => audioInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '10px 18px',
              background: uploading ? COLORS.ash + '15' : COLORS.ember + '10',
              border: `1px solid ${uploading ? COLORS.ash : COLORS.ember}40`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 10, letterSpacing: 2,
              color: uploading ? COLORS.ash : COLORS.ember,
              cursor: uploading ? 'wait' : 'pointer',
              textTransform: 'uppercase', transition: 'all 0.3s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = COLORS.ember + '20'; }}
            onMouseLeave={e => { if (!uploading) e.currentTarget.style.background = COLORS.ember + '10'; }}
          >
            {uploading ? 'UPLOADING...' : '♪ UPLOAD AUDIO'}
          </button>
          <input value={form.audio_url}
            onChange={e => setForm({ ...form, audio_url: e.target.value })}
            placeholder="...or paste audio URL"
            style={{ ...inputStyle, flex: 1 }} />
          {form.audio_url && (
            <button type="button"
              onClick={() => setForm({ ...form, audio_url: '' })}
              style={{ padding: '10px 14px', background: 'transparent',
                border: `1px solid ${COLORS.ash}30`, fontFamily: "'Space Mono', monospace",
                fontSize: 10, color: COLORS.crimson, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.crimson}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.ash + '30'}
            ><Icons.X size={14} /></button>
          )}
        </div>
        {uploadError && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.crimson, marginTop: 8, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.AlertTriangle size={14} />
            {uploadError}
          </div>
        )}
        {uploading && (
          <div style={{ marginTop: 8, height: 3, background: COLORS.ash + '20', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '40%', background: COLORS.ember,
              animation: 'uploadSlide 1s ease-in-out infinite alternate' }} />
          </div>
        )}
        {form.audio_url && (
          <div style={{ marginTop: 8, padding: 10, background: '#000', border: `1px solid ${COLORS.ash}20` }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ember, letterSpacing: 1 }}>
              ♪ AUDIO ATTACHED
            </div>
          </div>
        )}

        {/* Visible toggle */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            color: form.is_visible ? COLORS.flora : COLORS.ash, letterSpacing: 1,
          }}>
            <input type="checkbox" checked={form.is_visible}
              onChange={e => setForm({ ...form, is_visible: e.target.checked })}
              style={{ accentColor: COLORS.flora }} />
            VISIBLE
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button onClick={handleSave}
            disabled={saving || !form.recording_id.trim() || !form.title.trim()}
            style={{
              flex: 1, padding: '14px',
              background: COLORS.ember + '15', border: `1px solid ${COLORS.ember}`,
              fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2,
              color: COLORS.ember, textTransform: 'uppercase',
              cursor: saving ? 'wait' : 'pointer', transition: 'all 0.3s',
              opacity: (!form.recording_id.trim() || !form.title.trim()) ? 0.4 : 1,
            }}
            onMouseEnter={e => { if (!saving && form.recording_id.trim() && form.title.trim()) e.currentTarget.style.background = COLORS.ember + '25'; }}
            onMouseLeave={e => { e.currentTarget.style.background = COLORS.ember + '15'; }}
          >
            {saving ? 'SAVING...' : (recording ? 'UPDATE RECORDING' : 'CREATE RECORDING')}
          </button>
          <button onClick={onCancel} style={{
            flex: 1, padding: '14px', background: 'transparent',
            border: `1px solid ${COLORS.ash}40`, fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2, color: COLORS.ash,
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
          }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENT EDITOR MODAL
// ═══════════════════════════════════════════════════════════════

const DocumentEditor = ({ document: doc, onSave, onCancel }) => {
  const [form, setForm] = useState({
    document_id: doc?.document_id || '',
    title: doc?.title || '',
    content: doc?.content || '',
    file_url: doc?.file_url || '',
    doc_type: doc?.doc_type || 'report',
    date: doc?.date || '',
    status: doc?.status || 'CLASSIFIED',
    is_visible: doc?.is_visible || false,
    sort_order: doc?.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(true);
    const result = await uploadMediaFile(file, 'documents');
    if (result.success) {
      setForm(prev => ({ ...prev, file_url: result.url }));
    } else {
      setUploadError(result.error);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async () => {
    const hasTitle = form.title.trim();
    const hasId = form.document_id.trim();
    if (!hasTitle || (doc && !hasId)) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: COLORS.bg,
    border: `1px solid ${COLORS.ash}40`,
    fontFamily: "'Space Mono', monospace",
    fontSize: 12, color: COLORS.bone,
    outline: 'none', transition: 'border 0.3s',
  };
  const labelStyle = {
    fontFamily: "'Space Mono', monospace",
    fontSize: 9, letterSpacing: 2, color: COLORS.ash,
    display: 'block', marginBottom: 6, marginTop: 16,
  };

  return (
    <div onClick={onCancel} style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 40, overflow: 'auto', animation: 'fadeIn 0.3s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: COLORS.cardDark,
        border: `2px solid ${COLORS.crimson}`,
        padding: 32, maxWidth: 550, width: '100%',
        maxHeight: '90vh', overflow: 'auto',
        animation: 'scaleIn 0.3s ease',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, paddingBottom: 16,
          borderBottom: `1px solid ${COLORS.ash}40`,
        }}>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 24, letterSpacing: 3, color: COLORS.bone, margin: 0,
          }}>
            {doc ? 'EDIT DOCUMENT' : 'NEW DOCUMENT'}
          </h3>
          <button onClick={onCancel} style={{
            background: 'transparent', border: 'none',
            color: COLORS.ash, fontSize: 22, cursor: 'pointer',
          }}
          onMouseEnter={e => e.target.style.color = COLORS.crimson}
          onMouseLeave={e => e.target.style.color = COLORS.ash}
          >×</button>
        </div>

        {/* ID + Title */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DOCUMENT ID</label>
            <input value={form.document_id}
              onChange={e => setForm({ ...form, document_id: e.target.value })}
              placeholder="DOC-001" disabled={!!doc}
              style={{ ...inputStyle, opacity: doc ? 0.5 : 1 }} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>TITLE</label>
            <input value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Document title..." style={inputStyle} />
          </div>
        </div>

        {/* Content */}
        <label style={labelStyle}>CONTENT / EXCERPT</label>
        <textarea value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          placeholder="Document text..." rows={5}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />

        {/* Date + Type + Status */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DATE</label>
            <input value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              placeholder="NOV-02-1947" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>TYPE</label>
            <select value={form.doc_type}
              onChange={e => setForm({ ...form, doc_type: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="report">REPORT</option>
              <option value="memo">MEMO</option>
              <option value="letter">LETTER</option>
              <option value="blueprint">BLUEPRINT</option>
              <option value="log">LOG ENTRY</option>
              <option value="autopsy">AUTOPSY</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>STATUS</label>
            <select value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="CLASSIFIED">CLASSIFIED</option>
              <option value="DECLASSIFIED">DECLASSIFIED</option>
              <option value="REDACTED">REDACTED</option>
              <option value="DESTROYED">DESTROYED</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>SORT ORDER</label>
            <input type="number" value={form.sort_order}
              onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
              style={inputStyle} />
          </div>
        </div>

        {/* File Upload */}
        <label style={labelStyle}>DOCUMENT FILE (PDF/IMAGE — MAX 500MB)</label>
        <input ref={fileInputRef} type="file" accept=".pdf,image/*,.doc,.docx,.txt"
          onChange={handleFileUpload} style={{ display: 'none' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '10px 18px',
              background: uploading ? COLORS.ash + '15' : COLORS.crimson + '10',
              border: `1px solid ${uploading ? COLORS.ash : COLORS.crimson}40`,
              fontFamily: "'Space Mono', monospace",
              fontSize: 10, letterSpacing: 2,
              color: uploading ? COLORS.ash : COLORS.crimson,
              cursor: uploading ? 'wait' : 'pointer',
              textTransform: 'uppercase', transition: 'all 0.3s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!uploading) e.currentTarget.style.background = COLORS.crimson + '20'; }}
            onMouseLeave={e => { if (!uploading) e.currentTarget.style.background = COLORS.crimson + '10'; }}
          >
            {uploading ? 'UPLOADING...' : <><Icons.FileText size={14} /> UPLOAD FILE</>}
          </button>
          <input value={form.file_url}
            onChange={e => setForm({ ...form, file_url: e.target.value })}
            placeholder="...or paste file URL"
            style={{ ...inputStyle, flex: 1 }} />
          {form.file_url && (
            <button type="button"
              onClick={() => setForm({ ...form, file_url: '' })}
              style={{ padding: '10px 14px', background: 'transparent',
                border: `1px solid ${COLORS.ash}30`, fontFamily: "'Space Mono', monospace",
                fontSize: 10, color: COLORS.crimson, cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = COLORS.crimson}
              onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.ash + '30'}
            ><Icons.X size={14} /></button>
          )}
        </div>
        {uploadError && (
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.crimson, marginTop: 8, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icons.AlertTriangle size={14} />
            {uploadError}
          </div>
        )}
        {uploading && (
          <div style={{ marginTop: 8, height: 3, background: COLORS.ash + '20', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '40%', background: COLORS.crimson,
              animation: 'uploadSlide 1s ease-in-out infinite alternate' }} />
          </div>
        )}
        {form.file_url && (
          <div style={{ marginTop: 8, padding: 10, background: '#000', border: `1px solid ${COLORS.ash}20` }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.crimson, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icons.Download size={12} />
              <span>FILE ATTACHED</span>
            </div>
          </div>
        )}

        {/* Visible toggle */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            color: form.is_visible ? COLORS.flora : COLORS.ash, letterSpacing: 1,
          }}>
            <input type="checkbox" checked={form.is_visible}
              onChange={e => setForm({ ...form, is_visible: e.target.checked })}
              style={{ accentColor: COLORS.flora }} />
            VISIBLE
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <button onClick={handleSave}
            disabled={saving || !form.title.trim() || (doc && !form.document_id.trim())}
            style={{
              flex: 1, padding: '14px',
              background: COLORS.crimson + '15', border: `1px solid ${COLORS.crimson}`,
              fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 2,
              color: COLORS.crimson, textTransform: 'uppercase',
              cursor: saving ? 'wait' : 'pointer', transition: 'all 0.3s',
              opacity: (!form.title.trim() || (doc && !form.document_id.trim())) ? 0.4 : 1,
            }}
            onMouseEnter={e => { if (!saving && form.document_id.trim() && form.title.trim()) e.currentTarget.style.background = COLORS.crimson + '25'; }}
            onMouseLeave={e => { e.currentTarget.style.background = COLORS.crimson + '15'; }}
          >
            {saving ? 'SAVING...' : (doc ? 'UPDATE DOCUMENT' : 'CREATE DOCUMENT')}
          </button>
          <button onClick={onCancel} style={{
            flex: 1, padding: '14px', background: 'transparent',
            border: `1px solid ${COLORS.ash}40`, fontFamily: "'Space Mono', monospace",
            fontSize: 11, letterSpacing: 2, color: COLORS.ash,
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
          }}>CANCEL</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('forum'); // 'forum' | 'tapes' | 'recordings' | 'documents' | 'events'
  const [posts, setPosts] = useState([]);
  const [tapes, setTapes] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = none, 'new' = new post, post object = editing
  const [editingTape, setEditingTape] = useState(null); // null = none, 'new' = new tape, tape object = editing
  const [editingRecording, setEditingRecording] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteTapeConfirm, setDeleteTapeConfirm] = useState(null);
  const [deleteRecordingConfirm, setDeleteRecordingConfirm] = useState(null);
  const [deleteDocumentConfirm, setDeleteDocumentConfirm] = useState(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [creatingEvent, setCreatingEvent] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [postsData, tapesData, recsData, docsData, eventData] = await Promise.all([
      getAllForumPosts(), getAllTapes(), getAllRecordings(), getAllDocuments(), getCurrentEvent()
    ]);
    setPosts(postsData);
    setTapes(tapesData);
    setRecordings(recsData);
    setDocuments(docsData);
    setCurrentEvent(eventData);
    setLoading(false);
  };

  const loadPosts = async () => {
    const data = await getAllForumPosts();
    setPosts(data);
  };

  const loadTapes = async () => {
    const data = await getAllTapes();
    setTapes(data);
  };

  const handleSave = async (formData) => {
    if (editing && editing !== 'new') {
      // Update existing
      const result = await updateForumPost(editing.id, formData);
      if (result.success) {
        await loadPosts();
        setEditing(null);
      }
    } else {
      // Create new
      const result = await createForumPost(formData);
      if (result.success) {
        await loadPosts();
        setEditing(null);
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await deleteForumPost(id);
    if (result.success) {
      setDeleteConfirm(null);
      await loadPosts();
    }
  };

  const togglePublish = async (post) => {
    await updateForumPost(post.id, { is_published: !post.is_published });
    await loadPosts();
  };

  const togglePin = async (post) => {
    await updateForumPost(post.id, { is_pinned: !post.is_pinned });
    await loadPosts();
  };

  // Tape handlers
  const handleSaveTape = async (formData) => {
    if (editingTape && editingTape !== 'new') {
      const result = await updateTape(editingTape.id, formData);
      if (result.success) {
        await loadTapes();
        setEditingTape(null);
      }
    } else {
      // Auto-generate tape ID for new tapes
      const nextTapeNumber = (tapes.length + 1).toString().padStart(3, '0');
      const tapeData = {
        ...formData,
        tape_id: `TAPE-${nextTapeNumber}`,
      };
      const result = await createTape(tapeData);
      if (result.success) {
        await loadTapes();
        setEditingTape(null);
      }
    }
  };

  const handleDeleteTape = async (id) => {
    const result = await deleteTape(id);
    if (result.success) {
      setDeleteTapeConfirm(null);
      await loadTapes();
    }
  };

  const toggleTapeVisibility = async (tape) => {
    await updateTape(tape.id, { is_visible: !tape.is_visible });
    await loadTapes();
  };

  const toggleTapeCorrupt = async (tape) => {
    await updateTape(tape.id, { is_corrupt: !tape.is_corrupt });
    await loadTapes();
  };

  // Recording handlers
  const loadRecordings = async () => {
    const data = await getAllRecordings();
    setRecordings(data);
  };

  const handleSaveRecording = async (formData) => {
    if (editingRecording && editingRecording !== 'new') {
      const result = await updateRecording(editingRecording.id, formData);
      if (result.success) { await loadRecordings(); setEditingRecording(null); }
    } else {
      const result = await createRecording(formData);
      if (result.success) { await loadRecordings(); setEditingRecording(null); }
    }
  };

  const handleDeleteRecording = async (id) => {
    const result = await deleteRecording(id);
    if (result.success) { setDeleteRecordingConfirm(null); await loadRecordings(); }
  };

  const toggleRecordingVisibility = async (rec) => {
    await updateRecording(rec.id, { is_visible: !rec.is_visible });
    await loadRecordings();
  };

  // Document handlers
  const loadDocuments = async () => {
    const data = await getAllDocuments();
    setDocuments(data);
  };

  const handleSaveDocument = async (formData) => {
    if (editingDocument && editingDocument !== 'new') {
      const result = await updateDocument(editingDocument.id, formData);
      if (result.success) { await loadDocuments(); setEditingDocument(null); }
    } else {
      // Auto-generate document ID for new documents
      const nextDocNumber = (documents.length + 1).toString().padStart(3, '0');
      const docData = {
        ...formData,
        document_id: `DOC-${nextDocNumber}`,
      };
      const result = await createDocument(docData);
      if (result.success) { await loadDocuments(); setEditingDocument(null); }
    }
  };

  const handleDeleteDocument = async (id) => {
    const result = await deleteDocument(id);
    if (result.success) { setDeleteDocumentConfirm(null); await loadDocuments(); }
  };

  const toggleDocumentVisibility = async (doc) => {
    await updateDocument(doc.id, { is_visible: !doc.is_visible });
    await loadDocuments();
  };

  // Event management handlers
  const loadEvents = async () => {
    const event = await getCurrentEvent();
    setCurrentEvent(event);
  };

  const handleCreateEvent = async () => {
    if (!eventTitle.trim()) return;

    setCreatingEvent(true);
    const eventData = {
      title: eventTitle,
      description: eventDescription,
      started_at: new Date().toISOString(),
      is_active: true,
    };

    const result = await createGlobalEvent(eventData);
    setCreatingEvent(false);

    if (result.success) {
      await loadEvents();
      setEventFormOpen(false);
      setEventTitle('');
      setEventDescription('');
      
      // Force all users to see update via page refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleStopEvent = async () => {
    if (!currentEvent) return;

    const { error } = await supabase
      .from('global_events')
      .update({ is_active: false })
      .eq('event_id', currentEvent.event_id);

    if (!error) {
      // Immediately update local state
      await loadEvents();
      
      // Force all users to see update via page refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  const handleResetEvents = async () => {
    if (!confirm('Are you sure? This will reset all event data.')) return;

    // Delete all event-related data
    await supabase.from('global_events').delete().gt('event_id', '0');
    await supabase.from('event_completions').delete().gt('id', '0');

    setCurrentEvent(null);
    await loadEvents();
    
    // Force all users to see update via page refresh after 2 seconds
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Seed test data for tapes, recordings, and documents
  const handleSeedTestData = async () => {
    if (!confirm('Generate 6 test tapes, 6 recordings, and 6 documents? (You can delete them later)')) return;

    try {
      // Seed tapes
      for (const tape of SEED_TAPES) {
        await createTape(tape);
      }

      // Seed recordings
      for (const rec of SEED_RECORDINGS) {
        await createRecording(rec);
      }

      // Seed documents
      for (const doc of SEED_DOCUMENTS) {
        await createDocument(doc);
      }

      // Reload all data
      await loadAll();
      alert('Test data seeded successfully!');
    } catch (error) {
      console.error('Error seeding test data:', error);
      alert('Error seeding data. Check console.');
    }
  };

  return (
    <div className="page page-admin" style={{
      minHeight: '100vh', background: COLORS.bg,
      color: COLORS.bone, padding: 'clamp(80px, 12vw, 120px) clamp(12px, 4vw, 40px) clamp(30px, 5vw, 60px)',
    }}>
      {/* Post editor modal */}
      {editing && (
        <PostEditor
          post={editing === 'new' ? null : editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Tape editor modal */}
      {editingTape && (
        <TapeEditor
          tape={editingTape === 'new' ? null : editingTape}
          onSave={handleSaveTape}
          onCancel={() => setEditingTape(null)}
        />
      )}

      {/* Recording editor modal */}
      {editingRecording && (
        <RecordingEditor
          recording={editingRecording === 'new' ? null : editingRecording}
          onSave={handleSaveRecording}
          onCancel={() => setEditingRecording(null)}
        />
      )}

      {/* Document editor modal */}
      {editingDocument && (
        <DocumentEditor
          document={editingDocument === 'new' ? null : editingDocument}
          onSave={handleSaveDocument}
          onCancel={() => setEditingDocument(null)}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div
          onClick={() => setDeleteConfirm(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: COLORS.cardDark,
            border: `2px solid ${COLORS.crimson}`,
            padding: 32, maxWidth: 400, width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24, letterSpacing: 3, color: COLORS.crimson,
              marginBottom: 16,
            }}>
              DELETE POST?
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, color: COLORS.ash, marginBottom: 24, lineHeight: 1.6,
            }}>
              "{deleteConfirm.title}" will be permanently removed.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleDelete(deleteConfirm.id)} style={{
                flex: 1, padding: '12px',
                background: COLORS.crimson + '20',
                border: `1px solid ${COLORS.crimson}`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2,
                color: COLORS.crimson, cursor: 'pointer',
              }}>
                DELETE
              </button>
              <button onClick={() => setDeleteConfirm(null)} style={{
                flex: 1, padding: '12px',
                background: 'transparent',
                border: `1px solid ${COLORS.ash}40`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2,
                color: COLORS.ash, cursor: 'pointer',
              }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete tape confirmation */}
      {deleteTapeConfirm && (
        <div
          onClick={() => setDeleteTapeConfirm(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: COLORS.cardDark,
            border: `2px solid ${COLORS.crimson}`,
            padding: 32, maxWidth: 400, width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 24, letterSpacing: 3, color: COLORS.crimson,
              marginBottom: 16,
            }}>
              DELETE TAPE?
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11, color: COLORS.ash, marginBottom: 24, lineHeight: 1.6,
            }}>
              "{deleteTapeConfirm.tape_id} — {deleteTapeConfirm.title}" will be permanently removed.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleDeleteTape(deleteTapeConfirm.id)} style={{
                flex: 1, padding: '12px',
                background: COLORS.crimson + '20',
                border: `1px solid ${COLORS.crimson}`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2,
                color: COLORS.crimson, cursor: 'pointer',
              }}>
                DELETE
              </button>
              <button onClick={() => setDeleteTapeConfirm(null)} style={{
                flex: 1, padding: '12px',
                background: 'transparent',
                border: `1px solid ${COLORS.ash}40`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2,
                color: COLORS.ash, cursor: 'pointer',
              }}>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete recording confirmation */}
      {deleteRecordingConfirm && (
        <div onClick={() => setDeleteRecordingConfirm(null)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: COLORS.cardDark, border: `2px solid ${COLORS.crimson}`,
            padding: 32, maxWidth: 400, width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 3, color: COLORS.crimson, marginBottom: 16 }}>
              DELETE RECORDING?
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, marginBottom: 24, lineHeight: 1.6 }}>
              "{deleteRecordingConfirm.recording_id} — {deleteRecordingConfirm.title}" will be permanently removed.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleDeleteRecording(deleteRecordingConfirm.id)} style={{
                flex: 1, padding: '12px', background: COLORS.crimson + '20',
                border: `1px solid ${COLORS.crimson}`, fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2, color: COLORS.crimson, cursor: 'pointer',
              }}>DELETE</button>
              <button onClick={() => setDeleteRecordingConfirm(null)} style={{
                flex: 1, padding: '12px', background: 'transparent',
                border: `1px solid ${COLORS.ash}40`, fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2, color: COLORS.ash, cursor: 'pointer',
              }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete document confirmation */}
      {deleteDocumentConfirm && (
        <div onClick={() => setDeleteDocumentConfirm(null)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: COLORS.cardDark, border: `2px solid ${COLORS.crimson}`,
            padding: 32, maxWidth: 400, width: '100%', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 3, color: COLORS.crimson, marginBottom: 16 }}>
              DELETE DOCUMENT?
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.ash, marginBottom: 24, lineHeight: 1.6 }}>
              "{deleteDocumentConfirm.document_id} — {deleteDocumentConfirm.title}" will be permanently removed.
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleDeleteDocument(deleteDocumentConfirm.id)} style={{
                flex: 1, padding: '12px', background: COLORS.crimson + '20',
                border: `1px solid ${COLORS.crimson}`, fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2, color: COLORS.crimson, cursor: 'pointer',
              }}>DELETE</button>
              <button onClick={() => setDeleteDocumentConfirm(null)} style={{
                flex: 1, padding: '12px', background: 'transparent',
                border: `1px solid ${COLORS.ash}40`, fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2, color: COLORS.ash, cursor: 'pointer',
              }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 32, flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 13,
              letterSpacing: 3, color: COLORS.crimson, marginBottom: 12,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ animation: 'pulse 1.5s infinite' }}>●</span> ADMIN DASHBOARD
            </div>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(36px, 6vw, 64px)',
              letterSpacing: 6, color: COLORS.bone, margin: 0,
              textShadow: `2px 2px 0 ${COLORS.crimson}40`,
            }}>
              CONTROL PANEL
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {activeTab === 'forum' && (
              <button
                onClick={() => setEditing('new')}
                style={{
                  padding: '12px 24px',
                  background: COLORS.flora + '15',
                  border: `1px solid ${COLORS.flora}`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, letterSpacing: 2,
                  color: COLORS.flora, textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.flora + '30';
                  e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.flora}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.flora + '15';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                + NEW POST
              </button>
            )}
            {activeTab === 'tapes' && (
              <button
                onClick={() => setEditingTape('new')}
                style={{
                  padding: '12px 24px',
                  background: COLORS.gold + '15',
                  border: `1px solid ${COLORS.gold}`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, letterSpacing: 2,
                  color: COLORS.gold, textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.gold + '30';
                  e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.gold}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.gold + '15';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                + NEW TAPE
              </button>
            )}
            {activeTab === 'recordings' && (
              <button
                onClick={() => setEditingRecording('new')}
                style={{
                  padding: '12px 24px',
                  background: COLORS.ember + '15',
                  border: `1px solid ${COLORS.ember}`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, letterSpacing: 2,
                  color: COLORS.ember, textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.ember + '30';
                  e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.ember}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.ember + '15';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                + NEW RECORDING
              </button>
            )}
            {activeTab === 'documents' && (
              <button
                onClick={() => setEditingDocument('new')}
                style={{
                  padding: '12px 24px',
                  background: COLORS.crimson + '15',
                  border: `1px solid ${COLORS.crimson}`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, letterSpacing: 2,
                  color: COLORS.crimson, textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.crimson + '30';
                  e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.crimson}20`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.crimson + '15';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                + NEW DOCUMENT
              </button>
            )}
            <button
              onClick={() => { adminLogout(); onLogout(); }}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                border: `1px solid ${COLORS.ash}40`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2,
                color: COLORS.ash, textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = COLORS.crimson;
                e.currentTarget.style.color = COLORS.crimson;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = COLORS.ash + '40';
                e.currentTarget.style.color = COLORS.ash;
              }}
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 0, marginBottom: 24,
          borderBottom: `1px solid ${COLORS.ash}20`,
          overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        }}>
          {[
            { id: 'forum', label: 'FORUM POSTS', count: posts.length, color: COLORS.flora },
            { id: 'tapes', label: 'TAPES', count: tapes.length, color: COLORS.gold },
            { id: 'recordings', label: 'RECORDINGS', count: recordings.length, color: COLORS.ember },
            { id: 'documents', label: 'DOCUMENTS', count: documents.length, color: COLORS.crimson },
            { id: 'events', label: 'GLOBAL EVENTS', count: currentEvent ? 1 : 0, color: COLORS.flora },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px clamp(10px, 2vw, 24px)',
                background: activeTab === tab.id ? COLORS.cardDark : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
                fontFamily: "'Space Mono', monospace",
                fontSize: 11, letterSpacing: 2,
                color: activeTab === tab.id ? tab.color : COLORS.ash,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 8,
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (activeTab !== tab.id) e.currentTarget.style.color = tab.color;
              }}
              onMouseLeave={e => {
                if (activeTab !== tab.id) e.currentTarget.style.color = COLORS.ash;
              }}
            >
              {tab.label}
              <span style={{
                background: (activeTab === tab.id ? tab.color : COLORS.ash) + '20',
                padding: '2px 8px', fontSize: 9,
                color: activeTab === tab.id ? tab.color : COLORS.ash,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{
            textAlign: 'center', padding: 60,
            fontFamily: "'Space Mono', monospace", fontSize: 13,
            color: COLORS.ash, letterSpacing: 2,
          }}>
            <div style={{ animation: 'pulse 1.5s infinite' }}>LOADING...</div>
          </div>
        )}

        {/* ═══════════ FORUM TAB ═══════════ */}
        {!loading && activeTab === 'forum' && (
          <>
            {/* Stats bar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: 16,
              marginBottom: 24,
            }}>
              {[
                { label: 'TOTAL POSTS', value: posts.length, color: COLORS.bone },
                { label: 'PUBLISHED', value: posts.filter(p => p.is_published).length, color: COLORS.flora },
                { label: 'DRAFTS', value: posts.filter(p => !p.is_published).length, color: COLORS.ash },
                { label: 'PINNED', value: posts.filter(p => p.is_pinned).length, color: COLORS.gold },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: COLORS.cardDark,
                  border: `1px solid ${COLORS.ash}20`,
                  padding: '16px 20px', textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 32, color: stat.color, letterSpacing: 2,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9, color: COLORS.ash, letterSpacing: 2,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Posts table */}
            <div style={{
              background: COLORS.cardDark,
              border: `1px solid ${COLORS.ash}20`,
              overflow: 'hidden',
            }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 600 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 200px',
                gap: 0, padding: '12px 20px',
                background: COLORS.bg,
                borderBottom: `1px solid ${COLORS.ash}20`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, letterSpacing: 2, color: COLORS.ash,
              }}>
                <span>TITLE</span>
                <span>CATEGORY</span>
                <span>STATUS</span>
                <span>DATE</span>
                <span style={{ textAlign: 'right' }}>ACTIONS</span>
              </div>

              {posts.length === 0 && (
                <div style={{
                  padding: 40, textAlign: 'center',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12, color: COLORS.ash,
                }}>
                  No posts yet. Click "+ NEW POST" to create one.
                </div>
              )}

              {posts.map(post => (
                <div
                  key={post.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 200px',
                    gap: 0, padding: '14px 20px',
                    borderBottom: `1px solid ${COLORS.ash}10`,
                    alignItems: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bgLight}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 12, color: COLORS.bone,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxWidth: 300,
                    }}>
                      {post.is_pinned && <span style={{ color: COLORS.gold }}>📌 </span>}
                      {post.title}
                    </div>
                    {post.image_url && (
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 9, color: COLORS.ash, marginTop: 2,
                      }}>
                        🖼 Has image
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, letterSpacing: 1,
                    color: post.category === 'render' ? COLORS.flora
                      : post.category === 'news' ? COLORS.crimson
                      : post.category === 'update' ? COLORS.gold
                      : COLORS.ember,
                    textTransform: 'uppercase',
                  }}>
                    {post.category}
                  </span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, letterSpacing: 1,
                    color: post.is_published ? COLORS.flora : COLORS.ash,
                  }}>
                    {post.is_published ? '● LIVE' : '○ DRAFT'}
                  </span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, color: COLORS.ash,
                  }}>
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditing(post)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`,
                      fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.bone,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.flora; e.currentTarget.style.color = COLORS.flora; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; e.currentTarget.style.color = COLORS.bone; }}
                    >EDIT</button>
                    <button onClick={() => togglePublish(post)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`,
                      fontFamily: "'Space Mono', monospace", fontSize: 9,
                      color: post.is_published ? COLORS.gold : COLORS.flora,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = e.currentTarget.style.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; }}
                    >{post.is_published ? 'HIDE' : 'SHOW'}</button>
                    <button onClick={() => togglePin(post)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`,
                      fontFamily: "'Space Mono', monospace", fontSize: 9,
                      color: post.is_pinned ? COLORS.gold : COLORS.ash,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.gold; e.currentTarget.style.color = COLORS.gold; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; e.currentTarget.style.color = post.is_pinned ? COLORS.gold : COLORS.ash; }}
                    >PIN</button>
                    <button onClick={() => setDeleteConfirm(post)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`,
                      fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.crimson; e.currentTarget.style.color = COLORS.crimson; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; e.currentTarget.style.color = COLORS.ash; }}
                    >DEL</button>
                  </div>
                </div>
              ))}
              </div>
            </div>
            </div>
          </>
        )}

        {/* ═══════════ TAPES TAB ═══════════ */}
        {!loading && activeTab === 'tapes' && (
          <>
            {/* Stats bar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: 16,
              marginBottom: 24,
            }}>
              {[
                { label: 'TOTAL TAPES', value: tapes.length, color: COLORS.bone },
                { label: 'VISIBLE', value: tapes.filter(t => t.is_visible).length, color: COLORS.flora },
                { label: 'HIDDEN', value: tapes.filter(t => !t.is_visible).length, color: COLORS.ash },
                { label: 'CORRUPT', value: tapes.filter(t => t.is_corrupt).length, color: COLORS.crimson },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: COLORS.cardDark,
                  border: `1px solid ${COLORS.ash}20`,
                  padding: '16px 20px', textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 32, color: stat.color, letterSpacing: 2,
                  }}>
                    {stat.value}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9, color: COLORS.ash, letterSpacing: 2,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Tapes table */}
            <div style={{
              background: COLORS.cardDark,
              border: `1px solid ${COLORS.ash}20`,
              overflow: 'hidden',
            }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 650 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 180px',
                gap: 0, padding: '12px 20px',
                background: COLORS.bg,
                borderBottom: `1px solid ${COLORS.ash}20`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, letterSpacing: 2, color: COLORS.ash,
              }}>
                <span>TAPE ID</span>
                <span>TITLE</span>
                <span>STATUS</span>
                <span>VISIBLE</span>
                <span>LENGTH</span>
                <span style={{ textAlign: 'right' }}>ACTIONS</span>
              </div>

              {tapes.length === 0 && (
                <div style={{
                  padding: 40, textAlign: 'center',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12, color: COLORS.ash,
                }}>
                  No tapes yet. Click "+ NEW TAPE" to create one.
                </div>
              )}

              {tapes.map(tape => (
                <div
                  key={tape.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 180px',
                    gap: 0, padding: '14px 20px',
                    borderBottom: `1px solid ${COLORS.ash}10`,
                    alignItems: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.bgLight}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Tape ID */}
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, color: COLORS.gold, letterSpacing: 1,
                  }}>
                    {tape.tape_id}
                  </span>

                  {/* Title */}
                  <div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 12, color: COLORS.bone,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      maxWidth: 250,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      {tape.is_corrupt && <Icons.AlertTriangle size={14} color={COLORS.crimson} style={{ minWidth: 14 }} />}
                      {tape.title}
                    </div>
                    {tape.date && (
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 9, color: COLORS.ash, marginTop: 2,
                      }}>
                        {tape.date}
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, letterSpacing: 1,
                    color: tape.status === 'CORRUPT' ? COLORS.crimson
                      : tape.status === 'SAFE' ? COLORS.flora
                      : tape.status === 'REDACTED' ? COLORS.ember
                      : COLORS.ash,
                  }}>
                    {tape.status}
                  </span>

                  {/* Visible */}
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, letterSpacing: 1,
                    color: tape.is_visible ? COLORS.flora : COLORS.ash,
                  }}>
                    {tape.is_visible ? '● YES' : '○ NO'}
                  </span>

                  {/* Length */}
                  <span style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, color: COLORS.ash,
                  }}>
                    {tape.length || '—'}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingTape(tape)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`,
                      fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.bone,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.gold; e.currentTarget.style.color = COLORS.gold; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; e.currentTarget.style.color = COLORS.bone; }}
                    >EDIT</button>
                    <button onClick={() => toggleTapeVisibility(tape)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`,
                      fontFamily: "'Space Mono', monospace", fontSize: 9,
                      color: tape.is_visible ? COLORS.ash : COLORS.flora,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = e.currentTarget.style.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; }}
                    >{tape.is_visible ? 'HIDE' : 'SHOW'}</button>
                    <button onClick={() => setDeleteTapeConfirm(tape)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`,
                      fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.crimson; e.currentTarget.style.color = COLORS.crimson; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; e.currentTarget.style.color = COLORS.ash; }}
                    >DEL</button>
                  </div>
                </div>
              ))}
              </div>
            </div>
            </div>
          </>
        )}

        {/* ═══════════ RECORDINGS TAB ═══════════ */}
        {!loading && activeTab === 'recordings' && (
          <>
            {/* Stats bar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: 16,
              marginBottom: 24,
            }}>
              {[
                { label: 'TOTAL RECORDINGS', value: recordings.length, color: COLORS.bone },
                { label: 'VISIBLE', value: recordings.filter(r => r.is_visible).length, color: COLORS.flora },
                { label: 'HIDDEN', value: recordings.filter(r => !r.is_visible).length, color: COLORS.ash },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: COLORS.cardDark,
                  border: `1px solid ${COLORS.ash}20`,
                  padding: '16px 20px', textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 32, color: stat.color, letterSpacing: 2,
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9, color: COLORS.ash, letterSpacing: 2,
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Recordings table */}
            <div style={{
              background: COLORS.cardDark,
              border: `1px solid ${COLORS.ash}20`,
              overflow: 'hidden',
            }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 600 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 150px',
                gap: 0, padding: '12px 20px',
                background: COLORS.bg,
                borderBottom: `1px solid ${COLORS.ash}20`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, letterSpacing: 2, color: COLORS.ash,
              }}>
                <span>REC ID</span>
                <span>TITLE</span>
                <span>STATUS</span>
                <span>VISIBLE</span>
                <span>DURATION</span>
                <span style={{ textAlign: 'right' }}>ACTIONS</span>
              </div>

              {recordings.length === 0 && (
                <div style={{
                  padding: 40, textAlign: 'center',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12, color: COLORS.ash,
                }}>
                  No recordings yet. Click "+ NEW RECORDING" to create one.
                </div>
              )}

              {recordings.map(rec => (
                <div key={rec.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 150px',
                  gap: 0, padding: '14px 20px',
                  borderBottom: `1px solid ${COLORS.ash}10`,
                  alignItems: 'center', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.bgLight}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ember, letterSpacing: 1 }}>
                    {rec.recording_id}
                  </span>
                  <div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: COLORS.bone,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }}>
                      {rec.audio_url && <span style={{ color: COLORS.ember }}>♪ </span>}
                      {rec.title}
                    </div>
                    {rec.date && (
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, marginTop: 2 }}>
                        {rec.date}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1,
                    color: rec.status === 'DECLASSIFIED' ? COLORS.flora
                      : rec.status === 'CORRUPTED' ? COLORS.crimson
                      : rec.status === 'INTERCEPTED' ? COLORS.ember
                      : COLORS.ash,
                  }}>{rec.status}</span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1,
                    color: rec.is_visible ? COLORS.flora : COLORS.ash,
                  }}>{rec.is_visible ? '● YES' : '○ NO'}</span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash }}>
                    {rec.duration || '—'}
                  </span>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingRecording(rec)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`, fontFamily: "'Space Mono', monospace",
                      fontSize: 9, color: COLORS.bone, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.ember; e.currentTarget.style.color = COLORS.ember; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; e.currentTarget.style.color = COLORS.bone; }}
                    >EDIT</button>
                    <button onClick={() => toggleRecordingVisibility(rec)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`, fontFamily: "'Space Mono', monospace",
                      fontSize: 9, color: rec.is_visible ? COLORS.ash : COLORS.flora,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = e.currentTarget.style.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; }}
                    >{rec.is_visible ? 'HIDE' : 'SHOW'}</button>
                    <button onClick={() => setDeleteRecordingConfirm(rec)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`, fontFamily: "'Space Mono', monospace",
                      fontSize: 9, color: COLORS.ash, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.crimson; e.currentTarget.style.color = COLORS.crimson; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; e.currentTarget.style.color = COLORS.ash; }}
                    >DEL</button>
                  </div>
                </div>
              ))}
              </div>
            </div>
            </div>
          </>
        )}

        {/* ═══════════ DOCUMENTS TAB ═══════════ */}
        {!loading && activeTab === 'documents' && (
          <>
            {/* Stats bar */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: 16,
              marginBottom: 24,
            }}>
              {[
                { label: 'TOTAL DOCUMENTS', value: documents.length, color: COLORS.bone },
                { label: 'VISIBLE', value: documents.filter(d => d.is_visible).length, color: COLORS.flora },
                { label: 'HIDDEN', value: documents.filter(d => !d.is_visible).length, color: COLORS.ash },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: COLORS.cardDark,
                  border: `1px solid ${COLORS.ash}20`,
                  padding: '16px 20px', textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 32, color: stat.color, letterSpacing: 2,
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9, color: COLORS.ash, letterSpacing: 2,
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Documents table */}
            <div style={{
              background: COLORS.cardDark,
              border: `1px solid ${COLORS.ash}20`,
              overflow: 'hidden',
            }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: 600 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 150px',
                gap: 0, padding: '12px 20px',
                background: COLORS.bg,
                borderBottom: `1px solid ${COLORS.ash}20`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, letterSpacing: 2, color: COLORS.ash,
              }}>
                <span>DOC ID</span>
                <span>TITLE</span>
                <span>TYPE</span>
                <span>STATUS</span>
                <span>VISIBLE</span>
                <span style={{ textAlign: 'right' }}>ACTIONS</span>
              </div>

              {documents.length === 0 && (
                <div style={{
                  padding: 40, textAlign: 'center',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12, color: COLORS.ash,
                }}>
                  No documents yet. Click "+ NEW DOCUMENT" to create one.
                </div>
              )}

              {documents.map(doc => (
                <div key={doc.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 150px',
                  gap: 0, padding: '14px 20px',
                  borderBottom: `1px solid ${COLORS.ash}10`,
                  alignItems: 'center', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.bgLight}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.crimson, letterSpacing: 1 }}>
                    {doc.document_id}
                  </span>
                  <div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: COLORS.bone,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 250 }}>
                      {doc.file_url && <span style={{ color: COLORS.crimson }}><Icons.Download size={12} />&nbsp;</span>}
                      {doc.title}
                    </div>
                    {doc.date && (
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: COLORS.ash, marginTop: 2 }}>
                        {doc.date}
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1,
                    color: COLORS.ash, textTransform: 'uppercase',
                  }}>{doc.doc_type}</span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1,
                    color: doc.status === 'DECLASSIFIED' ? COLORS.flora
                      : doc.status === 'REDACTED' ? COLORS.ember
                      : doc.status === 'DESTROYED' ? COLORS.crimson
                      : COLORS.ash,
                  }}>{doc.status}</span>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 1,
                    color: doc.is_visible ? COLORS.flora : COLORS.ash,
                  }}>{doc.is_visible ? '● YES' : '○ NO'}</span>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button onClick={() => setEditingDocument(doc)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`, fontFamily: "'Space Mono', monospace",
                      fontSize: 9, color: COLORS.bone, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.crimson; e.currentTarget.style.color = COLORS.crimson; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; e.currentTarget.style.color = COLORS.bone; }}
                    >EDIT</button>
                    <button onClick={() => toggleDocumentVisibility(doc)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`, fontFamily: "'Space Mono', monospace",
                      fontSize: 9, color: doc.is_visible ? COLORS.ash : COLORS.flora,
                      cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = e.currentTarget.style.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; }}
                    >{doc.is_visible ? 'HIDE' : 'SHOW'}</button>
                    <button onClick={() => setDeleteDocumentConfirm(doc)} style={{
                      padding: '6px 10px', background: 'transparent',
                      border: `1px solid ${COLORS.ash}30`, fontFamily: "'Space Mono', monospace",
                      fontSize: 9, color: COLORS.ash, cursor: 'pointer', transition: 'all 0.2s', letterSpacing: 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.crimson; e.currentTarget.style.color = COLORS.crimson; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.ash + '30'; e.currentTarget.style.color = COLORS.ash; }}
                    >DEL</button>
                  </div>
                </div>
              ))}
              </div>
            </div>
            </div>
          </>
        )}

        {/* ═══════════ GLOBAL EVENTS TAB ═══════════ */}
        {!loading && activeTab === 'events' && (
          <>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: 16,
              marginBottom: 24,
            }}>
              {[
                { label: 'ACTIVE EVENTS', value: currentEvent ? 1 : 0, color: COLORS.flora },
                { label: 'STATUS', value: currentEvent?.is_active ? 'LIVE' : 'IDLE', color: currentEvent?.is_active ? COLORS.flora : COLORS.ash },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: COLORS.cardDark,
                  border: `1px solid ${COLORS.ash}20`,
                  padding: '16px 20px', textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 32, color: stat.color, letterSpacing: 2,
                  }}>
                    {typeof stat.value === 'string' ? stat.value : stat.value}
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 9, color: COLORS.ash, letterSpacing: 2,
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Event Display */}
            {currentEvent && (
              <div style={{
                background: COLORS.cardDark,
                border: `1px solid ${COLORS.flora}40`,
                padding: '20px',
                marginBottom: 24,
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11, color: COLORS.flora, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase',
                }}>
                  ● ACTIVE EVENT
                </div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 24, color: COLORS.bone, letterSpacing: 2, marginBottom: 8,
                }}>
                  {currentEvent.title}
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11, color: COLORS.ash, lineHeight: 1.6, marginBottom: 16,
                }}>
                  {currentEvent.description}
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16,
                }}>
                  <div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9, color: COLORS.ash, letterSpacing: 1, marginBottom: 4,
                    }}>
                      STARTED
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11, color: COLORS.bone,
                    }}>
                      {new Date(currentEvent.started_at).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9, color: COLORS.ash, letterSpacing: 1, marginBottom: 4,
                    }}>
                      STATUS
                    </div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11, color: currentEvent.is_active ? COLORS.flora : COLORS.crimson,
                    }}>
                      {currentEvent.is_active ? '● ACTIVE' : '○ ENDED'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleStopEvent}
                  style={{
                    padding: '10px 20px',
                    background: COLORS.crimson + '15',
                    border: `1px solid ${COLORS.crimson}`,
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, letterSpacing: 2,
                    color: COLORS.crimson, textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.3s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = COLORS.crimson + '30';
                    e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.crimson}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = COLORS.crimson + '15';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><IconComponent icon={Icons.X} size={12} color={COLORS.crimson} />STOP EVENT</span>
                </button>
              </div>
            )}

            {/* Create Event Section */}
            <div style={{
              background: COLORS.cardDark,
              border: `1px solid ${COLORS.flora}40`,
              padding: '20px',
              marginBottom: 24,
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 11, color: COLORS.flora, letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase',
              }}>
                + NEW EVENT
              </div>
              <div style={{
                display: 'grid', gap: 12, marginBottom: 16,
              }}>
                <div>
                  <label style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, color: COLORS.ash, letterSpacing: 1, display: 'block', marginBottom: 6,
                  }}>
                    EVENT TITLE
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    placeholder="e.g., 'SIGNAL BREACH DETECTED'"
                    style={{
                      width: '100%', padding: '10px 12px',
                      background: COLORS.bg, border: `1px solid ${COLORS.ash}30`,
                      fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.bone,
                      transition: 'all 0.2s', boxSizing: 'border-box',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = COLORS.flora;
                      e.currentTarget.style.boxShadow = `0 0 10px ${COLORS.flora}20`;
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = COLORS.ash + '30';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 10, color: COLORS.ash, letterSpacing: 1, display: 'block', marginBottom: 6,
                  }}>
                    DESCRIPTION
                  </label>
                  <textarea
                    value={eventDescription}
                    onChange={e => setEventDescription(e.target.value)}
                    placeholder="Event details and puzzle hints..."
                    style={{
                      width: '100%', padding: '10px 12px', minHeight: 80,
                      background: COLORS.bg, border: `1px solid ${COLORS.ash}30`,
                      fontFamily: "'Space Mono', monospace", fontSize: 11, color: COLORS.bone,
                      transition: 'all 0.2s', boxSizing: 'border-box', resize: 'vertical',
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = COLORS.flora;
                      e.currentTarget.style.boxShadow = `0 0 10px ${COLORS.flora}20`;
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = COLORS.ash + '30';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              <button
                onClick={handleCreateEvent}
                disabled={creatingEvent || !eventTitle.trim()}
                style={{
                  padding: '10px 20px',
                  background: !eventTitle.trim() ? COLORS.ash + '15' : COLORS.flora + '15',
                  border: `1px solid ${!eventTitle.trim() ? COLORS.ash : COLORS.flora}`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, letterSpacing: 2,
                  color: !eventTitle.trim() ? COLORS.ash : COLORS.flora,
                  textTransform: 'uppercase',
                  cursor: !eventTitle.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  opacity: creatingEvent ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (eventTitle.trim()) {
                    e.currentTarget.style.background = COLORS.flora + '30';
                    e.currentTarget.style.boxShadow = `0 0 15px ${COLORS.flora}20`;
                  }
                }}
                onMouseLeave={e => {
                  if (eventTitle.trim()) {
                    e.currentTarget.style.background = COLORS.flora + '15';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {creatingEvent ? (<><IconComponent icon={Icons.Loader} size={14} /> CREATING...</>) : (<><IconComponent icon={Icons.Play} size={14} /> LAUNCH EVENT</>)}
              </button>
            </div>

            {/* Reset Events */}
            <button
              onClick={handleResetEvents}
              style={{
                padding: '12px 24px',
                background: COLORS.crimson + '10',
                border: `1px solid ${COLORS.crimson}50`,
                fontFamily: "'Space Mono', monospace",
                fontSize: 10, letterSpacing: 2,
                color: COLORS.crimson, textTransform: 'uppercase',
                cursor: 'pointer', transition: 'all 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = COLORS.crimson + '25';
                e.currentTarget.style.borderColor = COLORS.crimson;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = COLORS.crimson + '10';
                e.currentTarget.style.borderColor = COLORS.crimson + '50';
              }}
            >
              <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><IconComponent icon={Icons.AlertTriangle} size={14} color={COLORS.crimson} />RESET ALL EVENTS</span>
            </button>

            {/* Seed test data button */}
            <div style={{ marginTop: 40, paddingTop: 30, borderTop: `1px solid ${COLORS.ash}20` }}>
              <button
                onClick={handleSeedTestData}
                style={{
                  padding: '12px 24px',
                  background: COLORS.gold + '10',
                  border: `1px solid ${COLORS.gold}50`,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, letterSpacing: 2,
                  color: COLORS.gold, textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = COLORS.gold + '25';
                  e.currentTarget.style.borderColor = COLORS.gold;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = COLORS.gold + '10';
                  e.currentTarget.style.borderColor = COLORS.gold + '50';
                }}
              >
                <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><IconComponent icon={Icons.Loader} size={14} /> SEED TEST DATA (6-6-6)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN ADMIN PAGE — LOGIN GATE → DASHBOARD
// ═══════════════════════════════════════════════════════════════

export const AdminPage = () => {
  const [authenticated, setAuthenticated] = useState(isAdminLoggedIn());

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setAuthenticated(false)} />;
};

export default AdminPage;
