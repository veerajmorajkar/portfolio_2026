// --- State Types ---

export type SectionId = "about" | "education" | "experience" | "projects" | "skills";

export type PlaybackState = "idle" | "playing" | "paused";

export type AnimationPhase =
  | "none"
  | "disc-to-platter"
  | "platter-to-stack"
  | "swap";

export interface TurntableState {
  activeDiscId: SectionId | null;
  previousDiscId: SectionId | null;
  playbackState: PlaybackState;
  animationPhase: AnimationPhase;
  volume: number;          // 0–1
  effectLevel: number;     // 0–1
}

// --- Action Types ---

export type TurntableAction =
  | { type: "SELECT_DISC"; discId: SectionId }
  | { type: "DESELECT_DISC" }
  | { type: "ANIMATION_COMPLETE" }
  | { type: "SET_PLAYBACK"; state: PlaybackState }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_EFFECT_LEVEL"; level: number }
  | { type: "AUDIO_ERROR"; error: string };

// --- Component Props ---

export interface DiscProps {
  sectionId: SectionId;
  color: string;
  discImage: string;
  label: string;
  isActive: boolean;
  isMuted: boolean;
  onClick: (sectionId: SectionId) => void;
}

export interface VinylRecordProps {
  isSpinning: boolean;
  sectionTitle: string;
  color: string;
  discImage: string;
}

export interface LabelTextRingProps {
  text: string;
  fontSize: number;
}

export interface TonearmAssemblyProps {
  state: "parked" | "playing";
  transitionDuration: number;
}

export interface FaderProps {
  orientation: "horizontal" | "vertical";
  value: number;
  onChange: (value: number) => void;
  label: string;
  ariaLabel: string;
}

export interface PlaybackControlsProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
}

export interface InfoPanelProps {
  activeSectionId: SectionId | null;
}

// --- Section Content Data ---

export interface SectionData {
  id: SectionId;
  title: string;
  discColor: string;
  discImage: string;
  audioSrc: string;
  songName: string;
  content: AboutContent | EducationContent | ExperienceContent | ProjectsContent | SkillsContent;
}

export interface AboutContent {
  type: "about";
  avatar: string;
  name: string;
  title: string;
  links: { label: string; url: string }[];
  bio: string;
}

export interface EducationContent {
  type: "education";
  entries: { institution: string; degree: string; dateRange: string }[];
}

export interface ExperienceContent {
  type: "experience";
  entries: { company: string; role: string; description: string; dateRange: string }[];
}

export interface ProjectsContent {
  type: "projects";
  entries: { 
    name: string; 
    description: string; 
    links: { label: string; url: string }[];
    previewImage?: string;
  }[];
}

export interface SkillsContent {
  type: "skills";
  entries: { category: string; skills: string[] }[];
}

// --- Audio Player Service ---

export interface AudioPlayerService {
  load(sectionId: SectionId): Promise<void>;
  play(): void;
  pause(): void;
  stop(): void;
  setVolume(volume: number): void;
  setFilterCutoff(level: number): void;
  isPlaying(): boolean;
  onError(callback: (error: string) => void): void;
  getAudioData(): number;
  getMultiBandAudioData(): { kick: number; snare: number; hiHat: number; bass: number; combined: number };
}
