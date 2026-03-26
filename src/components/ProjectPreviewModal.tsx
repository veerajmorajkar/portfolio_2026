import { useEffect, memo, useCallback, useState } from "react";

interface ProjectPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  previewImage: string;
}

const fontPixel = "'Press Start 2P', monospace";
const border = "1.5px solid #ffffff";

const ProjectPreviewModalComponent: React.FC<ProjectPreviewModalProps> = ({
  isOpen,
  onClose,
  projectName,
  previewImage,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleEscape]);

  if (!isOpen) return null;

  const buttonSize = isMobile ? "8px" : "12px";
  const buttonBorder = isMobile ? "0.5px solid #ffffff" : "1px solid #ffffff";

  return (
    <>
      {/* Backdrop with lighter blur and tint */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(6px)",
          zIndex: 9998,
          animation: "fadeIn 0.3s ease-out",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          maxWidth: "90vw",
          maxHeight: "90vh",
          animation: "modalSlideIn 0.3s ease-out forwards",
          willChange: "opacity, scale",
        }}
      >
        {/* Retro window container matching InfoPanel style */}
        <div
          style={{
            border,
            borderRadius: "6px",
            background: "#000000",
            overflow: "hidden",
            imageRendering: "pixelated",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.8)",
          }}
        >
          {/* Window title bar with three dots */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 10px)",
              borderBottom: border,
            }}
          >
            <div style={{ display: "flex", gap: isMobile ? "4px" : "6px" }}>
              <button
                onClick={onClose}
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: "50%",
                  border: buttonBorder,
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                aria-label="Close"
              />
              <button
                onClick={onClose}
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: "50%",
                  border: buttonBorder,
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                aria-label="Close"
              />
              <button
                onClick={onClose}
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  borderRadius: "50%",
                  border: buttonBorder,
                  background: "transparent",
                  cursor: "pointer",
                  padding: 0,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                aria-label="Close"
              />
            </div>
            <div
              style={{
                fontFamily: fontPixel,
                fontSize: "clamp(6px, 1.5vw, 8px)",
                color: "#ffffff",
                letterSpacing: "clamp(1px, 0.3vw, 2px)",
                textTransform: "uppercase",
              }}
            >
              {projectName} - Preview
            </div>
            <div style={{ width: "clamp(24px, 5vw, 34px)" }} /> {/* spacer to center title */}
          </div>

          {/* Image container */}
          <div
            style={{
              padding: "16px",
              background: "#000000",
              maxHeight: "calc(90vh - 60px)",
              overflow: "auto",
            }}
          >
            <img
              src={previewImage}
              alt={`${projectName} preview`}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "2px",
                imageRendering: "auto",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export const ProjectPreviewModal = memo(ProjectPreviewModalComponent);
