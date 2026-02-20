import { useState, useMemo } from 'react';
import { COLORS } from '../../../../utils/constants';
import { Icons, IconComponent } from '../../../../components/common/Icons';

// Quantum Cipher — multi-layer symbol cipher with progressive hints

function getOrCreateSolution() {
  const stored = localStorage.getItem('sos_puzzle_quantum');
  if (stored && /^[A-Z]{6}$/.test(stored)) return stored;
  const words = ['FLORAE','SHADOW','CRYPTS','RELICS','THORNS','BLOODR','HAUNTS'];
  const pick = words[Math.floor(Math.random() * words.length)];
  localStorage.setItem('sos_puzzle_quantum', pick);
  return pick;
}

export const QuantumCipher = ({ isOpen, onClose, onSuccess }) => {
  const solution = useMemo(() => getOrCreateSolution(), []);
  const [input, setInput] = useState('');
  const [hints, setHints] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const caesar = (s, shift) => s.split('').map(c => String.fromCharCode((c.charCodeAt(0)-65+shift)%26 + 65)).join('');
  const hintA = caesar(solution, 3);
  const hintB = solution.split('').reverse().join('');
  const hintC = solution.split('').map(c => c.charCodeAt(0)).join(' ');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.toUpperCase() === solution) {
      setSuccess(true);
      setError('');
      setTimeout(() => { onSuccess?.(); onClose?.(); }, 800);
    } else {
      setError('INVALID DECRYPTION');
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 560, maxWidth: '94%', background: COLORS.cardDark, border: `2px solid ${COLORS.crimson}`, padding: 28, borderRadius: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: COLORS.bone }}>QUANTUM CIPHER</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: COLORS.ash, fontSize: 18, cursor: 'pointer' }}><IconComponent icon={Icons.X} size={18} color={COLORS.ash} /></button>
        </div>

        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: COLORS.ash, marginBottom: 12 }}>Multiple encoded clues overlay the real key—reconcile them to decode the access phrase.</div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, background: '#0b0b0b', padding: 10, borderRadius: 4, border: `1px solid ${COLORS.ash}20` }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, marginBottom: 6 }}>HINT STREAM A</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: COLORS.crimson }}>{hints >= 1 ? hintA : '••••••'}</div>
          </div>
          <div style={{ flex: 1, background: '#0b0b0b', padding: 10, borderRadius: 4, border: `1px solid ${COLORS.ash}20` }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, marginBottom: 6 }}>HINT STREAM B</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: COLORS.flora }}>{hints >= 2 ? hintB : '••••••'}</div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: COLORS.ash, marginBottom: 6 }}>HINT STREAM C</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: COLORS.ash }}>{hints >= 3 ? hintC : '•••••• •••••• •••••'}</div>
        </div>

        {error && <div style={{ color: COLORS.crimson, fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: COLORS.flora, fontFamily: "'Space Mono', monospace", marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}><IconComponent icon={Icons.CheckCircle2} size={14} color={COLORS.flora} />CIPHER RESOLVED</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0,6))} placeholder="ENTER 6 LETTER KEY" style={{ flex: 1, padding: 12, background: '#070707', border: `1px solid ${COLORS.ash}20`, color: COLORS.bone, fontFamily: "'Space Mono', monospace", letterSpacing: 4, fontSize: 16 }} />
          <button type="submit" style={{ padding: '12px 14px', background: COLORS.crimson + '15', border: `1px solid ${COLORS.crimson}`, color: COLORS.crimson, cursor: 'pointer' }}>DECODE</button>
        </form>

        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button onClick={() => setHints(h => Math.min(3, h + 1))} style={{ padding: 8, background: 'transparent', border: `1px solid ${COLORS.ash}30`, color: COLORS.ash, cursor: 'pointer' }}>{hints < 3 ? 'REVEAL HINT' : 'HINTS MAXED'}</button>
          <button onClick={() => { setInput(''); setError(''); }} style={{ padding: 8, background: 'transparent', border: `1px solid ${COLORS.ash}30`, color: COLORS.ash, cursor: 'pointer' }}>RESET</button>
        </div>
      </div>
    </div>
  );
};

export default QuantumCipher;
