import { useEffect, useState, memo } from "react";
import type { SectionId } from "../types";
import { getSectionById } from "../data/sections";

interface NowPlayingProps {
  sectionId: SectionId | null;
  isPlaying: boolean;
}

const NowPlayingComponent: React.FC<NowPlayingProps> = ({ sectionId, isPlaying }) => {
  const [displaySong, setDisplaySong] = useState<string | null>(null);
  const [sectionColor, setSectionColor] = useState<string>("#FFFFFF");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (sectionId && isPlaying) {
      const section = getSectionById(sectionId);
      setDisplaySong(section.songName);
      setSectionColor(section.discColor);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => setDisplaySong(null), 400);
      return () => clearTimeout(timeout);
    }
  }, [sectionId, isPlaying]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "22.7%",
        left: "40%",
        zIndex: 100,
        pointerEvents: "none",
        width: "28%", // Percentage of turntable width
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-family)",
          fontSize: "calc(var(--turntable-width) * 0.0065)", // Scale with turntable
          textAlign: "right",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          color: sectionColor,
          textShadow: `0 0 12px ${sectionColor}CC, 0 0 25px ${sectionColor}66, 0 2px 6px rgba(0, 0, 0, 0.9)`,
          animation: displaySong && isAnimating 
            ? "pixelFadeIn 0.7s ease-out forwards"
            : displaySong
            ? "none"
            : "pixelFadeOut 0.5s ease-in forwards",
          opacity: displaySong ? 1 : 0,
          willChange: "transform, opacity, filter, letter-spacing",
          imageRendering: "pixelated",
        }}
      >
        <span style={{ fontSize: "1.8em", marginRight: "8px" }}>♪</span>
        {displaySong || ""}
      </div>
    </div>
  );
};

export const NowPlaying = memo(NowPlayingComponent);
