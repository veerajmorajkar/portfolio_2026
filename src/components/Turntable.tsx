import { memo, useEffect, useState } from "react";
import { useTurntable } from "../context/TurntableContext";
import { getSectionById } from "../data/sections";
import VinylRecord from "./VinylRecord";
import TonearmAssembly, { deriveTonearmState } from "./TonearmAssembly";
import { PixelSlider } from "./PixelSlider";
import { NowPlaying } from "./NowPlaying";
import { TOKENS } from "../data/tokens";

interface TurntableProps {
  platterRef?: React.RefObject<HTMLDivElement>;
  showDisc?: boolean;
  tonearmReady?: boolean;
}

/*
 * Slider track positions (% of turntable image):
 *   Upper-left:  x 52.9%–60.3%, y 67.5%  → Volume
 *   Upper-right: x 62.4%–68.2%, y 67.5%  → Low-pass filter
 *   Lower-left:  x 52.9%–60.3%, y 70.9%  → Reverb
 *   Lower-right: x 62.4%–68.2%, y 70.9%  → Delay
 *
 * The image renders with objectFit:contain at width=100% of the
 * 200vh container, so these % map directly to CSS left/top on the
 * container (adjusted for the image's aspect ratio for top).
 *
 * Image aspect ratio: 4864 / 3492 ≈ 1.3929
 * Rendered height = width / 1.3929
 * So top % relative to container = (img_y% * rendered_height) / container_width
 *                                 = img_y% / 1.3929
 * But since the container has no explicit height and the image sets it,
 * we position relative to the image dimensions using % of width for left
 * and the image's own coordinate system for top.
 */

// Image is 4864 wide × 3492 tall. Positions as % of width:
const SLIDER_TRACKS = {
  upperLeft:  { left: "51.2%", top: "46.45%", width: "18.5%" }, // Slightly reduced from 19%
  upperRight: { left: "66.05%", top: "40.5%", width: "5.80%", height: "23.5%" }, // Slightly reduced from 24%
  lowerLeft:  { left: "52.9%", top: "50.90%", width: "7.2%" }, // Slightly reduced from 7.36%
  lowerRight: { left: "62.4%", top: "50.90%", width: "5.6%" }, // Slightly reduced from 5.80%
} as const;

// top values: image y% * (3492/4864) = image y% * 0.7180
// 67.50% * 0.7180 = 48.47%
// 70.93% * 0.7180 = 50.93%

const TurntableComponent: React.FC<TurntableProps> = ({
  platterRef,
  showDisc = true,
  tonearmReady = false,
}) => {
  const { state, dispatch } = useTurntable();
  const { activeDiscId, playbackState, volume, effectLevel } = state;

  const activeSection = activeDiscId ? getSectionById(activeDiscId) : null;
  const tonearmState = tonearmReady ? deriveTonearmState(playbackState) : "parked";
  const isSpinning = playbackState === "playing" && tonearmReady;
  
  // Calculate knob size more reliably - wait for CSS to be ready
  const [knobSize, setKnobSize] = useState(74);
  const [cssReady, setCssReady] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    
    const calculateKnobSize = () => {
      const knobSizeStr = getComputedStyle(document.documentElement)
        .getPropertyValue('--knob-size')
        .trim();
      
      if (knobSizeStr && knobSizeStr !== '') {
        const knobSizeVh = parseFloat(knobSizeStr);
        const size = (knobSizeVh * window.innerHeight) / 100;
        if (mounted) {
          setKnobSize(size);
          setCssReady(true);
        }
      } else {
        // Retry if CSS variable isn't ready
        setTimeout(calculateKnobSize, 50);
      }
    };
    
    // Calculate on mount with small delay
    setTimeout(calculateKnobSize, 100);
    
    // Recalculate on resize
    const handleResize = () => {
      if (cssReady) {
        const knobSizeVh = parseFloat(
          getComputedStyle(document.documentElement)
            .getPropertyValue('--knob-size')
            .trim()
        );
        const size = (knobSizeVh * window.innerHeight) / 100;
        setKnobSize(size);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
    };
  }, [cssReady]);
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
  
  // Calculate precise transform for volume slider based on screen height
  const getVolumeSliderTransform = () => {
    if (typeof window === 'undefined') return "translateY(calc(var(--turntable-width) * 0.14))";
    
    if (!isMobile) {
      return "translateY(calc(var(--turntable-width) * 0.14))";
    }
    
    const screenHeight = window.innerHeight;
    
    // iPhone 12 and similar (6.1" - around 844px height)
    if (screenHeight >= 800 && screenHeight <= 900) {
      return "translateY(calc(var(--turntable-width) * 0.138))"; // Fine-tune position
    }
    // Smaller phones
    else if (screenHeight < 700) {
      return "translateY(calc(var(--turntable-width) * 0.130))";
    }
    // Default mobile
    else {
      return "translateY(calc(var(--turntable-width) * 0.135))";
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "var(--turntable-width)",
      }}
      data-testid="turntable"
    >
      <img
        src={TOKENS.images.turntable}
        alt="Turntable"
        data-testid="plinth-base"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          imageRendering: "pixelated",
          display: "block",
          filter: "contrast(1.05)",
        }}
        draggable={false}
      />

      <div
        ref={platterRef}
        style={{
          position: "absolute",
          top: "4.85%",
          left: "19.15%",
          width: "55%",
          aspectRatio: "1 / 1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        data-testid="central-platter"
      >
        {activeSection && showDisc && (
          <div style={{
            width: "var(--disc-size)",
            height: "var(--disc-size)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <VinylRecord
              isSpinning={isSpinning}
              sectionTitle={activeSection.title}
              color={activeSection.discColor}
              discImage={activeSection.discImage}
            />
          </div>
        )}
      </div>

      <TonearmAssembly
        state={tonearmState}
        transitionDuration={TOKENS.animation.tonearmTransition}
      />

      {/* Slider overlays on the turntable's track grooves */}
      {/* Volume — upper-left track */}
      <div style={{
        position: "absolute",
        left: SLIDER_TRACKS.upperLeft.left,
        top: SLIDER_TRACKS.upperLeft.top,
        width: SLIDER_TRACKS.upperLeft.width,
        transform: getVolumeSliderTransform(),
      }}>
        <PixelSlider
          value={volume}
          onChange={(v) => dispatch({ type: "SET_VOLUME", volume: v })}
          label="Volume"
          knobWidth={knobSize}
          knobRotation={90}
        />
      </div>

      {/* Filter — upper-right track */}
      <div style={{
        position: "absolute",
        left: SLIDER_TRACKS.upperRight.left,
        top: SLIDER_TRACKS.upperRight.top,
        height: SLIDER_TRACKS.upperRight.height,
        transform: "translateX(-50%)",
      }}>
        <PixelSlider
          value={effectLevel}
          onChange={(v) => dispatch({ type: "SET_EFFECT_LEVEL", level: v })}
          label="Filter"
          orientation="vertical"
          knobWidth={knobSize}
        />
      </div>

      {/* Now Playing display at bottom */}
      <NowPlaying 
        sectionId={activeDiscId} 
        isPlaying={playbackState === "playing"} 
      />
    </div>
  );
};

export const Turntable = memo(TurntableComponent);
