// Helper to get asset path with correct base URL
const getAssetPath = (path: string) => {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.startsWith('/') ? path.slice(1) : path}`;
};

export const TOKENS = {
  colors: {
    background: "#000000",
    backgroundDark: "#0d0d1a",
    backgroundMid: "#16162a",
    surface: "#1e1e3a",
    surfaceLight: "#2a2a4a",
    accent1: "#D696B6",   // About / pink
    accent2: "#EC06ED",   // Education / magenta
    accent3: "#0086EC",   // Experience / blue
    accent4: "#00CFFE",   // Projects / cyan
    accentGreen: "#00EF8E",
    accentOrange: "#D0A660",
    textPrimary: "#DEFFEE",
    textSecondary: "#8899aa",
    textMuted: "#556677",
    woodGrain: "#3a2a1a",
    woodGrainLight: "#4a3a2a",
    metalLight: "#aabbcc",
    metalDark: "#667788",
    metalAccent: "#88aacc",
    platterRing: "#334455",
  },
  grid: {
    unit: 16, // px — base pixel grid
  },
  animation: {
    discToPlatter: 600,     // ms
    tonearmTransition: 400, // ms
    spinRpm: 33.3,          // revolutions per minute
  },
  font: {
    family: "'Rosea', 'Press Start 2P', 'Courier New', monospace",
  },
  breakpoints: {
    mobile: 768, // px
  },
  images: {
    turntable: getAssetPath("assets/images/turntable.png"),
    tonearm: getAssetPath("assets/images/turntable_arm.png"),
    knob: getAssetPath("assets/images/knob.png"),
  },
} as const;
