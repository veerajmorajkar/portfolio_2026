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
  const knobRef = useRef<HTMLImageElement>(null);
  const [dragging, setDragging] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);

  const isHorizontal = orientation === "horizontal";
  const knobHeight = knobWidth / KNOB_ASPECT;

  const clamp = (v: number) => Math.max(0, Math.min(1, v));

  // Wait for layout to be completely ready before showing knob
  useEffect(() => {
    let mounted = true;
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkLayout = () => {
      if (!mounted || attempts >= maxAttempts) {
        if (mounted) setLayoutReady(true); // Show anyway after max attempts
        return;
      }
      
      attempts++;
      
      requestAnimationFrame(() => {
        if (!mounted || !trackRef.current) return;
        
        // Verify the track has actual dimensions
        const rect = trackRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Wait one more frame to ensure everything is painted
          requestAnimationFrame(() => {
            if (mounted) {
              setLayoutReady(true);
            }
          });
        } else {
          // Retry if dimensions aren't ready yet
          setTimeout(checkLayout, 50);
        }
      });
    };
    
    // Start checking after a small delay to let CSS settle
    setTimeout(checkLayout, 100);
    
    return () => {
      mounted = false;
    };
  }, []);

  // Update knob position when value changes or layout becomes ready
  useEffect(() => {
    if (!layoutReady || !knobRef.current || !trackRef.current) return;
    
    const track = trackRef.current;
    const knob = knobRef.current;
    const rect = track.getBoundingClientRect();
    
    const knobDim = isHorizontal ? knobWidth : knobHeight;
    const trackDim = isHorizontal ? rect.width : rect.height;
    const usableSpace = trackDim - knobDim;
    
    if (usableSpace <= 0) return;
    
    const position = value * usableSpace;
    
    if (isHorizontal) {
      knob.style.left = `${position}px`;
    } else {
      knob.style.top = `${(1 - value) * usableSpace}px`;
    }
  }, [value, layoutReady, isHorizontal, knobWidth, knobHeight]);

  const getValueFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (!track) return value;
      const rect = track.getBoundingClientRect();
      const knobDim = isHorizontal ? knobWidth : knobHeight;
      const trackLen = isHorizontal ? rect.width : rect.height;
      const usable = trackLen - knobDim;
      if (usable <= 0) return 0.5;

      if (isHorizontal) {
        const pos = clientX - rect.left - knobDim / 2;
        return clamp(pos / usable);
      } else {
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
      {/* Knob image - hidden until layout is ready */}
      <img
        ref={knobRef}
        src={KNOB_SRC}
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          left: isHorizontal ? 0 : undefined,
          top: !isHorizontal ? 0 : undefined,
          width: `${knobWidth}px`,
          height: `${knobHeight}px`,
          imageRendering: "pixelated",
          pointerEvents: "none",
          transform: knobRotation ? `rotate(${knobRotation}deg)` : undefined,
          filter: dragging ? "brightness(1.15)" : "none",
          opacity: layoutReady ? 1 : 0,
          transition: layoutReady 
            ? (dragging ? "filter 0.15s" : "filter 0.15s, opacity 0.3s ease-out") 
            : "none",
          willChange: dragging ? "filter" : "auto",
        }}
      />
    </div>
  );
};

export const PixelSlider = memo(PixelSliderComponent);
