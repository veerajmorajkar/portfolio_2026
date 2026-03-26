import { useEffect, useRef, memo } from "react";
import { useTurntable } from "../context/TurntableContext";
import type { SectionId } from "../types";

// Glow color palettes for each section - expanded into rich, contrasting gradients
const GLOW_PALETTES: Record<SectionId, {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
}> = {
  // About: Cyan/Turquoise (#30D5C8) → Deep blue to Cyan to Lime spectrum
  about: {
    primary: "#30D5C8",    // Original turquoise
    secondary: "#0088FF",  // Deep electric blue
    accent: "#00FFAA",     // Bright cyan-green
    highlight: "#CCFF00",  // Lime yellow
  },
  
  // Projects: Lime Green (#5CF64A) → Yellow to Lime to Cyan spectrum
  projects: {
    primary: "#5CF64A",    // Original lime
    secondary: "#FFEE00",  // Bright yellow
    accent: "#00FF88",     // Emerald green
    highlight: "#00DDFF",  // Cyan blue
  },
  
  // Education: Purple (#624CAB) → Deep blue to Purple to Pink spectrum
  education: {
    primary: "#624CAB",    // Original purple
    secondary: "#2244DD",  // Deep royal blue
    accent: "#AA44FF",     // Bright violet
    highlight: "#FF44DD",  // Hot pink
  },
  
  // Experience: Red (#EE4B2B) → Orange to Red to Magenta spectrum
  experience: {
    primary: "#EE4B2B",    // Original red
    secondary: "#FF8800",  // Bright orange
    accent: "#FF0055",     // Hot red-pink
    highlight: "#FF00DD",  // Magenta
  },
  
  // Skills: Magenta (#ca2c92) → Red to Magenta to Blue spectrum
  skills: {
    primary: "#ca2c92",    // Original magenta
    secondary: "#FF0066",  // Hot pink-red
    accent: "#DD00FF",     // Electric purple
    highlight: "#6600FF",  // Deep violet-blue
  },
};

interface AuroraGlowProps {
  sectionId: SectionId | null;
  visible: boolean;
}

const AuroraGlowComponent: React.FC<AuroraGlowProps> = ({ sectionId, visible }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const { audioPlayer } = useTurntable();

  // Beat-reactive pulsation with instant peaks and smooth buttery decay
  useEffect(() => {
    // TEMPORARILY DISABLED FOR DEBUGGING
    return;
    
    if (!visible || !containerRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const container = containerRef.current;
    
    // Separate intensity tracking for multi-band reactivity
    let currentIntensity = 0.0; // Near-zero base for maximum dramatic contrast
    let kickIntensity = 0.0;
    let snareIntensity = 0.0;
    let hiHatIntensity = 0.0;
    let bassIntensity = 0.0;
    
    let lastTime = performance.now();
    const targetFPS = 60; // High FPS for buttery smooth transitions
    const frameInterval = 1000 / targetFPS;
    
    // Faster decay for more dramatic dips
    const attackSpeed = 1.0; // Instant jump to peak
    const decaySpeed = 0.22; // Very fast decay for extreme dramatic dips
    
    const animate = (currentTime: number) => {
      try {
        const deltaTime = currentTime - lastTime;
        
        // Only update at target FPS for consistent buttery smoothness
        if (deltaTime >= frameInterval) {
          lastTime = currentTime - (deltaTime % frameInterval);
          
          // Get multi-band beat intensity (kick, snare, hi-hat, bass)
          let audioData;
          try {
            audioData = (audioPlayer as any).getMultiBandAudioData?.() || {
              kick: 0,
              snare: 0,
              hiHat: 0,
              bass: 0,
              combined: 0
            };
          } catch (err) {
            console.error('Audio data error:', err);
            audioData = {
              kick: 0,
              snare: 0,
              hiHat: 0,
              bass: 0,
              combined: 0
            };
          }
        
        // Update each band with instant attack / fast decay for dramatic dips
        if (audioData.kick > kickIntensity) {
          kickIntensity = kickIntensity + (audioData.kick - kickIntensity) * attackSpeed;
        } else {
          kickIntensity = kickIntensity * (1 - decaySpeed) + audioData.kick * decaySpeed;
        }
        
        if (audioData.snare > snareIntensity) {
          snareIntensity = snareIntensity + (audioData.snare - snareIntensity) * attackSpeed;
        } else {
          snareIntensity = snareIntensity * (1 - decaySpeed) + audioData.snare * decaySpeed;
        }
        
        if (audioData.hiHat > hiHatIntensity) {
          hiHatIntensity = hiHatIntensity + (audioData.hiHat - hiHatIntensity) * attackSpeed;
        } else {
          hiHatIntensity = hiHatIntensity * (1 - decaySpeed) + audioData.hiHat * decaySpeed;
        }
        
        // Bass has slower, smoother movement for continuous glow
        bassIntensity = bassIntensity * 0.92 + audioData.bass * 0.08;
        
        // Combine with weighted emphasis on kick (most dramatic)
        const combined = (kickIntensity * 0.5) + (snareIntensity * 0.3) + (hiHatIntensity * 0.15) + (bassIntensity * 0.05);
        
        // Update overall intensity with instant attack / smooth decay
        if (combined > currentIntensity) {
          currentIntensity = combined; // Instant jump to peak
        } else {
          currentIntensity = currentIntensity * (1 - decaySpeed) + combined * decaySpeed;
        }
        
        // Map to dramatic glow range with extreme contrast
        // Minimum: 0.01 (nearly invisible for dramatic dips) → Maximum: 1.0 (full intensity)
        const glowIntensity = 0.01 + (currentIntensity * 0.99);
        
        // Map individual bands for layer-specific effects with extreme dramatic range
        const kickGlow = 0.02 + (kickIntensity * 0.98);
        const snareGlow = 0.02 + (snareIntensity * 0.98);
        const hiHatGlow = 0.01 + (hiHatIntensity * 0.99);
        const bassGlow = 0.03 + (bassIntensity * 0.97);
        
        // Update CSS variables for smooth visual transitions
        if (container) {
          container.style.setProperty('--glow-intensity', glowIntensity.toString());
          container.style.setProperty('--kick-intensity', kickGlow.toString());
          container.style.setProperty('--snare-intensity', snareGlow.toString());
          container.style.setProperty('--hihat-intensity', hiHatGlow.toString());
          container.style.setProperty('--bass-intensity', bassGlow.toString());
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    } catch (err) {
      console.error('Aurora animation error:', err);
      // Stop animation on error to prevent crash loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, audioPlayer]);

  if (!visible || !sectionId) return null;

  const palette = GLOW_PALETTES[sectionId] || GLOW_PALETTES.about;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        top: "30vh",
        left: "58%",
        transform: "translateX(-50%)",
        width: "clamp(280px, 30vw, 440px)",
        height: "64vh",
        pointerEvents: "none",
        zIndex: 0,
        ['--glow-intensity' as any]: '0.01',
        ['--kick-intensity' as any]: '0.02',
        ['--snare-intensity' as any]: '0.02',
        ['--hihat-intensity' as any]: '0.01',
        ['--bass-intensity' as any]: '0.03',
      }}
    >
      {/* Core kick layer - primary color center, reacts to kick drum */}
      <div style={{
        position: "absolute",
        inset: "-40px",
        background: `radial-gradient(ellipse at 50% 55%, ${palette.primary}FF 0%, ${palette.primary}AA 25%, ${palette.primary}55 45%, transparent 65%)`,
        pointerEvents: "none",
        filter: "blur(30px)",
        opacity: 'var(--kick-intensity)',
        willChange: "opacity",
        transition: "opacity 0.05s cubic-bezier(0.4, 0.0, 0.2, 1)",
      }} />
      
      {/* Secondary snare layer - contrasting color on left, reacts to snare */}
      <div style={{
        position: "absolute",
        inset: "-55px",
        background: `radial-gradient(ellipse at 25% 50%, ${palette.secondary}DD 0%, ${palette.secondary}88 20%, ${palette.secondary}44 40%, transparent 60%)`,
        pointerEvents: "none",
        filter: "blur(40px)",
        opacity: 'var(--snare-intensity)',
        animation: "aurora-shift-1 8s ease-in-out infinite",
        willChange: "opacity, transform",
        transition: "opacity 0.05s cubic-bezier(0.4, 0.0, 0.2, 1)",
      }} />
      
      {/* Accent hi-hat layer - bright color on right, reacts to hi-hats */}
      <div style={{
        position: "absolute",
        inset: "-55px",
        background: `radial-gradient(ellipse at 75% 50%, ${palette.accent}DD 0%, ${palette.accent}88 20%, ${palette.accent}44 40%, transparent 60%)`,
        pointerEvents: "none",
        filter: "blur(40px)",
        opacity: 'var(--hihat-intensity)',
        animation: "aurora-shift-2 10s ease-in-out infinite",
        willChange: "opacity, transform",
        transition: "opacity 0.05s cubic-bezier(0.4, 0.0, 0.2, 1)",
      }} />
      
      {/* Highlight layer - top accent, reacts to overall intensity */}
      <div style={{
        position: "absolute",
        inset: "-65px",
        background: `radial-gradient(ellipse at 50% 20%, ${palette.highlight}CC 0%, ${palette.highlight}77 25%, ${palette.highlight}33 50%, transparent 70%)`,
        pointerEvents: "none",
        filter: "blur(50px)",
        opacity: 'var(--glow-intensity)',
        animation: "aurora-shift-1 12s ease-in-out infinite reverse",
        willChange: "opacity, transform",
        transition: "opacity 0.08s cubic-bezier(0.4, 0.0, 0.2, 1)",
      }} />
      
      {/* Bass sustain layer - continuous low-level glow */}
      <div style={{
        position: "absolute",
        inset: "-50px",
        background: `radial-gradient(ellipse at 50% 60%, ${palette.primary}99 0%, ${palette.primary}55 30%, ${palette.primary}22 50%, transparent 70%)`,
        pointerEvents: "none",
        filter: "blur(45px)",
        opacity: 'var(--bass-intensity)',
        willChange: "opacity",
        transition: "opacity 0.15s ease-out",
      }} />
      
      {/* Outer blend layer - mix all colors with dramatic pulses */}
      <div style={{
        position: "absolute",
        inset: "-80px",
        background: `radial-gradient(ellipse at 50% 50%, ${palette.primary}88 0%, ${palette.secondary}66 20%, ${palette.accent}66 40%, ${palette.highlight}44 60%, transparent 85%)`,
        pointerEvents: "none",
        filter: "blur(60px)",
        opacity: 'var(--glow-intensity)',
        willChange: "opacity",
        transition: "opacity 0.08s cubic-bezier(0.4, 0.0, 0.2, 1)",
      }} />
      
      {/* Atmospheric diffuse layer - soft outer glow */}
      <div style={{
        position: "absolute",
        inset: "-100px",
        background: `radial-gradient(ellipse at 50% 50%, ${palette.accent}66 0%, ${palette.highlight}44 35%, ${palette.primary}22 60%, transparent 85%)`,
        pointerEvents: "none",
        filter: "blur(75px)",
        opacity: 'calc(var(--glow-intensity) * 0.85)',
        willChange: "opacity",
        transition: "opacity 0.12s ease-out",
      }} />
      
      {/* Ultra-wide ambient layer - creates the dramatic bloom effect */}
      <div style={{
        position: "absolute",
        inset: "-120px",
        background: `radial-gradient(ellipse at 50% 50%, ${palette.primary}55 0%, ${palette.secondary}44 25%, ${palette.accent}44 50%, ${palette.highlight}22 70%, transparent 90%)`,
        pointerEvents: "none",
        filter: "blur(90px)",
        opacity: 'calc(var(--glow-intensity) * 0.75)',
        willChange: "opacity",
        transition: "opacity 0.15s ease-out",
      }} />
    </div>
  );
};

export const AuroraGlow = memo(AuroraGlowComponent);
