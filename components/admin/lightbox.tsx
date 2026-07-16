// components/admin/lightbox.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Wraps any thumbnail: click opens the same image full-size in an overlay.
// Standard expected behavior for any photo shown in a list or grid.
export function LightboxImage({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="a-lightbox-trigger"
        aria-label={`Bekijk ${alt} vergroot`}
        style={{ padding: 0, border: "none", background: "none", cursor: "zoom-in", display: "block" }}
      >
        <img src={src} alt={alt} className={className} style={style} />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <div className="a-lightbox-overlay" onClick={() => setOpen(false)}>
              <button
                type="button"
                className="a-lightbox-close"
                aria-label="Sluiten"
                onClick={() => setOpen(false)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              <img src={src} alt={alt} className="a-lightbox-image" onClick={(e) => e.stopPropagation()} />
            </div>,
            document.body
          )
        : null}
    </>
  );
}
