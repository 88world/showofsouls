import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../utils/constants';
import { getForumPosts } from '../lib/supabase';

// ═══════════════════════════════════════════════════════════════
// FORUM PAGE — RENDERS & NEWS BENTO GRID
// Public-facing page for viewing posts
// ═══════════════════════════════════════════════════════════════

const LocalCRTOverlay = () => (
  <>
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, opacity: 0.3,
      background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)`,
      mixBlendMode: "overlay",
    }} />
  </>
);

// Category badge colors
const CATEGORY_STYLES = {
  render: { bg: COLORS.flora + '20', border: COLORS.flora, color: COLORS.flora, label: 'RENDER' },
  news: { bg: COLORS.crimson + '20', border: COLORS.crimson, color: COLORS.crimson, label: 'NEWS' },
  update: { bg: COLORS.gold + '20', border: COLORS.gold, color: COLORS.gold, label: 'UPDATE' },
  devlog: { bg: COLORS.ember + '20', border: COLORS.ember, color: COLORS.ember, label: 'DEVLOG' },
};

const PostCard = ({ post, index, isHovered, onHover, onLeave }) => {
  const cat = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.news;
  const hasImage = !!post.image_url;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={() => setExpanded(!expanded)}
      style={{
        position: "relative", overflow: "hidden", cursor: "pointer",
        background: hasImage ? "#000" : COLORS.cardDark,
        border: `2px solid ${isHovered ? cat.border : COLORS.ash}40`,
        transition: "all 0.3s ease",
        minHeight: hasImage ? undefined : 180,
        display: "flex", flexDirection: "column",
        height: "100%",
      }}
    >
      <LocalCRTOverlay />

      {/* Background Image */}
      {hasImage && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url('${post.image_url}')`,
          backgroundSize: "cover", backgroundPosition: "center",
          filter: `grayscale(60%) contrast(110%) brightness(${isHovered ? 0.4 : 0.25})`,
          transition: "all 0.4s ease",
          transform: isHovered ? "scale(1.03)" : "scale(1)",
          zIndex: 1,
        }} />
      )}

      {/* Pinned badge */}
      {post.is_pinned && (
        <div style={{
          position: "absolute", top: 0, left: 0, zIndex: 10,
          background: COLORS.crimson, padding: "4px 10px",
          fontFamily: "'Space Mono', monospace", fontSize: 9,
          letterSpacing: 2, color: COLORS.bone, fontWeight: "bold",
        }}>
          📌 PINNED
        </div>
      )}

      {/* Category tag */}
      <div style={{
        position: "absolute", top: 0, right: 0, zIndex: 10,
        background: cat.bg, border: `1px solid ${cat.border}`,
        padding: "4px 10px",
        fontFamily: "'Space Mono', monospace", fontSize: 9,
        letterSpacing: 2, color: cat.color, fontWeight: "bold",
      }}>
        {cat.label}
      </div>

      {/* Content */}
      <div style={{
        position: hasImage ? "absolute" : "relative",
        bottom: 0, left: 0, right: 0,
        padding: "20px",
        zIndex: 5,
        background: hasImage ? "linear-gradient(to top, #000 0%, #000000cc 60%, transparent 100%)" : "transparent",
        flex: hasImage ? undefined : 1,
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
      }}>
        <h3 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: post.span_class?.includes('col-span-2') ? 28 : 20,
          letterSpacing: 2,
          color: isHovered ? cat.color : COLORS.bone,
          margin: "0 0 8px 0",
          transition: "color 0.3s",
          lineHeight: 1.1,
        }}>
          {post.title}
        </h3>

        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 11,
          color: COLORS.bone,
          opacity: 0.7,
          margin: "0 0 8px 0",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: expanded ? 20 : 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {post.content}
        </p>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: `1px solid ${COLORS.ash}30`, paddingTop: 8, marginTop: 4,
        }}>
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            color: COLORS.ash, letterSpacing: 1,
          }}>
            {post.author}
          </span>
          <span style={{
            fontFamily: "'Space Mono', monospace", fontSize: 9,
            color: COLORS.ash, letterSpacing: 1,
          }}>
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

// Lightbox for full post view
const PostLightbox = ({ post, onClose }) => {
  if (!post) return null;
  const cat = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.news;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.3s ease",
        padding: 40, overflow: "auto",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: COLORS.cardDark,
          border: `2px solid ${cat.border}`,
          maxWidth: 800, width: "100%",
          maxHeight: "90vh", overflow: "auto",
          animation: "scaleIn 0.3s ease",
          position: "relative",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            background: "transparent", border: "none",
            color: COLORS.ash, fontSize: 24, cursor: "pointer",
            lineHeight: 1,
          }}
          onMouseEnter={e => e.target.style.color = COLORS.crimson}
          onMouseLeave={e => e.target.style.color = COLORS.ash}
        >
          ×
        </button>

        {/* Image */}
        {post.image_url && (
          <div style={{
            width: "100%", height: 400,
            backgroundImage: `url('${post.image_url}')`,
            backgroundSize: "cover", backgroundPosition: "center",
            filter: "grayscale(40%) contrast(110%)",
          }} />
        )}

        {/* Content */}
        <div style={{ padding: 32 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginBottom: 16,
          }}>
            <span style={{
              background: cat.bg, border: `1px solid ${cat.border}`,
              padding: "4px 10px",
              fontFamily: "'Space Mono', monospace", fontSize: 9,
              letterSpacing: 2, color: cat.color, fontWeight: "bold",
            }}>
              {cat.label}
            </span>
            {post.is_pinned && (
              <span style={{
                background: COLORS.crimson + '20', border: `1px solid ${COLORS.crimson}`,
                padding: "4px 10px",
                fontFamily: "'Space Mono', monospace", fontSize: 9,
                letterSpacing: 2, color: COLORS.crimson, fontWeight: "bold",
              }}>
                📌 PINNED
              </span>
            )}
          </div>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 36, letterSpacing: 3,
            color: COLORS.bone, margin: "0 0 16px 0",
          }}>
            {post.title}
          </h2>

          <div style={{
            display: "flex", gap: 16, marginBottom: 24,
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            color: COLORS.ash, letterSpacing: 1,
          }}>
            <span>BY {post.author}</span>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
          </div>

          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12, lineHeight: 1.8,
            color: COLORS.bone, opacity: 0.85,
            whiteSpace: "pre-wrap",
          }}>
            {post.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ForumPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filter, setFilter] = useState('all');
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    loadPosts();
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const data = await getForumPosts();
    setPosts(data);
    setLoading(false);
  };

  const filteredPosts = filter === 'all'
    ? posts
    : posts.filter(p => p.category === filter);

  const categories = ['all', 'render', 'news', 'update', 'devlog'];

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.bone,
      padding: 'clamp(80px, 12vw, 120px) clamp(12px, 4vw, 40px) clamp(30px, 5vw, 60px)',
    }}>
      {selectedPost && <PostLightbox post={selectedPost} onClose={() => setSelectedPost(null)} />}

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          marginBottom: 48,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease",
        }}>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: 13,
            letterSpacing: 3, color: COLORS.crimson, marginBottom: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ animation: "blink 1s infinite" }}>█</span> TRANSMISSION FEED
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(48px, 8vw, 80px)',
            letterSpacing: 8,
            color: COLORS.bone,
            margin: "0 0 16px 0",
            textShadow: `2px 2px 0 ${COLORS.crimson}40`,
          }}>
            FORUM
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 13, color: COLORS.ash,
            letterSpacing: 1, maxWidth: 600,
            lineHeight: 1.8,
            borderLeft: `2px solid ${COLORS.crimson}`,
            paddingLeft: 16,
          }}>
            Renders, news, devlogs, and park updates. Everything you need to know about the Show of Souls.
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{
          display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.8s ease 0.2s",
        }}>
          {categories.map(cat => {
            const isActive = filter === cat;
            const style = cat === 'all' ? { color: COLORS.bone, border: COLORS.bone } : (CATEGORY_STYLES[cat] || {});
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10, letterSpacing: 2,
                  padding: "8px 16px",
                  background: isActive ? (style.color || COLORS.bone) + '20' : 'transparent',
                  border: `1px solid ${isActive ? (style.border || COLORS.bone) : COLORS.ash}40`,
                  color: isActive ? (style.color || COLORS.bone) : COLORS.ash,
                  cursor: "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = (style.border || COLORS.bone);
                    e.currentTarget.style.color = (style.color || COLORS.bone);
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = COLORS.ash + '40';
                    e.currentTarget.style.color = COLORS.ash;
                  }
                }}
              >
                {cat === 'all' ? '░ ALL' : `░ ${cat.toUpperCase()}`}
              </button>
            );
          })}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{
            textAlign: "center", padding: 60,
            fontFamily: "'Space Mono', monospace", fontSize: 13,
            color: COLORS.ash, letterSpacing: 2,
          }}>
            <div style={{ animation: "pulse 1.5s infinite" }}>LOADING TRANSMISSIONS...</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredPosts.length === 0 && (
          <div style={{
            textAlign: "center", padding: 80,
            border: `1px dashed ${COLORS.ash}40`,
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif", fontSize: 28,
              letterSpacing: 3, color: COLORS.ash, marginBottom: 12,
            }}>
              NO TRANSMISSIONS FOUND
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace", fontSize: 11,
              color: COLORS.ash, opacity: 0.6, letterSpacing: 1,
            }}>
              {filter !== 'all' ? 'Try a different filter.' : 'Posts will appear here once published.'}
            </div>
          </div>
        )}

        {/* Bento Grid */}
        {!loading && filteredPosts.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
              gridAutoRows: "220px",
              gap: 16,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s ease 0.4s",
            }}
          >
            {filteredPosts.map((post, i) => (
              <div key={post.id} className={post.span_class || 'col-span-1 row-span-1'}
                onClick={() => setSelectedPost(post)}
              >
                <PostCard
                  post={post}
                  index={i}
                  isHovered={hoveredIndex === i}
                  onHover={() => setHoveredIndex(i)}
                  onLeave={() => setHoveredIndex(null)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Post count */}
        {!loading && filteredPosts.length > 0 && (
          <div style={{
            marginTop: 32, textAlign: "center",
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            color: COLORS.ash, letterSpacing: 2,
          }}>
            SHOWING {filteredPosts.length} OF {posts.length} TRANSMISSIONS
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPage;
