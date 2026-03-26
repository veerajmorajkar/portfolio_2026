import { createContext, useContext, useReducer, useRef, useEffect, type ReactNode } from "react";
import type { TurntableState, TurntableAction, SectionId } from "../types";
import { turntableReducer, INITIAL_STATE } from "./turntableReducer";
import { AudioPlayer } from "../services/AudioPlayer";

interface TurntableContextValue {
  state: TurntableState;
  dispatch: React.Dispatch<TurntableAction>;
  audioPlayer: AudioPlayer;
}

export const TurntableContext = createContext<TurntableContextValue | null>(
  null
);

export function TurntableProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(turntableReducer, INITIAL_STATE);
  const audioPlayerRef = useRef<AudioPlayer>(new AudioPlayer());
  const loadedDiscRef = useRef<SectionId | null>(null);

  // CRITICAL: Stop playback IMMEDIATELY when swap/deselect starts
  useEffect(() => {
    const player = audioPlayerRef.current;
    
    // Stop audio the moment we enter a transition state
    if (state.animationPhase === "swap" || state.animationPhase === "platter-to-stack") {
      player.stop();
    }
  }, [state.animationPhase]);

  // Handle disc loading and playback - runs AFTER animation phase effect
  useEffect(() => {
    const player = audioPlayerRef.current;
    
    // Don't do anything during transitions - let the animation phase effect handle stopping
    if (state.animationPhase === "swap" || state.animationPhase === "platter-to-stack") {
      return;
    }
    
    // Load new disc if it changed
    if (state.activeDiscId && state.activeDiscId !== loadedDiscRef.current) {
      loadedDiscRef.current = state.activeDiscId;
      player.load(state.activeDiscId).then(() => {
        // Only play if we're still in playing state and not in a transition
        if (state.playbackState === "playing" && state.animationPhase !== "swap" && state.animationPhase !== "platter-to-stack") {
          player.play();
        }
      });
    }
    // Handle play/pause for already loaded disc
    else if (state.activeDiscId === loadedDiscRef.current) {
      if (state.playbackState === "playing" && !player.isPlaying()) {
        player.play();
      } else if (state.playbackState === "paused" && player.isPlaying()) {
        player.pause();
      } else if (state.playbackState === "idle" && player.isPlaying()) {
        player.stop();
      }
    }
    // Clear loaded disc when no disc is active
    else if (!state.activeDiscId) {
      loadedDiscRef.current = null;
      player.stop();
    }
  }, [state.activeDiscId, state.playbackState, state.animationPhase]);

  // Apply volume and filter changes live
  useEffect(() => {
    const player = audioPlayerRef.current;
    player.setVolume(state.volume);
    player.setFilterCutoff(state.effectLevel);
  }, [state.volume, state.effectLevel]);

  return (
    <TurntableContext.Provider value={{ state, dispatch, audioPlayer: audioPlayerRef.current }}>
      {children}
    </TurntableContext.Provider>
  );
}

export function useTurntable(): TurntableContextValue {
  const context = useContext(TurntableContext);
  if (context === null) {
    throw new Error("useTurntable must be used within a TurntableProvider");
  }
  return context;
}

