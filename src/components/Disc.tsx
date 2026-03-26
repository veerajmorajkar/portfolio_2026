import { useState, useRef, memo, useCallback } from "react";
import type { DiscProps, SectionId } from "../types/index";

export function deriveDiscVisualState(
  sectionId: SectionId,
  activeDiscId: SectionId | null
): { isActive: boolean; isMuted: boolean } {
  const isActive = sectionId === activeDiscId;
  const isMuted = activeDiscId === null || sectionId !== activeDiscId;
  return { isActive, isMuted };
}

const DiscComponent: React.FC<DiscProps> = ({
  sectionId,
  discImage,
  label,
  isActive,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);
  const discRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!discRef.current) return;
    
    const rect = discRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width / 2;
    
    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    
    if (distance <= radius * 0.95) {
      onClick(sectionId);
    }
  }, [onClick, sectionId]);
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(sectionId);
    }
  }, [onClick, sectionId]);

  if (isActive) return null;

  // Idle: gentle breathing. Hover: excited wiggle.
  const animation = hovered
    ? "discWiggle 0.4s ease-in-out infinite"
    : "discBreathe 2.5s ease-in-out infinite";

  // Rotate disc images to position graphics properly
  let imageRotation = "rotate(0deg)";
  
  // Only apply rotation on desktop/laptop screens (above tablet size)
  if (window.innerWidth > 900) {
    if (sectionId === "about") imageRotation = "rotate(35deg)";
    else if (sectionId === "projects") imageRotation = "rotate(20deg)";
    else if (sectionId === "education") imageRotation = "rotate(15deg)";
    else if (sectionId === "skills") imageRotation = "rotate(15deg)";
  }

  return (
    <div
      ref={discRef}
      role="button"
      tabIndex={0}
      aria-label={`Select ${label} section`}
      style={{
        width: "100%",
        height: "100%",
        cursor: "pointer",
        userSelect: "none",
        opacity: 1,
        animation,
        transition: "filter 0.2s",
        filter: hovered ? "brightness(1.1)" : "none",
        pointerEvents: "auto",
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-testid={`disc-${sectionId}`}
    >
      <img
        src={discImage}
        alt={`${label} disc`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
          transform: imageRotation,
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
        draggable={false}
      />
    </div>
  );
};

export const Disc = memo(DiscComponent);
