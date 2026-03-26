import type { TurntableState, TurntableAction } from "../types";

export const INITIAL_STATE: TurntableState = {
  activeDiscId: null,
  previousDiscId: null,
  playbackState: "idle",
  animationPhase: "none",
  volume: 0.7,
  effectLevel: 1.0, // Start with filter fully open (no dampening)
};

export function turntableReducer(
  state: TurntableState,
  action: TurntableAction
): TurntableState {
  switch (action.type) {
    case "SELECT_DISC":
      if (state.activeDiscId === action.discId) {
        // Clicking the active disc deselects it
        return {
          ...state,
          activeDiscId: null,
          previousDiscId: state.activeDiscId,
          playbackState: "idle",
          animationPhase: "platter-to-stack",
        };
      }
      if (state.activeDiscId !== null) {
        // Swap: return current disc, then load new one
        return {
          ...state,
          previousDiscId: state.activeDiscId,
          activeDiscId: action.discId,
          animationPhase: "swap",
          effectLevel: 1.0, // Reset filter to fully open for new disc
        };
      }
      // No active disc — simple selection
      return {
        ...state,
        activeDiscId: action.discId,
        previousDiscId: null,
        animationPhase: "disc-to-platter",
        effectLevel: 1.0, // Reset filter to fully open for new disc
      };

    case "DESELECT_DISC":
      return {
        ...state,
        activeDiscId: null,
        previousDiscId: state.activeDiscId,
        playbackState: "idle",
        animationPhase: "platter-to-stack",
      };

    case "ANIMATION_COMPLETE":
      return {
        ...state,
        animationPhase: "none",
        playbackState: state.activeDiscId ? "playing" : "idle",
      };

    case "SET_PLAYBACK":
      return { ...state, playbackState: action.state };

    case "SET_VOLUME":
      return { ...state, volume: Math.max(0, Math.min(1, action.volume)) };

    case "SET_EFFECT_LEVEL":
      return { ...state, effectLevel: Math.max(0, Math.min(1, action.level)) };

    case "AUDIO_ERROR":
      return state;

    default:
      return state;
  }
}
