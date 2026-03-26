import { useRef, useEffect, memo } from "react";
import type { VinylRecordProps } from "../types/index";
import { TOKENS } from "../data/tokens";

const SPIN_DURATION = 60 / TOKENS.animation.spinRpm;

/**
 * A single square div that spins. The disc image is rendered as a
 * background-image so it's always visually centered. The div itself
 * is forced to be a perfect square via inline width + height in vw units.
 */
const VinylRecordComponent: React.FC<VinylRecordProps> = ({ isSpinning, sectionTitle, discImage, color }) => {
  const discRef = useRef<HTMLDivElement>(null);
  const pausedRotationRef = useRef<number>(0);
  const animationIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Check disc type and apply base rotation
  const isAboutDisc = color === "#30D5C8";
  const isProjectsDisc = color === "#5CF64A";
  const isEducationDisc = color === "#624CAB";
  const isSkillsDisc = color === "#ca2c92";
  
  let baseRotation = 0;
  if (isAboutDisc) baseRotation = 35;
  else if (isProjectsDisc) baseRotation = 20;
  else if (isEducationDisc) baseRotation = 15;
  else if (isSkillsDisc) baseRotation = 15;

  useEffect(() => {
    const el = discRef.current;
    if (!el) return;

    if (isSpinning) {
      // Start spinning from the paused rotation
      const startRotation = pausedRotationRef.current;
      startTimeRef.current = performance.now();
      
      const animate = (currentTime: number) => {
        if (!el || !startTimeRef.current) return;
        
        const elapsed = (currentTime - startTimeRef.current) / 1000; // seconds
        const degreesPerSecond = 360 / SPIN_DURATION;
        const currentRotation = startRotation + (elapsed * degreesPerSecond);
        
        el.style.transform = `rotate(${currentRotation}deg)`;
        
        animationIdRef.current = requestAnimationFrame(animate);
      };
      
      animationIdRef.current = requestAnimationFrame(animate);
      el.style.willChange = "transform";
      
    } else {
      // When paused, stop the animation and store current rotation
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      
      // Get the current rotation from the transform
      const computedStyle = window.getComputedStyle(el);
      const matrix = computedStyle.transform;
      
      let currentRotation = baseRotation;
      if (matrix && matrix !== "none") {
        const values = matrix.match(/matrix\((.+)\)/)?.[1]?.split(",").map(Number);
        if (values && values.length >= 6) {
          const [a, b] = values;
          currentRotation = Math.atan2(b, a) * (180 / Math.PI);
        }
      }
      
      // Store the paused rotation
      pausedRotationRef.current = currentRotation;
      
      // Keep the disc at current rotation
      el.style.transform = `rotate(${currentRotation}deg)`;
      el.style.willChange = "auto";
    }
    
    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isSpinning, baseRotation]);
  
  // Reset paused rotation when disc changes
  useEffect(() => {
    pausedRotationRef.current = baseRotation;
  }, [color, baseRotation]);

  return (
    <div
      ref={discRef}
      data-testid="vinyl-record"
      role="img"
      aria-label={`${sectionTitle} vinyl record`}
      style={{
        width: "100%",
        height: "100%",
        backgroundImage: `url(${discImage})`,
        backgroundSize: "contain",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
        transformOrigin: "center center",
        transform: "translateZ(0)", // Force GPU acceleration
        backfaceVisibility: "hidden", // Optimize rendering
      }}
    />
  );
};

const VinylRecord = memo(VinylRecordComponent);
export default VinylRecord;
