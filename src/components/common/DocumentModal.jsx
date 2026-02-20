import React from 'react';

// Shared document-styled popup used across pages
export default function DocumentModal({ isOpen, onClose, document }) {
  if (!isOpen || !document) return null;

  const formatContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();

      if (trimmedLine === '---') {
        return (
          <div key={index} style={{
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #222 50%, transparent)',
            margin: '40px 0',
            opacity: 0.3
          }} />
        );
      }

      if (line.includes('[ORDER OF CAVICUS')) {
        return (
          <div key={index} style={{
            margin: '40px 0',
            padding: '24px',
            border: '2px solid #7c1d1d',
            background: '#fff8f8',
            color: '#7c1d1d',
            fontStyle: 'italic',
            fontFamily: 'serif',
            boxShadow: '6px 6px 0px #7c1d1d15',
            fontSize: '19px',
            lineHeight: '1.6'
          }}>
            <span style={{ fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: 10, fontSize: '13px', letterSpacing: '2px', textDecoration: 'underline' }}>
              INTERNAL ANNOTATION:
            </span>
            {line.replace('---', '').replace(/\*\*/g, '')}
          </div>
        );
      }

      let html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/█+/g, '<span style="background:#111;color:#111;padding:0 3px;border-radius:2px;">████</span>');

      return (
        <p key={index} style={{
          marginBottom: trimmedLine === '' ? '24px' : '14px',
          lineHeight: '1.8',
          fontSize: '20px',
          color: '#1a1a1a',
          fontFamily: "'Crimson Text', serif",
          minHeight: trimmedLine === '' ? '1.2em' : 'auto'
        }} dangerouslySetInnerHTML={{ __html: html }} />
      );
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '120px 20px 60px',
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '900px',
          background: '#fefefe',
          color: '#111',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          padding: 'clamp(40px, 10vw, 100px)',
          borderRadius: '4px',
          borderBottom: '15px solid #c4b9a3',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06, backgroundImage: "url('https://www.transparenttextures.com/patterns/p6.png')" }} />

        <button onClick={onClose} style={{ position: 'absolute', top: 30, right: 30, color: '#bbb', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer', fontWeight: 800, letterSpacing: 3 }}>[ CLOSE_FILE ]</button>

        <header style={{ borderBottom: '3px solid #111', paddingBottom: 30, marginBottom: 50 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ background: '#111', color: '#fff', padding: '6px 16px', fontSize: 12, fontWeight: 800, letterSpacing: 4 }}>
              {document.status?.toUpperCase() || 'CLASSIFIED'} — CLEARANCE LEVEL 5
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#888', fontWeight: 800, fontFamily: 'monospace' }}>
              SOURCE: 104.7 MHz <br />
              ARCHIVE_ID: {document.document_id}
            </div>
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, textTransform: 'uppercase', fontFamily: 'serif', fontStyle: 'italic', margin: '0 0 10px 0', lineHeight: 1.1 }}>
            {document.title}
          </h1>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#7c1d1d', letterSpacing: '-0.5px' }}>
            {document.subtitle}
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30, marginBottom: 50, fontSize: 14, borderBottom: '1px solid #ddd', paddingBottom: 20, fontFamily: 'monospace' }}>
          <div>
            <span style={{ fontWeight: 800, textTransform: 'uppercase', color: '#999', display: 'block', fontSize: 10, marginBottom: 4 }}>Author:</span>
            <span style={{ textTransform: 'uppercase', color: '#333' }}>{document.author || ''}</span>
          </div>
          <div>
            <span style={{ fontWeight: 800, textTransform: 'uppercase', color: '#999', display: 'block', fontSize: 10, marginBottom: 4 }}>Date of Record:</span>
            <span style={{ textTransform: 'uppercase', color: '#333' }}>{document.date || ''}</span>
          </div>
        </div>

        <article style={{ textAlign: 'left', wordWrap: 'break-word' }}>
          {formatContent(document.content)}
        </article>

        <div style={{ marginTop: 80, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            border: '5px double rgba(124, 29, 29, 0.2)',
            color: 'rgba(124, 29, 29, 0.2)',
            fontWeight: 900,
            padding: '10px 40px',
            fontSize: 36,
            textTransform: 'uppercase',
            transform: 'rotate(-12deg)',
            userSelect: 'none',
            letterSpacing: '8px'
          }}>
            {document.status}
          </div>
        </div>
      </div>
    </div>
  );
}
