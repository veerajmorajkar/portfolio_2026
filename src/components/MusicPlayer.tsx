import { useState, useEffect, memo } from "react";
import { useTurntable } from "../context/TurntableContext";
import { getSectionById } from "../data/sections";

const fontPixel = "'Press Start 2P', monospace";

/* ── Pixel-art control icons ── */
function SkipBackIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ imageRendering: "pixelated" }}>
      {/* First triangle pointing left */}
      <rect x="4" y="14" width="2" height="4" fill="currentColor"/>
      <rect x="6" y="12" width="2" height="8" fill="currentColor"/>
      <rect x="8" y="10" width="2" height="12" fill="currentColor"/>
      <rect x="10" y="8" width="2" height="16" fill="currentColor"/>
      <rect x="12" y="6" width="2" height="20" fill="currentColor"/>
      {/* Second triangle pointing left */}
      <rect x="14" y="14" width="2" height="4" fill="currentColor"/>
      <rect x="16" y="12" width="2" height="8" fill="currentColor"/>
      <rect x="18" y="10" width="2" height="12" fill="currentColor"/>
      <rect x="20" y="8" width="2" height="16" fill="currentColor"/>
      <rect x="22" y="6" width="2" height="20" fill="currentColor"/>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ imageRendering: "pixelated" }}>
      {/* Pixel-art triangle pointing right */}
      <rect x="10" y="6" width="2" height="24" fill="currentColor"/>
      <rect x="12" y="8" width="2" height="20" fill="currentColor"/>
      <rect x="14" y="10" width="2" height="16" fill="currentColor"/>
      <rect x="16" y="12" width="2" height="12" fill="currentColor"/>
      <rect x="18" y="14" width="2" height="8" fill="currentColor"/>
      <rect x="20" y="16" width="2" height="4" fill="currentColor"/>
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ imageRendering: "pixelated" }}>
      {/* Two vertical bars */}
      <rect x="11" y="8" width="4" height="20" fill="currentColor"/>
      <rect x="21" y="8" width="4" height="20" fill="currentColor"/>
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ imageRendering: "pixelated" }}>
      {/* First triangle pointing right */}
      <rect x="6" y="6" width="2" height="20" fill="currentColor"/>
      <rect x="8" y="8" width="2" height="16" fill="currentColor"/>
      <rect x="10" y="10" width="2" height="12" fill="currentColor"/>
      <rect x="12" y="12" width="2" height="8" fill="currentColor"/>
      <rect x="14" y="14" width="2" height="4" fill="currentColor"/>
      {/* Second triangle pointing right */}
      <rect x="16" y="6" width="2" height="20" fill="currentColor"/>
      <rect x="18" y="8" width="2" height="16" fill="currentColor"/>
      <rect x="20" y="10" width="2" height="12" fill="currentColor"/>
      <rect x="22" y="12" width="2" height="8" fill="currentColor"/>
      <rect x="24" y="14" width="2" height="4" fill="currentColor"/>
    </svg>
  );
}


const MusicPlayerComponent: React.FC = () => {
  const { state, dispatch, audioPlayer } = useTurntable();
  const { activeDiscId, playbackState } = state;
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const section = activeDiscId ? getSectionById(activeDiscId) : null;
  const isPlaying = playbackState === "playing" && section !== null;

  // Update progress from actual audio player
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime(audioPlayer.getCurrentTime());
      setDuration(audioPlayer.getDuration());
    }, 100); // Update every 100ms for smooth progress
    return () => clearInterval(interval);
  }, [isPlaying, audioPlayer]);

  useEffect(() => {
    if (section) {
      setDuration(audioPlayer.getDuration());
      setCurrentTime(audioPlayer.getCurrentTime());
    }
  }, [section, audioPlayer]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    if (!section) return;
    if (isPlaying) {
      dispatch({ type: "SET_PLAYBACK", state: "paused" });
    } else {
      dispatch({ type: "SET_PLAYBACK", state: "playing" });
    }
  };

  const handleSkip = (seconds: number) => {
    if (!section) return;
    const newTime = audioPlayer.getCurrentTime() + seconds;
    audioPlayer.seek(newTime);
    setCurrentTime(newTime);
  };

  return (
    <div style={{
      textAlign: "left",
    }}>
      {/* Name */}
      <div style={{
        fontFamily: fontPixel,
        fontSize: "clamp(16px, 1.4vw, 24px)",
        color: "#ffffff",
        letterSpacing: "4px",
        marginBottom: "6px",
        textShadow: "2px 2px 0px #000000",
      }}>
        VEERAJ MORAJKAR
      </div>

      {/* Subtext */}
      <div style={{
        fontFamily: fontPixel,
        fontSize: "clamp(7px, 0.6vw, 10px)",
        color: "#888888",
        letterSpacing: "2px",
        marginBottom: "16px",
      }}>
        DEVELOPER & DESIGNER
      </div>

      {/* Progress bar */}
      <div style={{
        marginBottom: "8px",
      }}>
        <div style={{
          height: "8px",
          background: "#222222",
          border: "1.5px solid #ffffff",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${progress}%`,
            background: "#ffffff",
            transition: "width 0.3s linear",
          }} />
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "6px",
          fontFamily: fontPixel,
          fontSize: "clamp(6px, 0.5vw, 8px)",
          color: "#888888",
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls - pixel art icons */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "clamp(12px, 1vw, 20px)",
        marginTop: "-8px",
        transform: `scale(var(--scale-factor))`,
      }}>
        {/* Previous (skip -10s) */}
        <button
          onClick={() => handleSkip(-10)}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.1s, transform 0.1s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#aaaaaa"; e.currentTarget.style.transform = "scale(1.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <SkipBackIcon />
        </button>

        {/* Play/Pause */}
        <button
          onClick={handlePlayPause}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.1s, transform 0.1s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#aaaaaa"; e.currentTarget.style.transform = "scale(1.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Next (skip +10s) */}
        <button
          onClick={() => handleSkip(10)}
          style={{
            background: "transparent",
            border: "none",
            color: "#ffffff",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.1s, transform 0.1s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#aaaaaa"; e.currentTarget.style.transform = "scale(1.15)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          <SkipForwardIcon />
        </button>
      </div>
    </div>
  );
};

export const MusicPlayer = memo(MusicPlayerComponent);
