# Implementation Plan: Turntable Portfolio

## Overview

Build a single-frame React + Vite + TypeScript portfolio website with a turntable/vinyl record metaphor. Implementation proceeds bottom-up: design tokens and data models first, then state management, then individual components, then layout wiring, and finally styling and accessibility polish.

## Tasks

- [ ] 1. Scaffold project and define foundational types, tokens, and data
  - [x] 1.1 Initialize Vite + React + TypeScript project and install dependencies
    - Run `npm create vite@latest` with React-TS template
    - Install dev dependencies: `vitest`, `fast-check`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
    - Configure `vitest.config.ts` with jsdom environment
    - Add Rosea pixel font `@font-face` declaration with monospace fallback
    - Create directory structure: `src/components/`, `src/data/`, `src/context/`, `src/services/`, `src/styles/`, `src/types/`
    - _Requirements: 11.3_

  - [x] 1.2 Create TypeScript type definitions
    - Define `SectionId`, `PlaybackState`, `AnimationPhase`, `TurntableState`, `TurntableAction` in `src/types/index.ts`
    - Define `SectionData`, `AboutContent`, `EducationContent`, `ExperienceContent`, `ProjectsContent` content interfaces
    - Define component prop interfaces: `DiscProps`, `VinylRecordProps`, `LabelTextRingProps`, `TonearmAssemblyProps`, `FaderProps`, `PlaybackControlsProps`, `InfoPanelProps`
    - Define `AudioPlayerService` interface
    - _Requirements: 3.1, 6.1_

  - [x] 1.3 Create design tokens module
    - Create `src/data/tokens.ts` with colors, grid unit (16px), animation durations (600ms disc-to-platter, 400ms tonearm), font family, breakpoints (768px), and texture paths
    - _Requirements: 4.5, 8.4, 11.1, 11.4_

  - [x] 1.4 Create section data module
    - Create `src/data/sections.ts` with the `SECTIONS` array containing all 4 sections (about, education, experience, projects) with placeholder content, disc colors, and audio paths
    - _Requirements: 3.1, 3.2, 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 1.5 Write property tests for data integrity
    - **Property 6: All disc colors are unique**
    - **Validates: Requirements 3.2**
    - **Property 8: Section data lookup consistency**
    - **Validates: Requirements 6.1, 7.1**

- [ ] 2. Implement state management (Context + Reducer)
  - [x] 2.1 Implement turntable reducer and initial state
    - Create `src/context/turntableReducer.ts` with `turntableReducer` function and `INITIAL_STATE`
    - Handle all action types: `SELECT_DISC`, `DESELECT_DISC`, `ANIMATION_COMPLETE`, `SET_PLAYBACK`, `SET_VOLUME`, `SET_EFFECT_LEVEL`, `AUDIO_ERROR`
    - Implement volume/effect clamping via `Math.max(0, Math.min(1, value))`
    - Implement disc selection logic: new selection, re-click deselection, swap
    - _Requirements: 4.1, 4.4, 7.3, 9.2, 9.3, 13.1, 13.2, 13.3, 13.4_

  - [x] 2.2 Write property test: Reducer disc selection logic
    - **Property 4: Reducer disc selection logic**
    - **Validates: Requirements 4.1, 4.4, 7.3**

  - [x] 2.3 Write property test: Animation complete transitions
    - **Property 5: Animation complete transitions to playing**
    - **Validates: Requirements 4.2**

  - [x] 2.4 Write property test: Volume and effect level clamping
    - **Property 9: Volume and effect level clamping**
    - **Validates: Requirements 9.2, 9.3**

  - [x] 2.5 Write property test: Playback state transitions
    - **Property 10: Playback state transitions**
    - **Validates: Requirements 9.5, 9.6**

  - [x] 2.6 Create TurntableContext and TurntableProvider
    - Create `src/context/TurntableContext.tsx` with `TurntableContext`, `TurntableProvider` component, and `useTurntable` hook
    - Provider wraps children with context value containing `state` and `dispatch`
    - _Requirements: 4.1, 7.3_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement AudioPlayer service
  - [x] 4.1 Create AudioPlayer service class
    - Create `src/services/AudioPlayer.ts` implementing `AudioPlayerService` interface
    - Wrap HTML5 `Audio` element with `load`, `play`, `pause`, `stop`, `setVolume`, `isPlaying`, `onError` methods
    - Handle audio loading errors with try/catch and `error` event listener, dispatching `AUDIO_ERROR`
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [x] 4.2 Write unit tests for AudioPlayer service
    - Test load/play/pause/stop lifecycle
    - Test volume setting
    - Test error callback invocation on load failure
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 5. Implement Turntable components
  - [x] 5.1 Implement PlinthBase component
    - Create `src/components/PlinthBase.tsx` with dark wood grain texture background
    - Apply pixel-grid alignment
    - _Requirements: 2.1, 2.4, 11.5_

  - [x] 5.2 Implement CentralPlatter component
    - Create `src/components/CentralPlatter.tsx` centered on PlinthBase
    - Apply brushed metal texture or gradient
    - _Requirements: 2.2, 11.6_

  - [x] 5.3 Implement LabelTextRing component
    - Create `src/components/LabelTextRing.tsx` using SVG `<textPath>` on a circular `<path>`
    - Format text as "INFO - PLAYING: {sectionTitle}"
    - Use Rosea font at pixel-grid aligned size
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.4 Write property test: Label text formatting
    - **Property 7: Label text formatting**
    - **Validates: Requirements 5.1**

  - [x] 5.5 Implement VinylRecord component
    - Create `src/components/VinylRecord.tsx` with CSS spin animation (33.3 RPM)
    - Embed LabelTextRing as child, spinning together
    - Accept `isSpinning`, `sectionTitle`, `color` props
    - _Requirements: 4.2, 5.1, 5.2_

  - [x] 5.6 Implement TonearmAssembly component
    - Create `src/components/TonearmAssembly.tsx` with parked/playing states
    - CSS transition for pivot animation within 400ms
    - Apply brushed metal texture
    - _Requirements: 2.3, 8.1, 8.2, 8.3, 8.4, 11.6_

  - [x] 5.7 Write property test: Tonearm state follows playback state
    - **Property 2: Tonearm state follows playback state**
    - **Validates: Requirements 2.3, 4.3, 8.1, 8.2, 8.3**

  - [x] 5.8 Implement Turntable container component
    - Create `src/components/Turntable.tsx` composing PlinthBase, CentralPlatter, VinylRecord, TonearmAssembly
    - Read state from TurntableContext to drive child props
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Implement DiscStack and Disc components
  - [x] 6.1 Implement Disc component
    - Create `src/components/Disc.tsx` with unique color, label, muted/active visual states
    - Handle click to dispatch `SELECT_DISC`
    - Add `role="button"`, `tabIndex={0}`, keyboard Enter/Space handlers
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 12.1, 12.2_

  - [x] 6.2 Write property test: Disc visual state derivation
    - **Property 3: Disc visual state derivation**
    - **Validates: Requirements 3.4, 3.5**

  - [x] 6.3 Write property test: Keyboard disc activation parity
    - **Property 11: Keyboard disc activation parity**
    - **Validates: Requirements 12.2**

  - [x] 6.4 Implement DiscStack component
    - Create `src/components/DiscStack.tsx` rendering 4 Disc components from SECTIONS data
    - Active disc absent from stack, remaining discs muted
    - _Requirements: 3.1, 3.4, 3.5_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement InfoPanel component
  - [x] 8.1 Implement InfoPanel component with section content rendering
    - Create `src/components/InfoPanel.tsx` reading `activeSectionId` from context
    - Render About content (avatar, name, title, links, bio), Education (institution, degree, dateRange), Experience (company, role, description, dateRange), Projects (name, description, links)
    - Default to About section when no disc is active
    - Use Rosea font for all text
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 13.4_

  - [x] 8.2 Write unit tests for InfoPanel
    - Test default About content renders when `activeDiscId` is null
    - Test each section type renders its required fields
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 13.4_

- [ ] 9. Implement ControlBar components
  - [x] 9.1 Implement Fader component (shared horizontal/vertical)
    - Create `src/components/Fader.tsx` with `orientation`, `value`, `onChange`, `label`, `ariaLabel` props
    - Support drag interaction and keyboard Arrow key adjustment in discrete steps
    - Clamp values to [0, 1]
    - Add `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `tabIndex={0}`
    - _Requirements: 9.1, 9.2, 9.3, 12.1, 12.3_

  - [x] 9.2 Write property test: Keyboard fader step adjustment
    - **Property 12: Keyboard fader step adjustment**
    - **Validates: Requirements 12.3**

  - [x] 9.3 Implement PlaybackControls component
    - Create `src/components/PlaybackControls.tsx` with play/pause/stop buttons
    - Reflect current playback state from context
    - Dispatch `SET_PLAYBACK` actions
    - Add keyboard accessibility (`tabIndex`, `role="button"`)
    - _Requirements: 9.4, 9.5, 9.6, 12.1_

  - [x] 9.4 Implement ControlBar container component
    - Create `src/components/ControlBar.tsx` composing VerticalFader (volume), HorizontalFader (effect), PlaybackControls
    - Wire fader changes to dispatch `SET_VOLUME` and `SET_EFFECT_LEVEL`
    - Render audio error toast notification (auto-dismiss 5s)
    - _Requirements: 9.1, 9.2, 9.3, 7.4_

- [ ] 10. Implement ChromeBar component
  - [x] 10.1 Create ChromeBar component
    - Create `src/components/ChromeBar.tsx` spanning full viewport width at top
    - Render decorative search field and navigation icons at 16×16 or 32×32 pixel-art scale
    - Align all icons to Pixel_Grid
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 11. Wire layout and integrate all components
  - [x] 11.1 Implement MainLayout component with CSS Grid
    - Create `src/components/MainLayout.tsx` with CSS Grid: `grid-template-columns: 1fr 2fr 1fr` for ≥768px, `1fr` for <768px
    - Place Turntable (left), InfoPanel (center), DiscStack (right)
    - Mobile stacking order: Turntable → InfoPanel → DiscStack
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 11.2 Write property test: Layout breakpoint determines column mode
    - **Property 1: Layout breakpoint determines column mode**
    - **Validates: Requirements 1.3, 1.4**

  - [x] 11.3 Wire App component
    - Update `src/App.tsx` to compose TurntableProvider → ChromeBar, MainLayout, ControlBar
    - Apply `overflow: hidden` on root container, `height: 100vh`
    - Apply dark background color (#1a1a2e)
    - Integrate AudioPlayer service: react to `activeDiscId` changes to load/play tracks, sync volume
    - _Requirements: 1.1, 7.1, 7.2, 11.1_

  - [x] 11.4 Create global styles and CSS custom properties
    - Create `src/styles/global.css` with design tokens as CSS custom properties
    - Set `html, body` to `overflow: hidden; height: 100vh; margin: 0`
    - Define CSS spin animation keyframes for vinyl record
    - Define disc-to-platter and platter-to-stack animation keyframes (600ms)
    - _Requirements: 1.1, 4.5, 11.1, 11.2, 11.3, 11.4_

- [ ] 12. Accessibility and focus management
  - [x] 12.1 Add focus indicators and tab order
    - Ensure all interactive elements (Discs, Faders, PlaybackControls) have visible focus indicators
    - Verify Tab key navigates through all interactive elements in logical order
    - Add `aria-label` attributes to all controls
    - _Requirements: 12.1, 12.4_

  - [x] 12.2 Write unit tests for keyboard accessibility
    - Test Tab navigation reaches all interactive elements
    - Test focus indicator visibility
    - Test ARIA attributes on interactive elements
    - _Requirements: 12.1, 12.4_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases using Vitest + React Testing Library
- All 12 correctness properties from the design are covered across tasks 1.5, 2.2–2.5, 5.4, 5.7, 6.2, 6.3, 9.2, 11.2
