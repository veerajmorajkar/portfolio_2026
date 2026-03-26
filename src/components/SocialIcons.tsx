import { useState, memo, useCallback, cloneElement, ReactElement } from "react";

const fontPixel = "'Press Start 2P', monospace";

/* ── Enhanced Pixel-art social icons ── */
function GithubIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none" style={{ imageRendering: "pixelated" }}>
      {/* GitHub octocat silhouette - pixel perfect */}
      <rect x="18" y="8" width="12" height="3" fill="currentColor"/>
      <rect x="15" y="11" width="3" height="3" fill="currentColor"/>
      <rect x="30" y="11" width="3" height="3" fill="currentColor"/>
      <rect x="12" y="14" width="3" height="9" fill="currentColor"/>
      <rect x="33" y="14" width="3" height="9" fill="currentColor"/>
      <rect x="15" y="23" width="3" height="3" fill="currentColor"/>
      <rect x="30" y="23" width="3" height="3" fill="currentColor"/>
      <rect x="18" y="26" width="3" height="3" fill="currentColor"/>
      <rect x="27" y="26" width="3" height="3" fill="currentColor"/>
      <rect x="18" y="29" width="3" height="6" fill="currentColor"/>
      <rect x="27" y="29" width="3" height="6" fill="currentColor"/>
      <rect x="21" y="32" width="6" height="3" fill="currentColor"/>
      {/* Eyes */}
      <rect x="18" y="17" width="3" height="3" fill="currentColor"/>
      <rect x="27" y="17" width="3" height="3" fill="currentColor"/>
    </svg>
  );
}

function LinkedInIcon({ isHovered }: { isHovered: boolean }) {
  const bgColor = isHovered ? "#ffffff" : "#1a1a1a";
  
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none" style={{ imageRendering: "pixelated" }}>
      {/* LinkedIn square border */}
      <rect x="9" y="9" width="30" height="30" fill="currentColor"/>
      {/* Inner background that matches container */}
      <rect x="12" y="12" width="24" height="24" fill={bgColor}/>
      {/* Dot of "i" */}
      <rect x="16" y="16" width="3" height="3" fill="currentColor"/>
      {/* Stem of "i" */}
      <rect x="16" y="21" width="3" height="11" fill="currentColor"/>
      {/* "n" letter */}
      <rect x="23" y="21" width="3" height="11" fill="currentColor"/>
      <rect x="26" y="21" width="3" height="3" fill="currentColor"/>
      <rect x="29" y="24" width="3" height="8" fill="currentColor"/>
    </svg>
  );
}

function EmailIcon({ isHovered }: { isHovered: boolean }) {
  const bgColor = isHovered ? "#ffffff" : "#1a1a1a";
  
  return (
    <svg width="42" height="42" viewBox="0 0 48 48" fill="none" style={{ imageRendering: "pixelated" }}>
      {/* Envelope border */}
      <rect x="6" y="12" width="36" height="24" fill="currentColor"/>
      {/* Inner background that matches container */}
      <rect x="9" y="15" width="30" height="18" fill={bgColor}/>
      {/* Envelope flap - centered triangle */}
      <rect x="21" y="18" width="6" height="3" fill="currentColor"/>
      <rect x="18" y="21" width="3" height="3" fill="currentColor"/>
      <rect x="27" y="21" width="3" height="3" fill="currentColor"/>
      <rect x="15" y="24" width="3" height="3" fill="currentColor"/>
      <rect x="30" y="24" width="3" height="3" fill="currentColor"/>
      {/* Letter lines inside */}
      <rect x="15" y="27" width="18" height="2" fill="currentColor"/>
    </svg>
  );
}

interface SocialIconProps {
  icon: React.ReactNode;
  label: string;
  href: string;
}

function DesktopIcon({ icon, label, href }: SocialIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => { 
    setIsHovered(false); 
    setIsPressed(false); 
  }, []);
  const handleMouseDown = useCallback(() => setIsPressed(true), []);
  const handleMouseUp = useCallback(() => setIsPressed(false), []);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
        cursor: "pointer",
        transition: "transform 0.08s ease-out",
        transform: isPressed ? "scale(0.95)" : isHovered ? "translateY(-4px)" : "translateY(0)",
        filter: isHovered ? "drop-shadow(0 4px 0 rgba(255,255,255,0.3))" : "none",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Icon container - desktop window style */}
      <div style={{
        width: "clamp(60px, 4.5vw, 80px)",
        height: "clamp(60px, 4.5vw, 80px)",
        border: "2.5px solid #ffffff",
        borderRadius: "6px",
        background: isHovered ? "#ffffff" : "#1a1a1a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: isHovered ? "#000000" : "#ffffff",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isHovered 
          ? "inset 0 0 0 2px #000000, 0 6px 0 #ffffff" 
          : "inset 0 0 0 1px rgba(255,255,255,0.1)",
        position: "relative",
      }}>
        {cloneElement(icon as ReactElement, { isHovered })}
        
        {/* Pixel corner detail */}
        <div style={{
          position: "absolute",
          top: "6px",
          right: "6px",
          width: "5px",
          height: "5px",
          background: isHovered ? "#000000" : "#ffffff",
          opacity: 0.4,
        }} />
      </div>

      {/* Label - window title bar style */}
      <div style={{
        fontFamily: fontPixel,
        fontSize: "clamp(6px, 0.5vw, 9px)",
        color: isHovered ? "#000000" : "#ffffff",
        letterSpacing: "1.5px",
        textAlign: "center",
        padding: "5px 10px",
        border: "2px solid #ffffff",
        borderRadius: "4px",
        background: isHovered ? "#ffffff" : "#000000",
        minWidth: "clamp(60px, 4.5vw, 80px)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isHovered ? "0 0 0 2px #000000" : "none",
        textShadow: isHovered ? "none" : "1px 1px 0 rgba(0,0,0,0.5)",
      }}>
        {label}
      </div>
    </a>
  );
}

const SocialIconsComponent: React.FC = () => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;
  
  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: isMobile ? "clamp(20px, 4vw, 35px)" : "clamp(30px, 2.5vw, 50px)",
      padding: "20px",
      position: "relative",
      transform: isMobile ? "scale(0.7)" : `scale(var(--scale-factor))`,
      transformOrigin: "center bottom",
    }}>
      {/* Decorative pixel grid background */}
      <div style={{
        position: "absolute",
        inset: "-10px",
        background: "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.03) 19px, rgba(255,255,255,0.03) 20px)",
        pointerEvents: "none",
        zIndex: -1,
      }} />
      
      <DesktopIcon
        icon={<GithubIcon />}
        label="GITHUB"
        href="https://github.com/veerajmorajkar"
      />
      <DesktopIcon
        icon={<LinkedInIcon isHovered={false} />}
        label="LINKEDIN"
        href="https://www.linkedin.com/in/veeraj-morajkar/"
      />
      <DesktopIcon
        icon={<EmailIcon isHovered={false} />}
        label="EMAIL"
        href="mailto:mkar.veeraj@gmail.com"
      />
    </div>
  );
};

export const SocialIcons = memo(SocialIconsComponent);
