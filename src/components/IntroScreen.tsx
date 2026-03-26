import { motion } from "framer-motion";
import { getSectionById } from "../data/sections";
import { memo } from "react";

const fontPixel = "'Press Start 2P', monospace";

interface IntroScreenProps {
  onDiscClick: () => void;
}

const IntroScreenComponent: React.FC<IntroScreenProps> = ({ onDiscClick }) => {
  const aboutSection = getSectionById("about");
  
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        isolation: "isolate",
      }}
    >
      {/* Name above disc - bold, clean, sleek with subtle glow */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          fontFamily: fontPixel,
          fontSize: "clamp(20px, 3vw, 36px)",
          fontWeight: "bold",
          color: "#ffffff",
          letterSpacing: "4px",
          marginBottom: "clamp(40px, 6vh, 80px)",
          textAlign: "center",
          padding: "0 20px",
          position: "relative",
          zIndex: 10,
          textShadow: `
            0 0 8px rgba(255, 255, 255, 0.4),
            0 0 16px rgba(48, 213, 200, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.8)
          `,
          filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.2))",
          WebkitTextStroke: "0.5px rgba(255, 255, 255, 0.2)",
        }}
      >
        VEERAJ MORAJKAR
      </motion.div>

      {/* Floating disc with multi-layer aurora glow */}
      <motion.div
        data-intro-disc
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: [0, -12, 0],
        }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 0.6 },
          y: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        onClick={onDiscClick}
        style={{
          width: "var(--disc-size)",
          height: "var(--disc-size)",
          cursor: "pointer",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Multi-layer aurora glow background - color-cycling through all sections */}
        <div style={{
          position: "absolute",
          inset: "-30px",
          pointerEvents: "none",
          zIndex: -1,
        }}>
          {/* Core layer - cycles through all section colors */}
          <motion.div
            animate={{
              opacity: [0.15, 0.95, 0.15],
              scale: [0.92, 1.08, 0.92],
              background: [
                "radial-gradient(ellipse at 50% 50%, #30D5C8FF 0%, #30D5C8AA 25%, #30D5C855 45%, transparent 65%)", // About - Cyan
                "radial-gradient(ellipse at 50% 50%, #EE4B2BFF 0%, #EE4B2BAA 25%, #EE4B2B55 45%, transparent 65%)", // Experience - Red
                "radial-gradient(ellipse at 50% 50%, #ca2c92FF 0%, #ca2c92AA 25%, #ca2c9255 45%, transparent 65%)", // Skills - Magenta
                "radial-gradient(ellipse at 50% 50%, #624CABFF 0%, #624CABAA 25%, #624CAB55 45%, transparent 65%)", // Education - Purple
                "radial-gradient(ellipse at 50% 50%, #5CF64AFF 0%, #5CF64AAA 25%, #5CF64A55 45%, transparent 65%)", // Projects - Lime
                "radial-gradient(ellipse at 50% 50%, #30D5C8FF 0%, #30D5C8AA 25%, #30D5C855 45%, transparent 65%)", // Back to Cyan
              ],
            }}
            transition={{
              opacity: { duration: 3.5, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] },
              scale: { duration: 3.5, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] },
              background: { duration: 20, repeat: Infinity, ease: "linear" },
            }}
            style={{
              position: "absolute",
              inset: "-20px",
              filter: "blur(25px)",
            }}
          />
          
          {/* Left accent layer - cycles with offset */}
          <motion.div
            animate={{
              opacity: [0.1, 0.85, 0.1],
              x: [-3, 3, -3],
              y: [-2, 2, -2],
              background: [
                "radial-gradient(ellipse at 25% 50%, #0088FFDD 0%, #0088FF88 20%, #0088FF44 40%, transparent 60%)", // About accent
                "radial-gradient(ellipse at 25% 50%, #FF8800DD 0%, #FF880088 20%, #FF880044 40%, transparent 60%)", // Experience accent
                "radial-gradient(ellipse at 25% 50%, #FF0066DD 0%, #FF006688 20%, #FF006644 40%, transparent 60%)", // Skills accent
                "radial-gradient(ellipse at 25% 50%, #2244DDDD 0%, #2244DD88 20%, #2244DD44 40%, transparent 60%)", // Education accent
                "radial-gradient(ellipse at 25% 50%, #FFEE00DD 0%, #FFEE0088 20%, #FFEE0044 40%, transparent 60%)", // Projects accent
                "radial-gradient(ellipse at 25% 50%, #0088FFDD 0%, #0088FF88 20%, #0088FF44 40%, transparent 60%)", // Back to About
              ],
            }}
            transition={{
              opacity: { duration: 4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
              x: { duration: 4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
              y: { duration: 4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
              background: { duration: 20, repeat: Infinity, ease: "linear", delay: 4 },
            }}
            style={{
              position: "absolute",
              inset: "-25px",
              filter: "blur(30px)",
            }}
          />
          
          {/* Right accent layer - cycles with different offset */}
          <motion.div
            animate={{
              opacity: [0.1, 0.85, 0.1],
              x: [3, -3, 3],
              y: [2, -2, 2],
              background: [
                "radial-gradient(ellipse at 75% 50%, #00FFAADD 0%, #00FFAA88 20%, #00FFAA44 40%, transparent 60%)", // About accent
                "radial-gradient(ellipse at 75% 50%, #FF0055DD 0%, #FF005588 20%, #FF005544 40%, transparent 60%)", // Experience accent
                "radial-gradient(ellipse at 75% 50%, #DD00FFDD 0%, #DD00FF88 20%, #DD00FF44 40%, transparent 60%)", // Skills accent
                "radial-gradient(ellipse at 75% 50%, #AA44FFDD 0%, #AA44FF88 20%, #AA44FF44 40%, transparent 60%)", // Education accent
                "radial-gradient(ellipse at 75% 50%, #00FF88DD 0%, #00FF8888 20%, #00FF8844 40%, transparent 60%)", // Projects accent
                "radial-gradient(ellipse at 75% 50%, #00FFAADD 0%, #00FFAA88 20%, #00FFAA44 40%, transparent 60%)", // Back to About
              ],
            }}
            transition={{
              opacity: { duration: 4.2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
              x: { duration: 4.2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
              y: { duration: 4.2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
              background: { duration: 20, repeat: Infinity, ease: "linear", delay: 8 },
            }}
            style={{
              position: "absolute",
              inset: "-25px",
              filter: "blur(30px)",
            }}
          />
          
          {/* Top highlight layer - cycles through highlight colors */}
          <motion.div
            animate={{
              opacity: [0.05, 0.65, 0.05],
              scale: [0.9, 1.08, 0.9],
              background: [
                "radial-gradient(ellipse at 50% 30%, #CCFF00CC 0%, #CCFF0077 20%, #CCFF0033 40%, transparent 60%)", // About highlight
                "radial-gradient(ellipse at 50% 30%, #FF00DDCC 0%, #FF00DD77 20%, #FF00DD33 40%, transparent 60%)", // Experience highlight
                "radial-gradient(ellipse at 50% 30%, #6600FFCC 0%, #6600FF77 20%, #6600FF33 40%, transparent 60%)", // Skills highlight
                "radial-gradient(ellipse at 50% 30%, #FF44DDCC 0%, #FF44DD77 20%, #FF44DD33 40%, transparent 60%)", // Education highlight
                "radial-gradient(ellipse at 50% 30%, #00DDFFCC 0%, #00DDFF77 20%, #00DDFF33 40%, transparent 60%)", // Projects highlight
                "radial-gradient(ellipse at 50% 30%, #CCFF00CC 0%, #CCFF0077 20%, #CCFF0033 40%, transparent 60%)", // Back to About
              ],
            }}
            transition={{
              opacity: { duration: 3.8, repeat: Infinity, ease: [0.65, 0, 0.35, 1] },
              scale: { duration: 3.8, repeat: Infinity, ease: [0.65, 0, 0.35, 1] },
              background: { duration: 20, repeat: Infinity, ease: "linear", delay: 2 },
            }}
            style={{
              position: "absolute",
              inset: "-25px",
              filter: "blur(30px)",
            }}
          />
          
          {/* Outer blend layer - smooth color transitions */}
          <motion.div
            animate={{
              opacity: [0.08, 0.65, 0.08],
              rotate: [0, 6, 0],
              background: [
                "radial-gradient(ellipse at 50% 50%, #30D5C888 0%, #0088FF66 20%, #00FFAA66 40%, #CCFF0044 55%, transparent 80%)", // About blend
                "radial-gradient(ellipse at 50% 50%, #EE4B2B88 0%, #FF880066 20%, #FF005566 40%, #FF00DD44 55%, transparent 80%)", // Experience blend
                "radial-gradient(ellipse at 50% 50%, #ca2c9288 0%, #FF006666 20%, #DD00FF66 40%, #6600FF44 55%, transparent 80%)", // Skills blend
                "radial-gradient(ellipse at 50% 50%, #624CAB88 0%, #2244DD66 20%, #AA44FF66 40%, #FF44DD44 55%, transparent 80%)", // Education blend
                "radial-gradient(ellipse at 50% 50%, #5CF64A88 0%, #FFEE0066 20%, #00FF8866 40%, #00DDFF44 55%, transparent 80%)", // Projects blend
                "radial-gradient(ellipse at 50% 50%, #30D5C888 0%, #0088FF66 20%, #00FFAA66 40%, #CCFF0044 55%, transparent 80%)", // Back to About
              ],
            }}
            transition={{
              opacity: { duration: 5, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] },
              rotate: { duration: 5, repeat: Infinity, ease: [0.45, 0.05, 0.55, 0.95] },
              background: { duration: 20, repeat: Infinity, ease: "linear", delay: 6 },
            }}
            style={{
              position: "absolute",
              inset: "-32px",
              filter: "blur(38px)",
            }}
          />
          
          {/* Ultra-wide atmospheric layer - subtle color wash */}
          <motion.div
            animate={{
              opacity: [0.05, 0.55, 0.05],
              background: [
                "radial-gradient(ellipse at 50% 50%, #30D5C855 0%, #0088FF44 25%, #00FFAA44 45%, #CCFF0022 65%, transparent 85%)", // About
                "radial-gradient(ellipse at 50% 50%, #EE4B2B55 0%, #FF880044 25%, #FF005544 45%, #FF00DD22 65%, transparent 85%)", // Experience
                "radial-gradient(ellipse at 50% 50%, #ca2c9255 0%, #FF006644 25%, #DD00FF44 45%, #6600FF22 65%, transparent 85%)", // Skills
                "radial-gradient(ellipse at 50% 50%, #624CAB55 0%, #2244DD44 25%, #AA44FF44 45%, #FF44DD22 65%, transparent 85%)", // Education
                "radial-gradient(ellipse at 50% 50%, #5CF64A55 0%, #FFEE0044 25%, #00FF8844 45%, #00DDFF22 65%, transparent 85%)", // Projects
                "radial-gradient(ellipse at 50% 50%, #30D5C855 0%, #0088FF44 25%, #00FFAA44 45%, #CCFF0022 65%, transparent 85%)", // Back to About
              ],
            }}
            transition={{
              opacity: { duration: 4.5, repeat: Infinity, ease: [0.42, 0, 0.58, 1] },
              background: { duration: 20, repeat: Infinity, ease: "linear", delay: 10 },
            }}
            style={{
              position: "absolute",
              inset: "-40px",
              filter: "blur(45px)",
            }}
          />
        </div>
        
        {/* Disc image */}
        <img
          src={aboutSection.discImage}
          alt="About disc"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            imageRendering: "pixelated",
            transform: "rotate(35deg)",
            position: "relative",
            zIndex: 2,
          }}
        />
      </motion.div>

      {/* Click to play text - enhanced with dramatic pulsing glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: [0.3, 1, 0.3],
          scale: [0.96, 1.06, 0.96],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: [0.45, 0.05, 0.55, 0.95],
        }}
        style={{
          fontFamily: fontPixel,
          fontSize: "clamp(11px, 1.3vw, 16px)",
          color: "#ffffff",
          letterSpacing: "3px",
          marginTop: "clamp(40px, 6vh, 80px)",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
          textShadow: `
            0 0 10px rgba(48, 213, 200, 0.8),
            0 0 20px rgba(48, 213, 200, 0.6),
            0 0 30px rgba(48, 213, 200, 0.4),
            0 0 40px rgba(0, 255, 170, 0.3),
            0 2px 4px rgba(0, 0, 0, 0.8)
          `,
          filter: "drop-shadow(0 0 8px rgba(48, 213, 200, 0.6))",
        }}
      >
        CLICK TO PLAY
      </motion.div>
    </div>
  );
};

export const IntroScreen = memo(IntroScreenComponent);
