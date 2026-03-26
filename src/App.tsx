import { useRef, useState, useCallback, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { TurntableProvider, useTurntable } from "./context/TurntableContext";
import { Turntable } from "./components/Turntable";
import { DiscStack, type DiscStackHandle } from "./components/DiscStack";
import { InfoPanel } from "./components/InfoPanel";
import { MusicPlayer } from "./components/MusicPlayer";
import { SocialIcons } from "./components/SocialIcons";
import { AuroraGlow } from "./components/AuroraGlow";
import { IntroScreen } from "./components/IntroScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { getSectionById } from "./data/sections";
import { TOKENS } from "./data/tokens";
import type { SectionId } from "./types";
import "./styles/global.css";

/*
 * Animation flow (state machine):
 *
 * FRESH SELECT (idle → playing):
 *   1. Clicked disc hops up from stack (squash-stretch)
 *   2. Arcs through the air to platter (curved path)
 *   3. Lands with squash-settle bounce
 *   4. Tonearm drops → spin starts
 *
 * DESELECT (playing → idle):
 *   1. Spin slows, tonearm lifts
 *   2. Disc hops off platter (squash-stretch)
 *   3. Arcs back to its stack slot
 *   4. Lands in slot with settle bounce
 *
 * SWAP (playing disc A → playing disc B):
 *   1. Spin slows, tonearm lifts
 *   2. Disc A hops off → arcs back to its stack slot → settles
 *   3. Disc B hops up → arcs to platter → lands
 *   4. Tonearm drops → spin starts
 */

type FlowState =
  | "idle"
  | "selecting"      // new disc flying to platter
  | "playing"        // disc spinning on platter
  | "deselecting"    // disc leaving platter back to stack
  | "swapping-out"   // old disc leaving platter (first half of swap)
  | "swapping-in";   // new disc arriving on platter (second half of swap)

const getImgStyle = (discId: SectionId | null): React.CSSProperties => {
  let rotation = "0deg";
  if (discId === "about") rotation = "35deg";
  else if (discId === "projects") rotation = "20deg";
  else if (discId === "education") rotation = "15deg";
  else if (discId === "skills") rotation = "15deg";
  
  return {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    display: "block",
    pointerEvents: "none",
    transform: `rotate(${rotation})`,
    transformOrigin: "center center",
  };
};

function AppContent() {
  const { dispatch, audioPlayer } = useTurntable();
  const [flow, setFlow] = useState<FlowState>("idle");
  const [platterDiscId, setPlatterDiscId] = useState<SectionId | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [introAnimating, setIntroAnimating] = useState(false);
  const [showMainElements, setShowMainElements] = useState(false);
  const [showPersistentUI, setShowPersistentUI] = useState(false); // For music player and social icons
  const [layoutReady, setLayoutReady] = useState(false); // Wait for CSS to be fully applied

  const turntableControls = useAnimationControls();
  const stackControls = useAnimationControls();

  const mainContentRef = useRef<HTMLDivElement>(null);
  const platterRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<DiscStackHandle>(null);
  const flyingControls = useAnimationControls();
  const flyingRef = useRef<HTMLDivElement>(null);
  const [flyingImage, setFlyingImage] = useState<string | null>(null);
  const [flyingDiscId, setFlyingDiscId] = useState<SectionId | null>(null);
  const [flyingVisible, setFlyingVisible] = useState(false);
  const [flyingZIndex, setFlyingZIndex] = useState(999);
  const flyingImgRef = useRef<HTMLImageElement>(null);

  // Wait for CSS variables and layout to be ready before rendering
  useEffect(() => {
    let mounted = true;
    
    const checkLayout = () => {
      // Wait for CSS variables to be computed
      const turntableWidth = getComputedStyle(document.documentElement)
        .getPropertyValue('--turntable-width')
        .trim();
      
      const discSize = getComputedStyle(document.documentElement)
        .getPropertyValue('--disc-size')
        .trim();
      
      // Check if CSS variables are loaded and have values
      if (turntableWidth && discSize && turntableWidth !== '' && discSize !== '') {
        // Wait one more frame to ensure everything is painted
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (mounted) {
              setLayoutReady(true);
            }
          });
        });
      } else {
        // Retry if CSS isn't ready
        setTimeout(checkLayout, 50);
      }
    };
    
    // Start checking after a small delay
    setTimeout(checkLayout, 100);
    
    return () => {
      mounted = false;
    };
  }, []);

  // --- Helpers to read live positions ---
  const getPlatterCenter = useCallback(() => {
    const el = platterRef.current;
    if (!el) return { x: window.innerWidth * 0.25, y: window.innerHeight * 0.35 };
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const getSlotCenter = useCallback((id: SectionId) => {
    const rect = stackRef.current?.getSlotRect(id);
    if (!rect) return { x: window.innerWidth * 0.85, y: window.innerHeight * 0.5 };
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, []);

  const getSlotSize = useCallback((id: SectionId) => {
    const rect = stackRef.current?.getSlotRect(id);
    if (rect) return rect.width;
    
    // Fallback: calculate from CSS variable
    const discSizeStr = getComputedStyle(document.documentElement).getPropertyValue('--disc-size').trim();
    if (discSizeStr.includes('vw')) {
      const discSize = parseFloat(discSizeStr) * window.innerWidth / 100; // Convert vw to px
      return discSize;
    }
    return parseFloat(discSizeStr); // Already in px
  }, []);

  const getPlatterDiscSize = useCallback(() => {
    const platterEl = platterRef.current;
    if (platterEl) {
      const rect = platterEl.getBoundingClientRect();
      return rect.width;
    }
    
    const turntableWidthStr = getComputedStyle(document.documentElement).getPropertyValue('--turntable-width').trim();
    if (turntableWidthStr.includes('vh')) {
      const turntableWidth = parseFloat(turntableWidthStr) * window.innerHeight / 100;
      return turntableWidth * 0.55;
    }
    const turntableWidth = parseFloat(turntableWidthStr);
    return turntableWidth * 0.55;
  }, []);

  const getSlotZIndex = useCallback((id: SectionId) => {
    return stackRef.current?.getSlotZIndex(id) ?? 1;
  }, []);

  /** Handle intro disc click - slide in turntable and stack with squash-stretch */
  const handleIntroDiscClick = useCallback(async () => {
    if (introAnimating) return;
    setIntroAnimating(true);

    // Get the intro disc position
    const introDiscEl = document.querySelector('[data-intro-disc]') as HTMLElement;
    if (!introDiscEl) return;

    const introRect = introDiscEl.getBoundingClientRect();
    const platter = getPlatterCenter();
    const aboutSection = getSectionById("about");

    // Show flying disc at intro position with correct size
    setFlyingImage(aboutSection.discImage);
    setFlyingDiscId("about");
    setFlyingZIndex(999);
    flyingControls.set({
      x: introRect.left + introRect.width / 2,
      y: introRect.top + introRect.height / 2,
      scale: 1,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
    });
    setFlyingVisible(true);

    // Hide intro screen and show main elements
    setShowIntro(false);
    setShowMainElements(true);

    // Set flow and platterDiscId BEFORE animation to hide the disc from stack
    setFlow("selecting");
    setPlatterDiscId("about");
    dispatch({ type: "SELECT_DISC", discId: "about" });

    // Initialize turntable and stack off-screen with subtle squash and hardware acceleration
    turntableControls.set({
      x: "-150%", // Far left off-screen
      scaleX: 0.85,
      scaleY: 1.15,
      z: 0, // Force 3D context
    });
    
    stackControls.set({
      x: "150%", // Far right off-screen
      scaleX: 0.85,
      scaleY: 1.15,
      z: 0, // Force 3D context
    });

    // Start all animations simultaneously with optimized easing
    const turntableAnimation = (async () => {
      // Slide in with subtle stretch - use GPU-accelerated transform
      await turntableControls.start({
        x: "0%",
        scaleX: 1.04,
        scaleY: 0.96,
        transition: { 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smoothness
        },
      });
      // Gentle settle
      await turntableControls.start({
        scaleX: 0.98,
        scaleY: 1.02,
        transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] },
      });
      await turntableControls.start({
        scaleX: 1,
        scaleY: 1,
        transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] },
      });
    })();

    const stackAnimation = (async () => {
      // Slide in with subtle stretch - use GPU-accelerated transform
      await stackControls.start({
        x: "0%",
        scaleX: 1.04,
        scaleY: 0.96,
        transition: { 
          duration: 0.5, 
          ease: [0.25, 0.1, 0.25, 1], // Custom cubic-bezier for smoothness
        },
      });
      // Gentle settle
      await stackControls.start({
        scaleX: 0.98,
        scaleY: 1.02,
        transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] },
      });
      await stackControls.start({
        scaleX: 1,
        scaleY: 1,
        transition: { duration: 0.1, ease: [0.4, 0, 0.2, 1] },
      });
    })();

    const discAnimation = (async () => {
      await new Promise(r => setTimeout(r, 1150));

      await flyingControls.start({
        scaleX: 1.08,
        scaleY: 0.92,
        transition: { duration: 0.08 },
      });
      await flyingControls.start({
        y: introRect.top + introRect.height / 2 - 60,
        scaleX: 0.95,
        scaleY: 1.06,
        transition: { duration: 0.15, ease: "easeOut" },
      });

      // 2. Arc to platter - NO size change
      const midX = (introRect.left + introRect.width / 2 + platter.x) / 2;
      const midY = Math.min(introRect.top + introRect.height / 2 - 60, platter.y) - 100;

      await flyingControls.start({
        x: midX,
        y: midY,
        scaleX: 1,
        scaleY: 1,
        transition: { duration: 0.2, ease: "easeInOut" },
      });

      await flyingControls.start({
        x: platter.x,
        y: platter.y,
        transition: { duration: 0.2, ease: "easeIn" },
      });

      await flyingControls.start({
        scaleX: 1.06,
        scaleY: 0.94,
        transition: { duration: 0.08 },
      });
      await flyingControls.start({
        scaleX: 0.98,
        scaleY: 1.02,
        transition: { duration: 0.08 },
      });
      await flyingControls.start({
        scaleX: 1,
        scaleY: 1,
        transition: { duration: 0.06 },
      });
    })();

    // Wait for all animations to complete
    await Promise.all([turntableAnimation, stackAnimation, discAnimation]);

    // Animation complete
    dispatch({ type: "ANIMATION_COMPLETE" });
    setFlow("playing");
    setShowPersistentUI(true); // Show music player and social icons permanently

    // Hide flying disc after turntable disc is visible
    requestAnimationFrame(() => {
      setFlyingVisible(false);
    });

    setIntroAnimating(false);
  }, [introAnimating, flyingControls, turntableControls, stackControls, getPlatterCenter, getPlatterDiscSize, dispatch]);

  /** Read the current rotation of the spinning VinylRecord on the platter. */
  const getPlatterRotation = useCallback((): number => {
    const platterEl = platterRef.current;
    if (!platterEl) return 0;
    const vinylDiv = platterEl.querySelector('[data-testid="vinyl-record"]') as HTMLElement | null;
    if (!vinylDiv) return 0;
    const style = window.getComputedStyle(vinylDiv);
    const matrix = style.transform;
    if (!matrix || matrix === "none") return 0;
    const values = matrix.match(/matrix\((.+)\)/)?.[1]?.split(",").map(Number);
    if (!values) return 0;
    const [a, b] = values;
    return Math.atan2(b, a) * (180 / Math.PI);
  }, []);

  // --- Animate disc FROM stack TO platter ---
  const animateToPlatter = useCallback(async (discId: SectionId) => {
    const section = getSectionById(discId);
    
    const slotCenter = getSlotCenter(discId);
    const slotZ = getSlotZIndex(discId);
    const platter = getPlatterCenter();

    setFlyingImage(section.discImage);
    setFlyingDiscId(discId);
    setFlyingZIndex(slotZ);
    setFlyingVisible(true);

    if (flyingImgRef.current) {
      flyingImgRef.current.style.transform = "";
    }

    // Start at slot position with slot size - keep this size throughout
    flyingControls.set({
      x: slotCenter.x,
      y: slotCenter.y,
      scale: 1,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
    });

    // 1. Hop up: squash then stretch upward - optimized for smoothness
    await flyingControls.start({
      scaleX: 1.08,
      scaleY: 0.92,
      transition: { duration: 0.08, ease: [0.4, 0, 0.2, 1] },
    });
    await flyingControls.start({
      y: slotCenter.y - 60,
      scaleX: 0.95,
      scaleY: 1.06,
      transition: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
    });

    setFlyingZIndex(999);

    // 2. Arc to platter - smooth cubic-bezier easing
    const midX = (slotCenter.x + platter.x) / 2;
    const midY = Math.min(slotCenter.y - 60, platter.y) - 100;

    await flyingControls.start({
      x: midX,
      y: midY,
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.2, ease: [0.42, 0, 0.58, 1] },
    });

    await flyingControls.start({
      x: platter.x,
      y: platter.y,
      transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] },
    });

    // 3. Land squash-settle - optimized timing
    await flyingControls.start({
      scaleX: 1.06,
      scaleY: 0.94,
      transition: { duration: 0.08, ease: [0.4, 0, 0.2, 1] },
    });
    await flyingControls.start({
      scaleX: 0.98,
      scaleY: 1.02,
      transition: { duration: 0.08, ease: [0.4, 0, 0.2, 1] },
    });
    await flyingControls.start({
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.06, ease: [0.4, 0, 0.2, 1] },
    });
  }, [flyingControls, getPlatterCenter, getSlotCenter, getSlotSize, getSlotZIndex]);

  // --- Animate disc FROM platter TO stack slot ---
  const animateToStack = useCallback(async (discId: SectionId) => {
    const section = getSectionById(discId);
    const platter = getPlatterCenter();
    const slotCenter = getSlotCenter(discId);
    const slotZ = getSlotZIndex(discId);

    setFlyingImage(section.discImage);
    setFlyingDiscId(discId);
    setFlyingZIndex(999);
    setFlyingVisible(true);

    // Start at platter position with slot size - keep this size throughout
    flyingControls.set({
      x: platter.x,
      y: platter.y,
      scale: 1,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
    });

    // 1. Hop off: squash then stretch upward
    await flyingControls.start({
      scaleX: 1.06,
      scaleY: 0.94,
      transition: { duration: 0.08 },
    });
    await flyingControls.start({
      y: platter.y - 60,
      scaleX: 0.95,
      scaleY: 1.06,
      transition: { duration: 0.15, ease: "easeOut" },
    });

    // 2. Arc to stack slot - NO size change
    const midX = (platter.x + slotCenter.x) / 2;
    const midY = Math.min(platter.y - 60, slotCenter.y) - 100;

    await flyingControls.start({
      x: midX,
      y: midY,
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.2, ease: "easeInOut" },
    });

    setFlyingZIndex(slotZ);

    await flyingControls.start({
      x: slotCenter.x,
      y: slotCenter.y,
      transition: { duration: 0.2, ease: "easeIn" },
    });

    // 3. Land settle in slot
    await flyingControls.start({
      scaleX: 1.04,
      scaleY: 0.96,
      transition: { duration: 0.07 },
    });
    await flyingControls.start({
      scaleX: 0.98,
      scaleY: 1.01,
      transition: { duration: 0.07 },
    });
    await flyingControls.start({
      scaleX: 1,
      scaleY: 1,
      transition: { duration: 0.05 },
    });

    setFlyingVisible(false);
  }, [flyingControls, getPlatterCenter, getSlotCenter, getSlotSize, getSlotZIndex]);

  // --- FRESH SELECT ---
  const doSelect = useCallback(async (discId: SectionId) => {
    setFlow("selecting");
    setPlatterDiscId(discId);
    dispatch({ type: "SELECT_DISC", discId });

    await animateToPlatter(discId);

    // Don't hide flying disc yet — let it overlap with the Turntable disc
    // so there's no gap. We'll hide it after the Turntable disc is visible.
    dispatch({ type: "ANIMATION_COMPLETE" });
    setFlow("playing");

    // Now the Turntable disc is rendering (showPlatterDisc=true).
    // Hide the flying disc after a frame so the Turntable disc is painted.
    requestAnimationFrame(() => {
      setFlyingVisible(false);
    });
  }, [dispatch, animateToPlatter]);

  // --- DESELECT ---
  const doDeselect = useCallback(async () => {
    if (!platterDiscId) return;
    const discId = platterDiscId;

    // STOP AUDIO IMMEDIATELY - before any state changes or animations
    audioPlayer.stop();

    // Capture the current spin angle BEFORE anything changes
    const currentAngle = getPlatterRotation();

    const section = getSectionById(discId);
    const platter = getPlatterCenter();
    setFlyingImage(section.discImage);
    setFlyingDiscId(discId);
    setFlyingZIndex(999);
    flyingControls.set({
      x: platter.x,
      y: platter.y,
      scale: 1,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
    });
    setFlyingVisible(true);

    // Apply the captured rotation to the flying disc image so it matches
    requestAnimationFrame(() => {
      if (flyingImgRef.current) {
        flyingImgRef.current.style.transform = `rotate(${currentAngle}deg)`;
      }
    });

    // Now safe to change flow — Turntable disc will hide but flying disc covers it
    setFlow("deselecting");

    // Wait for tonearm to lift
    await new Promise(r => setTimeout(r, 450));

    // Animate disc back to stack
    await animateToStack(discId);

    dispatch({ type: "DESELECT_DISC" });
    setPlatterDiscId(null);
    setFlow("idle");
  }, [platterDiscId, dispatch, animateToStack, flyingControls, getPlatterCenter, getSlotSize, getPlatterRotation, audioPlayer]);

  // --- SWAP ---
  const doSwap = useCallback(async (newDiscId: SectionId) => {
    if (!platterDiscId) return;
    const oldId = platterDiscId;

    // STOP AUDIO IMMEDIATELY - before any state changes or animations
    audioPlayer.stop();

    // Capture the current spin angle BEFORE anything changes
    const currentAngle = getPlatterRotation();

    const oldSection = getSectionById(oldId);
    const platter = getPlatterCenter();
    setFlyingImage(oldSection.discImage);
    setFlyingDiscId(oldId);
    setFlyingZIndex(999);
    flyingControls.set({
      x: platter.x,
      y: platter.y,
      scale: 1,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
    });
    setFlyingVisible(true);

    // Apply the captured rotation to the flying disc image so it matches
    requestAnimationFrame(() => {
      if (flyingImgRef.current) {
        flyingImgRef.current.style.transform = `rotate(${currentAngle}deg)`;
      }
    });

    // Now safe to change flow — flying disc covers the Turntable disc
    setFlow("swapping-out");

    // Wait for tonearm to lift
    await new Promise(r => setTimeout(r, 450));

    // Old disc leaves platter → returns to its stack slot
    await animateToStack(oldId);

    // Dispatch deselect so old disc reappears in stack
    dispatch({ type: "DESELECT_DISC" });
    setPlatterDiscId(null);

    // Small pause between discs for choreography
    await new Promise(r => setTimeout(r, 100));

    // New disc enters
    setFlow("swapping-in");
    setPlatterDiscId(newDiscId);
    dispatch({ type: "SELECT_DISC", discId: newDiscId });

    await animateToPlatter(newDiscId);

    // Overlap: set flow to playing first, then hide flying disc after a frame
    dispatch({ type: "ANIMATION_COMPLETE" });
    setFlow("playing");

    requestAnimationFrame(() => {
      setFlyingVisible(false);
    });
  }, [platterDiscId, dispatch, animateToStack, animateToPlatter, flyingControls, getPlatterCenter, getSlotSize, getPlatterRotation, audioPlayer]);

  // --- CLICK HANDLER ---
  const handleDiscSelect = useCallback(
    (sectionId: SectionId, _rect: DOMRect) => {
      // Ignore clicks during animations
      if (flow !== "idle" && flow !== "playing") return;

      if (flow === "idle") {
        doSelect(sectionId);
      } else if (flow === "playing") {
        if (sectionId === platterDiscId) {
          doDeselect();
        } else {
          doSwap(sectionId);
        }
      }
    },
    [flow, platterDiscId, doSelect, doDeselect, doSwap]
  );

  // --- DERIVED STATE ---
  const tonearmReady = flow === "playing";
  const showPlatterDisc = flow === "playing";

  // Hide the disc that's currently flying or on the platter
  let hiddenDiscId: SectionId | undefined;
  if (flow === "selecting" || flow === "swapping-in") {
    // During swapping-in, hide the NEW disc only after we've set platterDiscId
    // But we need to allow animateToPlatter to read its position first
    hiddenDiscId = platterDiscId ?? undefined;
  } else if (flow === "deselecting" || flow === "swapping-out") {
    hiddenDiscId = platterDiscId ?? undefined;
  }

  return (
    <>
      {/* Loading screen while CSS variables are being applied */}
      {!layoutReady && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: TOKENS.colors.background,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '12px',
            color: TOKENS.colors.textPrimary,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            Loading...
          </div>
        </div>
      )}
      
      {/* Intro Screen */}
      {layoutReady && showIntro && <IntroScreen onDiscClick={handleIntroDiscClick} />}

      {/* Main Content - scrollable container */}
      <div
        ref={mainContentRef}
        style={{
          minHeight: "100vh",
          width: "100vw",
          position: "relative",
        }}
      >
        <div
          style={{
            overflow: window.innerWidth <= 900 ? "visible" : "hidden",
            minHeight: "100vh",
            width: "100vw",
            backgroundColor: TOKENS.colors.background,
            position: "relative",
            paddingTop: window.innerWidth <= 900 ? "3vh" : "0",
            paddingBottom: window.innerWidth <= 900 ? "10vh" : "0",
          }}
        >
          {/* Aurora Glow - at the very back, z-index 0 */}
          <AuroraGlow
            sectionId={platterDiscId}
            visible={flow === "playing" && platterDiscId !== null}
          />

          <motion.div 
            animate={turntableControls}
            style={{ 
              position: "absolute", 
              top: "var(--turntable-top)", 
              left: "var(--turntable-left)", 
              zIndex: 1,
              opacity: showMainElements ? 1 : 0,
              willChange: "transform, opacity",
              transform: "translateZ(0)", // Force hardware acceleration
            }}
          >
            <Turntable
              platterRef={platterRef}
              showDisc={showPlatterDisc}
              tonearmReady={tonearmReady}
            />
          </motion.div>

          <motion.div 
            animate={stackControls}
            style={{ 
              position: "absolute", 
              top: "var(--disc-stack-top)", 
              bottom: 0, 
              right: "var(--disc-stack-right)", 
              display: "flex", 
              alignItems: "center",
              opacity: showMainElements ? 1 : 0,
              willChange: "transform, opacity",
              transform: "translateZ(0)", // Force hardware acceleration
            }}
          >
            <DiscStack
              ref={stackRef}
              onDiscSelect={handleDiscSelect}
              hiddenDiscId={hiddenDiscId}
            />
          </motion.div>

          {/* Music Player — visible when disc is playing, stays visible after first play */}
          <div style={{
            position: "absolute",
            top: "var(--music-player-top)",
            left: "var(--music-player-left)",
            transform: "translateX(-50%)",
            width: "var(--info-panel-width)",
            zIndex: 51,
            pointerEvents: "auto",
            opacity: showPersistentUI ? 1 : 0,
            transition: "opacity 0.6s ease-in-out",
          }}>
            <MusicPlayer />
          </div>

          {/* Scroll panel — only visible when playing */}
          <InfoPanel
            sectionId={platterDiscId ?? "about"}
            visible={flow === "playing" && platterDiscId !== null}
          />

          {/* Social Icons — stays visible after first play */}
          <div style={{
            position: "absolute",
            bottom: window.innerWidth <= 900 ? "auto" : "var(--social-bottom)",
            top: window.innerWidth <= 900 ? "var(--social-top)" : "auto",
            left: "var(--social-left)",
            transform: "translateX(-50%)",
            zIndex: 50,
            pointerEvents: "auto",
            opacity: showPersistentUI ? 1 : 0,
            transition: "opacity 0.6s ease-in-out",
          }}>
            <SocialIcons />
          </div>

          {/* Single persistent flying disc element — animated imperatively */}
          <motion.div
            ref={flyingRef}
            animate={flyingControls}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              translateX: "-50%",
              translateY: "-50%",
              zIndex: flyingZIndex,
              pointerEvents: "none",
              display: flyingVisible ? "block" : "none",
              width: "var(--disc-size)", // Use CSS variable for consistent size
              height: "var(--disc-size)",
              willChange: "transform, opacity",
              transform: "translateZ(0)", // Force hardware acceleration
            }}
          >
            {flyingImage && (
              <img ref={flyingImgRef} src={flyingImage} alt="" style={getImgStyle(flyingDiscId)} />
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TurntableProvider>
        <AppContent />
      </TurntableProvider>
    </ErrorBoundary>
  );
}

export default App;
