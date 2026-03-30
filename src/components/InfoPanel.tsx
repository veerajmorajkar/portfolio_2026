import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SectionId } from "../types";
import type { AboutContent, EducationContent, ExperienceContent, ProjectsContent, SkillsContent } from "../types";
import { getSectionById } from "../data/sections";
import { useTurntable } from "../context/TurntableContext";
import { ProjectPreviewModal } from "./ProjectPreviewModal";

// Glow colors for each section
const GLOW_COLORS: Record<SectionId, string> = {
  about: "#30D5C8",
  projects: "#5CF64A",
  education: "#624CAB",
  experience: "#EE4B2B",
  skills: "#ca2c92",
};

interface InfoPanelProps { sectionId: SectionId; visible: boolean; }

const SLIDE_IN = 450;
const SLIDE_OUT = 300;
type Phase = "hidden" | "entering" | "visible" | "leaving";

const fontPixel = "'Press Start 2P', monospace";
const border = "1.5px solid #ffffff";
const borderMuted = "1.5px solid #555555";

/* ── Y2K Window title bar with dots ── */
function WindowBar({ title }: { title: string }) {
  const dot: React.CSSProperties = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    border: "1.5px solid #ffffff",
    background: "transparent",
  };
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 10px",
      borderBottom: border,
      gap: "8px",
    }}>
      <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
        <span style={dot} />
        <span style={dot} />
        <span style={dot} />
      </div>
      <div style={{
        fontFamily: fontPixel,
        fontSize: "clamp(6px, 0.6vw, 9px)",
        color: "#ffffff",
        letterSpacing: "1px",
        textTransform: "uppercase",
        textAlign: "center",
        lineHeight: "1.3",
        flex: 1,
        wordBreak: "break-word",
        hyphens: "auto",
      }}>
        {title}
      </div>
      <div style={{ width: "34px", flexShrink: 0 }} /> {/* spacer to center title */}
    </div>
  );
}

/* ── Retro window card ── */
function WindowCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      border,
      borderRadius: "6px",
      marginBottom: "12px",
      background: "#000000",
      overflow: "hidden",
    }}>
      <WindowBar title={title} />
      <div style={{ padding: "14px 12px" }}>
        {children}
      </div>
    </div>
  );
}

/* ── Pixel link button ── */
function PixelLink({ label, href, onClick }: { label: string; href?: string; onClick?: () => void }) {
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;

  return (
    <a
      href={href || "#"}
      onClick={handleClick}
      style={{
        display: "inline-block",
        padding: isMobile ? "4px 8px" : "6px 12px",
        marginBottom: "6px",
        background: "transparent",
        color: "#ffffff",
        fontFamily: fontPixel,
        fontSize: "clamp(7px, 0.6vw, 10px)",
        textDecoration: "none",
        letterSpacing: "1px",
        border,
        borderRadius: "4px",
        transition: "background 0.1s, color 0.1s",
        cursor: "pointer",
        lineHeight: 1.4,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.color = "#000000";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "#ffffff";
      }}
    >
      {label}
    </a>
  );
}

/* ── Text styles ── */
const bodyText: React.CSSProperties = {
  fontFamily: fontPixel,
  fontSize: "clamp(7px, 0.6vw, 10px)",
  lineHeight: 2.4,
  color: "#cccccc",
  margin: 0,
};

const labelText: React.CSSProperties = {
  fontFamily: fontPixel,
  fontSize: "clamp(6px, 0.5vw, 9px)",
  color: "#666666",
  letterSpacing: "1px",
  textTransform: "uppercase",
  marginBottom: "4px",
};

const whiteText: React.CSSProperties = {
  ...bodyText,
  color: "#ffffff",
};

/* ── Divider ── */
function Divider() {
  return <div style={{ borderTop: borderMuted, margin: "10px 0" }} />;
}

/* ── Section renderers ── */

function renderAbout(c: AboutContent) {
  return (
    <>
      <WindowCard title="BIO">
        <p style={bodyText}>{c.bio}</p>
      </WindowCard>
      <WindowCard title="LINKS">
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {c.links.map((l) => (
            <PixelLink 
              key={l.label} 
              label={l.label} 
              href={l.url}
              onClick={l.label === "→ RESUME" ? () => {
                const link = document.createElement('a');
                link.href = `${import.meta.env.BASE_URL}assets/images/resume_2026.pdf`;
                link.download = 'Veeraj_Morajkar_Resume_2026.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } : undefined}
            />
          ))}
        </div>
      </WindowCard>
    </>
  );
}

function renderEducation(c: EducationContent) {
  return (
    <WindowCard title="EDUCATION">
      {c.entries.map((e, i) => (
        <div key={i}>
          {i > 0 && <Divider />}
          <div style={whiteText}>{e.institution}</div>
          <div style={{ ...bodyText, marginTop: "4px" }}>{e.degree}</div>
          <div style={{ ...labelText, marginTop: "6px" }}>{e.dateRange}</div>
        </div>
      ))}
    </WindowCard>
  );
}

function renderExperience(c: ExperienceContent) {
  return (
    <>
      {c.entries.map((e, i) => (
        <WindowCard key={i} title={e.company.toUpperCase()}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "8px"
          }}>
            <div style={{ 
              fontFamily: fontPixel,
              fontSize: "clamp(8px, 0.7vw, 11px)",
              color: "#ffffff",
              letterSpacing: "1px",
            }}>
              {e.role}
            </div>
            <div style={labelText}>{e.dateRange}</div>
          </div>
          <p style={{ 
            ...bodyText, 
            color: "#d0d0d0",
          }}>
            {e.description}
          </p>
        </WindowCard>
      ))}
    </>
  );
}

function renderProjects(c: ProjectsContent, onPreview: (name: string, image: string) => void) {
  return (
    <>
      {c.entries.map((e, i) => (
        <WindowCard key={i} title={e.name.toUpperCase()}>
          <p style={{ ...bodyText, marginBottom: "10px" }}>{e.description}</p>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {e.links.map((l) => (
              <PixelLink 
                key={l.label} 
                label={`> ${l.label.toUpperCase()}`} 
                href={l.label.toLowerCase() === "preview" ? undefined : l.url}
                onClick={l.label.toLowerCase() === "preview" && e.previewImage ? () => onPreview(e.name, e.previewImage!) : undefined}
              />
            ))}
          </div>
        </WindowCard>
      ))}
    </>
  );
}

function renderSkills(c: SkillsContent) {
  return (
    <>
      {c.entries.map((e, i) => (
        <WindowCard key={i} title={e.category.toUpperCase()}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {e.skills.map((skill, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  background: "transparent",
                  color: "#ffffff",
                  fontFamily: fontPixel,
                  fontSize: "clamp(6px, 0.5vw, 8px)",
                  border,
                  borderRadius: "3px",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </WindowCard>
      ))}
    </>
  );
}

/* ── Main InfoPanel ── */

const InfoPanelComponent: React.FC<InfoPanelProps> = ({ sectionId, visible }) => {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [displayedSection, setDisplayedSection] = useState<SectionId>(sectionId);
  const prevVisibleRef = useRef(visible);
  const prevSectionRef = useRef(sectionId);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const clearTimer = useCallback(() => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Modal state for project previews
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean; projectName: string; previewImage: string }>({
    isOpen: false,
    projectName: "",
    previewImage: "",
  });

  // Audio-reactive glow state
  const [glowIntensity, setGlowIntensity] = useState(0.6);
  const animationFrameRef = useRef<number>();
  const { audioPlayer } = useTurntable();

  // Real audio-reactive pulsation synced with music
  useEffect(() => {
    if (!visible) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let smoothedAudio = 0.5;
    let targetIntensity = 0.6;
    let currentIntensity = 0.6;
    
    const animate = () => {
      // Get real audio data from the player
      const audioEnergy = audioPlayer.getAudioData();
      
      // Very smooth audio data interpolation for buttery transitions
      smoothedAudio = smoothedAudio * 0.92 + audioEnergy * 0.08;
      
      // Map audio energy to intensity with EXTREME range for maximum visual contrast
      // Low beats: 0.15 (almost invisible), High beats: 1.6 (super bright)
      targetIntensity = 0.15 + (smoothedAudio * 1.45);
      
      // Extremely smooth interpolation to target (like butter)
      currentIntensity = currentIntensity * 0.88 + targetIntensity * 0.12;
      
      setGlowIntensity(currentIntensity);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, audioPlayer]);

  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    const prevSection = prevSectionRef.current;
    prevVisibleRef.current = visible;
    prevSectionRef.current = sectionId;
    clearTimer();
    if (visible && !wasVisible) {
      setDisplayedSection(sectionId);
      setPhase("entering");
      timerRef.current = setTimeout(() => setPhase("visible"), SLIDE_IN);
    } else if (!visible && wasVisible) {
      setPhase("leaving");
      timerRef.current = setTimeout(() => setPhase("hidden"), SLIDE_OUT);
    } else if (visible && wasVisible && sectionId !== prevSection) {
      setPhase("leaving");
      timerRef.current = setTimeout(() => {
        setDisplayedSection(sectionId);
        setPhase("entering");
        timerRef.current = setTimeout(() => setPhase("visible"), SLIDE_IN);
      }, SLIDE_OUT);
    }
    return clearTimer;
  }, [visible, sectionId, clearTimer]);

  if (phase === "hidden") return null;

  const section = getSectionById(displayedSection);
  const { content } = section;
  const show = phase === "entering" || phase === "visible";
  const glowColor = GLOW_COLORS[displayedSection] || GLOW_COLORS.about;

  return (
    <>
    <AnimatePresence mode="wait">
      {show && (
        <div
          style={{
            position: "absolute",
            top: "var(--info-panel-top)",
            left: "var(--info-panel-left)",
            transform: "translateX(-50%)",
            width: "var(--info-panel-width)",
            maxHeight: window.innerWidth <= 900 ? "none" : "64vh",
            zIndex: 5,
            pointerEvents: "auto",
          }}
        >
          <motion.div
            key={displayedSection}
            initial={{ 
              opacity: 0, 
              y: -20,
              scaleX: 1,
              scaleY: 1,
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scaleX: [1, 1.06, 0.98, 1],
              scaleY: [1, 0.94, 1.02, 1],
            }}
            exit={{ 
              opacity: 0, 
              y: -10,
              scaleX: 1,
              scaleY: 1,
            }}
            transition={{
              opacity: { duration: 0.2 },
              y: { duration: 0.2, ease: "easeIn" },
              scaleX: { 
                duration: 0.22,
                times: [0, 0.36, 0.73, 1],
                ease: "easeOut"
              },
              scaleY: { 
                duration: 0.22,
                times: [0, 0.36, 0.73, 1],
                ease: "easeOut"
              },
            }}
            style={{
              width: "100%",
              maxHeight: window.innerWidth <= 900 ? "none" : "64vh",
              overflowY: window.innerWidth <= 900 ? "visible" : "auto",
              imageRendering: "pixelated",
              scrollbarWidth: "none",
              position: "relative",
              zIndex: 1,
              filter: `drop-shadow(0 0 ${30 * glowIntensity}px ${glowColor}${Math.floor(glowIntensity * 120).toString(16).padStart(2, '0')}) drop-shadow(0 0 ${60 * glowIntensity}px ${glowColor}${Math.floor(glowIntensity * 80).toString(16).padStart(2, '0')}) drop-shadow(0 0 ${90 * glowIntensity}px ${glowColor}${Math.floor(glowIntensity * 50).toString(16).padStart(2, '0')})`,
              WebkitOverflowScrolling: "touch",
              paddingBottom: window.innerWidth <= 900 ? "5vh" : "0",
            }}
          >
            {content.type === "about" && renderAbout(content)}
            {content.type === "education" && renderEducation(content)}
            {content.type === "experience" && renderExperience(content)}
            {content.type === "projects" && renderProjects(content, (name, image) => {
              setPreviewModal({ isOpen: true, projectName: name, previewImage: image });
            })}
            {content.type === "skills" && renderSkills(content)}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    
    {/* Project Preview Modal */}
    <ProjectPreviewModal
      isOpen={previewModal.isOpen}
      onClose={() => setPreviewModal({ isOpen: false, projectName: "", previewImage: "" })}
      projectName={previewModal.projectName}
      previewImage={previewModal.previewImage}
    />
  </>
  );
};

export const InfoPanel = memo(InfoPanelComponent);
