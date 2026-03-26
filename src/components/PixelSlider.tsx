import { useRef, useCallback, useEffect, useState, memo } from "react";

interface PixelSliderProps {
  /** 0–1 normalized value */
  value: number;
  onChange: (value: number) => void;
  /** Accessible label */
  label: string;
  /** Orientation */
  orientation?: "horizontal" | "vertical";
  /** Track length in CSS units (e.g. "100%") */
  trackLength?: string;
  /** Knob width in px */
  knobWidth?: number;
  /** Rotate the knob image (degrees) */
  knobRotation?: number;
}

// Knob aspect ratio — update if the new asset has different dimensions
const KNOB_ASPECT = 1;
const KNOB_SRC = `${import.meta.env.BASE_URL}assets/images/knob.png`;

/**
 * A draggable pixel-art slider that uses the custom knob.png asset.
 * Overlays on top of the turntable image's existing slider grooves.
 */
const PixelSliderComponent: React.FC<PixelSliderProps> = ({
  value,
  onChange,
  label,
  orientation = "horizontal",
  trackLength = "100%",
  knobWidth = 30,
  knobRotation = 0,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isHorizontal = orientation === "horizontal";
  const knobHeight = knobWidth / KNOB_ASPECT;

  // Wait for component to mount and layout to complete
  useEffect(() => {
    // Use requestAnimationFrame to ensure layout is complete
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        setIsReady(true);
      });
      return () => cancelAnimationFrame(frame2);
    });
    return () => cancelAnimationFrame(frame1);
  }, []);

  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  const getValueFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (!track) return value;
      const rect = track.getBoundingClientRect();
      // The knob travels within [halfKnob .. trackLength - halfKnob]
      const knobDim = isHorizontal ? knobWidth : knobHeight;
      const trackLen = isHorizontal ? rect.width : rect.height;
      const usable = trackLen - knobDim;
      if (usable <= 0) return 0.5;

      if (isHorizontal) {
        const pos = clientX - rect.left - knobDim / 2;
        return clamp(pos / usable);
      } else {
        // Vertical: top = 1, bottom = 0
        const pos = clientY - rect.top - knobDim / 2;
        return clamp(1 - pos / usable);
      }
    },
    [isHorizontal, value, knobWidth, knobHeight]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onChange(getValueFromPointer(e.clientX, e.clientY));
    },
    [onChange, getValueFromPointer]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      onChange(getValueFromPointer(e.clientX, e.clientY));
    },
    [dragging, onChange, getValueFromPointer]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Keyboard support
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 0.1 : 0.02;
      if (
        (isHorizontal && e.key === "ArrowRight") ||
        (!isHorizontal && e.key === "ArrowUp")
      ) {
        e.preventDefault();
        onChange(clamp(value + step));
      } else if (
        (isHorizontal && e.key === "ArrowLeft") ||
        (!isHorizontal && e.key === "ArrowDown")
      ) {
        e.preventDefault();
        onChange(clamp(value - step));
      } else if (e.key === "Home") {
        e.preventDefault();
        onChange(0);
      } else if (e.key === "End") {
        e.preventDefault();
        onChange(1);
      }
    },
    [isHorizontal, value, onChange]
  );

  // Prevent body scroll while dragging on touch
  useEffect(() => {
    if (!dragging) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => document.removeEventListener("touchmove", prevent);
  }, [dragging]);

  // Knob slides from 0 to (track - knobSize), keeping it fully within the track
  const knobDim = isHorizontal ? knobWidth : knobHeight;
  
  // Calculate position - use pixel values for precision
  const getKnobPosition = () => {
    if (!isReady) {
      // Before ready, position at the correct spot but with opacity 0
      return isHorizontal
        ? `calc(${value * 100}% - ${value * knobDim}px)`
        : `calc(${(1 - value) * 100}% - ${(1 - value) * knobDim}px)`;
    }
    return isHorizontal
      ? `calc(${value * 100}% - ${value * knobDim}px)`
      : `calc(${(1 - value) * 100}% - ${(1 - value) * knobDim}px)`;
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)}
      aria-orientation={orientation}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        width: isHorizontal ? trackLength : `${knobWidth}px`,
        height: isHorizontal ? `${knobHeight}px` : trackLength,
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
      }}
    >
      {/* Knob image */}
      <img
        src={KNOB_SRC}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          [isHorizontal ? "left" : "top"]: getKnobPosition(),
          width: `${knobWidth}px`,
          height: `${knobHeight}px`,
          imageRendering: "pixelated",
          pointerEvents: "none",
          transform: knobRotation ? `rotate(${knobRotation}deg)` : undefined,
          filter: dragging ? "brightness(1.15)" : "none",
          opacity: isReady ? 1 : 0,
          transition: isReady ? (dragging ? "none" : "filter 0.15s, opacity 0.2s") : "opacity 0.2s",
        }}
      />
    </div>
  );
};

export const PixelSlider = memo(PixelSliderComponent);
