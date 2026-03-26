import { useRef, useEffect, memo } from "react";
import type { VinylRecordProps } from "../types/index";
import { TOKENS } from "../data/tokens";

const SPIN_DURATION = 60 / TOKENS.animation.spinRpm;

/**
 * Ultra-optimized spinning disc with CSS animations for buttery smooth performance
 */
const VinylRecordComponent: React.FC<VinylRecordProps> = ({ isSpinning, sectionTitle, discImage, color }) => {
  const discRef = useRef<HTMLDivElement>(null);
  
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
      // Use CSS animation for ultra-smooth spinning
      el.style.animation = `spin ${SPIN_DURATION}s linear infinite`;
      el.style.willChange = "transform";
    } else {
      // When paused, stop animation and maintain current rotation
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
      
      // Remove animation and set fixed rotation
      el.style.animation = "none";
      el.style.transform = `rotate(${currentRotation}deg)`;
      el.style.willChange = "auto";
    }
  }, [isSpinning, baseRotation]);

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
        transform: `rotate(${baseRotation}deg)`,
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        perspective: 1000,
        WebkitPerspective: 1000,
      }}
    />
  );
};

const VinylRecord = memo(VinylRecordComponent);
export default VinylRecord;
