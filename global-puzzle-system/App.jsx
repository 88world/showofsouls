import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Nav } from './components/layout/Nav';
import { Footer } from './components/layout/Footer';
import { VHSOverlay } from './components/common/VHSOverlay';
import { ProgressionProvider } from './features/progression/ProgressionProvider';
import { GlobalEventProvider } from './features/events/GlobalEventProvider';
import CompletionPopup from './features/events/components/CompletionPopup';
import TapeUnlockNotification from './components/notifications/TapeUnlockNotification';
import { COLORS } from './utils/constants';

// Pages
import HomePage from './pages/HomePage';
import { IncidentPage } from './pages/IncidentPage';
import { CharactersPage } from './pages/CharactersPage';
import { TapesPage } from './pages/TapesPage';
import { MediaPage } from './pages/MediaPage';

// ═══════════════════════════════════════════════════════════════
// MAIN APP - ROUTING WRAPPER
// Phase 1: Foundation refactor complete
// Phase 2: Puzzle framework complete
// Phase 3: Global events & Supabase integration
// ═══════════════════════════════════════════════════════════════

export default function App() {
  return (
    <Router>
      <ProgressionProvider>
        <GlobalEventProvider>
          <div style={{ 
            background: COLORS.bg, 
            color: COLORS.bone, 
            minHeight: "100vh" 
          }}>
            {/* Global Fonts */}
            <link 
              href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Crimson+Text:ital@0;1&display=swap" 
              rel="stylesheet" 
            />

        {/* Global Styles */}
        <style>{`
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          html { 
            scroll-behavior: smooth; 
          }
          
          body { 
            overflow-x: hidden; 
          }

          @keyframes morseBlink {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.8); }
          }
          
          @keyframes tickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); }
          }
          
          @keyframes particleFloat {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 0.6; }
            50% { transform: translateY(-120px) translateX(40px); opacity: 0.8; }
            90% { opacity: 0.2; }
          }
          
          @keyframes gridShift {
            0% { transform: translate(0, 0); }
            100% { transform: translate(40px, 40px); }
          }
          
          @keyframes orbPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.15); opacity: 1; }
          }
          
          @keyframes cursorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          
          @keyframes floraBlob {
            0%, 100% { transform: scale(1) translate(0, 0); }
            33% { transform: scale(1.2) translate(10px, -10px); }
            66% { transform: scale(0.9) translate(-5px, 5px); }
          }
          
          @keyframes scanline {
            0% { transform: translateY(0); }
            100% { transform: translateY(10px); }
          }
          
          @keyframes flicker {
            0% { opacity: 0.27861; }
            5% { opacity: 0.34769; }
            10% { opacity: 0.23604; }
            15% { opacity: 0.90626; }
            20% { opacity: 0.18128; }
            25% { opacity: 0.83891; }
            30% { opacity: 0.65583; }
            35% { opacity: 0.67807; }
            40% { opacity: 0.26559; }
            45% { opacity: 0.84693; }
            50% { opacity: 0.96019; }
            55% { opacity: 0.08594; }
            60% { opacity: 0.20313; }
            65% { opacity: 0.71988; }
            70% { opacity: 0.53455; }
            75% { opacity: 0.37288; }
            80% { opacity: 0.71428; }
            85% { opacity: 0.70419; }
            90% { opacity: 0.7003; }
            95% { opacity: 0.36108; }
            100% { opacity: 0.24387; }
          }
          
          @keyframes redPulse {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
          }
          
          @keyframes glitchSlide {
            0% { transform: translateX(0); }
            33% { transform: translateX(10px); }
            66% { transform: translateX(-10px); }
            100% { transform: translateX(0); }
          }
          
          @keyframes grain1 {
            0% { background-position: 0% 0%; }
            33% { background-position: 47% 23%; }
            66% { background-position: 12% 89%; }
            100% { background-position: 0% 0%; }
          }
          
          @keyframes grain2 {
            0% { background-position: 0% 0%; }
            25% { background-position: 67% 41%; }
            50% { background-position: 21% 73%; }
            75% { background-position: 84% 15%; }
            100% { background-position: 0% 0%; }
          }
          
          @keyframes trackingSlide {
            0% { transform: translateY(0); opacity: 0.8; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          
          @keyframes colorBleed {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }
          
          @keyframes tapeNoise {
            0% { transform: translateY(0); }
            100% { transform: translateY(400px); }
          }
          
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          
          @keyframes scaleIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }

          ::-webkit-scrollbar { 
            width: 6px; 
          }
          
          ::-webkit-scrollbar-track { 
            background: ${COLORS.bg}; 
          }
          
          ::-webkit-scrollbar-thumb { 
            background: ${COLORS.ash}; 
            border-radius: 3px; 
          }
          
          ::-webkit-scrollbar-thumb:hover { 
            background: ${COLORS.crimson}40; 
          }

          ::selection {
            background: ${COLORS.crimson}40;
            color: ${COLORS.bone};
          }

          @media (max-width: 900px) {
            nav > div > div:last-child > a { 
              display: none !important; 
            }
            
            .bento-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              grid-template-rows: auto !important;
            }
            
            .col-span-2, .col-span-3 { 
              grid-column: span 2 / span 2; 
            }
          }

          /* Mosaic Grid Spans */
          .col-span-1 { grid-column: span 1 / span 1; }
          .col-span-2 { grid-column: span 2 / span 2; }
          .col-span-3 { grid-column: span 3 / span 3; }
          .row-span-1 { grid-row: span 1 / span 1; }
          .row-span-2 { grid-row: span 2 / span 2; }
        `}</style>

        {/* VHS Effects Overlay */}
        <VHSOverlay />

        {/* Navigation */}
        <Nav />

        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/incident" element={<IncidentPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/tapes" element={<TapesPage />} />
          <Route path="/media" element={<MediaPage />} />
        </Routes>

        {/* Footer */}
        <Footer />

        {/* Global Notifications */}
        <CompletionPopup />
        <TapeUnlockNotification />
        </div>
        </GlobalEventProvider>
      </ProgressionProvider>
    </Router>
  );
}
