import { useRef, useImperativeHandle, forwardRef, memo, useCallback } from "react";
import { Disc, deriveDiscVisualState } from "./Disc";
import { useTurntable } from "../context/TurntableContext";
import { SECTIONS } from "../data/sections";
import type { SectionId } from "../types";

const DISC_POSITIONS: { top: string; right: string; size: string; zIndex: number }[] = [
  { top: "-12%", right: "-35%", size: "var(--disc-size)", zIndex: 1 },
  { top: "13%",  right: "-40%", size: "var(--disc-size)", zIndex: 2 },
  { top: "35%",  right: "-37%", size: "var(--disc-size)", zIndex: 3 },
  { top: "60%",  right: "-34%", size: "var(--disc-size)", zIndex: 4 },
  { top: "84%",  right: "-29%", size: "var(--disc-size)", zIndex: 5 },
];

// Mobile-specific disc positions for better text visibility
const DISC_POSITIONS_MOBILE: { top: string; right: string; size: string; zIndex: number }[] = [
  { top: "-8%", right: "-25%", size: "var(--disc-size)", zIndex: 1 },
  { top: "15%",  right: "-28%", size: "var(--disc-size)", zIndex: 2 },
  { top: "38%",  right: "-26%", size: "var(--disc-size)", zIndex: 3 },
  { top: "61%",  right: "-24%", size: "var(--disc-size)", zIndex: 4 },
  { top: "84%",  right: "-22%", size: "var(--disc-size)", zIndex: 5 },
];

export interface DiscStackHandle {
  getSlotRect: (sectionId: SectionId) => DOMRect | null;
  getSlotZIndex: (sectionId: SectionId) => number;
}

interface DiscStackProps {
  onDiscSelect?: (sectionId: SectionId, rect: DOMRect) => void;
  hiddenDiscId?: SectionId | null;
}

const DiscStackComponent = forwardRef<DiscStackHandle, DiscStackProps>(
  ({ onDiscSelect, hiddenDiscId }, ref) => {
    const { state, dispatch } = useTurntable();
    const slotRefs = useRef<Map<SectionId, HTMLDivElement>>(new Map());
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
    const positions = isMobile ? DISC_POSITIONS_MOBILE : DISC_POSITIONS;

    useImperativeHandle(ref, () => ({
      getSlotRect: (sectionId: SectionId) => {
        const el = slotRefs.current.get(sectionId);
        return el ? el.getBoundingClientRect() : null;
      },
      getSlotZIndex: (sectionId: SectionId) => {
        const idx = SECTIONS.findIndex(s => s.id === sectionId);
        return idx >= 0 ? positions[idx].zIndex : 1;
      },
    }), [positions]);

    const handleDiscClick = useCallback((sectionId: SectionId) => {
      const el = slotRefs.current.get(sectionId);
      if (el && onDiscSelect) {
        const rect = el.getBoundingClientRect();
        onDiscSelect(sectionId, rect);
      } else {
        dispatch({ type: "SELECT_DISC", discId: sectionId });
      }
    }, [onDiscSelect, dispatch]);

    return (
      <div
        style={{
          position: "relative",
          width: "clamp(250px, calc(35vw * var(--scale-factor)), 500px)",
          height: "clamp(500px, calc(85vh * var(--scale-factor)), 950px)",
        }}
        data-testid="disc-stack"
      >
        {SECTIONS.map((section, i) => {
          const { isActive, isMuted } = deriveDiscVisualState(
            section.id,
            state.activeDiscId
          );
          const pos = positions[i];
          const isHidden = section.id === hiddenDiscId;

          return (
            <div
              key={section.id}
              ref={(el) => {
                if (el) slotRefs.current.set(section.id, el);
              }}
              data-slot={section.id}
              style={{
                position: "absolute",
                top: pos.top,
                right: pos.right,
                width: pos.size,
                height: pos.size,
                zIndex: pos.zIndex,
                visibility: isHidden ? "hidden" : "visible",
              }}
            >
              <Disc
                sectionId={section.id}
                color={section.discColor}
                discImage={section.discImage}
                label={section.title}
                isActive={isActive}
                isMuted={isMuted}
                onClick={handleDiscClick}
              />
            </div>
          );
        })}
      </div>
    );
  }
);

DiscStackComponent.displayName = "DiscStack";
export const DiscStack = memo(DiscStackComponent);
