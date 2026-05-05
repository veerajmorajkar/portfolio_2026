# Requirements Document

## Introduction

A single-frame (no-scroll), fully responsive React + Vite portfolio website built around a turntable/vinyl record metaphor. The left side of the screen features an interactive turntable with a plinth base, central platter, and tonearm. The right side displays a stack of colored vinyl discs, each representing a portfolio section (About, Education, Experience, Projects, etc.). Clicking a disc animates it onto the turntable, spins the record, plays a section-specific song, and reveals the section content in a central info panel. The entire UI uses a pixel-art dark mode aesthetic with a browser-chrome-style top bar and DJ-style fader/playback controls at the bottom.

## Glossary

- **App**: The top-level React application rendered by Vite, responsible for layout, state management, and routing all user interactions.
- **Turntable**: The interactive component on the left side of the screen consisting of the Plinth_Base, Central_Platter, Vinyl_Record, and Tonearm_Assembly.
- **Plinth_Base**: The dark wood grain textured base (~100px height) on which the turntable sits.
- **Central_Platter**: The circular platter (~80px diameter) mounted on the Plinth_Base where the Vinyl_Record sits and spins.
- **Vinyl_Record**: A circular disc (~80px diameter) placed on the Central_Platter, featuring a Label_Text_Ring that displays the active section name and song title.
- **Label_Text_Ring**: Curved text rendered around the center of the Vinyl_Record showing the pattern "INFO - PLAYING: [Section Title]".
- **Tonearm_Assembly**: The pivoting arm component with two states: parked (resting position at ~80-85° from pivot) and playing (lowered onto the Vinyl_Record).
- **Disc_Stack**: The vertically arranged collection of colored vinyl discs on the right side of the screen, each representing a portfolio section.
- **Disc**: An individual clickable vinyl disc in the Disc_Stack, with a unique color scheme and muted/unmuted visual states. Each Disc maps to one portfolio section.
- **Info_Panel**: The central content area that displays the active section's information (profile, bio, education details, experience entries, project cards, etc.).
- **Chrome_Bar**: The browser-like top bar containing a decorative search field and navigation icons rendered in pixel-art style.
- **Control_Bar**: The bottom bar containing horizontal faders, vertical faders, and playback controls for audio interaction.
- **Horizontal_Fader**: A draggable horizontal slider in the Control_Bar with a defined min/max range.
- **Vertical_Fader**: A draggable vertical slider in the Control_Bar with a defined min/max range.
- **Audio_Player**: The internal audio engine responsible for loading, playing, pausing, and stopping section-specific songs when a Disc is activated.
- **Pixel_Grid**: The 16×16 pixel grid system used as the foundational unit for all icons, typography, and layout alignment.
- **Rosea_Font**: The pixel-art style typeface used for all text rendering throughout the App.

## Requirements

### Requirement 1: Single-Frame Responsive Layout

**User Story:** As a visitor, I want the portfolio to display as a single non-scrolling frame that adapts to any screen size, so that I can view the entire experience without scrolling.

#### Acceptance Criteria

1. THE App SHALL render all content within a single viewport-height frame with no vertical or horizontal scrollbar.
2. WHEN the browser window is resized, THE App SHALL reflow the Turntable, Info_Panel, and Disc_Stack to fit within the new viewport dimensions without overflow.
3. WHEN the viewport width is less than 768px, THE App SHALL reorganize the layout into a stacked vertical arrangement with the Turntable on top, Info_Panel in the middle, and Disc_Stack at the bottom.
4. THE App SHALL use a three-column layout on viewports 768px and wider: Turntable on the left, Info_Panel in the center, and Disc_Stack on the right.

### Requirement 2: Turntable Assembly Rendering

**User Story:** As a visitor, I want to see a realistic turntable on the left side of the screen, so that the vinyl record metaphor is immediately clear.

#### Acceptance Criteria

1. THE Turntable SHALL render the Plinth_Base with a dark wood grain texture as the bottom layer.
2. THE Turntable SHALL render the Central_Platter centered on the Plinth_Base.
3. THE Turntable SHALL render the Tonearm_Assembly in its parked state when no Disc is active.
4. THE Turntable SHALL align all sub-components (Plinth_Base, Central_Platter, Tonearm_Assembly) to the Pixel_Grid.

### Requirement 3: Disc Stack Display

**User Story:** As a visitor, I want to see a stack of colored vinyl discs on the right side, so that I can identify and select different portfolio sections.

#### Acceptance Criteria

1. THE Disc_Stack SHALL display one Disc for each portfolio section: About, Education, Experience, and Projects.
2. THE Disc_Stack SHALL render each Disc with its unique color scheme as defined in the design palette.
3. THE Disc_Stack SHALL render each Disc with a visible label identifying the section name.
4. WHEN no Disc is active, THE Disc_Stack SHALL display all Discs in a muted visual state.
5. WHEN a Disc is active, THE Disc_Stack SHALL display the active Disc as absent from the stack and all remaining Discs in their muted state.

### Requirement 4: Disc Selection and Animation

**User Story:** As a visitor, I want to click a disc and watch it move onto the turntable, so that the interaction feels like placing a real vinyl record.

#### Acceptance Criteria

1. WHEN a visitor clicks a Disc in the Disc_Stack, THE App SHALL animate the selected Disc from its stack position to the Central_Platter on the Turntable.
2. WHEN the Disc arrives on the Central_Platter, THE Vinyl_Record SHALL begin a continuous CSS spin animation.
3. WHEN the Disc arrives on the Central_Platter, THE Tonearm_Assembly SHALL animate from the parked state to the playing state.
4. WHEN a visitor clicks a different Disc while one is already playing, THE App SHALL animate the current Vinyl_Record back to the Disc_Stack, then animate the new Disc onto the Central_Platter.
5. THE App SHALL complete the disc-to-turntable animation within 600 milliseconds.

### Requirement 5: Label Text Ring on Vinyl Record

**User Story:** As a visitor, I want to see curved text on the spinning record showing what section is playing, so that I always know which section is active.

#### Acceptance Criteria

1. WHEN a Disc is placed on the Central_Platter, THE Label_Text_Ring SHALL display the text "INFO - PLAYING: [Active Section Title]" curved around the center of the Vinyl_Record.
2. THE Label_Text_Ring SHALL spin together with the Vinyl_Record at the same rotation speed.
3. THE Label_Text_Ring SHALL render text using the Rosea_Font at a size aligned to the Pixel_Grid.

### Requirement 6: Info Panel Content Display

**User Story:** As a visitor, I want the center area to show the content of the selected section, so that I can read about the portfolio owner's background.

#### Acceptance Criteria

1. WHEN a Disc is activated, THE Info_Panel SHALL display the content corresponding to the selected section (About, Education, Experience, or Projects).
2. THE Info_Panel SHALL display the About section content including an avatar image, name, title, links (Product Designer, Illustrator, Let's Chat), and a bio paragraph.
3. THE Info_Panel SHALL display the Education section content including institution names, degrees, and date ranges.
4. THE Info_Panel SHALL display the Experience section content including company names, roles, descriptions, and date ranges.
5. THE Info_Panel SHALL display the Projects section content including project names, descriptions, and relevant links.
6. WHEN no Disc is active, THE Info_Panel SHALL display a default welcome message or the About section content.
7. THE Info_Panel SHALL render all text using the Rosea_Font.

### Requirement 7: Audio Playback

**User Story:** As a visitor, I want each section to play a unique song when its disc is on the turntable, so that the experience feels like a real DJ set.

#### Acceptance Criteria

1. WHEN a Disc is placed on the Central_Platter, THE Audio_Player SHALL begin playing the audio track associated with that Disc's section.
2. WHEN a different Disc replaces the current one, THE Audio_Player SHALL stop the current track and begin playing the new Disc's track.
3. WHEN the visitor clicks the active Disc again to deactivate it, THE Audio_Player SHALL stop playback.
4. IF an audio file fails to load, THEN THE Audio_Player SHALL display a non-blocking notification in the Control_Bar and continue operating without audio.

### Requirement 8: Tonearm Interactive States

**User Story:** As a visitor, I want the tonearm to visually respond to playback state, so that the turntable feels alive and interactive.

#### Acceptance Criteria

1. WHILE no Disc is active, THE Tonearm_Assembly SHALL remain in the parked position (resting at approximately 80-85° from the pivot point).
2. WHEN a Disc begins playing, THE Tonearm_Assembly SHALL animate from the parked position to the playing position (lowered onto the Vinyl_Record).
3. WHEN playback stops, THE Tonearm_Assembly SHALL animate from the playing position back to the parked position.
4. THE Tonearm_Assembly SHALL complete each transition animation within 400 milliseconds.

### Requirement 9: Fader Controls

**User Story:** As a visitor, I want to interact with fader controls at the bottom of the screen, so that I can adjust audio volume and feel immersed in the DJ experience.

#### Acceptance Criteria

1. THE Control_Bar SHALL render at least one Horizontal_Fader and one Vertical_Fader.
2. WHEN a visitor drags the Vertical_Fader, THE Audio_Player SHALL adjust the playback volume proportionally to the fader position (bottom = 0%, top = 100%).
3. WHEN a visitor drags the Horizontal_Fader, THE App SHALL apply a visual or audio effect proportional to the fader position.
4. THE Control_Bar SHALL render playback controls (play, pause, stop) that reflect the current Audio_Player state.
5. WHEN a visitor clicks the play control while a Disc is active and paused, THE Audio_Player SHALL resume playback.
6. WHEN a visitor clicks the pause control while a Disc is playing, THE Audio_Player SHALL pause playback and THE Vinyl_Record SHALL stop spinning.

### Requirement 10: Chrome Bar

**User Story:** As a visitor, I want to see a decorative browser-like top bar, so that the UI feels like a retro desktop application.

#### Acceptance Criteria

1. THE Chrome_Bar SHALL render at the top of the viewport spanning the full width.
2. THE Chrome_Bar SHALL display a decorative search field and navigation icons rendered in pixel-art style at 16×16 or 32×32 scale.
3. THE Chrome_Bar SHALL render all icons aligned to the Pixel_Grid.

### Requirement 11: Pixel-Art Dark Mode Aesthetic

**User Story:** As a visitor, I want the entire site to have a cohesive pixel-art dark mode look, so that the visual style is distinctive and memorable.

#### Acceptance Criteria

1. THE App SHALL use a dark background color (#1a1a2e or similar dark tone) as the base for all surfaces.
2. THE App SHALL render all icons at pixel-art scale (16×16, 32×32, or 64×64) aligned to the Pixel_Grid.
3. THE App SHALL use the Rosea_Font (or a pixel-art fallback) for all text elements.
4. THE App SHALL apply the design color palette (#D696B6, #EC06ED, #0086EC8, #D606EFF, #000FFF6, #00CFFEE, #DEFFEED, #D0EF8E5) as accent colors for Discs, controls, and highlights.
5. THE Plinth_Base SHALL use a dark wood grain texture.
6. THE Tonearm_Assembly and Central_Platter SHALL use a brushed metal texture or gradient.

### Requirement 12: Keyboard Accessibility

**User Story:** As a visitor using keyboard navigation, I want to select discs and control playback with the keyboard, so that the site is accessible without a mouse.

#### Acceptance Criteria

1. THE App SHALL allow Tab-key navigation through all interactive elements (Discs, faders, playback controls).
2. WHEN a Disc has keyboard focus and the visitor presses Enter or Space, THE App SHALL activate that Disc as if it were clicked.
3. WHEN a fader has keyboard focus, THE App SHALL allow Arrow keys to adjust the fader value in discrete steps.
4. THE App SHALL display a visible focus indicator on the currently focused interactive element.

### Requirement 13: Initial Load State

**User Story:** As a visitor arriving at the site for the first time, I want to see a clear starting state, so that I understand how to interact with the portfolio.

#### Acceptance Criteria

1. WHEN the App loads for the first time, THE Turntable SHALL display an empty Central_Platter with no Vinyl_Record.
2. WHEN the App loads for the first time, THE Tonearm_Assembly SHALL be in the parked state.
3. WHEN the App loads for the first time, THE Disc_Stack SHALL display all Discs in their muted state.
4. WHEN the App loads for the first time, THE Info_Panel SHALL display the About section content as the default view.
