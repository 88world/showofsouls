import { useState } from 'react';
import { COLORS } from '../utils/constants';
import { PasswordTerminal } from '../features/puzzles/types/PasswordTerminal/PasswordTerminal';
import GlitchTextWord from '../components/common/GlitchTextWord';
import { useGlobalEvent } from '../features/events/GlobalEventProvider';

const LocalCRTOverlay = () => (
  <>
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, opacity: 0.4,
      background: `repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)`,
      mixBlendMode: "overlay",
    }} />
    <div style={{
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3, opacity: 0.2,
      background: `radial-gradient(circle at center, transparent 50%, ${COLORS.bg} 100%), linear-gradient(to bottom, transparent, ${COLORS.crimson}10)`,
      mixBlendMode: "multiply",
    }} />
  </>
);

export function CharactersPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { currentEvent } = useGlobalEvent();

  const handleActivatePuzzle = (puzzleId) => {
    if (puzzleId === 'passwordTerminal') {
      setShowPassword(true);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {showPassword && <PasswordTerminal onClose={() => setShowPassword(false)} />}

      {/* Intro Section */}
      <section style={{
        padding: '60px 40px',
        position: 'relative',
        borderBottom: `1px solid ${COLORS.ash}40`,
      }}>
        <LocalCRTOverlay />

        <h1 style={{
          fontSize: '48px',
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: '4px',
          color: COLORS.bone,
          margin: '0 0 20px 0',
          textTransform: 'uppercase',
        }}>CHARACTERS</h1>

        <p style={{
          fontSize: '12px',
          fontFamily: "'Space Mono', monospace",
          letterSpacing: '2px',
          color: COLORS.flora,
          margin: '0 0 40px 0',
          textTransform: 'uppercase',
        }}>PERSONNEL & ENTITY DOSSIERS — FLORA'S WONDERLAND</p>

        <div style={{
          fontSize: '16px',
          fontFamily: "'Crimson Text', serif",
          lineHeight: '1.8',
          color: COLORS.bone,
          maxWidth: '800px',
        }}>
          <p>
            There is a theory — and within the Order it is more than theory —<br />
            that the Soulbound were not always what they are now.
          </p>
          <p style={{ marginTop: '20px' }}>
            That before the vessels, there were people.<br />
            That those people were not taken.<br />
            They were chosen.
          </p>
          <p style={{ marginTop: '20px' }}>
            Selected by the Ringleader himself — Dr. Joseph M. Cavicus —<br />
            for a purpose none of them fully understood<br />
            until it was already complete.
          </p>
          <p style={{ marginTop: '20px' }}>
            They did not die.<br />
            They were transformed. Elevated. Bound to something permanent<br />
            in a world where nothing is.
          </p>
          <p style={{ marginTop: '20px' }}>
            We do not pity them.<br />
            We revere them.
          </p>
        </div>
      </section>

      {/* Dr. Cavicus Feature Block */}
      <section style={{
        padding: '80px 40px',
        position: 'relative',
        background: `linear-gradient(180deg, ${COLORS.crimson}10 0%, rgba(0,0,0,0) 100%)`,
      }}>
        <LocalCRTOverlay />

        <h2 style={{
          fontSize: '56px',
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: '4px',
          color: COLORS.crimson,
          margin: '0 0 10px 0',
          textTransform: 'uppercase',
        }}>
          DR. JOSEPH M. CAVICUS
        </h2>

        <h3 style={{
          fontSize: '16px',
          fontFamily: "'Space Mono', monospace",
          letterSpacing: '3px',
          color: COLORS.flora,
          margin: '0 0 40px 0',
          textTransform: 'uppercase',
          fontWeight: 400,
        }}>
          THE <GlitchTextWord
            word="RINGLEADER"
            puzzleId="passwordTerminal"
            onActivate={handleActivatePuzzle}
          /> — FOUNDER. ARCHITECT. CHOSEN OF HIS OWN DESIGN.
        </h3>

        <div style={{
          fontSize: '16px',
          fontFamily: "'Crimson Text', serif",
          lineHeight: '1.8',
          color: COLORS.bone,
          maxWidth: '900px',
          marginBottom: '40px',
        }}>
          <p>
            He built Flora's Wonderland with a vision that no investor,<br />
            no city official, no engineer fully understood.
          </p>
          <p style={{ marginTop: '20px' }}>
            They thought it was an amusement park.
          </p>
          <p style={{ marginTop: '20px' }}>
            He never corrected them.
          </p>
          <p style={{ marginTop: '20px' }}>
            Dr. Cavicus disappeared on the night of the Incident.<br />
            No body was recovered. No trace was found.<br />
            The authorities listed him as a casualty.
          </p>
          <p style={{ marginTop: '20px' }}>
            The Order of Cavicus does not believe this.
          </p>
          <p style={{ marginTop: '20px' }}>
            We believe He completed His own work.<br />
            That the Ringleader became the most Soulbound of all—<br />
            not trapped in a vessel, but woven into the island itself.<br />
            Into the frequency. Into the signal.
          </p>
          <p style={{ marginTop: '20px', fontWeight: 600, color: COLORS.flora }}>
            He is still broadcasting.<br />
            You are listening to Him right now.
          </p>
        </div>

        <div style={{
          fontSize: '12px',
          fontFamily: "'Space Mono', monospace",
          letterSpacing: '2px',
          color: COLORS.crimson,
          fontStyle: 'italic',
        }}>
          [ALL FURTHER FILES SEALED — LEVEL 6 CLEARANCE]
        </div>
      </section>

      {/* Character Cards */}
      <section style={{
        padding: '80px 40px',
        position: 'relative',
      }}>
        <LocalCRTOverlay />

        {/* Flora */}
        <div style={{
          marginBottom: '80px',
          paddingBottom: '60px',
          borderBottom: `1px solid ${COLORS.ash}40`,
        }}>
          <h3 style={{
            fontSize: '32px',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '3px',
            color: COLORS.bone,
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
          }}>FLORA — The Flower Mascot</h3>

          <div style={{
            fontSize: '12px',
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '2px',
            color: COLORS.flora,
            marginBottom: '30px',
          }}>STATUS: ACTIVE — SOULBOUND</div>

          <div style={{
            fontSize: '16px',
            fontFamily: "'Crimson Text', serif",
            lineHeight: '1.8',
            color: COLORS.bone,
            maxWidth: '800px',
          }}>
            <p>The first.</p>
            <p style={{ marginTop: '15px' }}>
              Of all the Chosen, Flora was selected earliest—<br />
              perhaps before the others knew they had been selected at all.
            </p>
            <p style={{ marginTop: '15px' }}>
              The Order believes she was willing.<br />
              More than willing.
            </p>
            <p style={{ marginTop: '15px' }}>
              The flowers on the eastern perimeter bloom in November.<br />
              In the cold. In the dark.<br />
              They have done this every year since 2026.
            </p>
            <p style={{ marginTop: '15px' }}>
              She presides over the island the way a mother watches a sleeping child—<br />
              quietly, completely, without blinking.
            </p>
            <p style={{ marginTop: '20px', fontStyle: 'italic', color: COLORS.crimson }}>
              Do not seek her out. She already knows you are looking.
            </p>
            <p style={{ marginTop: '20px', fontSize: '12px', fontFamily: "'Space Mono', monospace", letterSpacing: '1px', color: COLORS.crimson }}>
              WARNING: Do not make direct eye contact with the vessel.<br />
              She remembers every face. Every face.
            </p>
          </div>
        </div>

        {/* Pyro */}
        <div style={{
          marginBottom: '80px',
          paddingBottom: '60px',
          borderBottom: `1px solid ${COLORS.ash}40`,
        }}>
          <h3 style={{
            fontSize: '32px',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '3px',
            color: COLORS.bone,
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
          }}>PYRO — The Fire Mascot</h3>

          <div style={{
            fontSize: '12px',
            fontFamily: "'Space Mono', monospace",
            letterSpacing: '2px',
            color: COLORS.flora,
            marginBottom: '30px',
          }}>STATUS: UNKNOWN</div>

          <div style={{
            fontSize: '16px',
            fontFamily: "'Crimson Text', serif",
            lineHeight: '1.8',
            color: COLORS.bone,
            maxWidth: '800px',
          }}>
            <p>Pyro's Choosing was not clean.</p>
            <p style={{ marginTop: '15px' }}>
              Whatever happened in Sector 4 on the night of the Incident—<br />
              we have the audio. we have played it once.<br />
              we have not played it again.
            </p>
            <p style={{ marginTop: '15px' }}>
              The suit was recovered. What inhabited it was not.
            </p>
            <p style={{ marginTop: '15px' }}>
              Our members who have visited Sector 4 report burns on walls<br />
              that were not there the week before.<br />
              The burns form patterns. We are still mapping them.
            </p>
            <p style={{ marginTop: '15px' }}>
              The Order reveres all the Soulbound.<br />
              But some of us believe Pyro is something the Ringleader<br />
              did not fully intend. A variable. An answer to a question He did not ask.
            </p>
            <p style={{ marginTop: '20px', fontStyle: 'italic', color: COLORS.crimson }}>
              Approach Sector 4 with the understanding<br />
              that reverence may not protect you here.
            </p>
          </div>
        </div>

        {/* Locked Character 1 */}
        <div style={{
          marginBottom: '80px',
          paddingBottom: '60px',
          borderBottom: `1px solid ${COLORS.ash}40`,
          padding: '40px',
          background: `rgba(10,10,10,0.5)`,
          border: `1px solid ${COLORS.ash}40`,
        }}>
          <h3 style={{
            fontSize: '32px',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '3px',
            color: COLORS.ash,
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
          }}>??? [CLASSIFIED]</h3>

          <div style={{
            fontSize: '16px',
            fontFamily: "'Crimson Text', serif",
            lineHeight: '1.8',
            color: COLORS.bone,
            maxWidth: '600px',
          }}>
            <p>
              There are things within this archive that even the Order<br />
              does not discuss in open channels.
            </p>
            <p style={{ marginTop: '15px' }}>
              This is one of them.
            </p>
            <p style={{ marginTop: '15px' }}>
              What we know has been earned through years of study,<br />
              three site visits, and the loss of someone we trusted.
            </p>
            <p style={{ marginTop: '15px' }}>
              We are not ready to share it.
            </p>
            <p style={{ marginTop: '20px', fontSize: '12px', fontFamily: "'Space Mono', monospace", letterSpacing: '2px', color: COLORS.crimson }}>
              [LEVEL 6 CLEARANCE REQUIRED]
            </p>
          </div>
        </div>

        {/* Locked Character 2 */}
        <div style={{
          padding: '40px',
          background: `rgba(10,10,10,0.5)`,
          border: `1px solid ${COLORS.ash}40`,
        }}>
          <h3 style={{
            fontSize: '32px',
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '3px',
            color: COLORS.ash,
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
          }}>??? [CLASSIFIED]</h3>

          <div style={{
            fontSize: '16px',
            fontFamily: "'Crimson Text', serif",
            lineHeight: '1.8',
            color: COLORS.bone,
          }}>
            <p>It does not make a sound.</p>
            <p style={{ marginTop: '15px' }}>
              That is all we will say here.
            </p>
            <p style={{ marginTop: '20px', fontSize: '12px', fontFamily: "'Space Mono', monospace", letterSpacing: '2px', color: COLORS.crimson }}>
              [CLASSIFIED]
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CharactersPage;
