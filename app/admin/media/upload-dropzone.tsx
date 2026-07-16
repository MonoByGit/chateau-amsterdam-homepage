// app/admin/media/upload-dropzone.tsx
"use client";

import { useRef, useState } from "react";

export function UploadDropzone() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isOver, setIsOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function setFile(file: File | null) {
    if (!file || !inputRef.current) return;
    const dt = new DataTransfer();
    dt.items.add(file);
    inputRef.current.files = dt.files;
    setFileName(file.name);
  }

  return (
    <label
      className={`a-dropzone${isOver ? " is-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        setFile(e.dataTransfer.files[0] ?? null);
      }}
    >
      <input
        ref={inputRef}
        required
        type="file"
        id="file"
        name="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{ display: "none" }}
      />
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
      {fileName ? (
        <span className="a-dropzone-text">{fileName}</span>
      ) : (
        <span className="a-dropzone-text">
          Sleep een foto hierheen, of klik om te kiezen
          <span className="a-hint" style={{ display: "block", marginTop: "0.25rem" }}>
            JPEG, PNG of WebP, max. 8MB
          </span>
        </span>
      )}
    </label>
  );
}
