import { memo } from "react";
import type { TonearmAssemblyProps, PlaybackState } from "../types/index";
import { TOKENS } from "../data/tokens";

export function deriveTonearmState(
  playbackState: PlaybackState
): "parked" | "playing" {
  return playbackState === "playing" ? "playing" : "parked";
}

const PARKED_ANGLE = 85;
const PLAYING_ANGLE = 105;

const TonearmAssemblyComponent: React.FC<TonearmAssemblyProps> = ({
  state,
  transitionDuration = TOKENS.animation.tonearmTransition,
}) => {
  const angle = state === "playing" ? PLAYING_ANGLE : PARKED_ANGLE;

  return (
    <div
      style={{
        position: "absolute",
        top: "-0.6%",
        right: "14.6%",
        width: "27%",
        height: "56%",
        transformOrigin: "25% 48%",
        transform: `rotate(${angle}deg)`,
        // Springy overshoot easing for cartoony feel
        transition: `transform ${transitionDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
        zIndex: 10,
        pointerEvents: "none",
      }}
      data-testid="tonearm-assembly"
    >
      <img
        src={TOKENS.images.tonearm}
        alt="Tonearm"
        data-testid="tonearm-arm"
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
      <span data-testid="tonearm-head" style={{ display: "none" }} />
    </div>
  );
};

const TonearmAssembly = memo(TonearmAssemblyComponent);
export default TonearmAssembly;
