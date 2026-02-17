import { COLORS } from '../../utils/constants';

// ═══════════════════════════════════════════════════════════════
// GLOBAL FOOTER COMPONENT
// Minimal, professional footer for the SHOW OF SOULS network
// ═══════════════════════════════════════════════════════════════

export const Footer = () => {
  const internalLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/incident' },
    { name: 'Media', path: '/media' },
    { name: 'Archive', path: '/tapes' }
  ];

  return (
    <footer style={{
      background: COLORS.bg,
      borderTop: `2px solid ${COLORS.crimson}`,
      padding: 'clamp(30px, 6vw, 60px) clamp(16px, 4vw, 40px) clamp(20px, 4vw, 40px)',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        
        {/* TOP ROW: BRANDING */}
        <div style={{
          marginBottom: 60,
        }}>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 48,
              letterSpacing: 8,
              color: COLORS.bone,
              lineHeight: 1,
              textShadow: `2px 2px 0 ${COLORS.crimson}`,
            }}>
              SOS
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 13,
              color: COLORS.bone,
              opacity: 0.6,
              letterSpacing: 4,
              marginTop: 8,
            }}>
              SHOW OF SOULS
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: GLOBAL WARNING & LINKS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
          gap: 'clamp(24px, 4vw, 60px)',
          paddingBottom: 40,
          borderBottom: `1px solid ${COLORS.ash}`,
          marginBottom: 40,
        }}>
          {/* Global In-Universe Warning */}
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            color: COLORS.bone,
            opacity: 0.85,
            lineHeight: 1.8,
            letterSpacing: 1,
          }}>
            <div style={{ color: COLORS.crimson, fontWeight: 'bold', marginBottom: 8, letterSpacing: 2, opacity: 1 }}>
              [ CLASSIFIED WARNING ]
            </div>
            The materials contained within this network are strictly confidential. Unauthorized distribution, replication, or prolonged exposure to embedded frequencies poses severe psychological risk. Proceed with extreme caution.
          </div>

          {/* Site Map & External Links */}
          <div style={{ 
            display: 'flex', 
            gap: 'clamp(24px, 4vw, 60px)',
            flexWrap: 'wrap',
            fontFamily: "'Space Mono', monospace", 
            fontSize: 14, 
            letterSpacing: 1 
          }}>
            {/* Internal Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: COLORS.bone, marginBottom: 4, fontWeight: 'bold' }}>SYSTEM MAP</div>
              {internalLinks.map((link) => (
                <a key={link.name} href={link.path} style={{ color: COLORS.bone, opacity: 0.6, textDecoration: 'none', transition: 'all 0.2s' }} 
                   onMouseOver={e => { e.target.style.color = COLORS.signal; e.target.style.opacity = 1; }} 
                   onMouseOut={e => { e.target.style.color = COLORS.bone; e.target.style.opacity = 0.6; }}>
                  {link.name}
                </a>
              ))}
            </div>
            
            {/* External Social Links with Icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ color: COLORS.bone, marginBottom: 4, fontWeight: 'bold' }}>EXTERNAL</div>
              
              {/* Steam Link */}
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.bone, opacity: 0.6, textDecoration: 'none', transition: 'all 0.2s' }} 
                 onMouseOver={e => { e.currentTarget.style.color = COLORS.crimson; e.currentTarget.style.opacity = 1; }} 
                 onMouseOut={e => { e.currentTarget.style.color = COLORS.bone; e.currentTarget.style.opacity = 0.6; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.979 0C5.362 0 .001 5.365.001 11.983c0 .121.006.24.01.359L3.434 11a3.027 3.027 0 0 1-.035-.459c0-1.686 1.365-3.053 3.048-3.053 1.684 0 3.051 1.367 3.051 3.053 0 .341-.059.664-.158.966l3.308 1.373c.422-.24 1.154-.422 1.619-.422 1.956 0 3.543 1.589 3.543 3.545 0 1.956-1.587 3.544-3.543 3.544-1.954 0-3.541-1.588-3.541-3.544 0-.173.02-.339.043-.505L7.202 14.18c-.407.472-1.002.775-1.666.775-1.229 0-2.228-.999-2.228-2.23 0-.172.028-.335.071-.491L.484 15.688A11.97 11.97 0 0 0 11.979 24c6.618 0 11.98-5.364 11.98-11.982C23.96 5.365 18.597 0 11.979 0zM6.449 11.532c-.841 0-1.523.684-1.523 1.524 0 .843.682 1.524 1.523 1.524.842 0 1.525-.681 1.525-1.524 0-.84-.683-1.524-1.525-1.524zm9.362 3.421c0 .927-.753 1.679-1.68 1.679s-1.679-.752-1.679-1.679c0-.926.752-1.678 1.679-1.678s1.68.752 1.68 1.678zm-1.68-1.233c-.682 0-1.233.551-1.233 1.233 0 .681.551 1.232 1.233 1.232.68 0 1.23-.551 1.23-1.232 0-.682-.55-1.233-1.23-1.233z"/>
                </svg>
                Steam
              </a>

              {/* Discord Link */}
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.bone, opacity: 0.6, textDecoration: 'none', transition: 'all 0.2s' }} 
                 onMouseOver={e => { e.currentTarget.style.color = COLORS.crimson; e.currentTarget.style.opacity = 1; }} 
                 onMouseOut={e => { e.currentTarget.style.color = COLORS.bone; e.currentTarget.style.opacity = 0.6; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                </svg>
                Discord
              </a>

              {/* X (Twitter) Link */}
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.bone, opacity: 0.6, textDecoration: 'none', transition: 'all 0.2s' }} 
                 onMouseOver={e => { e.currentTarget.style.color = COLORS.crimson; e.currentTarget.style.opacity = 1; }} 
                 onMouseOut={e => { e.currentTarget.style.color = COLORS.bone; e.currentTarget.style.opacity = 0.6; }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: COPYRIGHT */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: "'Space Mono', monospace",
          fontSize: 12,
          letterSpacing: 2,
          color: COLORS.bone,
          opacity: 0.5,
        }}>
          <div>SHOW OF SOULS © 2026</div>
        </div>
        
      </div>
    </footer>
  );
};